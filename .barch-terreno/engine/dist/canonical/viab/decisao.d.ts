/**
 * Decision Lab da Viabilidade.
 *
 * Não existe uma segunda planilha aqui: cada ponto da busca chama `calcular`, o
 * motor oficial. A função é pura, não lê banco, não olha relógio e nunca altera a
 * entrada recebida. Uma solução é somente uma alternativa candidata; promovê-la a
 * premissa ou cenário continua sendo um ato humano em outra versão.
 */
import type { FeasibilityInput, FeasibilityOutput } from "./tipos";
export declare const DECISION_LAB_VERSION = "viab-decision-lab-1.0.0";
export declare const DECISION_LAB_SCHEMA_VERSION = 1;
export declare const DECISION_LAB_MAX_ITERATIONS = 80;
export type DecisionLeverKey = "land_acquisition_brl" | "sale_price_delta_pct" | "sales_velocity_pct_month" | "equity_available_brl" | "hard_cost_delta_pct" | "schedule_delay_months" | "cost_index_aa" | "funding_available_brl" | "counterparty_equity_brl";
export type DecisionObjectiveKey = "irr_project_aa" | "mirr_project_aa" | "npv_project_brl" | "margin_on_revenue_pct" | "funding_gap_brl" | "peak_exposure_brl" | "payback_month";
export type DecisionObjectiveComparator = "gte" | "lte";
export type DecisionBoundary = "minimum" | "maximum";
export type DecisionLabRequest = {
    schemaVersion: 1;
    label: string;
    rationale: string;
    lever: {
        key: DecisionLeverKey;
        /** IDs exatos preservam a composição de funding; ausência usa o conjunto
         * canônico da alavanca e só é aceita quando a distribuição é inequívoca. */
        sourceIds?: string[];
        /** Obrigatório para `cost_index_aa`; não existe índice presumido. */
        indexCode?: string;
    };
    objective: {
        key: DecisionObjectiveKey;
        comparator: DecisionObjectiveComparator;
        target: number;
    };
    bounds: {
        min: number;
        max: number;
    };
    tolerance: number;
    maxIterations: number;
};
export type DecisionMetrics = {
    irrAa: number | null;
    mirrAa: number | null;
    npvBrl: number | null;
    marginPct: number | null;
    peakExposureBrl: number;
    fundingGapBrl: number;
    paybackMonth: number | null;
    effectiveHorizonMonths: number;
    landCostBrl: number;
    hardCostBrl: number;
    revenueGrossBrl: number;
};
export type DecisionEvaluation = {
    leverValue: number;
    objectiveValue: number | null;
    satisfied: boolean;
    blockers: string[];
};
export type DecisionLabResult = {
    schemaVersion: 1;
    decisionLabVersion: string;
    engineVersion: string;
    status: "converged" | "infeasible" | "non_monotonic" | "invalid";
    boundary: DecisionBoundary;
    converged: boolean;
    iterations: number;
    tolerance: number;
    bounds: {
        min: number;
        max: number;
    };
    lever: DecisionLabRequest["lever"];
    objective: DecisionLabRequest["objective"];
    resultValue: number | null;
    objectiveValue: number | null;
    baseMetrics: DecisionMetrics | null;
    candidateMetrics: DecisionMetrics | null;
    trace: DecisionEvaluation[];
    diagnostics: Array<{
        severity: "info" | "warning" | "blocker";
        code: string;
        message: string;
    }>;
};
export type DecisionCandidate = {
    id: string;
    runId: string;
    label: string;
    createdAt: string;
    createdBy: string;
    inputRevision: number;
    inputSha256: string;
    runSha256: string;
    candidateSha256: string;
    lever: DecisionLabRequest["lever"] & {
        value: number;
    };
    objective: DecisionLabRequest["objective"] & {
        value: number;
    };
    metrics: DecisionMetrics;
    pareto: boolean;
    dominatedBy: string[];
};
export type DecisionLabState = {
    state: "ready" | "empty" | "stale" | "unavailable";
    reason: string;
    version: {
        id: string;
        version: number;
        inputRevision: number;
        inputSha256: string;
        fresh: boolean;
    } | null;
    candidates: DecisionCandidate[];
};
/** Resolve o limite solicitado por bisseção controlada sobre o motor oficial. */
export declare function resolverDecisionLab(input: FeasibilityInput, rawRequest: unknown): DecisionLabResult;
/** Aplica uma única alavanca numa cópia estrutural da entrada. */
export declare function aplicarAlavanca(original: FeasibilityInput, lever: DecisionLabRequest["lever"], rawValue: number): FeasibilityInput;
export declare function metricsFromOutput(output: FeasibilityOutput): DecisionMetrics;
/** Classifica não-dominância sem pesos ou score composto. */
export declare function classificarPareto<T extends {
    id: string;
    metrics: DecisionMetrics;
}>(candidates: readonly T[]): Array<T & {
    pareto: boolean;
    dominatedBy: string[];
}>;
export declare function normalizarDecisionLabState(value: unknown): DecisionLabState;
export declare function decisionLabUnavailable(reason: string): DecisionLabState;
/** Fecha o payload RSC antes de abrir a capability no banco. */
export declare function normalizarDecisionLabRequest(value: unknown): DecisionLabRequest;
