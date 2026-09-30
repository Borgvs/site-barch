/** Qualifies a declared product against its pinned study references; never grants zoning. */
export function qualifyProduct(input, bindings) {
  const reference = bindings.productQualification;
  if (!reference) return null;
  const fail = message => { const error=new Error(message);error.code='PRODUCT_QUALIFICATION_REFERENCE';throw error; };
  if (reference.version !== 'product-reference-1' || !reference.scope?.studySlug
      || !reference.scope?.municipalityIbge || !reference.scope?.product
      || !/^\d{4}-\d{2}-\d{2}$/.test(reference.asOf ?? '')
      || !reference.ticket?.source?.url || !reference.units?.source?.url
      || !Number.isFinite(reference.ticket?.maximumBrl) || !(reference.ticket.maximumBrl > 0)
      || !Number.isSafeInteger(reference.units?.maximum) || !(reference.units.maximum > 0))
    fail('Referência de qualificação exige escopo, data-base, limites e fontes explícitos.');
  const revenue = input.revenues.find(row => row.id === bindings.revenueId);
  if (!revenue || input.revenues.length !== 1 || revenue.unitPriceBrl != null || revenue.grossAmountBrl != null
      || ![revenue.units,revenue.unitAreaM2,revenue.pricePerM2Brl].every(value=>typeof value==='number' && Number.isFinite(value) && value>0))
    fail('Qualificação de ticket exige um único produto com área e preço/m² explícitos.');
  const ticket = revenue.unitAreaM2 * revenue.pricePerM2Brl;
  const privateArea = revenue.units * revenue.unitAreaM2;
  const builtArea = input.product.builtAreaM2;
  const areaConsistent = Number.isFinite(builtArea) && builtArea > privateArea;
  const checks = [
    {id:'unit-ticket',status:ticket <= reference.ticket.maximumBrl + 0.005 ? 'within_reference':'outside_reference',
      actual:ticket,maximum:reference.ticket.maximumBrl,unit:'BRL por unidade na data-base',
      label:'Ticket do produto × referência HIS-2 do estudo',source:reference.ticket.source,
      context:'Comparação à referência da data-base; não aplica atualização automática do teto para vendas futuras.'},
    {id:'reference-units',status:revenue.units <= reference.units.maximum ? 'within_reference':'outside_reference',
      actual:revenue.units,maximum:reference.units.maximum,unit:'unidades',
      label:'Unidades × programa de referência',source:reference.units.source,
      context:'O número é o limite adotado no ensaio; não é uma declaração de limite legal universal ou de capacidade física aprovada.'},
    {id:'program-area',status:areaConsistent?'within_reference':'outside_reference',
      actual:privateArea,maximum:builtArea ?? null,unit:'m²',label:'Área privativa × área construída',
      source:{title:'Conciliação aritmética do programa de apartamentos',basis:'units × unitAreaM2 compared with builtAreaM2'},
      context:'Neste ensaio de apartamentos, a área construída precisa comportar a privativa e área adicional para elementos comuns. Não adota taxa de eficiência nem comprova encaixe geométrico.'},
  ];
  const diagnostics=[];
  if (checks[0].status==='outside_reference') diagnostics.push({severity:'blocker',code:'PRODUCT_TICKET_OUTSIDE_REFERENCE',
    message:'O ticket unitário supera a referência HIS-2 usada no estudo. Rever o produto, preço ou enquadramento antes de interpretar o retorno como compatível com o produto principal.',
    context:{actualTicketBrl:ticket,referenceTicketBrl:reference.ticket.maximumBrl,asOf:reference.asOf,scope:reference.scope,source:reference.ticket.source}});
  if (checks[1].status==='outside_reference') diagnostics.push({severity:'blocker',code:'PRODUCT_UNITS_OUTSIDE_REFERENCE',
    message:`O número de unidades supera as ${reference.units.maximum} unidades do ensaio de referência. É necessário qualificar um novo programa; o cálculo financeiro isolado não comprova que ele cabe ou recebe o mesmo enquadramento.`,
    context:{actualUnits:revenue.units,referenceUnits:reference.units.maximum,asOf:reference.asOf,scope:reference.scope,source:reference.units.source}});
  if (!areaConsistent) diagnostics.push({severity:'blocker',code:'GEOMETRY_AREA_INCONSISTENT',
    message:'A área construída do ensaio não comporta a área privativa com espaço adicional para elementos comuns. Ajuste unidades, área privativa ou volume antes de interpretar o retorno desse programa.',
    context:{privateAreaM2:privateArea,builtAreaM2:builtArea ?? null,scope:reference.scope}});
  if (input.baseDate.slice(0,4)!==reference.asOf.slice(0,4)
      || (reference.ticket.source.publishedOn && input.baseDate < reference.ticket.source.publishedOn)) diagnostics.push({severity:'blocker',code:'PRODUCT_REFERENCE_REQUIRES_REVIEW',
    message:'A data-base pertence a outro ano que a referência de ticket. Revalidar o enquadramento e os limites antes de usar o residual.',
    context:{baseDate:input.baseDate,referenceDate:reference.asOf}});
  const within = diagnostics.length===0;
  return {version:reference.version,status:within?'within_reference':'outside_reference',asOf:reference.asOf,
    scope:reference.scope,checks,eligible_for_residual:within,eligible_for_sensitivity:within,diagnostics,
    authority:'working_assumption',note:'Compatibilidade com duas referências do estudo não valida financiamento, demanda, geometrias, normas ou licenciamento.'};
}
