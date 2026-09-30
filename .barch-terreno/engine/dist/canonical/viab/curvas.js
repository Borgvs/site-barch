"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.distribuir = distribuir;
exports.espalhar = espalhar;
exports.fatorIndice = fatorIndice;
exports.curvaDeSerie = curvaDeSerie;
exports.addMonths = addMonths;
exports.mesCompetencia = mesCompetencia;
/** Soma 1,0 (ou 0 quando não há meses). Nunca devolve NaN. */
function distribuir(distribution, durationMonths, opts) {
    const n = Math.max(1, Math.trunc(durationMonths));
    // `on_demand` é preenchido pelo motor DEPOIS de conhecer o saldo do mês. Aqui não há
    // o que distribuir: devolver zeros é a resposta honesta, e devolver linear seria
    // inventar um cronograma que a fonte justamente não tem.
    if (distribution === "on_demand")
        return new Array(n).fill(0);
    if (distribution === "single") {
        const v = new Array(n).fill(0);
        v[0] = 1;
        return v;
    }
    if (distribution === "manual" || distribution === "phase_curve") {
        const bruto = (distribution === "manual" ? opts?.manual : opts?.phaseCurve) ?? [];
        const usar = bruto.length ? bruto.slice(0, n) : [];
        if (!usar.length)
            return distribuir("linear", n);
        const soma = usar.reduce((s, x) => s + (Number.isFinite(x) ? Math.max(0, x) : 0), 0);
        if (soma <= 0)
            return distribuir("linear", n);
        const v = new Array(n).fill(0);
        for (let i = 0; i < usar.length; i++)
            v[i] = Math.max(0, usar[i]) / soma;
        return v;
    }
    if (distribution === "s_curve") {
        // Curva S por distribuição beta acumulada aproximada. `skew` desloca o pico:
        // 0 = simétrica; positivo joga o gasto para o fim (típico de obra com fundação
        // leve e acabamento pesado); negativo, para o começo.
        const skew = clamp(opts?.skew ?? 0, -0.9, 0.9);
        const alpha = 2 + skew * 1.5;
        const beta = 2 - skew * 1.5;
        const acum = [];
        for (let i = 1; i <= n; i++)
            acum.push(betaCdfAprox(i / n, alpha, beta));
        const v = [];
        let anterior = 0;
        for (const a of acum) {
            v.push(Math.max(0, a - anterior));
            anterior = a;
        }
        const soma = v.reduce((s, x) => s + x, 0);
        return soma > 0 ? v.map((x) => x / soma) : distribuir("linear", n);
    }
    return new Array(n).fill(1 / n);
}
/** Espalha um total pelo horizonte, respeitando início e duração. */
function espalhar(total, startMonth, durationMonths, horizonMonths, distribution, opts) {
    const serie = new Array(Math.max(1, horizonMonths)).fill(0);
    if (!Number.isFinite(total) || total === 0)
        return serie;
    const pesos = distribuir(distribution, durationMonths, opts);
    const inicio = Math.max(0, Math.trunc(startMonth));
    for (let i = 0; i < pesos.length; i++) {
        const m = inicio + i;
        if (m >= serie.length)
            break; // o que passa do horizonte não some em silêncio:
        serie[m] += total * pesos[i]; // o diagnóstico do motor reporta o truncamento
    }
    return serie;
}
/**
 * Fator de correção de um valor da data-base até o mês m.
 *
 * As duas réguas (§13 do SPEC-VIAB-001) usam a MESMA função com curvas diferentes:
 * a régua A corrige custo por INCC/CUB; a régua B corrige receita por INCC até o
 * habite-se e IGP-M/IPCA depois. Misturá-las é o erro clássico, e é por isso que
 * quem chama declara qual curva usa.
 */
function fatorIndice(curva, mes) {
    if (!curva)
        return 1;
    const m = Math.max(0, Math.trunc(mes));
    if (m < curva.factors.length)
        return curva.factors[m];
    // Além da série, projeta pela taxa declarada. Sem taxa declarada, congela o último
    // fator conhecido — subestimar é mentira menor que inventar tendência.
    const ultimo = curva.factors.length ? curva.factors[curva.factors.length - 1] : 1;
    if (curva.projectionAa == null)
        return ultimo;
    const mesesExtras = m - (curva.factors.length - 1);
    const aoMes = Math.pow(1 + curva.projectionAa / 100, 1 / 12);
    return ultimo * Math.pow(aoMes, mesesExtras);
}
/** Constrói a curva de fatores a partir de uma série de números-índice. */
function curvaDeSerie(code, serie, baseDate, horizonMonths, projectionAa) {
    const ordenada = [...serie].sort((a, b) => a.month.localeCompare(b.month));
    const baseIdx = ordenada.findIndex((p) => p.month.slice(0, 7) >= baseDate.slice(0, 7));
    const base = baseIdx >= 0 ? ordenada[baseIdx] : ordenada[ordenada.length - 1];
    // Sem projeção declarada, projeta-se pela TENDÊNCIA OBSERVADA na própria série.
    //
    // Repetir o último fator parece prudente e não é: um estudo cuja data-base é
    // posterior ao fim da série ficaria com correção 1,000 do primeiro ao último mês —
    // INCC escolhido, INCC exibido, efeito zero, e ninguém avisado. Índice que não
    // corrige é pior que índice ausente, porque parece estar funcionando.
    const projecao = projectionAa ?? tendenciaAnualizada(ordenada);
    const factors = [];
    let realizedUntil = -1;
    for (let m = 0; m <= horizonMonths; m++) {
        const alvo = addMonths(baseDate, m).slice(0, 7);
        const ponto = ordenada.find((p) => p.month.slice(0, 7) === alvo);
        if (ponto && base && base.value > 0) {
            factors.push(ponto.value / base.value);
            realizedUntil = m;
        }
        else if (factors.length === 0) {
            // O mês 0 É a data-base: um valor da data-base, na data-base, é ele mesmo.
            // Projetar já no primeiro mês corrigiria o dinheiro contra si próprio.
            factors.push(1);
        }
        else {
            const ultimo = factors[factors.length - 1];
            factors.push(projecao == null ? ultimo : ultimo * Math.pow(1 + projecao / 100, 1 / 12));
        }
    }
    return { code, factors, realizedUntilMonth: realizedUntil, projectionAa: projecao };
}
/**
 * Variação anualizada dos últimos 12 meses da série (ou do que houver).
 *
 * É o que um analista faria à mão quando ninguém declarou projeção: olhar a inclinação
 * recente e estendê-la. Devolve `null` quando a série é curta demais para ter
 * inclinação — aí a curva fica plana de propósito, e o motor diz isso em voz alta.
 */
function tendenciaAnualizada(ordenada) {
    if (ordenada.length < 4)
        return null;
    const fim = ordenada[ordenada.length - 1];
    const janela = Math.min(12, ordenada.length - 1);
    const inicio = ordenada[ordenada.length - 1 - janela];
    if (!(inicio.value > 0) || !(fim.value > 0))
        return null;
    const aa = (Math.pow(fim.value / inicio.value, 12 / janela) - 1) * 100;
    if (!Number.isFinite(aa))
        return null;
    // Deflação e disparada existem, mas série corrompida também: a faixa recusa o
    // absurdo em vez de propagá-lo por trinta meses de fluxo.
    return Math.max(-20, Math.min(40, aa));
}
function addMonths(iso, months) {
    const [y, m, d] = iso.split("-").map(Number);
    // Dia 1 sempre: competência é MÊS, e somar mês em dia 31 transborda (a armadilha
    // do setMonth que já mordeu a série de parcelas deste sistema).
    const total = (y * 12 + (m - 1)) + Math.trunc(months);
    const ny = Math.floor(total / 12);
    const nm = (total % 12) + 1;
    return `${String(ny).padStart(4, "0")}-${String(nm).padStart(2, "0")}-${String(d || 1).padStart(2, "0")}`;
}
function mesCompetencia(baseDate, monthIndex) {
    return addMonths(baseDate.slice(0, 8) + "01", monthIndex);
}
function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
}
/** CDF beta por integração numérica — precisão suficiente para uma curva de gasto. */
function betaCdfAprox(x, a, b) {
    if (x <= 0)
        return 0;
    if (x >= 1)
        return 1;
    const passos = 240;
    let soma = 0;
    let total = 0;
    for (let i = 0; i < passos; i++) {
        const t = (i + 0.5) / passos;
        const pdf = Math.pow(t, a - 1) * Math.pow(1 - t, b - 1);
        total += pdf;
        if (t <= x)
            soma += pdf;
    }
    return total > 0 ? soma / total : x;
}
