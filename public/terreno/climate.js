/** UI reads audited climate only. No network requests, geocoding or paid queries on page load. */
export const CLIMATE_LABELS=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const finite=v=>typeof v==='number'&&Number.isFinite(v)?v:null;
function values(context,id){const i=context?.indicators?.find(x=>x.id===id);return CLIMATE_LABELS.map((_,n)=>finite(i?.monthly?.find(m=>m.month===n+1)?.value));}
export function climateChartOptions(context){
  return {
    seasonal:{chart:{type:'line',height:290},series:[{name:'Precipitação média diária',type:'column',data:values(context,'precipitation')},{name:'Temperatura média',type:'line',data:values(context,'temperature')}],
      colors:['#A2B3BA','#9C745B'],stroke:{width:[0,3],curve:'smooth'},plotOptions:{bar:{columnWidth:'46%',borderRadius:3}},xaxis:{categories:CLIMATE_LABELS},
      yaxis:[{seriesName:'Precipitação média diária',min:0,title:{text:'Chuva · mm/dia'},labels:{formatter:v=>Number(v).toLocaleString('pt-BR',{maximumFractionDigits:1})}},{seriesName:'Temperatura média',opposite:true,title:{text:'Temperatura · °C'},labels:{formatter:v=>Number(v).toLocaleString('pt-BR',{maximumFractionDigits:1})}}],
      tooltip:{shared:true,intersect:false,y:{formatter:(v,{seriesIndex})=>v==null?'Não disponível':`${Number(v).toLocaleString('pt-BR',{maximumFractionDigits:2})} ${seriesIndex===0?'mm/dia':'°C'}`}}},
    solar:{chart:{type:'area',height:290},series:[{name:'Irradiação horizontal',data:values(context,'solar')}],colors:['#B8AB82'],stroke:{width:2.5,curve:'smooth'},fill:{type:'solid',opacity:.17},
      xaxis:{categories:CLIMATE_LABELS},yaxis:{min:0,title:{text:'kWh/m²/dia'},labels:{formatter:v=>Number(v).toLocaleString('pt-BR',{maximumFractionDigits:1})}},
      tooltip:{y:{formatter:v=>v==null?'Não disponível':`${Number(v).toLocaleString('pt-BR',{maximumFractionDigits:2})} kWh/m²/dia`}}},
  };
}
export function climatePanel(study,{esc,num}){
  const c=study.climate;
  if(!c||!c.indicators?.length)return `<section class="card card-body section-gap"><div class="eyebrow">Contexto ambiental</div><h3>Clima e exposição</h3><p class="muted">A climatologia regional será consultada a partir do ponto geográfico do terreno. A ausência de série não permite concluir sobre chuva, conforto ou insolação.</p></section>`;
  const indicator=id=>c.indicators.find(i=>i.id===id),rain=indicator('precipitation'),temperature=indicator('temperature'),solar=indicator('solar');
  const period=`${c.period.start}–${c.period.end}`;
  const source=c.sources?.find(s=>s.id==='nasa-power-climatology');
  const safeUrl=source?.url?.startsWith('https://power.larc.nasa.gov/')?source.url:'https://power.larc.nasa.gov/';
  const cells=[temperature,rain,solar].filter(Boolean).map(i=>`<div><span>${esc(i.label)}</span><strong>${num(i.annual,i.id==='temperature'?1:2)} <small>${esc(i.unit)}</small></strong><small>Média do período ${esc(period)}</small></div>`).join('');
  const monthly=CLIMATE_LABELS.map((m,n)=>`<tr><td>${m}</td>${[temperature,rain,solar].map(i=>`<td>${num(i?.monthly?.find(x=>x.month===n+1)?.value,2)}</td>`).join('')}</tr>`).join('');
  const rural=['rural','transicao'].includes(study.landContext);
  return `<section class="card context-card section-gap climate-panel"><div class="card-head"><div><div class="eyebrow">Clima e exposição · série histórica</div><h3>Sazonalidade para orientar o empreendimento</h3></div><span class="badge">${esc(period)} · ${num(c.period.years)} anos</span></div><div class="card-body"><div class="context-indicators municipal-indicators">${cells}</div><div class="context-charts"><div><h4>Chuva e temperatura</h4><div id="climate-seasonal" class="chart" role="img" aria-label="Sazonalidade mensal de precipitação média diária e temperatura"></div></div><div><h4>Recurso solar regional</h4><div id="climate-solar" class="chart" role="img" aria-label="Média mensal de irradiação solar diária em superfície horizontal"></div></div></div><div class="context-local-head"><p><strong>Aplicação no estudo.</strong> ${rural?'Orienta a sazonalidade de acesso e operação, a investigação hídrica e o potencial solar. Aptidão agrícola exige cruzamento com ZARC, solo, água e atividade pretendida.':'Orienta conforto passivo, sombreamento, cobertura e sazonalidade da obra. A insolação do projeto precisa considerar orientação e volumes do entorno.'}</p></div><p class="small muted">Grade regional NASA POWER. A chuva é expressa como média diária em cada mês; não corresponde a chuva de projeto ou risco de inundação. A irradiação não incorpora sombras nem estima a geração do empreendimento.</p><details class="section-gap"><summary>Dados mensais, escala e metodologia</summary><div class="table-wrap"><table><thead><tr><th>Mês</th><th>Temperatura · °C</th><th>Chuva · mm/dia</th><th>Solar · kWh/m²/dia</th></tr></thead><tbody>${monthly}</tbody></table></div><p class="small">Meteorologia: MERRA-2, grade 0,5° × 0,625°. Fontes solares: ${esc(c.model?.sources?.join(', ')||'NASA POWER')}. Médias históricas de ${esc(period)}, sem medição no lote ou projeção climática futura.</p>${c.limitations.map(x=>`<p class="small muted">${esc(x)}</p>`).join('')}<a href="${esc(safeUrl)}" target="_blank" rel="noopener">Consultar resposta da NASA POWER</a><p class="small muted">Captura: ${esc(source?.retrievedAt?.slice(0,10)||'—')} · Evidência: ${esc(source?.sha256?.slice(0,16)||'—')}</p></details></div></section>`;
}
export function bindClimate(study,{chart}){
  if(!study.climate?.indicators?.length)return;
  const options=climateChartOptions(study.climate);chart('climate-seasonal',options.seasonal);chart('climate-solar',options.solar);
}
