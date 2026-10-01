/** Latest recorded statement per criterion; counts describe records, never risk or approval. */
import {STREETVIEW_REVIEW_CRITERIA,STREETVIEW_REVIEW_STATUSES,STREETVIEW_REVIEW_BASES} from './surroundings-schema.js?v=fe0a812ef54f';
const compare=(a,b)=>a<b?-1:a>b?1:0;
function validDay(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;}
function instant(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)&&validDay(value.slice(0,10))?Date.parse(value):NaN;}
function precedence(a,b){return compare(a.item.reviewedOn,b.item.reviewedOn)||compare(a.at,b.at)||compare(a.item.recordId,b.item.recordId)||compare(a.tie,b.tie);}

export function summarizeSurroundings(records){
  const selected=new Map(),recordIds=new Set(),catalog=new Map(STREETVIEW_REVIEW_CRITERIA.map(c=>[c.id,c]));
  for(const record of Array.isArray(records)?records:[]){
    if(!record||typeof record.id!=='string'||!record.id.trim()||!validDay(record.reviewedOn)||!Number.isFinite(instant(record.at))||typeof record.responsible!=='string'||!record.responsible.trim()||!Array.isArray(record.observations))continue;
    for(const row of record.observations){
      if(!row||!catalog.has(row.criterionId)||!STREETVIEW_REVIEW_STATUSES.includes(row.status)||!STREETVIEW_REVIEW_BASES.includes(row.basis)||typeof row.note!=='string'||!row.note.trim())continue;
      if(row.status==='evidencia-referenciada'&&row.basis==='hipotese-analista')continue;
      const item={criterionId:row.criterionId,label:catalog.get(row.criterionId).label,status:row.status,basis:row.basis,note:row.note,nextAction:typeof row.nextAction==='string'&&row.nextAction.trim()?row.nextAction:null,
        documentIds:Array.isArray(row.documentIds)?[...new Set(row.documentIds.filter(id=>typeof id==='string'&&id))].sort():[],visitId:typeof row.visitId==='string'&&row.visitId?row.visitId:null,reviewedOn:record.reviewedOn,responsible:record.responsible,recordId:record.id};
      const candidate={item,at:instant(record.at),tie:JSON.stringify(item)},previous=selected.get(row.criterionId);
      if(!previous||precedence(candidate,previous)>0)selected.set(row.criterionId,candidate);
      recordIds.add(record.id);
    }
  }
  const items=STREETVIEW_REVIEW_CRITERIA.flatMap(c=>selected.has(c.id)?[selected.get(c.id).item]:[]);
  return {recordCount:recordIds.size,items,pendingCount:items.filter(i=>['a-verificar','indicio'].includes(i.status)).length,evidenceCount:items.filter(i=>i.status==='evidencia-referenciada').length};
}
