/** Same sequence for every municipality and product; evidence retains its own scope. */
export const analysisSteps = [
 ['Identidade e escopo','Vincular registro, cadastro, localização, jurisdição, finalidade e data de referência.'],
 ['Curadoria das bases','Consultar primeiro a base Barch; completar lacunas na fonte competente, preservando versão, cobertura e integridade.'],
 ['Território e condicionantes','Confrontar perímetro, legislação, relevo, ambiente, infraestrutura e acessos sem somar restrições sobrepostas.'],
 ['Programa e mercado','Qualificar o produto principal, terrenos substitutos e comparáveis; separar preço pedido, transação e hipótese.'],
 ['Viabilidade cruzada','Conciliar áreas, escopo de custos, preço, prazo, absorção e capital na mesma versão do cenário.'],
 ['Revisão adversarial','Testar conflitos de fonte, unidades, atualidade, condições de perda e dependências ainda não verificadas.'],
 ['Decisão e atualização','Registrar condições para avançar, reformular ou interromper; mudanças nas bases exigem nova conferência.'],
];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={pass:'Conferido',condition:'Condição preservada',outdated:'Versões a reconciliar',missing:'Base ausente',error:'Divergência'};
export function renderAnalysisSteps(){return analysisSteps.map(([title,text])=>`<li><div><h3>${esc(title)}</h3><p>${esc(text)}</p></div></li>`).join('');}
export function renderBasisCoherence(basis){
 if(!basis)return '<section class="card card-body section-gap"><h2 class="section-title">Coerência das bases</h2><p>Conferência de versões ainda não registrada.</p></section>';
 return `<section class="card card-body section-gap"><div class="eyebrow">Conferência comum aos estudos</div><h2 class="section-title">Coerência das bases</h2><p>${basis.synchronized?'As bases conferidas representam a mesma versão de análise.':'Existem bases que precisam ser reconciliadas antes de uma validação integrada.'} Esta conferência não aprova o investimento.</p><div class="verification-list">${(basis.checks||[]).map(c=>`<article class="verification-item"><div><h3>${esc(c.title||c.axis||c.id)}</h3><span class="badge ${['error','outdated','missing'].includes(c.status)?'red':'gray'}">${esc(labels[c.status]||c.status)}</span></div><p>${esc(c.impact)}</p></article>`).join('')}</div></section>`;
}
export function renderVerificationFreshness(verification){
 if(!verification)return '';
 const state=verification.freshness?.status;
 if(state==='current')return '<p class="tiny muted">Recibo vinculado à versão atual dos insumos conferidos. A vigência de cada fonte conserva seu próprio prazo.</p>';
 if(state==='stale')return `<div class="note neutral">Verificação histórica: ${esc(verification.freshness?.reason||'os insumos mudaram após esta execução.')} Atualizar as consultas antes de tratar os resultados como atuais.</div>`;
 if(state==='unverifiable')return '<div class="note neutral">Não foi possível conferir todas as bases desta versão. O recibo anterior permanece como histórico; recuperar as evidências antes de validar a atualização.</div>';
 return '<div class="note neutral">Verificação histórica sem vínculo completo com a versão atual das bases. O recibo conserva a data e o alcance da execução original.</div>';
}
