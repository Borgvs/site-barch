/** Public capital references; this collector never selects a discount rate.
 * Bytes, metadata and receipts are retained privately before returning a usable
 * reference. A transport failure or a future observation remains unresolved. */
import {createHash} from 'node:crypto';
import {requestBoundedHttp} from './verification/http.mjs';

export const CAPITAL_REFERENCE_VERSION='barch-capital-references-1.1.0';
export const CAPITAL_SOURCE_ROOT='bases-sistemicas/valor-terreno-oportunidade-v1/referencias-capital';
export const CAPITAL_SOURCES=Object.freeze({
  '432':Object.freeze({id:'bcb-sgs-432',seriesId:'432',issuer:'Banco Central do Brasil / Copom',label:'Meta Selic definida pelo Copom',dataUrl:'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/12?formato=json',metadataUrl:'https://dadosabertos.bcb.gov.br/dataset/432-taxa-de-juros---meta-selic-definida-pelo-copom',unit:'percent_per_year',observationFrequency:'daily',ratePeriod:'annual',role:'short_term_opportunity_benchmark',maxObservationAgeDays:7,license:'ODbL',restriction:'Meta de política monetária; não é yield soberano de quatro anos, risk-free puro ou TMA.'}),
  '433':Object.freeze({id:'bcb-sgs-433',seriesId:'433',issuer:'Banco Central do Brasil / IBGE',label:'IPCA · variação percentual mensal',dataUrl:'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json',metadataUrl:'https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do?method=consultarSeries&series=433',unit:'percent_change_per_month',observationFrequency:'monthly',ratePeriod:'monthly',role:'observed_inflation_context',maxObservationAgeDays:75,license:'public_source_rights_require_attribution',restriction:'Inflação mensal observada; não é inflação prospectiva, anual ou taxa de desconto.'}),
});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const jsonBytes=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const byteLike=value=>Buffer.isBuffer(value)||value instanceof Uint8Array;
const sourceFor=id=>{if(typeof id!=='string'||!Object.hasOwn(CAPITAL_SOURCES,id))throw new TypeError('Série fora da lista fixa: apenas 432 e 433.');return CAPITAL_SOURCES[id];};
function clock(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value))throw new TypeError('Carimbo de conferência inválido.');
 const time=Date.parse(value),day=value.slice(0,10);
 if(!Number.isFinite(time)||new Date(Date.parse(day+'T12:00:00Z')).toISOString().slice(0,10)!==day)throw new TypeError('Carimbo de conferência inválido.');
 return time;
}
const localDay=at=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(clock(at)));
/** Twelve calendar days, ending on the verified local analysis date. There is
 * no caller-supplied URL, series, range size or unbounded history query. */
export function selicAsOfQuery(requestedAt){
 const asOfDate=localDay(requestedAt),start=new Date(Date.parse(asOfDate+'T12:00:00Z')-11*86400000).toISOString().slice(0,10);
 const brazilian=iso=>iso.split('-').reverse().join('/');
 const query=new URLSearchParams({formato:'json',dataInicial:brazilian(start),dataFinal:brazilian(asOfDate)});
 return {mode:'as-of-12-days',requestedAt,asOfDate,fromDate:start,url:'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?'+query.toString()};
}
function isoDate(raw){
 if(typeof raw!=='string'||!/^\d{2}\/\d{2}\/\d{4}$/.test(raw))throw new TypeError('Data SGS inválida.');
 const [day,month,year]=raw.split('/'),iso=`${year}-${month}-${day}`,parsed=Date.parse(iso+'T12:00:00Z');
 if(!Number.isFinite(parsed)||new Date(parsed).toISOString().slice(0,10)!==iso)throw new TypeError('Data SGS inválida.');
 return iso;
}
/** SGS values are percentage points: "0.48" is 0.48%, never 48% or 0.48/year. */
export function normalizeCapitalPoints(seriesId,payload,{now=new Date().toISOString()}={}){
 const spec=sourceFor(seriesId),today=localDay(now);
 if(!Array.isArray(payload)||payload.length<1||payload.length>12)throw new TypeError('Resposta SGS deve conter de 1 a 12 observações.');
 let previous='';
 const points=payload.map(row=>{
  if(!row||typeof row!=='object'||Array.isArray(row)||Object.keys(row).sort().join(',')!=='data,valor')throw new TypeError('Contrato da observação SGS divergente.');
  const referenceDate=isoDate(row.data);
  if(referenceDate<=previous)throw new TypeError('Datas SGS duplicadas ou fora de ordem.');previous=referenceDate;
  if(referenceDate>today)throw Object.assign(new TypeError('Observação SGS está no futuro.'),{code:'future-observation'});
  if(typeof row.valor!=='string'||!/^[-+]?\d{1,6}(?:\.\d{1,8})?$/.test(row.valor))throw new TypeError('Percentual SGS inválido; formato decimal canônico obrigatório.');
  const valuePercent=Number(row.valor);
  if(!Number.isFinite(valuePercent)||seriesId==='433'&&valuePercent<=-100||seriesId==='432'&&valuePercent<0)throw new TypeError('Percentual incompatível com a série SGS.');
  let effectiveDate=referenceDate,referencePeriod=referenceDate;
  if(seriesId==='433'){
   if(!referenceDate.endsWith('-01'))throw new TypeError('IPCA mensal deve referenciar o primeiro dia do mês.');
   referencePeriod=referenceDate.slice(0,7);
   const [year,month]=referencePeriod.split('-').map(Number);
   effectiveDate=new Date(Date.UTC(year,month,0,12)).toISOString().slice(0,10);
   if(effectiveDate>today)throw new TypeError('IPCA mensal refere-se a período ainda não encerrado.');
  }
  return {rawDate:row.data,rawValue:row.valor,referenceDate,referencePeriod,effectiveDate,valuePercent,unit:spec.unit,ratePeriod:spec.ratePeriod,percentScaling:'one_unit_is_one_percentage_point'};
 });
 const latest=points.at(-1),ageDays=(Date.parse(today+'T12:00:00Z')-Date.parse(latest.effectiveDate+'T12:00:00Z'))/86400000;
 if(ageDays>spec.maxObservationAgeDays)throw new TypeError('Última observação SGS ultrapassa a janela operacional de atualização.');
 return points;
}
function plainMetadata(bytes){
 return Buffer.from(bytes).toString('utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&(?:nbsp|amp|quot|lt|gt);/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').toLowerCase();
}
export function verifyCapitalMetadata(seriesId,bytes){
 sourceFor(seriesId);
 if(!byteLike(bytes)||!/<(?:!doctype html|html)\b/i.test(Buffer.from(bytes).toString('utf8')))throw new TypeError('Metadados oficiais não retornaram HTML.');
 const text=plainMetadata(bytes);
 const verified=seriesId==='432'?(text.includes('432')&&text.includes('meta selic')&&/percentual ao ano|percent per year|%\s*a\.a\./.test(text)):(text.includes('433')&&text.includes('ipca')&&/variacao percentual mensal|monthly\s*%\s*var\.|%\s*(?:a\.m\.|mensal)|percentual (?:ao mes|mensal)/.test(text));
 if(!verified)throw new TypeError('Metadados não confirmam identidade e unidade da série.');
 return {identityVerified:true,unitVerified:true,method:'fixed-official-page-content',automaticallyAdoptedAsDiscountRate:false};
}
function archivePath(path,kind){
 const expression=new RegExp(`^${CAPITAL_SOURCE_ROOT}/${kind}/sha256/[a-f0-9]{64}\\.(?:json|html)$`);
 if(typeof path!=='string'||!expression.test(path))throw new TypeError('Caminho de acervo inválido.');return path;
}
async function storeImmutable(kind,bytes,extension,io){
 const digest=sha(bytes),path=`${CAPITAL_SOURCE_ROOT}/${kind}/sha256/${digest}.${extension}`;
 try{const old=await io.readArchiveBytes(path,bytes.length+1);if(!byteLike(old)||old.length!==bytes.length||sha(old)!==digest)throw new Error('Acervo CAS existente diverge dos bytes esperados.');}
 catch(error){if(error.code!=='ENOENT')throw error;await io.writeArchiveBytes(path,bytes);}
 const saved=await io.readArchiveBytes(path,bytes.length+1);
 if(!byteLike(saved)||saved.length!==bytes.length||sha(saved)!==digest)throw new Error('A escrita no acervo CAS não pôde ser conferida.');
 return {path,sha256:digest,bytes:bytes.length};
}
async function readResource(resource,spec,role,io,now,maxCacheAgeMs,dataUrl=spec.dataUrl){
 const expectedUrl=role==='data'?dataUrl:spec.metadataUrl;
 if(resource?.role!==role||resource.url!==expectedUrl||resource.status!=='ok'||resource.httpStatus!==200||!/^[a-f0-9]{64}$/.test(resource.sha256??'')||!Number.isInteger(resource.bytes)||resource.bytes<1||resource.bytes>500_000)throw new Error('Recibo de fonte do cache divergente.');
 const age=clock(now)-clock(resource.fetchedAt);if(age<0||age>=maxCacheAgeMs)throw new Error('Captura futura ou expirada.');
 const raw=await io.readArchiveBytes(archivePath(resource.rawPath,'cas'),500_000);
 if(!byteLike(raw)||raw.length!==resource.bytes||sha(raw)!==resource.sha256)throw new Error('Bytes/SHA da fonte divergentes.');
 if(!/^[a-f0-9]{64}$/.test(resource.receiptSha256??''))throw new Error('SHA do recibo ausente.');
 const receiptBytes=await io.readArchiveBytes(archivePath(resource.receiptPath,'receipts'),100_000);
 if(!byteLike(receiptBytes)||sha(receiptBytes)!==resource.receiptSha256)throw new Error('SHA do recibo divergente.');
 const receipt=JSON.parse(Buffer.from(receiptBytes).toString('utf8'));
 if(receipt.protocolVersion!==CAPITAL_REFERENCE_VERSION||receipt.sourceId!==spec.id||receipt.role!==role||receipt.authority!=='public-source-capture-reference-only'||receipt.adoptionAllowed!==false||receipt.http.url!==expectedUrl||receipt.http.status!=='ok'||receipt.http.httpStatus!==200||receipt.http.retrievedAt!==resource.fetchedAt||receipt.http.sha256!==resource.sha256||receipt.http.bytes!==resource.bytes)throw new Error('Projeção do recibo divergente.');
 return Buffer.from(raw);
}
/** A local Barch cache is considered before any external query, but an ok flag
 * alone never authenticates its projection or the metadata behind its units. */
export async function assessCapitalCache({entry,seriesId,readArchiveBytes,now=new Date().toISOString(),maxCacheAgeMs=86400000}){
 const spec=sourceFor(seriesId),invalid=reason=>({valid:false,reason,record:null});
 if(!entry)return invalid('not-in-barch-cache');
 try{
  if(!Number.isInteger(maxCacheAgeMs)||maxCacheAgeMs<1||maxCacheAgeMs>86400000)throw new Error('Prazo de cache inválido.');
  if(entry.seriesId!==seriesId||!/^[a-f0-9]{64}$/.test(entry.snapshotSha256??''))throw new Error('Identidade ou SHA do snapshot divergente.');
  const bytes=await readArchiveBytes(archivePath(entry.snapshotPath,'snapshots'),100_000);
  if(!byteLike(bytes)||sha(bytes)!==entry.snapshotSha256)throw new Error('SHA do snapshot divergente.');
  const record=JSON.parse(Buffer.from(bytes).toString('utf8'));
  if(record.protocolVersion!==CAPITAL_REFERENCE_VERSION||record.state!=='reference-only'||record.referenceOnly!==true||record.adoptionAllowed!==false||record.tmaAvailable!==false||record.tma!==null||!same(record.source,spec)||!Array.isArray(record.resources)||record.resources.length!==2)throw new Error('Contrato do snapshot divergente.');
  if(clock(now)-clock(record.fetchedAt)<0||clock(now)-clock(record.fetchedAt)>=maxCacheAgeMs)throw new Error('Snapshot futuro ou expirado.');
  let dataUrl=spec.dataUrl;
  if(record.dataQuery?.mode==='as-of-12-days'){
   const expected=selicAsOfQuery(record.dataQuery.requestedAt);
   if(seriesId!=='432'||!same(record.dataQuery,expected)||clock(record.dataQuery.requestedAt)>clock(record.checkedAt))throw new Error('Janela de fallback do cache divergente.');
   dataUrl=expected.url;
   const original=record.originalQuerySnapshot;
   if(original?.state!=='quarantined'||!/^[a-f0-9]{64}$/.test(original.sha256??''))throw new Error('Snapshot original de quarentena ausente.');
   const bytes=await readArchiveBytes(archivePath(original.path,'snapshots'),100_000);
   if(!byteLike(bytes)||sha(bytes)!==original.sha256)throw new Error('Snapshot original de quarentena divergente.');
   const prior=JSON.parse(Buffer.from(bytes).toString('utf8'));
   if(prior.state!=='quarantined'||prior.issueCode!=='future-observation'||prior.latest!==null||!same(prior.source,spec)||prior.dataQuery?.url!==spec.dataUrl)throw new Error('Quarentena original não confirma observação futura.');
   const priorData=await readResource(prior.resources?.find(r=>r.role==='data'),spec,'data',{readArchiveBytes},now,maxCacheAgeMs);
   try{normalizeCapitalPoints(seriesId,JSON.parse(priorData.toString('utf8')),{now:prior.checkedAt});throw new Error('A observação original não está no futuro.');}catch(error){if(error.code!=='future-observation')throw error;}
  }else if(!same(record.dataQuery,{mode:'latest-12',url:spec.dataUrl}))throw new Error('Consulta do cache divergente.');
  const roles=['metadata','data'];
  if(roles.some(role=>record.resources.filter(r=>r.role===role).length!==1))throw new Error('Conjunto de fontes do snapshot divergente.');
  const [metadata,data]=await Promise.all(roles.map(role=>readResource(record.resources.find(r=>r.role===role),spec,role,{readArchiveBytes},now,maxCacheAgeMs,dataUrl)));
  const checkedMetadata=verifyCapitalMetadata(seriesId,metadata),points=normalizeCapitalPoints(seriesId,JSON.parse(data.toString('utf8')),{now});
  if(record.dataQuery.mode==='as-of-12-days'&&points.some(p=>p.referenceDate<record.dataQuery.fromDate||p.referenceDate>record.dataQuery.asOfDate))throw new Error('Observação do cache fora da janela de fallback.');
  if(!same(record.metadataVerification,checkedMetadata)||!same(record.points,points)||!same(record.latest,points.at(-1))||record.effectiveDate!==points.at(-1).effectiveDate||record.fetchedAt!==record.resources.map(r=>r.fetchedAt).sort().at(-1))throw new Error('Projeção normalizada do cache divergente.');
  return {valid:true,reason:'metadata-bytes-sha-receipts-projection-and-time-match',record:{...record,snapshotPath:entry.snapshotPath,snapshotSha256:entry.snapshotSha256}};
 }catch(error){return invalid(error.message);}
}
async function captureResource(result,spec,io){
 const raw=result.bytes?await storeImmutable('cas',result.bytes,result.role==='metadata'?'html':'json',io):null;
 const capture={schemaVersion:1,protocolVersion:CAPITAL_REFERENCE_VERSION,sourceId:spec.id,role:result.role,authority:'public-source-capture-reference-only',adoptionAllowed:false,http:result.receipt};
 const receipt=await storeImmutable('receipts',jsonBytes(capture),'json',io);
 return {role:result.role,url:result.receipt.url,fetchedAt:result.receipt.retrievedAt,status:result.status,httpStatus:result.httpStatus??null,rawPath:raw?.path??null,sha256:raw?.sha256??null,bytes:raw?.bytes??null,receiptPath:receipt.path,receiptSha256:receipt.sha256};
}
const request=url=>({allowedHosts:[new URL(url).hostname],responseType:'text',maxBytes:500_000,retries:1,timeoutMs:7000,totalTimeoutMs:15000,headers:{'User-Agent':'Barch-Capital-References/1.1','Accept-Language':'pt-BR,pt;q=0.9,en;q=0.5'}});
function normalizeResponses(seriesId,responses,resources,checkedAt){
 if(responses.some(r=>!r.ok))throw new Error('Consulta pública não concluída: '+responses.filter(r=>!r.ok).map(r=>`${r.role}:${r.status}`).join(', '));
 if(resources.some(r=>clock(r.fetchedAt)>clock(checkedAt)))throw new Error('Captura da fonte datada no futuro.');
 const metadataVerification=verifyCapitalMetadata(seriesId,responses.find(r=>r.role==='metadata').bytes);
 const points=normalizeCapitalPoints(seriesId,JSON.parse(responses.find(r=>r.role==='data').bytes.toString('utf8')),{now:checkedAt});
 return {points,metadataVerification};
}
async function collectSeries({seriesId,entry,io,fetchFn,now,maxCacheAgeMs,refresh}){
 const spec=sourceFor(seriesId),lookupAt=now??new Date().toISOString();clock(lookupAt);
 const cacheCheck=await assessCapitalCache({entry,seriesId,readArchiveBytes:io.readArchiveBytes,now:lookupAt,maxCacheAgeMs});
 if(cacheCheck.valid&&!refresh)return {...cacheCheck.record,cached:true,cacheCheck:{valid:true,reason:cacheCheck.reason,checkedAt:lookupAt}};
 const requests=[['metadata',spec.metadataUrl],['data',spec.dataUrl]];
 const responses=await Promise.all(requests.map(async([role,url])=>({role,...await requestBoundedHttp(url,{...request(url),fetchFn})})));
 const checkedAt=now??new Date().toISOString(),resources=[];
 for(const result of responses){
  resources.push(await captureResource(result,spec,io));
 }
 let points,metadataVerification=null,issue=null,issueCode=null;
 try{
  ({metadataVerification,points}=normalizeResponses(seriesId,responses,resources,checkedAt));
 }catch(error){issue=error.message;issueCode=error.code??null;points=[];}
 const record={schemaVersion:1,protocolVersion:CAPITAL_REFERENCE_VERSION,source:spec,dataQuery:{mode:'latest-12',url:spec.dataUrl},state:issue?(responses.some(r=>r.bytes)?'quarantined':'unverifiable'):'reference-only',referenceOnly:true,adoptionAllowed:false,tmaAvailable:false,tma:null,checkedAt,fetchedAt:resources.map(r=>r.fetchedAt).sort().at(-1),effectiveDate:points.at(-1)?.effectiveDate??null,points,latest:points.at(-1)??null,metadataVerification,issue,issueCode,resources,cacheCheck:{valid:cacheCheck.valid,reason:cacheCheck.reason,checkedAt:lookupAt},priorSnapshot:entry?{snapshotPath:entry.snapshotPath??null,snapshotSha256:entry.snapshotSha256??null}:null};
 const stored=await storeImmutable('snapshots',jsonBytes(record),'json',io);
 if(seriesId!=='432'||issueCode!=='future-observation')return {...record,snapshotPath:stored.path,snapshotSha256:stored.sha256,cached:false};
 // Archive the whole original quarantine before a second, explicitly dated query.
 const dataQuery=selicAsOfQuery(now??new Date().toISOString());
 const fallbackResponse={role:'data',...await requestBoundedHttp(dataQuery.url,{...request(dataQuery.url),fetchFn})};
 const fallbackResources=[resources.find(r=>r.role==='metadata'),await captureResource(fallbackResponse,spec,io)],fallbackResponses=[responses.find(r=>r.role==='metadata'),fallbackResponse],fallbackCheckedAt=now??new Date().toISOString();
 let normalized={points:[],metadataVerification:null},fallbackIssue=null,fallbackIssueCode=null;
 try{
  normalized=normalizeResponses(seriesId,fallbackResponses,fallbackResources,fallbackCheckedAt);
  if(normalized.points.some(p=>p.referenceDate<dataQuery.fromDate||p.referenceDate>dataQuery.asOfDate))throw new Error('Resposta SGS está fora da janela explicitamente solicitada.');
 }catch(error){normalized.points=[];fallbackIssue=error.message;fallbackIssueCode=error.code??null;}
 const fallback={...record,dataQuery,checkedAt:fallbackCheckedAt,fetchedAt:fallbackResources.map(r=>r.fetchedAt).sort().at(-1),resources:fallbackResources,state:fallbackIssue?(fallbackResponse.bytes?'quarantined':'unverifiable'):'reference-only',...normalized,latest:normalized.points.at(-1)??null,effectiveDate:normalized.points.at(-1)?.effectiveDate??null,issue:fallbackIssue,issueCode:fallbackIssueCode,originalQuerySnapshot:{path:stored.path,sha256:stored.sha256,state:'quarantined',issue:record.issue}};
 const fallbackStored=await storeImmutable('snapshots',jsonBytes(fallback),'json',io);
 return {...fallback,snapshotPath:fallbackStored.path,snapshotSha256:fallbackStored.sha256,cached:false};
}
export async function collectCapitalReferences({cacheBarch={schemaVersion:1,series:[]},readArchiveBytes,writeArchiveBytes,fetchFn=globalThis.fetch,now,maxCacheAgeMs=86400000,refresh=false}={}){
 if(typeof readArchiveBytes!=='function'||typeof writeArchiveBytes!=='function'||typeof fetchFn!=='function')throw new TypeError('Portas de acervo e consulta são obrigatórias.');
 if(cacheBarch?.schemaVersion!==1||!Array.isArray(cacheBarch.series)||cacheBarch.series.length>2||cacheBarch.series.some(x=>!x||!Object.hasOwn(CAPITAL_SOURCES,x.seriesId))||new Set(cacheBarch.series.map(x=>x.seriesId)).size!==cacheBarch.series.length)throw new TypeError('Índice de cache Barch inválido.');
 if(!Number.isInteger(maxCacheAgeMs)||maxCacheAgeMs<1||maxCacheAgeMs>86400000||typeof refresh!=='boolean')throw new TypeError('Política de cache inválida.');
 if(now!==undefined)clock(now);
 const series=await Promise.all(Object.keys(CAPITAL_SOURCES).map(seriesId=>collectSeries({seriesId,entry:cacheBarch.series.find(e=>e.seriesId===seriesId),io:{readArchiveBytes,writeArchiveBytes},fetchFn,now,maxCacheAgeMs,refresh})));
 return {schemaVersion:1,protocolVersion:CAPITAL_REFERENCE_VERSION,checkedAt:now??new Date().toISOString(),state:series.every(r=>r.state==='reference-only')?'reference-only':series.some(r=>r.state==='reference-only')?'partial':'unverifiable',databaseLookup:{performed:true,kind:'local-barch-acervo-cache',sourceIds:cacheBarch.series.map(e=>CAPITAL_SOURCES[e.seriesId].id),checkedBeforeExternalQueries:true},referenceOnly:true,adoptionAllowed:false,tmaAvailable:false,tma:null,missingCapitalInputs:['currency_and_duration_matched_yield','approved_equity_risk_premium','approved_beta','approved_risk_policy','project_or_equity_cash_flow_definition'],series};
}
export function capitalCacheIndex(result){
 if(result?.protocolVersion!==CAPITAL_REFERENCE_VERSION||result.referenceOnly!==true||!Array.isArray(result.series)||result.series.length!==2)throw new TypeError('Resultado de referências inválido.');
 return {schemaVersion:1,protocolVersion:CAPITAL_REFERENCE_VERSION,referenceOnly:true,updatedAt:result.checkedAt,series:result.series.map(r=>({seriesId:r.source.seriesId,snapshotPath:r.snapshotPath,snapshotSha256:r.snapshotSha256}))};
}
