/** Independent display anchors. Never use Google mesh or export survey/design elevations. */
export const TERRARIUM_SOURCE=Object.freeze({
 id:'mapzen-terrarium',title:'Mapzen Terrain Tiles · SRTM / USGS',
 url:'https://registry.opendata.aws/terrain-tiles/',
 formatUrl:'https://github.com/tilezen/joerd/blob/master/docs/formats.md#terrarium',
 attributionUrl:'https://github.com/tilezen/joerd/blob/master/docs/attribution.md',
 attribution:'Mapzen Terrain Tiles · SRTM / GMTED2010 courtesy of USGS · ETOPO1 NOAA',
 role:'visual_context_only',surveyAuthority:false,designElevation:false,
 horizontalCRS:'EPSG:3857',heightUnit:'m',
 verticalReference:'Regional DEM source heights; ellipsoidal/geoid alignment not surveyed or corrected.',
});
const TILE_BASE='https://s3.amazonaws.com/elevation-tiles-prod/terrarium/';
const SIZE=256,MAX_BYTES=1024*1024,LAT_MAX=85.0511287798066;
const unavailable=()=>new Error('terrain_failed');
const abortError=()=>new DOMException('Cancelled','AbortError');
const validHeight=h=>Number.isFinite(h)&&h>=-11000&&h<=9000;

/** Web Mercator XYZ cell and nearest containing pixel, no interpolation across voids. */
export function terrariumSampleAddress(position,zoom=12){
 if(!Array.isArray(position)||position.length<2||!position.slice(0,2).every(Number.isFinite)||Math.abs(position[0])>180||Math.abs(position[1])>LAT_MAX||!Number.isInteger(zoom)||zoom<0||zoom>12)throw new RangeError('Coordenada ou nível de relevo inválido.');
 const [longitude,latitude]=position,n=2**zoom;
 const xFloat=Math.min(n-Number.EPSILON*n,Math.max(0,(longitude+180)/360*n));
 const yFloat=Math.min(n-Number.EPSILON*n,Math.max(0,(1-Math.asinh(Math.tan(latitude*Math.PI/180))/Math.PI)/2*n));
 const x=Math.floor(xFloat),y=Math.floor(yFloat);
 const pixelX=Math.min(SIZE-1,Math.floor((xFloat-x)*SIZE)),pixelY=Math.min(SIZE-1,Math.floor((yFloat-y)*SIZE));
 return {z:zoom,x,y,pixelX,pixelY,url:`${TILE_BASE}${zoom}/${x}/${y}.png`,groundResolutionM:156543.03392804097*Math.cos(latitude*Math.PI/180)/n};
}

/** RGB formula documented by the producer. Red=0 is its NoData sentinel. */
export function decodeTerrariumHeight(r,g,b,a=255){
 if(![r,g,b,a].every(x=>Number.isInteger(x)&&x>=0&&x<=255)||r===0||a!==255)return null;
 const height=(r*256+g+b/256)-32768;
 return validHeight(height)?height:null;
}

/** Decode only a bounded, 256px RGB/RGBA PNG; disable bitmap color conversion. */
export async function decodeTerrariumPng(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.length<33||bytes.length>MAX_BYTES||![137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))throw unavailable();
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(String.fromCharCode(...bytes.slice(12,16))!=='IHDR'||view.getUint32(16)!==SIZE||view.getUint32(20)!==SIZE||bytes[24]!==8||![2,6].includes(bytes[25]))throw unavailable();
 if(typeof createImageBitmap!=='function')throw unavailable();
 const bitmap=await createImageBitmap(new Blob([bytes],{type:'image/png'}),{colorSpaceConversion:'none',premultiplyAlpha:'none'});
 try{
  if(bitmap.width!==SIZE||bitmap.height!==SIZE)throw unavailable();
  const canvas=typeof OffscreenCanvas==='function'?new OffscreenCanvas(SIZE,SIZE):document.createElement('canvas');canvas.width=SIZE;canvas.height=SIZE;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw unavailable();
  ctx.imageSmoothingEnabled=false;ctx.drawImage(bitmap,0,0);
  return {width:SIZE,height:SIZE,data:ctx.getImageData(0,0,SIZE,SIZE).data};
 }finally{bitmap.close();}
}

function validatePoints(points){if(!Array.isArray(points)||!points.length||points.length>64)throw unavailable();return points.map(point=>terrariumSampleAddress(point));}
async function boundedBytes(response){
 if(!response.ok||!['image/png','application/octet-stream'].includes(response.headers.get('content-type')?.split(';')[0]))throw unavailable();
 const length=Number(response.headers.get('content-length'));if(Number.isFinite(length)&&length>MAX_BYTES)throw unavailable();
 const reader=response.body?.getReader();if(!reader)throw unavailable();const parts=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw unavailable();}parts.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}return bytes;
}

export async function sampleTerrariumAnchors(points,{fetchImpl=globalThis.fetch,decodePng=decodeTerrariumPng,signal,timeoutMs=8000}={}){
 const addresses=validatePoints(points),cache=new Map();
 const controller=new AbortController(),abort=()=>controller.abort();
 if(signal?.aborted)throw abortError();signal?.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(abort,timeoutMs);
 try{
  const samples=await Promise.all(addresses.map(async address=>{
   if(!cache.has(address.url))cache.set(address.url,(async()=>{
    const response=await fetchImpl(address.url,{signal:controller.signal,mode:'cors',credentials:'omit',redirect:'error',cache:'force-cache'});
    const decoded=await decodePng(await boundedBytes(response));
    if(decoded?.width!==SIZE||decoded?.height!==SIZE||decoded.data?.length!==SIZE*SIZE*4)throw unavailable();
    return decoded;
   })());
   const image=await cache.get(address.url),offset=(address.pixelY*SIZE+address.pixelX)*4;
   const heightM=decodeTerrariumHeight(...image.data.slice(offset,offset+4));if(heightM===null)throw unavailable();
   return {...address,heightM};
  }));
  if(controller.signal.aborted)throw abortError();
  return {heights:samples.map(p=>p.heightM),metadata:{...TERRARIUM_SOURCE,checkedAt:new Date().toISOString(),encoding:'(red * 256 + green + blue / 256) - 32768',zoom:12,pixelSampling:'nearest-containing-pixel',tileCount:cache.size,samples}};
 }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}

async function boundedTask(task,timeoutMs,signal){
 if(signal?.aborted)throw abortError();let timer,abort;
 const bound=new Promise((_,reject)=>{timer=setTimeout(()=>reject(unavailable()),timeoutMs);abort=()=>reject(abortError());signal?.addEventListener('abort',abort,{once:true});});
 try{return await Promise.race([task(),bound]);}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}

/** Prefer the already-authorized CWT, fall back to the independent public DEM. */
export async function resolveVisualTerrainAnchors(points,{cesium,ionToken,signal,cesiumTimeoutMs=6000,...options}={}){
 validatePoints(points);
 if(typeof ionToken==='string'&&ionToken.trim()&&cesium?.createWorldTerrainAsync){
  try{
   return await boundedTask(async()=>{
    cesium.Ion.defaultAccessToken=ionToken;
    const provider=await cesium.createWorldTerrainAsync({requestVertexNormals:false});
    const samples=await cesium.sampleTerrainMostDetailed(provider,points.map(p=>cesium.Cartographic.fromDegrees(p[0],p[1])));
    if(samples.length!==points.length||!samples.every(p=>validHeight(p.height)))throw unavailable();
    return {heights:samples.map(p=>p.height),metadata:{id:'cesium-world-terrain',title:'Cesium World Terrain · contexto visual independente',role:'visual_context_only',surveyAuthority:false,designElevation:false,checkedAt:new Date().toISOString()}};
   },cesiumTimeoutMs,signal);
  }catch{if(signal?.aborted)throw abortError();}
 }
 return sampleTerrariumAnchors(points,{signal,...options});
}
