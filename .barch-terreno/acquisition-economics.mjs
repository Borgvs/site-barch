/** MPBRC-034 / MPBRC-083. Preliminary land acquisition, not product feasibility.
 * The market engine and financial primitives remain canonical and pinned.
 * All rates here are proposals; no tax, market value or envelope is inferred. */
import {createHash} from 'node:crypto';
import {LAND_OPPORTUNITY_POLICY} from './land-opportunity-policy.mjs';
import {evaluateComparableMarket,evaluateMonthlyLedger,getEngineManifest} from './engine/adapter.mjs';
export const ACQUISITION_VERSION='land-acquisition-1.0.0';
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const stable=v=>Array.isArray(v)?v.map(stable):object(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const hash=v=>createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
const fail=(message,code='ACQUISITION_INPUT')=>{const e=new Error(message);e.code=code;throw e;};
const numeric=(v,name,min=0,max=1e12)=>{if(!finite(v)||v<min||v>max)fail(`${name}: valor explícito entre ${min} e ${max} obrigatório.`);return v;};
const text=(v,max=1000)=>typeof v==='string'?v.trim().slice(0,max):'';
const validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v??'')&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
export const RISK_STAGES=[
 ['sovereign','Título soberano de referência'],['leased_stabilized','Imóvel pronto e locado'],
 ['stabilized_vacancy','Imóvel estabilizado com vacância'],['retrofit','Retrofit'],['built_to_suit','Built-to-suit'],
 ['preleased_development','Desenvolvimento com pré-locação'],['residential_development','Incorporação residencial'],
 ['speculative_development','Desenvolvimento especulativo'],['unapproved_land','Terreno sem aprovação'],
 ['speculative_land_bank','Land banking especulativo'],
].map(([id,label],i)=>({id,label,referenceOrder:i+1,automaticRiskPremiumPct:null}));

/** CAPM/WACC arithmetic is an explicitly identified extension, not Carta data
 * or a calibrated market rate. It cannot authenticate the proposed sources. */
export function constructCapitalRates(p){
 if(!object(p)||!['manual','capm'].includes(p.method))fail('Declare o método de construção da taxa.');
 if(!['nominal','real'].includes(p.moneyBasis)||p.currency!=='BRL')fail('Declare BRL e natureza nominal ou real.');
 if(!text(p.rationale)||text(p.rationale).length<20)fail('Justifique as taxas, prazo, risco e origem em pelo menos 20 caracteres.');
 const benchmarkAnnualPct=numeric(p.benchmarkAnnualPct,'Alternativa de oportunidade',0,1000);
 const horizonMonths=numeric(p.horizonMonths,'Prazo de referência',1,240);
 if(!Number.isSafeInteger(horizonMonths))fail('Prazo deve ser inteiro.');
 let keAnnualPct,waccAnnualPct,components;
 if(p.method==='manual'){
  keAnnualPct=numeric(p.equityAnnualPct,'TMA do capital próprio',0.001,1000);
  waccAnnualPct=numeric(p.projectAnnualPct,'TMA do ativo',0.001,1000);
  components={method:'manual',projectRateNature:'declared_hurdle_not_inferred_wacc'};
 }else{
  const rf=numeric(p.riskFreeAnnualPct,'Taxa base',0,1000),beta=numeric(p.beta,'Beta',0,10),erp=numeric(p.erpAnnualPct,'Prêmio de mercado',0,100);
  const residual=numeric(p.residualPremiumPct,'Prêmio residual declarado',0,100);
  const debtWeightPct=numeric(p.debtWeightPct,'Peso alvo da dívida',0,100),kd=numeric(p.debtAnnualPct,'Custo da dívida',0,1000);
  if(!['adjusted_risk_free','sovereign_proxy'].includes(p.baseKind))fail('Qualifique a taxa base: livre de risco ajustada ou proxy soberana.');
  if(p.baseKind==='sovereign_proxy'&&p.countryRiskAdded===true)fail('Proxy soberana já contém risco: reconciliar dupla contagem de país.');
  if(p.taxShieldPct!==0)fail('Benefício fiscal da dívida não adotado neste ensaio; use zero explícito ou modelo fiscal homologado.');
  if(!text(p.betaSource)||!text(p.erpSource)||!text(p.baseSource))fail('CAPM exige referências da taxa base, beta e prêmio.');
  if(p.structurePolicy!=='constant_target')fail('WACC requer hipótese explícita de estrutura alvo constante.');
  keAnnualPct=rf+beta*erp+residual;
  waccAnnualPct=keAnnualPct*(1-debtWeightPct/100)+kd*debtWeightPct/100;
  if(keAnnualPct<=0||waccAnnualPct<=0)fail('TMA positiva necessária; componentes nulos não demonstram custo do capital.');
  components={method:'capm_extension_candidate',rf,beta,erp,residual,debtWeightPct,kd,taxShieldPct:0,structurePolicy:'constant_target',baseKind:p.baseKind,
   baseSource:text(p.baseSource),betaSource:text(p.betaSource),erpSource:text(p.erpSource),countryRiskAdded:false};
 }
 const strategicAnnualPct=p.strategicAnnualPct==null?null:numeric(p.strategicAnnualPct,'Hurdle estratégico',0,1000);
 return {currency:'BRL',moneyBasis:p.moneyBasis,benchmarkAnnualPct,keAnnualPct,waccAnnualPct,strategicAnnualPct,horizonMonths,components,
  authority:'declared_proposal',rationale:text(p.rationale),sourcesVerified:false};
}

export function normalizeAcquisitionRequest(body){
 if(!object(body)||Object.keys(body).some(k=>!['schemaVersion','baseDate','moneyBasis','acquisitionPriceBrl','acquisitionCostsBrl','carryingMonthlyBrl','exitGrossBrl','exitCostsBrl','exitMonth','debtPct','debtAnnualPct','availableEquityBrl','rates','rationale','riskStage','synthetic'].includes(k)))fail('Contrato de aquisição inválido ou contém campo desconhecido.');
 if(body.synthetic!==undefined&&typeof body.synthetic!=='boolean')fail('Indicador sintético deve ser booleano explícito.');
 if(body.schemaVersion!==1||!validDate(body.baseDate))fail('Informe versão e data-base calendárica válidas.');
 if(!['nominal','real'].includes(body.moneyBasis))fail('Natureza dos fluxos obrigatória.');
 const request={schemaVersion:1,baseDate:body.baseDate,moneyBasis:body.moneyBasis,
  acquisitionPriceBrl:numeric(body.acquisitionPriceBrl,'Preço de aquisição',0.01),
  acquisitionCostsBrl:numeric(body.acquisitionCostsBrl,'Custos de aquisição, tributos e registros'),
  carryingMonthlyBrl:numeric(body.carryingMonthlyBrl,'Carregamento mensal'),
  exitGrossBrl:numeric(body.exitGrossBrl,'Valor bruto de saída',0.01),
  exitCostsBrl:numeric(body.exitCostsBrl,'Custos e tributos da saída'),
  exitMonth:numeric(body.exitMonth,'Mês da saída',1,240),debtPct:numeric(body.debtPct,'Dívida sobre compra',0,90),
  debtAnnualPct:numeric(body.debtAnnualPct,'Custo anual da dívida',0,1000),
  availableEquityBrl:body.availableEquityBrl==null?null:numeric(body.availableEquityBrl,'Capital disponível'),
  riskStage:body.riskStage??'unapproved_land',synthetic:body.synthetic===true,rationale:text(body.rationale)};
 if(!Number.isSafeInteger(request.exitMonth))fail('Prazo de saída deve ser inteiro.');
 if(!RISK_STAGES.some(s=>s.id===request.riskStage))fail('Estágio de risco inválido.');
 if(request.rationale.length<20)fail('Declare a origem dos preços, custos, saída e impostos em pelo menos 20 caracteres.');
 if(body.moneyBasis==='real'&&request.debtPct>0)fail('Dívida nominal exige calendário e deflação próprios; ensaio real permite apenas aquisição sem dívida.');
 const rates=constructCapitalRates(body.rates);
 if(rates.moneyBasis!==request.moneyBasis||rates.horizonMonths!==request.exitMonth)fail('Taxa e fluxo devem coincidir em moeda, natureza e prazo.');
 if(request.debtPct===0&&Math.abs(rates.waccAnnualPct-rates.keAnnualPct)>1e-9)fail('Sem dívida, a taxa do ativo e a do equity devem coincidir neste ensaio.');
 if(rates.components.method==='capm_extension_candidate'&&Math.abs(rates.components.kd-request.debtAnnualPct)>1e-9&&request.debtPct>0)fail('Custo da dívida diverge entre WACC e fluxo.');
 return {...request,rates};
}
export function acquisitionLedger(request){
 const n=request.exitMonth,debt=request.acquisitionPriceBrl*request.debtPct/100;
 const monthly=(1+request.debtAnnualPct/100)**(1/12)-1;
 const rows=Array.from({length:n+1},(_,month)=>{
  const acquisitionBrl=month===0?request.acquisitionPriceBrl:0,acquisitionCostsBrl=month===0?request.acquisitionCostsBrl:0;
  const carryingBrl=month>0?request.carryingMonthlyBrl:0,exitGrossBrl=month===n?request.exitGrossBrl:0,exitCostsBrl=month===n?request.exitCostsBrl:0;
  const projectBrl=exitGrossBrl-acquisitionBrl-acquisitionCostsBrl-carryingBrl-exitCostsBrl;
  const debtDrawBrl=month===0?debt:0,interestBrl=month>0?debt*monthly:0,principalBrl=month===n?debt:0;
  const equityBrl=projectBrl+debtDrawBrl-interestBrl-principalBrl;
  return {month,projectBrl,equityBrl,acquisitionBrl,acquisitionCostsBrl,carryingBrl,exitGrossBrl,exitCostsBrl,debtDrawBrl,interestBrl,principalBrl,
   contributionsBrl:Math.max(0,-equityBrl),distributionsBrl:Math.max(0,equityBrl)};
 });
 let cumProject=0,cumEquity=0;
 for(const row of rows){cumProject+=row.projectBrl;cumEquity+=row.equityBrl;row.cumulativeProjectBrl=cumProject;row.cumulativeEquityBrl=cumEquity;}
 return rows;
}
const sum=(rows,key)=>rows.reduce((s,r)=>s+r[key],0);
function valueOnly(request,key='projectBrl',rate=request.rates.waccAnnualPct){
 // NPV is evaluated by the pinned primitive; the wrapper also computes IRR,
 // so a sensitivity grid is deliberately small and bounded.
 const rows=acquisitionLedger(request);return evaluateMonthlyLedger({cashflow:rows.map(r=>r[key]),discountRateAnnualPct:rate}).npvBrl;
}
function acquisitionCeiling(request,key,rate){
 const zero={...request,acquisitionPriceBrl:0},initial=valueOnly(zero,key,rate);
 if(initial<0)return {status:'no_positive_capacity',priceBrl:null,reason:'Custos de carregar/sair já excedem a saída descontada, antes de pagar a terra.'};
 // Ledger is linear in acquisition, proportional debt and constant declared
 // rates. Two canonical NPV evaluations determine that coefficient exactly.
 const step=Math.max(1,request.acquisitionPriceBrl,request.exitGrossBrl);
 const slope=(valueOnly({...request,acquisitionPriceBrl:step},key,rate)-initial)/step;
 if(!(slope<0))return {status:'not_identified',priceBrl:null};
 const candidate=-initial/slope;
 if(!finite(candidate)||candidate>1e12)return {status:'outside_scope',priceBrl:null};
 const check=valueOnly({...request,acquisitionPriceBrl:candidate},key,rate);
 return {status:Math.abs(check)<=Math.max(0.01,request.exitGrossBrl*1e-10)?'solved':'not_converged',priceBrl:candidate,npvAtCeilingBrl:check,
  scope:'Preço teto da aquisição/manutenção/saída declarada; não é valor de mercado e não é residual de incorporação.'};
}
export function evaluateAcquisition(body,{sensitivity=true,ceilings=true}={}){
 try{
  const r=normalizeAcquisitionRequest(body),rows=acquisitionLedger(r);
  const project=evaluateMonthlyLedger({cashflow:rows.map(x=>x.projectBrl),discountRateAnnualPct:r.rates.waccAnnualPct});
  const equity=evaluateMonthlyLedger({cashflow:rows.map(x=>x.equityBrl),discountRateAnnualPct:r.rates.keAnnualPct});
  const contributionsBrl=sum(rows,'contributionsBrl'),distributionsBrl=sum(rows,'distributionsBrl');
  const peakEquityBrl=Math.max(0,...rows.map(x=>-x.cumulativeEquityBrl)),fundingGapBrl=r.availableEquityBrl==null?null:Math.max(0,peakEquityBrl-r.availableEquityBrl);
  const netProfitProjectBrl=sum(rows,'projectBrl'),profitEquityBrl=sum(rows,'equityBrl');
  const benchmarks=evaluateMonthlyLedger({cashflow:rows.map(x=>x.equityBrl),discountRateAnnualPct:r.rates.benchmarkAnnualPct});
  const strategicNpvBrl=r.rates.strategicAnnualPct==null?null:evaluateMonthlyLedger({cashflow:rows.map(x=>x.equityBrl),discountRateAnnualPct:r.rates.strategicAnnualPct}).npvBrl;
  const metrics={projectNpvBrl:project.npvBrl,equityNpvBrl:equity.npvBrl,projectIrrAnnualPct:project.irrAnnualPct,equityIrrAnnualPct:equity.irrAnnualPct,
   projectTmaAnnualPct:r.rates.waccAnnualPct,equityTmaAnnualPct:r.rates.keAnnualPct,
   projectSpreadPp:project.irrAnnualPct==null?null:project.irrAnnualPct-r.rates.waccAnnualPct,equitySpreadPp:equity.irrAnnualPct==null?null:equity.irrAnnualPct-r.rates.keAnnualPct,
   moic:contributionsBrl>0?distributionsBrl/contributionsBrl:null,paybackMonth:equity.paybackMonth,
   discountedPaybackMonth:evaluateMonthlyLedger({cashflow:rows.map(x=>x.equityBrl/(1+equity.discountMonthly)**x.month),discountRateAnnualPct:0}).paybackMonth,
   marginProjectPct:netProfitProjectBrl/r.exitGrossBrl*100,peakEquityBrl,fundingGapBrl,contributionsBrl,distributionsBrl,netProfitProjectBrl,profitEquityBrl,
   benchmarkNpvBrl:benchmarks.npvBrl,strategicNpvBrl};
  const costs={acquisition:r.acquisitionPriceBrl,entryCosts:r.acquisitionCostsBrl,carrying:r.carryingMonthlyBrl*r.exitMonth,exitCosts:r.exitCostsBrl,interest:sum(rows,'interestBrl')};
  const tests=sensitivity?[
   ['Saída −10%',{exitGrossBrl:r.exitGrossBrl*.9}],['Saída +10%',{exitGrossBrl:r.exitGrossBrl*1.1}],
   ['Carregamento +20%',{carryingMonthlyBrl:r.carryingMonthlyBrl*1.2}],['Custos de saída +20%',{exitCostsBrl:r.exitCostsBrl*1.2}],
   [`Saída +${Math.min(6,240-r.exitMonth)} meses`,{exitMonth:Math.min(240,r.exitMonth+6)}],['TMA +2 p.p.',{rates:{...r.rates,waccAnnualPct:r.rates.waccAnnualPct+2,keAnnualPct:r.rates.keAnnualPct+2}}],
   ['Dívida +2 p.p.',{debtAnnualPct:r.debtAnnualPct+2}],
  ].map(([label,changes])=>{const changed={...r,...changes};return {label,projectNpvBrl:valueOnly(changed),equityNpvBrl:valueOnly(changed,'equityBrl',changed.rates.keAnnualPct),basis:'declared_stress_not_probability'};}):[];
  const grid=sensitivity?[-.1,0,.1].map(exitChange=>({label:`Saída ${exitChange>=0?'+':''}${Math.round(exitChange*100)}%`,points:[0,6,12].map(delay=>({delayMonths:Math.min(delay,240-r.exitMonth),requestedDelayMonths:delay,actualExitMonth:Math.min(240,r.exitMonth+delay),npvBrl:valueOnly({...r,exitGrossBrl:r.exitGrossBrl*(1+exitChange),exitMonth:Math.min(240,r.exitMonth+delay)})}))})):[];
  return {schemaVersion:1,version:ACQUISITION_VERSION,status:'exploratory',authority:'working_assumption',adoptedMarketValueBrl:null,investmentApproved:false,
   input:r,inputSha256:hash(r),engine:{version:project.engineVersion,financialArtifactSha256:project.primitiveArtifactSha256},rows,metrics,costs,
   ceilings:ceilings?{project:acquisitionCeiling(r,'projectBrl',r.rates.waccAnnualPct),equity:acquisitionCeiling(r,'equityBrl',r.rates.keAnnualPct)}:null,sensitivity:tests,grid,
   rateConstruction:r.rates,diagnostics:[{code:'DECLARED_ACQUISITION_SCENARIO',message:'Aquisição, carregamento e saída da terra; não dimensiona um produto nem aprova preço, financiamento ou investimento.'},
    {code:'TAX_COSTS_DECLARED',message:'Custos tributários são valores declarados nos períodos de entrada/saída. Não aplica RET, IBS/CBS ou benefício fiscal por padrão.'},
    ...(r.debtPct>0?[{code:'BALLOON_DEBT_APPROXIMATION',message:'Dívida de ensaio: saque na compra, juros mensais pagos e principal integral na saída, sem benefício fiscal. WACC usa estrutura alvo declarada, aproximada quando dívida muda de peso.'}]:[]),
    ...(project.irrReason?[{code:'PROJECT_IRR_UNDEFINED',message:project.irrReason}]:[]),...(equity.irrReason?[{code:'EQUITY_IRR_UNDEFINED',message:equity.irrReason}]:[])],
   recommendation:metrics.projectNpvBrl>0&&metrics.equityNpvBrl>0?'economic_hypothesis_positive':'economic_hypothesis_not_positive'};
 }catch(e){return {schemaVersion:1,version:ACQUISITION_VERSION,status:'invalid',authority:'missing',metrics:null,adoptedMarketValueBrl:null,investmentApproved:false,diagnostics:[{code:e.code??'ACQUISITION_ERROR',message:e.message}]};}
}

/** Common land-evidence projection, offers/transfers/subject signals segregated.
 * Values stay descriptive until the governed canonical comparable DTO exists. */
export function landEvidenceRows(study){
 const rows=[];const add=row=>{if(finite(row.priceBrl)&&row.priceBrl>0&&finite(row.areaM2)&&row.areaM2>0)rows.push({...row,unitPriceBrl:row.priceBrl/row.areaM2,authority:'context_not_adopted',eligibleForValuation:false});};
 const m=study.qualifiedMarket;
 for(const x of m?.landOffers??[])add({id:x.id,label:x.name,kind:'asking_price',priceBrl:x.price,areaM2:x.areaM2,date:m.curatedAt,observedOn:m.sources?.find(s=>s.id===x.sources?.[0])?.dataDate??null,sourceUrl:m.sources?.find(s=>s.id===x.sources?.[0])?.url??null,sourceId:x.independence??x.sources?.[0],excluded:x.status==='excluido',reason:x.limit,areaBasis:x.areaBasis});
 for(const [i,x] of (m?.landTransactions??[]).entries())add({id:x.sql??'transaction-'+i,label:x.address,kind:'declared_transfer',priceBrl:x.price,areaM2:x.areaM2,date:x.date,observedOn:x.date,sourceId:x.sourceId,sourceUrl:m.sources?.find(s=>s.id===x.sourceId)?.url??null,excluded:false,reason:x.fit,areaBasis:x.areaBasis});
 for(const x of study.operationalMarket?.landOffers??[])add({id:x.id,label:x.title,kind:'asking_price',priceBrl:x.priceBrl,areaM2:x.landAreaM2,date:x.date,observedOn:x.publisherDate,sourceId:x.publisher??x.sourceId,sourceUrl:x.sourceUrl,excluded:false,reason:(x.caveats??[]).join(' '),areaBasis:'terreno anunciado; benfeitorias/área útil a conciliar'});
 for(const [i,x] of (study.subdivisionReview?.market?.offers??study.subdivisionMarket?.offers??[]).entries()){
  if(x.group==='land'||x.kind==='gleba'||x.type==='gleba'||x.kind==='land')add({id:x.id??'parcel-offer-'+i,label:x.title??x.name,kind:'asking_price',priceBrl:x.priceBrl??x.price,areaM2:x.landAreaM2??x.areaM2,date:x.retrievedAt?.slice(0,10)??x.observedAt??x.date,observedOn:x.date??null,sourceId:x.publisher??x.sourceId??x.url,sourceUrl:x.url,excluded:x.excluded===true,reason:x.limit??x.note??'',areaBasis:'área declarada na oferta'});
 }
 return rows;
}
export function summarizeLandValue(study,{canonicalInput=null}={}){
 const rows=landEvidenceRows(study),eligible=rows.filter(x=>!x.excluded),offers=eligible.filter(x=>x.kind==='asking_price'),transfers=eligible.filter(x=>x.kind==='declared_transfer');
 const descriptive=group=>group.length?{n:group.length,minUnitBrl:Math.min(...group.map(x=>x.unitPriceBrl)),maxUnitBrl:Math.max(...group.map(x=>x.unitPriceBrl)),scope:'Faixa descritiva dos ativos distintos anunciados/declarados, sem inferir valor deste terreno.'}:{n:0,minUnitBrl:null,maxUnitBrl:null};
 const canonical=canonicalInput?evaluateComparableMarket(canonicalInput):null;
 // Receipt validation alone is not publication/adoption authority. Three sources
 // are also required by MPBRC-034; never relabel diagnostic quantiles as an IC.
 const sufficient=canonical?.result?.state==='ready'&&canonical.result.independentSourceCount>=3;
 return {status:sufficient?'candidate_for_governed_review':'insufficient_evidence',adoptedMarketValueBrl:null,rows,offers:descriptive(offers),transfers:descriptive(transfers),
  currentMarketValueBrl:null,historicalValues:study.historicalValues??[],canonical,candidateBand:sufficient?{lowBrl:canonical.result.lowSubjectValueBrl,centralBrl:canonical.result.medianSubjectValueBrl,highBrl:canonical.result.highSubjectValueBrl,kind:'weighted_quantiles_not_confidence_interval'}:null,
  nextActions:['Conciliar identidade e denominador registral/cadastral do sujeito e das amostras.','Buscar comparáveis de terra compatíveis em porte, uso legal, restrições, benfeitorias e liquidez.','Validar transações, independência e atualidade; comprovar cada ajuste e atesto antes do motor canônico.','Reconciliar valor de mercado, preço negociado e teto da aquisição, conservando as três finalidades.'],
  method:'Comparação direta qualificada como primeira via. Residual/involutivo só em exploração secundária com produto, custo, prazo e TMA suficientes.',
  sha256:hash({rows,canonicalInput,historicalValues:study.historicalValues??[]})};
}

export const FACTOR_POLICY=LAND_OPPORTUNITY_POLICY.axes.flatMap(axis=>axis.factors.map(f=>({...f,axis:axis.id,axisLabel:axis.label,weight:axis.weightPct*f.sharePct/100})));
export function scoreOpportunity(factors){
 if(!Array.isArray(factors)||factors.length!==FACTOR_POLICY.length)fail('Matriz exige todos os fatores, inclusive desconhecidos.');
 const byId=new Map(factors.map(x=>[x.id,x]));if(byId.size!==factors.length)fail('Fatores duplicados.');
 let known=0,points=0;const blocked=[];
 const rows=FACTOR_POLICY.map(p=>{const x=byId.get(p.id);if(!x||!['unknown','favorable','conditional','adverse','blocked'].includes(x.state))fail('Estado de fator inválido.');
  const score={unknown:null,favorable:1,conditional:.5,adverse:0,blocked:0}[x.state];
  if(score!==null){if(!Array.isArray(x.evidenceIds)||!x.evidenceIds.length||x.evidenceIds.some(v=>typeof v!=='string'||!v.trim())||!text(x.reason))fail('Nota exige motivo e evidência, não é resposta declarativa.');known+=p.weight;points+=p.weight*score;}
  if(x.state==='blocked'&&p.critical)blocked.push(p.id);
  return {...p,state:x.state,scorePct:score==null?null:score*100,reason:text(x.reason),evidenceIds:x.evidenceIds??[],knownContributionPct:score==null?null:p.weight*score};});
 const lowerPct=points,upperPct=points+(100-known);
 return {policyVersion:'land-opportunity-score-'+LAND_OPPORTUNITY_POLICY.version,policySha256:hash(LAND_OPPORTUNITY_POLICY),authority:'internal_screening_policy_candidate',coveragePct:known,
  lowerPct,upperPct,knownOnlyPct:known>0?points/known*100:null,provisionalCompletePct:Math.abs(known-100)<1e-9?points:null,pointEstimatePct:null,independentReviewRequired:true,
  criticalUnknown:rows.filter(x=>x.critical&&x.state==='unknown').map(x=>x.id),blockingFactors:blocked,
  state:blocked.length?'blocked':known<100?'incomplete':'screened',probabilityOfSuccessPct:null,investmentApproved:false,
  rows,interpretation:'Índice ordinal de pré-qualificação. Limites refletem dados desconhecidos, não intervalo estatístico. 50% em condição é política de triagem explícita; não certifica regularidade nem acrescenta prêmio à TMA.'};
}
export function buildOpportunityMatrix({study,value,territorial,economicResult=null}){
 const checks=study.assessment?.regulatory?.axes??[];
 const factors=FACTOR_POLICY.map(p=>({id:p.id,state:'unknown',reason:'Base ainda não suficiente para qualificar este fator.',evidenceIds:[]}));
 const set=(id,state,reason,evidence)=>Object.assign(factors.find(x=>x.id===id),{state,reason,evidenceIds:evidence});
 // Normative identity_geometry covers documentary reconciliation, never proves
 // clear title or legal access. Those two factors remain independently unknown.
 if(study.assessment?.state==='screening_current'){
  const aliases={object_match:['identity_geometry'],geometry_reconciliation:['identity_geometry','public_constraints'],
   legal_access:['public_constraints'],normative_currency:['zoning_regime','rural_transition','licensing_execution'],
   admissible_uses:['zoning_regime','rural_transition','licensing_execution'],
   environmental_constraints:['environmental_water','geotechnical'],terrain_water_soil:['geotechnical','environmental_water'],serviceability:['infrastructure']};
  for(const [id,keys] of Object.entries(aliases)){
   const list=checks.filter(a=>keys.includes(a.id??a.axis));
   if(list.some(a=>a.state==='blocked'))set(id,'blocked','Contradição ou impedimento material requer resolução antes da aquisição.',list.map(x=>x.id));
   else if(id!=='legal_access'&&list.some(a=>['supported','partial'].includes(a.state)))set(id,'conditional','Há evidências e condicionantes; a triagem não demonstra liberação integral.',list.map(x=>x.id));
  }
 }
 if(territorial?.blockers?.length&&factors.find(x=>x.id==='normative_currency').state==='unknown')factors.find(x=>x.id==='normative_currency').reason='Protocolo territorial crítico ainda requer bases ou conciliação.';
 if(study.assessment?.state==='screening_current'&&value?.candidateBand){
  set('comparables_quality','conditional','Amostra candidata do motor, pendente de revisão e adoção governada.',[value.sha256]);
  set('adjustments_defensible','conditional','Ajustes candidatos; evidência e faixa ainda dependem de atesto independente.',[value.sha256]);
 }
 if(study.assessment?.state==='screening_current'&&economicResult?.status==='exploratory'&&!economicResult.input.synthetic){
  const positive=economicResult.metrics.equityNpvBrl>0&&economicResult.metrics.projectNpvBrl>0;
  set('all_in_cost','conditional','Preço e custos declarados no ensaio; falta atesto documental de completude.',[economicResult.inputSha256]);
  set('capital_benchmark',positive?'conditional':'adverse','Taxa e VPL de hipótese declarada; evidências de capital e saída requerem validação.',[economicResult.inputSha256]);
  if(economicResult.metrics.fundingGapBrl!=null)set('cashflow_capacity',economicResult.metrics.fundingGapBrl>0?'blocked':'conditional','Capacidade declarada confrontada com a exposição; não comprova compromisso de aporte.',[economicResult.inputSha256]);
  if(economicResult.sensitivity?.length)set('adverse_resilience',economicResult.sensitivity.every(x=>x.equityNpvBrl>0&&x.projectNpvBrl>0)?'conditional':'adverse','Sensibilidade explícita de preço, prazo, custos e taxa; não representa probabilidade.',[economicResult.inputSha256]);
 }
 return scoreOpportunity(factors);
}
export function acquisitionEngineManifest(){return {version:ACQUISITION_VERSION,pinnedEngine:getEngineManifest(),scope:'Extensão de aquisição de terreno e taxa declarada; não modifica o motor financeiro do produto.'};}
