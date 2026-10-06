/** Export projection only: does not evaluate provenance or authorize a conclusion. */
const personal=/(?:^|[^\d])(?:\d{11}|\d{14}|\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})(?:$|[^\d])/;
export const reportText=value=>typeof value==='string'?value.slice(0,4000):'';
export const reportHash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value)?value:null;
export const reportId=value=>typeof value==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_:.-]{0,159}$/.test(value)?value:null;
export function reportSourceUrl(value){
 try{const u=new URL(value);if(!/^https?:$/.test(u.protocol)||u.username||u.password)return null;
  if([...u.searchParams.keys()].some(k=>/token|key|password|secret|auth|cpf|cnpj|owner|signature|nome/i.test(k)))return null;
  const fields=[...u.searchParams.values(),decodeURIComponent(u.pathname),decodeURIComponent(u.hash)];
  if(fields.some(v=>personal.test(v)||/(?:cpf|cnpj|titular|owner)\b/i.test(v)))return null;
  return u.href;
 }catch{return null;}
}
export function reportPublicText(value){
 const v=reportText(value);
 if(personal.test(v)||/(?:\/Users\/|\/private\/|file:\/\/|api[_-]?key\s*[:=]|bearer\s+[a-z0-9]|(?:cpf|cnpj|titular|owner)\s*[:=])/i.test(v))return '';
 return v;
}
