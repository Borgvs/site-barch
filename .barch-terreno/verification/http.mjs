/** Read-only HTTP boundary. MPBRC-083: failure cannot become an absence claim.
 * Fetch, body, retries and backoff share a finite budget. No redirects or hosts
 * supplied by remote data. Paid clients must set retries=0. */
import {createHash} from 'node:crypto';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const transient=code=>code===408||code===425||code===429||[500,502,503,504].includes(code);
export function publicReceiptUrl(value){
 const url=new URL(value);for(const key of [...url.searchParams.keys()])if(/^(?:key|api[-_]?key|token|access_token)$/i.test(key))url.searchParams.set(key,'[redacted]');return url.href;
}
function limits({timeoutMs,totalTimeoutMs,maxBytes,retries,backoffMs,maxRetryDelayMs,method,readOnly}){
 for(const [name,value,min,max] of [['timeoutMs',timeoutMs,1,60000],['totalTimeoutMs',totalTimeoutMs,1,60000],['maxBytes',maxBytes,1,16*1024*1024],['retries',retries,0,2],['backoffMs',backoffMs,0,5000],['maxRetryDelayMs',maxRetryDelayMs,0,10000]])if(!Number.isInteger(value)||value<min||value>max)throw Error(`Limite de consulta inválido: ${name}.`);
 if(retries>0&&method!=='GET'&&readOnly!==true)throw Error('Repetição exige consulta somente de leitura.');
}
/** Race enforces the deadline even when an injected provider ignores AbortSignal. */
export async function boundedOperation(operation,timeoutMs,{signal}={}){
 if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>60000)throw Error('Prazo de operação inválido.');
 const controller=new AbortController();let timer,onAbort;
 const deadline=new Promise((_,reject)=>{
  const stop=kind=>{const error=Object.assign(Error(kind==='cancelled'?'Operação cancelada.':'Prazo de operação excedido.'),{code:kind});controller.abort(error);reject(error);};
  timer=setTimeout(()=>stop('timeout'),timeoutMs);
  onAbort=()=>stop('cancelled');signal?.addEventListener('abort',onAbort,{once:true});if(signal?.aborted)onAbort();
 });
 try{return await Promise.race([Promise.resolve().then(()=>{if(controller.signal.aborted)throw controller.signal.reason;return operation(controller.signal);}),deadline]);}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',onAbort);}
}
function cancelBody(response){try{const p=response?.body?.cancel?.();p?.catch?.(()=>{});}catch{/* An unavailable cancellation does not replace the original transport result. */}}
function retryAfter(value,now){
 if(value==null)return null;if(/^\d+(?:\.\d+)?$/.test(value))return Math.max(0,Math.ceil(Number(value)*1000));
 const at=Date.parse(value);return Number.isFinite(at)?Math.max(0,at-now):null;
}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function requestBoundedHttp(url,{allowedHosts,fetchFn=globalThis.fetch,timeoutMs=10000,totalTimeoutMs=Math.min(60000,timeoutMs*2+2000),maxBytes=1_000_000,retries=1,backoffMs=250,maxRetryDelayMs=2000,method='GET',readOnly=false,body,headers={},responseType='json',signal,random=Math.random,sleepFn=sleep}={}){
 const parsed=new URL(url);method=String(method).toUpperCase();
 if(parsed.protocol!=='https:'||parsed.username||parsed.password||(parsed.port&&parsed.port!=='443')||!Array.isArray(allowedHosts)||!allowedHosts.includes(parsed.hostname))throw Error('Origem fora da lista pública autorizada.');
 if(!['json','text'].includes(responseType))throw Error('Formato de resposta não autorizado.');
 limits({timeoutMs,totalTimeoutMs,maxBytes,retries,backoffMs,maxRetryDelayMs,method,readOnly});
 const receiptUrl=publicReceiptUrl(url),start=Date.now(),history=[];let last;
 for(let attempt=0;attempt<=retries;attempt++){
  const remaining=totalTimeoutMs-(Date.now()-start);if(remaining<=0||signal?.aborted)break;
  const retrievedAt=new Date().toISOString(),attemptStart=Date.now();let response=null;
  let result;
  try{result=await boundedOperation(async attemptSignal=>{
   response=await fetchFn(url,{method,body,headers:{Accept:responseType==='json'?'application/json':'text/html',...headers},redirect:'error',signal:attemptSignal});
   if(!response.ok){cancelBody(response);return {ok:false,status:[401,403].includes(response.status)?'acesso-restrito':response.status===429?'limite-consulta':'falha-http',httpStatus:response.status,retryAfterMs:retryAfter(response.headers.get('retry-after'),Date.now())};}
   if(Number(response.headers.get('content-length'))>maxBytes){cancelBody(response);return {ok:false,status:'resposta-excessiva',httpStatus:response.status};}
   if(!response.body) return {ok:false,status:'resposta-invalida',httpStatus:response.status};
   const chunks=[];let size=0;
   for await(const chunk of response.body){size+=chunk.length;if(size>maxBytes){cancelBody(response);return {ok:false,status:'resposta-excessiva',httpStatus:response.status};}chunks.push(chunk);}
   const bytes=Buffer.concat(chunks),common={httpStatus:response.status,bytes,sha256:sha(bytes)};
   if(responseType==='text')return {ok:true,status:'ok',data:bytes.toString('utf8'),...common};
   try{return {ok:true,status:'ok',data:JSON.parse(bytes.toString('utf8')),...common};}catch{return {ok:false,status:'resposta-invalida',...common};}
  },Math.min(timeoutMs,remaining),{signal});}
  catch(error){cancelBody(response);result={ok:false,status:error?.code==='timeout'?'timeout':error?.code==='cancelled'?'cancelado':'falha-rede',httpStatus:response?.status??null};}
  history.push({attempt:attempt+1,at:retrievedAt,status:result.status,httpStatus:result.httpStatus,elapsedMs:Date.now()-attemptStart});
  last={...result,receipt:{url:receiptUrl,retrievedAt,status:result.status,httpStatus:result.httpStatus,attempts:attempt+1,history:[...history],elapsedMs:Date.now()-start,...(result.sha256?{sha256:result.sha256,bytes:result.bytes.length}:{})}};
  const retryable=['timeout','falha-rede'].includes(result.status)||transient(result.httpStatus);
  if(result.ok||!retryable||attempt===retries||signal?.aborted)break;
  // A long Retry-After is deferred, never shortened to hammer the provider.
  const jitter=clamp(Number(random())||0,0,1),delay=result.retryAfterMs??Math.round(Math.min(maxRetryDelayMs,backoffMs*2**attempt)*(0.75+jitter*0.5));
  const left=totalTimeoutMs-(Date.now()-start);
  if(delay>maxRetryDelayMs||delay>=left){last.receipt.retryDeferred=true;last.receipt.retryAfterMs=delay;break;}
  history.at(-1).retryDelayMs=delay;
  try{if(delay)await boundedOperation(()=>sleepFn(delay),Math.max(1,left),{signal});}
  catch{last.status=signal?.aborted?'cancelado':'timeout';last.receipt.status=last.status;break;}
 }
 if(!last){const status=signal?.aborted?'cancelado':'timeout';return {ok:false,status,httpStatus:null,data:null,bytes:null,receipt:{url:receiptUrl,retrievedAt:new Date().toISOString(),status,httpStatus:null,attempts:0,history,elapsedMs:Date.now()-start}};}
 last.receipt.history=history.map(row=>({...row}));
 last.receipt.elapsedMs=Date.now()-start;return {...last,data:last.data??null,bytes:last.bytes??null};
}
