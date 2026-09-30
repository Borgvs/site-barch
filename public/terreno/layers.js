// Common study layers: availability is evidence, never inferred from land context.
export function baseLayers(study){
 const layers=study.geography?.layers||[];
 const groups=[
  ['envelope','Projeto e recuos',['envelope','implantacao-planta'],'Envelope de referência; limites do ensaio.'],
  ['occupation','Ocupação e acesso',['ocupacao-solo'],'Distribuição do ensaio: volumes, acesso, apoio e reservas.'],
  ['app','APP municipal',['app-municipal'],'Incidência cartografada pela Prefeitura, com origem e diagnóstico no estudo.'],
  ['flood','Inundação',['inundacao','inundacao2011','cheia-1983','cheia-1984','cheia-2008','cheia-2011','suscetibilidade-inundacao'],'Evento ou cenário indicado na fonte; não é cota de projeto.'],
  ['roads','Melhoramento viário',['viario','vias-estruturantes'],'Planos e interferências cartográficas; conferir vigência.'],
  ['relief','Relevo',['curvas-nivel'],'Relevo regional e curvas, quando disponíveis; não substituem levantamento.'],
  ['zoning','Zoneamento e uso',['zoneamento','perimetro-urbano','macrozoneamento'],'Enquadramento territorial e regras locais.'],
  ['water','Hidrografia e ambiente',['drenagem','ambiente','valas','massas-agua','app-hidrografia-ima','vegetacao'],'Drenagem e bases ambientais; APP exige enquadramento próprio.'],
  ['soil','Solo e geotecnia',['geotecnia','geologia'],'Contexto regional, sem substituir investigação do terreno.'],
  ['census','IBGE · setores censitários',['censo2022','censo2010'],'Malha e ano explícitos; população só quando vinculada à tabela.'],
  ['municipality','IBGE · limites municipais',['ibge-municipio'],'Divisão territorial de referência.'],
  ['rural','Cadastros rurais',['sigef','sicar','snci'],'SIGEF / SICAR / SNCI têm alcances distintos; não provam domínio.'],
  ['protected','Áreas protegidas e mineração',['unidades-conservacao','terras-indigenas','quilombolas','mineracao','patrimonio'],'Cobertura oficial e data devem acompanhar a consulta.'],
 ];
 return groups.map(([id,label,ids,note])=>{const matches=layers.filter(l=>ids.includes(l.id));let available=matches.filter(l=>l.status==='available'&&l.url);if(id==='census'&&available.some(l=>l.id==='censo2022'))available=available.filter(l=>l.id==='censo2022');return {id,label,layerIds:available.map(l=>l.id),available:id==='relief'?Array.isArray(study.geography?.center):available.length>0,default:available.some(l=>l.default),note:id==='census'&&available.length?available.map(l=>l.label).join(' · '):note,reason:matches.find(l=>l.note)?.note||'Consulta ainda não vinculada a este terreno.'};});
}
