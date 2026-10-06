"use strict";
/**
 * Aritmética decimal exata do domínio Terreno.
 *
 * A fronteira pública usa strings canônicas com ponto decimal. A UI é
 * responsável por adaptar máscaras pt-BR. Internamente, todos os cálculos usam
 * bigint com seis casas; nenhum valor monetário passa por IEEE-754.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TERRAIN_DECIMAL_SCALE = void 0;
exports.parseExactDecimal = parseExactDecimal;
exports.requireExactDecimal = requireExactDecimal;
exports.formatExactDecimal = formatExactDecimal;
exports.formatFixedDecimal = formatFixedDecimal;
exports.normalizeExactDecimal = normalizeExactDecimal;
exports.normalizeMoneyBrl = normalizeMoneyBrl;
exports.decimalAdd = decimalAdd;
exports.decimalSubtract = decimalSubtract;
exports.decimalMultiply = decimalMultiply;
exports.decimalDivide = decimalDivide;
exports.decimalPercent = decimalPercent;
exports.decimalCompare = decimalCompare;
exports.decimalMin = decimalMin;
exports.decimalMax = decimalMax;
exports.decimalClamp = decimalClamp;
exports.decimalToMoney = decimalToMoney;
exports.decimalIsNonNegative = decimalIsNonNegative;
exports.decimalIsPositive = decimalIsPositive;
exports.decimalWeightedMean = decimalWeightedMean;
const SCALE_DIGITS = 6;
const SCALE = 1000000n;
const DECIMAL = /^-?(?:0|[1-9]\d{0,29})(?:\.(\d{1,6}))?$/;
const MONEY = /^-?(?:0|[1-9]\d{0,29})(?:\.\d{1,2})?$/;
function absolute(value) {
    return value < 0n ? -value : value;
}
/** Arredondamento comercial: metade se afasta de zero. */
function divideRounded(numerator, denominator) {
    if (denominator === 0n)
        throw new Error("terrain_decimal_division_by_zero");
    const negative = (numerator < 0n) !== (denominator < 0n);
    const n = absolute(numerator);
    const d = absolute(denominator);
    const quotient = n / d;
    const remainder = n % d;
    const rounded = remainder * 2n >= d ? quotient + 1n : quotient;
    return negative ? -rounded : rounded;
}
function parseExactDecimal(value) {
    if (typeof value !== "string")
        return null;
    const normalized = value.trim();
    const match = DECIMAL.exec(normalized);
    if (!match)
        return null;
    const negative = normalized.startsWith("-");
    const unsigned = negative ? normalized.slice(1) : normalized;
    const [whole, fraction = ""] = unsigned.split(".");
    const scaled = BigInt(whole) * SCALE + BigInt(fraction.padEnd(SCALE_DIGITS, "0"));
    return negative ? -scaled : scaled;
}
function requireExactDecimal(value, field) {
    const parsed = parseExactDecimal(value);
    if (parsed == null)
        throw new Error(`terrain_invalid_decimal:${field}`);
    return parsed;
}
function formatExactDecimal(value) {
    const negative = value < 0n;
    const unsigned = absolute(value);
    const whole = unsigned / SCALE;
    const fraction = (unsigned % SCALE)
        .toString()
        .padStart(SCALE_DIGITS, "0")
        .replace(/0+$/, "");
    return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}
function formatFixedDecimal(value, places) {
    if (!Number.isSafeInteger(places) || places < 0 || places > SCALE_DIGITS) {
        throw new Error("terrain_invalid_decimal_places");
    }
    const quantum = 10n ** BigInt(SCALE_DIGITS - places);
    const quantized = divideRounded(value, quantum) * quantum;
    const negative = quantized < 0n;
    const unsigned = absolute(quantized);
    const whole = unsigned / SCALE;
    if (places === 0)
        return `${negative ? "-" : ""}${whole}`;
    const fraction = (unsigned % SCALE)
        .toString()
        .padStart(SCALE_DIGITS, "0")
        .slice(0, places);
    return `${negative ? "-" : ""}${whole}.${fraction}`;
}
function normalizeExactDecimal(value) {
    const parsed = parseExactDecimal(value);
    return parsed == null ? null : formatExactDecimal(parsed);
}
function normalizeMoneyBrl(value) {
    if (typeof value !== "string" || !MONEY.test(value.trim()))
        return null;
    const parsed = parseExactDecimal(value.trim());
    return parsed == null ? null : formatFixedDecimal(parsed, 2);
}
function decimalAdd(...values) {
    return formatExactDecimal(values.reduce((sum, value, index) => sum + requireExactDecimal(value, `add[${index}]`), 0n));
}
function decimalSubtract(a, b) {
    return formatExactDecimal(requireExactDecimal(a, "subtract.a") - requireExactDecimal(b, "subtract.b"));
}
function decimalMultiply(a, b) {
    return formatExactDecimal(divideRounded(requireExactDecimal(a, "multiply.a") * requireExactDecimal(b, "multiply.b"), SCALE));
}
function decimalDivide(a, b) {
    return formatExactDecimal(divideRounded(requireExactDecimal(a, "divide.a") * SCALE, requireExactDecimal(b, "divide.b")));
}
function decimalPercent(base, percent) {
    return decimalDivide(decimalMultiply(base, percent), "100");
}
function decimalCompare(a, b) {
    const left = requireExactDecimal(a, "compare.a");
    const right = requireExactDecimal(b, "compare.b");
    return left === right ? 0 : left < right ? -1 : 1;
}
function decimalMin(a, b) {
    return decimalCompare(a, b) <= 0 ? formatExactDecimal(requireExactDecimal(a, "min.a")) : formatExactDecimal(requireExactDecimal(b, "min.b"));
}
function decimalMax(a, b) {
    return decimalCompare(a, b) >= 0 ? formatExactDecimal(requireExactDecimal(a, "max.a")) : formatExactDecimal(requireExactDecimal(b, "max.b"));
}
function decimalClamp(value, minimum, maximum) {
    let result = formatExactDecimal(requireExactDecimal(value, "clamp.value"));
    if (minimum != null)
        result = decimalMax(result, minimum);
    if (maximum != null)
        result = decimalMin(result, maximum);
    return result;
}
function decimalToMoney(value) {
    return formatFixedDecimal(requireExactDecimal(value, "money"), 2);
}
function decimalIsNonNegative(value) {
    const parsed = parseExactDecimal(value);
    return parsed != null && parsed >= 0n;
}
function decimalIsPositive(value) {
    const parsed = parseExactDecimal(value);
    return parsed != null && parsed > 0n;
}
/** Média ponderada; pesos e valores aceitam seis casas. */
function decimalWeightedMean(rows) {
    let numerator = 0n;
    let denominator = 0n;
    rows.forEach((row, index) => {
        const value = requireExactDecimal(row.value, `weighted[${index}].value`);
        const weight = requireExactDecimal(row.weight, `weighted[${index}].weight`);
        if (weight <= 0n)
            throw new Error(`terrain_invalid_weight:${index}`);
        numerator += value * weight;
        denominator += weight;
    });
    if (denominator === 0n)
        throw new Error("terrain_empty_weighted_mean");
    return formatExactDecimal(divideRounded(numerator, denominator));
}
exports.TERRAIN_DECIMAL_SCALE = SCALE;
