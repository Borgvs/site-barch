/**
 * Distribuição no tempo e indexação — as duas mecânicas que transformam um valor
 * total num valor MENSAL.
 *
 * O ARGUS chama isso de `Profiles` e trata como objeto reutilizável; o benchmark
 * mostrou que é o que separa um pro forma sério de uma planilha: um custo de obra
 * de R$ 3M distribuído linearmente em 18 meses produz um pico de caixa muito
 * diferente do mesmo valor numa curva S — e é o pico que define quanto capital a
 * operação precisa.
 */
import type { Distribution, IndexCurve } from "./tipos";
/** Soma 1,0 (ou 0 quando não há meses). Nunca devolve NaN. */
export declare function distribuir(distribution: Distribution, durationMonths: number, opts?: {
    skew?: number;
    manual?: number[];
    phaseCurve?: number[];
}): number[];
/** Espalha um total pelo horizonte, respeitando início e duração. */
export declare function espalhar(total: number, startMonth: number, durationMonths: number, horizonMonths: number, distribution: Distribution, opts?: {
    skew?: number;
    manual?: number[];
    phaseCurve?: number[];
}): number[];
/**
 * Fator de correção de um valor da data-base até o mês m.
 *
 * As duas réguas (§13 do SPEC-VIAB-001) usam a MESMA função com curvas diferentes:
 * a régua A corrige custo por INCC/CUB; a régua B corrige receita por INCC até o
 * habite-se e IGP-M/IPCA depois. Misturá-las é o erro clássico, e é por isso que
 * quem chama declara qual curva usa.
 */
export declare function fatorIndice(curva: IndexCurve | undefined, mes: number): number;
/** Constrói a curva de fatores a partir de uma série de números-índice. */
export declare function curvaDeSerie(code: string, serie: Array<{
    month: string;
    value: number;
}>, baseDate: string, horizonMonths: number, projectionAa: number | null): IndexCurve;
export declare function addMonths(iso: string, months: number): string;
export declare function mesCompetencia(baseDate: string, monthIndex: number): string;
