/** Input mapping and result projection only. Every financial formula is canonical. */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COHORT_CONTROLS, mapCohortControls, projectCohortCharts } from './cohort-mapping.mjs';
import { qualifyProduct } from './product-qualification.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(here, 'engine-manifest.json'), 'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
for (const module of manifest.modules) {
  const artifact = resolve(here, module.artifact);
  if (!artifact.startsWith(here + sep) || digest(readFileSync(artifact)) !== module.artifact_sha256) {
    throw new Error('ENGINE_ARTIFACT_INTEGRITY: canonical build changed; rebuild and review its receipt.');
  }
}
const require = createRequire(import.meta.url);
const { calcular } = require('./dist/canonical/viab/motor.js');
const { hashEstavel } = require('./dist/canonical/viab/financeiro.js');
const canonicalFinance = require('./dist/canonical/viab/financeiro.js');
const { ENGINE_VERSION } = require('./dist/canonical/viab/tipos.js');
const { aplicarAlavanca, resolverDecisionLab, DECISION_LAB_VERSION } = require('./dist/canonical/viab/decisao.js');
const { calculateLandMarketValuation } = require('./dist/canonical/wizard-2-0/terrain-feasibility/market-valuation.js');
const { slugFinal } = require('./dist/canonical/obra/slug.js');
export { ENGINE_VERSION, DECISION_LAB_VERSION };
export const getEngineManifest = () => structuredClone(manifest);
export const normalizeStudySlug = value => slugFinal(value);

const metricNames = ['vgv_brl', 'cost_brl', 'profit_brl', 'npv_brl', 'irr_annual_pct', 'land_residual_brl', 'peak_cash_brl',
  'funding_gap_brl', 'revenue_received_brl', 'mirr_annual_pct', 'roi_pct', 'roi_on_exposure_pct', 'margin_pct', 'payback_month'];
const groupLabels = {land:'Aquisição do terreno',hard_cost:'Edificação e serviços do terreno',soft_cost:'Projetos, licenças e despesas',
  sales:'Comercialização',finance:'Custo financeiro',tax:'Provisão tributária',contingency:'Contingência',operation_exit:'Operação e saída'};
const finite = x => typeof x === 'number' && Number.isFinite(x);
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const fail = (code, message) => { const error = new Error(message); error.code = code; throw error; };
function number(value, name, min = 0, max = 1e12, integer = false) {
  if (!finite(value) || value < min || value > max || (integer && !Number.isSafeInteger(value)))
    fail('INVALID_INPUT', `${name} fora do intervalo ou ausente.`);
  return value;
}
function object(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('INVALID_INPUT', `${name} deve ser objeto.`);
}
function serializable(value) {
  JSON.stringify(value, (key, item) => {
    if (typeof item === 'number' && !Number.isFinite(item)) fail('NON_FINITE', `Número não finito: ${key}.`);
    return item;
  });
}
function validateInput(input) {
  object(input, 'input'); serializable(input);
  for (const key of ['engineVersion','businessModel','baseDate','horizonMonths','discountRateAa',
    'discountRateDeclared','discountRateIsReal','seed','uses','sources','revenues','partners','tax','indices','product']) {
    if (!own(input, key)) fail('MISSING_PREMISE', `Entrada canônica exige ${key}; nenhuma premissa foi inferida.`);
  }
  if (input.engineVersion !== ENGINE_VERSION) fail('ENGINE_VERSION', `Entrada exige ${input.engineVersion}; build oferece ${ENGINE_VERSION}.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.baseDate) || Number.isNaN(Date.parse(input.baseDate))) fail('INVALID_INPUT', 'Data-base inválida.');
  number(input.horizonMonths, 'horizonMonths', 1, 1200, true);
  if (typeof input.discountRateDeclared !== 'boolean' || typeof input.discountRateIsReal !== 'boolean') fail('INVALID_INPUT', 'Declaração/natureza da TMA deve ser explícita.');
  number(input.discountRateAa, 'discountRateAa', 0, 1000);
  for (const key of ['uses','sources','revenues','partners']) {
    if (!Array.isArray(input[key]) || input[key].length > 500) fail('INVALID_INPUT', `${key} deve ser lista limitada.`);
    const seen = new Set();
    for (const row of input[key]) {
      object(row, key);
      if (typeof row.id !== 'string' || !row.id || seen.has(row.id)) fail('INVALID_INPUT', `IDs inválidos/duplicados em ${key}.`);
      seen.add(row.id);
    }
  }
  if (!input.revenues.length || !input.uses.length) fail('MISSING_PREMISE', 'Receitas e usos explícitos são obrigatórios.');
  object(input.product, 'product'); object(input.indices, 'indices');
  for (const line of input.uses) {
    for (const k of ['group','category','label','basis','distribution','startMonth','durationMonths'])
      if (!own(line, k)) fail('MISSING_PREMISE', `Uso ${line.id} exige ${k}.`);
    number(line.startMonth, 'startMonth', 0, 1199, true); number(line.durationMonths, 'durationMonths', 1, 1200, true);
    if (line.basis === 'fixed') number(line.amountBrl, `${line.id}.amountBrl`);
    if (['qty_unit','per_unit','per_area','cub_x_area'].includes(line.basis)) {
      number(line.qty, `${line.id}.qty`); number(line.unitPriceBrl, `${line.id}.unitPriceBrl`);
    }
    if (line.basis.startsWith('pct_')) number(line.pct, `${line.id}.pct`,0,1000);
  }
  for (const line of input.revenues) {
    for (const k of ['kind','label','salesStartMonth','salesDurationMonths','salesDistribution','indexLagMonths'])
      if (!own(line, k)) fail('MISSING_PREMISE', `Receita ${line.id} exige ${k}.`);
    number(line.salesStartMonth, 'salesStartMonth', 0, 1199, true); number(line.salesDurationMonths, 'salesDurationMonths', 1, 1200, true);
  }
}

/**
 * JSON request: {input, bindings, changes, assumptions, residualRequest?}.
 * Omitted changes retain the supplied snapshot. A caller must supply each base
 * premise; slider values do not certify market evidence, zoning or governance.
 */
export function evaluateScenario(request) {
  const warnings = [];
  try {
    object(request, 'request'); validateInput(request.input);
    object(request.bindings, 'bindings'); object(request.changes, 'changes');
    if (!Array.isArray(request.assumptions) || request.assumptions.some(a => typeof a !== 'string') || !request.assumptions.length)
      fail('MISSING_PREMISE', 'Declare assumptions e limites do cenário.');
    let input = structuredClone(request.input);
    const changes = request.changes;
    const allowed = new Set(['units','unit_area_m2','built_area_m2','price_m2_brl','construction_cost_m2_brl',
      'acquisition_brl','tma_annual_pct','duration_months','schedule_delay_months',...COHORT_CONTROLS]);
    for (const key of Object.keys(changes)) if (!allowed.has(key)) fail('UNKNOWN_CHANGE', `Controle desconhecido: ${key}.`);
    const needsRevenue = ['units','unit_area_m2','price_m2_brl'].some(k => own(changes,k));
    const revenue = input.revenues.find(r => r.id === request.bindings.revenueId);
    if (needsRevenue && !revenue) fail('MISSING_BINDING', 'Selecione revenueId para alterar o produto.');
    if (needsRevenue && (revenue.grossAmountBrl != null || revenue.unitPriceBrl != null))
      fail('AMBIGUOUS_PRICE_BASIS', 'Receita tem total/ticket prioritário; escolha explicitamente a base antes de modular m².');
    if (own(changes,'units')) revenue.units = number(changes.units,'units',1,100000,true);
    if (own(changes,'unit_area_m2')) revenue.unitAreaM2 = number(changes.unit_area_m2,'unit_area_m2',1,100000);
    if (own(changes,'price_m2_brl')) revenue.pricePerM2Brl = number(changes.price_m2_brl,'price_m2_brl',0.01,1e8);
    if (own(changes,'units') || own(changes,'unit_area_m2')) {
      if (input.revenues.length !== 1) fail('MULTIPRODUCT_AREA', 'Área global exige composição completa; não escalar mix por inferência.');
      number(revenue.units,'revenue.units',1,100000,true); number(revenue.unitAreaM2,'unitAreaM2',1,100000);
      input.product.units = revenue.units;
      input.product.privateAreaM2 = revenue.units * revenue.unitAreaM2; // Quantity mapping, not a valuation formula.
      warnings.push('Área privativa = unidades × área unitária; área construída permanece um controle independente.');
    }
    const construction = input.uses.find(u => u.id === request.bindings.constructionUseId);
    if (own(changes,'built_area_m2') || own(changes,'construction_cost_m2_brl')) {
      if (!construction || construction.group !== 'hard_cost' || !['qty_unit','per_area','cub_x_area'].includes(construction.basis))
        fail('MISSING_BINDING', 'constructionUseId deve identificar custo explícito por área construída.');
      if (own(changes,'built_area_m2')) {
        const area = number(changes.built_area_m2,'built_area_m2',1,1e7);
        input.product.builtAreaM2 = area; construction.qty = area;
      }
      if (own(changes,'construction_cost_m2_brl')) construction.unitPriceBrl = number(changes.construction_cost_m2_brl,'construction_cost_m2_brl',0.01,1e7);
    }
    if (own(changes,'acquisition_brl')) input = aplicarAlavanca(input, {key:'land_acquisition_brl'}, number(changes.acquisition_brl,'acquisition_brl'));
    if (own(changes,'tma_annual_pct')) input.discountRateAa = number(changes.tma_annual_pct,'tma_annual_pct',0.001,1000);
    if (own(changes,'duration_months') && own(changes,'schedule_delay_months')) fail('AMBIGUOUS_SCHEDULE','Declare um único modo de prazo.');
    if (own(changes,'schedule_delay_months')) {
      input = aplicarAlavanca(input, {key:'schedule_delay_months'}, number(changes.schedule_delay_months,'schedule_delay_months',0,120,true));
      warnings.push('Atraso segue a semântica canônica: não reescreve curvas comerciais, funding ou carregamento por inferência.');
    }
    if (own(changes,'duration_months')) {
      const policy = request.bindings.duration;
      if (!policy || policy.mode !== 'talma_tail') fail('MISSING_SCHEDULE_POLICY','Duração absoluta exige política explícita de remapeamento dos marcos.');
      const duration = number(changes.duration_months,'duration_months',policy.baseDurationMonths,policy.baseDurationMonths+120,true);
      const delay = duration - policy.baseDurationMonths;
      const target = input.revenues.find(r => r.id === request.bindings.revenueId);
      const carry = input.uses.find(u => u.id === policy.carryUseId);
      if (!target || target.kind !== 'other' || target.salesDistribution !== 'manual' || !Array.isArray(target.salesCurve)
          || !carry || carry.basis !== 'fixed') fail('MISSING_SCHEDULE_POLICY','Política Talma exige receita agregada manual e carregamento fixo.');
      number(policy.tailFromMonth,'tailFromMonth',0,1199,true);
      number(policy.carryIncrementBrlPerMonth,'carryIncrementBrlPerMonth');
      const cut = policy.tailFromMonth - target.salesStartMonth;
      if (cut < 0 || cut > target.salesCurve.length) fail('INVALID_SCHEDULE_POLICY','Marco terminal fora da curva declarada.');
      target.salesCurve.splice(cut,0,...Array(delay).fill(0));
      target.salesDurationMonths += delay;
      carry.amountBrl += delay * policy.carryIncrementBrlPerMonth;
      carry.durationMonths += delay;
      input.horizonMonths += delay;
      warnings.push('Prazo Talma: desloca apenas recebimentos terminais e soma carregamento explícito; curva física da obra preservada como no modelo de origem.');
    }
    const cohort = mapCohortControls(input, request.bindings, changes);
    if (cohort) {
      warnings.push('Vendas por coortes: absorção, sinal, parcelas e repasse são hipóteses explícitas; a velocidade não foi calibrada como previsão de mercado.');
      warnings.push('Entrega acompanha a duração da obra; preços e custos mantêm as projeções monetárias declaradas, sem aumento automático de preço real por alongamento.');
      if (cohort.capital.declared_capacity_brl > 0)
        warnings.push('Capital de ensaio é capacidade hipotética confirmada para simulação; não comprova recursos disponíveis, compromisso de aporte ou financiamento aprovado.');
    }
    validateInput(input);
    if (input.product.privateAreaM2 > input.product.builtAreaM2)
      warnings.push('Área privativa maior que construída: composição física inconsistente; resultado financeiro não valida esse programa.');
    const output = calcular(input, {includeRevenueCohorts:Boolean(cohort)});
    const qualification = qualifyProduct(input,request.bindings);
    const indicator = code => output.indicators.find(i => i.code === code)?.value ?? null;
    let residual = null;
    if (request.residualRequest != null) {
      if (request.residualRequest.lever?.key !== 'land_acquisition_brl'
          || request.residualRequest.objective?.key !== 'npv_project_brl'
          || request.residualRequest.objective?.comparator !== 'gte'
          || request.residualRequest.objective?.target !== 0)
        fail('RESIDUAL_OBJECTIVE','Residual exposto exige aquisição máxima com VPL do projeto ≥ 0; outras buscas pertencem ao Decision Lab.');
      residual = qualification?.eligible_for_residual === false
        ? {schemaVersion:1,status:'invalid',resultValue:null,converged:false,
          diagnostics:qualification.diagnostics,reason:'PRODUCT_OUTSIDE_STUDY_REFERENCE'}
        : resolverDecisionLab(input, request.residualRequest);
    }
    const blockers = [...output.diagnostics,...(qualification?.diagnostics??[])].filter(d => d.severity === 'blocker');
    // Canonical legacy copy says 'observed trend' for every projected index. Only
    // relabel the explicitly pinned hypothetical indices; keep originals for audit.
    const presentedDiagnostics = output.diagnostics.map(d => {
      if (d.code === 'INDICE_TODO_PROJETADO'
        && request.bindings.cohortPolicy?.indexProjectionBases?.[d.context?.indexCode] === 'working_assumption')
        return {...d,message:`A atualização de ${new Intl.NumberFormat('pt-BR').format(d.context.projectionAa)}% a.a. é hipótese declarada para todo o horizonte; não é uma série realizada nem tendência verificada.`,
          context:{...d.context,sourceBasis:'working_assumption',presentationClarified:true}};
      if (d.code === 'APORTE_PARCIAL' && d.context?.sourceId === 'scenario-equity' && cohort?.capital.kind === 'hypothetical_equity') {
        const brl = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
        return {...d,message:`O ensaio utiliza ${brl(d.context.usado)} da capacidade hipotética de ${brl(cohort.capital.declared_capacity_brl)}. Nenhum compromisso de aporte foi comprovado.`,
          context:{...d.context,sourceBasis:'working_assumption',presentationClarified:true}};
      }
      return d;
    });
    return {schema_version:1, status:blockers.length ? 'computed_with_blockers':'computed_conditional',
      authority:'working_assumption', investor_ready:false,
      engine:{version:ENGINE_VERSION,decision_lab_version:DECISION_LAB_VERSION,manifest_sha256:manifest.manifest_sha256,input_hash:output.inputHash,
        request_hash:hashEstavel(request)},
      metrics:{vgv_brl:output.totals.revenueGrossBrl,cost_brl:output.totals.usesBrl,profit_brl:output.totals.profitBrl,
        npv_brl:indicator('npv_project'),irr_annual_pct:indicator('irr_project'),land_residual_brl:residual?.resultValue ?? null,
        peak_cash_brl:output.totals.peakExposureBrl,funding_gap_brl:output.totals.fundingGapBrl,
        revenue_received_brl:output.totals.revenueReceivedBrl,mirr_annual_pct:indicator('mirr_project'),
        roi_pct:indicator('profit_on_cost'),roi_on_exposure_pct:indicator('roi_on_exposure'),
        margin_pct:indicator('margin_on_revenue'),payback_month:indicator('payback_month')},
      metric_basis:{money:'BRL nominal in modeled flow',irr:'annual percentage points',npv:'project, canonical nominal-rate handling',
        residual:'candidate acquisition within explicit search bounds; null on blocker; never a governed appraisal',
        roi:'canonical profit_on_cost, total period, not annualized and not investor equity return',
        margin:'canonical margin_on_revenue, profit divided by revenue received',
        payback:'canonical payback_month, project flow, month index from data-base'},
      assumptions:[...request.assumptions],warnings,diagnostics:[...presentedDiagnostics,...(qualification?.diagnostics??[])],canonical_diagnostics:output.diagnostics,residual,
      qualification,
      model:{version:cohort?.version ?? 'legacy-aggregate-1',cohorts:Boolean(cohort)},
      schedule:cohort?.schedule ?? null,payment_plan:cohort?.payment ?? null,funding_scenario:cohort?.capital ?? null,
      physical_curve:cohort?.physical_curve ?? null,
      economic_breakdown:Object.entries(output.totals.usesByGroup).map(([group,amount_brl])=>({
        group,label:groupLabels[group] ?? group,amount_brl,basis:'canonical.totals.usesByGroup'})),
      revenue_cohorts:output.revenueCohorts,
      input_used:input, cashflow:output.cashflow,totals:output.totals,indicators:output.indicators,
      chart:{months:output.cashflow.map(r=>r.competencyMonth),month_indices:output.cashflow.map(r=>r.monthIndex),
        revenue_brl:output.cashflow.map(r=>r.revenueReceivedBrl),contracted_brl:output.cashflow.map(r=>r.revenueBrl),
        cost_brl:output.cashflow.map(r=>r.usesBrl),
        cash_balance_brl:output.cashflow.map(r=>r.closingBalanceBrl),
        funding_gap_brl:output.cashflow.map(r=>r.fundingGapBrl),equity_in_brl:output.cashflow.map(r=>r.equityInBrl),
        ...projectCohortCharts(output),
        cash_balance_basis:'canonical closing balance, including declared funding; not project NPV'}};
  } catch (error) {
    return {schema_version:1,status:'invalid',authority:'missing',investor_ready:false,
      metrics:Object.fromEntries(metricNames.map(k=>[k,null])),
      diagnostics:[{severity:'blocker',code:error.code ?? 'ENGINE_INPUT_ERROR',message:error.message}],warnings};
  }
}

/** Full canonical DTO only. No synthetic publication or independence receipts. */
export function evaluateComparableMarket(input) {
  try {
    serializable(input);
    const result = calculateLandMarketValuation(input);
    return {schema_version:1,authority:'working_assumption',investor_ready:false,result,
      note:'Resultado não autentica recibos do servidor nem homologa uma avaliação; sem atestos existentes, a função canônica bloqueia.'};
  } catch (error) {
    return {schema_version:1,authority:'missing',investor_ready:false,result:null,
      error:{code:'MARKET_INPUT_INVALID',message:error.message}};
  }
}

/** Monthly ledger only: reuse the pinned financial primitives, never the legacy
 * equity aggregation. Caller owns the explicit unlevered/equity cashflow. */
export function evaluateMonthlyLedger({cashflow,discountRateAnnualPct}) {
  if(!Array.isArray(cashflow)||cashflow.length<2||cashflow.length>241||!cashflow.every(finite))
    fail('INVALID_LEDGER','Fluxo mensal finito de 2–241 posições obrigatório.');
  number(discountRateAnnualPct,'discountRateAnnualPct',0,1000);
  const irr=canonicalFinance.tir(cashflow);
  return {npvBrl:canonicalFinance.vpl(cashflow,discountRateAnnualPct),irrAnnualPct:irr.aa,
    irrReason:irr.motivo??null,paybackMonth:canonicalFinance.payback(cashflow),
    discountMonthly:canonicalFinance.taxaMensal(discountRateAnnualPct),
    engineVersion:ENGINE_VERSION,primitiveArtifactSha256:manifest.modules.find(m=>m.artifact==='dist/canonical/viab/financeiro.js')?.artifact_sha256};
}
