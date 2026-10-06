/** Bounded retries for transport failures in read-only publication checks.
 * Read the complete body within the deadline so a truncated transfer cannot
 * become a successful integrity check. HTTP status and bytes remain untouched.
 */
export async function readPublicResponse(url,{fetchImpl=fetch,timeoutMs=25000,maxAttempts=3,retryDelayMs=250,onRetry=()=>{}}={}){
 if(!Number.isInteger(maxAttempts)||maxAttempts<1||maxAttempts>3)throw Error('Use 1–3 tentativas de leitura.');
 for(let attempt=1;attempt<=maxAttempts;attempt++){
  let response,bytes;
  try{
   response=await fetchImpl(url,{signal:AbortSignal.timeout(timeoutMs)});
   bytes=await response.arrayBuffer();
  }catch(error){
   const transport=error.name==='TimeoutError'||(error instanceof TypeError&&/fetch failed|terminated/i.test(error.message));
   if(!transport||attempt===maxAttempts)throw error;
   onRetry({url,attempt,maxAttempts,name:error.name,message:error.message});
   if(retryDelayMs>0)await new Promise(resolve=>setTimeout(resolve,retryDelayMs));
   continue;
  }
  const buffered=new Response([204,205,304].includes(response.status)?null:bytes,{status:response.status,statusText:response.statusText,headers:response.headers});
  Object.defineProperties(buffered,{url:{value:response.url},redirected:{value:response.redirected}});
  return buffered;
 }
}
