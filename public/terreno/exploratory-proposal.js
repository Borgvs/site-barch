/** Shared display authority for authored sketches; no adoption or investment gateway. */
export function exploratoryProposalMetadata(data) {
  const value=data?.metadata;
  if(value?.role!=='exploratory_product_sketch')return null;
  if(value.authority!=='working_assumption'||value.adoptionAllowed!==false||value.investmentAreaAllowed!==false||value.legalEnvelopeAdopted!==false||value.usableAreaM2!==null||value.approvedHeightM!==null||value.admissibility!=='conditional_pending_diligence'||!Array.isArray(value.unresolved)||!value.unresolved.length)throw new Error('Ensaio exploratório sem limites de autoridade e condicionantes.');
  for(const feature of data.features??[]){const properties=feature?.properties;if(properties?.role!=='exploratory_product_sketch'||properties?.authority!=='working_assumption'||properties?.investmentAreaAllowed!==false||properties?.legalEnvelopeAdopted!==false)throw new Error('Feição do ensaio contradiz seus limites de autoridade.');}
  return {role:value.role,authority:value.authority,adoptionAllowed:false,investmentAreaAllowed:false,legalEnvelopeAdopted:false,usableAreaM2:null,approvedHeightM:null,admissibility:value.admissibility,unresolved:[...value.unresolved],containmentVerified:value.containmentVerified===true,observedExclusionsIntersection:value.observedExclusionsIntersection,displayMarginM:value.displayMarginM??null,hydrographicLegalBufferM:value.hydrographicLegalBufferM??null};
}
export function assertExploratoryStudy(data,study) {
  if(exploratoryProposalMetadata(data)&&data.metadata.slug!==study?.slug)throw new Error('Ensaio exploratório pertence a outro terreno.');
}
export function exploratorySummary(data) {
  const metadata=exploratoryProposalMetadata(data);
  return metadata?{exploratory:true,proposalMetadata:metadata,areaRole:'experimental_product_footprint',investmentAreaAllowed:false,legalEnvelopeAdopted:false,admissibility:metadata.admissibility}:{exploratory:false};
}
