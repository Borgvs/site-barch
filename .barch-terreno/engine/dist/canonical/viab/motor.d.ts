/**
 * Motor determinístico do módulo de Viabilidade.
 * ARQ-VIAB-GATES-001 §16.8, §16.9, §23.1
 *
 * Uma passada, sete etapas, nesta ordem — e a ordem importa:
 *
 *   1. receita bruta e o cronograma de VENDA
 *   2. usos (que dependem da receita quando a base é % VGV)
 *   3. recebimento (o plano de pagamento transforma venda em caixa)
 *   4. tributo (que no RET incide sobre o RECEBIDO, não sobre o vendido)
 *   5. fontes: saques, limites e juros
 *   6. fluxo mensal com a invariante de caixa
 *   7. indicadores e retorno por sócio
 *
 * A dependência circular clássica — juro é custo, custo define funding, funding gera
 * juro — é resolvida por duas passadas: a primeira estima o saldo sem juro; a segunda
 * calcula o juro sobre esse saldo e reconcilia. Iterar até convergir seria mais exato
 * e menos previsível; duas passadas dão um número estável e um diagnóstico honesto
 * quando o resíduo é material.
 */
import { type FeasibilityInput, type FeasibilityOutput, type RepasseWavePoint } from "./tipos";
import { anualizar } from "./financeiro";
/**
 * Premissa operacional explícita derivada da referência OSPA 06: o repasse é uma
 * onda registral, não um pulso. O default REOS começa em E (não antecipa caixa para
 * E−1, enquanto a cadeia registral ainda não foi vencida) e redistribui aqueles 5%
 * em E+3. Não é estatística setorial; um diagnóstico registra sua adoção para que a
 * versão possa substituí-la por uma onda documentada.
 */
export declare const ONDA_REPASSE_PADRAO: RepasseWavePoint[];
export type CalculationOptions = {
    /** Monte Carlo/cenários não persistem detalhe comercial; omitir evita alocar
     * milhares de agendas por iteração sem alterar qualquer número agregado. */
    includeRevenueCohorts?: boolean;
};
export declare function calcular(input: FeasibilityInput, options?: CalculationOptions): FeasibilityOutput;
export { anualizar };
