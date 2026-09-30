/* Local territorial viewer. No cadastral adoption, measurements or legal decisions. */
import {exploratorySummary,exploratoryProposalMetadata,assertExploratoryStudy} from './exploratory-proposal.js?v=3c6cd0a43693';
const DEM = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
const OSM = '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>';
const finitePosition = p => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 85.051129;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** Numeric thematic classes are explicit source metadata, never inferred from layer name. */
export function validateChoropleth(config) {
  if(!config)return null;
  if(typeof config.property!=='string'||!config.property||!Array.isArray(config.breaks)||!Array.isArray(config.colors)||config.breaks.length<1||config.breaks.length>10||config.colors.length!==config.breaks.length+1||!config.breaks.every((n,i)=>Number.isFinite(n)&&n>0&&(i===0||n>config.breaks[i-1]))||!config.colors.every(c=>/^#[0-9a-f]{6}$/i.test(c)))throw new Error('Classes coropléticas inválidas.');
  return {...config,missingColor:/^#[0-9a-f]{6}$/i.test(config.missingColor||'')?config.missingColor:'#d5d2ca'};
}
export function choroplethColor(config,value) {
  const c=validateChoropleth(config);if(!c)return null;
  if(typeof value!=='number'||!Number.isFinite(value)||value<0)return c.missingColor;
  let index=0;while(index<c.breaks.length&&value>=c.breaks[index])index++;
  return c.colors[index];
}
function colorExpression(config,fallback) {
  const c=validateChoropleth(config);if(!c)return fallback;
  const get=['get',c.property];const step=['step',['number',get,0],c.colors[0]];
  c.breaks.forEach((n,i)=>step.push(n,c.colors[i+1]));
  return ['case',['all',['==',['typeof',get],'number'],['>=',['number',get,-1],0]],step,c.missingColor];
}

function visitCoordinates(geometry, visit) {
  if (!geometry) return;
  if (geometry.type === 'GeometryCollection') return (geometry.geometries || []).forEach(g => visitCoordinates(g, visit));
  function walk(value) {
    if (!Array.isArray(value)) return;
    if (typeof value[0] === 'number') { if (!finitePosition(value)) throw new Error('Coordenadas não geográficas ou inválidas.'); visit(value); }
    else value.forEach(walk);
  }
  walk(geometry.coordinates);
}
function boundsOf(data) {
  let bounds = null;
  const features = data?.type === 'FeatureCollection' ? data.features : data?.type === 'Feature' ? [data] : [{geometry: data}];
  if (!Array.isArray(features)) throw new Error('GeoJSON inválido.');
  features.forEach(f => visitCoordinates(f.geometry, p => {
    if (!bounds) bounds = [p[0], p[1], p[0], p[1]];
    else { bounds[0] = Math.min(bounds[0], p[0]); bounds[1] = Math.min(bounds[1], p[1]); bounds[2] = Math.max(bounds[2], p[0]); bounds[3] = Math.max(bounds[3], p[1]); }
  }));
  return bounds;
}
function validateGeoJSON(data) {
  if (!data || data.error || !['FeatureCollection', 'Feature', 'Polygon', 'MultiPolygon', 'LineString', 'MultiLineString', 'Point', 'MultiPoint', 'GeometryCollection'].includes(data.type)) throw new Error('Resposta sem GeoJSON válido.');
  boundsOf(data);
  exploratoryProposalMetadata(data);
  return data;
}
async function getGeoJSON(url, aborts) {
  const controller = new AbortController(); aborts.add(controller);
  const timeout = setTimeout(() => controller.abort(), 14000);
  try {
    const parsed = new URL(url, location.href);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Protocolo de camada inválido.');
    const response = await fetch(parsed, {signal: controller.signal, credentials: parsed.origin === location.origin ? 'same-origin' : 'omit', cache: 'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return validateGeoJSON(await response.json());
  } finally { clearTimeout(timeout); aborts.delete(controller); }
}

export async function mountMap(container, study, options = {}) {
  if (!(container instanceof HTMLElement)) throw new Error('Contêiner do mapa ausente.');
  const geography = study.geography || study.geografia || {};
  const center = finitePosition(geography.center) ? geography.center : null;
  const zoom = Number.isFinite(geography.zoom) ? clamp(geography.zoom, 1, 20) : 14;
  let map, resizeObserver, frame, destroyed = false, ready = false, view3d = false, terrain = false, marker;
  let scenarioFloors = study.principalProduct?.floors??8, scenarioFloorHeight = 3, fallbackReason = null, initializationRejected = null;
  const fallbackView = {zoom:1,x:0,y:0};
  let fallbackScene, fallbackDrag;
  const aborts = new Set(), layers = new Map(), errors = new Map();
  const root = document.createElement('div'); root.style.cssText = 'position:relative;width:100%;height:100%;min-height:320px;overflow:hidden;background:#F0EDE5';
  const canvas = document.createElement('div'); canvas.style.cssText = 'position:absolute;inset:0'; canvas.setAttribute('aria-label', 'Mapa de contexto e camadas do estudo');
  const status = document.createElement('div'); status.setAttribute('role', 'status'); status.style.cssText = 'position:absolute;left:10px;top:10px;right:54px;pointer-events:none;z-index:2;display:flex;flex-wrap:wrap;gap:5px';
  const thematicLegend=document.createElement('div');thematicLegend.style.cssText='position:absolute;right:10px;top:58px;z-index:2;max-width:176px;background:rgba(252,251,247,.96);border-radius:7px;padding:8px 9px;font:10px/1.45 Inter,system-ui,sans-serif;color:#554f45;pointer-events:none';thematicLegend.hidden=true;
  const fallbackControls=document.createElement('div');fallbackControls.hidden=true;fallbackControls.style.cssText='position:absolute;right:10px;bottom:95px;z-index:3;display:none;gap:3px';
  for(const [label,text,action] of [['Aproximar mapa','+',()=>zoomFallback(1.5)],['Afastar mapa','−',()=>zoomFallback(1/1.5)],['Enquadrar terreno','⌖',()=>fit()]]){
    const button=document.createElement('button');button.type='button';button.textContent=text;button.setAttribute('aria-label',label);button.title=label;button.style.cssText='width:32px;height:32px;padding:0;border:1px solid #ddd7cb;border-radius:6px;background:#faf8f2;color:#684a39;font:20px/1 system-ui;cursor:pointer';button.addEventListener('click',action);fallbackControls.append(button);
  }
  root.append(canvas, status, thematicLegend, fallbackControls); container.replaceChildren(root);
  const parcelUrl = geography.parcelUrl || geography.parcelURL;
  const aerial = geography.aerial;
  const hasAerial = aerial && typeof aerial.url === 'string' && Array.isArray(aerial.corners) && aerial.corners.length === 4 && aerial.corners.every(finitePosition);
  const specs = (Array.isArray(geography.layers) ? geography.layers : []).filter(x => x && typeof x.id === 'string' && !(options.showVolumes === false && (x.id === 'volumes' || x.extrude === true || x.type === 'fill-extrusion')));
  specs.forEach((s, i) => { if (!layers.has(s.id)) layers.set(s.id, {spec:s, key:`study-${i}`, visible:s.default !== false, opacity:typeof s.opacity === 'number' ? clamp(s.opacity, 0, 1) : .23, data:null, ids:[]}); });
  if (parcelUrl) layers.set('__parcel', {spec:{id:'__parcel',label:'Perímetro cartográfico',url:parcelUrl,type:'line',status:'available',color:'#684a39'}, key:'study-parcel',visible:true,opacity:1,data:null,ids:[]});

  function updateFallbackView(){
    if(!fallbackScene||map||destroyed)return;
    fallbackScene.setAttribute('transform',`translate(${400+fallbackView.x} ${280+fallbackView.y}) scale(${fallbackView.zoom}) translate(-400 -280)`);
    container.dataset.mapFallbackZoom=String(fallbackView.zoom);
  }
  function zoomFallback(factor,point=[400,280]){
    if(map||!ready||destroyed)return;
    const next=clamp(fallbackView.zoom*factor,.1,16),ratio=next/fallbackView.zoom;
    fallbackView.x=point[0]-400-(point[0]-400-fallbackView.x)*ratio;
    fallbackView.y=point[1]-280-(point[1]-280-fallbackView.y)*ratio;
    fallbackView.zoom=next;updateFallbackView();
  }
  function canvasPoint(event){
    const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/800,r.height/560)||1;
    return [(event.clientX-r.left-(r.width-800*scale)/2)/scale,(event.clientY-r.top-(r.height-560*scale)/2)/scale];
  }
  canvas.addEventListener('wheel',event=>{if(map||!ready||destroyed)return;event.preventDefault();zoomFallback(Math.exp(-clamp(event.deltaY,-100,100)*.004),canvasPoint(event));},{passive:false});
  canvas.addEventListener('pointerdown',event=>{if(map||!ready||destroyed||event.button!==0)return;event.preventDefault();fallbackDrag={id:event.pointerId,point:canvasPoint(event),x:fallbackView.x,y:fallbackView.y};canvas.setPointerCapture?.(event.pointerId);canvas.focus?.();canvas.style.cursor='grabbing';});
  canvas.addEventListener('pointermove',event=>{if(!fallbackDrag||fallbackDrag.id!==event.pointerId||map||destroyed)return;const p=canvasPoint(event);fallbackView.x=fallbackDrag.x+p[0]-fallbackDrag.point[0];fallbackView.y=fallbackDrag.y+p[1]-fallbackDrag.point[1];updateFallbackView();});
  const stopDrag=event=>{if(fallbackDrag?.id!==event.pointerId)return;fallbackDrag=null;canvas.style.cursor='grab';};
  canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);
  canvas.addEventListener('keydown',event=>{
    if(map||!ready||destroyed)return;
    if(event.key==='+'||event.key==='=')zoomFallback(1.5);
    else if(event.key==='-')zoomFallback(1/1.5);
    else if(event.key==='Home')fit();
    else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){fallbackView.x+=event.key==='ArrowLeft'?40:event.key==='ArrowRight'?-40:0;fallbackView.y+=event.key==='ArrowUp'?40:event.key==='ArrowDown'?-40:0;updateFallbackView();}
    else return;
    event.preventDefault();
  });

  function showStatus() {
    status.replaceChildren();
    const texts = [];
    if (!ready) texts.push('Carregando cartografia…');
    for (const [id, text] of errors) if (!layers.has(id) || layers.get(id).visible) texts.push(`${layers.get(id)?.spec.label || id}: ${text}`);
    for (const value of texts) { const chip = document.createElement('span'); chip.textContent = value; chip.style.cssText = 'background:rgba(250,248,242,.96);border-radius:6px;padding:5px 8px;font:11px/1.4 Inter,system-ui,sans-serif;color:#684a39'; status.append(chip); }
    thematicLegend.replaceChildren();
    const thematic=[...layers.values()].find(e=>e.visible&&e.data&&e.spec.choropleth);
    thematicLegend.hidden=!thematic;
    if(thematic){try{const c=validateChoropleth(thematic.spec.choropleth);const title=document.createElement('div');title.textContent=c.legendTitle||thematic.spec.label;title.style.fontWeight='600';thematicLegend.append(title);const bar=document.createElement('div');bar.style.cssText='display:flex;height:9px;gap:1px;margin:5px 0 3px';c.colors.forEach(color=>{const swatch=document.createElement('span');swatch.style.cssText=`flex:1;background:${color}`;bar.append(swatch);});thematicLegend.append(bar);const thresholds=document.createElement('div');thresholds.textContent=`0 · ${c.breaks.map(n=>new Intl.NumberFormat('pt-BR').format(n)).join(' · ')}+ ${c.unit||''}`;thematicLegend.append(thresholds);const missing=document.createElement('div');missing.textContent='Cinza: dado indisponível';missing.style.cssText='margin-top:3px;color:#726b61';thematicLegend.append(missing);}catch{thematicLegend.hidden=true;}}
  }
  function fit() {
    if(destroyed)return;
    if(!map&&ready){fallbackView.zoom=1;fallbackView.x=0;fallbackView.y=0;fallback(fallbackReason||'Renderizador interativo indisponível.');return;}
    if (!map || !ready) return;
    const box = layers.get('__parcel')?.data && boundsOf(layers.get('__parcel').data);
    const width = root.clientWidth, height = root.clientHeight;
    const padding = {top:clamp(height*.12,42,76),bottom:clamp(height*.20,75,130),left:clamp(width*.07,24,70),right:clamp(width*.07,48,80)};
    if (box) map.fitBounds([[box[0],box[1]],[box[2],box[3]]], {padding,maxZoom:20,duration:0,pitch:view3d?52:0,bearing:view3d?-18:0});
    else if (center) map.jumpTo({center,zoom,pitch:view3d?52:0,bearing:view3d?-18:0});
  }
  function syncLayer(entry) {
    if (!map || !ready || !entry.ids.length) return;
    for (const id of entry.ids) {
      const l=map.getLayer(id); if (!l) continue;
      const extruded=l.type==='fill-extrusion';
      map.setLayoutProperty(id,'visibility',entry.visible && (!extruded || view3d) ? 'visible':'none');
      map.setPaintProperty(id,`${l.type}-opacity`,l.type==='line'?Math.min(1,entry.opacity+.45):entry.opacity);
    }
  }
  function install(entry) {
    if (!map || !ready || !entry.data || destroyed) return;
    const {spec,key,data}=entry, color=typeof spec.color==='string'?spec.color:'#967d61';
    const thematicColor=colorExpression(spec.choropleth,color);
    map.addSource(key,{type:'geojson',data});
    if (spec.type!=='line') {
      const fill=`${key}-fill`;
      map.addLayer({id:fill,type:'fill',source:key,filter:['==',['geometry-type'],'Polygon'],paint:{'fill-color':thematicColor,'fill-opacity':entry.opacity}}); entry.ids.push(fill);
      // Explicit numeric feature heights only; no default prism from the polygon.
      const features = data.type==='FeatureCollection'?data.features:data.type==='Feature'?[data]:[];
      const hasHeight=features.some(f=>Number.isFinite(f.properties?.height_m)&&f.properties.height_m>0&&f.properties.height_m<=300);
      if (hasHeight && (spec.extrude===true || spec.id==='volumes' || spec.type==='fill-extrusion')) {
        const id=`${key}-extrusion`;
        map.addLayer({id,type:'fill-extrusion',source:key,filter:['all',['==',['geometry-type'],'Polygon'],['>', ['coalesce',['get','height_m'],0],0],['<=',['coalesce',['get','height_m'],0],300]],paint:{'fill-extrusion-color':color,'fill-extrusion-height':['coalesce',['get','height_m'],0],'fill-extrusion-base':0,'fill-extrusion-opacity':entry.opacity,'fill-extrusion-vertical-gradient':true}}); entry.ids.push(id);
      }
    }
    const line=`${key}-line`;
    map.addLayer({id:line,type:'line',source:key,paint:{'line-color':color,'line-width':spec.id==='__parcel'?3:1.5,'line-opacity':Math.min(1,entry.opacity+.45)}}); entry.ids.push(line);
    syncLayer(entry);
  }
  function fallback(reason) {
    ready=true; fallbackReason=reason||fallbackReason||'Renderizador interativo indisponível.';container.dataset.mapRenderer='svg';container.dataset.mapFallbackReason=fallbackReason;container.dataset.mapAerial=String(Boolean(hasAerial));container.dataset.mapDataLayers=String([...layers.values()].filter(e=>e.data).length);errors.set('Mapa interativo',fallbackReason); showStatus();
    canvas.replaceChildren();canvas.tabIndex=0;canvas.style.touchAction='none';canvas.style.cursor='grab';fallbackControls.hidden=false;fallbackControls.style.display='grid';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('viewBox','0 0 800 560'); svg.style.cssText='width:100%;height:100%'; svg.setAttribute('role','img'); svg.setAttribute('aria-label',view3d?'Vista volumétrica esquemática sobre cartografia de referência':'Cartografia de referência. Arraste ou use as setas para explorar; + e − alteram a aproximação; Home enquadra o terreno.');
    const make=(tag,attrs={})=>{const el=document.createElementNS(svg.namespaceURI,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el;};
    fallbackScene=make('g');svg.append(fallbackScene);
    const parcel=layers.get('__parcel')?.data;
    const candidates=[...layers.values()].filter(e=>e.visible&&e.data);
    let box=parcel?boundsOf(parcel):null;
    if (!box && center) box=[center[0]-.025,center[1]-.018,center[0]+.025,center[1]+.018];
    if (!box && candidates.length) box=boundsOf(candidates[0].data);
    const text=make('text',{x:24,y:98,fill:'#684a39','font-size':13});
    text.textContent=view3d?'Vista volumétrica esquemática':'Cartografia · arraste para explorar';
    if (box) {
      container.dataset.mapFallbackBounds=box.join(',');
      const padX=(box[2]-box[0])*.15||.001,padY=(box[3]-box[1])*.15||.001;box=[box[0]-padX,box[1]-padY,box[2]+padX,box[3]+padY];
      const cx=(box[0]+box[2])/2,cy=(box[1]+box[3])/2,cos=Math.cos(cy*Math.PI/180);
      const angle=view3d?-22*Math.PI/180:0,ca=Math.cos(angle),sa=Math.sin(angle);
      const local=p=>{const x=(p[0]-cx)*cos*111320,y=(p[1]-cy)*111320;return [x*ca-y*sa,x*sa+y*ca];};
      const allFeatures=entry=>entry.data.type==='FeatureCollection'?entry.data.features:entry.data.type==='Feature'?[entry.data]:[{geometry:entry.data}];
      const volumeEntries=candidates.filter(e=>e.spec.extrude===true||e.spec.id==='volumes'||e.spec.type==='fill-extrusion');
      const maxHeight=Math.max(0,...volumeEntries.flatMap(e=>allFeatures(e).map(f=>Number.isFinite(f.properties?.height_m)&&f.properties.height_m>0&&f.properties.height_m<=300?f.properties.height_m:0)));
      const bb=[[box[0],box[1]],[box[2],box[1]],[box[2],box[3]],[box[0],box[3]]].map(local);
      const width=Math.max(...bb.map(p=>p[0]))-Math.min(...bb.map(p=>p[0]));
      const height=Math.max(...bb.map(p=>p[1]))-Math.min(...bb.map(p=>p[1]));
      const scale=Math.min(740/width,340/(height*(view3d?.58:1)+(view3d?maxHeight*.88:0)));
      const project=(p,h=0)=>{const q=local(p);return [400+q[0]*scale,(view3d?330:295)-q[1]*scale*(view3d?.58:1)-h*scale*.88];};
      const pathFor=rings=>rings.map(r=>r.map((p,i)=>`${i?'L':'M'}${project(p).join(',')}`).join(' ')+' Z').join(' ');
      if (hasAerial) {
        const [tl,tr,,bl]=aerial.corners.map(p=>project(p));
        const image=make('image',{href:aerial.url,x:0,y:0,width:1,height:1,preserveAspectRatio:'none',transform:`matrix(${tr[0]-tl[0]} ${tr[1]-tl[1]} ${bl[0]-tl[0]} ${bl[1]-tl[1]} ${tl[0]} ${tl[1]})`});
        image.addEventListener('load',()=>{container.dataset.mapAerialLoaded='true';},{once:true});
        image.addEventListener('error',()=>{container.dataset.mapAerialLoaded='false';errors.set('Vista aérea','Imagem local indisponível.');showStatus();},{once:true});fallbackScene.append(image);
      }
      const draw=(geometry,entry,properties={})=>{
        if (!geometry) return;
        if (geometry.type==='GeometryCollection') return geometry.geometries.forEach(g=>draw(g,entry,properties));
        const fillColor=entry.spec.choropleth?choroplethColor(entry.spec.choropleth,properties[entry.spec.choropleth.property]):entry.spec.color||'#967d61';
        const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];
        const lines=geometry.type==='LineString'?[geometry.coordinates]:geometry.type==='MultiLineString'?geometry.coordinates:[];
        for(const rings of polygons)fallbackScene.append(make('path',{d:pathFor(rings),fill:entry.spec.type!=='line'?fillColor:'none','fill-opacity':entry.opacity,'fill-rule':'evenodd',stroke:entry.spec.color||'#967d61','stroke-width':entry.spec.id==='__parcel'?3:1.2,'vector-effect':'non-scaling-stroke'}));
        for(const ring of lines)fallbackScene.append(make('path',{d:ring.map((p,i)=>`${i?'L':'M'}${project(p).join(',')}`).join(' '),fill:'none',stroke:entry.spec.color||'#967d61','stroke-width':1.2,'stroke-opacity':Math.min(1,entry.opacity+.45),'vector-effect':'non-scaling-stroke'}));
      };
      candidates.forEach(entry=>allFeatures(entry).forEach(f=>draw(f.geometry,entry,f.properties)));
      if(view3d){
        const faces=[];
        volumeEntries.forEach(entry=>allFeatures(entry).forEach(f=>{
          const h=f.properties?.height_m;if(!Number.isFinite(h)||h<=0||h>300)return;
          const polys=f.geometry?.type==='Polygon'?[f.geometry.coordinates]:f.geometry?.type==='MultiPolygon'?f.geometry.coordinates:[];
          for(const rings of polys){
            const ring=rings[0];if(!ring?.length)return;
            for(let i=0;i<ring.length-1;i++){
              const a=project(ring[i]),b=project(ring[i+1]),c=project(ring[i+1],h),d=project(ring[i],h);
              faces.push({depth:(a[1]+b[1])/2,node:make('polygon',{points:[a,b,c,d].map(p=>p.join(',')).join(' '),fill:entry.spec.color||'#627969','fill-opacity':entry.opacity,stroke:'#3d5749','stroke-width':.7})});
            }
            const top=make('path',{d:rings.map(r=>r.map((p,i)=>`${i?'L':'M'}${project(p,h).join(',')}`).join(' ')+' Z').join(' '),fill:'#c7d4c8','fill-opacity':entry.opacity,'fill-rule':'evenodd',stroke:'#405a48','stroke-width':1});
            const avg=ring.slice(0,-1).reduce((a,p)=>[a[0]+p[0]/(ring.length-1),a[1]+p[1]/(ring.length-1)],[0,0]);
            faces.push({depth:project(avg)[1]+.1,node:top});
            const labelAt=project(avg,h);const label=make('text',{x:labelAt[0],y:labelAt[1]-3,'text-anchor':'middle',fill:'#24372b','font-size':12,'font-weight':600,'paint-order':'stroke',stroke:'#e6efe5','stroke-width':3});label.textContent=`${h} m`;if(entry.opacity>.1)faces.push({depth:Infinity,node:label});
          }
        }));
        faces.sort((a,b)=>a.depth-b.depth).forEach(f=>fallbackScene.append(f.node));
      }
      if(center){const p=project(center);fallbackScene.append(make('circle',{cx:p[0],cy:p[1],r:5,fill:'#684a39',stroke:'#faf8f2','stroke-width':2}));}
    }
    const credit=make('text',{x:24,y:538,fill:'#554f45','font-size':11});credit.textContent=hasAerial?`Ortofoto · ${aerial.source||'fonte não informada'} · ${aerial.date||'data não informada'}${view3d?' · alturas de ensaio, sem cota altimétrica':''}`:'Sem mapa-base · geometrias das fontes do estudo · ponto não define perímetro';svg.append(credit);
    svg.append(text);canvas.append(svg);updateFallbackView();
  }
  showStatus();
  const fetches=[...layers].map(async([id,entry])=>{
    if (entry.spec.status!=='available'||!entry.spec.url) {errors.set(id,entry.spec.note||'Indisponível; ausência não verificada.');return;}
    try {if(entry.spec.choropleth)validateChoropleth(entry.spec.choropleth);entry.data=await getGeoJSON(entry.spec.url,aborts);assertExploratoryStudy(entry.data,study);}catch(e){entry.data=null;errors.set(id,e.name==='AbortError'?'Consulta expirou; não interpretada como ausência.':`Falha de leitura (${e.message}).`);}
    if(!destroyed&&!map&&ready)fallback(fallbackReason);
  });
  try {
    if (!center) throw new Error('Localização geográfica não confirmada.');
    if (!document.querySelector('link[data-area-map-css]')) {const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./assets/vendor/maplibre-gl.css',import.meta.url).href;css.dataset.areaMapCss='true';document.head.append(css);}
    const gl=await import('./assets/vendor/maplibre-gl.mjs?v=3c6cd0a43693');
    gl.setWorkerUrl(new URL('./assets/vendor/maplibre-gl-worker.mjs',import.meta.url).href);gl.setWorkerCount(2);
    const sources = {'osm-context':{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:OSM}};
    const baseLayers = [{id:'paper',type:'background',paint:{'background-color':'#F0EDE5'}},{id:'osm-context',type:'raster',source:'osm-context',paint:{'raster-saturation':-.92,'raster-opacity':.86,'raster-contrast':.08}}];
    if (hasAerial) {
      sources['official-aerial']={type:'image',url:aerial.url,coordinates:aerial.corners,attribution:escapeHtml(`Ortofoto · ${aerial.source || 'fonte não informada'} · ${aerial.date || 'data não informada'}`)};
      baseLayers.push({id:'official-aerial',type:'raster',source:'official-aerial',paint:{'raster-opacity':1,'raster-saturation':-.15,'raster-contrast':.05}});
    }
    map=new gl.Map({container:canvas,center,zoom,pitch:0,maxPitch:options.mode==='2d'?0:65,maxZoom:21,attributionControl:false,style:{version:8,sources,layers:baseLayers}});
    map.addControl(new gl.NavigationControl({visualizePitch:options.mode!=='2d'}),'top-right');map.addControl(new gl.ScaleControl({unit:'metric',maxWidth:85}),'bottom-left');map.addControl(new gl.AttributionControl({compact:false}),'bottom-right');
    map.on('error',event=>{if(destroyed)return;const id=event.sourceId||event.error?.sourceId; if(id==='osm-context') errors.set('Mapa-base','Falha de rede; camadas mantidas.');else if(id==='official-aerial')errors.set('Vista aérea','Imagem indisponível; camadas mantidas.');else if(id?.startsWith('terrain'))errors.set('Relevo','Falha de rede; DEM não confirmado.');showStatus();});
    map.getCanvas().addEventListener('webglcontextlost',event=>{if(destroyed)return;event.preventDefault();resizeObserver?.disconnect();cancelAnimationFrame(frame);const failed=map;map=null;initializationRejected?.(new Error('Contexto gráfico interrompido.'));failed?.remove();fallback('Contexto gráfico interrompido; cartografia preservada.');Promise.allSettled(fetches).then(()=>{if(!destroyed&&!map)fallback(fallbackReason);});},{once:true});
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Inicialização do renderizador expirou.')),12000);initializationRejected=error=>{clearTimeout(timer);reject(error);};map.once('style.load',()=>{clearTimeout(timer);initializationRejected=null;resolve();});});
    ready=true;
    await Promise.allSettled(fetches);
    if(destroyed)return;
    if(!map)throw new Error(fallbackReason||'Contexto gráfico interrompido.');
    container.dataset.mapRenderer='maplibre';
    fallbackControls.hidden=true;fallbackControls.style.display='none';
    for(const entry of layers.values()){try{install(entry);}catch(e){errors.set(entry.spec.id,`Renderização indisponível (${e.message}).`);}}
    const markerNode=document.createElement('span');markerNode.textContent='';markerNode.title=geography.pointLabel||'Ponto de referência';markerNode.setAttribute('aria-label',markerNode.title);markerNode.style.cssText='display:block;width:13px;height:13px;border-radius:50%;background:#684a39;border:3px solid #faf8f2;box-shadow:0 1px 6px #54453666';
    marker=new gl.Marker({element:markerNode}).setLngLat(center).setPopup(new gl.Popup({offset:12}).setText(geography.pointLabel||'Ponto de referência')).addTo(map);
    fit();showStatus();
    if(typeof ResizeObserver!=='undefined'){let w=0,h=0;resizeObserver=new ResizeObserver(()=>{const nw=root.clientWidth,nh=root.clientHeight;if(nw===w&&nh===h)return;w=nw;h=nh;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(!destroyed&&map){map.resize();fit();}});});resizeObserver.observe(root);}
  } catch(e) {
    if(map){map.remove();map=null;}if(!destroyed)fallback(e.message);await Promise.allSettled(fetches);if(!destroyed)fallback(e.message);
  }
  return {
    destroy(){destroyed=true;aborts.forEach(c=>c.abort());resizeObserver?.disconnect();cancelAnimationFrame(frame);marker?.remove();map?.remove();root.remove();},
    fit,
    getState(){return {renderer:map?'maplibre':'svg',reason:fallbackReason,hasAerial:Boolean(hasAerial),fallbackViewport:{...fallbackView},layers:[...layers].map(([id,e])=>({id,visible:e.visible,loaded:Boolean(e.data),features:e.data?.features?.length??null,error:errors.get(id)||null}))};},
    setLayer(id,enabled){const entry=layers.get(id);if(!entry)return;entry.visible=Boolean(enabled);if(map)syncLayer(entry);else fallback(fallbackReason);showStatus();},
    setOpacity(id,value){const entry=layers.get(id);if(!entry||!Number.isFinite(value))return;entry.opacity=clamp(value>1?value/100:value,0,1);if(map)syncLayer(entry);else fallback(fallbackReason);},
    setTerrain(enabled){terrain=Boolean(enabled);if(map&&ready){try{if(terrain&&!map.getSource('terrain-dem'))map.addSource('terrain-dem',{type:'raster-dem',tiles:[DEM],tileSize:256,encoding:'terrarium',maxzoom:12,attribution:'Mapzen Terrain Tiles · SRTM / USGS'});if(options.mode==='2d'){if(terrain&&!map.getLayer('terrain-hillshade'))map.addLayer({id:'terrain-hillshade',type:'hillshade',source:'terrain-dem',paint:{'hillshade-exaggeration':.45,'hillshade-shadow-color':'#695f51','hillshade-highlight-color':'#f8f6ee'},layout:{visibility:'visible'}},[...layers.values()].find(e=>e.ids.length)?.ids[0]);if(map.getLayer('terrain-hillshade'))map.setLayoutProperty('terrain-hillshade','visibility',terrain?'visible':'none');}else map.setTerrain(terrain?{source:'terrain-dem',exaggeration:1}:null);}catch(e){terrain=false;errors.set('Relevo',`Indisponível (${e.message}).`);}}else if(terrain){terrain=false;errors.set('Relevo','Requer mapa WebGL.');}showStatus();},
    setScenario(scenario={}){
      const changesHeight=scenario.floors!==undefined||scenario.floorHeightM!==undefined;
      const nextFloors=scenario.floors??scenarioFloors,nextFloorHeight=scenario.floorHeightM??scenarioFloorHeight;
      if(changesHeight&&(!Number.isInteger(nextFloors)||nextFloors<1||nextFloors>20||!Number.isFinite(nextFloorHeight)||nextFloorHeight!==3||nextFloors*nextFloorHeight>100))throw new RangeError('Ensaio: 1–20 pavimentos inteiros, com altura fixa de 3 m por pavimento.');
      let footprintM2=0,volumeCount=0;
      if(changesHeight){
        scenarioFloors=nextFloors;scenarioFloorHeight=nextFloorHeight;
        for(const entry of layers.values()){
          if(!entry.data||!(entry.spec.extrude===true||entry.spec.id==='volumes'||entry.spec.type==='fill-extrusion'))continue;
          const fs=entry.data.type==='FeatureCollection'?entry.data.features:entry.data.type==='Feature'?[entry.data]:[];
          for(const feature of fs){
            if(!Number.isFinite(feature.properties?.height_m))continue;
            const p=feature.properties;p.height_m_original??=p.height_m;p.height_m=nextFloors*nextFloorHeight;p.scenario_floors=nextFloors;p.scenario_floor_height_m=nextFloorHeight;p.scenario_status='working_assumption';
            if(Number.isFinite(p.area_cartografica_m2))footprintM2+=p.area_cartografica_m2;volumeCount++;
          }
          if(map&&ready)map.getSource(entry.key)?.setData(entry.data);
        }
      }
      else {
        for(const entry of layers.values()){
          if(!entry.data||!(entry.spec.extrude===true||entry.spec.id==='volumes'||entry.spec.type==='fill-extrusion'))continue;
          const fs=entry.data.type==='FeatureCollection'?entry.data.features:entry.data.type==='Feature'?[entry.data]:[];
          for(const feature of fs){if(!Number.isFinite(feature.properties?.height_m))continue;if(Number.isFinite(feature.properties.area_cartografica_m2))footprintM2+=feature.properties.area_cartografica_m2;volumeCount++;}
        }
      }
      if(options.mode === '2d') view3d=false;
      else if(typeof scenario.view3d==='boolean')view3d=scenario.view3d;
      else if(!changesHeight)view3d=!view3d;
      if(map&&ready){layers.forEach(syncLayer);map.easeTo({pitch:view3d?52:0,bearing:view3d?-18:0,duration:500});}
      else if(ready){fallback(errors.get('Mapa interativo')||'WebGL indisponível.');}
      showStatus();
      const proposal=[...layers.values()].find(entry=>entry.data?.metadata?.role==='exploratory_product_sketch')?.data;
      return {floors:scenarioFloors,floorHeightM:scenarioFloorHeight,heightM:scenarioFloors*scenarioFloorHeight,volumeCount,footprintM2,grossAreaM2:footprintM2*scenarioFloors,status:'working_assumption',unitsProven:false,...exploratorySummary(proposal)};
    },
  };
}
