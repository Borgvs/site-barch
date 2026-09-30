/** Capture time is independent of input integrity and legal validity. */
export const VERIFICATION_MAX_AGE_MS=86400000;
export function evidenceTimestamp(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value))return null;
 const day=Date.parse(value.slice(0,10)+'T00:00:00Z');if(!Number.isFinite(day)||new Date(day).toISOString().slice(0,10)!==value.slice(0,10))return null;
 const parsed=Date.parse(value);return Number.isFinite(parsed)?parsed:null;
}
export function assessTemporalCurrency(at,{now=new Date().toISOString(),maxAgeMs=VERIFICATION_MAX_AGE_MS}={}){
 if(!Number.isInteger(maxAgeMs)||maxAgeMs<1||maxAgeMs>366*86400000)throw Error('Prazo de atualização inválido.');
 const captured=evidenceTimestamp(at),clock=evidenceTimestamp(now);
 if(captured===null||clock===null)return {status:'invalid-date',at:at??null,ageMs:null,maxAgeMs,reason:'Carimbo da execução ou relógio de conferência inválido.'};
 const ageMs=clock-captured;
 if(ageMs<0)return {status:'future',at,ageMs,maxAgeMs,reason:'A execução está datada no futuro; conferir o relógio e repetir.'};
 return {status:ageMs>=maxAgeMs?'expired':'current',at,ageMs,maxAgeMs,expiresAt:new Date(captured+maxAgeMs).toISOString(),reason:ageMs>=maxAgeMs?'Prazo operacional de atualização ultrapassado; reconsultar fontes.':'Dentro do prazo operacional de atualização. Não comprova vigência de licença, norma ou certidão.'};
}
