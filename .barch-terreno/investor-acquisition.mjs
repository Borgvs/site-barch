/** MPBRC-034 / MPBRC-083: acquisition of the land itself. Official source
 * curation and editable investor policies are kept distinct. No product return,
 * appreciation, fiscal exemption or probability of success is manufactured. */
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {acquisitionLedger,normalizeAcquisitionRequest,evaluateAcquisition,landEvidenceRows} from './acquisition-economics.mjs';
import {assessCapitalCache,CAPITAL_SOURCE_ROOT} from './capital-references.mjs';
import {getEngineManifest,ENGINE_VERSION} from './engine/adapter.mjs';

export const INVESTOR_ACQUISITION_VERSION='investor-acquisition-1.0.0';
const ROOT=new URL('./',import.meta.url),SOURCE_ROOT=new URL('./bases-sistemicas/economia-investidor-v1/',import.meta.url);
const require=createRequire(import.meta.url),{vpl}=require('./engine/dist/canonical/viab/financeiro.js');
const bundles=new WeakSet();
const sha=v=>createHash('sha256').update(v).digest('hex');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const hash=v=>sha(JSON.stringify(stable(v)));
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const cents=v=>Math.round((v+Number.EPSILON)*100)/100;
const floorCents=v=>Math.floor((v+1e-9)*100)/100;
const fail=message=>{throw Object.assign(new TypeError(message),{code:'INVESTOR_ACQUISITION_INPUT'});};
const number=(v,label,min=0,max=1e12)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail(`${label}: informe valor entre ${min} e ${max}.`);return v;};
const int=(v,label,min,max)=>{number(v,label,min,max);if(!Number.isSafeInteger(v))fail(`${label}: inteiro obrigatório.`);return v;};
function verified(bundle){if(!bundles.has(bundle))fail('Carregue e confira o pacote de fontes pelo leitor do sistema antes de calcular.');return bundle;}
async function boundedFile(url,maxBytes){const bytes=await readFile(url);if(bytes.length>maxBytes)fail('Arquivo acima do limite de conferência.');return bytes;}
const json=async(url,max=100000)=>JSON.parse((await boundedFile(url,max)).toString('utf8'));
function validClock(now){if(typeof now!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(now)||!Number.isFinite(Date.parse(now)))fail('Data de conferência inválida.');return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));}

/** Database first, read-only; no arbitrary URL, file path, network or cache
 * mutation is accepted through the economics API. SHA covers source bytes. */
export async function loadInvestorSourceBundle({now=new Date().toISOString()}={}){
 const asOf=validClock(now);
 const [manifest,tableBytes,policy,index]=await Promise.all([
  json(new URL('fontes-manifesto.json',SOURCE_ROOT)),boundedFile(new URL('sc-emolumentos-2026.json',SOURCE_ROOT),100000),
  json(new URL('politica-investidor.json',SOURCE_ROOT)),json(new URL(`${CAPITAL_SOURCE_ROOT}/current.json`,ROOT)),
 ]);
 if(sha(tableBytes)!=='81c39814952ecf1def75762eac67442d483a0b84b4ca1cb9e6a33efe62169a2f')fail('SHA da extração revisada da tabela de cartório divergente.');
 const table=JSON.parse(tableBytes.toString('utf8'));
 if(manifest.schemaVersion!==1||!Array.isArray(manifest.sources)||manifest.sources.length!==9||new Set(manifest.sources.map(s=>s.id)).size!==9)fail('Manifesto de fontes divergente.');
 const sources=await Promise.all(manifest.sources.map(async source=>{
  if(source.status!=='captured'||source.httpStatus!==200||!/^fontes\/[a-f0-9]{64}\.(?:pdf|html)$/.test(source.file??'')||source.file.split('/').at(-1).split('.')[0]!==source.sha256||Date.parse(source.checkedAt)>Date.parse(now))fail('Captura de fonte incompleta, futura ou inválida.');
  const bytes=await boundedFile(new URL(source.file,SOURCE_ROOT),16*1024*1024);
  if(bytes.length!==source.bytes||sha(bytes)!==source.sha256)fail('Bytes ou SHA da fonte divergentes.');
  const sourceAgeDays=Math.floor((Date.parse(now)-Date.parse(source.checkedAt))/86400000);
  if(sourceAgeDays>=30)fail('Captura fiscal ultrapassa 30 dias; execute a curadoria de fontes antes de sugerir taxas.');
  return {...source,bytesVerified:true,sourceAgeDays};
 }));
 if(table.schemaVersion!==1||table.sourceSha256!==sources.find(s=>s.id===table.sourceId)?.sha256||table.year!==2026||table.tail?.tsjSourceId!=='sc-teto-2026'||table.tail?.tsjMaximumBrl!==7080.89)fail('Tabela derivada de emolumentos divergente.');
 for(const rows of Object.values(table.tables))if(!Array.isArray(rows)||rows.length!==21||rows.some((r,i)=>r.minBrl>r.maxBrl||i&&Math.abs(r.minBrl-rows[i-1].maxBrl-.01)>1e-6))fail('Faixas de emolumentos descontínuas.');
 if(policy.schemaVersion!==1||policy.version!=='investor-acquisition-policy-1.0.0')fail('Política de investidor divergente.');
 if(!policy.ruleSourceSha256||Object.entries(policy.ruleSourceSha256).some(([id,digest])=>sources.find(s=>s.id===id)?.sha256!==digest))fail('A fonte fiscal mudou; revise a regra e sua evidência antes de usar a nova captura.');
 const capitalEntry=index.series?.find(r=>r.seriesId==='432');
 const capital=await assessCapitalCache({entry:capitalEntry,seriesId:'432',now,readArchiveBytes:async(path,max)=>{
  if(!path.startsWith(CAPITAL_SOURCE_ROOT+'/')||path.includes('..'))fail('Caminho do acervo de capital inválido.');return boundedFile(new URL(path,ROOT),max);
 }});
 const bundle={schemaVersion:1,version:INVESTOR_ACQUISITION_VERSION,asOf,checkedAt:now,sources,table,policy,
  capitalReference:capital.valid?capital.record:null,capitalIssue:capital.valid?null:capital.reason,
  sourceBundleSha256:hash({sources:sources.map(({id,sha256})=>({id,sha256})),table,policy}),adoptionAllowed:false};
 bundles.add(bundle);return freeze(bundle);
}
export function getInvestorSourceArtifact(bundle){verified(bundle);return {version:bundle.version,checkedAt:bundle.checkedAt,asOf:bundle.asOf,sourceBundleSha256:bundle.sourceBundleSha256,
 sources:bundle.sources.map(({id,title,url,sha256,checkedAt})=>({id,title,url,sha256,checkedAt})),
 capital:bundle.capitalReference?{sourceId:bundle.capitalReference.source.id,snapshotSha256:bundle.capitalReference.snapshotSha256,effectiveDate:bundle.capitalReference.latest.effectiveDate,valuePercent:bundle.capitalReference.latest.valuePercent,unit:bundle.capitalReference.latest.unit,ratePeriod:bundle.capitalReference.latest.ratePeriod}:null};}

const COST_KEYS=['schemaVersion','itbiPct','itbiBaseBrl','notaryMode','notaryBudgetBrl','issPct','entryOtherBrl','entryBrokeragePct','saleCommissionPct','exitOtherBrl','taxProfile','gainReservePct','exitTaxAmountBrl','gainCostBasisAdditionalBrl','deedCount','registrationCount'];
export function normalizeInvestorCostPolicy(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>!COST_KEYS.includes(k))||p.schemaVersion!==1)fail('Política de custos inválida ou contém campos desconhecidos.');
 if(!['sc_2026','declared_budget'].includes(p.notaryMode))fail('Declare a tabela SC ou orçamento de cartório.');
 if(!['individual_progressive_candidate','declared_gain_reserve','manual_amount'].includes(p.taxProfile))fail('Selecione explicitamente o perfil fiscal de saída.');
 return {schemaVersion:1,itbiPct:number(p.itbiPct,'ITBI',0,10),itbiBaseBrl:p.itbiBaseBrl==null?null:number(p.itbiBaseBrl,'Base fiscal declarada de ITBI',.01),
  notaryMode:p.notaryMode,notaryBudgetBrl:number(p.notaryBudgetBrl,'Orçamento de cartório'),issPct:number(p.issPct,'ISS sobre emolumentos',0,10),
  entryOtherBrl:number(p.entryOtherBrl,'Diligência e outros custos de entrada'),entryBrokeragePct:number(p.entryBrokeragePct,'Comissão na compra',0,20),
  saleCommissionPct:number(p.saleCommissionPct,'Comissão na venda',0,20),exitOtherBrl:number(p.exitOtherBrl,'Outros custos de saída'),taxProfile:p.taxProfile,
  gainReservePct:number(p.gainReservePct,'Reserva sobre ganho',0,100),exitTaxAmountBrl:number(p.exitTaxAmountBrl,'Provisão fiscal fixa'),
  gainCostBasisAdditionalBrl:number(p.gainCostBasisAdditionalBrl,'Adições documentadas ao custo fiscal'),
  deedCount:int(p.deedCount,'Quantidade de escrituras',1,20),registrationCount:int(p.registrationCount,'Quantidade de registros',1,20)};
}
/** The RFB table applies to a declared PF scenario. No exemption, residence
 * relief, brokerage deduction or PJ regime is assumed. */
export function individualCapitalGainReserve(gainBrl){
 number(gainBrl,'Ganho tributável');let left=gainBrl,tax=0;
 for(const [width,pct] of [[5000000,15],[5000000,17.5],[20000000,20],[Infinity,22.5]]){const amount=Math.min(left,width);tax+=amount*pct/100;left-=amount;if(left<=0)break;}
 return cents(tax);
}
export function estimateScNotaryAct({priceBrl,act='escritura',issPct=2,baseDate,bundle}){
 verified(bundle);number(priceBrl,'Valor de referência do ato',.01);number(issPct,'ISS',0,10);
 const table=bundle.table;
 if(!['escritura','registro'].includes(act)||typeof baseDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(baseDate)||new Date(baseDate).toISOString().slice(0,10)!==baseDate||baseDate<table.effectiveFrom||baseDate>table.effectiveTo)fail('Ato ou vigência da tabela de cartório inválidos.');
 const reference=cents(priceBrl),row=table.tables[act].find(r=>reference>=r.minBrl&&reference<=r.maxBrl);
 let emolumentsBrl,frjBrl,additionalBlocks=0,capApplied=false;
 if(row){({emolumentsBrl,frjBrl}=row);}else{
  const last=table.tables[act].at(-1);additionalBlocks=Math.ceil((reference-table.tail.maxReferenceBrl)/table.tail.stepBrl);
  const uncapped=last.emolumentsBrl+additionalBlocks*table.tail.stepFeeBrl,cap=cents(table.tail.tsjMaximumBrl*table.tail.capPctOfTsj/100);
  emolumentsBrl=Math.min(uncapped,cap);capApplied=uncapped>=cap;
  frjBrl=floorCents(emolumentsBrl*table.tail.frjPct/100);
 }
 const issBrl=cents(emolumentsBrl*issPct/100),sealBrl=table.seals[act];
 return {act,referenceBrl:reference,emolumentsBrl,frjBrl,issBrl,sealBrl,totalBrl:cents(emolumentsBrl+frjBrl+issBrl+sealBrl),capApplied,additionalBlocks,
  sourceId:table.sourceId,sourceSha256:table.sourceSha256,authority:'verified_table_budget_candidate',
  method:'Faixa vigente; excedente provisionado por bloco de R$ 50 mil iniciado, teto de 80% da TSJ, FRJ e ISS sobre emolumentos, um selo por ato.'};
}
export function estimateInvestorTransactionCosts({request,costPolicy,sourceBundle}){
 verified(sourceBundle);const p=normalizeInvestorCostPolicy(costPolicy),r=request;
 number(r.acquisitionPriceBrl,'Preço de compra',.01);number(r.exitGrossBrl,'Saída bruta',.01);
 if(p.notaryMode==='sc_2026'&&r.moneyBasis!=='nominal')fail('Tabela nominal de cartório exige fluxo nominal.');
 const notaryItems=p.notaryMode==='sc_2026'?[
  {...estimateScNotaryAct({priceBrl:r.acquisitionPriceBrl,act:'escritura',issPct:p.issPct,baseDate:r.baseDate,bundle:sourceBundle}),count:p.deedCount},
  {...estimateScNotaryAct({priceBrl:r.acquisitionPriceBrl,act:'registro',issPct:p.issPct,baseDate:r.baseDate,bundle:sourceBundle}),count:p.registrationCount},
 ]:[];
 const notaryBrl=p.notaryMode==='sc_2026'?cents(notaryItems.reduce((s,x)=>s+x.totalBrl*x.count,0)):p.notaryBudgetBrl;
 const itbiBaseBrl=p.itbiBaseBrl??r.acquisitionPriceBrl,itbiBrl=cents(itbiBaseBrl*p.itbiPct/100),entryBrokerageBrl=cents(r.acquisitionPriceBrl*p.entryBrokeragePct/100);
 const gainBrl=Math.max(0,r.exitGrossBrl-r.acquisitionPriceBrl-p.gainCostBasisAdditionalBrl);
 const exitTaxBrl=p.taxProfile==='individual_progressive_candidate'?individualCapitalGainReserve(gainBrl):p.taxProfile==='declared_gain_reserve'?cents(gainBrl*p.gainReservePct/100):p.exitTaxAmountBrl;
 const saleCommissionBrl=cents(r.exitGrossBrl*p.saleCommissionPct/100);
 return {acquisitionCostsBrl:cents(itbiBrl+notaryBrl+entryBrokerageBrl+p.entryOtherBrl),exitCostsBrl:cents(saleCommissionBrl+exitTaxBrl+p.exitOtherBrl),
  details:{itbiBaseBrl,itbiBaseKind:p.itbiBaseBrl==null?'declared_transaction_price':'explicit_fiscal_base_override',itbiBrl,notaryBrl,notaryItems,entryBrokerageBrl,entryOtherBrl:p.entryOtherBrl,
   gainBrl,exitTaxBrl,taxProfile:p.taxProfile,taxAuthority:'reserve_for_declared_buyer_not_homologated_tax_assessment',gainBasisKind:'declared_purchase_price_plus_explicit_documented_additions',saleCommissionBrl,exitOtherBrl:p.exitOtherBrl},policy:p,policySha256:hash(p),
  authority:'cost_budget_for_declared_buyer_profile',unresolved:['Carnê e dívida de IPTU/ITR; custas de certidões e atos adicionais; incidências especiais; orçamento do tabelionato competente.',
   'Perfil do comprador, documentação do custo fiscal e tributação efetiva da saída; a hipótese PF não se aplica a uma SPE.',
   'Consultar SPU e matrícula para domínio útil, aforamento ou ocupação; laudêmio não foi inferido nem imputado ao comprador.']};
}
function applyCosts(request,p,b){const costs=estimateInvestorTransactionCosts({request,costPolicy:p,sourceBundle:b});return {request:{...request,acquisitionCostsBrl:costs.acquisitionCostsBrl,exitCostsBrl:costs.exitCostsBrl},costs};}
function fastValues(raw,p,b){const applied=applyCosts(raw,p,b),r=normalizeAcquisitionRequest(applied.request),rows=acquisitionLedger(r);return {projectNpvBrl:vpl(rows.map(x=>x.projectBrl),r.rates.waccAnnualPct),equityNpvBrl:vpl(rows.map(x=>x.equityBrl),r.rates.keAnnualPct),request:applied.request,costs:applied.costs};}
function shifted(request,{delay=0,exitMultiplier=1,carryingMultiplier=1,tmaDeltaPp=0}={}){
 const month=Math.min(240,request.exitMonth+delay);
 const normalizedRates=request.rates.method==='manual'?null:normalizeAcquisitionRequest(request).rates;
 const rates=request.rates.method==='manual'?{...request.rates,horizonMonths:month,projectAnnualPct:request.rates.projectAnnualPct+tmaDeltaPp,equityAnnualPct:request.rates.equityAnnualPct+tmaDeltaPp}:
  {method:'manual',moneyBasis:request.moneyBasis,currency:'BRL',benchmarkAnnualPct:normalizedRates.benchmarkAnnualPct,horizonMonths:month,
   projectAnnualPct:normalizedRates.waccAnnualPct+tmaDeltaPp,equityAnnualPct:normalizedRates.keAnnualPct+tmaDeltaPp,rationale:'Estresse declarado sobre as taxas resultantes do caso; não recalibra beta, prêmio de mercado ou WACC.'};
 return {...request,exitMonth:month,exitGrossBrl:request.exitGrossBrl*exitMultiplier,carryingMonthlyBrl:request.carryingMonthlyBrl*carryingMultiplier,rates};
}
export function solveInvestorAcquisitionCeiling(request,{costPolicy,sourceBundle,key='equityNpvBrl'}={}){
 verified(sourceBundle);normalizeAcquisitionRequest(request);normalizeInvestorCostPolicy(costPolicy);
 if(!['equityNpvBrl','projectNpvBrl'].includes(key))fail('Fluxo de teto inválido.');
 const at=price=>fastValues({...request,acquisitionPriceBrl:price},costPolicy,sourceBundle)[key];
 let low=.01,high=Math.max(request.exitGrossBrl*2,request.acquisitionPriceBrl*2,100000),npvLow=at(low),npvHigh=at(high);
 if(npvLow<=0)return {status:'no_positive_capacity',priceBrl:null,npvAtCeilingBrl:npvLow};
 while(npvHigh>0&&high<5e11){high*=2;npvHigh=at(high);}
 if(npvHigh>0)return {status:'outside_scope',priceBrl:null};
 for(let i=0;i<56&&high-low>.001;i++){const mid=(low+high)/2,value=at(mid);if(value>=0){low=mid;}else{high=mid;}}
 // A stepped fee table may create a boundary without an exact NPV root.
 const priceBrl=Math.floor(low*100)/100;
 return {status:'solved_boundary',priceBrl,npvAtCeilingBrl:at(priceBrl),infeasiblePriceBrl:Math.ceil(high*100)/100,
  method:'Bisseção com recálculo de ITBI, faixas de cartório, comissão e reserva tributária em cada preço.',
  scope:'Teto econômico da compra, manutenção e saída da terra na hipótese declarada; separado do valor de mercado.'};
}
function triangular(u,[a,m,b]){if(a===b)return a;const threshold=(m-a)/(b-a);return u<threshold?a+Math.sqrt(u*(b-a)*(m-a)):b-Math.sqrt((1-u)*(b-a)*(b-m));}
function random(seed){let state=seed>>>0;return()=>{state+=0x6D2B79F5;let t=state;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function quantile(xs,q){const n=(xs.length-1)*q,lo=Math.floor(n),hi=Math.ceil(n);return xs[lo]+(xs[hi]-xs[lo])*(n-lo);}
export function simulateInvestorAcquisition(request,{costPolicy,sourceBundle,uncertainty}={}){
 verified(sourceBundle);normalizeAcquisitionRequest(request);const u=uncertainty??sourceBundle.policy.uncertainty;
 const allowed=['schemaVersion','seed','draws','dependence','exitMultiplier','delayMonths','carryingMultiplier','additionalEntryCostsBrl','tmaDeltaPp','calibration'];
 if(!u||Object.keys(u).some(k=>!allowed.includes(k))||u.schemaVersion!==1||u.dependence!=='common_adverse_rank'||u.calibration!=='declared_stress_ranges_not_estimated_market_distribution')fail('Ensaio de incerteza requer faixas declaradas e dependência identificada.');
 int(u.seed,'Semente',0,4294967295);int(u.draws,'Número de ensaios',32,2000);
 const limits={exitMultiplier:[.01,3],delayMonths:[0,240-request.exitMonth],carryingMultiplier:[0,10],additionalEntryCostsBrl:[0,1e9],tmaDeltaPp:[0,100]};
 for(const [key,[min,max]] of Object.entries(limits)){const a=u[key];if(!Array.isArray(a)||a.length!==3||a.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)||a[0]>a[1]||a[1]>a[2])fail(`Faixa triangular inválida: ${key}.`);}
 const draw=random(u.seed),values=[];
 for(let i=0;i<u.draws;i++){
  const adverse=draw(),changes={exitMultiplier:triangular(1-adverse,u.exitMultiplier),delay:Math.round(triangular(adverse,u.delayMonths)),carryingMultiplier:triangular(adverse,u.carryingMultiplier),tmaDeltaPp:triangular(adverse,u.tmaDeltaPp)};
  const p={...costPolicy,entryOtherBrl:costPolicy.entryOtherBrl+triangular(adverse,u.additionalEntryCostsBrl)};
  const r=fastValues(shifted(request,changes),p,sourceBundle);values.push({draw:i+1,projectNpvBrl:r.projectNpvBrl,equityNpvBrl:r.equityNpvBrl,exitMonth:r.request.exitMonth});
 }
 const xs=values.map(x=>x.equityNpvBrl).sort((a,b)=>a-b),width=(xs.at(-1)-xs[0])/12||1;
 const histogram=Array.from({length:12},(_,i)=>({lowBrl:xs[0]+i*width,highBrl:xs[0]+(i+1)*width,count:0}));
 for(const x of xs)histogram[Math.min(11,Math.floor((x-xs[0])/width))].count++;
 return {status:'declared_stress_ensemble',seed:u.seed,draws:u.draws,dependence:u.dependence,policy:u,policySha256:hash(u),
  quantiles:{p10Brl:quantile(xs,.1),p50Brl:quantile(xs,.5),p90Brl:quantile(xs,.9)},histogram,
  positiveDrawSharePct:values.filter(x=>x.equityNpvBrl>0&&x.projectNpvBrl>0).length/u.draws*100,probabilityOfSuccessPct:null,
  label:'Frequência de VPL positivo nos ensaios declarados',interpretation:'Faixas de estresse editáveis, sem calibração estatística de mercado. Pior preço, maior prazo, custo e TMA usam uma ordem adversa comum; não são eventos independentes.',
  worstEquityNpvBrl:xs[0],bestEquityNpvBrl:xs.at(-1),inputSha256:hash({request,costPolicy,uncertainty:u}),engine:{version:ENGINE_VERSION,financialArtifactSha256:getEngineManifest().modules.find(m=>m.artifact==='dist/canonical/viab/financeiro.js').artifact_sha256}};
}
export function evaluateInvestorAcquisition(request,{costPolicy,sourceBundle,uncertainty,sensitivity=true,simulation=true}={}){
 try{
  verified(sourceBundle);normalizeAcquisitionRequest(request);const p=normalizeInvestorCostPolicy(costPolicy),applied=applyCosts(request,p,sourceBundle);
  if(request.debtPct>0&&request.debtAnnualPct<=0)fail('Ao ativar dívida, declare taxa positiva ou use a sugestão de custo de crédito; financiamento gratuito não foi comprovado.');
  const result=evaluateAcquisition(applied.request,{sensitivity:false,ceilings:false});if(result.status==='invalid')return result;
  const scenario=(label,changes)=>{const r=shifted(applied.request,changes),v=fastValues(r,p,sourceBundle);return {label,projectNpvBrl:v.projectNpvBrl,equityNpvBrl:v.equityNpvBrl,basis:'declared_stress_not_probability'};};
  const delay=Math.min(6,240-request.exitMonth),delay12=Math.min(12,240-request.exitMonth);
  return {...result,investorVersion:INVESTOR_ACQUISITION_VERSION,costPolicy:p,costPolicySha256:hash(p),transactionCosts:applied.costs,
   investorInputSha256:hash({version:INVESTOR_ACQUISITION_VERSION,request:applied.request,costPolicy:p,uncertainty:uncertainty??sourceBundle.policy.uncertainty,sourceBundleSha256:sourceBundle.sourceBundleSha256}),
   ceilings:{project:solveInvestorAcquisitionCeiling(applied.request,{costPolicy:p,sourceBundle,key:'projectNpvBrl'}),equity:solveInvestorAcquisitionCeiling(applied.request,{costPolicy:p,sourceBundle,key:'equityNpvBrl'})},
   sensitivity:sensitivity?[scenario('Saída −10%',{exitMultiplier:.9}),scenario('Saída +10%',{exitMultiplier:1.1}),scenario('Carregamento +20%',{carryingMultiplier:1.2}),scenario(`Saída +${delay} meses`,{delay}),scenario('TMA +2 p.p.',{tmaDeltaPp:2})]:[],
   grid:sensitivity?[.8,.9,1,1.1,1.2].map(multiplier=>({label:`Saída ${Math.round((multiplier-1)*100)}%`,exitMultiplier:multiplier,points:[0,delay,delay12].map(d=>({delayMonths:d,actualExitMonth:request.exitMonth+d,npvBrl:fastValues(shifted(applied.request,{delay:d,exitMultiplier:multiplier}),p,sourceBundle).equityNpvBrl}))})):[],
   ceilingGrid:sensitivity?[.8,.9,1,1.1,1.2].map(multiplier=>({label:`Saída ${Math.round(multiplier*100)}% do caso base`,exitGrossBrl:request.exitGrossBrl*multiplier,exitMultiplier:multiplier,points:[-4,-2,0,2,4].filter(delta=>result.metrics.equityTmaAnnualPct+delta>0).map(delta=>({label:`TMA ${(result.metrics.equityTmaAnnualPct+delta).toLocaleString('pt-BR')}% a.a.`,tmaAnnualPct:result.metrics.equityTmaAnnualPct+delta,exitGrossBrl:request.exitGrossBrl*multiplier,...solveInvestorAcquisitionCeiling(shifted(applied.request,{exitMultiplier:multiplier,tmaDeltaPp:delta}),{costPolicy:p,sourceBundle})}))})):[],
   timingCohorts:sensitivity?[12,24,36,48,60].map(month=>{const r={...applied.request,exitMonth:month,rates:{...applied.request.rates,horizonMonths:month}},v=fastValues(r,p,sourceBundle);return {month,exitGrossBrl:r.exitGrossBrl,equityNpvBrl:v.equityNpvBrl,projectNpvBrl:v.projectNpvBrl};}):[],
   cohortScope:'Calendários alternativos de liquidação de um único terreno, com uma compra e uma saída. Coortes de vendas de unidades pertencem ao wizard do produto.',
   uncertainty:simulation?simulateInvestorAcquisition(applied.request,{costPolicy:p,sourceBundle,uncertainty}):null,
   sourceArtifact:getInvestorSourceArtifact(sourceBundle),adoptedMarketValueBrl:null,investmentApproved:false,
   diagnostics:[...result.diagnostics,{code:'DYNAMIC_TRANSACTION_COSTS',message:'Cada variação de compra ou saída recalcula ITBI, cartório, comissão e provisão tributária. A hipótese fiscal do comprador está declarada.'},
    {code:'INVESTOR_POLICY_NOT_MARKET_CALIBRATION',message:'Prêmios, margem de oferta, prazos e estresses são políticas editáveis. Teto de investimento, preço pedido e valor de mercado têm finalidades diferentes.'}]};
 }catch(error){return {schemaVersion:1,investorVersion:INVESTOR_ACQUISITION_VERSION,status:'invalid',metrics:null,adoptedMarketValueBrl:null,investmentApproved:false,diagnostics:[{code:error.code??'INVESTOR_ACQUISITION_ERROR',message:error.message}]};}
}

/** No surrounding offer is multiplied into a subject market value. A matched
 * subject asking price can be a flat nominal EXIT hypothesis, never an adopted
 * valuation. Without a matched signal, the baseline asks for that missing input. */
export async function buildAcquisitionBaseline({study,sourceBundle,now=new Date().toISOString(),riskPremiumPp,negotiationMarginPct,askingPriceBrl,exitGrossBrl,taxProfile}={}){
 const bundle=sourceBundle??await loadInvestorSourceBundle({now});verified(bundle);const asOf=validClock(now),policy=bundle.policy;
 if(!study||typeof study!=='object'||!/^[-a-z0-9]+$/.test(study.slug??''))fail('Terreno identificado obrigatório.');
 const j=policy.jurisdictions[String(study.ibge)],capital=bundle.capitalReference;
 if(j?.notaryMode==='sc_2026'&&study.uf!=='SC')fail('Tabela SC não pode ser adotada em estudo de outra UF.');
 const marketRows=landEvidenceRows(study).filter(x=>!x.excluded),subjectSignals=study.operationalMarket?.subjectOfferSignals??[];
 const signal=subjectSignals.filter(s=>s.identityStatus==='probable-nonregistral'||/subject|16645/i.test(s.id??'')).find(s=>Number.isFinite(s.priceBrl)&&s.priceBrl>0);
 const subjectAskingBrl=askingPriceBrl??signal?.priceBrl??null,exitBrl=exitGrossBrl??subjectAskingBrl;
 const premium=number(riskPremiumPp??policy.riskPremiumPp,'Prêmio de risco declarado',0,100),margin=number(negotiationMarginPct??policy.negotiationMarginPct,'Margem de negociação',0,50);
 const marketContext={askingPriceBrl:subjectAskingBrl,askingSourceId:signal?.id??null,askingSourceUrl:signal?.sourceUrl??null,askingIdentity:askingPriceBrl!==undefined?'operator_declared_not_verified':signal?'probable_nonregistral_requires_confirmation':'missing',
  subjectSignalsNotIndependent:true,independentLandContext:marketRows,adoptedMarketValueBrl:null,
  pricePurpose:'O sinal do próprio terreno é preço pedido. As demais ofertas servem à comparação de porte, localização e restrições; não foram homogeneizadas para inferir avaliação.'};
 const costPolicy=j?{schemaVersion:1,itbiPct:j.itbiPct,itbiBaseBrl:null,notaryMode:j.notaryMode,notaryBudgetBrl:j.notaryBudgetBrl,issPct:j.issPct,
  entryOtherBrl:policy.regularizationReserveBrl,entryBrokeragePct:policy.entryBrokeragePct,saleCommissionPct:policy.saleCommissionPct,exitOtherBrl:0,
  taxProfile:taxProfile??policy.buyerProfile,gainReservePct:15,exitTaxAmountBrl:0,gainCostBasisAdditionalBrl:0,deedCount:1,registrationCount:1}:null;
 let fiscalAssessedValueBrl=null,fiscalSha256=null;
 // Fixed known Salseiros evidence, never a caller supplied path. Its identity
 // conflict is retained; the assessed value is ONLY a budget context.
 if(study.slug==='salseiros-itajai-matricula-77931'){
  const bytes=await boundedFile(new URL('terrenos/salseiros-itajai-matricula-77931/evidencias/urbanismo-2026-09-29/imovel-775061.json',ROOT),1000000);
  const attributes=JSON.parse(bytes.toString('utf8')).features?.[0]?.attributes;
  fiscalAssessedValueBrl=attributes?.vlr_venal_territorial??null;fiscalSha256=sha(bytes);
 }
 const fiscalBudgetMonthlyBrl=fiscalAssessedValueBrl==null?1500:Math.ceil(fiscalAssessedValueBrl*policy.carrying.fiscalBudgetPctOfAssessedValuePerYear/100/12/policy.carrying.roundFiscalMonthlyUpToBrl)*policy.carrying.roundFiscalMonthlyUpToBrl;
 const carryingMonthlyBrl=fiscalBudgetMonthlyBrl+policy.carrying.conservationMonthlyBrl+policy.carrying.securityMonthlyBrl;
 const capitalPolicy=capital?{benchmarkAnnualPct:capital.latest.valuePercent,riskPremiumPp:premium,tmaAnnualPct:capital.latest.valuePercent+premium,
  debtSpreadPp:policy.debtSpreadPp,suggestedDebtAnnualPct:capital.latest.valuePercent+policy.debtSpreadPp,debtRateAuthority:policy.debtRateAuthority,
  debtRateNature:'Selic de referência + spread interno editável. Provisão de crédito para ensaio, sem cotação, aprovação ou garantia de financiamento.',
  kind:'editable_short_term_proxy_plus_investor_premium',sourceId:capital.source.id,effectiveDate:capital.latest.effectiveDate,snapshotSha256:capital.snapshotSha256,
  authority:'internal_policy',nature:'Taxa nominal de ensaio; Selic bruta é referência conservadora aplicada ao fluxo com provisão de tributos. Não é yield soberano do prazo nem CAPM/WACC inferido.'}:null;
 const carryingPolicy={monthlyBrl:carryingMonthlyBrl,fiscalBudgetMonthlyBrl,conservationMonthlyBrl:policy.carrying.conservationMonthlyBrl,securityMonthlyBrl:policy.carrying.securityMonthlyBrl,
  assessedTerritorialValueBrl:fiscalAssessedValueBrl,cadastralSourceSha256:fiscalSha256,actualPropertyTaxAnnualBrl:null,
  budgetPctPerYear:policy.carrying.fiscalBudgetPctOfAssessedValuePerYear,authority:'internal_budget_reserve_not_statutory_iptu_rate',identityConflict:fiscalSha256?'Cadastro municipal menciona matrícula 27.417; documento do estudo indica 77.931. Conciliar antes de adotar guia tributária.':null};
 const costSourceStatus=j?{itbiSourceId:j.itbiSourceId,itbiRateStatus:j.rateStatus,notaryStatus:j.notaryMode==='sc_2026'?'current_state_table_budget':'editable_budget_pending_state_table',buyerProfile:costPolicy.taxProfile}:null;
 const common={schemaVersion:1,version:INVESTOR_ACQUISITION_VERSION,slug:study.slug,asOf,marketContext,sourceArtifact:getInvestorSourceArtifact(bundle),
  authority:'editable_investor_baseline_candidate',adoptedMarketValueBrl:null,investmentApproved:false,request:null,costPolicy,conditionalOffer:null,
  uncertainty:policy.uncertainty,capitalPolicy,carryingPolicy,costSourceStatus,horizonMonths:policy.horizonMonths,
  reviewActions:['Obter guia e carnê fiscais do imóvel reconciliado, certidões e orçamento detalhado dos atos.','Validar perfil fiscal do investidor e custos de saída com responsável tributário.','Corroborar saída por amostras de terra independentes, restrições, prazo e prova de transações.'],policySha256:hash(policy)};
 if(!j||!capital||exitBrl==null)return {...common,status:'inputs_needed',missingInputs:[...(!j?['municipal_acquisition_tax_reference']:[]),...(!capital?['current_verified_capital_reference']:[]),...(exitBrl==null?['matched_asking_or_declared_exit_price']:[])],capitalIssue:bundle.capitalIssue};
 const benchmark=capital.latest.valuePercent,tma=benchmark+premium,month=policy.horizonMonths;
 const raw={schemaVersion:1,baseDate:asOf,moneyBasis:'nominal',acquisitionPriceBrl:subjectAskingBrl??exitBrl,acquisitionCostsBrl:0,carryingMonthlyBrl,exitGrossBrl:exitBrl,exitCostsBrl:0,exitMonth:month,
  debtPct:0,debtAnnualPct:capitalPolicy.suggestedDebtAnnualPct,availableEquityBrl:null,riskStage:'unapproved_land',synthetic:false,
  rationale:`Aquisição e manutenção da terra: saída nominal pelo sinal de oferta do próprio imóvel ou valor declarado, sem valorização automática; perfil ${costPolicy.taxProfile} e custos são hipóteses editáveis.`,
  rates:{method:'manual',moneyBasis:'nominal',currency:'BRL',benchmarkAnnualPct:benchmark,horizonMonths:month,projectAnnualPct:tma,equityAnnualPct:tma,
   rationale:`Meta Selic bruta de ${capital.latest.effectiveDate}: ${benchmark}% a.a., proxy de oportunidade de curto prazo; prêmio interno editável de ${premium} p.p. para a terra sem aprovação, sem CAPM/WACC ou calibração de mercado.`}};
 const asking=applyCosts(raw,costPolicy,bundle).request,ceiling=solveInvestorAcquisitionCeiling(asking,{costPolicy,sourceBundle:bundle});
 const target=ceiling.priceBrl==null?null:Math.floor(ceiling.priceBrl*(1-margin/100)/1000)*1000;
 const request=target>=.01?applyCosts({...raw,acquisitionPriceBrl:target},costPolicy,bundle).request:asking;
 const conditionalOffer={priceBrl:target,unitBrl:target&&study.areaM2?target/study.areaM2:null,ceilingBrl:ceiling.priceBrl,negotiationMarginPct:margin,
  askingDiscountPct:target&&subjectAskingBrl?(1-target/subjectAskingBrl)*100:null,authority:'conditional_negotiation_target_not_market_valuation',
  conditions:['Conciliação da matrícula, cadastro e perímetro.','Confirmação da oferta e liquidez de saída; não há valorização embutida.','Encerramento da diligência de APP, acesso, inundação e passivos; perfil fiscal e custos completos confirmados.'],
  method:'Menor preço condicionado pelo VPL do investimento; oferta sugerida abaixo do teto com margem interna editável, arredondada para baixo em R$ 1 mil.'};
 return {...common,status:target>=.01?'editable_baseline_ready':'no_economic_capacity',request,costPolicy,uncertainty:policy.uncertainty,conditionalOffer,
  comparisonAtAskingPrice:{request:asking,result:evaluateAcquisition(asking,{sensitivity:false,ceilings:false})},
  capitalPolicy,carryingPolicy,costSourceStatus};
}
