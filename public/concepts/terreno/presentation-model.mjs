/** Presentation hierarchy only. All values and conclusions come from the existing owners. */
export const mainSections=[['overview','Diagnóstico'],['summary','Dashboard'],['asset','Terreno'],['business','Potencial de uso e negócio']];
export const sectionPages={asset:[['asset','Caracterização'],['landvalue','Preço da terra'],['diligence','Diligências'],['documents','Documentos']],business:[['business','Possibilidades de uso'],['territory','Envelope e implantação'],['market','Mercado do produto'],['economics','Economia da aquisição']]};
export const supportPages=[['field','Vistoria'],['method','Metodologia e fontes']];
export function parentSection(tab){if(tab==='scenarios')return 'business';return Object.entries(sectionPages).find(([,pages])=>pages.some(([id])=>id===tab))?.[0]??tab;}
export function validSection(tab){return [...mainSections,...Object.values(sectionPages).flat(),...supportPages].some(([id])=>id===tab)||tab==='scenarios';}
const finite=v=>typeof v==='number'&&Number.isFinite(v);
export function diagnosisModel(study,result){
 const r=result,complete=r?.status==='exploratory'&&finite(r.recommendedPriceBrl)&&finite(r.ceilings?.effectiveBrl)&&r.base?.metrics;
 if(!complete)return {state:r?.status==='insufficient_evidence'?'insufficient':'pending',label:r?.decision?.label??'Preparando o diagnóstico',reason:r?.decision?.reason??'Consolidando valor da terra, capacidade de compra e condições para avançar.',price:null,ceiling:null,gates:[],metrics:[],basis:null};
 const m=r.base.metrics,a=r.assumptions,l=r.landValuation,land=l?.landOnlyEstimate??l?.bareLandEstimate;
 return {state:'current',label:r.decision.label,reason:r.decision.reason,price:r.recommendedPriceBrl,ceiling:r.ceilings.effectiveBrl,
  basis:{label:land?.label??l?.estimate?.label??'Referência física',value:land?.centralBrl??l?.estimate?.centralBrl??r.valuation?.centralBrl,landIsolated:Boolean(land)},
  gates:r.decision.gates??[],months:a.exitMonth,referenceCloses:r.decision.referencePriceCloses,
  metrics:[['Capital próprio necessário',m.peakEquityBrl,'money'],['TIR do ativo',m.projectIrrAnnualPct,'rate'],['TMA do ativo',m.projectTmaAnnualPct,'rate'],['Custo de oportunidade',a.benchmarkAnnualPct,'rate'],['VPL do ativo',m.projectNpvBrl,'money'],['Spread TIR − TMA',m.projectSpreadPp,'pp']],
  reserves:a.safetyMarginPct,verification:study.verification?.freshness?.status??'unverifiable',approved:r.investmentApproved===true};
}
