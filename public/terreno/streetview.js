/** Street View Tiles: live visualization only. No imagery export, persistence or inference.
 * Session metadata and images remain in memory. Saved framing uses only the input point.
 * https://developers.google.com/maps/documentation/tile/streetview
 * https://developers.google.com/maps/documentation/tile/policies
 */
const TILE_ORIGIN='https://tile.googleapis.com';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const angle=n=>((n%360)+360)%360;
const validPoint=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90;
const radians=n=>n*Math.PI/180;
export const STREETVIEW_POLICY=Object.freeze({provider:'google-streetview-tiles',role:'live_visual_context',captureAllowed:false,persistentImageryAllowed:false,imageAnalysisAllowed:false,metadataLifetime:'viewer_session',maxTilesPerPanorama:8});

export function bearingBetween(from,to){
  if(!validPoint(from)||!validPoint(to))throw new RangeError('Coordenadas geográficas inválidas.');
  const lat1=radians(from[1]),lat2=radians(to[1]),dl=radians(to[0]-from[0]);
  return angle(Math.atan2(Math.sin(dl)*Math.cos(lat2),Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(dl))*180/Math.PI);
}
export function panoramaLayout(metadata,maxTiles=8){
  const {imageWidth:w,imageHeight:h,tileWidth:tw,tileHeight:th}=metadata||{};
  if(![w,h,tw,th].every(n=>Number.isInteger(n)&&n>0)||w>32768||h>16384||tw>2048||th>2048)throw new Error('metadata_invalid');
  for(let z=2;z>=0;z--){const width=Math.ceil(w/2**(5-z)),height=Math.ceil(h/2**(5-z)),columns=Math.ceil(width/tw),rows=Math.ceil(height/th);if(columns*rows<=maxTiles)return {zoom:z,width,height,tileWidth:tw,tileHeight:th,tiles:Array.from({length:columns*rows},(_,i)=>({x:i%columns,y:Math.floor(i/columns)}))};}
  throw new Error('tile_budget');
}
export function streetViewUrl(point,{heading=0,pitch=0,fov=90}={}){
  if(!validPoint(point))return null;
  const u=new URL('https://www.google.com/maps/@');u.searchParams.set('api','1');u.searchParams.set('map_action','pano');u.searchParams.set('viewpoint',`${point[1]},${point[0]}`);u.searchParams.set('heading',String(angle(heading)));u.searchParams.set('pitch',String(clamp(pitch,-90,90)));u.searchParams.set('fov',String(clamp(fov,30,100)));return u.toString();
}
function safeReportLink(value){try{const u=new URL(value);return u.protocol==='https:'&&(['google.com','googleapis.com'].some(host=>u.hostname===host||u.hostname.endsWith('.'+host)))?u.href:null;}catch{return null;}}
function checkedMetadata(m){
  if(!m||typeof m.panoId!=='string'||!m.panoId||!validPoint([m.lng,m.lat])||!Number.isFinite(m.heading)||typeof m.copyright!=='string'||!m.copyright||!safeReportLink(m.reportProblemLink))throw new Error('metadata_invalid');
  panoramaLayout(m);
  return {...m,links:(Array.isArray(m.links)?m.links:[]).filter(l=>typeof l.panoId==='string'&&l.panoId&&Number.isFinite(l.heading)).slice(0,12)};
}

export async function mountStreetView(host,study,options={}){
  if(!(host instanceof HTMLElement))throw new Error('Contêiner do Street View ausente.');
  const settings=study.geography?.streetView||{},point=options.viewpoint||settings.viewpoint||study.geography?.center,target=options.target||settings.target||study.geography?.center;
  const inputPoint=validPoint(point)?[...point]:null,inputTarget=validPoint(target)?[...target]:inputPoint;
  const maxPanoramas=Number.isInteger(options.maxPanoramas)?clamp(options.maxPanoramas,1,50):20;
  const maxImageRequests=Number.isInteger(options.maxImageRequests)?clamp(options.maxImageRequests,1,400):maxPanoramas*8;
  const maxThumbnailsPerPanorama=24;
  let disposed=false,state='idle',reason=null,config=null,session=null,metadata=null,heading=Number.isFinite(options.heading)?angle(options.heading):Number.isFinite(settings.heading)?angle(settings.heading):0,pitch=0,fov=80,renderer=null,scene=null,camera=null,sphere=null,texture=null,T=null,observer=null,panoramaCount=0,tileCount=0,thumbnailCount=0,imageRequests=0,panoramaThumbnails=0,sequence=0,thumbnailSequence=0,thumbnailTimer=null,thumbnailController=null,thumbnailObjectUrl=null,thumbnailLoadTimer=null,drag=null,rendererKind=null;
  const controllers=new Set(),requestFetch=options.fetch||globalThis.fetch;
  if(!document.querySelector('link[data-streetview-css]')){const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./streetview.css',import.meta.url).href;css.dataset.streetviewCss='true';document.head.append(css);}
  const element=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const root=element('section','streetview-shell'),stage=element('div','streetview-stage');stage.tabIndex=0;stage.setAttribute('aria-label','Street View: arraste para olhar ao redor; setas giram a visão; + e − alteram a aproximação.');
  const viewport=element('div','streetview-viewport'),cover=element('div','streetview-cover'),status=element('div','streetview-status');status.setAttribute('role','status');
  const title=element('strong',null,'Fachada e entorno'),detail=element('p',null,'Explore a vista ao nível da rua a partir do ponto de referência do estudo.');
  const openButton=element('button','streetview-open','Abrir Street View');openButton.type='button';
  const tools=element('div','streetview-tools'),neighbors=element('div','streetview-neighbors');neighbors.setAttribute('aria-label','Percorrer panoramas vizinhos');
  const credit=element('div','streetview-credit'),brand=element('span','streetview-brand','Google Maps'),copyright=element('span'),report=element('a',null,'Informar problema nesta imagem');report.target='_blank';report.rel='noopener noreferrer';
  const toolbar=element('div','streetview-toolbar'),compass=element('span','streetview-compass'),external=element('a',null,'Abrir no Google Maps ↗');external.target='_blank';external.rel='noopener noreferrer';
  const note=element('p','streetview-note','Imagem de referência histórica. A condição atual é verificada na vistoria do profissional.');
  const legal=element('div','streetview-legal');legal.append(element('span',null,'Recursos Google sujeitos aos'));
  for(const [label,href]of [['Termos Google Maps','https://maps.google.com/help/terms_maps/'],['Privacidade Google','https://policies.google.com/privacy']]){const link=element('a',null,label);link.href=href;link.target='_blank';link.rel='noopener noreferrer';legal.append(link);}
  cover.append(title,detail,openButton);credit.append(brand,copyright,report);stage.append(viewport,cover,status,tools,credit);toolbar.append(compass,external);root.append(stage,toolbar,neighbors,note,legal);host.replaceChildren(root);
  credit.hidden=true;tools.hidden=true;neighbors.hidden=true;
  function button(label,text,fn){const node=element('button',null,text);node.type='button';node.setAttribute('aria-label',label);node.title=label;node.addEventListener('click',fn);tools.append(node);return node;}
  button('Olhar para a esquerda','←',()=>setView({heading:heading-25}));button('Olhar para a direita','→',()=>setView({heading:heading+25}));button('Aproximar vista','+',()=>setView({fov:fov-10}));button('Afastar vista','−',()=>setView({fov:fov+10}));button('Voltar a olhar para o terreno','Terreno',()=>faceLot());
  const getState=()=>({state,reason,renderer:rendererKind,panoramasOpened:panoramaCount,tilesRequested:tileCount,thumbnailsRequested:thumbnailCount,imageRequests,maxImageRequests,maxThumbnailsPerPanorama,heading,pitch,fov,neighborCount:metadata?.links.length||0,policy:STREETVIEW_POLICY});
  function updateReadout(){compass.textContent=`${Math.round(heading)}° · ${rendererKind==='thumbnail'?'vista direcional':'arraste para explorar'}`;external.href=streetViewUrl(inputPoint,{heading,pitch,fov})||'https://www.google.com/maps';host.dataset.streetviewState=state;host.dataset.streetviewRenderer=rendererKind||'';host.dataset.streetviewHeading=String(Math.round(heading));options.onViewChange?.(getState());}
  function fail(code){reason=code;state='unavailable';cover.hidden=false;openButton.disabled=false;openButton.textContent='Tentar novamente';title.textContent='Street View indisponível nesta consulta';detail.textContent=({not_configured:'A conexão Google do aplicativo não está configurada.',location_missing:'Cadastre um ponto de referência para consultar a rua.',not_found:'Nenhum panorama foi retornado próximo ao ponto de referência.',permission_denied:'A conexão Google não autorizou Street View nesta origem.',quota_exceeded:'A cota da integração Google foi alcançada.',request_timeout:'A consulta não respondeu a tempo.',session_budget:'Limite de panoramas desta sessão alcançado. Reabra o painel para continuar.',image_budget:'Limite de imagens desta abertura alcançado. Continue pelo link Google Maps.',thumbnail_budget:'Limite de atualizações desta vista direcional alcançado. Escolha outra posição ou continue no Google Maps.',metadata_invalid:'O panorama não trouxe os dados necessários à exibição.',image_failed:'A imagem do panorama não pôde ser carregada.'})[code]||'Não foi possível carregar a vista. O link Google Maps permanece disponível.';status.textContent='';updateReadout();}
  function url(path,params={}){const u=new URL('/v1/'+path,TILE_ORIGIN);u.searchParams.set('key',config.apiKey);if(session?.session&&path!=='createSession')u.searchParams.set('session',session.session);for(const [key,value]of Object.entries(params))u.searchParams.set(key,String(value));return u;}
  async function request(u,{body,kind='json',controller=new AbortController()}={}){
    if(disposed)throw new Error('disposed');controllers.add(controller);const timer=setTimeout(()=>controller.abort(),12000);
    try{const response=await requestFetch(u,{method:body?'POST':'GET',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{}),signal:controller.signal,credentials:new URL(u,location.href).origin===location.origin?'same-origin':'omit'});if(!response.ok)throw new Error(response.status===403?'permission_denied':response.status===404?'not_found':response.status===429?'quota_exceeded':'request_failed');return kind==='blob'?await response.blob():await response.json();}
    catch(error){if(error.name==='AbortError')throw new Error('request_timeout');throw error;}
    finally{clearTimeout(timer);controllers.delete(controller);}
  }
  function reserveImage(kind){if(imageRequests>=maxImageRequests)throw new Error('image_budget');if(kind==='thumbnail'&&panoramaThumbnails>=maxThumbnailsPerPanorama)throw new Error('thumbnail_budget');imageRequests++;if(kind==='tile')tileCount++;else{thumbnailCount++;panoramaThumbnails++;}}
  function clearThumbnail(){thumbnailSequence++;clearTimeout(thumbnailTimer);clearTimeout(thumbnailLoadTimer);thumbnailController?.abort();thumbnailController=null;if(thumbnailObjectUrl){URL.revokeObjectURL(thumbnailObjectUrl);thumbnailObjectUrl=null;}}
  function clearGraphics(){observer?.disconnect();observer=null;texture?.dispose();if(texture?.image){texture.image.width=0;texture.image.height=0;}texture=null;sphere?.geometry?.dispose();sphere?.material?.dispose();sphere=null;const previous=renderer;renderer=null;previous?.dispose();previous?.forceContextLoss?.();scene=null;camera=null;viewport.replaceChildren();}
  function paint(){if(!renderer||!camera||disposed)return;const width=stage.clientWidth||800,height=stage.clientHeight||400;renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=2*Math.atan(Math.tan(radians(fov/2))/camera.aspect)*180/Math.PI;camera.updateProjectionMatrix();const a=radians(heading),p=radians(pitch);camera.lookAt(Math.sin(a)*Math.cos(p),Math.sin(p),-Math.cos(a)*Math.cos(p));renderer.render(scene,camera);}
  async function renderSphere(m,token){
    T=options.three||await import('./assets/vendor/three.module.js?v=de24f7145749');if(disposed||token!==sequence)return;
    renderer=new T.WebGLRenderer({antialias:false,alpha:false,powerPreference:'low-power',preserveDrawingBuffer:false});renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
    const layout=panoramaLayout(m),mosaic=document.createElement('canvas');mosaic.width=layout.width;mosaic.height=layout.height;const ctx=mosaic.getContext('2d');if(!ctx)throw new Error('image_failed');
    if(imageRequests+layout.tiles.length>maxImageRequests)throw new Error('image_budget');
    let cursor=0;const worker=async()=>{while(cursor<layout.tiles.length){const tile=layout.tiles[cursor++];if(disposed||token!==sequence)return;reserveImage('tile');const blob=await request(url(`streetview/tiles/${layout.zoom}/${tile.x}/${tile.y}`,{panoId:m.panoId}),{kind:'blob'});const bitmap=await createImageBitmap(blob);try{if(!disposed&&token===sequence)ctx.drawImage(bitmap,tile.x*layout.tileWidth,tile.y*layout.tileHeight);}finally{bitmap.close();}}};
    await Promise.all([worker(),worker(),worker()]);if(disposed||token!==sequence){mosaic.width=0;mosaic.height=0;return;}
    scene=new T.Scene();camera=new T.PerspectiveCamera(60,1,.1,20);texture=new T.CanvasTexture(mosaic);texture.colorSpace=T.SRGBColorSpace;
    // Sphere UV center (u=.5) faces metadata.heading; no image measurements or extraction.
    const geometry=new T.SphereGeometry(10,64,40);geometry.scale(-1,1,1);geometry.rotateY(-Math.PI/2-radians(m.heading));
    sphere=new T.Mesh(geometry,new T.MeshBasicMaterial({map:texture}));scene.add(sphere);viewport.replaceChildren(renderer.domElement);rendererKind='panorama';
    const activeRenderer=renderer;
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();if(!disposed&&renderer===activeRenderer&&metadata){clearGraphics();renderThumbnail(metadata);}} ,{once:true});
    if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(paint);observer.observe(stage);}paint();
  }
  async function renderThumbnail(m){
    if(disposed)return;clearThumbnail();rendererKind='thumbnail';const token=thumbnailSequence;thumbnailController=new AbortController();
    const current=()=>!disposed&&m===metadata&&token===thumbnailSequence;
    try{
      reserveImage('thumbnail');
      const blob=await request(url('streetview/thumbnail',{panoId:m.panoId,width:600,height:250,yaw:heading,pitch,fov}),{kind:'blob',controller:thumbnailController});if(!current())return;
      const image=element('img','streetview-thumbnail');image.alt='Street View — vista direcional do panorama atual';thumbnailObjectUrl=URL.createObjectURL(blob);
      const release=()=>{clearTimeout(thumbnailLoadTimer);if(thumbnailObjectUrl){URL.revokeObjectURL(thumbnailObjectUrl);thumbnailObjectUrl=null;}};
      image.addEventListener('load',()=>{if(!current())return;release();state='ready';reason=null;cover.hidden=true;status.textContent='Vista direcional · use os controles para olhar ao redor';updateReadout();},{once:true});
      image.addEventListener('error',()=>{if(current()){release();fail('image_failed');}},{once:true});
      thumbnailLoadTimer=setTimeout(()=>{if(current()){release();fail('request_timeout');}},12000);
      image.src=thumbnailObjectUrl;viewport.replaceChildren(image);updateReadout();
    }catch(error){if(current())fail(error.message);}
  }
  function setView(next={}){
    if(disposed)return;
    for(const key of ['heading','pitch','fov'])if(next[key]!==undefined&&!Number.isFinite(next[key]))throw new RangeError('Orientação inválida.');
    if(next.heading!==undefined)heading=angle(next.heading);if(next.pitch!==undefined)pitch=clamp(next.pitch,-80,80);if(next.fov!==undefined)fov=clamp(next.fov,30,100);
    if(rendererKind==='thumbnail'&&metadata){clearTimeout(thumbnailTimer);thumbnailTimer=setTimeout(()=>{if(!disposed)renderThumbnail(metadata);},350);}else paint();updateReadout();return getState();
  }
  function faceLot(){if(metadata&&inputTarget)setView({heading:bearingBetween([metadata.lng,metadata.lat],inputTarget),pitch:0});}
  async function navigate(panoId=null){
    if(disposed||state==='loading')return getState();if(!inputPoint){fail('location_missing');return getState();}if(panoramaCount>=maxPanoramas){fail('session_budget');return getState();}
    state='loading';reason=null;const token=++sequence;openButton.disabled=true;status.textContent='Consultando panorama…';updateReadout();
    try{
      if(!config){config=options.config||await request(new URL('/terreno/api/integrations/google-maps',location.href));if(!config?.configured||typeof config.apiKey!=='string'||!/^AIza[0-9A-Za-z_-]{20,}$/.test(config.apiKey))throw new Error('not_configured');}
      if(!session||Number(session.expiry)*1000<Date.now()+60000){session=await request(url('createSession'),{body:{mapType:'streetview',language:'pt-BR',region:'BR'}});if(!session?.session)throw new Error('request_failed');}
      const next=checkedMetadata(await request(url('streetview/metadata',panoId?{panoId}:{lat:inputPoint[1],lng:inputPoint[0],radius:clamp(settings.radiusM||150,10,500)})));
      if(disposed||token!==sequence)return getState();clearThumbnail();clearGraphics();metadata=next;panoramaCount++;panoramaThumbnails=0;
      if(!panoId)heading=Number.isFinite(options.heading)?angle(options.heading):Number.isFinite(settings.heading)?angle(settings.heading):bearingBetween([next.lng,next.lat],inputTarget);pitch=0;
      copyright.textContent=next.copyright;report.href=safeReportLink(next.reportProblemLink);credit.hidden=false;tools.hidden=false;neighbors.hidden=false;
      note.textContent=`Imagem ${next.date||'sem data informada'} · ${next.imageryType==='indoor'?'captura interna':next.imageryType==='outdoor'?'captura externa':'tipo de captura não informado'}. A posição retornada pode diferir do ponto solicitado; confirme a fachada na vistoria.`;
      neighbors.replaceChildren();for(const [i,link]of next.links.entries()){const btn=element('button',null,`${link.text||'Via próxima'} · ${Math.round(angle(link.heading))}° →`);btn.type='button';btn.addEventListener('click',()=>goTo(i));neighbors.append(btn);}if(!next.links.length)neighbors.append(element('span',null,'Este panorama não informa conexões navegáveis.'));
      try{if(options.renderer==='thumbnail')throw new Error('thumbnail_requested');await renderSphere(next,token);if(disposed||token!==sequence)return getState();state='ready';cover.hidden=true;status.textContent='';updateReadout();}
      catch(error){if(disposed||token!==sequence)return getState();controllers.forEach(controller=>controller.abort());clearGraphics();if(['permission_denied','quota_exceeded','image_budget'].includes(error.message))throw error;status.textContent='Carregando vista direcional…';await renderThumbnail(next);}
      return getState();
    }catch(error){if(!disposed)fail(error.message);return getState();}
  }
  function goTo(index){const link=metadata?.links[index];if(!link)return Promise.resolve(getState());heading=angle(link.heading);return navigate(link.panoId);}
  stage.addEventListener('pointerdown',event=>{if(!metadata||state!=='ready'||event.button!==0||event.target.closest?.('button,a'))return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,heading,pitch};stage.setPointerCapture?.(event.pointerId);stage.focus();});
  stage.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;setView({heading:drag.heading+(drag.x-event.clientX)*fov/(stage.clientWidth||800),pitch:drag.pitch+(event.clientY-drag.y)*.15});});
  const stopDrag=()=>{drag=null;};stage.addEventListener('pointerup',stopDrag);stage.addEventListener('pointercancel',stopDrag);
  stage.addEventListener('wheel',event=>{if(!metadata||state!=='ready')return;event.preventDefault();setView({fov:fov+Math.sign(event.deltaY)*5});},{passive:false});
  stage.addEventListener('keydown',event=>{const n=event.key==='ArrowLeft'?{heading:heading-10}:event.key==='ArrowRight'?{heading:heading+10}:event.key==='ArrowUp'?{pitch:pitch+8}:event.key==='ArrowDown'?{pitch:pitch-8}:event.key==='+'||event.key==='='?{fov:fov-10}:event.key==='-'?{fov:fov+10}:null;if(n&&metadata){event.preventDefault();setView(n);}});
  openButton.addEventListener('click',()=>navigate());updateReadout();if(!inputPoint){openButton.disabled=true;detail.textContent='Cadastre a localização do terreno para consultar a rua.';}
  return {open:()=>navigate(),goTo,faceLot,setView,getState,getBookmark:()=>inputPoint?{provider:STREETVIEW_POLICY.provider,viewpoint:[...inputPoint],heading,pitch,fov,pointSource:'study_input',exactPanorama:false}:null,destroy(){if(disposed)return;disposed=true;sequence++;clearThumbnail();controllers.forEach(controller=>controller.abort());clearGraphics();session=null;metadata=null;config=null;root.remove();}};
}
