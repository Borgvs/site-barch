/**
 * Aritmética decimal exata do domínio Terreno.
 *
 * A fronteira pública usa strings canônicas com ponto decimal. A UI é
 * responsável por adaptar máscaras pt-BR. Internamente, todos os cálculos usam
 * bigint com seis casas; nenhum valor monetário passa por IEEE-754.
 */
export type ExactDecimal = string;
export type MoneyBrl = string;
export declare function parseExactDecimal(value: unknown): bigint | null;
export declare function requireExactDecimal(value: unknown, field: string): bigint;
export declare function formatExactDecimal(value: bigint): ExactDecimal;
export declare function formatFixedDecimal(value: bigint, places: number): string;
export declare function normalizeExactDecimal(value: unknown): ExactDecimal | null;
export declare function normalizeMoneyBrl(value: unknown): MoneyBrl | null;
export declare function decimalAdd(...values: readonly ExactDecimal[]): ExactDecimal;
export declare function decimalSubtract(a: ExactDecimal, b: ExactDecimal): ExactDecimal;
export declare function decimalMultiply(a: ExactDecimal, b: ExactDecimal): ExactDecimal;
export declare function decimalDivide(a: ExactDecimal, b: ExactDecimal): ExactDecimal;
export declare function decimalPercent(base: ExactDecimal, percent: ExactDecimal): ExactDecimal;
export declare function decimalCompare(a: ExactDecimal, b: ExactDecimal): -1 | 0 | 1;
export declare function decimalMin(a: ExactDecimal, b: ExactDecimal): ExactDecimal;
export declare function decimalMax(a: ExactDecimal, b: ExactDecimal): ExactDecimal;
export declare function decimalClamp(value: ExactDecimal, minimum: ExactDecimal | null, maximum: ExactDecimal | null): ExactDecimal;
export declare function decimalToMoney(value: ExactDecimal): MoneyBrl;
export declare function decimalIsNonNegative(value: ExactDecimal): boolean;
export declare function decimalIsPositive(value: ExactDecimal): boolean;
/** Média ponderada; pesos e valores aceitam seis casas. */
export declare function decimalWeightedMean(rows: readonly {
    value: ExactDecimal;
    weight: ExactDecimal;
}[]): ExactDecimal;
export declare const TERRAIN_DECIMAL_SCALE = 1000000n;
