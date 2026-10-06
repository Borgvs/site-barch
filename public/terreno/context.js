// Frequencies describe complete selected census sectors; no population interpolation.
export function densityHistogram(sectors,{breaks}={}){
 if(breaks!==undefined&&(!Array.isArray(breaks)||!breaks.length||breaks.length>10||!breaks.every((n,i)=>Number.isFinite(n)&&n>0&&(i===0||n>breaks[i-1]))))throw new Error('Classes de densidade inválidas.');
 const bounds=[...(breaks||[1000,5000,10000,25000]),Infinity],fmt=n=>n.toLocaleString('pt-BR');
 const labels=breaks?[`< ${fmt(breaks[0])}`,...breaks.slice(1).map((b,i)=>`${fmt(breaks[i])}–${fmt(b)}`),`≥ ${fmt(breaks.at(-1))}`,'Sem dado']:['< 1 mil','1–5 mil','5–10 mil','10–25 mil','≥ 25 mil','Sem dado'];
 const bins=labels.map(label=>({label,count:0}));
 for(const s of sectors){const value=s.densityHabKm2;const i=typeof value==='number'&&Number.isFinite(value)&&value>=0?bounds.findIndex(b=>value<b):bins.length-1;bins[i].count++;}
 return bins;
}
