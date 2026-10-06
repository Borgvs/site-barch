/** Public-safe physical verification plan. Evidence does not certify legal regularity. */
export const FIELD_PROTOCOL='barch-field-2.0.0';
const topics=[
 ['perimeter','Divisas, marcos e área','P0','Confrontar cercas e marcos com o perímetro apresentado; identificar divergências e pontos acessíveis.','Croqui orientado, fotos dos marcos e levantamento por profissional habilitado quando divergente.','Área disponível e preço por m²'],
 ['water','Água, drenagem e inundação','P0','Percorrer as margens e drenagens acessíveis. Registrar leito, largura aparente, regime relatado, marcas de cheia e obstáculos.','Fotos orientadas, pontos GPS e cotas de referência; encaminhar caracterização hídrica e cotas técnicas.','APP, área aproveitável, aterro e mitigação'],
 ['access','Acesso legal e operacional','P0','Verificar frente, largura, pavimento, rotas de veículos, portões e interferências no acesso.','Fotos da fachada e rota; medir seção e registrar titularidade documental pendente.','Uso, circulação e viabilidade de acesso'],
 ['soil','Solo, relevo e preparação','P1','Registrar declives, aterros, erosão, contenções, afloramentos, resíduos e sinais de instabilidade.','Fotos e localização dos indícios; orçamento de topografia/sondagem quando necessário.','Preparação, fundações, prazo e custo'],
 ['vegetation','Vegetação e elementos protegidos','P0','Mapear manchas, árvores isoladas, margens e indícios de regeneração; não classificar estágio apenas por fotografia.','Fotos panorâmicas e pontos; inventário/caracterização técnica para intervenção.','Supressão, compensação e área utilizável'],
 ['utilities','Redes e infraestrutura','P1','Identificar energia, água, esgoto, drenagem e telecomunicações aparentes; registrar distância e capacidade informada.','Fotos das redes; consulta à concessionária e orçamento de conexão.','Implantação e carregamento'],
 ['occupation','Ocupação, direitos e passivos','P0','Registrar ocupantes, benfeitorias, uso atual, resíduos, tanques e conflitos relatados sem coletar dados pessoais desnecessários.','Fotos e relato atribuído; documentação e investigação técnica/jurídica específica.','Posse, desocupação e contingências'],
 ['surroundings','Entorno e referências de terra','P1','Verificar vizinhos, ruído, odores, atividades, segurança, acessos e ofertas de terrenos substitutos.','Endereço/URL público, área, preço pedido, condição e data; confirmar identidade e fonte.','Liquidez, comparabilidade e valor'],
];
export function buildFieldPlan({study,assessment=null}={}){
 const pending=(assessment?.regulatory?.axes??[]).flatMap(a=>(a.actions??[]).map(x=>({...x,axis:a.label}))),seen=new Set();
 const specialist=pending.filter(x=>x.scope!=='automatic'&&x.scope!=='field').filter(x=>{const k=x.id??x.label;if(seen.has(k))return false;seen.add(k);return true;}).map(x=>({id:x.id,label:x.label,scope:x.scope,priority:x.priority??'P1',evidence:x.exitEvidence??'Documento e revisão competente',axis:x.axis}));
 const automatic=pending.filter(x=>x.scope==='automatic').map(x=>({id:x.id,label:x.label,priority:x.priority??'P1',axis:x.axis}));
 const conditions=(study.checks??[]).filter(c=>!/confirmad|concluid|regularizado/i.test(c.status??'')).map(c=>({axis:c.axis,finding:c.finding,action:c.action,status:c.status}));
 return {protocolVersion:FIELD_PROTOCOL,slug:study.slug,title:study.title,municipality:study.municipality,uf:study.uf,referenceDate:study.revisedAsOf??study.asOf,verificationId:assessment?.verification?.id??study.verification?.id??null,planKey:`${FIELD_PROTOCOL}:${study.slug}:${assessment?.verification?.id??study.verification?.id??'unverified'}`,tasks:topics.map(([id,label,priority,instruction,evidence,impact])=>({id,label,priority,instruction,evidence,impact,questions:['Resultado da verificação','O que foi observado ou relatado?','Medida / referência / fonte','Limitação e próxima ação']})),conditions,specialist,automatic,sources:(study.sources??[]).filter(s=>{try{return new URL(s.url).protocol==='https:';}catch{return false;}}).slice(0,40).map(s=>({title:s.title,url:s.url,date:s.date??null})),scope:'observations_for_review',investmentApproved:false};
}
export function normalizeFieldResponses(responses,plan){
 if(!Array.isArray(responses)||responses.length>plan.tasks.length)throw Error('Respostas de campo inválidas.');
 const seen=new Set(),states=['not_checked','observed','indication','not_accessible','not_applicable'];
 const text=(v,n)=>{if(typeof v!=='string'||v.length>n)throw Error('Texto de campo inválido.');return v.trim();};
 return responses.map(x=>{if(!plan.tasks.some(t=>t.id===x.taskId)||seen.has(x.taskId)||!states.includes(x.state))throw Error('Item ou resultado de campo inválido.');seen.add(x.taskId);return {taskId:x.taskId,state:x.state,observation:text(x.observation??'',2000),measurement:text(x.measurement??'',500),nextAction:text(x.nextAction??'',1000)};});
}
export function stableJson(value){const order=v=>Array.isArray(v)?v.map(order):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,order(v[k])])):v;return JSON.stringify(order(value));}
