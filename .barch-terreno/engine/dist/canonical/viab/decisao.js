"use strict";
/**
 * Decision Lab da Viabilidade.
 *
 * Não existe uma segunda planilha aqui: cada ponto da busca chama `calcular`, o
 * motor oficial. A função é pura, não lê banco, não olha relógio e nunca altera a
 * entrada recebida. Uma solução é somente uma alternativa candidata; promovê-la a
 * premissa ou cenário continua sendo um ato humano em outra versão.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DECISION_LAB_MAX_ITERATIONS = exports.DECISION_LAB_SCHEMA_VERSION = exports.DECISION_LAB_VERSION = void 0;
exports.resolverDecisionLab = resolverDecisionLab;
exports.aplicarAlavanca = aplicarAlavanca;
exports.metricsFromOutput = metricsFromOutput;
exports.classificarPareto = classificarPareto;
exports.normalizarDecisionLabState = normalizarDecisionLabState;
exports.decisionLabUnavailable = decisionLabUnavailable;
exports.normalizarDecisionLabRequest = normalizarDecisionLabRequest;
const motor_1 = require("./motor");
exports.DECISION_LAB_VERSION = "viab-decision-lab-1.0.0";
exports.DECISION_LAB_SCHEMA_VERSION = 1;
exports.DECISION_LAB_MAX_ITERATIONS = 80;
const LEVER_BOUNDARY = {
    land_acquisition_brl: "maximum",
    sale_price_delta_pct: "minimum",
    sales_velocity_pct_month: "minimum",
    equity_available_brl: "minimum",
    hard_cost_delta_pct: "maximum",
    schedule_delay_months: "maximum",
    cost_index_aa: "maximum",
    funding_available_brl: "minimum",
    counterparty_equity_brl: "minimum",
};
const DISCRETE_LEVERS = new Set(["schedule_delay_months"]);
/** Resolve o limite solicitado por bisseção controlada sobre o motor oficial. */
function resolverDecisionLab(input, rawRequest) {
    const request = normalizarDecisionLabRequest(rawRequest);
    const boundary = LEVER_BOUNDARY[request.lever.key];
    const diagnostics = [];
    const trace = [];
    const baseOutput = (0, motor_1.calcular)(input, { includeRevenueCohorts: false });
    const baseBlockers = blockerCodes(baseOutput);
    if (baseBlockers.length) {
        return invalidResult(input, request, boundary, trace, [{
                severity: "blocker",
                code: "BASE_OFICIAL_BLOQUEADA",
                message: `O cenário vigente possui blockers do motor (${baseBlockers.join(", ")}); o solver não procura uma solução sobre uma base inválida.`,
            }], baseOutput);
    }
    const evaluate = (value) => {
        const leverValue = normalizarLeverValue(request.lever.key, value);
        let output;
        try {
            const candidateInput = aplicarAlavanca(input, request.lever, leverValue);
            output = (0, motor_1.calcular)(candidateInput, { includeRevenueCohorts: false });
        }
        catch (error) {
            const evaluation = {
                leverValue,
                objectiveValue: null,
                satisfied: false,
                blockers: [mensagem(error)],
            };
            trace.push(evaluation);
            return evaluation;
        }
        const blockers = blockerCodes(output);
        const objectiveValue = objectiveFromOutput(output, request.objective.key);
        const evaluation = {
            leverValue,
            objectiveValue,
            satisfied: blockers.length === 0
                && objectiveValue != null
                && satisfaz(objectiveValue, request.objective),
            blockers: objectiveValue == null
                ? [...blockers, "INDICADOR_OBJETIVO_AUSENTE"]
                : blockers,
        };
        trace.push(evaluation);
        return evaluation;
    };
    // Cinco pontos verificam a hipótese de monotonicidade antes da bisseção. Goal seek
    // sem esse teste pode devolver um limite arbitrário em funções com mais de uma raiz.
    const span = request.bounds.max - request.bounds.min;
    const probes = [0, 0.25, 0.5, 0.75, 1]
        .map((fraction) => normalizarLeverValue(request.lever.key, request.bounds.min + span * fraction))
        .filter((value, index, values) => index === 0 || value !== values[index - 1]);
    const probeResults = probes.map(evaluate);
    if (probeResults.some((row) => row.objectiveValue == null || row.blockers.length > 0)) {
        diagnostics.push({
            severity: "blocker",
            code: "INTERVALO_COM_PONTOS_INVALIDOS",
            message: "Um ou mais pontos do intervalo não produzem indicador válido no motor oficial. Reduza os limites ou saneie as premissas.",
        });
        return finish("invalid", null, null, 0);
    }
    const states = probeResults.map((row) => row.satisfied);
    if (!satisfactionIsMonotonic(states, boundary)) {
        diagnostics.push({
            severity: "blocker",
            code: "OBJETIVO_NAO_MONOTONICO",
            message: "O objetivo muda de direção dentro dos limites. Bisseção não é válida; preserve os pontos como sensibilidade e escolha outra alavanca ou intervalo.",
        });
        return finish("non_monotonic", null, null, 0);
    }
    const lowProbe = probeResults[0];
    const highProbe = probeResults[probeResults.length - 1];
    if (boundary === "minimum" && lowProbe.satisfied) {
        diagnostics.push({
            severity: "info", code: "LIMITE_INFERIOR_JA_ATENDE",
            message: "O menor valor autorizado já satisfaz o objetivo; nenhum número abaixo do limite declarado foi testado.",
        });
        return finish("converged", lowProbe.leverValue, lowProbe.objectiveValue, 0);
    }
    if (boundary === "minimum" && !highProbe.satisfied) {
        diagnostics.push({
            severity: "blocker", code: "OBJETIVO_FORA_DOS_LIMITES",
            message: "Nem o limite superior satisfaz o objetivo. O solver não extrapola os limites declarados.",
        });
        return finish("infeasible", null, null, 0);
    }
    if (boundary === "maximum" && highProbe.satisfied) {
        diagnostics.push({
            severity: "info", code: "LIMITE_SUPERIOR_AINDA_ATENDE",
            message: "O maior valor autorizado ainda satisfaz o objetivo; nenhum número acima do limite declarado foi testado.",
        });
        return finish("converged", highProbe.leverValue, highProbe.objectiveValue, 0);
    }
    if (boundary === "maximum" && !lowProbe.satisfied) {
        diagnostics.push({
            severity: "blocker", code: "OBJETIVO_FORA_DOS_LIMITES",
            message: "Nem o limite inferior satisfaz o objetivo. O solver não extrapola os limites declarados.",
        });
        return finish("infeasible", null, null, 0);
    }
    let low = request.bounds.min;
    let high = request.bounds.max;
    let best = boundary === "minimum" ? highProbe : lowProbe;
    let iterations = 0;
    let previousMid = null;
    while (iterations < request.maxIterations && high - low > request.tolerance) {
        const mid = normalizarLeverValue(request.lever.key, (low + high) / 2);
        if (previousMid === mid)
            break;
        previousMid = mid;
        const row = evaluate(mid);
        iterations += 1;
        if (row.blockers.length || row.objectiveValue == null) {
            diagnostics.push({
                severity: "blocker", code: "PONTO_DE_BUSCA_INVALIDO",
                message: `O motor recusou o ponto ${mid}; a busca foi encerrada sem promover candidato.`,
            });
            return finish("invalid", null, null, iterations);
        }
        if (boundary === "minimum") {
            if (row.satisfied) {
                best = row;
                high = mid;
            }
            else
                low = mid;
        }
        else if (row.satisfied) {
            best = row;
            low = mid;
        }
        else
            high = mid;
    }
    const converged = high - low <= request.tolerance
        || (DISCRETE_LEVERS.has(request.lever.key) && Math.ceil(low) >= Math.floor(high));
    if (!converged) {
        diagnostics.push({
            severity: "blocker", code: "LIMITE_DE_ITERACOES",
            message: `A busca atingiu ${request.maxIterations} iterações antes da tolerância. O ponto não foi declarado solução.`,
        });
        return finish("invalid", null, null, iterations);
    }
    diagnostics.push({
        severity: "info", code: "ALTERNATIVA_CANDIDATA",
        message: "A solução é uma alternativa de análise. Não altera a versão, o cenário vigente, uma aprovação ou a decisão humana.",
    });
    return finish("converged", best.leverValue, best.objectiveValue, iterations);
    function finish(status, resultValue, objectiveValue, iterations) {
        let candidateMetrics = null;
        if (status === "converged" && resultValue != null) {
            try {
                const output = (0, motor_1.calcular)(aplicarAlavanca(input, request.lever, resultValue), { includeRevenueCohorts: false });
                if (!blockerCodes(output).length)
                    candidateMetrics = metricsFromOutput(output);
            }
            catch {
                candidateMetrics = null;
            }
        }
        return {
            schemaVersion: exports.DECISION_LAB_SCHEMA_VERSION,
            decisionLabVersion: exports.DECISION_LAB_VERSION,
            engineVersion: baseOutput.engineVersion,
            status,
            boundary,
            converged: status === "converged" && candidateMetrics != null,
            iterations,
            tolerance: request.tolerance,
            bounds: request.bounds,
            lever: request.lever,
            objective: request.objective,
            resultValue: candidateMetrics ? resultValue : null,
            objectiveValue: candidateMetrics ? objectiveValue : null,
            baseMetrics: metricsFromOutput(baseOutput),
            candidateMetrics,
            trace: uniqueTrace(trace),
            diagnostics,
        };
    }
}
/** Aplica uma única alavanca numa cópia estrutural da entrada. */
function aplicarAlavanca(original, lever, rawValue) {
    const value = normalizarLeverValue(lever.key, rawValue);
    const input = structuredClone(original);
    input.scenario = { ...(input.scenario ?? {}) };
    if (lever.key === "hard_cost_delta_pct") {
        input.scenario.hardCostPct = value;
        return input;
    }
    if (lever.key === "schedule_delay_months") {
        input.scenario.scheduleDelayMonths = value;
        return input;
    }
    if (lever.key === "sale_price_delta_pct") {
        if (!input.revenues.some((row) => row.kind === "unit_sale" || row.kind === "lot_sale")) {
            throw new Error("A versão não possui receita de venda para resolver preço mínimo.");
        }
        input.scenario.pricePct = value;
        return input;
    }
    if (lever.key === "sales_velocity_pct_month") {
        if (!(value > 0 && value <= 100))
            throw new Error("VSO precisa estar entre 0 e 100% ao mês.");
        const duration = Math.max(1, Math.ceil(100 / value));
        let changed = 0;
        input.revenues = input.revenues.map((row) => {
            if (row.kind !== "unit_sale" && row.kind !== "lot_sale")
                return row;
            if (row.salesDistribution === "manual" || row.salesDistribution === "phase_curve") {
                throw new Error(`A linha ${row.label} usa curva explícita; VSO agregada não pode reescrevê-la silenciosamente.`);
            }
            changed += 1;
            return { ...row, salesDurationMonths: duration };
        });
        if (!changed)
            throw new Error("A versão não possui estoque vendável para resolver VSO.");
        input.scenario.salesSpeedMonths = 0;
        return input;
    }
    if (lever.key === "land_acquisition_brl") {
        const scalable = input.uses.filter((row) => row.group === "land" && [
            "fixed", "qty_unit", "per_unit", "per_area", "cub_x_area",
        ].includes(row.basis));
        if (!scalable.length) {
            throw new Error("Não há linha primária de aquisição do terreno; percentuais dependentes não definem o preço residual.");
        }
        const baseline = scalable.reduce((sum, row) => sum + primaryUseValue(row), 0);
        if (!(baseline > 0))
            throw new Error("O preço-base do terreno precisa ser positivo para preservar sua composição.");
        const factor = value / baseline;
        const ids = new Set(scalable.map((row) => row.id));
        input.uses = input.uses.map((row) => {
            if (!ids.has(row.id))
                return row;
            if (row.basis === "fixed")
                return { ...row, amountBrl: (row.amountBrl ?? 0) * factor };
            return { ...row, unitPriceBrl: (row.unitPriceBrl ?? 0) * factor };
        });
        return input;
    }
    if (lever.key === "cost_index_aa") {
        const indexCode = lever.indexCode?.trim();
        if (!indexCode)
            throw new Error("Declare o código exato do índice de custo a resolver.");
        const curve = input.indices[indexCode];
        if (!curve)
            throw new Error(`A versão não possui a curva ${indexCode}.`);
        if (!input.uses.some((row) => row.group === "hard_cost" && row.indexCode === indexCode)) {
            throw new Error(`${indexCode} não está vinculado a nenhuma linha de custo de obra.`);
        }
        const monthly = Math.pow(1 + value / 100, 1 / 12);
        if (!Number.isFinite(monthly) || monthly <= 0)
            throw new Error("Taxa anual do índice inválida.");
        const realized = Math.min(curve.realizedUntilMonth, curve.factors.length - 1);
        const anchor = realized >= 0 ? curve.factors[realized] : 1;
        const factors = curve.factors.map((factor, month) => {
            if (month <= realized)
                return factor;
            const periods = realized >= 0 ? month - realized : month;
            return anchor * Math.pow(monthly, periods);
        });
        input.indices[indexCode] = { ...curve, factors, projectionAa: value };
        return input;
    }
    const sourcePredicate = sourceFilter(lever.key, lever.sourceIds);
    const sources = input.sources.filter(sourcePredicate);
    if (!sources.length)
        throw new Error("Nenhuma fonte elegível foi selecionada para a alavanca de capital.");
    const allocated = allocateSourceTotal(sources, value);
    input.sources = input.sources.map((source) => allocated.get(source.id) ?? source);
    return input;
}
function metricsFromOutput(output) {
    return {
        irrAa: indicator(output, "irr_project"),
        mirrAa: indicator(output, "mirr_project"),
        npvBrl: indicator(output, "npv_project"),
        marginPct: indicator(output, "margin_on_revenue"),
        peakExposureBrl: output.totals.peakExposureBrl,
        fundingGapBrl: output.totals.fundingGapBrl,
        paybackMonth: indicator(output, "payback_month"),
        effectiveHorizonMonths: output.totals.effectiveHorizonMonths ?? output.cashflow.length,
        landCostBrl: output.totals.usesByGroup.land,
        hardCostBrl: output.totals.usesByGroup.hard_cost,
        revenueGrossBrl: output.totals.revenueGrossBrl,
    };
}
/** Classifica não-dominância sem pesos ou score composto. */
function classificarPareto(candidates) {
    return candidates.map((candidate) => {
        const dominatedBy = candidates
            .filter((other) => other.id !== candidate.id && dominates(other.metrics, candidate.metrics))
            .map((other) => other.id);
        return { ...candidate, pareto: dominatedBy.length === 0, dominatedBy };
    });
}
function normalizarDecisionLabState(value) {
    const root = record(value);
    if (!root)
        return unavailable("Resposta do Decision Lab ausente ou malformada.");
    const versionRow = record(root.version);
    const version = versionRow && uuid(versionRow.id) && integer(versionRow.version) != null
        && integer(versionRow.input_revision) != null && sha(versionRow.input_sha256)
        && typeof versionRow.fresh === "boolean"
        ? {
            id: versionRow.id,
            version: integer(versionRow.version),
            inputRevision: integer(versionRow.input_revision),
            inputSha256: versionRow.input_sha256,
            fresh: versionRow.fresh,
        }
        : null;
    if (!version)
        return unavailable("A versão vigente não possui selo de cálculo verificável.");
    if (!version.fresh)
        return { state: "stale", reason: "Recalcule a versão antes de usar soluções reversas.", version, candidates: [] };
    if (!Array.isArray(root.candidates))
        return unavailable("A lista governada de candidatos não foi retornada.");
    const parsed = [];
    for (const raw of root.candidates) {
        const row = record(raw);
        const lever = record(row?.lever);
        const objective = record(row?.objective);
        const metrics = parseMetrics(row?.metrics);
        const inputRevision = integer(row?.input_revision);
        if (!row || !uuid(row.id) || !uuid(row.run_id) || !text(row.label)
            || !text(row.created_at) || !uuid(row.created_by) || inputRevision == null
            || !sha(row.input_sha256) || row.input_sha256 !== version.inputSha256
            || inputRevision !== version.inputRevision || !sha(row.run_sha256)
            || !sha(row.candidate_sha256) || !lever || !objective || !metrics
            || !isLeverKey(lever.key) || !finite(lever.value)
            || !isObjectiveKey(objective.key) || !isComparator(objective.comparator)
            || !finite(objective.target) || !finite(objective.value)) {
            return unavailable("Um candidato não corresponde ao contrato ou ao selo vigente.");
        }
        parsed.push({
            id: row.id,
            runId: row.run_id,
            label: row.label,
            createdAt: row.created_at,
            createdBy: row.created_by,
            inputRevision,
            inputSha256: row.input_sha256,
            runSha256: row.run_sha256,
            candidateSha256: row.candidate_sha256,
            lever: {
                key: lever.key,
                sourceIds: stringArray(lever.sourceIds),
                indexCode: optionalText(lever.indexCode),
                value: lever.value,
            },
            objective: {
                key: objective.key,
                comparator: objective.comparator,
                target: objective.target,
                value: objective.value,
            },
            metrics,
        });
    }
    const candidates = classificarPareto(parsed);
    return {
        state: candidates.length ? "ready" : "empty",
        reason: candidates.length
            ? "Alternativas candidatas imutáveis; Pareto expõe trade-offs e não decide pela equipe."
            : "Nenhuma solução convergida foi selada para esta revisão e este SHA.",
        version,
        candidates,
    };
}
function decisionLabUnavailable(reason) {
    return unavailable(reason);
}
/** Fecha o payload RSC antes de abrir a capability no banco. */
function normalizarDecisionLabRequest(value) {
    const request = record(value);
    const lever = record(request?.lever);
    const objective = record(request?.objective);
    const bounds = record(request?.bounds);
    if (!request || !lever || !objective || !bounds) {
        throw new Error("Contrato do Decision Lab inválido.");
    }
    if (lever.sourceIds != null && !Array.isArray(lever.sourceIds)) {
        throw new Error("A seleção de fontes do Decision Lab precisa ser uma lista de IDs.");
    }
    if (lever.indexCode != null && typeof lever.indexCode !== "string") {
        throw new Error("O código do índice do Decision Lab precisa ser textual.");
    }
    return validarDecisionLabRequest({
        schemaVersion: request.schemaVersion,
        label: request.label,
        rationale: request.rationale,
        lever: {
            key: lever.key,
            sourceIds: lever.sourceIds == null ? undefined : lever.sourceIds,
            indexCode: lever.indexCode == null ? undefined : lever.indexCode,
        },
        objective: {
            key: objective.key,
            comparator: objective.comparator,
            target: objective.target,
        },
        bounds: { min: bounds.min, max: bounds.max },
        tolerance: request.tolerance,
        maxIterations: request.maxIterations,
    });
}
function validarDecisionLabRequest(request) {
    if (!request || request.schemaVersion !== 1)
        throw new Error("Contrato do Decision Lab inválido.");
    if (!text(request.label) || request.label.trim().length > 120)
        throw new Error("Nomeie a alternativa em até 120 caracteres.");
    if (!text(request.rationale) || request.rationale.trim().length < 10 || request.rationale.trim().length > 1_200) {
        throw new Error("Declare o racional da busca entre 10 e 1.200 caracteres.");
    }
    if (!isLeverKey(request.lever?.key))
        throw new Error("Alavanca de decisão desconhecida.");
    if (!isObjectiveKey(request.objective?.key) || !isComparator(request.objective?.comparator)
        || !finite(request.objective?.target))
        throw new Error("Objetivo econômico inválido.");
    if (![request.bounds?.min, request.bounds?.max, request.tolerance].every(finite)
        || request.bounds.min >= request.bounds.max || request.tolerance <= 0
        || request.tolerance >= request.bounds.max - request.bounds.min) {
        throw new Error("Limites/tolerância inválidos: exige mínimo < máximo e tolerância positiva menor que o intervalo.");
    }
    if (!Number.isInteger(request.maxIterations) || request.maxIterations < 8
        || request.maxIterations > exports.DECISION_LAB_MAX_ITERATIONS) {
        throw new Error(`A busca exige entre 8 e ${exports.DECISION_LAB_MAX_ITERATIONS} iterações.`);
    }
    if (DISCRETE_LEVERS.has(request.lever.key) && request.tolerance < 1) {
        throw new Error("Alavancas mensais exigem tolerância mínima de um mês.");
    }
    if (request.lever.key === "cost_index_aa" && !text(request.lever.indexCode)) {
        throw new Error("O índice de custo precisa ser identificado pelo código da curva vigente.");
    }
    if (request.lever.sourceIds) {
        if (!request.lever.sourceIds.length || request.lever.sourceIds.length > 20
            || new Set(request.lever.sourceIds).size !== request.lever.sourceIds.length
            || request.lever.sourceIds.some((id) => !uuid(id))) {
            throw new Error("A seleção de fontes contém ID inválido ou duplicado.");
        }
    }
    return {
        ...request,
        label: request.label.trim(),
        rationale: request.rationale.trim(),
        lever: {
            ...request.lever,
            indexCode: request.lever.indexCode?.trim() || undefined,
            sourceIds: request.lever.sourceIds ? [...request.lever.sourceIds] : undefined,
        },
        bounds: { ...request.bounds },
        objective: { ...request.objective },
    };
}
function objectiveFromOutput(output, key) {
    if (key === "irr_project_aa")
        return indicator(output, "irr_project");
    if (key === "mirr_project_aa")
        return indicator(output, "mirr_project");
    if (key === "npv_project_brl")
        return indicator(output, "npv_project");
    if (key === "margin_on_revenue_pct")
        return indicator(output, "margin_on_revenue");
    if (key === "funding_gap_brl")
        return output.totals.fundingGapBrl;
    if (key === "peak_exposure_brl")
        return output.totals.peakExposureBrl;
    return indicator(output, "payback_month");
}
function satisfaz(value, objective) {
    return objective.comparator === "gte" ? value >= objective.target : value <= objective.target;
}
function satisfactionIsMonotonic(states, boundary) {
    let transitioned = false;
    for (let index = 1; index < states.length; index += 1) {
        if (states[index] === states[index - 1])
            continue;
        if (transitioned)
            return false;
        transitioned = true;
        if (boundary === "minimum" && (states[index - 1] || !states[index]))
            return false;
        if (boundary === "maximum" && (!states[index - 1] || states[index]))
            return false;
    }
    return true;
}
function sourceFilter(key, sourceIds) {
    const ids = sourceIds?.length ? new Set(sourceIds) : null;
    const allowedKinds = key === "counterparty_equity_brl"
        ? ["equity_partner"]
        : key === "equity_available_brl"
            ? ["equity_own", "equity_partner"]
            : [
                "equity_own", "equity_partner", "presales", "bank_construction",
                "bank_mortgage_transfer", "consortium", "private_debt", "barter",
                "subsidy", "other",
            ];
    return (source) => allowedKinds.includes(source.kind) && (!ids || ids.has(source.id));
}
function allocateSourceTotal(sources, total) {
    if (total < 0)
        throw new Error("Capital disponível não pode ser negativo.");
    const weights = sources.map((source) => Math.max(0, source.committedBrl));
    const weightTotal = weights.reduce((sum, value) => sum + value, 0);
    if (weightTotal === 0 && sources.length > 1) {
        throw new Error("Fontes múltiplas sem compromisso não possuem pesos governados; selecione uma fonte ou declare a composição antes de resolver.");
    }
    const result = new Map();
    let allocated = 0;
    sources.forEach((source, index) => {
        const value = index === sources.length - 1
            ? total - allocated
            : total * (weightTotal > 0 ? weights[index] / weightTotal : 1);
        allocated += value;
        if (value + 1e-6 < source.drawnBrl) {
            throw new Error(`O limite calculado de ${source.label} não pode ficar abaixo do valor já sacado.`);
        }
        result.set(source.id, {
            ...source,
            nominalBrl: value,
            committedBrl: value,
            eligibleBrl: value,
            availableBrl: value,
        });
    });
    return result;
}
function primaryUseValue(use) {
    if (use.basis === "fixed")
        return use.amountBrl ?? 0;
    return (use.qty ?? 0) * (use.unitPriceBrl ?? 0);
}
function normalizarLeverValue(key, value) {
    if (!finite(value))
        throw new Error("Valor da alavanca precisa ser finito.");
    return DISCRETE_LEVERS.has(key) ? Math.round(value) : value;
}
function indicator(output, code) {
    const value = output.indicators.find((row) => row.code === code)?.value;
    return finite(value) ? value : null;
}
function blockerCodes(output) {
    return [...new Set(output.diagnostics
            .filter((row) => row.severity === "blocker")
            .map((row) => row.code))];
}
function uniqueTrace(trace) {
    const seen = new Set();
    return trace.filter((row) => {
        const key = String(row.leverValue);
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
function invalidResult(input, request, boundary, trace, diagnostics, baseOutput) {
    return {
        schemaVersion: 1,
        decisionLabVersion: exports.DECISION_LAB_VERSION,
        engineVersion: baseOutput?.engineVersion ?? input.engineVersion,
        status: "invalid",
        boundary,
        converged: false,
        iterations: 0,
        tolerance: request.tolerance,
        bounds: request.bounds,
        lever: request.lever,
        objective: request.objective,
        resultValue: null,
        objectiveValue: null,
        baseMetrics: baseOutput ? metricsFromOutput(baseOutput) : null,
        candidateMetrics: null,
        trace,
        diagnostics,
    };
}
function dominates(a, b) {
    const aValues = [a.mirrAa, a.npvBrl, a.marginPct, a.peakExposureBrl, a.effectiveHorizonMonths, a.fundingGapBrl];
    const bValues = [b.mirrAa, b.npvBrl, b.marginPct, b.peakExposureBrl, b.effectiveHorizonMonths, b.fundingGapBrl];
    if ([...aValues, ...bValues].some((value) => value == null || !finite(value)))
        return false;
    const directions = [1, 1, 1, -1, -1, -1];
    let strictlyBetter = false;
    for (let index = 0; index < directions.length; index += 1) {
        const av = aValues[index];
        const bv = bValues[index];
        const delta = (av - bv) * directions[index];
        if (delta < -1e-9)
            return false;
        if (delta > 1e-9)
            strictlyBetter = true;
    }
    return strictlyBetter;
}
function parseMetrics(value) {
    const row = record(value);
    if (!row)
        return null;
    const nullable = (item) => item == null ? null : finite(item) ? item : undefined;
    const irrAa = nullable(row.irrAa);
    const mirrAa = nullable(row.mirrAa);
    const npvBrl = nullable(row.npvBrl);
    const marginPct = nullable(row.marginPct);
    const paybackMonth = nullable(row.paybackMonth);
    if ([irrAa, mirrAa, npvBrl, marginPct, paybackMonth].includes(undefined)
        || ![row.peakExposureBrl, row.fundingGapBrl, row.effectiveHorizonMonths,
            row.landCostBrl, row.hardCostBrl, row.revenueGrossBrl].every(finite))
        return null;
    return {
        irrAa: irrAa,
        mirrAa: mirrAa,
        npvBrl: npvBrl,
        marginPct: marginPct,
        peakExposureBrl: row.peakExposureBrl,
        fundingGapBrl: row.fundingGapBrl,
        paybackMonth: paybackMonth,
        effectiveHorizonMonths: row.effectiveHorizonMonths,
        landCostBrl: row.landCostBrl,
        hardCostBrl: row.hardCostBrl,
        revenueGrossBrl: row.revenueGrossBrl,
    };
}
function unavailable(reason) {
    return { state: "unavailable", reason, version: null, candidates: [] };
}
function record(value) {
    return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : null;
}
function finite(value) {
    return typeof value === "number" && Number.isFinite(value);
}
function integer(value) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 ? number : null;
}
function text(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function optionalText(value) {
    return text(value) ? value.trim() : undefined;
}
function stringArray(value) {
    return Array.isArray(value) && value.every(uuid) ? value : undefined;
}
function uuid(value) {
    return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
function sha(value) {
    return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}
function isLeverKey(value) {
    return typeof value === "string" && value in LEVER_BOUNDARY;
}
function isObjectiveKey(value) {
    return typeof value === "string" && [
        "irr_project_aa", "mirr_project_aa", "npv_project_brl",
        "margin_on_revenue_pct", "funding_gap_brl", "peak_exposure_brl",
        "payback_month",
    ].includes(value);
}
function isComparator(value) {
    return value === "gte" || value === "lte";
}
function mensagem(error) {
    return error instanceof Error ? error.message : "Falha desconhecida ao aplicar a alavanca.";
}
