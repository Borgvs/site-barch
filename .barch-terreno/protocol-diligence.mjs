/** MPBRC-083/085: read-only orchestration of existing evidence, never a second
 * normative, valuation, financial or clearance owner. Public DTO by allowlist. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {assessTemporalCurrency,evidenceTimestamp} from './temporal.mjs';

export const DILIGENCE_PROTOCOL_VERSION='areas-diligence-multimodal-1.0.0';
export const DEFAULT_DILIGENCE_POLICY=JSON.parse(readFileSync(new URL('./diligence-policy.json',import.meta.url),'utf8'));
const list=v=>Array.isArray(v)?v:[];
const id=v=>typeof v==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(v)?v:null;
const validHash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonical(v[k])])):v;
export const diligenceHash=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const knownStates=['supported','partial','blocked','sem_base','not_applicable'];
const safeState=v=>knownStates.includes(v)?v:'sem_base';
const officialHost=h=>h==='gov.br'||h.endsWith('.gov.br')||h.endsWith('.jus.br')||h==='aga.decea.mil.br';
export function diligenceSourceUrl(value,{allowProvider=false}={}){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.hash||!officialHost(u.hostname)&&!(allowProvider&&u.hostname==='api.escavador.com'))return null;
  if([...u.searchParams.keys()].some(k=>/token|key|auth|secret|cpf|cnpj|nome|owner|signature/i.test(k)))return null;return u.href;
 }catch{return null;}
}
function validatePolicy(p){
 if(p?.schemaVersion!==1||p.protocolVersion!==DILIGENCE_PROTOCOL_VERSION||p.normativePublicationAllowed!==false||p.investmentApprovalAllowed!==false||!Array.isArray(p.fronts)||p.fronts.length>64||!Array.isArray(p.sources)||!Array.isArray(p.roles)||new Set(p.fronts.map(f=>f.id)).size!==p.fronts.length)throw new TypeError('Política de diligência inválida.');
 const sources=new Set(p.sources.map(s=>s.id)),roles=new Set(p.roles.map(r=>r.id));
 if(sources.size!==p.sources.length||roles.size!==p.roles.length)throw new TypeError('IDs repetidos na política.');
 for(const s of p.sources)if(!id(s.id)||!diligenceSourceUrl(s.url,{allowProvider:s.id==='escavador'}))throw new TypeError('Fonte primária/fornecedor fora do contrato.');
 for(const f of p.fronts)if(!id(f.id)||!roles.has(f.role)||!Array.isArray(f.checks)||f.checks.some(c=>!id(c.id))||new Set(f.checks.map(c=>c.id)).size!==f.checks.length||f.sourceIds.some(s=>!sources.has(s)))throw new TypeError('Frente ou verificação fora do contrato.');
 return p;
}
function applicability(front,regime){
 if(front.applicability==='all')return {state:'applicable',reason:'Triagem do imóvel, independentemente de programa.'};
 if(front.applicability==='rural_or_transition')return regime==='rural'||regime==='transition'?{state:'applicable',reason:'Área rural ou transição declarada; cadastro e destinação exigem reconciliação.'}:{state:'conditional',reason:'Conferir origem e remanescente rural; rótulo urbano não encerra CCIR/CAR/RL.'};
 if(front.applicability==='urban_or_transition')return regime==='rural'?{state:'conditional',reason:'Caracterizar a vizinhança; exigência formal de EIV depende de operação urbana e norma municipal.'}:{state:'applicable',reason:'Vizinhança urbana/transição; critérios municipais e programa continuam a qualificar.'};
 throw new TypeError('Regra de aplicabilidade desconhecida.');
}
const regimeOf=v=>['rural'].includes(v)?'rural':['periurbano','transicao','cross_regime','rural_em_transicao'].includes(v)?'transition':['urbano','urban'].includes(v)?'urban':'unknown';
const statusMap={ 'verificado-fonte':'supported','indicio':'partial','encontrado':'partial','sem-resultados-na-consulta':'partial','nao-aplicavel':'not_applicable','divergente':'blocked','sem-cobertura':'sem_base','restrito':'sem_base','dado-necessario':'sem_base','falha-temporaria':'sem_base'};
const aggregate=states=>states.includes('blocked')?'blocked':states.length&&states.every(s=>s==='not_applicable')?'not_applicable':states.length&&states.every(s=>s==='supported'||s==='not_applicable')?'supported':states.some(s=>s==='supported'||s==='partial')?'partial':'sem_base';
function evidenceProjection(c){
 const raw=c.source??{};return {id:id(c.id),state:statusMap[c.status]??'sem_base',source:{url:diligenceSourceUrl(raw.url),sha256:validHash(raw.sha256)?raw.sha256:null,checkedAt:evidenceTimestamp(raw.at??raw.retrievedAt)!==null?(raw.at??raw.retrievedAt):null},scope:'Consulta delimitada; integridade e descoberta não são liberação do imóvel.'};
}

/** All conclusions originate in supplied canonical assessment/receipt/valuation.
 * An axis marked supported does not assert every new check has been performed. */
export function buildDiligenceProtocol({study,assessment=study?.assessment,verification=assessment?.verification,landValuation=null,policy=DEFAULT_DILIGENCE_POLICY,now=new Date().toISOString()}={}){
 validatePolicy(policy);
 if(!id(study?.slug)||evidenceTimestamp(now)===null)throw new TypeError('Slug e relógio válidos são obrigatórios.');
 if(assessment?.slug!=null&&assessment.slug!==study.slug||verification?.studySlug!=null&&verification.studySlug!==study.slug||landValuation?.subject?.slug!=null&&landValuation.subject.slug!==study.slug)throw new TypeError('Dados de outro terreno não podem qualificar o lote atual.');
 const bound=verification?.studySlug===study.slug,
  currency=assessTemporalCurrency(verification?verification.at:assessment?.checkedAt,{now,maxAgeMs:policy.audit.maxReceiptAgeDays*86400000}),
  receiptCurrent=bound&&verification?.freshness?.status==='current'&&currency.status==='current',
  checks=receiptCurrent?list(verification?.checks):[],axes=list(assessment?.regulatory?.axes),regime=regimeOf(study.landContext),
  evidence=checks.filter(c=>id(c.id)).map(evidenceProjection),actions=[];
 const fronts=policy.fronts.map(front=>{
  const app=applicability(front,regime),inherited=axes.filter(a=>front.axisIds.includes(a.id)),axisState=aggregate(inherited.map(a=>safeState(a.state)));
  const selectedSources=policy.sources.filter(s=>front.sourceIds.includes(s.id)&&(s.jurisdiction==='BR'||s.jurisdiction===study.uf)).map(s=>({id:s.id,label:s.label,url:s.url,jurisdiction:s.jurisdiction,checkedAt:s.checkedAt,authority:s.id==='escavador'?'provider-documentation':'official-reference-for-curation',availability:s.availability,reuseSourceId:s.reuseSourceId??null}));
  const rows=front.checks.map(c=>{
   const matched=checks.filter(x=>list(c.verificationIds).includes(x.id)),projected=matched.map(evidenceProjection);
   let state=matched.length?aggregate(projected.map(x=>x.state)):axisState==='blocked'?'blocked':axisState==='supported'||axisState==='partial'?'partial':'sem_base';
   // A verified query requires a digest; an undelimited negative response remains partial.
   if(state==='supported'&&projected.some(x=>!x.source.sha256))state='partial';
   if(c.id==='app'&&state==='supported')state='partial'; // hydrological/physical/legal causes remain distinct
   if(front.id==='litigation'&&state==='not_applicable')state='partial';
   return {id:front.id+':'+c.id,label:c.label,state,modalities:c.modalities,sourceIds:selectedSources.map(s=>s.id),evidenceIds:matched.map(x=>x.id),impactChannels:front.impactChannels,priority:c.priority,exitEvidence:c.exitEvidence,remoteAction:c.remoteAction,fieldAction:c.fieldAction,specialistAction:c.specialistAction};
  });
  let state=aggregate(rows.map(x=>x.state));if(axisState==='blocked')state='blocked';
  if(front.id==='land_market'&&landValuation?.estimate?.centralBrl>0)state='partial'; // offer reference is not transaction/adoption
  const inheritedIds=inherited.flatMap(a=>list(a.actions)).map(a=>id(a.id)).filter(Boolean),open=rows.filter(c=>!['supported','not_applicable'].includes(c.state)),actionIds=[];
  if(open.length){
   const criteria=open.map(c=>({checkId:c.id,label:c.label,exitEvidence:c.exitEvidence}));
   const aid=front.id+':remote';actionIds.push(aid);actions.push({id:aid,frontId:front.id,canonicalActionIds:[...new Set(inheritedIds)],owner:'remote',priority:front.gates.length?'P0':'P1',label:'Consolidar '+front.label.toLowerCase()+' nas bases Barch e fontes primárias.',criteria,exitEvidence:criteria.map(c=>c.exitEvidence).join(' '),trigger:receiptCurrent?'Há verificações específicas ainda abertas.':'Revalidar recibos e bases antes de reutilizar a conclusão.',blockedBy:[],remoteFirst:true});
   if(!['land_market','business_economics','litigation','zoning_value','rural'].includes(front.id)){
    const fid=front.id+':field';actionIds.push(fid);actions.push({id:fid,frontId:front.id,canonicalActionIds:[],owner:'field',priority:'P1',label:'Vistoriar '+front.label.toLowerCase()+' com pauta e capturas georreferenciadas.',criteria,exitEvidence:'Ficha vinculada ao lote e versão; pontos/fachadas/360, direção, GPS e precisão, hora, fotos e observações; parecer pessoal separado de fatos.',trigger:'Validar em campo o que documento/cartografia não resolve; a pauta é preparada antes da visita.',blockedBy:[aid],remoteFirst:true});
   }
   const sid=front.id+':specialist';actionIds.push(sid);actions.push({id:sid,frontId:front.id,canonicalActionIds:[],owner:'specialist',priority:front.gates.length?'P0':'P1',label:'Resolver incidência e efeito de '+front.label.toLowerCase()+'.',criteria,exitEvidence:'Parecer, certidão, laudo ou ART/RRT conforme atribuição e questão; ato competente quando necessário. Orçamento/prazo só após escopo e evidência.',trigger:'Após pesquisa remota, resolver decisão técnica, exigência formal ou documento inacessível.',blockedBy:[aid],remoteFirst:true});
  }
  return {id:front.id,label:front.label,axisIds:front.axisIds,state,axisState,applicability:app,gates:front.gates,checks:rows,sources:selectedSources,actionIds,counts:Object.fromEntries(knownStates.map(s=>[s,rows.filter(c=>c.state===s).length])),impactChannels:front.impactChannels};
 });
 const gates=[...new Set(fronts.flatMap(f=>f.gates))].map(g=>({id:g,state:aggregate(fronts.filter(f=>f.gates.includes(g)).map(f=>f.state)),scope:'screening-only',frontIds:fronts.filter(f=>f.gates.includes(g)).map(f=>f.id),approved:false}));
 const counts=Object.fromEntries(knownStates.map(s=>[s,fronts.filter(f=>f.state===s).length])),agentPlan=policy.roles.map(r=>({id:r.id,label:r.label,dependsOn:r.dependsOn,frontIds:r.frontIds,allowedClaims:r.allowedClaims,reviewer:r.reviewer,status:'prepared',maxAttempts:2,requiresSeparateReviewer:r.reviewer,outputContract:'areas-diligence-agent-result-1.0.0'}));
 const view=(key,label)=>({id:key,label,frontIds:policy.views[key],scope:key==='business'?'Ensaio de uso/envelope e economia condicional; preço da terra permanece independente.':key==='land'?'Caracterização e preço do ativo, sem presumir produto.':'Resultados existentes e condições; não cria segunda avaliação.'});
 const result={schemaVersion:1,protocolVersion:DILIGENCE_PROTOCOL_VERSION,policyVersion:policy.version,slug:study.slug,checkedAt:now,state:counts.blocked?'blocked':receiptCurrent?'preliminary':'refresh_required',regime,fronts,actions,gates,counts,
  views:{diagnosis:view('diagnosis','Diagnóstico'),dashboard:view('dashboard','Dashboard'),land:view('land','Terreno'),business:view('business','Negócio')},
  agentPlan,ml:{state:'abstained',reason:'Nenhum artefato treinado e validado foi apresentado; infraestrutura auxiliar preparada.',families:policy.ml.allowedFamilies,canonicalPriceOwner:policy.owners.landPrice,canApproveInvestment:false,canReplaceCanonicalPrice:false},
  provenance:{assessmentState:assessment?.state??'absent',assessmentBasisHash:validHash(assessment?.basisHash)?assessment.basisHash:null,verificationId:id(verification?.id),verificationInputHash:validHash(verification?.inputSha256)?verification.inputSha256:null,receiptCurrent,currency:{status:currency.status,ageMs:currency.ageMs},policyHash:diligenceHash(policy),evidence},
  capabilities:{automatedProtocol:true,automaticPaidQueries:false,formalEiv:false,formalEiaRima:false,investmentReady:false,legalClearance:false,normativePublication:false},
  methodologicalNotes:['EIV e EIA/RIMA são trilhas distintas; a triagem alimenta escopo, não emite estudo formal aprovado.','APP, risco hídrico, contaminação e limitações construtivas não recebem desconto universal; efeitos físicos e custos exigem prova.','Carência de fonte, falha e busca negativa são estados próprios; não viram nada consta.','Parecer pessoal fica identificado, com autor/data e fundamento; não sobrescreve fatos.']};
 return {...result,basisHash:diligenceHash(result)};
}

/** Validate a provided artifact, never fabricate weights or train from the three
 * illustrative parcels. Approval metadata is checked structurally; signature and
 * dataset/weight byte verification are explicit callbacks at the execution gate. */
export function validateDiligenceModelArtifact(artifact,{policy=DEFAULT_DILIGENCE_POLICY,now=new Date().toISOString()}={}){
 const errors=[],m=policy.ml,a=artifact??{},assert=(condition,error)=>{if(!condition)errors.push(error);};
 assert(evidenceTimestamp(now)!==null,'clock-invalid');
 assert(a.schemaVersion===1&&id(a.id)&&typeof a.version==='string','identity-invalid');
 assert(m.allowedFamilies.includes(a.family),'family-unsupported');assert(m.allowedOutputKinds.includes(a.outputKind),'output-unsupported');
 assert(a.authority==='auxiliary-only'&&a.canReplaceCanonicalPrice===false&&a.canApproveInvestment===false,'authority-invalid');
 const {artifactSha256,...content}=a;assert(validHash(artifactSha256)&&artifactSha256===diligenceHash(content),'artifact-hash-invalid');
 assert(Buffer.byteLength(JSON.stringify(a))<=m.maxArtifactBytes,'artifact-too-large');
 assert(a.review?.status==='approved'&&id(a.review?.reviewerId)&&a.review.reviewerId!==a.trainerId&&validHash(a.review.approvalSha256),'independent-review-missing');
 assert(validHash(a.dataset?.sha256)&&validHash(a.weightsSha256),'dataset-or-weights-hash-missing');
 assert(Number.isSafeInteger(a.dataset?.uniqueAssets)&&a.dataset.uniqueAssets>=m.minUniqueAssets,'training-insufficient');
 assert(Number.isSafeInteger(a.validation?.holdoutAssets)&&a.validation.holdoutAssets>=m.minHoldoutAssets,'holdout-insufficient');
 assert(a.validation?.assetGroupsDisjoint===true&&a.validation?.outOfTime===true&&a.validation?.outOfRegion===true&&a.validation?.targetLeakageChecked===true,'split-or-leakage-unverified');
 assert(evidenceTimestamp(a.trainedAt)!==null&&assessTemporalCurrency(a.trainedAt,{now,maxAgeMs:m.maxModelAgeDays*86400000}).status==='current','model-time-invalid');
 const trainEnd=evidenceTimestamp(a.dataset?.trainEnd),testStart=evidenceTimestamp(a.validation?.testStart),testEnd=evidenceTimestamp(a.validation?.testEnd);
 assert(trainEnd!==null&&testStart!==null&&testEnd!==null&&trainEnd<testStart&&testStart<=testEnd&&testEnd<=evidenceTimestamp(a.trainedAt),'temporal-split-invalid');
 assert(list(a.validation?.regions).length>0&&list(a.validation?.regions).every(r=>id(r?.id)&&Number.isSafeInteger(r?.holdoutAssets)&&r.holdoutAssets>=m.minRegionHoldoutAssets),'region-holdout-insufficient');
 assert(['urban','rural','transition'].includes(a.regime),'regime-invalid');
 assert(a.outputKind==='unit_price_diagnostic'?a.label?.kind==='verified_transaction_price'&&a.label.unit==='BRL_m2'&&a.label.notFiscal===true:a.label?.kind==='dual_reviewed_comparability','labels-unverified');
 const metric=a.outputKind==='unit_price_diagnostic'?a.validation?.mape:a.validation?.calibrationError;
 assert(Number.isFinite(metric)&&metric>=0&&metric<=(a.outputKind==='unit_price_diagnostic'?m.maxUnitPriceMape:m.maxCalibrationError),'out-of-sample-performance-insufficient');
 assert(a.validation?.baselineCompared===true&&a.validation?.shadowReviewed===true,'baseline-or-shadow-unverified');
 const features=list(a.features),known=new Map(m.allowedFeatures.map(f=>[f.id,f]));
 assert(features.length>0&&features.length<=m.maxFeatures&&new Set(features.map(f=>f?.id)).size===features.length,'feature-count-invalid');
 assert(features.every(f=>f&&known.has(f.id)&&f.unit===known.get(f.id).unit&&Number.isFinite(f.mean)&&Number.isFinite(f.scale)&&f.scale>0),'feature-or-unit-invalid');
 const layers=list(a.layers);assert(layers.length>0&&layers.length<=m.maxModelLayers,'network-size-invalid');
 let width=features.length;
 for(let i=0;i<layers.length;i++){
  const l=layers[i]??{},units=list(l.bias).length;
  assert(units>0&&units<=m.maxHiddenUnits&&['linear','relu','sigmoid','tanh'].includes(l.activation),'layer-contract-invalid');
  assert(list(l.weights).length===units&&list(l.weights).every(w=>Array.isArray(w)&&w.length===width&&w.every(Number.isFinite))&&list(l.bias).every(Number.isFinite),'weights-shape-invalid');
  if(a.family==='RNN'&&i===0)assert(list(l.recurrentWeights).length===units&&list(l.recurrentWeights).every(w=>Array.isArray(w)&&w.length===units&&w.every(Number.isFinite)),'recurrent-weights-invalid');
  width=units;
 }
 assert(width===1,'output-size-invalid');assert(a.outputKind!=='comparability_score'||layers.at(-1)?.activation==='sigmoid','probability-activation-invalid');
 if(a.family==='RNN')assert(Number.isInteger(a.minTimesteps)&&a.minTimesteps>=m.minRnnTimesteps&&a.minTimesteps<=120,'sequence-too-short');
 assert(a.weightsSha256===diligenceHash(layers),'weights-hash-divergent');
 return {valid:errors.length===0,state:errors.length?'rejected':'structurally-valid',errors:[...new Set(errors)],cryptographicApprovalVerified:false,datasetBytesVerified:false,canonicalPriceOverride:false};
}

export async function runDiligenceModelInference({artifact,input,verifyApproval,verifyDataset,policy=DEFAULT_DILIGENCE_POLICY,now=new Date().toISOString()}={}){
 const validation=validateDiligenceModelArtifact(artifact,{policy,now}),abstain=reason=>({state:'abstained',reason,validation,canReplaceCanonicalPrice:false,canApproveInvestment:false});
 if(!validation.valid)return abstain('Artefato não satisfaz o contrato de treino, validação e autoridade.');
 if(typeof verifyApproval!=='function'||typeof verifyDataset!=='function')return abstain('Verificadores de aprovação e dataset não foram fornecidos.');
 try{if(await verifyApproval(artifact)!==true||await verifyDataset(artifact.dataset)!==true)return abstain('Aprovação ou bytes do dataset não puderam ser comprovados.');}catch{return abstain('Falha na verificação independente do artefato.');}
 if(input?.regime!==artifact.regime||!artifact.validation.regions.some(r=>r.id===input.region)||input.criticalUnknown===true||input.driftDetected===true)return abstain('Regime/região sem validação ou condição crítica/deriva identificada.');
 const specs=new Map(policy.ml.allowedFeatures.map(f=>[f.id,f])),normalize=row=>artifact.features.map(f=>{const v=row?.[f.id],s=specs.get(f.id);if(v?.unit!==f.unit||!Number.isFinite(v.value)||v.value<s.min||v.value>s.max)throw Error('feature');return (v.value-f.mean)/f.scale;});
 const act=(x,kind)=>kind==='relu'?Math.max(0,x):kind==='sigmoid'?1/(1+Math.exp(-Math.max(-700,Math.min(700,x)))):kind==='tanh'?Math.tanh(x):x;
 const forward=(vector,layer,recurrent)=>layer.weights.map((w,i)=>act(w.reduce((s,x,j)=>s+x*vector[j],layer.bias[i])+(recurrent?layer.recurrentWeights[i].reduce((s,x,j)=>s+x*recurrent[j],0):0),layer.activation));
 let x;
 try{
  if(artifact.family==='ANN')x=normalize(input.features);
  else{const series=list(input.series);if(series.length<artifact.minTimesteps||series.length>120||series.some((r,i)=>evidenceTimestamp(r.at)===null||evidenceTimestamp(r.at)>evidenceTimestamp(now)||i&&evidenceTimestamp(r.at)<=evidenceTimestamp(series[i-1].at)))return abstain('Série real insuficiente, futura ou fora de ordem.');let hidden=artifact.layers[0].bias.map(()=>0);for(const row of series)hidden=forward(normalize(row.features),artifact.layers[0],hidden);x=hidden;}
  for(const [i,layer] of artifact.layers.entries())if(artifact.family==='ANN'||i>0)x=forward(x,layer);
 }catch{return abstain('Atributo ausente, unidade ou domínio incompatível; nenhum preenchimento inventado.');}
 if(!Number.isFinite(x[0])||artifact.outputKind==='unit_price_diagnostic'&&x[0]<=0)return abstain('Saída numérica fora do contrato.');
 return {state:'auxiliary-inference',modelId:artifact.id,modelVersion:artifact.version,artifactSha256:artifact.artifactSha256,outputKind:artifact.outputKind,value:x[0],unit:artifact.outputKind==='unit_price_diagnostic'?'BRL_m2':'ratio',canonicalPriceOverride:false,canApproveInvestment:false,inputHash:diligenceHash(input),checkedAt:now};
}
