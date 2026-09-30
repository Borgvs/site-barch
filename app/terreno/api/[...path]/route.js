/** Public, immutable study snapshots. The only POST evaluates a bounded scenario. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15;
const root = path.join(process.cwd(), '.barch-terreno');
let snapshotPromise, enginePromise;
const snapshot = () => snapshotPromise ??= readFile(path.join(root, 'snapshot.json'), 'utf8').then(JSON.parse);
const json = (data, status = 200) => Response.json(data, {status, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}});
const problem = (error, status) => json({error},status);

export async function GET(request, context) {
  try {
    const {path: parts = []} = await context.params;
    if(parts.some(p => !/^[a-zA-Z0-9_.-]+$/.test(p))) return problem('Endereço inválido.',400);
    const key=parts.join('/'), data=await snapshot();
    const redirect=data.downloads[key];
    if(redirect) return Response.redirect(new URL(redirect,request.url),307);
    if(key==='sources'){
      const normalize=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      const q=normalize(new URL(request.url).searchParams.get('q')?.slice(0,200)||'');
      const rows=data.routes.sources.items.filter(r=>!q||normalize([r.title,r.jurisdiction,r.url,r.status].join(' ')).includes(q));
      return json({...data.routes.sources,items:rows.slice(0,100),total:rows.length});
    }
    if(!Object.hasOwn(data.routes,key)) return problem('Recurso não encontrado.',404);
    return json(data.routes[key]);
  } catch { return problem('Não foi possível abrir este recurso.',500); }
}

export async function POST(request, context) {
  try {
    const {path: parts = []} = await context.params;
    if(parts.length!==3||parts[0]!=='studies'||parts[2]!=='calculate')return problem('A apresentação é somente leitura.',405);
    const origin=request.headers.get('origin');
    const expectedOrigin=new URL(request.url);
    // Next may normalize its internal URL to localhost; Host remains the public host.
    const host=request.headers.get('host');if(host){if(!/^[a-zA-Z0-9.:[\]-]+$/.test(host))return problem('Host inválido.',403);expectedOrigin.host=host;}
    if(origin!==expectedOrigin.origin)return problem('Origem da solicitação inválida.',403);
    if(request.headers.get('content-type')?.split(';')[0]!=='application/json')return problem('Formato deve ser JSON.',415);
    const reader=request.body?.getReader(); if(!reader)return problem('Parâmetros ausentes.',400);
    let size=0;const chunks=[];
    for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16000){await reader.cancel();return problem('Parâmetros excedem o limite.',413);}chunks.push(value);}
    let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return problem('JSON inválido.',400);}
    if(!body||typeof body!=='object'||Array.isArray(body)||typeof body.presetId!=='string'||!body.changes||typeof body.changes!=='object'||Array.isArray(body.changes))return problem('Cenário inválido.',400);
    if(Object.keys(body).some(k=>!['presetId','changes'].includes(k))||Object.keys(body.changes).length>40||Object.entries(body.changes).some(([k,v])=>!/^[a-z][a-z0-9_]{0,79}$/.test(k)||(k==='scenario_capital_confirmed'?typeof v!=='boolean':typeof v!=='number'||!Number.isFinite(v))))return problem('Parâmetros não permitidos.',400);
    const data=await snapshot(), presets=data.presets[parts[1]];
    if(!Object.hasOwn(data.presets,parts[1])||!Array.isArray(presets))return problem('Estudo não encontrado.',404);
    const preset=presets.find(p=>p.id===body.presetId);
    if(!preset)return problem('Cenário não pertence ao estudo.',400);
    // Native ESM preserves the engine's import.meta.url and its SHA-256 checks.
    const url=pathToFileURL(path.join(root,'engine','adapter.mjs')).href;
    const engine=await (enginePromise??=import(/* webpackIgnore: true */ url));
    const result=engine.evaluateScenario({...preset.request,changes:{...preset.request.changes,...body.changes}});
    return json(result);
  } catch { return problem('Não foi possível calcular; revise os parâmetros.',422); }
}
