/**
 * Matemática financeira do módulo — VPL, TIR, MTIR, payback e amortização.
 *
 * Duas decisões que mudam o resultado e por isso ficam explícitas:
 *
 * 1. TIR PODE NÃO EXISTIR OU SER MÚLTIPLA. Um fluxo com mais de uma troca de sinal
 *    (o caso normal de incorporação com re-aporte) pode ter duas raízes ou nenhuma.
 *    Devolver um número nesse caso é pior que devolver nada: quem lê decide sobre uma
 *    ficção. Aqui a função devolve `null` com diagnóstico, e o motor mostra a MTIR,
 *    que é sempre única.
 *
 * 2. TIR MENSAL VIRA ANUAL POR COMPOSIÇÃO, não por multiplicação. (1+i)^12−1, nunca
 *    i×12 — a diferença numa taxa de 2% ao mês é 26,8% contra 24%, e ninguém percebe
 *    olhando o número final.
 */
/** Valor presente líquido a partir de fluxo mensal e taxa ANUAL. */
export declare function vpl(fluxoMensal: number[], taxaAa: number): number;
export declare function taxaMensal(taxaAa: number): number;
export declare function anualizar(taxaAm: number): number;
export type TirResultado = {
    /** Taxa anual em pontos percentuais, ou null quando não existe/é ambígua. */
    aa: number | null;
    motivo?: "sem_troca_de_sinal" | "multiplas_raizes" | "sem_convergencia";
    raizes?: number[];
};
/**
 * TIR por varredura + bisseção. A varredura existe justamente para DETECTAR
 * múltiplas raízes: Newton acharia uma e calaria sobre as outras.
 */
export declare function tir(fluxoMensal: number[]): TirResultado;
/**
 * TIR modificada: reinveste o positivo à taxa de reinvestimento e financia o
 * negativo à taxa de financiamento. Sempre existe e é única — por isso é a resposta
 * honesta quando a TIR é múltipla.
 */
export declare function mtir(fluxoMensal: number[], taxaFinanciamentoAa: number, taxaReinvestimentoAa: number): number | null;
/** Primeiro mês em que o acumulado deixa de ser negativo. */
export declare function payback(fluxoMensal: number[]): number | null;
/** Maior saldo negativo acumulado — a Exposição Máxima de Caixa (vocabulário Sienge). */
export declare function exposicaoMaxima(saldos: number[]): {
    valor: number;
    mes: number;
};
export type ParcelaDivida = {
    mes: number;
    /** Juro PAGO no mês — é o que sai do caixa. Zero na carência com capitalização. */
    juros: number;
    /**
     * Juro ACRUADO no mês — o custo do dinheiro, pago ou não.
     *
     * Existe porque os dois números respondem perguntas diferentes e confundi-los
     * apaga metade do custo da dívida: na carência com capitalização o juro não sai
     * do caixa (juros = 0) mas entra no saldo devedor, e volta depois vestido de
     * AMORTIZAÇÃO — onde nenhum totalizador de juro o encontra.
     */
    jurosAcruado: number;
    amortizacao: number;
    saldo: number;
};
/**
 * Agenda de dívida. `capitalizeInterest` durante a carência é o comportamento real
 * do plano empresário: o juro não pago vira principal, e ignorar isso subestima o
 * saldo devedor no exato momento em que ele é maior.
 */
export declare function agendaDivida(params: {
    principalPorMes: number[];
    taxaAaPorMes: number[];
    graceMonths: number;
    termMonths: number;
    amortization: "sac" | "price" | "bullet" | "cash_sweep" | "custom";
    capitalizeInterest: boolean;
    horizonMonths: number;
    startMonth: number;
}): ParcelaDivida[];
/** Hash estável do input — a prova de que o resultado corresponde à entrada. */
/**
 * Impressão digital do input: 64 hexadecimais, sem depender de crypto.
 *
 * O motor é puro e precisa rodar em qualquer lugar, então não usa `node:crypto` nem a
 * WebCrypto (que é assíncrona). São OITO pistas FNV-1a independentes, cada uma com
 * semente e primo próprios — 8 × 8 dígitos = 64. A versão anterior calculava duas
 * pistas e repetia os 32 dígitos: parecia um SHA-256 e não era, porque metade da
 * string não carregava informação nenhuma.
 *
 * Duas armadilhas de JavaScript, ambas cobradas por este código no primeiro E2E:
 * • `^` e `+` devolvem inteiro COM SINAL de 32 bits. Sem `>>> 0`, `toString(16)`
 *   escreve "-3ab12cd4" — com hífen, com nove caracteres — e a coluna do banco recusa.
 * • `Math.imul` é o único jeito de multiplicar em 32 bits sem perder precisão.
 *
 * O que ele NÃO é: prova contra adulteração. Isso é papel do SHA-256 do snapshot de
 * aprovação, calculado pelo banco. Aqui a pergunta é só "o input mudou desde o
 * último cálculo?".
 */
export declare function hashEstavel(valor: unknown): string;
