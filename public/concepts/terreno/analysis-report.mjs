/** Editorial owner only. Canonical price, area, tax, envelope and decision owners
 * are supplied in the export packet; this module neither computes nor adopts them. */
import {reportSourceUrl,reportHash,reportPublicText} from './report-safety.mjs?v=73077e076bf2';
export const REPORT_VERSION='barch-land-report-2.1.0';
export const REPORT_CHAPTERS=Object.freeze([
 {id:'diagnosis',number:'01',title:'Diagnóstico e recomendação'},
 {id:'dashboard',number:'02',title:'Dashboard · investimento e retorno'},
 {id:'land',number:'03',title:'Terreno · caracterização e preço da terra'},
 {id:'business',number:'04',title:'Potencial de uso e negócio'},
 {id:'field',number:'05',title:'Pauta de vistoria e próximos atos'},
 {id:'sources',number:'06',title:'Bases utilizadas e curadoria'}
]);
const finite=v=>typeof v==='number'&&Number.isFinite(v),list=v=>Array.isArray(v)?v:[],txt=reportPublicText;
const num=(v,d=2)=>finite(v)?v.toLocaleString('pt-BR',{maximumFractionDigits:d}):'A qualificar';
const money=(v,compact=false)=>finite(v)?`R$ ${num(compact?v/1e6:v,compact?2:0)}${compact?' mi':''}`:'A qualificar';
const rate=v=>finite(v)?`${num(v)}% a.a.`:'A qualificar';
const state=v=>({supported:'Conferido no escopo',partial:'Parcial',blocked:'Impedimento de validação',sem_base:'Base a completar',not_applicable:'Não aplicável',refresh_required:'Revalidar bases',reading_not_adopted:'Leitura registrada',working_assumption:'Hipótese de ensaio',conditional:'Condicionado',exploratory:'Exploratório',exploratory_sketch:'Ensaio de ocupação',stale:'Consulta a renovar'})[v]??txt(v);
const priority=(a,b)=>String(a.priority??'P2').localeCompare(String(b.priority??'P2'));
const bullet=x=>txt(x).trim();
const firstSentence=value=>txt(value).split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/u)[0].trim();
function landBullets(property,valuation){
 const constraints=list(property.constraints).slice(0,4).map(c=>`${c.label}: ${c.value}. ${c.finding}`),findings=list(property.findings);
 const classify=label=>/domínio|identidade|disponibilidade/i.test(label)?0:/área.*acesso|geometria.*acesso|áreas públicas/i.test(label)?1:/água|app|inundação/i.test(label)?2:/rural|transição/i.test(label)?3:/mineral|contamina/i.test(label)?4:/solo|relevo|infraestrutura|declividade/i.test(label)?5:/mercado|liquidez/i.test(label)?6:7;
 const selected=findings.filter(f=>!/(?:produto|retorno|aprova|parâmetro|licen|delibera|registro|cauç|urbaníst|zoneamento)/i.test(f.label)).sort((a,b)=>classify(a.label)-classify(b.label));
 const out=[...constraints,...selected.slice(0,Math.max(0,6-constraints.length)).map(f=>`${f.label}: ${f.finding}`)];
 if(out.length<6)out.push(...list(valuation?.factors).filter(f=>!['supported','not_applicable'].includes(f.state)).slice(0,6-out.length).map(f=>`${f.label}: ${f.rationale||f.impact}`));
 return out.slice(0,6).map(bullet).filter(Boolean);
}
function businessBullets(property,possibilities){
 const findings=list(property.findings),unique=[];
 // Summary findings precede duplicated detailed readings; temporal regime and
 // registration conditions remain explicit where the case has them.
 for(const pattern of [/parâmetro|regime/i,/registro|cauç/i,/licen|delibera/i,/aprova/i]){
  const f=findings.find(x=>pattern.test(x.label));if(f&&!unique.includes(f))unique.push(f);
 }
 return [possibilities.reading,possibilities.recommendation,possibilities.envelope?.note,...unique.map(f=>`${f.label}: ${f.finding}`)].map(bullet).filter(Boolean).slice(0,6);
}
function remoteEvidence(action){
 const evidence=firstSentence(action.criteria?.[0]?.exitEvidence||action.exitEvidence);
 if(evidence.length<=170)return evidence;
 const label=txt(action.criteria?.[0]?.label).toLowerCase();
 return label?`Comprovar ${label} com fonte, data, escopo e integridade.`:'Evidência vinculada ao lote, com fonte, data, escopo e integridade.';
}
const row=(label,value,hint='')=>({label:txt(label),value:txt(value),hint:txt(hint)});
const kpi=(label,value,hint='')=>({label,value,hint});
const CHARTS=Object.freeze({
 values:{chapter:'dashboard',title:'Referência de valor e capacidade de pagar',note:'Valores em R$ milhões. Referência física, limite econômico e aquisição sugerida têm finalidades distintas.'},
 comparables:{chapter:'land',title:'Comparáveis físicos selecionados',note:'Unitários brutos das ofertas selecionadas; disponibilidade e contribuição de benfeitorias permanecem a qualificar.'},
 costs:{chapter:'dashboard',title:'Investimento e despesas do cenário',note:'Participação (%) de cada item no total das despesas positivas do cenário, incluindo a aquisição.'},
 heatmap:{chapter:'dashboard',title:'Sensibilidade do limite de compra',note:'Teto de compra em R$ milhões; combinação de valor de saída e taxa de atratividade (TMA).'},
 horizons:{chapter:'business',title:'Prazo e capacidade de aquisição',note:'Limite de compra em R$ milhões no eixo vertical; prazo da saída em meses no eixo horizontal.'},
 stresses:{chapter:'business',title:'Resiliência econômica',note:'VPL do ativo em R$ milhões; efeito de cada choque isolado em relação ao cenário-base.'}
});
/** The monthly ledger remains in JSON; only decision-oriented charts travel. */
export function selectReportImages(packet,images=[]){
 const e=packet?.economics??{},l=packet?.landValuation,selected=new Set(l?.estimate?.sourceIds??[]);
 const useful={values:true,comparables:list(l?.comparables).some(c=>finite(c.unitPriceBrl)&&(selected.size?selected.has(c.id):c.selected!==false)),costs:list(e.costs).some(c=>finite(c.brl)&&c.brl>0),heatmap:list(e.heatmap).some(c=>list(c.values).some(v=>finite(v.y))),horizons:list(e.horizons).filter(h=>finite(h.ceilingBrl)).length>1,stresses:list(e.stresses).some(s=>finite(s.npvBrl))};
 const seen=new Set();return list(images).flatMap(image=>{
  const spec=CHARTS[image?.id];if(!spec||!useful[image.id]||seen.has(image.id)||!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(image.dataUrl??''))return [];
  const unit=l?.estimate?.displayUnit==='BRL_ha'?'R$/ha':'R$/m²';
  seen.add(image.id);return [{id:image.id,title:spec.title,chapter:spec.chapter,note:image.id==='comparables'?`${unit} de terreno. ${spec.note}`:spec.note,dataUrl:image.dataUrl}];
 }).sort((a,b)=>Object.keys(CHARTS).indexOf(a.id)-Object.keys(CHARTS).indexOf(b.id));
}
function sourceRegister(packet){
 const current=packet.diligence?.provenance?.receiptCurrent===true,used=new Map();
 const add=(s,role,outcome)=>{
  const url=reportSourceUrl(s?.url??s?.sourceUrl);if(!url)return;
  const old=used.get(url),roles=new Set([...(old?.roles??[]),txt(role||s.role||'Base da análise')]);
  used.set(url,{title:old?.title||txt(s.title??s.label)||'Fonte de referência',url,roles:[...roles].filter(Boolean),role:[...roles].filter(Boolean).join(' · '),effectiveOn:old?.effectiveOn||txt(s.effectiveOn??s.date),capturedAt:old?.capturedAt||txt(s.capturedAt??s.checkedAt??s.retrievedAt),sha256:old?.sha256??reportHash(s.sha256),receiptId:old?.receiptId||txt(s.receiptId),outcome:old?.outcome||txt(outcome||s.status)||'Base utilizada na comparação preliminar',curation:old?.curation||txt(s.curation??s.notes)});
 };
 list(packet.sources).forEach(s=>add(s,s.role));
 list(packet.property?.documents).forEach(s=>add(s,'Documento público do dossiê',s.status));
 list(packet.diligence?.provenance?.evidence).forEach(e=>add({...e.source,title:'Consulta parcelar · '+txt(e.id),capturedAt:e.source?.checkedAt},'Evidência parcelar registrada',current?state(e.state):'Evidência histórica a revalidar'));
 const catalogs=new Map();
 list(packet.diligence?.fronts).forEach(f=>list(f.sources).forEach(s=>{
  const url=reportSourceUrl(s.url);if(!url||used.has(url))return;
  const old=catalogs.get(url),roles=[...new Set([...(old?.roles??[]),txt(f.label)])];catalogs.set(url,{title:old?.title||txt(s.title),url,roles,role:roles.join(' · '),effectiveOn:txt(s.effectiveOn),capturedAt:txt(s.capturedAt),sha256:reportHash(s.sha256),receiptId:null,outcome:'Referência catalogada para consulta',curation:'Disponibilidade da fonte não confirma pesquisa concluída nem incidência no lote.'});
 }));
 const l=packet.landValuation,e=l?.estimate;
 const coverage=[
  finite(e?.sampleCount)?`${num(e.sampleCount,0)} referências na faixa; ${num(e.independentPublisherCount,0)} publicadores independentes.`:'Amostra de terra a completar antes de adotar valor formal.',
  'Ofertas, transações, imóvel com benfeitorias e terra independente conservam classes próprias; o próprio ativo não funciona como comparável externo.',
  'Faixas preliminares descrevem a amostra e seus limites; a delimitação do escopo e as datas de consulta acompanham cada fonte.'
 ];
 const documentsRegistry=list(packet.property?.documents).map(d=>({title:txt(d.title)||'Documento público cadastrado',url:reportSourceUrl(d.url),type:txt(d.type),effectiveOn:txt(d.effectiveOn),capturedAt:txt(d.capturedAt),sha256:reportHash(d.sha256),pages:finite(d.pages)?d.pages:null,role:'Documento público do dossiê',outcome:txt(d.status),dateBasis:txt(d.dateBasis)}));
 return {used:[...used.values()],catalogs:[...catalogs.values()],documentsRegistry,coverage,curation:[
  'Bases Barch e fontes municipais/estaduais competentes primeiro; referências federais complementam cobertura e contexto.',
  'Curadoria exige identidade do lote, regime aplicável, unidade, data, origem e integridade; nova captura não equivale a validação concluída.',
  'Preços físicos são independentes do negócio; taxa de atratividade e limite de compra são outputs da economia do cenário.'
 ]};
}
function fieldActions(packet){
 const specific=list(packet.property?.fieldPlan?.tasks).filter(t=>t.label&&(t.instruction||t.evidence)).map(t=>({id:t.id,label:t.label,priority:t.priority||'P1',owner:'field',instruction:t.instruction,evidence:t.evidence,impact:t.impact,effect:t.impact,basis:'Pauta específica do terreno'})).sort(priority);
 if(specific.length)return specific.slice(0,8);
 return list(packet.diligence?.actions).filter(a=>a.owner==='field').sort(priority).slice(0,8).map(a=>{
  const front=list(packet.diligence?.fronts).find(f=>f.id===a.frontId),checks=list(front?.checks).filter(c=>!['supported','not_applicable'].includes(c.state));
  return {id:a.id,label:a.label,priority:a.priority,owner:'field',instruction:checks.map(c=>c.fieldAction).filter(Boolean).join(' ')||a.trigger,evidence:a.exitEvidence,impact:list(front?.impactChannels).join(' · '),effect:list(front?.impactChannels).join(' · '),basis:'Critérios do protocolo',blockedBy:list(a.blockedBy)};
 });
}
/** Stable six-chapter contract, with variable page counts in each chapter. */
export function buildAnalysisReport(packet,images=[]){
 if(!packet?.study?.slug||!packet?.economics?.metrics)throw TypeError('Pacote de análise válido é obrigatório.');
 const e=packet.economics,a=e.assumptions??{},m=e.metrics??{},l=packet.landValuation,p=packet.property??{},o=packet.possibilities??{},d=packet.decision??{},chosen=selectReportImages(packet,images),sources=sourceRegister(packet);
 const chapter=(id,content)=>({...REPORT_CHAPTERS.find(c=>c.id===id),lead:'',indicators:[],rows:[],bullets:[],actions:[],images:chosen.filter(x=>x.chapter===id),...content});
 const primary=l?.landOnlyEstimate??l?.bareLandEstimate??l?.estimate;
 const condition=list(d.gates).filter(g=>g.label),audit=packet.crossAudit;
 const remote=list(packet.diligence?.actions).filter(x=>x.owner==='remote').sort(priority);
 const diagnosis=chapter('diagnosis',{lead:txt(d.label)+(d.reason?' · '+txt(d.reason):''),
  indicators:[kpi('Aquisição sugerida',money(e.recommendedPriceBrl,true),'Hipótese condicionada às verificações'),kpi('Limite econômico de compra',money(e.ceilings?.effectiveBrl,true),'Capacidade do ativo e do capital próprio'),kpi(primary?.label||'Referência física de mercado',money(primary?.centralBrl??e.reference?.centralBrl,true),'Base física independente do preço de compra'),kpi('VPL do ativo',money(m.projectNpvBrl,true),'Valor criado à taxa de atratividade'),kpi('Capital próprio necessário',money(m.peakEquityBrl,true),'Exposição máxima no cenário analisado'),kpi('Prazo do cenário',finite(a.exitMonth)?num(a.exitMonth,0)+' meses':'A qualificar','Horizonte de saída do investimento')],
  rows:[row('Orientação',state(d.state)),row('Estado das bases',state(packet.qualification?.state)),row('Referência do estudo',txt(packet.study.studyDate)),row('Cenário exportado',txt(packet.generatedAt)),...(audit?[row('Cruzamentos conferidos',`${audit.coverage.supported??0} de ${audit.coverage.eligible??'—'} elegíveis · ${audit.coverage.criticalOpen??'—'} críticos a concluir`),row('Atualidade das evidências',audit.provenance?.currency?.status==='current'?'Vigentes no escopo da consulta':'Revalidar bases antes da decisão')]:[])],
  bullets:[...(audit?[`Auditoria de consistência: ${audit.coverage.supported??0}/${audit.coverage.eligible??'—'} cruzamentos conferidos; ${audit.coverage.criticalOpen??'—'} críticos a concluir. Bases ${audit.provenance?.currency?.status==='current'?'vigentes no escopo da consulta':'a revalidar'}.`]:[]),...list(audit?.actions).slice(0,1).map(x=>`${x.priority} · ${x.label}`),...condition.slice(0,audit?2:4).map(g=>`${g.label}${g.critical?' · crítica':''}${g.status==='blocked'?' · impedimento de validação':g.status==='pending'?' · pendente':''}`)]
 });
 const dashboard=chapter('dashboard',{lead:'Indicadores, composição do investimento e sensibilidade usam o mesmo cenário de aquisição.',
  indicators:[kpi('TIR / TMA do ativo',`${rate(m.projectIrrAnnualPct)} / ${rate(m.projectTmaAnnualPct)}`,finite(m.projectSpreadPp)?`Spread ${num(m.projectSpreadPp)} p.p.`:'Retorno versus exigência de capital'),a.debtPct>0?kpi('TIR do capital próprio',rate(m.equityIrrAnnualPct),`VPL do equity ${money(m.equityNpvBrl,true)}`):kpi('Spread do ativo',finite(m.projectSpreadPp)?num(m.projectSpreadPp)+' p.p.':'A qualificar','TIR menos TMA'),kpi('Custo de oportunidade',rate(a.benchmarkAnnualPct),finite(a.riskPremiumPp)?`Prêmio de risco ${num(a.riskPremiumPp)} p.p.`:'Alternativa de referência para o capital'),kpi('MOIC',finite(m.moic)?num(m.moic)+'×':'A qualificar','Distribuições / aportes'),kpi('Payback',m.paybackMonth==null?'Não recupera':num(m.paybackMonth,0)+' meses',m.discountedPaybackMonth==null?'Descontado: não recupera':`Descontado: ${num(m.discountedPaybackMonth,0)} meses`),kpi('Margem do ativo',finite(m.marginProjectPct)?num(m.marginProjectPct)+'%':'A qualificar','Resultado nominal / receita bruta de saída')],
  rows:[row('Base externa de saída',txt(e.basis?.label??e.reference?.label)),row('Preço analisado',money(a.offeredPriceBrl??e.recommendedPriceBrl)),row(a.debtPct>0?'TMA do ativo / equity':'TMA do ativo',a.debtPct>0?`${rate(a.projectAnnualPct)} / ${rate(a.equityAnnualPct)}`:rate(a.projectAnnualPct)),row('Variação nominal da saída',finite(a.growthAnnualPct)?num(a.growthAnnualPct)+'% a.a.':'A qualificar'),row('ITBI',finite(a.itbiPct)?num(a.itbiPct)+'%':'A qualificar'),row('Diligência / preparação',`${money(a.diligenceBudgetBrl)} / ${money(a.preparationBudgetBrl)}`),...(a.debtPct>0?[row('Dívida',num(a.debtPct)+'% da compra · '+rate(a.debtAnnualPct))]:[])],
  bullets:['Os gráficos de sensibilidade testam variações isoladas ou combinadas de saída, prazo e retorno exigido. As premissas editadas no portal acompanham este arquivo.']
 });
 const estimateRows=primary?[row('Método da avaliação física',txt(l.method??e.reference?.method)),row('Faixa da referência',`${money(primary.lowBrl,true)} a ${money(primary.highBrl,true)}`),row('Base da comparação',txt(primary.label??primary.basis)),row('Qualificação da amostra',state(l.status))]:[row('Avaliação da terra','A completar pela comparação física')];
 const selected=new Set(l?.estimate?.sourceIds??[]),comps=list(l?.comparables).filter(c=>selected.size?selected.has(c.id):c.selected!==false).slice(0,8);
 const land=chapter('land',{lead:txt(packet.methods?.landValuePurpose),rows:[row('Localização',`${packet.study.address??''} · ${packet.study.municipality??''}/${packet.study.uf??''}`),row('Identificação da parcela',txt(packet.study.parcel)),row('Regime territorial',(({urbano:'Urbano',rural:'Rural',transicao:'Transição territorial'})[p.regime]??txt(p.regime))||'A qualificar'),...list(p.areaReferences).map(x=>row(x.label,`${num(x.value)} ${x.unit}`,`${x.basis||x.origin} · ${x.asOf}`)),...estimateRows,...comps.map(c=>row(c.label,`${num(c.areaM2,0)} m² · ${money(c.priceBrl,true)} · ${money(c.unitPriceBrl)}/m²`,txt(c.reason??c.landState)))],
  bullets:landBullets(p,l)
 });
 const business=chapter('business',{lead:txt(o.principal?.label)||'Possibilidades de uso a qualificar',rows:[...(o.principal?.description?[row('Leitura principal',o.principal.description)]:[]),...list(p.indices).map(i=>row(i.label,`${typeof i.value==='number'?num(i.value):i.value}${i.unit?' '+i.unit:''}`,`${i.basis} · ${i.asOf} · ${state(i.status)}`)),...(finite(o.envelope?.areaM2)?[row('Área do envelope no ensaio',num(o.envelope.areaM2)+' m²','Área geométrica do ensaio; não equivale a computável ou área disponível adotada')]:[]),...list(o.variants).slice(0,3).map(v=>row(v.label,`${finite(v.footprintM2)?num(v.footprintM2,0)+' m² de projeção · ':''}${v.layout||v.purpose}`,state(v.status))),...(o.envelope?.program?[row('Programa documentado',`${num(o.envelope.program.totalLots,0)} lotes · ${num(o.envelope.program.blocks,0)} quadras`,'Quadro documental; registro e disponibilidade comercial exigem conciliação')]:[])],
  bullets:businessBullets(p,o)
 });
 business.rows.push(...list(o.alternatives).slice(0,3).map(x=>row('Alternativa · '+x.label,x.condition,'Descartar se: '+x.kill)));
 const field=chapter('field',{lead:'A pesquisa remota prepara a visita. O profissional confirma condições físicas, produz evidência vinculada ao lote e encaminha as questões que exigem atribuição técnica.',actions:fieldActions(packet),rows:remote.slice(0,6).map(x=>row('Pesquisa remota · '+x.label,remoteEvidence(x),x.priority)),bullets:['Cada captura deve registrar ponto, direção, data, GPS e precisão; divergências precisam de medida ou documento associado.','Parecer pessoal: registrar conclusão, fundamento e próxima ação separadamente das observações e medições.','A vistoria qualifica área, acesso, passivos, custo de preparação e prazo. Licença, certidão e delimitação legal seguem responsáveis e autoridade competentes.']});
 const base=chapter('sources',{lead:'Registro das bases efetivamente utilizadas, documentos e referências disponíveis para completar a diligência.',bullets:[...sources.curation,...sources.coverage],rows:[row('Metodologia econômica',txt(packet.methods?.policyVersion)),row('Integridade da política',txt(packet.methods?.policySha256)?.slice(0,12)||'Sem hash no pacote'),row('Protocolo de diligência',txt(packet.diligence?.protocolVersion)||'Pauta específica do terreno; protocolo consolidado não recebido'),row('Recibo de consulta',txt(packet.diligence?.provenance?.verificationId)||'Conferir no dossiê'),row('Integridade do protocolo',txt(packet.diligence?.basisHash)?.slice(0,12)||'Sem hash no pacote'),row('Atualidade do recibo',packet.diligence?packet.diligence.provenance?.receiptCurrent?'Atual no escopo':'Revalidação pendente':state(packet.qualification?.verificationState)),...sources.documentsRegistry.filter(d=>!d.url).map(d=>row('Documento público · '+d.title,`${d.type||'Dossiê'} · Referência ${d.effectiveOn||'data a conferir'} · Captura ${d.capturedAt||'data a recuperar'}${finite(d.pages)?' · '+num(d.pages,0)+' páginas':''}`,`${d.outcome}${d.sha256?' · SHA-256 '+d.sha256.slice(0,12):''}`))]});
 return {version:REPORT_VERSION,study:packet.study,generatedAt:packet.generatedAt,chapters:[diagnosis,dashboard,land,business,field,base],sourceRegister:sources,chartSelection:{included:chosen.map(x=>x.id),excluded:list(images).filter(x=>!chosen.some(y=>y.id===x.id)).map(x=>txt(x.id)||'sem-id'),monthlyLedgerIncluded:false},technicalPacketSchemaVersion:packet.schemaVersion};
}
