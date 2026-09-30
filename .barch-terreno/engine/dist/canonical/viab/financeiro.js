"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.vpl = vpl;
exports.taxaMensal = taxaMensal;
exports.anualizar = anualizar;
exports.tir = tir;
exports.mtir = mtir;
exports.payback = payback;
exports.exposicaoMaxima = exposicaoMaxima;
exports.agendaDivida = agendaDivida;
exports.hashEstavel = hashEstavel;
/** Valor presente líquido a partir de fluxo mensal e taxa ANUAL. */
function vpl(fluxoMensal, taxaAa) {
    const i = taxaMensal(taxaAa);
    let acc = 0;
    for (let m = 0; m < fluxoMensal.length; m++) {
        acc += fluxoMensal[m] / Math.pow(1 + i, m);
    }
    return acc;
}
function taxaMensal(taxaAa) {
    return Math.pow(1 + taxaAa / 100, 1 / 12) - 1;
}
function anualizar(taxaAm) {
    return (Math.pow(1 + taxaAm, 12) - 1) * 100;
}
/**
 * TIR por varredura + bisseção. A varredura existe justamente para DETECTAR
 * múltiplas raízes: Newton acharia uma e calaria sobre as outras.
 */
function tir(fluxoMensal) {
    const positivos = fluxoMensal.some((v) => v > 0);
    const negativos = fluxoMensal.some((v) => v < 0);
    if (!positivos || !negativos)
        return { aa: null, motivo: "sem_troca_de_sinal" };
    const f = (im) => {
        let acc = 0;
        for (let m = 0; m < fluxoMensal.length; m++)
            acc += fluxoMensal[m] / Math.pow(1 + im, m);
        return acc;
    };
    // Varre de -90% a +500% ao mês procurando trocas de sinal. O teto alto não é
    // realismo — nenhum negócio rende 500% ao mês —, é COBERTURA: um fluxo patológico
    // com raiz lá em cima precisa ser reportado como "múltiplas raízes", não como
    // "não convergiu". A mensagem errada mandaria alguém procurar bug onde há
    // ambiguidade matemática legítima.
    const lo = -0.9;
    const hi = 5.0;
    const passos = 5900;
    const raizes = [];
    const passo = (hi - lo) / passos;
    let anterior = f(lo);
    let xAnterior = lo;
    const registrar = (r) => {
        // A mesma raiz pode ser vista pelo ponto exato e pela troca de sinal seguinte.
        if (!raizes.some((j) => Math.abs(j - r) < 1e-7))
            raizes.push(r);
    };
    for (let k = 1; k <= passos; k++) {
        const x = lo + passo * k;
        const atual = f(x);
        if (Number.isFinite(anterior) && Number.isFinite(atual)) {
            // Raiz EXATAMENTE sobre um ponto da grade: aqui o produto de sinais é zero,
            // não negativo, e a troca passaria despercebida. Foi o caso que o golden test
            // [-1, 5, -6] expôs — as duas raízes caem em 100% e 200% ao mês, redondas.
            if (Math.abs(atual) < 1e-9)
                registrar(x);
            else if (anterior * atual < 0)
                registrar(bissecao(f, xAnterior, x));
        }
        anterior = atual;
        xAnterior = x;
    }
    if (Math.abs(f(lo)) < 1e-9)
        registrar(lo);
    if (raizes.length === 0)
        return { aa: null, motivo: "sem_convergencia" };
    if (raizes.length > 1) {
        return { aa: null, motivo: "multiplas_raizes", raizes: raizes.map(anualizar) };
    }
    return { aa: anualizar(raizes[0]) };
}
/**
 * TIR modificada: reinveste o positivo à taxa de reinvestimento e financia o
 * negativo à taxa de financiamento. Sempre existe e é única — por isso é a resposta
 * honesta quando a TIR é múltipla.
 */
function mtir(fluxoMensal, taxaFinanciamentoAa, taxaReinvestimentoAa) {
    const n = fluxoMensal.length - 1;
    if (n < 1)
        return null;
    const iF = taxaMensal(taxaFinanciamentoAa);
    const iR = taxaMensal(taxaReinvestimentoAa);
    let vpNegativos = 0;
    let vfPositivos = 0;
    for (let m = 0; m <= n; m++) {
        const v = fluxoMensal[m];
        if (v < 0)
            vpNegativos += v / Math.pow(1 + iF, m);
        else
            vfPositivos += v * Math.pow(1 + iR, n - m);
    }
    if (vpNegativos === 0 || vfPositivos <= 0)
        return null;
    const im = Math.pow(vfPositivos / -vpNegativos, 1 / n) - 1;
    return anualizar(im);
}
/** Primeiro mês em que o acumulado deixa de ser negativo. */
function payback(fluxoMensal) {
    // Payback só existe depois de capital EXPOSTO: um fluxo que abre não-negativo no mês 0
    // não "retornou" nada — declarar mês 0 era zero como afirmação falsa.
    let acc = 0;
    let capitalExposto = false;
    for (let m = 0; m < fluxoMensal.length; m++) {
        acc += fluxoMensal[m];
        if (acc < 0)
            capitalExposto = true;
        if (capitalExposto && acc >= 0)
            return m;
    }
    return null;
}
/** Maior saldo negativo acumulado — a Exposição Máxima de Caixa (vocabulário Sienge). */
function exposicaoMaxima(saldos) {
    let pior = 0;
    let mes = 0;
    for (let m = 0; m < saldos.length; m++) {
        if (saldos[m] < pior) {
            pior = saldos[m];
            mes = m;
        }
    }
    return { valor: Math.abs(pior), mes };
}
/**
 * Agenda de dívida. `capitalizeInterest` durante a carência é o comportamento real
 * do plano empresário: o juro não pago vira principal, e ignorar isso subestima o
 * saldo devedor no exato momento em que ele é maior.
 */
function agendaDivida(params) {
    const { principalPorMes, taxaAaPorMes, graceMonths, termMonths, amortization, capitalizeInterest, horizonMonths, startMonth, } = params;
    if (amortization === "cash_sweep" || amortization === "custom") {
        throw new Error(`A amortização ${amortization} exige uma política contratual especializada; ` +
            "a agenda não pode substituí-la por SAC.");
    }
    const out = [];
    let saldo = 0;
    const fimCarencia = startMonth + Math.max(0, graceMonths);
    const fimPrazo = fimCarencia + Math.max(1, termMonths);
    let parcelaPrice = null;
    for (let m = 0; m < horizonMonths; m++) {
        const i = taxaMensal(taxaAaPorMes[m] ?? 0);
        saldo += principalPorMes[m] ?? 0;
        const juros = saldo * i;
        let amortizacao = 0;
        if (m >= fimCarencia && m < fimPrazo && saldo > 0.005) {
            const restantes = fimPrazo - m;
            if (amortization === "sac") {
                amortizacao = saldo / restantes;
            }
            else if (amortization === "price") {
                // A parcela é fixa POR CONSTRUÇÃO — mas só depois que o principal parou de
                // entrar. Congelá-la no primeiro mês pós-carência, com saque ainda por liberar,
                // dimensiona a prestação sobre uma FRAÇÃO do empréstimo: o juro cresce com os
                // saques novos, `parcela − juros` definha e a dívida não fecha. Medido: saque de
                // R$ 50 mil/mês por 24 meses, carência 6, prazo 18 — a amortização caía de
                // R$ 17.693 para R$ 11.103 e sobravam 78% do principal, onde o SAC fecha em zero.
                // É o comportamento do banco: a prestação se refaz a cada liberação.
                if (parcelaPrice == null || (principalPorMes[m] ?? 0) > 0.005) {
                    parcelaPrice = i > 0
                        ? (saldo * i) / (1 - Math.pow(1 + i, -restantes))
                        : saldo / restantes;
                }
                amortizacao = Math.max(0, parcelaPrice - juros);
            }
            else if (amortization === "bullet") {
                amortizacao = m === fimPrazo - 1 ? saldo : 0;
            }
            amortizacao = Math.min(amortizacao, saldo);
            saldo -= amortizacao;
        }
        else if (capitalizeInterest && m < fimCarencia) {
            // Carência com capitalização: o juro entra no saldo em vez de ser pago.
            saldo += juros;
        }
        out.push({
            mes: m,
            juros: m < fimCarencia && capitalizeInterest ? 0 : juros,
            jurosAcruado: juros,
            amortizacao,
            saldo,
        });
    }
    return out;
}
function bissecao(f, a, b) {
    let lo = a;
    let hi = b;
    let meio = (lo + hi) / 2;
    for (let k = 0; k < 200; k++) {
        meio = (lo + hi) / 2;
        const v = f(meio);
        if (Math.abs(v) < 1e-10 || hi - lo < 1e-12)
            return meio;
        if (f(lo) * v < 0)
            hi = meio;
        else
            lo = meio;
    }
    return meio;
}
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
function hashEstavel(valor) {
    const texto = JSON.stringify(valor, ordenarChaves);
    const primos = [0x01000193, 0x85ebca6b, 0xc2b2ae35, 0x27d4eb2f,
        0x165667b1, 0x9e3779b9, 0x7feb352d, 0x846ca68b];
    const pistas = [0x811c9dc5, 0x01000193, 0x85ebca6b, 0xc2b2ae35,
        0x27d4eb2f, 0x165667b1, 0x9e3779b9, 0x7feb352d].map((s) => s >>> 0);
    for (let i = 0; i < texto.length; i++) {
        const c = texto.charCodeAt(i);
        for (let k = 0; k < pistas.length; k++) {
            pistas[k] = Math.imul(pistas[k] ^ (c + k * (i + 1)), primos[k]) >>> 0;
        }
    }
    return pistas.map((p) => (p >>> 0).toString(16).padStart(8, "0")).join("");
}
function ordenarChaves(_k, v) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
        return Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)));
    }
    return v;
}
