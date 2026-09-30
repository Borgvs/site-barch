/** Reassess capture time when a public snapshot is read. Never mutate its archive. */
import {assessTemporalCurrency} from './temporal.mjs';
export function refreshPublicReceiptCurrency(value,{now=new Date().toISOString()}={}){
 const receipt=value?.verification??value?.latest;
 if(receipt?.freshness?.status!=='current')return value;
 const temporal=assessTemporalCurrency(receipt.at,{now,maxAgeMs:receipt.freshness.temporal?.maxAgeMs});
 if(temporal.status==='current')return value;
 const result=structuredClone(value),current=result.verification??result.latest;
 current.freshness={...current.freshness,status:temporal.status==='expired'?'stale':'unverifiable',temporal,reason:temporal.reason};
 if(result.assessment){result.assessment.editorial.eligible=false;result.assessment.capabilities.preliminaryPresentation=false;result.assessment.state=temporal.status==='expired'?'refresh_required':'reconciliation_required';}
 return result;
}
