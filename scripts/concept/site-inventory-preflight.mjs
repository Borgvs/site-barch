/** Read-only deployment gate: retain every published case and the other Concept.
 * Run immediately before deploying, then run the publication smoke checks against
 * the resulting deployment. This gate neither writes files nor promotes a release.
 */
import {readFile,realpath,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPublicResponse} from './http-integrity-read.mjs';

const contractPath=fileURLToPath(new URL('./site-concept-inventory.json',import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const requireThat=(condition,message)=>{if(!condition)throw Error(message);};
const slugPattern=/^[a-z0-9][a-z0-9-]{0,59}$/;
function slugsFrom(rows,label){
 requireThat(Array.isArray(rows)&&rows.length>0,label+': índice ausente ou vazio.');
 const slugs=rows.map(row=>typeof row==='string'?row:row?.slug);
 requireThat(slugs.every(slug=>typeof slug==='string'&&slugPattern.test(slug)),label+': slug inválido.');
 requireThat(new Set(slugs).size===slugs.length,label+': slug duplicado.');
 return slugs;
}
function publicFile(site,pathname){
 requireThat(typeof pathname==='string'&&pathname.startsWith('/')&&!pathname.includes('\\')&&!pathname.includes('?')&&!pathname.includes('#'), 'Caminho público inválido: '+pathname);
 const decoded=decodeURIComponent(pathname);
 requireThat(!decoded.includes('\\')&&!decoded.split('/').some(part=>part==='.'||part==='..')&&!decoded.includes('\0'), 'Caminho público inseguro: '+pathname);
 return path.join(site,'public',decoded.slice(1));
}
async function localFile(site,file){
 const root=await realpath(site),resolved=await realpath(file);
 requireThat(resolved.startsWith(root+path.sep),'Arquivo fora da publicação: '+file);
 requireThat((await stat(resolved)).isFile(),'Arquivo público não é regular: '+file);
 return readFile(resolved);
}
function entryPaths(html,origin,root){
 const paths=[];
 for(const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)){
  const url=new URL(match[1],origin);
  if(url.origin!==origin||match[1].startsWith('#'))continue;
  requireThat(url.pathname.startsWith('/'+root+'/'),'Entrada referencia caminho fora do Concept '+root+': '+url.pathname);
  paths.push(url.pathname);
 }
 return [...new Set(paths)];
}

export async function runSiteInventoryPreflight({site,origin='https://barch.com.br',contract,fetchImpl=fetch,timeoutMs=20000}={}){
 requireThat(typeof site==='string'&&site.length>0,'Informe --site com a árvore de publicação.');
 const parsedOrigin=new URL(origin);
 requireThat(parsedOrigin.origin===origin&&!parsedOrigin.username&&!parsedOrigin.password&&['https:','http:'].includes(parsedOrigin.protocol),'Use somente a origem HTTP(S), sem caminho ou credenciais.');
 requireThat(Number.isInteger(timeoutMs)&&timeoutMs>=1&&timeoutMs<=20000,'Prazo de leitura deve estar entre 1 e 20.000 ms.');
 contract??=JSON.parse(await readFile(contractPath,'utf8'));
 requireThat(contract?.schema==='barch.site-concept-inventory/1'&&Array.isArray(contract.roots)&&new Set(contract.roots).size===contract.roots.length,'Contrato de acervo inválido.');
 const baseline=slugsFrom(contract.studies,'Contrato');
 for(const root of ['terreno','viabilidade','tatuape'])requireThat(contract.roots.includes(root),'Contrato sem a raiz '+root+'.');
 const checks=[],checkedAt=new Date().toISOString();
 const snapshotBytes=await localFile(site,path.join(site,'.barch-terreno/snapshot.json'));
 const manifest=JSON.parse(await localFile(site,path.join(site,'.barch-terreno/publication-manifest.json')));
 requireThat(sha(snapshotBytes)===manifest.snapshotSha256,'Snapshot local diverge do SHA-256 do manifesto.');
 const snapshot=JSON.parse(snapshotBytes),local=slugsFrom(snapshot.routes?.studies,'Snapshot local');
 const listed=slugsFrom(manifest.studies,'Manifesto local');
 requireThat(JSON.stringify([...listed].sort())===JSON.stringify([...local].sort()),'Manifesto e snapshot têm índices de terrenos diferentes.');
 for(const slug of baseline)requireThat(local.includes(slug),'Publicação incompleta: falta o estudo obrigatório '+slug+'.');
 requireThat(local.includes(manifest.defaultSlug),'Estudo padrão não pertence ao acervo.');
 for(const slug of local)requireThat(snapshot.routes['studies/'+slug]?.slug===slug,'Estudo sem rota/identidade coerente: '+slug+'.');
 requireThat(Array.isArray(manifest.files)&&manifest.files.length>0,'Manifesto de arquivos local ausente.');
 const fileNames=new Set();
 for(const file of manifest.files){
  requireThat(typeof file.path==='string'&&file.path.startsWith('/terreno/')&&!fileNames.has(file.path)&&Number.isSafeInteger(file.bytes)&&file.bytes>=0&&/^[a-f0-9]{64}$/.test(file.sha256??''),'Registro de arquivo inválido ou duplicado no manifesto.');
  fileNames.add(file.path);
  const bytes=await localFile(site,publicFile(site,file.path));
  requireThat(bytes.length===file.bytes&&sha(bytes)===file.sha256,'Arquivo local diverge do manifesto: '+file.path+'.');
 }
 const entries={};
 for(const root of contract.roots){
  const entry=contract.entries?.[root];
  requireThat(typeof entry==='string'&&entry.startsWith('public/')&&!entry.split('/').some(part=>part==='..'||part==='.'),'Entrada do Concept inválida: '+root+'.');
  entries[root]=await localFile(site,path.join(site,entry));
 }
 checks.push({check:'local_inventory',status:'passed',studies:local,files:manifest.files.length,snapshotSha256:manifest.snapshotSha256});
 async function get(route){
  let response;
  try{response=await readPublicResponse(origin+route,{fetchImpl,timeoutMs,maxAttempts:1});}
  catch(error){throw Error('Pré-publicação sem leitura verificável de '+route+': '+error.message,{cause:error});}
  requireThat(!response.url||new URL(response.url).origin===origin,'Leitura saiu da origem de publicação: '+route+'.');
  return response;
 }
 const studiesResponse=await get('/terreno/api/studies');
 requireThat(studiesResponse.status===200,'Índice publicado não pôde ser conferido: HTTP '+studiesResponse.status+'.');
 const live=slugsFrom(await studiesResponse.json(),'Índice publicado');
 for(const slug of live)requireThat(local.includes(slug),'Regressão de acervo: publicação removeria '+slug+'.');
 checks.push({check:'published_studies_retained',status:'passed',studies:live});

 const viability=await get('/viabilidade');
 requireThat(viability.status===200||viability.status===404,'Viabilidade publicada não pôde ser conferida: HTTP '+viability.status+'.');
 if(viability.status===200){
  const liveIndex=Buffer.from(await viability.arrayBuffer());
  requireThat(sha(liveIndex)===sha(entries.viabilidade),'A entrada /viabilidade publicada não foi preservada byte a byte.');
  const refs=entryPaths(liveIndex.toString('utf8'),origin,'viabilidade');
  requireThat(refs.length>0,'Entrada /viabilidade sem recursos locais verificáveis.');
  const entryAssetHashes={};
  // These executable assets are not listed in the current data manifest. Check
  // their published bytes too, rather than accepting a same-named stale bundle.
  for(let start=0;start<refs.length;start+=4)await Promise.all(refs.slice(start,start+4).map(async ref=>{
   const bytes=await localFile(site,publicFile(site,ref));
   const response=await get(ref);
   requireThat(response.status===200,'Recurso da entrada de viabilidade ilegível: '+ref+'; HTTP '+response.status+'.');
   requireThat(sha(Buffer.from(await response.arrayBuffer()))===sha(bytes),'Recurso executável de viabilidade não foi preservado: '+ref+'.');
   entryAssetHashes[ref]=sha(bytes);
  }));
  const liveManifestResponse=await get('/viabilidade/concept-manifest.json');
  requireThat(liveManifestResponse.status===200,'Manifesto de viabilidade publicado ilegível: HTTP '+liveManifestResponse.status+'.');
  const liveManifestBytes=Buffer.from(await liveManifestResponse.arrayBuffer());
  const localManifestBytes=await localFile(site,publicFile(site,'/viabilidade/concept-manifest.json'));
  requireThat(sha(liveManifestBytes)===sha(localManifestBytes),'Manifesto de /viabilidade publicado não foi preservado.');
  const vm=JSON.parse(liveManifestBytes);
  requireThat(vm.schema==='barch-concept-publication/1'&&vm.conceptOnly===true&&Array.isArray(vm.files)&&vm.files.length>0,'Manifesto de viabilidade publicado inválido.');
  const vf=new Set();
  for(const file of vm.files){
   requireThat(typeof file.path==='string'&&!file.path.startsWith('/')&&!vf.has(file.path)&&Number.isSafeInteger(file.bytes)&&file.bytes>=0&&/^[a-f0-9]{64}$/.test(file.sha256??''),'Registro inválido no manifesto de viabilidade.');
   vf.add(file.path);
   const bytes=await localFile(site,publicFile(site,'/viabilidade/'+file.path));
   requireThat(bytes.length===file.bytes&&sha(bytes)===file.sha256,'Recurso de viabilidade não foi preservado: '+file.path+'.');
  }
  checks.push({check:'published_viability_retained',status:'passed',entrySha256:sha(liveIndex),manifestSha256:sha(liveManifestBytes),manifestFiles:vm.files.length,entryPaths:refs,entryAssetHashes});
 }else checks.push({check:'published_viability_retained',status:'not_previously_published',httpStatus:404});
 return {schema:'barch.site-inventory-preflight/1',checkedAt,origin,status:'passed',readOnly:true,studies:local,roots:contract.roots,snapshotSha256:manifest.snapshotSha256,checks};
}

async function cli(){
 try{
  const args=process.argv.slice(2),options={};
  for(let index=0;index<args.length;index++){
   requireThat(['--site','--origin'].includes(args[index])&&typeof args[index+1]==='string'&&!args[index+1].startsWith('--'),'Use --site <pasta> [--origin <origem>].');
   requireThat(!Object.hasOwn(options,args[index].slice(2)),'Argumento repetido: '+args[index]+'.');
   options[args[index].slice(2)]=args[++index];
  }
  console.log(JSON.stringify(await runSiteInventoryPreflight(options),null,2));
 }
 catch(error){console.error(JSON.stringify({schema:'barch.site-inventory-preflight/1',status:'failed',readOnly:true,error:error.message},null,2));process.exitCode=1;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await cli();
