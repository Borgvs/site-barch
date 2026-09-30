/** Public, immutable study snapshots. POST only calculates bounded hypotheses. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15;
const root = path.join(process.cwd(), '.barch-terreno');
let snapshotPromise, enginePromise, currencyPromise, economicsPromise, investorPromise, investorDispatchPromise;
const snapshot = () => snapshotPromise ??= readFile(path.join(root, 'snapshot.json'), 'utf8').then(JSON.parse);
const json = (data, status = 200) => Response.json(data, {status, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}});
const problem = (error, status) => json({error},status);
const economics=()=>economicsPromise??=import(/* webpackIgnore: true */ pathToFileURL(path.join(root,'acquisition-economics.mjs')).href);
async function currentProjection(value){
 if(value?.study?.verification)return {...value,study:await currentProjection(value.study)};
 if(!value?.verification&&!value?.latest)return value;
 const currency=await (currencyPromise??=import(/* webpackIgnore: true */ pathToFileURL(path.join(root,'receipt-currency.mjs')).href));
 const refreshed=currency.refreshPublicReceiptCurrency(value);
 if(!refreshed.landEconomics||refreshed.assessment?.state==='screening_current'&&refreshed.verification?.freshness?.status==='current')return refreshed;
 const result=structuredClone(refreshed),engine=await economics(),land=result.landEconomics;if(land.investorBaseline)land.investorBaseline={...land.investorBaseline,status:'reverification_required',request:null,conditionalOffer:null};
 land.value={...land.value,status:'reverification_required',candidateBand:null,adoptedMarketValueBrl:null,currentMarketValueBrl:null};
 land.territorial={...land.territorial,state:'reconciliation_required',envelopeMode:'unavailable',currency:'not_current',capabilities:Object.fromEntries(Object.keys(land.territorial.capabilities??{}).map(key=>[key,false]))};
 land.matrix=engine.buildOpportunityMatrix({study:{assessment:result.assessment},value:null,territorial:null});
 return result;
}

export async function GET(request, context) {
  try {
    const {path: parts = []} = await context.params;
    if(parts.some(p => !/^[a-zA-Z0-9_.-]+$/.test(p))) return problem('Endereço inválido.',400);
    const key=parts.join('/'), data=await snapshot();
    if(parts.length===3&&parts[0]==='studies'&&parts[2]==='economics'){
      const studyKey='studies/'+parts[1];if(!Object.hasOwn(data.routes,studyKey))return problem('Estudo não encontrado.',404);
      const current=await currentProjection(data.routes[studyKey]);if(!current.landEconomics)return problem('Economia da área indisponível.',404);
      return json(current.landEconomics);
    }
    const redirect=data.downloads[key];
    if(redirect) return Response.redirect(new URL(redirect,request.url),307);
    if(key==='sources'){
      const normalize=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      const q=normalize(new URL(request.url).searchParams.get('q')?.slice(0,200)||'');
      const rows=data.routes.sources.items.filter(r=>!q||normalize([r.title,r.jurisdiction,r.url,r.status].join(' ')).includes(q));
      return json({...data.routes.sources,items:rows.slice(0,100),total:rows.length});
    }
    if(!Object.hasOwn(data.routes,key)) return problem('Recurso não encontrado.',404);
    if(key.startsWith('studies/'))return json(await currentProjection(data.routes[key]));
    return json(data.routes[key]);
  } catch { return problem('Não foi possível abrir este recurso.',500); }
}

export async function POST(request, context) {
  try {
    const {path: parts = []} = await context.params;
    const economicCalculation=parts.length===4&&parts[0]==='studies'&&parts[2]==='economics'&&parts[3]==='calculate';
    const productCalculation=parts.length===3&&parts[0]==='studies'&&parts[2]==='calculate';
    if(!economicCalculation&&!productCalculation)return problem('A apresentação é somente leitura.',405);
    if(!/^[a-z0-9][a-z0-9-]{0,59}$/.test(parts[1]??''))return problem('Identificação inválida.',400);
    const origin=request.headers.get('origin');
    const expectedOrigin=new URL(request.url);
    // Next may normalize its internal URL to localhost; Host remains the public host.
    const host=request.headers.get('host');if(host){if(!/^[a-zA-Z0-9.:[\]-]+$/.test(host))return problem('Host inválido.',403);expectedOrigin.host=host;}
    if(origin!==expectedOrigin.origin)return problem('Origem da solicitação inválida.',403);
    if(request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase()!=='application/json')return problem('Formato deve ser JSON.',415);
    const reader=request.body?.getReader(); if(!reader)return problem('Parâmetros ausentes.',400);
    let size=0;const chunks=[];
    for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16000){await reader.cancel();return problem('Parâmetros excedem o limite.',413);}chunks.push(value);}
    let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return problem('JSON inválido.',400);}
    const data=await snapshot();
    if(!Object.hasOwn(data.routes,'studies/'+parts[1]))return problem('Estudo não encontrado.',404);
    if(economicCalculation){
      const engine=await economics(),study=await currentProjection(data.routes['studies/'+parts[1]]);let result;
      if(body?.investorMode===true){const investor=await(investorPromise??=import(/* webpackIgnore: true */ pathToFileURL(path.join(root,'investor-acquisition.mjs')).href)),dispatcher=await(investorDispatchPromise??=import(/* webpackIgnore: true */ pathToFileURL(path.join(root,'investor-dispatch.mjs')).href));const sourceBundle=await investor.loadInvestorSourceBundle();result=dispatcher.dispatchAcquisition(body,{sourceBundle,study,baseline:study.landEconomics?.investorBaseline});}else result=engine.evaluateAcquisition(body);
      return json({...result,assessmentContext:{studySlug:parts[1],state:study.assessment?.state??'unverifiable',verificationState:study.verification?.freshness?.status??'unverifiable',scope:'Cálculo de hipótese declarada, sem persistência, validação de fontes ou aprovação.'}},result.status==='invalid'?422:200);
    }
    if(!body||typeof body!=='object'||Array.isArray(body)||typeof body.presetId!=='string'||!body.changes||typeof body.changes!=='object'||Array.isArray(body.changes))return problem('Cenário inválido.',400);
    if(Object.keys(body).some(k=>!['presetId','changes'].includes(k))||Object.keys(body.changes).length>40||Object.entries(body.changes).some(([k,v])=>!/^[a-z][a-z0-9_]{0,79}$/.test(k)||(k==='scenario_capital_confirmed'?typeof v!=='boolean':typeof v!=='number'||!Number.isFinite(v))))return problem('Parâmetros não permitidos.',400);
    const presets=data.presets[parts[1]];
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
