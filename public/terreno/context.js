// Frequencies describe complete selected census sectors; no population interpolation.
export function densityHistogram(sectors){
 const bounds=[1000,5000,10000,25000,Infinity];
 const bins=['< 1 mil','1–5 mil','5–10 mil','10–25 mil','≥ 25 mil','Sem dado'].map(label=>({label,count:0}));
 for(const s of sectors){const value=s.densityHabKm2;const i=typeof value==='number'&&Number.isFinite(value)&&value>=0?bounds.findIndex(b=>value<b):5;bins[i].count++;}
 return bins;
}
