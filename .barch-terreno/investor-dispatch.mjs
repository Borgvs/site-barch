import {createHash} from 'node:crypto';
import {evaluateAcquisition} from './acquisition-economics.mjs';
import {evaluateInvestorAcquisition} from './investor-acquisition.mjs';
export function dispatchAcquisition(input,{sourceBundle,study,baseline}={}){
 if(input?.investorMode!==true)return evaluateAcquisition(input);
 const invalid=message=>({status:'invalid',metrics:null,diagnostics:[{code:'INVESTOR_CONTEXT',message}]});
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['investorMode','request','costPolicy','uncertainty','marginPct'].includes(k)))return invalid('Contrato da hipótese do investidor inválido.');
 if(typeof input.marginPct!=='number'||!Number.isFinite(input.marginPct)||input.marginPct<0||input.marginPct>50)return invalid('Margem de negociação deve estar entre 0 e 50%.');
 if(input.costPolicy?.notaryMode==='sc_2026'&&study?.uf!=='SC')return invalid('A tabela de cartório de SC só pode ser usada para imóvel em SC.');
 const result=evaluateInvestorAcquisition(input.request,{costPolicy:input.costPolicy,uncertainty:input.uncertainty,sourceBundle});if(!result.metrics)return result;
 const prices=[result.ceilings.project.priceBrl,result.ceilings.equity.priceBrl].filter(x=>typeof x==='number'&&Number.isFinite(x)&&x>0),price=prices.length===2?Math.floor(Math.min(...prices)*(1-input.marginPct/100)/1000)*1000:null;
 const asking=baseline?.marketContext?.askingPriceBrl;
 const askingComparison=typeof asking==='number'&&asking>0?evaluateInvestorAcquisition({...input.request,acquisitionPriceBrl:asking},{costPolicy:input.costPolicy,sourceBundle,sensitivity:false,simulation:false}):null;
 const hypothesisSha256=createHash('sha256').update(JSON.stringify({input,sourceBundleSha256:sourceBundle.sourceBundleSha256,version:result.investorVersion})).digest('hex');
 return {...result,hypothesisSha256,recommendation:{priceBrl:price&&price>0?price:null,marginPct:input.marginPct,askingPriceBrl:asking??null,askingComparison,authority:'conditional_negotiation_target',investmentApproved:false,adoptedMarketValueBrl:null}};
}
