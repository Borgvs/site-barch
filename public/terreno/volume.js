/** Barch land studio · pure display geometry, adapted from Estudo 1 / Tatuapé.
 * X=east, Y=relative height, Z=-north. No area adoption, parcel scaling or capacity inference.
 * Exact metric scenes preserve their CRS/origin. Geographic fallback is visual-only.
 */
import {exploratorySummary,exploratoryProposalMetadata,assertExploratoryStudy} from './exploratory-proposal.js?v=abaadbc3bdce';
const FLOOR_HEIGHT_M = 3;
const COLORS = { background:'#f2f3ef', lot:'#dddcd0', clay:'#905e4b', mass:'#b5826b', alternate:'#aa7660', envelope:'#b48770', line:'#835640', white:'#fbfbf6', ink:'#343d36', grid:'#d5d9ce' };
const fmt = n => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(n);
const finite = p => Array.isArray(p)&&p.length>=2&&Number.isFinite(p[0])&&Number.isFinite(p[1]);

export function openMetricRing(ring) {
  if (!Array.isArray(ring)||!ring.every(finite)) throw new Error('Anel métrico inválido.');
  const points=ring.map(p=>p.slice(0,2));
  if(points.length>1&&points[0][0]===points.at(-1)[0]&&points[0][1]===points.at(-1)[1])points.pop();
  if(points.length<3)throw new Error('Polígono sem três vértices.');
  const twiceArea=points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0);
  if(Math.abs(twiceArea)<1e-8)throw new Error('Polígono de área nula.');
  return points;
}
export function validateVolumeData(data) {
  exploratoryProposalMetadata(data);
  if(data?.metadata?.units!=='m')throw new Error('A cena exige coordenadas métricas declaradas.');
  const features=data.featuresById;
  if(!features?.lote_principal?.polygons?.length)throw new Error('Perímetro cartográfico ainda não disponível.');
  for(const feature of Object.values(features))for(const polygon of feature.polygons||[]){openMetricRing(polygon.outer);(polygon.holes||[]).forEach(openMetricRing);}
  const massIds=Object.keys(features).filter(id=>/^volume_/.test(id)&&features[id].polygons?.length);
  const envelopeId=Object.keys(features).find(id=>id==='envelope_5_3')||Object.keys(features).find(id=>/^envelope/.test(id)&&features[id].polygons?.length);
  return {features,massIds,envelopeId};
}
export function volumeSummary(data,floors=8) {
  if(!Number.isInteger(floors)||floors<1||floors>20)throw new RangeError('Informe 1–20 pavimentos inteiros de 3 m.');
  const {features,massIds,envelopeId}=validateVolumeData(data);
  // Declared source areas only. Local geographic display projection never becomes measurement.
  const areas=massIds.map(id=>features[id].areaM2);
  const footprintM2=areas.length&&areas.every(a=>Number.isFinite(a)&&a>0)?areas.reduce((a,b)=>a+b,0):null;
  const referenceHeightM=data.parameters?.heightReferenceM??null;
  return {floors,floorHeightM:FLOOR_HEIGHT_M,heightM:floors*FLOOR_HEIGHT_M,volumeCount:massIds.length,footprintM2,grossAreaM2:footprintM2===null?null:footprintM2*floors,referenceHeightM,exceedsReference:Number.isFinite(referenceHeightM)&&floors*FLOOR_HEIGHT_M>referenceHeightM,envelopeId,status:'working_assumption',unitsProven:false,...exploratorySummary(data)};
}

const fsOf=data=>data?.type==='FeatureCollection'?data.features:data?.type==='Feature'?[data]:data?.type?[{geometry:data,properties:{}}]:[];
export function geographicVolumeData(study,parcel,envelope,volumes) {
  const origin=study.geography?.center;
  if(!finite(origin))throw new Error('Origem geográfica não confirmada.');
  const features={};const cos=Math.cos(origin[1]*Math.PI/180);
  const point=p=>{if(!finite(p)||Math.abs(p[0])>180||Math.abs(p[1])>85)throw new Error('Coordenada geográfica inválida.');return [(p[0]-origin[0])*111320*cos,(p[1]-origin[1])*111320];};
  const add=(id,feature)=>{const g=feature.geometry;const polys=g?.type==='Polygon'?[g.coordinates]:g?.type==='MultiPolygon'?g.coordinates:[];if(!polys.length)return;features[id]={id,label:feature.properties?.label||id,polygons:polys.map(p=>({outer:p[0].map(point),holes:p.slice(1).map(r=>r.map(point))})),areaM2:feature.properties?.area_cartografica_m2??null};};
  const parcels=fsOf(parcel);if(parcels.length!==1)throw new Error('Defina um único perímetro para a cena.');add('lote_principal',parcels[0]);
  fsOf(envelope).forEach((f,i)=>add(i?'envelope_'+i:'envelope',f));
  fsOf(volumes).forEach((f,i)=>add('volume_'+i,f));
  const proposal=exploratoryProposalMetadata(volumes);assertExploratoryStudy(volumes,study);
  return {metadata:{...(proposal?{...volumes.metadata}:{}),units:'m',measurementCRS:null,origin:{longitude:origin[0],latitude:origin[1]},localCoordinates:{verticalDatum:'arbitrary_display_zero_not_surveyed_altitude'},provenance:'Projeção local aproximada apenas para visualização. Áreas permanecem as declaradas na fonte.'},parameters:{heightReferenceM:proposal?null:study.regulatory?.maxHeightM??null},featuresById:features};
}

export async function mountVolume(host,study,options={}) {
  if(!(host instanceof HTMLElement))throw new Error('Contêiner da volumetria ausente.');
  let floors=options.floors??study.principalProduct?.floors??8;
  if(options.floorHeightM!==undefined&&options.floorHeightM!==3)throw new RangeError('O ensaio usa 3 m por pavimento.');
  if(!Number.isInteger(floors)||floors<1||floors>20)throw new RangeError('Informe 1–20 pavimentos inteiros.');
  let view=['iso','top','front'].includes(options.view)?options.view:'iso',data,validated,renderer,scene,camera,controls,groups,observer,frame=0,destroyed=false,mode='loading',yaw=-.68,zoom=1,dragStart=null;
  const requests=new Set(),listeners=[];
  const root=document.createElement('div');root.style.cssText='position:relative;width:100%;height:100%;min-height:320px;overflow:hidden;background:#f2f3ef';
  const stage=document.createElement('div');stage.style.cssText='position:absolute;inset:0';
  const status=document.createElement('div');status.setAttribute('role','status');status.style.cssText='position:absolute;left:12px;top:12px;right:12px;z-index:2;pointer-events:none;font:11px/1.5 Inter,system-ui,sans-serif;color:#5a554d';
  root.append(stage,status);host.replaceChildren(root);
  const listen=(target,event,fn,opts)=>{target.addEventListener(event,fn,opts);listeners.push(()=>target.removeEventListener(event,fn,opts));};
  const summary=()=>data?volumeSummary(data,floors):{floors,floorHeightM:3,heightM:floors*3,volumeCount:0,footprintM2:null,grossAreaM2:null,status:'geometry_missing',unitsProven:false};
  function describe(){host.dataset.sceneState=mode;host.dataset.levels=String(floors);status.textContent=data?'':'Preparando a geometria do terreno…';}
  async function read(url){const c=new AbortController();requests.add(c);const timer=setTimeout(()=>c.abort(),14000);try{const u=new URL(url,location.href);if(u.origin!==location.origin)throw new Error('A geometria deve ser incorporada ao acervo local.');const r=await fetch(u,{signal:c.signal,cache:'no-store',credentials:'same-origin'});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json();}finally{clearTimeout(timer);requests.delete(c);}}
  function disposeTree(group){if(!group)return;const geometries=new Set(),materials=new Set(),textures=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){materials.add(m);if(m.map)textures.add(m.map);}});textures.forEach(x=>x.dispose());geometries.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());group.clear();}
  function cleanRenderer(){controls?.dispose();controls=null;disposeTree(scene);renderer?.dispose();renderer=null;scene=null;camera=null;groups=null;}
  function unavailable(message){mode='unavailable';stage.replaceChildren();const p=document.createElement('p');p.style.cssText='position:absolute;inset:30% 24px auto;max-width:46ch;margin:auto;font:14px/1.6 Inter,system-ui;color:#5a554d';p.textContent=message;stage.append(p);status.textContent='';host.dataset.sceneState=mode;}
  function svgRender(){
    if(destroyed||!data)return;const hadFocus=Boolean(stage.contains?.(document.activeElement));mode='svg';stage.replaceChildren();const NS='http://www.w3.org/2000/svg';const make=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
    const svg=make('svg',{viewBox:'0 0 800 560',role:'img','aria-label':'Axonometria do terreno, envelope de referência e volumes de ensaio. Arraste para girar.',tabindex:0});svg.style.cssText='width:100%;height:100%;display:block;touch-action:none;cursor:grab';
    const {features,massIds,envelopeId}=validated,points=features.lote_principal.polygons.flatMap(p=>openMetricRing(p.outer));const cx=(Math.min(...points.map(p=>p[0]))+Math.max(...points.map(p=>p[0])))/2,cn=(Math.min(...points.map(p=>p[1]))+Math.max(...points.map(p=>p[1])))/2;const maxH=Math.max(floors*3,data.parameters?.heightReferenceM||0,5);
    const raw=(p,h=0)=>{const e=p[0]-cx,n=p[1]-cn;const a=view==='front'?0:view==='top'?0:yaw;const x=e*Math.cos(a)-n*Math.sin(a),depth=e*Math.sin(a)+n*Math.cos(a);return [x,view==='top'?-depth:view==='front'?-h:-depth*.52-h*.86];};
    const extent=points.flatMap(p=>[raw(p,0),raw(p,maxH)]),minX=Math.min(...extent.map(p=>p[0])),maxX=Math.max(...extent.map(p=>p[0])),minY=Math.min(...extent.map(p=>p[1])),maxY=Math.max(...extent.map(p=>p[1]));const scale=Math.min(660/Math.max(1,maxX-minX),370/Math.max(1,maxY-minY))*zoom;const project=(p,h=0)=>{const q=raw(p,h);return [400+(q[0]-(minX+maxX)/2)*scale,278+(q[1]-(minY+maxY)/2)*scale];};
    const path=(polygon,h=0)=>[polygon.outer,...(polygon.holes||[])].map(r=>openMetricRing(r).map((p,i)=>`${i?'L':'M'}${project(p,h).join(',')}`).join(' ')+'Z').join(' ');
    // Grid and parcel keep the same local axes as the metric source.
    const span=Math.max(maxX-minX,maxY-minY,20),step=span>600?100:span>200?25:10;
    for(let i=-Math.ceil(span/step);i<=Math.ceil(span/step);i++){for(const line of [[[cx+i*step,cn-span],[cx+i*step,cn+span]],[[cx-span,cn+i*step],[cx+span,cn+i*step]]]){const [a,b]=line.map(p=>project(p));svg.append(make('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#dfe2d7','stroke-width':.7}));}}
    features.lote_principal.polygons.forEach(p=>svg.append(make('path',{d:path(p),fill:COLORS.lot,stroke:COLORS.clay,'stroke-width':1.6,'fill-rule':'evenodd'})));
    if(envelopeId)features[envelopeId].polygons.forEach(p=>svg.append(make('path',{d:path(p,.08),fill:'#d0b5a3','fill-opacity':.25,stroke:COLORS.clay,'stroke-width':1,'stroke-dasharray':'5 4','fill-rule':'evenodd'})));
    const volumes=massIds.flatMap((id,index)=>features[id].polygons.map(p=>({id,index,p,depth:openMetricRing(p.outer).reduce((s,p)=>s+raw(p)[1],0)/openMetricRing(p.outer).length}))).sort((a,b)=>a.depth-b.depth);
    for(const {id,index,p}of volumes){const ring=openMetricRing(p.outer),faces=[];if(view!=='top')for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];faces.push({a,b,depth:(raw(a)[1]+raw(b)[1])/2});}faces.sort((a,b)=>a.depth-b.depth).forEach(({a,b},i)=>{svg.append(make('polygon',{points:[project(a),project(b),project(b,floors*3),project(a,floors*3)].map(p=>p.join(',')).join(' '),fill:i%2?COLORS.alternate:COLORS.mass,stroke:COLORS.line,'stroke-width':.6}));for(let f=1;f<=floors;f++){const [p1,p2]=[project(a,f*3),project(b,f*3)];svg.append(make('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],stroke:COLORS.white,'stroke-width':1.4}));}});svg.append(make('path',{d:path(p,floors*3),fill:'#dfc4b0',stroke:COLORS.line,'stroke-width':1,'fill-rule':'evenodd'}));const avg=ring.reduce((s,p)=>[s[0]+p[0]/ring.length,s[1]+p[1]/ring.length],[0,0]);const xy=project(avg,floors*3);const label=make('text',{x:xy[0],y:xy[1]-8,fill:COLORS.ink,'font-size':12,'font-weight':600,'text-anchor':'middle','paint-order':'stroke',stroke:'#f2f3ef','stroke-width':4});label.textContent=`${String.fromCharCode(65+index)} · ${floors} pav.`;svg.append(label);}
    const ref=data.parameters?.heightReferenceM;
    if(envelopeId&&Number.isFinite(ref)&&ref>0)features[envelopeId].polygons.forEach(p=>{svg.append(make('path',{d:path(p,ref),fill:'none',stroke:COLORS.clay,'stroke-width':1.1,'stroke-dasharray':'5 4','stroke-opacity':.65}));const ring=openMetricRing(p.outer);ring.filter((_,i)=>i===0||i===Math.floor(ring.length/3)||i===Math.floor(ring.length*2/3)).forEach(p=>{const [a,b]=[project(p),project(p,ref)];svg.append(make('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:COLORS.clay,'stroke-width':.8,'stroke-dasharray':'5 4','stroke-opacity':.65}));});});
    if(view==='top')for(const [id,f]of Object.entries(features)){if(!id.startsWith('borda_')||!f.lines?.length)continue;const line=f.lines[0],a=line[0],b=line.at(-1),q=project([(a[0]+b[0])/2,(a[1]+b[1])/2]);const text=make('text',{x:q[0],y:q[1]-6,fill:COLORS.line,'font-size':11,'text-anchor':'middle','paint-order':'stroke',stroke:'#f2f3ef','stroke-width':4});text.textContent=Number.isFinite(f.lengthM)?`${fmt(f.lengthM)} m`:f.label;svg.append(text);}
    const north=make('text',{x:735,y:68,fill:COLORS.ink,'font-size':13});north.textContent='N';svg.append(north);const n0=raw([cx,cn]),n1=raw([cx,cn+10]);let dx=n1[0]-n0[0],dy=n1[1]-n0[1],len=Math.hypot(dx,dy)||1;dx=dx/len*20;dy=dy/len*20;svg.append(make('line',{x1:740,y1:92,x2:740+dx,y2:92+dy,stroke:COLORS.ink,'stroke-width':2}));
    svg.addEventListener('pointerdown',e=>{dragStart={x:e.clientX,yaw};root.setPointerCapture?.(e.pointerId);});svg.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='='){zoom=Math.min(2.5,zoom*1.15);e.preventDefault();svgRender();}else if(e.key==='-'){zoom=Math.max(.5,zoom/1.15);e.preventDefault();svgRender();}else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){yaw+=(e.key==='ArrowLeft'?-1:1)*.15;e.preventDefault();svgRender();}});stage.append(svg);if(hadFocus)svg.focus?.({preventScroll:true});describe();
  }
  async function initThree(){
    const THREE=await import('./assets/vendor/three.module.js?v=abaadbc3bdce');const {OrbitControls}=await import('./assets/vendor/OrbitControls.js?v=abaadbc3bdce');if(destroyed)return;
    const canvas=document.createElement('canvas');canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Modelo 3D do terreno. Arraste para girar; roda para aproximar.');canvas.tabIndex=0;canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none';
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
    scene=new THREE.Scene();scene.background=new THREE.Color(COLORS.background);camera=new THREE.OrthographicCamera(-100,100,100,-100,.1,50000);controls=new OrbitControls(camera,canvas);controls.enableDamping=false;controls.screenSpacePanning=true;controls.minZoom=.35;controls.maxZoom=8;controls.maxPolarAngle=Math.PI/2-.012;controls.rotateSpeed=.62;
    const {features,massIds,envelopeId}=validated,points=features.lote_principal.polygons.flatMap(p=>openMetricRing(p.outer));const minE=Math.min(...points.map(p=>p[0])),maxE=Math.max(...points.map(p=>p[0])),minN=Math.min(...points.map(p=>p[1])),maxN=Math.max(...points.map(p=>p[1])),span=Math.max(maxE-minE,maxN-minN,20);const center=new THREE.Vector3((minE+maxE)/2,Math.max(floors*3,data.parameters?.heightReferenceM||0)/3,-(minN+maxN)/2);
    function shape(p){const shape=new THREE.Shape(openMetricRing(p.outer).map(([e,n])=>new THREE.Vector2(e,n)));shape.closePath();for(const h of p.holes||[]){const path=new THREE.Path(openMetricRing(h).map(([e,n])=>new THREE.Vector2(e,n)));path.closePath();shape.holes.push(path);}return shape;}
    function extrude(p,h){const g=new THREE.ExtrudeGeometry(shape(p),{depth:h,bevelEnabled:false,curveSegments:1,steps:1});g.rotateX(-Math.PI/2);return g;}
    function outline(p,y,color,opacity=1){const g=new THREE.Group();for(const ring of[p.outer,...(p.holes||[])]){const geo=new THREE.BufferGeometry().setFromPoints(openMetricRing(ring).map(([e,n])=>new THREE.Vector3(e,y,-n)));g.add(new THREE.LineLoop(geo,new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity})));}return g;}
    function label(text,scale){const c=document.createElement('canvas'),ctx=c.getContext('2d');if(!ctx)return null;ctx.font='600 64px Inter,Arial,sans-serif';c.width=Math.ceil(ctx.measureText(text).width+56);c.height=108;ctx.font='600 64px Inter,Arial,sans-serif';ctx.fillStyle='rgba(252,251,247,.94)';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=COLORS.ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,c.width/2,58);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,depthTest:false}));sprite.scale.set(scale*c.width/c.height,scale,1);sprite.renderOrder=20;return sprite;}
    const render=()=>{if(destroyed||!renderer||frame)return;frame=requestAnimationFrame(()=>{frame=0;if(renderer&&!destroyed)renderer.render(scene,camera);});};
    groups={lot:new THREE.Group(),envelope:new THREE.Group(),masses:new THREE.Group()};Object.values(groups).forEach(g=>scene.add(g));scene.add(new THREE.HemisphereLight('#ffffff','#c6c9bb',2.7));const sun=new THREE.DirectionalLight('#fff8ed',2.4);sun.position.set(center.x+span,span*1.8,center.z+span*.5);scene.add(sun);const grid=new THREE.GridHelper(span*2.4,24,COLORS.grid,'#e0e3d9');grid.position.set(center.x,-.08,center.z);scene.add(grid);
    for(const p of features.lote_principal.polygons){const mesh=new THREE.Mesh(extrude(p,.035),new THREE.MeshStandardMaterial({color:COLORS.lot,roughness:.94}));mesh.position.y=-.04;groups.lot.add(mesh,outline(p,.04,COLORS.clay));}
    const ref=data.parameters?.heightReferenceM;if(envelopeId)for(const p of features[envelopeId].polygons){groups.envelope.add(outline(p,.08,COLORS.clay,.7));if(Number.isFinite(ref)&&ref>0){const g=extrude(p,ref);groups.envelope.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:COLORS.envelope,opacity:.06,transparent:true,side:THREE.DoubleSide,depthWrite:false})),new THREE.LineSegments(new THREE.EdgesGeometry(g,15),new THREE.LineBasicMaterial({color:COLORS.clay,opacity:.55,transparent:true})));}}
    function updateMasses(){disposeTree(groups.masses);massIds.forEach((id,index)=>features[id].polygons.forEach(p=>{groups.masses.add(new THREE.Mesh(extrude(p,floors*3),new THREE.MeshStandardMaterial({color:index===1?COLORS.alternate:COLORS.mass,roughness:.78,metalness:.025})),outline(p,floors*3+.01,COLORS.line,.8));const points=openMetricRing(p.outer),avg=points.reduce((s,p)=>[s[0]+p[0]/points.length,s[1]+p[1]/points.length],[0,0]);const caption=label(`${String.fromCharCode(65+index)} · ${floors} pav. / ${floors*3} m`,Math.max(3,span*.042));if(caption){caption.position.set(avg[0],floors*3+5,-avg[1]);groups.masses.add(caption);}for(let f=1;f<=floors;f++){const band=new THREE.Mesh(extrude(p,.1),new THREE.MeshStandardMaterial({color:COLORS.white,roughness:.9}));band.position.y=f*3-.1;groups.masses.add(band);}}));render();}
    function resize(){if(!renderer||destroyed)return;const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight||440);renderer.setSize(w,h,false);const aspect=w/h;camera.updateMatrixWorld(true);let ex=0,ey=0;for(const p of points)for(const z of[0,Math.max(floors*3,ref||0)]){const q=new THREE.Vector3(p[0],z,-p[1]).applyMatrix4(camera.matrixWorldInverse);ex=Math.max(ex,Math.abs(q.x));ey=Math.max(ey,Math.abs(q.y));}const half=Math.max(12,ey*1.3,ex*1.3/aspect);camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();render();}
    function selectView(){const dir=view==='top'?new THREE.Vector3(0,1,.0001):view==='front'?new THREE.Vector3(0,.025,1):new THREE.Vector3(1,.88,1.05).normalize();controls.target.copy(center);camera.position.copy(center).addScaledVector(dir,span*2.2);camera.up.set(0,1,0);camera.zoom=1;camera.lookAt(center);controls.update();resize();}
    controls.addEventListener('change',render);listen(canvas,'keydown',e=>{if(e.key==='+'||e.key==='=')camera.zoom=Math.min(8,camera.zoom*1.15);else if(e.key==='-')camera.zoom=Math.max(.35,camera.zoom/1.15);else if(e.key.toLowerCase()==='r'){selectView();return;}else return;e.preventDefault();camera.updateProjectionMatrix();render();});listen(canvas,'webglcontextlost',e=>{e.preventDefault();observer?.disconnect();cancelAnimationFrame(frame);frame=0;cleanRenderer();svgRender();});
    root._three={updateMasses,selectView,resize};stage.replaceChildren(canvas);mode='three';updateMasses();selectView();describe();if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(resize);observer.observe(host);}
  }
  listen(root,'pointermove',e=>{if(mode!=='svg'||!dragStart)return;view='iso';yaw=dragStart.yaw+(e.clientX-dragStart.x)*.007;svgRender();});
  listen(root,'pointerup',()=>{dragStart=null;});
  listen(root,'pointercancel',()=>{dragStart=null;});
  describe();
  try{
    const geometryUrl=options.geometryUrl||study.geography?.geometrySceneUrl;
    if(geometryUrl)data=await read(geometryUrl);
    else{const g=study.geography||{};if(!g.parcelUrl)throw new Error('Confirme o perímetro georreferenciado e a implantação para explorar o produto em 3D.');const find=id=>g.layers?.find(x=>x.id===id&&x.status==='available')?.url;const [parcel,envelope,volumes]=await Promise.all([read(g.parcelUrl),find('envelope')?read(find('envelope')):null,find('volumes')?read(find('volumes')):null]);data=geographicVolumeData(study,parcel,envelope,volumes);}
    if(destroyed)return;
    const scope=data.metadata?.scopeSQL,actual=study.parcel?.replace(/\D/g,'');if(scope&&actual&&scope!==actual)throw new Error('A cena não corresponde ao cadastro deste terreno.');validated=validateVolumeData(data);volumeSummary(data,floors);svgRender();
    if(options.renderer!=='svg')try{await initThree();}catch{cleanRenderer();if(!destroyed)svgRender();}
  }catch(e){if(!destroyed){data=null;unavailable(e.message);}}
  return {
    setScenario(next={}){if(next.floorHeightM!==undefined&&next.floorHeightM!==3)throw new RangeError('O ensaio usa 3 m por pavimento.');const n=next.floors??floors;if(!Number.isInteger(n)||n<1||n>20)throw new RangeError('Informe 1–20 pavimentos inteiros.');floors=n;if(mode==='three'){root._three.updateMasses();root._three.resize();describe();}else if(mode==='svg')svgRender();return summary();},
    setView(next){if(!['iso','top','front'].includes(next))throw new RangeError('Vista inválida.');view=next;zoom=1;if(mode==='three')root._three.selectView();else if(mode==='svg')svgRender();},
    fit(){zoom=1;yaw=-.68;if(mode==='three')root._three.selectView();else if(mode==='svg')svgRender();},
    getState(){return {...summary(),view,renderer:mode,measurementCRS:data?.metadata?.measurementCRS??null};},
    destroy(){if(destroyed)return;destroyed=true;requests.forEach(c=>c.abort());observer?.disconnect();listeners.forEach(off=>off());cancelAnimationFrame(frame);cleanRenderer();root.remove();},
  };
}
