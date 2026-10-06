/** Land price precedes acquisition economics. No TMA, financing, product,
 * residual, seller price, private appraisal or fiscal index sets market price.
 * Unknown improvement contribution remains unknown; it is never subtracted
 * through an invented percentage or replacement-cost coefficient. */
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {landEvidenceRows} from './acquisition-economics.mjs';
const require=createRequire(import.meta.url);
export const DEFAULT_LAND_VALUATION_POLICY=require('./land-valuation-policy.json');
export const LAND_MARKET_VERSION='land-market-valuation-1.0.0';
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x),finite=x=>typeof x==='number'&&Number.isFinite(x);
const fail=message=>{throw Object.assign(new TypeError(message),{code:'LAND_MARKET_INPUT'});};
const cents=x=>Math.round((x+Number.EPSILON)*100)/100;
const normalize=x=>typeof x==='string'?x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim():null;
const validDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const host=x=>{try{return new URL(x).hostname.replace(/^www\./,'');}catch{return null;}};
const age=(x,baseDate)=>Number.isFinite(Date.parse(x))?Math.floor((Date.parse(baseDate+'T23:59:59Z')-Date.parse(x))/86400000):null;
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

function validatePolicy(p){
 if(!object(p)||p.schemaVersion!==1||!object(p.selection)||!object(p.subjectProfiles)||!object(p.referenceProfiles)||!Array.isArray(p.additionalRows)||!Array.isArray(p.sources)||!Array.isArray(p.crossReferences))fail('Política de mercado da terra incompleta.');
 if(!finite(p.selection.maxAreaRatio)||p.selection.maxAreaRatio<1||p.selection.maxAreaRatio>100||!finite(p.selection.maxOfferAgeDays)||p.selection.maxOfferAgeDays<1||p.selection.maxOfferAgeDays>3660)fail('Critérios de porte ou atualidade inválidos.');
 return p;
}
function projection(raw,subject,profile,p,baseDate){
 const m=p.referenceProfiles[raw.id]??{},row={...raw,...m},publisher=host(row.sourceUrl),ratio=finite(row.areaM2)&&row.areaM2>0?Math.max(subject.areaM2/row.areaM2,row.areaM2/subject.areaM2):null;
 const capturedAt=row.capture?.checkedAt??row.capture?.capturedAt??row.date??row.retrievedAt,sourceAge=age(capturedAt,baseDate);
 const rowClass=row.assetClass,rowRegime=row.regime,rowRegion=row.marketRegion;
 const municipality=row.municipality,uf=row.uf;
 let exclusion=null;
 if(row.excluded===true||row.forceExcluded===true||row.status==='quarantined')exclusion='Referência excluída/identidade não conciliada.';
 else if(row.subject===true||row.role==='subject'||row.id===subject.slug)exclusion='Oferta do próprio sujeito não é comparável externo.';
 else if(row.kind!=='asking_price')exclusion='Natureza distinta: manter fiscal/transação/aluguel/leilão em estrato próprio.';
 else if(!finite(row.priceBrl)||row.priceBrl<=0||row.priceBrl>1e12||!finite(row.areaM2)||row.areaM2<=0||row.areaM2>1e10)exclusion='Preço/denominador de área inválidos.';
 else if(!publisher||!/^https?:\/\//.test(row.sourceUrl))exclusion='Origem pública ausente.';
 else if(!subject.assetClass||!rowClass)exclusion='Classe do terreno não qualificada.';
 else if(rowClass!==subject.assetClass)exclusion='Classe de ativo incompatível com o sujeito.';
 else if(normalize(municipality)!==normalize(subject.municipality)||uf!==subject.uf)exclusion='Praça diferente; não incorporar como amostra local.';
 else if(!subject.marketRegion||!rowRegion||rowRegion!==subject.marketRegion)exclusion='Micromercado não reconciliado.';
 else if(rowRegime!==subject.comparisonRegime)exclusion='Regime territorial distinto da base selecionada.';
 else if(typeof row.condominium!=='boolean'||typeof subject.condominium!=='boolean')exclusion='Condição de condomínio não reconciliada.';
 else if(row.condominium!==subject.condominium)exclusion='Lote em condomínio e gleba/terreno fora do condomínio são objetos distintos.';
 else if(ratio>p.selection.maxAreaRatio)exclusion=`Porte incompatível (${ratio.toFixed(1)}×); filtro é ${p.selection.maxAreaRatio}×, sem corrigir o preço por coeficiente.`;
 else if(sourceAge===null||sourceAge<0||sourceAge>p.selection.maxOfferAgeDays)exclusion='Consulta inválida/futura/vencida; repetir a coleta.';
 const landState=['vacant','improved','unknown'].includes(row.landState)?row.landState:'unknown';
 const contribution=finite(row.improvementContributionBrl)&&row.improvementContributionBrl>=0&&row.improvementContributionBrl<=row.priceBrl?row.improvementContributionBrl:null;
 const contributionVerified=contribution!==null&&row.improvementContributionVerified===true&&typeof row.improvementContributionSource==='string'&&!!row.improvementContributionSource.trim();
 const vacant=row.eligibleUrbanLand===true&&subject.comparisonRegime==='urban'&&landState==='vacant'&&typeof row.landStateAuthority==='string'&&!!row.landStateAuthority.trim();
 const bare=row.eligibleBareLand===true&&(landState==='vacant'&&row.noImprovementsConfirmed===true&&typeof row.noImprovementsSource==='string'&&!!row.noImprovementsSource.trim()||contributionVerified);
 const unitPriceBrl=finite(row.priceBrl)&&finite(row.areaM2)&&row.areaM2>0?row.priceBrl/row.areaM2:null;
 const displayUnit=subject.comparisonRegime==='rural'?'BRL_ha':'BRL_m2';
 return {id:row.id??row.assetKey??row.sourceUrl,label:row.label??row.title??row.id,kind:row.kind,areaM2:row.areaM2,areaHa:finite(row.areaM2)?row.areaM2/10000:null,priceBrl:row.priceBrl,
  unitPriceBrl,unitPricePerHaBrl:unitPriceBrl===null?null:unitPriceBrl*10000,displayUnit,displayUnitPriceBrl:unitPriceBrl===null?null:unitPriceBrl*(displayUnit==='BRL_ha'?10000:1),
  sourceUrl:row.sourceUrl,sourceId:row.sourceId??publisher,sourceSha256:row.sourceSha256??row.capture?.sha256??null,publisher,capturedAt,date:typeof capturedAt==='string'?capturedAt.slice(0,10):null,ageDays:sourceAge,
  assetClass:rowClass,regime:rowRegime,municipality,uf,marketRegion:rowRegion,condominium:row.condominium??null,urbanization:row.urbanization??'unknown',landState,
  landStateAuthority:row.landStateAuthority??'unverified',vacancyVerified:row.vacancyVerified===true,eligibleUrbanLand:exclusion===null&&vacant,eligibleBareLand:exclusion===null&&bare,
  improvementContributionBrl:contributionVerified?contribution:null,improvementContributionSource:contributionVerified?row.improvementContributionSource:null,
  adjustedLandBrl:contributionVerified?row.priceBrl-contribution:null,improvements:row.improvements??row.reason??'',distanceKm:null,areaRatio:ratio,
  selected:exclusion===null,reason:(exclusion&&row.forceExcluded===true&&row.reason?row.reason:exclusion)??row.reason??row.improvements??'Referência de anúncio externo; confirmar objeto e condição.',exclusionReason:exclusion,
  areaBasis:row.areaBasis??'Área total anunciada, não área útil licenciada',assetKey:row.assetKey??row.duplicateAssetId??row.sourceUrl??row.id,
  weight:exclusion?0:1/(1+Math.abs(Math.log(row.areaM2/subject.areaM2))),formalValuationEligible:false};
}
function descriptive(rows,subject,basis,label){
 if(!rows.length)return null;
 const selected=rows.map(x=>({...x}));const totals=new Map();for(const r of selected)totals.set(r.publisher,(totals.get(r.publisher)??0)+r.weight);for(const r of selected)r.weight/=totals.get(r.publisher);
 const unit=r=>(basis==='bare_land_reference'&&r.adjustedLandBrl!==null?r.adjustedLandBrl:r.priceBrl)/r.areaM2;
 selected.sort((a,b)=>unit(a)-unit(b));const total=selected.reduce((s,r)=>s+r.weight,0);let cumulative=0;
 const points=selected.map(r=>{const x=(cumulative+r.weight/2)/total;cumulative+=r.weight;return{x,y:unit(r)};});
 let central=points[0].y;
 if(points.length>1){const upper=points.findIndex(r=>r.x>=.5);if(upper===-1)central=points.at(-1).y;else if(upper===0)central=points[0].y;else{const a=points[upper-1],b=points[upper];central=a.y+(.5-a.x)/(b.x-a.x)*(b.y-a.y);}}
 const low=unit(selected[0]),high=unit(selected.at(-1)),unitFactor=subject.comparisonRegime==='rural'?10000:1;
 const publishers=new Set(selected.map(r=>r.publisher)).size;
 return {lowBrl:cents(low*subject.areaM2),centralBrl:cents(central*subject.areaM2),highBrl:cents(high*subject.areaM2),
  unitLowBrl:low*unitFactor,unitCentralBrl:central*unitFactor,unitHighBrl:high*unitFactor,unitPerM2Brl:central,
  displayUnit:unitFactor===10000?'BRL_ha':'BRL_m2',unitKind:basis==='urban_vacant_land_offer'?'BRL_m2_serviced_land':basis==='bare_land_reference'?(unitFactor===10000?'BRL_ha_bare_land':'BRL_m2_land_isolated'):unitFactor===10000?'BRL_ha_rural_aggregate':'BRL_m2_property_gross',
  basis,label,status:selected.length===1?'single_reference':basis==='urban_vacant_land_offer'?'publisher_reported_land':'exploratory_reference',bandIdentified:selected.length>1&&low!==high,
  rangeKind:'observed_offer_range_not_confidence_interval',sampleCount:selected.length,independentPublisherCount:publishers,
  confidence:publishers>=3?'multiple_sources_preliminary':'limited_evidence',sourceIds:selected.map(r=>r.id),adoptedMarketValueBrl:null,
  authority:'external_market_reference_not_adopted',contributionsSeparated:basis==='bare_land_reference',statisticalInference:false};
}

export function evaluateLandMarket(study,{policy=DEFAULT_LAND_VALUATION_POLICY,baseDate=today()}={}){
 try{
  if(!object(study)||typeof study.slug!=='string'||!study.slug||!finite(study.areaM2)||study.areaM2<=0||study.areaM2>1e10)fail('Identidade e área do terreno obrigatórias.');
  validatePolicy(policy);if(!validDate(baseDate))fail('Data-base inválida.');
  const p=policy.subjectProfiles[study.slug],regime=p?.regime??({urbano:'urban',rural:'rural',transicao:'transition'}[study.landContext]??'unknown');
  const subject={slug:study.slug,areaM2:study.areaM2,areaHa:study.areaM2/10000,areaBasis:p?.areaBasis??study.areaLabel??'Área declarada',assetClass:p?.assetClass??study.assetClass??null,
   regime,comparisonRegime:p?.comparisonRegime??regime,municipality:study.municipality,uf:study.uf,marketRegion:p?.marketRegion??study.marketRegion??null,
   condominium:p?.condominium??study.condominium??null,urbanization:p?.urbanization??'unknown',landState:p?.landState??'unknown',builtAreaM2:p?.builtAreaM2??null,scopeNote:p?.scopeNote??null};
  const studyRows=Array.isArray(study.landEconomics?.value?.rows)?study.landEconomics.value.rows:landEvidenceRows(study);
  const raw=studyRows.length?studyRows:(policy.fallbackRows??[]).filter(r=>r.studySlug===study.slug);
  if(raw.length>500)fail('Curadoria limitada a 500 ativos por rodada.');
  const comparables=[],rejected=[],seen=new Set();
  for(const original of [...raw,...policy.additionalRows.filter(r=>r.studySlug===study.slug)]){
   if(!object(original))continue;
   const r=projection(original,subject,p,policy,baseDate);
   if(r.selected&&seen.has(r.assetKey)){r.selected=false;r.eligibleUrbanLand=false;r.eligibleBareLand=false;r.reason='Réplica do mesmo ativo; origem única.';r.exclusionReason=r.reason;}
   if(r.selected)seen.add(r.assetKey);(r.selected?comparables:rejected).push(r);
  }
  const physicalProxy=descriptive(comparables,subject,'physical_property_proxy',p?.physicalProxyLabel??(subject.comparisonRegime==='rural'?'Gleba física · proxy rural com benfeitorias':'Imóvel físico · referência com benfeitorias não segregadas'));
  const urbanRows=comparables.filter(r=>r.eligibleUrbanLand),bareRows=comparables.filter(r=>r.eligibleBareLand);
  const bareLandEstimate=descriptive(bareRows,subject,'bare_land_reference',subject.comparisonRegime==='rural'?'Terra nua rural · referência isolada':'Terra · contribuição isolada das benfeitorias');
  const landOnlyEstimate=subject.comparisonRegime==='urban'?descriptive(urbanRows,subject,'urban_vacant_land_offer','Terreno urbano · ofertas sem edificação descrita'):bareLandEstimate;
  const estimate=landOnlyEstimate??bareLandEstimate??physicalProxy;
  const crossReferences=policy.crossReferences.filter(r=>normalize(r.municipality)===normalize(study.municipality)&&r.uf===study.uf).map(r=>({...r,usedInMarketEstimate:false,usedAsExit:false}));
  const improved=comparables.filter(r=>r.landState==='improved'||r.landState==='unknown'),regimeMismatch=subject.regime!==subject.comparisonRegime;
  const flags={improvementsUnseparated:improved.some(r=>r.improvementContributionBrl===null),bareLandNotIdentified:bareLandEstimate===null,
   urbanVacancyUnverified:urbanRows.some(r=>!r.vacancyVerified),regimeMismatch,landRightsNotPriced:regimeMismatch,
   singleReference:estimate?.sampleCount===1,askingPricesOnly:true,fiscalReferenceNotMarket:crossReferences.length>0,areaReconciliationRequired:study.assessment?.regulatory?.axes?.find(x=>x.id==='identity_geometry')?.state!=='supported'};
  const factors=[{id:'region',label:'Micromercado e localização',state:subject.marketRegion?'declared':'missing',value:subject.marketRegion,impact:'Define a amostra; diferenças de frente/acesso não recebem ajuste sem evidência.',source:'Cadastro/curadoria pública do estudo'},
   {id:'class',label:'Classe e regime do terreno',state:regimeMismatch?'cross_regime':'declared',value:subject.assetClass,impact:regimeMismatch?'Referência física rural não valora aprovação urbanística, infraestrutura futura, estoque de lotes ou SPE.':'Terreno e produto pronto permanecem em grupos distintos.'},
   {id:'size',label:'Porte e denominador',state:'declared',value:subject.areaM2,impact:'Normaliza pela área bruta declarada do sujeito; filtro de porte não aplica fator monetário.',source:subject.areaBasis},
   {id:'condominium',label:'Condomínio e direitos acessórios',state:subject.condominium===null?'unknown':'declared',value:subject.condominium,impact:'Segrega lotes em condomínio de glebas fora do condomínio.'},
   {id:'urbanization',label:'Urbanização e redes',state:subject.urbanization==='unknown'?'unknown':'partial',value:subject.urbanization,impact:'Muro, cerca, acesso e infraestrutura qualificam a terra urbana; situação anunciada não comprova capacidade/licença.'},
   {id:'improvements',label:'Edificações e benfeitorias',state:flags.improvementsUnseparated?'unseparated':'separated',value:subject.builtAreaM2,impact:'Contribuição de valor exige evidência própria. Custo de reposição/depreciado não é desconto automático sobre anúncio.'},
   {id:'environment',label:'Restrições e aproveitamento',state:study.assessment?.regulatory?.axes?.find(x=>x.id==='environmental_water')?.state??'unknown',impact:'APP, cheias, relevo e áreas não edificáveis entram como atributos e diligências; não há desconto universal nem retirada oportunista do denominador.'}];
  const checks=[{id:'independent_price',label:'Referência externa independente',status:estimate?'supported':'missing',message:estimate?'Somente ofertas externas selecionadas; preço do sujeito e cenário econômico não formam o valor.':'Coletar referências com classe, praça, área e preço verificáveis.'},
   {id:'price_strata',label:'Terra e benfeitorias separados',status:landOnlyEstimate?'partial':'unseparated',message:landOnlyEstimate?'Estrato de terreno urbano sem edificação descrita, com atributos de infraestrutura explícitos; não é VTN rural nem vistoria.':'A referência disponível é o imóvel físico; ainda não é possível isolar terra por contribuição comprovada.'},
   {id:'normalization',label:'Unidade e área coerentes',status:'supported',message:subject.comparisonRegime==='rural'?'Apresentação em R$/ha; conversão explícita de 10.000 m²/ha, sem multiplicar preços de lotes pelo perímetro bruto.':'Apresentação em R$/m² de terreno, não R$/m² construído/privativo.'},
   {id:'deduplication',label:'Ativos e anunciantes distintos',status:'supported',message:`${comparables.length} ativos selecionados; ${new Set(comparables.map(r=>r.publisher)).size} anunciantes distintos; réplicas excluídas.`},
   {id:'fiscal_scope',label:'VTN e referência fiscal',status:'supported',message:crossReferences.length?'VTN 2026 oficial localizado; finalidade ITR e aptidão agrícola não selecionada, sem compor valor de mercado ou caixa.':'Sem referência fiscal incorporada como preço de mercado.'},
   {id:'regime_scope',label:'Direitos e transição',status:regimeMismatch?'conditional':'supported',message:regimeMismatch?'Comparação física rural não mensura direitos urbanísticos do sujeito.':'Classe urbana compatível, condicionantes específicas permanecem abertas.'},
   {id:'economic_separation',label:'Valor sem TMA ou produto',status:'supported',message:'Taxa, dívida, prazo, preço-teto e retorno não entram no estimador de mercado.'}];
  const notes=['Preço de oferta e transação não são equivalentes. Faixa apresentada contém extremos observados; referência única não demonstra intervalo de preço.',
   'Ocupação e urbanização vêm do anúncio/cadastro e devem ser conciliadas em campo. As declarações comerciais de construir, cais ou infraestrutura não adotam uso/envelope.',
   'Para terra urbana, muro/cerca/infraestrutura são atributos identificados do lote; não confundem sua referência com a definição fiscal de terra nua rural.',
   ...(subject.scopeNote?[subject.scopeNote]:[]),
   ...(flags.improvementsUnseparated?['Edificações/benfeitorias de parte das referências não têm contribuição de valor comprovada; a proxy física é apresentada separadamente.']:[]),
   ...(crossReferences.length?['VTN municipal de 2026 foi conferido na publicação primária da Receita Federal; uso exclusivamente fiscal/contextual, sem assumir aptidão do sujeito.']:[])];
  const sources=[...policy.sources.map(s=>({title:s.title,url:s.url,effectiveOn:s.id==='rfb-vtn-2026'?'2026-01-01':null,capturedAt:s.capturedAt,sha256:s.sha256})),
   ...comparables.map(r=>({title:r.label,url:r.sourceUrl,effectiveOn:null,capturedAt:r.capturedAt,sha256:r.sourceSha256}))];
  return {schemaVersion:1,version:LAND_MARKET_VERSION,policyVersion:policy.version,policySha256:digest(policy),baseDate,studySlug:study.slug,status:estimate?'preliminary_reference':'insufficient_evidence',
   authority:'land_market_working_reference',adoptedMarketValueBrl:null,investmentApproved:false,subject,estimate,landOnlyEstimate,bareLandEstimate,physicalProxy,
   comparables,rejected,factors,evidence:{sourceCount:new Set(comparables.map(r=>r.publisher)).size,bareCount:bareRows.length,urbanLandCount:urbanRows.length,propertyCount:comparables.length,
    rangeKind:'observed_offer_range_not_confidence_interval',crossReferences,transactedPriceVerified:false,improvementContributionVerified:comparables.some(r=>r.improvementContributionBrl!==null)},flags,
   crossAudit:{checks,economicInputsUsed:false,fiscalInputsUsedForPrice:false,arbitraryPriceCoefficientsApplied:false},method:policy.method,notes,sources,
   defaultBusinessValuationBasis:p?.businessValuationBasis??(landOnlyEstimate?'land':physicalProxy?'physical_property_proxy':null),
   dataSha256:digest({subject,comparables,rejected,estimate,policyVersion:policy.version})};
 }catch(e){return{schemaVersion:1,version:LAND_MARKET_VERSION,status:'invalid',authority:'missing',adoptedMarketValueBrl:null,investmentApproved:false,estimate:null,diagnostics:[{code:e.code??'LAND_MARKET_ERROR',message:e.message}]};}
}
