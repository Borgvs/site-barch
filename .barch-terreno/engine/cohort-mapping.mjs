/** Quantity, schedule and payment-plan mapping. Financial results remain in viab. */
export const COHORT_POLICY_VERSION = 'cohort-schedule-1';
export const COHORT_CONTROLS = Object.freeze([
  'sales_start_month', 'sales_duration_months', 'construction_duration_months',
  'down_payment_pct', 'installments_pct', 'repasse_pct', 'repasse_delay_months',
  'commission_pct', 'tax_provision_pct', 'contingency_pct',
  'own_capital_brl', 'scenario_capital_confirmed',
]);
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
function fail(code, message) { const error = new Error(message); error.code = code; throw error; }
function number(value, name, min, max, integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max
    || (integer && !Number.isSafeInteger(value))) fail('INVALID_COHORT_CONTROL', `${name} fora do intervalo permitido.`);
  return value;
}

/** Integrate equal-width source bins into new bins. Does not truncate/duplicate work. */
export function resamplePhysicalCurve(source, duration) {
  number(duration, 'construction_duration_months', 1, 1200, true);
  if (!Array.isArray(source) || !source.length || source.length > 1200
      || source.some(value => typeof value !== 'number' || !Number.isFinite(value) || value < 0)
      || Math.abs(source.reduce((sum, value) => sum + value, 0) - 1) > 1e-9)
    fail('INVALID_PHYSICAL_CURVE', 'A curva física de origem deve ser explícita, não negativa e somar 100%.');
  const result = Array(duration).fill(0), oldLength = source.length;
  for (let target = 0; target < duration; target++) {
    const start = target / duration, end = (target + 1) / duration;
    for (let original = 0; original < oldLength; original++) {
      const overlap = Math.max(0, Math.min(end, (original + 1) / oldLength) - Math.max(start, original / oldLength));
      result[target] += source[original] * overlap * oldLength;
    }
  }
  // Floating-point closure only; there is no change to the physical cost basis.
  result[result.length - 1] += 1 - result.reduce((sum, value) => sum + value, 0);
  return result;
}

export function mapCohortControls(input, bindings, changes) {
  const policy = bindings.cohortPolicy;
  const hasControls = COHORT_CONTROLS.some(key => own(changes, key));
  if (!policy) {
    if (hasControls) fail('MISSING_COHORT_POLICY', 'O cenário não possui política de coortes; selecione o ensaio de vendas por coorte.');
    return null;
  }
  if (policy.version !== COHORT_POLICY_VERSION) fail('COHORT_POLICY_VERSION', 'Versão de cronograma não suportada.');
  if (['duration_months', 'schedule_delay_months'].some(key => own(changes, key)))
    fail('AMBIGUOUS_SCHEDULE', 'O ensaio por coortes usa prazos de obra, vendas e repasse; não recebe o prazo agregado legado.');
  if (input.businessModel !== 'development_for_sale' || input.revenues.length !== 1)
    fail('COHORT_PRODUCT_SCOPE', 'Esta política exige uma incorporação com um único produto de venda declarado.');
  if (input.scenario && Object.keys(input.scenario).length)
    fail('COHORT_SCENARIO_SCOPE', 'Os deltas genéricos do motor exigem política própria; este ensaio aplica mudanças por controles explícitos.');
  const revenue = input.revenues.find(row => row.id === bindings.revenueId);
  const construction = input.uses.find(row => row.id === bindings.constructionUseId);
  const contingency = input.uses.find(row => row.id === policy.contingencyUseId);
  const external = input.uses.find(row => row.id === policy.externalUseId);
  const carry = input.uses.find(row => row.id === policy.carryUseId);
  if (!revenue || revenue.kind !== 'unit_sale' || revenue.salesDistribution !== 'linear' || !revenue.paymentPlan
      || !construction || construction.group !== 'hard_cost' || construction.distribution !== 'manual'
      || !contingency || contingency.basis !== 'pct_hard_cost'
      || !external || external.basis !== 'fixed'
      || !carry || carry.basis !== 'fixed' || carry.startMonth !== 1
      || revenue.commissionBasis !== 'gross_revenue'
      || !input.tax || input.tax.regime !== 'exploratory_provision' || input.tax.basis !== 'received')
    fail('MISSING_COHORT_BINDING', 'A política exige produto unitário, curva física, contingência, acabamentos e carregamento explícitos.');
  const plan = revenue.paymentPlan;
  if (plan.keysPct !== 0 || plan.installmentsEndBeforeDeliveryMonths !== 1
      || !Array.isArray(plan.repasseWave) || plan.repasseWave.length !== 1 || plan.repasseWave[0].weight !== 1)
    fail('UNSUPPORTED_COHORT_PLAN', 'Este ensaio usa chaves 0%, parcelas até um mês antes da entrega e uma onda explícita de repasse.');
  if (input.sources.length) fail('COHORT_FUNDING_SCOPE', 'Esta política de capital de ensaio exige snapshot sem fontes de funding; preserve fontes reais em versão própria.');
  const mapped = (key, current, min, max, integer = false) => number(own(changes, key) ? changes[key] : current, key, min, max, integer);
  const start = number(policy.constructionStartMonth, 'constructionStartMonth', 0, 120, true);
  const duration = mapped('construction_duration_months', construction.durationMonths, 12, 84, true);
  const delivery = start + duration; // First month after all declared construction months.
  revenue.salesStartMonth = mapped('sales_start_month', revenue.salesStartMonth, 0, 120, true);
  revenue.salesDurationMonths = mapped('sales_duration_months', revenue.salesDurationMonths, 1, 120, true);
  plan.downPaymentPct = mapped('down_payment_pct', plan.downPaymentPct, 0, 100);
  plan.installmentsPct = mapped('installments_pct', plan.installmentsPct, 0, 100);
  plan.repassePct = mapped('repasse_pct', plan.repassePct, 0, 100);
  if (Math.abs(plan.downPaymentPct + plan.installmentsPct + plan.keysPct + plan.repassePct - 100) > 1e-8)
    fail('PAYMENT_TOTAL', 'Entrada, parcelas e repasse precisam somar 100%; o saldo bancário não é inferido.');
  const repasseDelay = mapped('repasse_delay_months', plan.repasseWave[0].monthOffset, 0, 24, true);
  plan.repasseWave = [{monthOffset: repasseDelay, weight: 1}];
  plan.deliveryMonth = delivery;
  plan.installmentsCount = Math.max(0, delivery - 1 - revenue.salesStartMonth); // Compatibility; canonical cohorts anchor on delivery.
  revenue.indexSwitchMonth = delivery;
  revenue.commissionPct = mapped('commission_pct', revenue.commissionPct, 0, 20);
  input.tax.effectiveRatePct = mapped('tax_provision_pct', input.tax.effectiveRatePct, 0, 30);
  contingency.pct = mapped('contingency_pct', contingency.pct, 0, 40);
  construction.startMonth = start;
  construction.durationMonths = duration;
  construction.curve = resamplePhysicalCurve(policy.baseConstructionCurve, duration);
  contingency.startMonth = start;
  contingency.durationMonths = duration;
  contingency.distribution = 'manual';
  contingency.curve = [...construction.curve];
  const externalDuration = number(policy.externalDurationMonths, 'externalDurationMonths', 1, duration, true);
  external.startMonth = delivery - externalDuration;
  external.durationMonths = externalDuration;

  const salesEnd = revenue.salesStartMonth + revenue.salesDurationMonths - 1;
  const lastCashMonth = plan.repassePct > 0 ? Math.max(delivery, salesEnd) + repasseDelay
    : Math.max(salesEnd, plan.installmentsPct > 0 ? delivery - 1 : salesEnd);
  const baseCarryEnd = number(policy.baseCarryEndMonth, 'baseCarryEndMonth', 1, 120, true);
  const carryEnd = Math.max(baseCarryEnd, lastCashMonth, delivery - 1);
  const extraCarryMonths = Math.max(0, carryEnd - baseCarryEnd);
  carry.amountBrl = number(policy.baseCarryAmountBrl, 'baseCarryAmountBrl', 0, 1e12)
    + extraCarryMonths * number(policy.extraCarryBrlPerMonth, 'extraCarryBrlPerMonth', 0, 1e9);
  carry.durationMonths = carryEnd;
  input.horizonMonths = Math.max(carryEnd + 1, ...input.uses.map(row => row.startMonth + row.durationMonths));

  const ownCapital = mapped('own_capital_brl', 0, 0, 1e9);
  const confirmed = own(changes, 'scenario_capital_confirmed') ? changes.scenario_capital_confirmed : false;
  if (typeof confirmed !== 'boolean') fail('CAPITAL_DECLARATION', 'Confirmação de capital de ensaio deve ser verdadeira ou falsa.');
  if (ownCapital > 0 && !confirmed)
    fail('CAPITAL_DECLARATION', 'Para simular capital, confirme que o valor é uma hipótese de capacidade, sem compromisso financeiro comprovado.');
  if (ownCapital > 0) input.sources = [{id: 'scenario-equity', kind: 'equity_own',
    label: 'Capital de ensaio · hipótese sem comprovação', status: 'scenario_assumption',
    nominalBrl: ownCapital, committedBrl: 0, eligibleBrl: ownCapital, availableBrl: ownCapital,
    drawnBrl: 0, capitalizeInterest: false, startMonth: 0, durationMonths: input.horizonMonths,
    drawDistribution: 'on_demand', priority: 1}];
  return {
    version: policy.version,
    schedule: {construction_start_month: start, construction_duration_months: duration,
      construction_end_month: delivery - 1, delivery_month: delivery,
      sales_start_month: revenue.salesStartMonth, sales_duration_months: revenue.salesDurationMonths,
      sales_end_month: salesEnd, repasse_delay_months: repasseDelay, last_receipt_month: lastCashMonth,
      horizon_months: input.horizonMonths, extra_carry_months: extraCarryMonths,
      average_sales_units_month: revenue.units / revenue.salesDurationMonths,
      absorption_basis: 'Hipótese linear por coorte; não é VSO observada nem previsão garantida.'},
    payment: {down_payment_pct: plan.downPaymentPct, installments_pct: plan.installmentsPct,
      keys_pct: plan.keysPct, repasse_pct: plan.repassePct},
    capital: {kind: ownCapital > 0 ? 'hypothetical_equity' : 'none', declared_capacity_brl: ownCapital,
      confirmed_for_simulation: confirmed, committed_brl: 0, authority: 'working_assumption'},
    physical_curve: {start_month: start, weights: [...construction.curve], basis: 'Preservação integral da curva física do estudo de origem.'},
  };
}

/** Projection only: group exact canonical cohort events for chart consumption. */
export function projectCohortCharts(output) {
  const count = output.cashflow.length;
  const units = Array(count).fill(0), cumulative = [],
    components = Object.fromEntries(['entrada', 'parcelas', 'chaves', 'repasse', 'refund'].map(key => [key, Array(count).fill(0)]));
  for (const cohort of output.revenueCohorts) {
    if (cohort.projectedUnits != null) units[cohort.saleMonthIndex] += cohort.projectedUnits;
    for (const event of cohort.cashEvents) components[event.component][event.monthIndex] += event.amountBrl;
  }
  let total = 0;
  for (const value of units) { total += value; cumulative.push(total); }
  return {sales_units: output.revenueCohorts.length ? units : null,
    cumulative_sales_units: output.revenueCohorts.length ? cumulative : null,
    revenue_components_brl: output.revenueCohorts.length ? components : null,
    cohort_basis: 'Eventos e unidades esperadas do projetor canônico; unidades fracionárias são expectativa mensal.'};
}

/** Controls for imported scenarios after successful mapping; no inferred defaults. */
export function cohortControlsFromResult(request, result) {
  if (request.bindings?.cohortPolicy?.version !== COHORT_POLICY_VERSION || !result.schedule || !result.input_used) return {};
  const revenue = result.input_used.revenues.find(row => row.id === request.bindings.revenueId);
  const contingency = result.input_used.uses.find(row => row.id === request.bindings.cohortPolicy.contingencyUseId);
  return {sales_start_month:result.schedule.sales_start_month,sales_duration_months:result.schedule.sales_duration_months,
    construction_duration_months:result.schedule.construction_duration_months,
    down_payment_pct:result.payment_plan.down_payment_pct,installments_pct:result.payment_plan.installments_pct,
    repasse_pct:result.payment_plan.repasse_pct,repasse_delay_months:result.schedule.repasse_delay_months,
    commission_pct:revenue.commissionPct,tax_provision_pct:result.input_used.tax.effectiveRatePct,
    contingency_pct:contingency.pct,own_capital_brl:result.funding_scenario.declared_capacity_brl,
    scenario_capital_confirmed:result.funding_scenario.confirmed_for_simulation};
}
