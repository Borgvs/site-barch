/** Shared display authority for authored sketches; no adoption or investment gateway. */
export function exploratoryProposalMetadata(data) {
  const value=data?.metadata;
  if(value?.role!=='exploratory_product_sketch')return null;
  if(value.authority!=='working_assumption'||value.adoptionAllowed!==false||value.investmentAreaAllowed!==false||value.legalEnvelopeAdopted!==false||value.usableAreaM2!==null||value.approvedHeightM!==null||value.admissibility!=='conditional_pending_diligence'||!Array.isArray(value.unresolved)||!value.unresolved.length)throw new Error('Ensaio exploratório sem limites de autoridade e condicionantes.');
  for(const feature of data.features??[]){const properties=feature?.properties;if(properties?.role!=='exploratory_product_sketch'||properties?.authority!=='working_assumption'||properties?.investmentAreaAllowed!==false||properties?.legalEnvelopeAdopted!==false)throw new Error('Feição do ensaio contradiz seus limites de autoridade.');}
  return {role:value.role,authority:value.authority,adoptionAllowed:false,investmentAreaAllowed:false,legalEnvelopeAdopted:false,usableAreaM2:null,approvedHeightM:null,admissibility:value.admissibility,unresolved:[...value.unresolved],containmentVerified:value.containmentVerified===true,observedExclusionsIntersection:value.observedExclusionsIntersection,displayMarginM:value.displayMarginM??null,hydrographicLegalBufferM:value.hydrographicLegalBufferM??null};
}
export function assertExploratoryStudy(data,study,{required=false}={}) {
  const metadata=exploratoryProposalMetadata(data),expected=study?.displayOccupationId??study?.geography?.exploratoryProposal?.variantId;
  if(required&&!metadata)throw Error('Ocupação selecionada sem autoridade de ensaio.');
  if(metadata&&data.metadata.slug!==study?.slug)throw new Error('Ensaio exploratório pertence a outro terreno.');
  if(metadata&&expected&&data.metadata.variantId!==expected)throw Error('Volume não corresponde à ocupação selecionada.');
}
export function exploratorySummary(data) {
  const metadata=exploratoryProposalMetadata(data);
  return metadata?{exploratory:true,proposalMetadata:metadata,areaRole:'experimental_product_footprint',investmentAreaAllowed:false,legalEnvelopeAdopted:false,admissibility:metadata.admissibility}:{exploratory:false};
}

/** Author-owned ground layout: an area allocation for display, never a legal clearance. */
export function assertLandUseStudy(data,study){
 const expected=study?.displayOccupationId??study?.geography?.exploratoryProposal?.variantId;
 if(!data){if(expected)throw Error('Ocupação selecionada sem distribuição de solo.');return;}
 const m=data.metadata;
 if(data.type!=='FeatureCollection'||!Array.isArray(data.features)||data.features.length>1500||m?.role!=='exploratory_land_use_layout'||m.slug!==study?.slug||m.authority!=='working_assumption'||m.adoptionAllowed!==false||m.investmentAreaAllowed!==false||m.legalEnvelopeAdopted!==false)throw Error('Distribuição de solo sem vínculo e autoridade de ensaio.');
 if(expected&&m.variantId!==expected)throw Error('Solo não corresponde à ocupação selecionada.');
 for(const f of data.features)if(!['Polygon','MultiPolygon'].includes(f.geometry?.type)||typeof f.properties?.useRole!=='string'||!/^#[a-f0-9]{6}$/i.test(f.properties?.color??''))throw Error('Distribuição de solo sem categoria e geometria válidas.');
}
export function assertOccupationPair(volumes,soil,study){
 const expected=study?.displayOccupationId??study?.geography?.exploratoryProposal?.variantId;
 assertExploratoryStudy(volumes,study,{required:!!expected});assertLandUseStudy(soil,study);
 if(expected&&(!/^[a-f0-9]{64}$/.test(volumes.metadata.configurationSha256??'')||soil.metadata.configurationSha256!==volumes.metadata.configurationSha256))throw Error('Volume e solo não compartilham a mesma configuração.');
}
