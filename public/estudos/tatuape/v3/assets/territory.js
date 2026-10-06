import * as maplibregl from '/estudos/tatuape/v3/assets/vendor/maplibre-gl.mjs';
const study=JSON.parse(document.getElementById('studyData').textContent),geom=study.geometry;
maplibregl.setWorkerUrl('/estudos/tatuape/v3/assets/vendor/maplibre-gl-worker.mjs');
maplibregl.setWorkerCount(2);
const el=id=>document.getElementById(id),feature=id=>geom.features.find(f=>f.id===id),fc=features=>({type:'FeatureCollection',features});
let mode='aerial';
try{
// Camera bounds come only from the exact cadastral polygon of lot 0003.
const parcelGeometry=feature('lote_principal').geometry;
const parcelCoordinates=parcelGeometry.type==='MultiPolygon'
  ?parcelGeometry.coordinates.flat(2):parcelGeometry.coordinates.flat();
const lotBounds=new maplibregl.LngLatBounds();
for(const coordinate of parcelCoordinates)lotBounds.extend(coordinate);
const map=new maplibregl.Map({container:'map',center:lotBounds.getCenter(),zoom:17,pitch:0,bearing:0,minZoom:14,maxZoom:21,maxPitch:65,antialias:true,attributionControl:false,style:{version:8,sources:{air:{type:'image',url:study.aerial.data,coordinates:study.aerial.corners}},layers:[{id:'background',type:'background',paint:{'background-color':'#e7e9e2'}},{id:'ortho',type:'raster',source:'air',paint:{'raster-saturation':-.12,'raster-contrast':.06}}]}});
map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-right');map.addControl(new maplibregl.ScaleControl({unit:'metric',maxWidth:85}),'bottom-left');map.addControl(new maplibregl.AttributionControl({compact:false,customAttribution:'Ortofoto RGB 2020 © Prefeitura de São Paulo / GeoSampa | cadastro consultado 28/09/2026'}),'bottom-right');
map.scrollZoom.disable();
let normalLabels=[],recuoLabels=[];
function label(text,coord,cls='',list=normalLabels){const d=document.createElement('div');d.className='map-label '+cls;d.textContent=text;const m=new maplibregl.Marker({element:d}).setLngLat(coord).addTo(map);list.push(m);return m}
function visibility(id,shown){if(map.getLayer(id))map.setLayoutProperty(id,'visibility',shown?'visible':'none')}
function massSource(){return fc(['volume_a','volume_b','volume_c'].map(id=>{let f=structuredClone(feature(id));f.properties.height=+el('levels').value*3;f.properties.base=0;return f}))}
function bandSource(){const fs=[];for(const id of ['volume_a','volume_b','volume_c'])for(let n=1;n<=+el('levels').value;n++){const f=structuredClone(feature(id));f.properties.height=n*3;f.properties.base=n*3-.16;fs.push(f)}return fc(fs)}
let mapReady=false,resizeFrame=0,lastWidth=0,lastHeight=0;
function framingPadding(){
  const container=map.getContainer(),rect=container.getBoundingClientRect();
  const scene=container.closest('.map-scene');
  const tools=scene?.querySelector('.map-tools')?.getBoundingClientRect();
  const caption=scene?.querySelector('.map-caption')?.getBoundingClientRect();
  const navigation=container.querySelector('.maplibregl-ctrl-top-right')?.getBoundingClientRect();
  const attribution=container.querySelector('.maplibregl-ctrl-bottom-right')?.getBoundingClientRect();
  const margin=rect.width<420?16:24;
  const padding={
    top:Math.max(margin,tools?tools.bottom-rect.top+12:0,navigation?navigation.bottom-rect.top+12:0),
    bottom:Math.max(margin,caption?rect.bottom-caption.top+14:0,attribution?rect.bottom-attribution.top+12:0),
    left:margin,
    right:Math.max(margin,navigation?rect.right-navigation.left+12:0)
  };
  // Extra headroom keeps extruded roofs away from the overlay controls.
  if(mode==='volume'){padding.top+=44;padding.bottom+=16;padding.left+=12;padding.right+=12}
  // Keep a positive viewport even in a very small embedded container.
  for(const [a,b,size] of [['left','right',rect.width],['top','bottom',rect.height]]){
    const total=padding[a]+padding[b],budget=Math.max(0,size-80);
    if(total>budget){const factor=budget/total;padding[a]*=factor;padding[b]*=factor}
  }
  return padding;
}
function reframe(animate=true){
  const container=map.getContainer();
  if(!mapReady||container.clientWidth<120||container.clientHeight<160)return;
  map.resize();
  map.fitBounds(lotBounds,{
    padding:framingPadding(),maxZoom:20,
    pitch:mode==='volume'?52:0,bearing:mode==='volume'?-18:0,
    linear:true,duration:animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches?700:0
  });
}
// Observe the CSS container, not MapLibre's resize event: resize/fit cannot
// recursively schedule themselves. Duplicate observer dimensions are ignored.
const resizeObserver=new ResizeObserver(entries=>{
  const {width,height}=entries[0].contentRect;
  if(width<=0||height<=0||Math.abs(width-lastWidth)<.5&&Math.abs(height-lastHeight)<.5)return;
  lastWidth=width;lastHeight=height;
  if(!mapReady)return;
  if(resizeFrame)cancelAnimationFrame(resizeFrame);
  resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;reframe(false)});
});
resizeObserver.observe(map.getContainer());
map.on('remove',()=>{resizeObserver.disconnect();if(resizeFrame)cancelAnimationFrame(resizeFrame)});
map.on('load',()=>{
map.addSource('parcels',{type:'geojson',data:fc([feature('lote_principal')])});
map.addSource('inside',{type:'geojson',data:feature('envelope_5_3')});
map.addSource('masses',{type:'geojson',data:massSource()});map.addSource('bands',{type:'geojson',data:bandSource()});
map.addSource('flood',{type:'geojson',data:study.flood});map.addSource('road',{type:'geojson',data:study.road});
map.addSource('edges',{type:'geojson',data:fc(geom.features.filter(f=>f.properties.kind==='borda'))});
map.addLayer({id:'parcels-fill',type:'fill',source:'parcels',paint:{'fill-color':['case',['==',['get','id'],'lote_principal'],'#f5e1b8','#b2cbd3'],'fill-opacity':.12}});
map.addLayer({id:'flood-fill',type:'fill',source:'flood',paint:{'fill-color':'#5197bd','fill-opacity':.3},layout:{visibility:'none'}});
map.addLayer({id:'road-fill',type:'fill',source:'road',paint:{'fill-color':'#dc9254','fill-opacity':.62},layout:{visibility:'none'}});
map.addLayer({id:'road-line',type:'line',source:'road',paint:{'line-color':'#fbd2a4','line-width':1.3},layout:{visibility:'none'}});
map.addLayer({id:'parcels-line',type:'line',source:'parcels',paint:{'line-color':['case',['==',['get','id'],'lote_principal'],'#fbe6b7','#b1dce7'],'line-width':3}});
map.addLayer({id:'inside-fill',type:'fill',source:'inside',paint:{'fill-color':'#dbe8ab','fill-opacity':.26},layout:{visibility:'none'}});
map.addLayer({id:'inside-line',type:'line',source:'inside',paint:{'line-color':'#e9f2b8','line-width':2,'line-dasharray':[2,1]},layout:{visibility:'none'}});
map.addLayer({id:'edges-line',type:'line',source:'edges',paint:{'line-color':['case',['==',['get','id'],'borda_sudoeste_pendente'],'#efc191','#ffffff'],'line-width':2,'line-dasharray':[2,2]},layout:{visibility:'none'}});
map.addLayer({id:'mass-outline',type:'line',source:'masses',paint:{'line-color':'#e4c5ad','line-width':1.2},layout:{visibility:'none'}});
map.addLayer({id:'mass-volume',type:'fill-extrusion',source:'masses',paint:{'fill-extrusion-color':'#cfa588','fill-extrusion-height':['get','height'],'fill-extrusion-base':0,'fill-extrusion-opacity':.95,'fill-extrusion-vertical-gradient':true},layout:{visibility:'none'}});
map.addLayer({id:'mass-bands',type:'fill-extrusion',source:'bands',paint:{'fill-extrusion-color':'#f0e1d5','fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':.8},layout:{visibility:'none'}});
for(const item of study.labels)label(item.text,item.coordinates,item.class||'');
for(const item of study.edgeLabels)label(item.text,item.coordinates,'map-dimension',recuoLabels);
window.updateTerritory=()=>{const all5=el('setbackMode').value==='all5';map.getSource('inside').setData(feature(all5?'envelope_5_todas':'envelope_5_3'));map.getSource('masses').setData(massSource());map.getSource('bands').setData(bandSource());visibility('parcels-fill',el('showLots').checked);visibility('parcels-line',el('showLots').checked);visibility('flood-fill',el('showFlood').checked);visibility('road-fill',el('showRoad').checked);visibility('road-line',el('showRoad').checked);visibility('inside-fill',mode!=='aerial');visibility('inside-line',mode!=='aerial');visibility('edges-line',mode==='setbacks');['mass-outline','mass-volume','mass-bands'].forEach(id=>visibility(id,mode==='volume'));recuoLabels.forEach((m,i)=>{m.getElement().style.display=mode==='setbacks'?'':'none';if(i>=2)m.getElement().textContent=(all5?'5':'3')+' m · '+(i===2?'divisa 0004':'confrontação pendente')});normalLabels.forEach(m=>{if(m.getElement().classList.contains('parcel'))m.getElement().style.display=el('showLots').checked&&mode!=='volume'?'':'none'})};
for(const id of ['showLots','showFlood','showRoad'])el(id).addEventListener('change',window.updateTerritory);
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});el('mapTitle').textContent=mode==='aerial'?'Lote 0003 · contorno municipal':mode==='setbacks'?'Recuos sobre a geometria do cadastro':'Três barras · estudo volumétrico exploratório';el('mapDescription').textContent=mode==='aerial'?'Somente SQL 062.096.0003-4. Perímetro preservado, sem correção artificial da área.':mode==='setbacks'?'Frentes inferidas pelas imagens. Sem descontar APP desconhecida nem plano viário como perda automática.':'Massas sintéticas sobre a foto de 2020. Gabarito ZM: 28 m. Datum e cota de proteção ainda não definidos.';window.updateTerritory();reframe()}));
el('reframe').addEventListener('click',reframe);window.updateTerritory();document.querySelectorAll('[data-mode],#reframe,#setbackMode,#levels,#showLots,#showFlood,#showRoad').forEach(e=>e.disabled=false);mapReady=true;el('mapNotice').hidden=true;reframe(false);el('map').classList.add('ready');
});
map.on('error',e=>{const msg=String(e.error?.message||'');if(msg.includes('WebGL')||msg.includes('worker')){el('mapNotice').hidden=false;el('mapNotice').textContent='Camada interativa indisponível · vista 2D preservada'}});
}catch(e){el('mapNotice').textContent='Vista 2D preservada · 3D indisponível neste ambiente';console.error('Mapa indisponível',e)}
