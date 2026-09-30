/* Parcelamentos: evidência documental, programa e mercado. Sem motor financeiro paralelo. */
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,d=0)=>Number.isFinite(v)?v.toLocaleString('pt-BR',{maximumFractionDigits:d}):'—';
const brl=v=>Number.isFinite(v)?v>=1e6?`R$ ${num(v/1e6,2)} mi`:`R$ ${num(v,2)}`:'A qualificar';
const list=v=>Array.isArray(v)?v:[];
const safe=u=>typeof u==='string'&&(/^(https:\/\/|\/files\/|\/api\/studies\/)/.test(u))?u:null;
const link=(u,label)=>safe(u)?`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`:esc(label);
const metric=(label,value,note)=>`<article class="kpi"><span class="label">${esc(label)}</span><strong>${esc(value)}</strong><div class="hint">${esc(note)}</div></article>`;
const chartBox=(id,title,note)=>`<section class="card"><header class="card-head"><h2 class="section-title">${esc(title)}</h2><p>${esc(note)}</p></header><div id="${id}" class="chart"></div></section>`;
const findingCards=rows=>list(rows).map(r=>`<article class="sub-finding"><span class="sub-priority">${esc(r.severity||r.status||'Condição')}</span><div><h3>${esc(r.title)}</h3><p>${esc(r.finding||r.detail)}</p>${r.next?`<small>${esc(r.next)}</small>`:''}${r.sourceUrl?`<small>${link(r.sourceUrl,r.sourceLabel||'Consultar fonte')}</small>`:''}</div></article>`).join('');

export function subdivisionRevenue({areaM2,units,priceM2,absorption}){
 if(![areaM2,units,priceM2,absorption].every(v=>Number.isFinite(v)&&v>0)||!Number.isInteger(units))throw new Error('Área, quantidade, preço e absorção devem ser positivos.');
 return {grossRevenue:areaM2*priceM2,averageTicket:areaM2*priceM2/units,months:Math.ceil(units/absorption)};
}

export function renderSubdivisionOverview(study,volumePanel){
 const r=study.subdivisionReview,e=r.economy;
 return `<div class="subdivision-review"><div class="overview-top">${volumePanel}<section class="card thesis"><span class="eyebrow">Loteamento residencial · análise integrada</span><h2>${esc(r.thesis)}</h2><p>${esc(r.summary)}</p><div class="sub-verdict"><span>Decisão preliminar</span><strong>${esc(r.decision)}</strong></div><div class="row wrap"><a class="sub-link" href="#territory">Território e aprovação →</a><a class="sub-link" href="#scenarios">Explorar produto →</a></div></section></div>
 <div class="kpis">${metric('Gleba do projeto',num(r.areas.totalM2/10000,2)+' ha','Planta e decreto municipal')}${metric('Programa aprovado',num(r.program.totalLots)+' lotes',num(r.program.blocks)+' quadras · Decreto 170/2024')}${metric('Área dos lotes',num(r.areas.lotsM2/10000,2)+' ha','Não equivale à área livre de restrições')}${metric('Acervo indexado',num(study.documents.length)+' documentos',r.publicProjection?'Fontes públicas disponíveis para consulta':'Fontes privadas e atos públicos no dossiê')}</div>
 <section class="card card-body section-gap"><div class="row between wrap"><div><span class="eyebrow">O que muda a decisão</span><h2 class="section-title">Lastro documental, com condições determinantes</h2></div><a href="#diligence">Trilha de diligência →</a></div><div class="sub-findings">${findingCards(r.headlineFindings)}</div></section>
 <div class="grid two section-gap">${chartBox('sub-area-chart','Composição da gleba','Áreas do Decreto 170/2024 · componentes sem sobreposição contábil.')}${chartBox('sub-allocation-chart',r.publicProjection?'Programa residencial declarado':'Disponibilidade comercial declarada',r.publicProjection?'Agregado residencial; não comprova estoque disponível para venda.':'Alocação da matriz de preços · não comprova domínio nem recebimento.')}</div>
 <section class="card section-gap"><header class="card-head"><span class="eyebrow">Reconciliação do programa</span><h2 class="section-title">Aprovação, território e programa precisam representar o mesmo negócio</h2></header><div class="sub-program">${r.program.steps.map(x=>`<div><span>${esc(x.label)}</span><strong>${esc(x.value)}</strong><p>${esc(x.note)}</p></div>`).join('')}</div></section>
 <div class="grid two section-gap"><section class="card card-body"><span class="eyebrow">Mercado</span><h2 class="section-title">O prêmio de preço ainda precisa ser demonstrado</h2><p>${esc(r.market.conclusion)}</p><a href="#market">Ver ofertas qualificadas e exclusões →</a></section><section class="card card-body"><span class="eyebrow">Economia da operação</span><h2 class="section-title">Qualificar custos, prazo e capital necessário</h2><p>${esc(r.economy.conclusion)}</p><a href="#scenarios">Conferir premissas e sensibilidade →</a></section></div>
 <details class="card card-body section-gap"><summary>Documentos que sustentam esta leitura</summary><div class="sub-source-list">${r.sources.map(x=>`<p>${link(x.url,x.title)}<small>${esc(x.note)}</small></p>`).join('')}</div></details></div>`;
}

export function renderSubdivisionTerritory(study){
 const r=study.subdivisionReview;if(!r)return '';
 return `<div class="subdivision-review">${r.physical?`<div class="kpis section-gap">${metric('Variação altimétrica',num(r.physical.relief.rangeM)+' m','DSM Copernicus · pixels de 30 m')}${metric('Declividade mediana',num(r.physical.relief.slopeMedianPct,1)+'%','Superfície regional, não levantamento executivo')}${metric('Vegetação mapeada',num(r.physical.vegetationPct,1)+'%','Análise CAR 2025 · não determina supressão')}${metric('Cruzamentos oficiais',num(r.physical.environmentLayerCount+r.physical.urbanLayerCount),'Resultados por fonte; sobreposições não são somadas')}</div><div class="grid two section-gap">${chartBox('sub-slope-chart','Leitura do relevo','Distribuição dos pixels da gleba · declividade em percentual, não graus.')}${chartBox('sub-zone-chart','Zoneamento atual sobre a gleba','Cartografia contextual; regra de transição do projeto aprovado exige conferência.')}</div><section class="card card-body section-gap"><h2 class="section-title">Água, vegetação e solo orientam a implantação</h2><p>${esc(r.physical.summary)}</p><div class="sub-findings">${findingCards(r.physical.findings)}</div></section>`:''}<section class="card card-body section-gap"><span class="eyebrow">Território · regras e incidências</span><h2 class="section-title">O projeto aprovado e os condicionantes atuais</h2><div class="sub-findings">${findingCards(r.territory)}</div><details><summary>Cartucho da planta e geometria de referência</summary><p>${esc(r.geometryNote)}</p>${safe(r.planImage)?`<a href="${esc(r.planImage)}" target="_blank" rel="noopener"><img class="sub-plan" src="${esc(r.planImage)}" alt="Cartucho e quadro de áreas do projeto Pedra Histórica"></a>`:''}</details></section></div>`;
}

export function renderSubdivisionMarket(study){
 const m=study.subdivisionReview.market;
 return `<div class="subdivision-review"><section class="card card-body sub-market-lead"><span class="eyebrow">Produto residencial · valor da terra · liquidez</span><h2>${esc(m.title)}</h2><p>${esc(m.conclusion)}</p></section><div class="kpis">${metric('Ofertas de referência',num(m.offers.filter(x=>!x.excluded).length),'Natureza e porte analisados separadamente')}${metric('Negócios fechados',num(m.verifiedTransactions),'Nenhuma transação confirmada nesta curadoria')}${metric('Meta sem lagoa','R$ 700/m²','Premissa da matriz; não é estimativa de mercado')}${metric('Meta com lagoa','R$ 1.100/m²','Prêmio de 57,1% ainda a demonstrar')}</div><div class="grid two">${chartBox('sub-market-product','Lotes anunciados · preços pedidos','Referências de produto em Brumadinho; sem ajuste automático por localização.')}${chartBox('sub-market-land','Áreas maiores · preço do terreno','Glebas/parcelas com vegetação e infraestrutura distintas; não escalar ao ativo.')}</div>
 <section class="card section-gap"><header class="card-head"><h2 class="section-title">Comparabilidade antes de fazer média</h2><p>Consulta em 29/09/2026. Distâncias não foram aferidas; preços pedidos não comprovam absorção.</p></header><div class="table-wrap"><table class="sub-market-table"><thead><tr><th>Referência e fonte</th><th>Área anunciada</th><th>Preço pedido</th><th>R$/m²</th><th>Qualificação</th></tr></thead><tbody>${m.offers.map(o=>`<tr><td><strong>${esc(o.title)}</strong><small>${link(o.url,o.publisher)}</small></td><td>${num(o.areaM2,2)} m²</td><td>${brl(o.priceBrl)}</td><td>${o.excluded?'Excluído':num(o.priceBrl/o.areaM2,2)}</td><td><strong>${esc(o.groupLabel)}</strong><small>${esc(o.note)}</small></td></tr>`).join('')}</tbody></table></div></section>
 <section class="card card-body section-gap"><h2 class="section-title">Como transformar pesquisa em preço negociável</h2><div class="sub-program">${m.nextTests.map(x=>`<div><strong>${esc(x.title)}</strong><p>${esc(x.text)}</p></div>`).join('')}</div></section><details class="card card-body section-gap"><summary>Método, duplicidades e limites da amostra</summary><p>${esc(m.method)}</p><p>O valor global da gleba e o residual da operação permanecem em aberto. Nenhuma média dos produtos anunciados foi multiplicada pela área total do projeto.</p></details></div>`;
}

export function renderSubdivisionScenarios(study){
 const r=study.subdivisionReview,e=r.economy,g=e.groups.Grupo;
 return `<div class="subdivision-review"><section class="card card-body"><span class="eyebrow">Produto principal · loteamento residencial de baixa densidade</span><h2>Qualificar o programa antes de adotar o retorno</h2><p>${esc(e.conclusion)}</p><div class="sub-verdict"><span>Leitura da planilha recebida</span><strong>Retorno da transação ainda não demonstrado</strong></div></section>
 <section class="card section-gap"><header class="card-head"><span class="eyebrow">Exploração paramétrica · receita e velocidade</span><h2 class="section-title">Qual receita o programa exige do mercado?</h2><p>Base: ${num(g.count)} lotes e ${num(g.areaM2,2)} m² ${r.publicProjection?'do programa residencial declarado. Agregado de análise; não comprova estoque livre ou disponível.':'alocados ao Grupo na matriz. Alocação sujeita à conciliação contratual.'}</p></header><div class="sub-simulator"><div class="sub-sliders"><label for="sub-price">Preço uniforme ${r.publicProjection?'do programa residencial':'do Grupo'} · R$/m² <output id="sub-price-label">R$ 700</output><input id="sub-price" type="range" min="200" max="1300" step="25" value="700"></label><div class="row wrap"><button data-sub-price="425">Oferta selecionada · R$ 425</button><button data-sub-price="700">Meta sem lagoa</button><button data-sub-price="1100">Meta com lagoa</button></div><label for="sub-absorption">Contratações por mês <output id="sub-absorption-label">4 lotes</output><input id="sub-absorption" type="range" min="1" max="12" step="0.5" value="4"></label><p class="tiny muted">Preço uniforme não reproduz os pesos individuais da matriz. Velocidade é hipótese uniforme. Prazo começa após liberação para comercializar. Não inclui carência, distratos ou recebimento parcelado.</p></div><div class="sub-sim-results" aria-live="polite"><div><span>Receita bruta potencial</span><strong id="sub-gross">—</strong></div><div><span>Ticket médio</span><strong id="sub-ticket">—</strong></div><div><span>Prazo para contratar o estoque</span><strong id="sub-months">—</strong></div></div></div><div id="sub-sales-chart" class="chart"></div><div class="card-body small muted">Receita bruta não é caixa nem lucro. Preço-alvo com lagoa não contém, por si, custo incremental, remuneração tecnológica, outorga ou demanda comprovada.</div></section>
 <div class="grid two section-gap">${chartBox('sub-cost-chart','Duas bases de custo a conciliar','Orçamento e verba de infraestrutura têm escopos próprios; não são somáveis.')}${!r.publicProjection?chartBox('sub-cmx-chart',num(e.groups.CMX.count)+' lotes · premissa de valor na matriz','Meta financeira da planilha não equivale à obrigação contratual da permuta.'):''}</div>
 <section class="card card-body section-gap"><h2 class="section-title">Auditoria das planilhas e do caixa</h2><div class="sub-findings">${findingCards(e.findings)}</div><p class="small muted">${r.publicProjection?'Estimativas agregadas recebidas, sujeitas à conciliação de escopo e data-base. O ensaio de receita não calcula retorno da aquisição.':'Caches originais preservados, sem recálculo do Excel. Somas, fórmulas e alocação conferidas. Resultados do modelo recebido não foram adotados como retorno da aquisição.'}</p></section>
 <section class="card section-gap"><header class="card-head"><span class="eyebrow">Cenários adicionais · depois da tese principal</span><h2 class="section-title">Investigar sem antecipar o prêmio</h2></header><div class="sub-program">${r.alternatives.map(x=>`<div><strong>${esc(x.title)}</strong><p>${esc(x.test)}</p><small>Descartar se: ${esc(x.kill)}</small></div>`).join('')}</div></section></div>`;
}

export function bindSubdivisionCharts(study,chart,mode='overview'){
 const r=study.subdivisionReview;if(!r)return;
 const bar=(id,items,unit='R$ milhões')=>chart(id,{chart:{type:'bar',height:310},series:[{name:unit,data:items.map(x=>x.value)}],plotOptions:{bar:{horizontal:true,barHeight:'45%',borderRadius:3,distributed:true}},legend:{show:false},xaxis:{categories:items.map(x=>x.label),labels:{formatter:v=>num(Number(v),2)}},tooltip:{y:{formatter:v=>num(v,2)+' '+unit}}});
 if(mode==='overview'){
  const a=r.areas;chart('sub-area-chart',{chart:{type:'donut',height:320},series:[a.lotsM2,a.roadsM2,a.institutionalM2,a.greenM2,a.appM2,a.remainderM2].map(v=>v/10000),labels:['Lotes','Viário','Institucional','Verde','APP no projeto','Remanescente'],colors:['#9C745B','#C0AA97','#8C977E','#57705C','#96B2BC','#DDD5C3'],stroke:{width:3,colors:['#FCFBF7']},plotOptions:{pie:{donut:{size:'70%'}}},tooltip:{y:{formatter:v=>num(v,2)+' ha'}}});
  bar('sub-allocation-chart',Object.entries(r.economy.groups).map(([label,g])=>({label:r.publicProjection?'Programa residencial':label,value:g.count})),'lotes');
 }
 if(mode==='territory'&&r.physical){
  bar('sub-slope-chart',r.physical.relief.slopeDistribution.map(x=>({label:x.label,value:x.percent})),'% dos pixels');
  bar('sub-zone-chart',r.physical.zones.map(x=>({label:x.zone,value:x.percentGleba})),'% da gleba');
 }
 if(mode==='market'){
  const o=r.market.offers.filter(x=>!x.excluded);
  bar('sub-market-product',o.filter(x=>x.group==='product').map(x=>({label:x.chartLabel,value:x.priceBrl/x.areaM2})),'R$/m² anunciado');
  bar('sub-market-land',o.filter(x=>x.group==='land').map(x=>({label:x.chartLabel,value:x.priceBrl/x.areaM2})),'R$/m² anunciado');
 }
 if(mode==='scenarios'){
  const e=r.economy,g=e.groups.Grupo;
  bar('sub-cost-chart',[{label:'Orçamento total',value:e.budget.total/1e6},{label:'Infraestrutura · viabilidade',value:e.originalFeasibility.infrastructureBudget/1e6}]);
  if(!r.publicProjection)bar('sub-cmx-chart',[{label:'Sem lagoa · matriz',value:e.groups.CMX.vgvWithoutLagoon/1e6},{label:'Com lagoa · matriz',value:e.groups.CMX.vgvWithLagoon/1e6}]);
  const price=document.getElementById('sub-price'),absorption=document.getElementById('sub-absorption');
  function update(){
   const p=Number(price.value),a=Number(absorption.value),s=subdivisionRevenue({areaM2:g.areaM2,units:g.count,priceM2:p,absorption:a});
   document.getElementById('sub-price-label').textContent='R$ '+num(p);
   document.getElementById('sub-absorption-label').textContent=num(a,1)+' lotes';
   document.getElementById('sub-gross').textContent=brl(s.grossRevenue);
   document.getElementById('sub-ticket').textContent=brl(s.averageTicket);
   document.getElementById('sub-months').textContent=num(s.months)+' meses';
   // A chart of milestones has no discounting, funding, IRR or cash inference.
   const container=document.getElementById('sub-sales-chart');
   if(container._salesChart){container._salesChart.destroy();container._salesChart=null;}
   const milestones=[0,.25,.5,.75,1].map(f=>({x:Math.ceil(s.months*f),y:s.grossRevenue*f/1e6}));
   if(globalThis.ApexCharts){const instance=new globalThis.ApexCharts(container,{chart:{type:'area',height:235,toolbar:{show:false},animations:{enabled:false},fontFamily:'Inter, Arial, sans-serif'},colors:['#57705C'],dataLabels:{enabled:false},series:[{name:'Contratado acumulado · R$ mi',data:milestones}],stroke:{curve:'straight',width:2},fill:{opacity:.12,type:'solid'},xaxis:{type:'numeric',title:{text:'Meses de comercialização · marcos ilustrativos'}},yaxis:{labels:{formatter:v=>'R$ '+num(v,0)+' mi'}},tooltip:{y:{formatter:v=>brl(v*1e6)}}});container._salesChart=instance;instance.render();}
  }
  price.addEventListener('input',update);absorption.addEventListener('input',update);document.querySelectorAll('[data-sub-price]').forEach(b=>b.onclick=()=>{price.value=b.dataset.subPrice;update();});update();
 }
}

export function destroySubdivisionCharts(){const el=globalThis.document?.getElementById('sub-sales-chart');el?._salesChart?.destroy();if(el)el._salesChart=null;}
