/** Public Concept: comparable evidence -> editable acquisition hypothesis.
 * This extension selects evidence and budgets costs. All ledger, NPV and IRR
 * arithmetic comes from the pinned acquisition/canonical financial engine.
 * No private offer, appraisal adoption or investment approval is read/written. */
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {acquisitionLedger,normalizeAcquisitionRequest,evaluateAcquisition} from './acquisition-economics.mjs';
import {evaluateLandMarket,DEFAULT_LAND_VALUATION_POLICY} from './land-market-valuation.mjs';
const require=createRequire(import.meta.url);
export const DEFAULT_PRELIMINARY_POLICY=require('./preliminary-policy.json');
const {vpl}=require('./engine/dist/canonical/viab/financeiro.js');
export const PRELIMINARY_ADVISORY_VERSION='preliminary-advisory-1.1.0';
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const cents=v=>Math.round((v+Number.EPSILON)*100)/100;
const fail=message=>{throw Object.assign(new TypeError(message),{code:'PRELIMINARY_INPUT'});};
const bounded=(v,name,min=0,max=1e12)=>{if(!finite(v)||v<min||v>max)fail(`${name}: informe número entre ${min} e ${max}.`);return v;};
const validDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const ageDays=(date,asOf)=>date&&Number.isFinite(Date.parse(date))?Math.floor((Date.parse(asOf+'T23:59:59Z')-Date.parse(date))/86400000):null;
const stable=v=>Array.isArray(v)?v.map(stable):object(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const hash=v=>createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
const INPUT_KEYS=['baseDate','offeredPriceBrl','exitMonth','benchmarkAnnualPct','riskPremiumPp','growthAnnualPct','safetyMarginPct','itbiPct','notaryBudgetBrl','diligenceBudgetBrl','preparationBudgetBrl','carryingMonthlyBrl','commissionPct','taxReservePct','debtPct','debtAnnualPct','availableEquityBrl','valuationBasis'];
const criticalAxes=new Set(['identity_geometry','zoning_regime','public_constraints','environmental_water','rural_transition','licensing_execution','geotechnical','infrastructure']);

function validatePolicy(p){
 if(!object(p)||p.schemaVersion!==1||!object(p.defaults)||!object(p.capital)||!object(p.evidence)||!object(p.profiles)||!Array.isArray(p.additionalRows)||!Array.isArray(p.sources))fail('Pacote público de referências e política inválido.');
 bounded(p.capital.valueAnnualPct,'Referência de capital',0,100);bounded(p.evidence.maxAreaRatio,'Filtro de porte',1,100);
 if(!validDate(p.capital.effectiveDate)||!/^\w[\w.-]*$/.test(p.version??''))fail('Vigência ou versão da política inválida.');
 return p;
}

/** Compatibility projection: land-market owns all price selection. This
 * adapter only selects the explicit external basis for the acquisition model.
 * Legacy valuation unit fields remain BRL/m²; landValuation declares m²/ha. */
function selectBusinessValue(study,financialPolicy,land,basis){
 const estimate=({land:land.landOnlyEstimate,bare_land:land.bareLandEstimate,physical_property_proxy:land.physicalProxy})[basis]??null;
 const selectedIds=new Set(estimate?.sourceIds??[]),selectedRows=(land.comparables??[]).filter(r=>selectedIds.has(r.id)).map(r=>({...r}));
 const totals=new Map();for(const r of selectedRows)totals.set(r.publisher,(totals.get(r.publisher)??0)+r.weight);for(const r of selectedRows)r.weight/=totals.get(r.publisher);
 const contextRows=[...(land.rejected??[]),...(land.comparables??[]).filter(r=>!selectedIds.has(r.id)).map(r=>({...r,selected:false,exclusionReason:'Referência em outro estrato físico; não compõe a base econômica escolhida.'}))];
 const factor=estimate?.displayUnit==='BRL_ha'?10000:1;
 return {areaM2:land.subject?.areaM2??study.areaM2,areaBasis:land.subject?.areaBasis??study.areaLabel,label:estimate?.label??'Base externa não identificada',assetClass:land.subject?.assetClass,
  lowBrl:estimate?.lowBrl??null,centralBrl:estimate?.centralBrl??null,highBrl:estimate?.highBrl??null,
  unitLowBrl:estimate?estimate.unitLowBrl/factor:null,unitCentralBrl:estimate?.unitPerM2Brl??null,unitHighBrl:estimate?estimate.unitHighBrl/factor:null,
  selectedRows,contextRows,independentPublisherCount:estimate?.independentPublisherCount??0,confidence:'low_exploratory',authority:'preliminary_asking_proxy',adoptedMarketValueBrl:null,
  basis:estimate?.basis??basis,displayUnit:'BRL_m2',rangeKind:estimate?.rangeKind??null,bandIdentified:estimate?.bandIdentified??false,
  method:land.method+' Faixa de ofertas observadas; não é laudo, transação confirmada ou intervalo de confiança.',
  conditions:[...(financialPolicy.profiles[study.slug]?.conditions??[]),...(land.notes??[])]};
}

function municipalPolicy(study,policy){return policy.municipalities?.[`${study.municipality}/${study.uf}`]??{itbiPct:policy.defaults.itbiFallbackBudgetPct,notaryMode:'editable_budget',notaryBudgetBrl:policy.defaults.notaryFallbackBudgetBrl,status:'generic_budget_no_local_rule_verified'};}
function resolveAssumptions(study,input,policy,valuation){
 if(!object(input)||Object.keys(input).some(k=>!INPUT_KEYS.includes(k)))fail('Premissas preliminares inválidas ou campo desconhecido.');
 const baseDate=input.baseDate??today();if(!validDate(baseDate))fail('Data-base deve ser uma data calendárica válida.');
 const d=policy.defaults,m=municipalPolicy(study,policy),p=policy.profiles[study.slug]??{},central=valuation.centralBrl??0;
 const pick=(key,fallback,min=0,max=1e12)=>bounded(input[key]??fallback,key,min,max);
 const benchmarkAnnualPct=pick('benchmarkAnnualPct',policy.capital.valueAnnualPct,0,100),riskPremiumPp=pick('riskPremiumPp',d.riskPremiumPp,0,100),debtPct=pick('debtPct',d.debtPct,0,90);
 if(benchmarkAnnualPct+riskPremiumPp<=0)fail('Taxa de atratividade positiva obrigatória.');
 const exitMonth=pick('exitMonth',d.exitMonth,1,240);if(!Number.isSafeInteger(exitMonth))fail('Prazo de saída deve ser inteiro.');
 const notaryAuto=input.notaryBudgetBrl==null&&m.notaryMode==='sc_2026'&&baseDate>=policy.scNotaryTable.effectiveFrom&&baseDate<=policy.scNotaryTable.effectiveTo;
 const valuationBasis=input.valuationBasis??valuation.selectedBusinessBasis;
 if(!['land','bare_land','physical_property_proxy'].includes(valuationBasis)&&valuationBasis!==null)fail('Base de valor deve ser land, bare_land ou physical_property_proxy.');
 const resolved={baseDate,valuationBasis,offeredPriceBrl:input.offeredPriceBrl==null?null:bounded(input.offeredPriceBrl,'Preço informado',.01),exitMonth,
  benchmarkAnnualPct,riskPremiumPp,projectAnnualPct:benchmarkAnnualPct+riskPremiumPp,equityAnnualPct:benchmarkAnnualPct+riskPremiumPp,
  growthAnnualPct:pick('growthAnnualPct',d.growthAnnualPct,-30,50),safetyMarginPct:pick('safetyMarginPct',d.safetyMarginPct,0,80),
  itbiPct:pick('itbiPct',m.itbiPct,0,10),notaryBudgetBrl:notaryAuto?null:pick('notaryBudgetBrl',m.notaryBudgetBrl??d.notaryFallbackBudgetBrl),notaryMode:notaryAuto?'sc_2026':'editable_budget',
  diligenceBudgetBrl:pick('diligenceBudgetBrl',d.diligenceBudgetBrl),
  preparationBudgetBrl:pick('preparationBudgetBrl',Math.max(central*d.preparationReservePct/100,(p.builtAreaM2??0)*d.preparationUnitBudgetBrl)),
  carryingMonthlyBrl:pick('carryingMonthlyBrl',central*d.carryingReserveAnnualPct/100/12+(p.maintenanceMonthlyBrl??d.maintenanceMonthlyBrl)),
  commissionPct:pick('commissionPct',d.commissionPct,0,30),taxReservePct:pick('taxReservePct',d.taxReservePct,0,100),
  debtPct,debtAnnualPct:pick('debtAnnualPct',benchmarkAnnualPct+d.debtSpreadPp,0,100),availableEquityBrl:input.availableEquityBrl==null?null:bounded(input.availableEquityBrl,'Capital disponível')};
 if(debtPct>0&&resolved.debtAnnualPct<=0)fail('Dívida ativa exige taxa positiva; crédito gratuito não é base automática de oportunidade.');
 return resolved;
}

function scNotaryBudget(priceBrl,baseDate,policy){
 const table=policy.scNotaryTable;if(baseDate<table.effectiveFrom||baseDate>table.effectiveTo)fail('Tabela SC fora de vigência.');
 const reference=cents(priceBrl),items=['escritura','registro'].map(act=>{
  const rows=table.tables[act],row=rows.find(r=>reference>=r.minBrl&&reference<=r.maxBrl);let emolumentsBrl,frjBrl;
  if(row)({emolumentsBrl,frjBrl}=row);else{const blocks=Math.max(0,Math.ceil((reference-table.tail.maxReferenceBrl)/table.tail.stepBrl));emolumentsBrl=Math.min(rows.at(-1).emolumentsBrl+blocks*table.tail.stepFeeBrl,cents(table.tail.tsjMaximumBrl*table.tail.capPctOfTsj/100));frjBrl=Math.floor((emolumentsBrl*table.tail.frjPct/100+1e-9)*100)/100;}
  return {act,emolumentsBrl,frjBrl,issBrl:cents(emolumentsBrl*policy.defaults.issBudgetPct/100),sealBrl:table.seals[act]};
 });
 return {amountBrl:cents(items.reduce((s,r)=>s+r.emolumentsBrl+r.frjBrl+r.issBrl+r.sealBrl,0)),items,authority:'sc_table_transaction_budget',sourceSha256:table.sourceSha256};
}
function quote(priceBrl,a,valuation,policy){
 const price=bounded(priceBrl,'Preço do ensaio',.01),exitGrossBrl=valuation.centralBrl*(1+a.growthAnnualPct/100)**(a.exitMonth/12);
 const notary=a.notaryMode==='sc_2026'?scNotaryBudget(price,a.baseDate,policy):{amountBrl:a.notaryBudgetBrl,items:[],authority:'editable_notary_budget'};
 const itbiBrl=cents(price*a.itbiPct/100),commissionBrl=cents(exitGrossBrl*a.commissionPct/100),gainBrl=Math.max(0,exitGrossBrl-price),exitTaxReserveBrl=cents(gainBrl*a.taxReservePct/100);
 const acquisitionCostsBrl=cents(itbiBrl+notary.amountBrl+a.diligenceBudgetBrl+a.preparationBudgetBrl),exitCostsBrl=cents(commissionBrl+exitTaxReserveBrl);
 return {request:{schemaVersion:1,baseDate:a.baseDate,moneyBasis:'nominal',acquisitionPriceBrl:price,acquisitionCostsBrl,carryingMonthlyBrl:a.carryingMonthlyBrl,exitGrossBrl,exitCostsBrl,exitMonth:a.exitMonth,
  debtPct:a.debtPct,debtAnnualPct:a.debtAnnualPct,availableEquityBrl:a.availableEquityBrl,riskStage:'unapproved_land',synthetic:false,
  rationale:'Ensaio automático público: saída independente ancorada em ofertas compatíveis por porte/classe; custos e prêmios são hipóteses editáveis, aquisição não aprovada.',
  rates:{method:'manual',currency:'BRL',moneyBasis:'nominal',benchmarkAnnualPct:a.benchmarkAnnualPct,projectAnnualPct:a.projectAnnualPct,equityAnnualPct:a.equityAnnualPct,horizonMonths:a.exitMonth,
   rationale:'Taxa de atratividade proposta: benchmark de oportunidade e prêmio interno editável da terra; sem CAPM, beta, WACC inferido ou benefício fiscal de dívida.'}},
  costBreakdown:{itbiBrl,itbiBaseBrl:price,notaryBrl:notary.amountBrl,notary,diligenceBrl:a.diligenceBudgetBrl,preparationBrl:a.preparationBudgetBrl,
   carryingBrl:a.carryingMonthlyBrl*a.exitMonth,commissionBrl,exitTaxReserveBrl,gainReserveBaseBrl:gainBrl,taxAuthority:'editable_gain_reserve_not_tax_assessment',acquisitionCostsBrl,exitCostsBrl}};
}
function presentValues(price,a,valuation,policy){
 const q=quote(price,a,valuation,policy),r=normalizeAcquisitionRequest(q.request),rows=acquisitionLedger(r);
 return {project:vpl(rows.map(x=>x.projectBrl),r.rates.waccAnnualPct),equity:vpl(rows.map(x=>x.equityBrl),r.rates.keAnnualPct)};
}
function solveCeilings(a,valuation,policy){
 const initial=presentValues(.01,a,valuation,policy),boundary=key=>{
  if(initial[key]<=0)return 0;
  let low=.01,high=Math.max(valuation.centralBrl*(1+a.growthAnnualPct/100)**(a.exitMonth/12),1),expansions=0;
  while(presentValues(high,a,valuation,policy)[key]>0&&high<5e11&&expansions++<20)high*=2;
  if(high>=1e12||presentValues(high,a,valuation,policy)[key]>0)fail('Teto econômico fora do intervalo suportado.');
  for(let n=0;n<60&&high-low>.005;n++){const mid=(low+high)/2;if(presentValues(mid,a,valuation,policy)[key]>=0)low=mid;else high=mid;}
  return Math.floor((low+1e-9)*100)/100;
 };
 const projectBrl=boundary('project'),equityBrl=a.debtPct===0?projectBrl:boundary('equity');
 return {projectBrl,equityBrl,effectiveBrl:Math.min(projectBrl,equityBrl),method:'Fronteira de VPL canônico com ITBI, cartório e reservas recalculados por preço. Limite efetivo = menor teto do ativo e do capital próprio.'};
}
function collectGates(study,a,policy,valuation){
 const gates=[],capitalAge=ageDays(policy.capital.effectiveDate,a.baseDate),captureAge=ageDays(policy.capital.checkedAt,a.baseDate);
 if(a.benchmarkAnnualPct===policy.capital.valueAnnualPct&&(capitalAge===null||capitalAge<0||capitalAge>policy.capital.maxAgeDays||captureAge===null||captureAge<0||captureAge>policy.capital.maxAgeDays))gates.push({id:'capital_currency',label:'Atualizar referência de capital',state:'pending',critical:true,action:'Executar consultar-capital --refresh e revisar/publicar o pacote; benchmark capturado não é apresentado como taxa vigente.'});
 const assessment=study.assessment;
 if(!assessment||assessment.state!=='screening_current')gates.push({id:'screening_currency',label:'Atualizar verificação documental e territorial',state:'pending',critical:true,action:'Reexecutar o protocolo de bases e checar validade dos recibos antes de decidir.'});
 for(const axis of assessment?.regulatory?.axes??[]){if(axis.state!=='blocked'&&!criticalAxes.has(axis.id))continue;if(axis.state==='blocked'||!['supported','not_applicable'].includes(axis.state))gates.push({id:axis.id,label:axis.label??axis.id,state:axis.state==='blocked'?'blocked':'pending',critical:true,action:axis.state==='blocked'?'Resolver divergência material e anexar evidência reconciliada.':'Concluir as diligências críticas indicadas para este eixo.'});}
 const municipality=municipalPolicy(study,policy),source=policy.sources.find(s=>s.id===municipality.sourceId);
 if(municipality.status==='historical_rule_current_consolidation_pending'||municipality.status==='generic_budget_no_local_rule_verified')gates.push({id:'local_tax_rule',label:'Consolidar regra municipal de aquisição',state:'pending',critical:false,action:'Confirmar ITBI e base aplicável na legislação e guia municipal atual; percentual usado é orçamento editável.'});
 if(source&&ageDays(source.checkedAt,a.baseDate)>30)gates.push({id:'cost_source_currency',label:'Atualizar fonte fiscal',state:'pending',critical:false,action:'Renovar captura oficial e conferir alterações antes de fechar orçamento de aquisição.'});
 if(valuation.selectedRows.length===0)gates.push({id:'land_market_evidence',label:'Coletar referências de terra compatíveis',state:'pending',critical:true,action:'Curar ofertas/transações por classe, porte, direitos e posição; valor e compra não calculáveis com evidência inexistente.'});
 else gates.push({id:'valuation_qualification',label:'Qualificar valor do imóvel e direito adquirido',state:'pending',critical:true,action:'Confirmar amostras, condição de negociação, área, benfeitorias e direitos. Confirmar o estrato de terra ou imóvel explicitamente escolhido. Faixa de oferta não é valor de mercado adotado.'});
 return gates;
}

export function evaluatePreliminaryAdvisory(study,assumptions={}, {policy=DEFAULT_PRELIMINARY_POLICY,landPolicy=DEFAULT_LAND_VALUATION_POLICY}={}){
 try{
  if(!object(study)||typeof study.slug!=='string'||!study.slug)fail('Estudo e slug do terreno obrigatórios.');
  validatePolicy(policy);if(!object(assumptions))fail('Premissas devem ser objeto.');
  const baseDate=assumptions.baseDate??today();if(!validDate(baseDate))fail('Data-base inválida.');
  const landValuation=evaluateLandMarket(study,{policy:landPolicy,baseDate});
  if(landValuation.status==='invalid')fail(landValuation.diagnostics?.[0]?.message??'Curadoria da terra inválida.');
  const selectedBusinessBasis=assumptions.valuationBasis??landValuation.defaultBusinessValuationBasis;
  if(selectedBusinessBasis!==null&&!['land','bare_land','physical_property_proxy'].includes(selectedBusinessBasis))fail('Base de valor deve ser land, bare_land ou physical_property_proxy.');
  const valuation={...selectBusinessValue(study,policy,landValuation,selectedBusinessBasis),selectedBusinessBasis},a=resolveAssumptions(study,assumptions,policy,valuation),gates=collectGates(study,a,policy,valuation);
  if(landPolicy.subjectProfiles[study.slug]?.comparisonScope==='regional_proxy')gates.push({id:'regional_proxy_scope',label:'Homologar microlocalização e direitos da gleba de Penha',state:'pending',critical:true,action:'A referência de glebas no corredor ampliado não é avaliação da frente Beto Carrero. Resolver endereço/perímetro dos comparáveis e diferença frente/litoral antes de adotar preço; não usar permuta ou VGV como substituto.'});
  const businessValuation={basis:a.valuationBasis,selectedBy:Object.hasOwn(assumptions,'valuationBasis')?'user_override':'public_valuation_policy',selectionExplicit:true,
   centralBrl:valuation.centralBrl,label:valuation.label,sourceIds:valuation.selectedRows.map(r=>r.id),available:valuation.centralBrl!==null,adoptedMarketValueBrl:null};
  const sources=[{title:policy.capital.label,url:policy.capital.metadataUrl,effectiveOn:policy.capital.effectiveDate,capturedAt:policy.capital.checkedAt,sha256:policy.capital.snapshotSha256},
   ...policy.sources.map(s=>({title:s.title,url:s.url,effectiveOn:s.id==='sc-emolumentos-2026'?'2026-01-01':null,capturedAt:s.checkedAt,sha256:s.sha256})),
   ...landValuation.sources];
  const capitalFresh=ageDays(policy.capital.effectiveDate,a.baseDate)<=policy.capital.maxAgeDays&&ageDays(policy.capital.checkedAt,a.baseDate)<=policy.capital.maxAgeDays&&ageDays(policy.capital.effectiveDate,a.baseDate)>=0;
  const capitalOverride=Object.hasOwn(assumptions,'benchmarkAnnualPct');
  const rateConstruction={benchmarkAnnualPct:a.benchmarkAnnualPct,riskPremiumPp:a.riskPremiumPp,projectAnnualPct:a.projectAnnualPct,equityAnnualPct:a.equityAnnualPct,
   benchmarkStatus:capitalOverride?'user_override':capitalFresh?'fresh_official_reference':'historical_reference_refresh_required',benchmarkEffectiveOn:policy.capital.effectiveDate,
   benchmarkSource:policy.capital.sourceUrl,benchmarkSha256:policy.capital.snapshotSha256,authority:'editable_screening_hurdle_proposal',
   method:'Benchmark de oportunidade + prêmio interno para terra; taxa proposta, não CAPM/WACC calibrado.',riskComponents:Object.hasOwn(assumptions,'riskPremiumPp')?[{label:'Prêmio informado',pct:a.riskPremiumPp}]:policy.defaults.riskComponents,
   riskComponentsStatus:Object.hasOwn(assumptions,'riskPremiumPp')?'total_premium_user_override':'internal_policy_default'};
  const notes=[...valuation.conditions,'Valor de referência, preço informado e capacidade de compra são finalidades distintas. Saída se ancora em imóveis externos; valorização nominal inicia em zero.',
   'Prêmio, diligência, preparação, carregamento e provisão sobre ganho são hipóteses editáveis. A provisão fiscal não escolhe regime PF/PJ, não presume isenção, deduções ou custo fiscal da terra rural.',
   'A meta Selic é referência de oportunidade de curto prazo; não representa rendimento garantido para todo o prazo. O prêmio interno é proposta de triagem.',
   'Teto é da aquisição, manutenção e revenda do imóvel. Direitos de desenvolvimento e retorno de um empreendimento exigem o wizard de produto e análise própria.'];
  if(!capitalFresh&&!capitalOverride)notes.push('A captura do benchmark venceu o protocolo de sete dias; atualizar capital antes de usar a taxa como referência contemporânea.');
  const envelope={schemaVersion:1,version:PRELIMINARY_ADVISORY_VERSION,policyVersion:policy.version,policySha256:hash(policy),studySlug:study.slug,baseDate:a.baseDate,
   authority:'public_preliminary_working_hypothesis',adoptedMarketValueBrl:null,investmentApproved:false,landValuation,businessValuation,valuation,assumptions:a,rateConstruction,sources,notes};
  if(valuation.centralBrl===null)return {...envelope,status:'insufficient_evidence',ceilings:{projectBrl:null,equityBrl:null,effectiveBrl:null},recommendedPriceBrl:null,base:null,referenceCase:null,
   decision:{state:'collect_evidence',label:'Coletar referências antes de precificar',reason:'A base externa selecionada não foi isolada/qualificada. Escolher conscientemente outra base disponível ou completar as referências antes de simular compra.',gates},charts:{marketRows:[],rates:[],costs:[],heatmap:[],horizons:[],stresses:[]}};
  const ceilings=solveCeilings(a,valuation,policy),recommendedPriceBrl=cents(ceilings.effectiveBrl*(1-a.safetyMarginPct/100));
  const scenarioPrice=a.offeredPriceBrl??(recommendedPriceBrl>0?recommendedPriceBrl:.01),q=quote(scenarioPrice,a,valuation,policy);
  const base=evaluateAcquisition(q.request,{sensitivity:false,ceilings:false}),referenceQuote=quote(valuation.centralBrl,a,valuation,policy),referenceCase=evaluateAcquisition(referenceQuote.request,{sensitivity:false,ceilings:false});
  if(base.status!=='exploratory'||referenceCase.status!=='exploratory')fail(base.diagnostics?.[0]?.message??referenceCase.diagnostics?.[0]?.message??'Cálculo canônico indisponível.');
  if(base.metrics.fundingGapBrl>0)gates.push({id:'cashflow_capacity',label:'Completar capacidade de aporte',state:'blocked',critical:true,action:'Comprovar o capital necessário para a exposição máxima do cenário antes de assumir a aquisição.'});
  const blocked=gates.some(g=>g.critical&&g.state==='blocked'),criticalPending=gates.some(g=>g.critical),positive=base.metrics.projectNpvBrl>0&&base.metrics.equityNpvBrl>0;
  let decision;
  if(ceilings.effectiveBrl<=0)decision={state:'no_purchase_capacity',label:'Sem capacidade econômica de compra',reason:'Preparação, carregamento e saída já consomem o valor presente antes de pagar a terra.'};
  else if(a.offeredPriceBrl!==null&&!positive)decision={state:'does_not_close',label:'Não fecha ao preço informado',reason:'O preço de teste ultrapassa a capacidade econômica com prazo, risco e custos selecionados. Negociar preço ou redesenhar condições.'};
  else if(a.offeredPriceBrl===null)decision={state:blocked?'resolve_and_negotiate':'capacity_estimated',label:blocked?'Resolver divergências e negociar com limite':'Capacidade de compra estimada',reason:'Preço recomendado é alvo de negociação derivado da hipótese; falta condição comercial confirmada para caracterizar uma boa oportunidade.'};
  else decision={state:criticalPending?'economically_conditional':'economic_hypothesis_positive',label:criticalPending?'Conta positiva; avanço condicionado':'Hipótese econômica favorável',reason:criticalPending?'VPL positivo ao preço informado, sujeito à qualificação de mercado e solução das diligências críticas.':'Preço informado sustenta a taxa proposta e custos selecionados; hipótese econômica não aprova aquisição.'};
  decision={...decision,gates,offeredPriceKnown:a.offeredPriceBrl!==null,scenarioPriceBrl:scenarioPrice,criticalPendingCount:gates.filter(g=>g.critical).length,
   referencePriceCloses:referenceCase.metrics.projectNpvBrl>0&&referenceCase.metrics.equityNpvBrl>0};
  const npv=(changes={},price=scenarioPrice)=>{const changed={...a,...changes};return presentValues(price,changed,valuation,policy).project;};
  const heatmap=[-4,-2,0,2,4].map(delta=>{
   const rate=Math.max(.01,a.projectAnnualPct+delta);
   return {label:`TMA ${rate.toFixed(2)}%`,values:[.8,.9,1,1.1,1.2].map(factor=>{
    const adjusted={...valuation,centralBrl:valuation.centralBrl*factor},ceilingBrl=solveCeilings({...a,projectAnnualPct:rate,equityAnnualPct:rate},adjusted,policy).effectiveBrl;
    return {x:factor===1?'Base':`${factor<1?'−':'+'}${Math.round(Math.abs(factor-1)*100)}%`,y:ceilingBrl/1e6,ceilingBrl};})};
  });
  const horizons=[...new Set([12,24,36,48,60,a.exitMonth])].sort((x,y)=>x-y).map(months=>({months,ceilingBrl:solveCeilings({...a,exitMonth:months},valuation,policy).effectiveBrl}));
  const stresses=[{label:'Preço de compra +10%',npvBrl:npv({},scenarioPrice*1.1)},
   {label:'Saída −10%',npvBrl:presentValues(scenarioPrice,a,{...valuation,centralBrl:valuation.centralBrl*.9},policy).project},
   {label:'Carregamento +20%',npvBrl:npv({carryingMonthlyBrl:a.carryingMonthlyBrl*1.2})},
   {label:'Preparação +25%',npvBrl:npv({preparationBudgetBrl:a.preparationBudgetBrl*1.25})},
   {label:'Saída +6 meses',npvBrl:npv({exitMonth:Math.min(240,a.exitMonth+6)})},
   {label:'Atratividade +2 p.p.',npvBrl:npv({projectAnnualPct:a.projectAnnualPct+2,equityAnnualPct:a.equityAnnualPct+2})}].map(r=>({...r,npvBrl:cents(r.npvBrl),basis:'project_unlevered_npv_deterministic_stress_not_probability'}));
  const costs=[['Compra',scenarioPrice],['ITBI',q.costBreakdown.itbiBrl],['Cartório',q.costBreakdown.notaryBrl],['Diligência',a.diligenceBudgetBrl],['Preparação',a.preparationBudgetBrl],['Carregamento',q.costBreakdown.carryingBrl],['Comissão de saída',q.costBreakdown.commissionBrl],['Reserva sobre ganho',q.costBreakdown.exitTaxReserveBrl],['Juros da dívida',base.costs.interest]].map(([label,brl])=>({label,brl}));
  return {...envelope,status:'exploratory',ceilings,recommendedPriceBrl,base,referenceCase,costBreakdown:q.costBreakdown,referenceCostBreakdown:referenceQuote.costBreakdown,decision,
   charts:{marketRows:valuation.selectedRows,rates:[{label:capitalOverride?'Benchmark editado':capitalFresh?'Selic · referência':'Benchmark capturado · atualizar',pct:a.benchmarkAnnualPct},{label:'Prêmio de risco proposto',pct:a.riskPremiumPp}],costs,heatmap,heatmapUnit:'purchase_ceiling_BRL_millions',horizons,stresses},
   inputSha256:hash({studySlug:study.slug,valuation,assumptions:a,policyVersion:policy.version}),calculationScope:'Acquisition and resale using the explicitly selected external land/property basis; no automatic real estate development or SPE valuation.'};
 }catch(error){return {schemaVersion:1,version:PRELIMINARY_ADVISORY_VERSION,status:'invalid',authority:'missing',adoptedMarketValueBrl:null,investmentApproved:false,valuation:null,assumptions:null,base:null,referenceCase:null,diagnostics:[{code:error.code??'PRELIMINARY_ERROR',message:error.message}]};}
}
