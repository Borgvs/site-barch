import {MassView} from './mass-view.js';
const API_ROOT=document.documentElement.dataset.motor==='local-online'?'http://127.0.0.1:5188':'';
const $ = id => document.getElementById(id);
const clone = value => structuredClone(value);
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => new Intl.NumberFormat('pt-BR', {maximumFractionDigits:2}).format(n);
const uses = {residential:'Residencial',parking:'Estacionamento',leisure:'Lazer',retail:'Comércio',landscape:'Paisagismo',unassigned:'Sem uso definido'};
const colors = {residential:'#bd9c88',parking:'#bcc2ca',leisure:'#a5bca0',retail:'#c7b296',landscape:'#a0b49d',unassigned:'#d8d8de',preservation:'#88b8c7',road:'#777c85'};
let caseData, state, map, tiles, contextLayer, zones, handles, roadPreview, pending, revision = 0, result = null;
let undo = [], redo = [], drawing = false, draft = [], abort = null;
const LOCAL_KEY = 'barch-penha-mvp-v1';
const massDefaults={setback:4,scaleX:1,scaleY:1,floors:10,clearHeight:2.7,plenum:.15,slab:.25,groundUse:'parking'};
let massView,massData=null,massVersion=0,massBusy=false,massDirty=false,massAuto=false,massTimer,rhinoReady=false;
function clearMass(){massVersion++;massData=null;$('mass-metrics').replaceChildren();$('mass-artifacts').hidden=true;$('mass-empty').hidden=state.stage!=='mass';$('mass-view').hidden=true;massView?.clear();}
function refreshMassControls(){state.mass??={...massDefaults};for(const k of Object.keys(massDefaults))$('mass-'+k).value=state.mass[k]??massDefaults[k];}
function refreshMassSectors(){const eligible=(result?.entities||[]).filter(e=>!e.fixed&&e.use in uses);const selected=eligible.find(e=>e.id===state.massSectorId&&e.connected)?.id||eligible.find(e=>e.use==='residential'&&e.connected)?.id||eligible.find(e=>e.connected)?.id;$('mass-sector').innerHTML=eligible.map(e=>`<option value="${esc(e.id)}" ${e.id===selected?'selected':''} ${!e.connected?'disabled':''}>${esc(state.program.find(p=>p.id===e.id)?.name||e.use)} · ${fmt(e.area)} m²${e.connected?'':' · partes separadas'}</option>`).join('');state.massSectorId=$('mass-sector').value;$('run-rhino').disabled=massBusy||!eligible.some(e=>e.connected);}
async function checkRhino(){ $('rhino-connection').textContent='Verificando o serviço de scripts…';try{const response=await fetch(API_ROOT+'/api/rhino/status');if(!response.ok)throw new Error('Conexão recusada.');const data=await response.json();rhinoReady=data.available;$('rhino-connection').textContent=data.message;$('connect-motor').textContent=rhinoReady?'Motor conectado':'Conectar motor deste computador';status(data.message,!rhinoReady);return rhinoReady;}catch(e){rhinoReady=false;$('rhino-connection').textContent=API_ROOT?'Motor local indisponível. Inicie o conector Barch e permita o acesso à rede local no navegador.':'Não foi possível verificar a conexão.';status($('rhino-connection').textContent,true);return false;}}
async function runMass(){
  if(massBusy){massDirty=true;return;}if(!current()||!state.massSectorId){status('Conclua uma setorização válida e selecione um setor contínuo.',true);return;}
  const requested=massVersion,siteRevision=revision;massBusy=true;massDirty=false;massAuto=true;$('run-rhino').disabled=true;$('run-rhino').textContent='Calculando no Rhino…';status('Executando recuo, laje e extrusão real no Rhino/Grasshopper…');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),95000);
  try{const response=await fetch(API_ROOT+'/api/rhino/mass',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,angle:state.angle,paths:state.paths,program:state.program,sectorId:state.massSectorId,mass:state.mass}),signal:controller.signal});const data=await response.json();if(requested!==massVersion||siteRevision!==revision||state.stage!=='mass')return;if(!response.ok)throw new Error(data.error);if(data.revision!==revision||data.boundaryHash!==caseData.boundaryHash||!data.grasshopperExecuted||!data.rhinoExecuted)throw new Error('Resposta sem comprovação de execução ou de revisão.');
    massData=data;rhinoReady=true;$('rhino-connection').textContent=`Executado: Rhino ${data.rhinoVersion} · Grasshopper ${data.grasshopperVersion}`;
    massView??=new MassView($('mass-view'));$('mass-view').hidden=false;$('mass-empty').hidden=true;massView.show(data,caseData.boundary,caseData.fixed);
    $('mass-metrics').innerHTML=[['Área da laje',fmt(data.plateAreaM2)+' m²'],['Área bruta de pavimentos',fmt(data.grossFloorAreaM2)+' m²'],['Altura total',fmt(data.heightM)+' m'],['Piso a piso',fmt(data.floorHeightM)+' m'],['Volume fechado',fmt(data.volumeM3)+' m³'],['Tempo de ida e volta',fmt(data.roundTripMs)+' ms']].map(([a,b])=>`<div class="result-line"><span>${a}</span><strong>${b}</strong></div>`).join('');$('download-3dm').href=`${API_ROOT}/api/rhino/artifacts/${data.artifactId}/study.3dm`;$('download-gh').href=`${API_ROOT}/api/rhino/artifacts/${data.artifactId}/mass.gh`;$('mass-artifacts').hidden=false;status('Massa Rhino/GH validada: sólido fechado, área e posição conferidas.');
  }catch(e){if(requested!==massVersion||siteRevision!==revision)return;clearMass();massAuto=false;$('rhino-connection').textContent=e.name==='AbortError'?'Tempo de resposta excedido; nenhuma massa aprovada.':e.message;status($('rhino-connection').textContent,true);}
  finally{clearTimeout(timer);massBusy=false;$('run-rhino').disabled=false;$('run-rhino').textContent='Calcular no Rhino/Grasshopper';if(massDirty&&massAuto&&state.stage==='mass')runMass();}
}
function changedMass(){clearMass();historyButtons();clearTimeout(massTimer);if(massBusy)massDirty=true;else if(massAuto&&rhinoReady)massTimer=setTimeout(runMass,700);}

function status(text, error=false) { $('status').textContent = text; $('status').dataset.error=String(error); }
function toGeo(p) { const [x,y] = caseData.projection.originProjected; const q = proj4(caseData.projection.proj4,'EPSG:4326',[p[0]+x,p[1]+y]); return [q[1],q[0]]; }
function toLocal(p) { const q=proj4('EPSG:4326',caseData.projection.proj4,[p.lng,p.lat]); return q.map((v,i)=>v-caseData.projection.originProjected[i]); }
function geographical(g) { return {type:g.type, coordinates:convert(g.coordinates)}; }
function convert(c) { if(typeof c[0] === 'number') {const q=toGeo(c);return [q[1],q[0]];} return c.map(convert); }
function remember() { undo.push(clone(state)); if(undo.length>100)undo.shift();redo=[]; }
function historyButtons() { $('undo').disabled=!undo.length; $('redo').disabled=!redo.length; }
function change(fn, rememberChange=true) { if(rememberChange)remember();fn(state);revision++;updateChrome();schedule(); }
function current() { return result && result.revision === revision && ['site','mass'].includes(state.stage); }
function schedule() {
  clearTimeout(pending);abort?.abort();result=null;zones?.clearLayers();$('export').disabled=true;updateAreaLabels();$('timing').textContent='';
  clearMass();$('to-mass').disabled=true;
  if(!['site','mass'].includes(state.stage)) { $('result-summary').hidden=true;status('Base de estudo preservada · nenhuma implantação gerada.');return; }
  status('Recalculando setores…');
  pending=setTimeout(calculate,80);
}
function errorMessage(message) {
  if(message.startsWith('Path overlaps'))return 'Rua cruza uma reserva cautelar. Reposicione os vértices; esta proposta foi recusada.';
  if(message.startsWith('Path does not intersect'))return 'Rua fora do terreno. Reposicione o traçado.';
  if(message.startsWith('sector target'))return 'Os pesos devem ser números maiores que zero.';
  if(message.startsWith('Disconnected sector'))return 'A divisão produziu partes separadas e foi recusada.';
  return message;
}
async function calculate() {
  const requestedRevision=revision;const controller=new AbortController();abort=controller;
  const timer=setTimeout(()=>controller.abort(),8000);
  try {
    const response=await fetch(API_ROOT+'/api/solve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:requestedRevision,angle:state.angle,paths:state.paths,program:state.program}),signal:controller.signal});
    const data=await response.json();if(requestedRevision!==revision)return;
    if(!response.ok)throw new Error(errorMessage(data.error||'Não foi possível calcular.'));
    if(data.boundaryHash!==caseData.boundaryHash||data.revision!==requestedRevision)throw new Error('Resposta incompatível com o terreno ou a revisão atual.');
    result=data;paint();updateAreaLabels();refreshMassSectors();$('to-mass').disabled=false;$('export').disabled=false;$('result-summary').hidden=state.stage!=='site';
    const split=data.entities.filter(e=>!e.fixed&&e.use!=='road'&&!e.connected).length;
    status(split?`Geometria recalculada · ${split} setor(es) com partes separadas; reveja a divisão.`:'Geometria recalculada · áreas conservadas e reservas preservadas.');
    $('timing').textContent=`Cálculo local ${fmt(data.receipt.durationMs)} ms · revisão ${revision}`;
    $('results').innerHTML=[['Área do terreno',data.checks.boundaryArea],['Reserva cautelar',caseData.reserveAreaM2],['Ruas',data.entities.filter(e=>e.use==='road').reduce((a,e)=>a+e.area,0)],['Setores',data.entities.filter(e=>!e.fixed&&e.use!=='road').reduce((a,e)=>a+e.area,0)],['Sobreposição',data.checks.overlapArea],['Área fora do terreno',data.checks.outsideArea]].map(([k,v])=>`<div class="result-line"><span>${k}</span><span>${fmt(Math.abs(v)<1e-7?0:v)} m²</span></div>`).join('');
  } catch(e) {
    if(requestedRevision!==revision)return;
    result=null;zones.clearLayers();$('result-summary').hidden=true;$('export').disabled=true;
    status(e.name==='AbortError'?'Cálculo interrompido ou excedeu 8 segundos. Altere o parâmetro para tentar novamente.':e.message,true);
  } finally {clearTimeout(timer);}
}
function paint() {
  zones.clearLayers();if(!current())return;
  for(const e of result.entities) {
    if(e.fixed)continue;
    const feature={type:'Feature',properties:{id:e.id},geometry:geographical(e.geometry)};
    const layer=L.geoJSON(feature,{style:{color:e.use==='road'?'#626671':'#fff',weight:1.4,fillColor:colors[e.use],fillOpacity:.72}}).addTo(zones);
    const name=state.program.find(s=>s.id===e.id)?.name||'Rua de estudo';
    if(e.use!=='road')L.tooltip({permanent:true,direction:'center',className:'zone-label',interactive:false}).setLatLng(toGeo(e.labelPoint)).setContent(`${esc(name)}<br>${fmt(e.area)} m²${e.connected?'':` · ${e.partCount} partes`}`).addTo(zones);
    layer.on('click',()=>status(`${name}: ${fmt(e.area)} m² · ${e.connected?'contínuo':e.partCount+' partes separadas'}`));
  }
}
function renderRows() {
  $('sectors').innerHTML=state.program.map(p=>{
    const e=current()?result.entities.find(v=>v.id===p.id):null;
    return `<div class="sector-row" data-id="${esc(p.id)}"><div class="row-head"><span class="swatch" style="background:${colors[p.use]}"></span><select aria-label="Uso do setor ${esc(p.id)}">${Object.entries(uses).map(([k,v])=>`<option value="${k}" ${p.use===k?'selected':''}>${v}</option>`).join('')}</select><button data-remove="${esc(p.id)}" aria-label="Remover setor ${esc(p.id)}" ${state.program.length===1?'disabled':''}>Remover</button></div><div class="row-details"><label>Peso <input aria-label="Peso do setor ${esc(p.id)}" type="number" min="1" max="1000" value="${p.weight}"></label><span data-area>${e?fmt(e.area)+' m²':'A calcular'}</span></div><div class="split-note" data-parts>${e&&!e.connected?`${e.partCount} partes separadas · revisar divisão`:''}</div></div>`;
  }).join('');
  for(const row of $('sectors').children){const id=row.dataset.id;row.querySelector('select').onchange=e=>change(s=>{const p=s.program.find(p=>p.id===id);p.use=e.target.value;p.name=uses[p.use];});bindNumber(row.querySelector('input'),value=>{state.program.find(p=>p.id===id).weight=value;});row.querySelector('button').onclick=()=>change(s=>{s.program=s.program.filter(p=>p.id!==id);});}
  $('roads').innerHTML=state.paths.length?state.paths.map((p,i)=>`<div class="road-row" data-id="${esc(p.id)}"><div class="row-head"><strong>Rua ${i+1}</strong><button style="margin-left:auto" aria-label="Remover rua ${i+1}">Remover</button></div><div class="row-details"><label>Largura (m) <input aria-label="Largura da rua ${i+1}" type="number" min="1" max="30" step="0.5" value="${p.width}"></label><span>${p.geometry.coordinates.length} vértices</span></div></div>`).join(''):'<p class="small">Nenhuma rua. Use “Desenhar rua” no mapa.</p>';
  for(const row of $('roads').children){if(!row.dataset.id)continue;const id=row.dataset.id;bindNumber(row.querySelector('input'),value=>{state.paths.find(p=>p.id===id).width=value;});row.querySelector('button').onclick=()=>change(s=>{s.paths=s.paths.filter(p=>p.id!==id);});}
  $('road-count').textContent=state.paths.length?String(state.paths.length):'';
}
function bindNumber(input,apply) {
  input.oninput=()=>{if(!input.dataset.editing){remember();input.dataset.editing='true';}apply(Number(input.value));revision++;historyButtons();schedule();};
  input.onblur=()=>{delete input.dataset.editing;};
}
function updateAreaLabels() {
  for(const row of $('sectors').children){const e=current()?result.entities.find(v=>v.id===row.dataset.id):null;row.querySelector('[data-area]').textContent=e?fmt(e.area)+' m²':'A calcular';row.querySelector('[data-parts]').textContent=e&&!e.connected?`${e.partCount} partes separadas · revisar divisão`:'';}
}
function renderHandles() {
  handles.clearLayers();roadPreview.clearLayers();if(state.stage!=='site')return;
  for(const path of state.paths) {
    const line=L.polyline(path.geometry.coordinates.map(toGeo),{color:'#806152',weight:2,dashArray:'5,5',interactive:false}).addTo(roadPreview);
    path.geometry.coordinates.forEach((point,index)=>{
      const marker=L.marker(toGeo(point),{draggable:true,icon:L.divIcon({className:'vertex',iconSize:[16,16],iconAnchor:[8,8]})}).addTo(handles);
      marker.on('dragstart',()=>remember());
      marker.on('drag',()=>{state.paths.find(p=>p.id===path.id).geometry.coordinates[index]=toLocal(marker.getLatLng());revision++;line.setLatLngs(path.geometry.coordinates.map(toGeo));historyButtons();schedule();});
      marker.on('dragend',()=>{updateChrome();schedule();});
      marker.bindTooltip('Arraste para reposicionar o vértice',{direction:'top'});
    });
  }
  if(draft.length)L.polyline(draft.map(toGeo),{color:'#806152',weight:3,dashArray:'6,5',interactive:false}).addTo(roadPreview);
}
function updateChrome() {
  $('project-title').textContent=state.name;$('project-name').value=state.name;
  document.querySelectorAll('[data-stage]').forEach(b=>{if(b.dataset.stage===state.stage)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  for(const stage of ['terrain','qualification','site','mass'])$(stage+'-panel').hidden=stage!==state.stage;
  const massStage=state.stage==='mass';$('map').hidden=massStage;document.querySelector('.map-tools').hidden=massStage;document.querySelector('.map-caption').hidden=massStage;
  $('mass-view').hidden=!massStage||!massData;$('mass-empty').hidden=!massStage||!!massData;refreshMassControls();
  $('draw-tools').hidden=state.stage!=='site';$('angle').value=state.angle;$('angle-value').textContent=state.angle+'°';
  renderRows();renderHandles();historyButtons();
}
function go(stage) { cancelDrawing();change(s=>{s.stage=stage;});document.querySelector('.inspector').scrollTop=0;if(stage==='mass')checkRhino();else map.invalidateSize(); }
function cancelDrawing(){drawing=false;draft=[];$('draw').hidden=false;$('finish').hidden=true;$('cancel').hidden=true;map.getContainer().style.cursor='';renderHandles();}
function finishDrawing(){if(draft.length<2){status('Marque pelo menos dois pontos para a rua.',true);return;}const points=clone(draft);cancelDrawing();change(s=>{s.paths.push({id:'rua-'+crypto.randomUUID(),use:'road',width:8,geometry:{type:'LineString',coordinates:points}});});}
function download(name,value){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function validState(s){return s&&typeof s.name==='string'&&s.name.length<=100&&['terrain','qualification','site','mass'].includes(s.stage)&&Number.isFinite(s.angle)&&Math.abs(s.angle)<=90&&Array.isArray(s.paths)&&s.paths.length<=10&&Array.isArray(s.program)&&s.program.length>=1&&s.program.length<=20&&s.program.every(p=>typeof p.id==='string'&&p.id.length<100&&typeof p.name==='string'&&p.name.length<100&&p.use in uses&&Number.isFinite(p.weight)&&p.weight>0)&&s.paths.every(p=>typeof p.id==='string'&&p.use==='road'&&Number.isFinite(p.width)&&p.width>=1&&p.width<=30&&p.geometry?.type==='LineString'&&Array.isArray(p.geometry.coordinates)&&p.geometry.coordinates.length>=2&&p.geometry.coordinates.length<=30&&p.geometry.coordinates.every(c=>Array.isArray(c)&&c.length===2&&c.every(Number.isFinite)));}
async function init(){
  caseData=await (await fetch(new URL('./data/case.json',import.meta.url))).json();state=clone(caseData.initialState);
  map=L.map('map',{zoomSnap:.25,doubleClickZoom:false}).setView([caseData.center[1],caseData.center[0]],17);
  tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  tiles.on('tileerror',()=>{$('map-caption').textContent='Mapa de fundo indisponível em alguns trechos · geometria local preservada';});
  const boundary=L.geoJSON(caseData.boundaryWgs84,{style:{color:'#494349',weight:2,fillColor:'#e9e9ed',fillOpacity:.13,interactive:false}}).addTo(map);
  const fit=()=>map.fitBounds(boundary.getBounds(),{padding:[50,65],animate:false});fit();map.on('resize',fit);
  zones=L.layerGroup().addTo(map);
  for(const r of caseData.fixed)L.geoJSON(geographical(r.geometry),{style:{color:'#528fa5',weight:1.4,fillColor:colors.preservation,fillOpacity:.5,interactive:false}}).addTo(map);
  roadPreview=L.layerGroup().addTo(map);handles=L.layerGroup().addTo(map);L.control.scale({imperial:false}).addTo(map);
  $('boundary-area').textContent=fmt(caseData.boundaryAreaM2)+' m²';$('documentary-area').textContent=fmt(caseData.documentaryAreaM2)+' m²';$('reserve-area').textContent=fmt(caseData.reserveAreaM2)+' m²';
  $('fit').onclick=fit;$('basemap').onclick=()=>{const shown=map.hasLayer(tiles);shown?map.removeLayer(tiles):tiles.addTo(map);$('basemap').setAttribute('aria-pressed',String(!shown));};
  $('context').onclick=async()=>{
    if(!contextLayer){const data=await(await fetch(new URL('./data/context-buildings.geojson',import.meta.url))).json();contextLayer=L.geoJSON(data,{style:{color:'#a9a9b1',weight:1,fillColor:'#b8b8bf',fillOpacity:.2}});contextLayer.bindTooltip('Edificação mapeada em OSM · altura não observada');}
    const shown=map.hasLayer(contextLayer);shown?map.removeLayer(contextLayer):contextLayer.addTo(map);$('context').setAttribute('aria-pressed',String(!shown));
  };
  document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>go(b.dataset.stage));$('to-qualification').onclick=()=>go('qualification');$('to-site').onclick=()=>go('site');
  $('to-mass').onclick=()=>go('mass');$('check-rhino').onclick=checkRhino;$('run-rhino').onclick=runMass;
  $('connect-motor').onclick=async()=>{if(await checkRhino())schedule();};
  $('mass-sector').onchange=e=>{remember();state.massSectorId=e.target.value;changedMass();};
  for(const k of Object.keys(massDefaults)){const input=$('mass-'+k);input.oninput=()=>{if(!input.dataset.editing){remember();input.dataset.editing='true';}state.mass??={...massDefaults};state.mass[k]=k==='groundUse'?input.value:Number(input.value);changedMass();};input.onblur=()=>{delete input.dataset.editing;};}
  $('project-name').oninput=e=>{if(!e.target.dataset.editing){remember();e.target.dataset.editing='true';}state.name=e.target.value.trim()||'Penha · estudo de validação';$('project-title').textContent=state.name;historyButtons();};
  $('project-name').onblur=e=>{delete e.target.dataset.editing;};
  $('angle').onpointerdown=()=>remember();$('angle').onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key))remember();};
  $('angle').oninput=e=>change(s=>{s.angle=Number(e.target.value);},false);
  $('add-sector').onclick=()=>{if(state.program.length>=20)return;change(s=>{s.program.push({id:'setor-'+crypto.randomUUID(),use:'unassigned',name:'Sem uso definido',weight:10});});};
  $('draw').onclick=()=>{if(state.paths.length>=10){status('Limite de 10 ruas nesta prova.',true);return;}drawing=true;draft=[];$('draw').hidden=true;$('finish').hidden=false;$('cancel').hidden=false;map.getContainer().style.cursor='crosshair';status('Clique para marcar os vértices. Conclua com o botão ou Enter; Esc cancela.');};
  $('finish').onclick=finishDrawing;$('cancel').onclick=cancelDrawing;
  map.on('click',e=>{if(!drawing)return;if(draft.length>=30)return;draft.push(toLocal(e.latlng));renderHandles();status(`${draft.length} ponto(s) · marque o próximo ou conclua a rua.`);});
  document.addEventListener('keydown',e=>{if(drawing&&e.key==='Escape')cancelDrawing();if(drawing&&e.key==='Enter')finishDrawing();});
  $('undo').onclick=()=>{if(!undo.length)return;cancelDrawing();redo.push(clone(state));state=undo.pop();revision++;updateChrome();schedule();};
  $('redo').onclick=()=>{if(!redo.length)return;cancelDrawing();undo.push(clone(state));state=redo.pop();revision++;updateChrome();schedule();};
  $('new').onclick=()=>{cancelDrawing();remember();state=clone(caseData.initialState);revision++;updateChrome();document.querySelector('.inspector').scrollTop=0;schedule();status('Novo estudo de Penha · terreno preservado e implantação vazia.');};
  $('save').onclick=()=>{if(!validState(state)){status('Corrija os parâmetros inválidos antes de salvar.',true);return;}const payload={schema:'barch.penhamvp.project.v1',caseId:caseData.id,boundaryHash:caseData.boundaryHash,state:clone(state)};localStorage.setItem(LOCAL_KEY,JSON.stringify(payload));download('penha-estudo.json',payload);status('Estudo salvo neste navegador e exportado em JSON.');};
  $('open').onclick=()=>{$('file').click();};
  $('file').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>100000)throw new Error('Arquivo excede 100 KB.');const data=JSON.parse(await file.text());if(data.schema!=='barch.penhamvp.project.v1'||data.caseId!==caseData.id||data.boundaryHash!==caseData.boundaryHash||!validState(data.state))throw new Error('Arquivo não corresponde à base de Penha ou possui parâmetros inválidos.');remember();state=clone(data.state);revision++;updateChrome();schedule();}catch(err){status(err.message,true);}finally{e.target.value='';}};
  $('export').onclick=()=>{if(!current())return;download('penha-geometria-local.json',{...result,projection:caseData.projection,coordinateWarning:'Coordenadas locais em metros; usar origem projetada para GIS. Não é GeoJSON WGS84.',program:state.program,architecturalScope:'geometric_sectorization_only',normativeCompliance:'not_evaluated'});};
  updateChrome();status('Base de Penha carregada · avance para qualificação e setorização.');
}
init().catch(e=>status('Não foi possível abrir o editor: '+e.message,true));
