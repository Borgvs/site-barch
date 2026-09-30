"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.anualizar = exports.ONDA_REPASSE_PADRAO = void 0;
exports.calcular = calcular;
const tipos_1 = require("./tipos");
const curvas_1 = require("./curvas");
const financeiro_1 = require("./financeiro");
Object.defineProperty(exports, "anualizar", { enumerable: true, get: function () { return financeiro_1.anualizar; } });
const GRUPOS = [
    "land", "hard_cost", "soft_cost", "sales", "finance", "tax", "contingency", "operation_exit",
];
/** Limite defensivo de 100 anos. Datas absurdas bloqueiam; nunca viram alocação sem fim. */
const MAX_HORIZON_MONTHS = 1_200;
/**
 * Premissa operacional explícita derivada da referência OSPA 06: o repasse é uma
 * onda registral, não um pulso. O default REOS começa em E (não antecipa caixa para
 * E−1, enquanto a cadeia registral ainda não foi vencida) e redistribui aqueles 5%
 * em E+3. Não é estatística setorial; um diagnóstico registra sua adoção para que a
 * versão possa substituí-la por uma onda documentada.
 */
exports.ONDA_REPASSE_PADRAO = [
    { monthOffset: 0, weight: 0.15 },
    { monthOffset: 1, weight: 0.25 },
    { monthOffset: 2, weight: 0.25 },
    { monthOffset: 3, weight: 0.20 },
    { monthOffset: 4, weight: 0.10 },
    { monthOffset: 5, weight: 0.05 },
];
const zeroPorGrupo = () => Object.fromEntries(GRUPOS.map((g) => [g, 0]));
function calcular(input, options = {}) {
    const diag = [];
    if (input.engineVersion !== tipos_1.ENGINE_VERSION) {
        diag.push({
            severity: "blocker", code: "VERSAO_MOTOR_DIVERGENTE",
            message: `A entrada declara ${input.engineVersion || "versão ausente"}, mas este cálculo ` +
                `usa ${tipos_1.ENGINE_VERSION}. Recrie o snapshot de entrada antes de publicar o resultado.`,
            context: { inputEngineVersion: input.engineVersion, runningEngineVersion: tipos_1.ENGINE_VERSION },
        });
    }
    if (!input.discountRateDeclared) {
        diag.push({
            severity: "blocker",
            code: "TMA_NAO_DECLARADA",
            message: "A TMA ainda não foi declarada por um responsável. Valor default e racional " +
                "genérico não constituem decisão econômica; confirme taxa, natureza nominal/real " +
                "e fundamento antes de publicar.",
            context: { discountRateAa: input.discountRateAa },
        });
    }
    else if (!Number.isFinite(input.discountRateAa) || input.discountRateAa <= 0) {
        diag.push({
            severity: "blocker",
            code: "TMA_DECLARADA_INVALIDA",
            message: "TMA declarada precisa ser finita e maior que 0% a.a.; 0% permanece ausência, não decisão.",
            context: { discountRateAa: input.discountRateAa },
        });
    }
    let taxaDescontoNominalAa = input.discountRateAa;
    if (input.discountRateIsReal) {
        const inflacao = input.generalInflationAa;
        const fonte = input.generalInflationSource?.trim() ?? "";
        if (inflacao == null || !Number.isFinite(inflacao) || inflacao <= -100 || fonte.length < 5) {
            diag.push({
                severity: "blocker", code: "TMA_REAL_SEM_DEFLATOR",
                message: "A versão declara TMA real, mas não declara inflação geral anual e fundamento. " +
                    "O fluxo é nominal; sem esses dois campos o motor não mistura bases nem inventa deflator.",
                context: { discountRateAa: input.discountRateAa, generalInflationAa: inflacao },
            });
        }
        else {
            taxaDescontoNominalAa = ((1 + input.discountRateAa / 100) * (1 + inflacao / 100) - 1) * 100;
            diag.push({
                severity: "info", code: "TMA_REAL_CONVERTIDA_FISHER",
                message: `TMA real de ${input.discountRateAa}% e inflação geral de ${inflacao}% resultam em ` +
                    `TMA nominal de ${round2(taxaDescontoNominalAa)}% a.a. pela relação de Fisher.`,
                context: { source: fonte, nominalRateAa: taxaDescontoNominalAa },
            });
        }
    }
    const horizonteValido = Number.isFinite(input.horizonMonths) && input.horizonMonths >= 1;
    const horizonteDeclarado = horizonteValido ? Math.trunc(input.horizonMonths) : 1;
    if (!horizonteValido) {
        diag.push({
            severity: "blocker", code: "HORIZONTE_INVALIDO",
            message: "O horizonte precisa ser um número finito maior ou igual a um mês.",
            context: { horizonMonths: input.horizonMonths },
        });
    }
    const cen = input.scenario ?? {};
    const temVendaEstoque = input.revenues.some((revenue) => (revenue.kind === "unit_sale" || revenue.kind === "lot_sale")
        && valorBrutoReceita(revenue, cen.pricePct ?? 0) > 0);
    const temReceitaNaoEstoque = input.revenues.some((revenue) => revenue.kind !== "unit_sale" && revenue.kind !== "lot_sale"
        && (valorBrutoReceita(revenue, cen.pricePct ?? 0) > 0
            || (revenue.kind === "rent" && (revenue.monthlyRentBrl ?? 0) > 0)));
    if (temVendaEstoque && temReceitaNaoEstoque) {
        diag.push({
            severity: "blocker",
            code: "RECEITA_HIBRIDA_COORTE_NAO_ATESTADA",
            message: "A versão combina venda de estoque e receita não-estoque. O contrato atual " +
                "não permite selar essa alocação por linha apenas pelo total agregado; separe " +
                "os estudos ou aguarde o atestado verificável de motor para produto híbrido.",
            context: { revenueKinds: [...new Set(input.revenues.map((revenue) => revenue.kind))] },
        });
    }
    const horizonteNecessario = horizonteNecessarioDoInput(input);
    const H = Math.min(MAX_HORIZON_MONTHS, Math.max(horizonteDeclarado, horizonteNecessario));
    // Bases unitárias incompletas não podem degradar para zero silenciosamente. Um zero
    // explícito pode ser uma declaração econômica; `null`/ausência é outra coisa: custo
    // desconhecido. `valorDoUso` continua totalizando de modo defensivo, mas o blocker
    // impede que o resultado seja promovido como estudo íntegro.
    for (const use of input.uses) {
        if (!["qty_unit", "per_unit", "per_area", "cub_x_area"].includes(use.basis))
            continue;
        if (use.qty == null || !Number.isFinite(use.qty)
            || use.unitPriceBrl == null || !Number.isFinite(use.unitPriceBrl)) {
            diag.push({
                severity: "blocker",
                code: "USO_UNITARIO_INCOMPLETO",
                message: `A linha "${use.label}" usa ${use.basis}, mas não declara quantidade e preço ` +
                    "unitário finitos. Ausência de preço não é custo zero; vincule a composição " +
                    "ou declare uma âncora antes de publicar.",
                context: { useId: use.id, basis: use.basis, qty: use.qty, unitPriceBrl: use.unitPriceBrl },
            });
        }
    }
    if (horizonteNecessario > MAX_HORIZON_MONTHS) {
        diag.push({
            severity: "blocker", code: "HORIZONTE_EXCEDE_LIMITE_MOTOR",
            message: `O fluxo exige ${horizonteNecessario} meses, acima do limite defensivo de ` +
                `${MAX_HORIZON_MONTHS}. Reveja datas e prazos antes de calcular: o motor não ` +
                `publica uma cauda parcialmente truncada.`,
            context: { requiredMonths: horizonteNecessario, engineLimitMonths: MAX_HORIZON_MONTHS },
        });
    }
    // ─── 1. RECEITA BRUTA E CRONOGRAMA DE VENDA ────────────────────────────────
    // Antes de qualquer conta: as curvas de índice dizem o que são.
    //
    // Uma série que termina antes da data-base do estudo NÃO tem mês realizado — tudo é
    // projeção, e quem lê precisa saber disso antes de tratar o número como fato. Pior:
    // série sem inclinação apurável fica plana, e correção plana é a mesma coisa que
    // nenhuma correção, com a aparência de estar aplicada.
    for (const [codigo, curva] of Object.entries(input.indices)) {
        if (curva.realizedUntilMonth < 0) {
            diag.push({
                severity: "info", code: "INDICE_TODO_PROJETADO",
                message: curva.projectionAa == null
                    ? `A série de ${codigo} termina antes da data-base e não permitiu apurar tendência — a correção ficou PLANA, ou seja, sem efeito. Declare uma projeção ou reveja a data-base.`
                    : `A série de ${codigo} termina antes da data-base: todo o horizonte é projeção, a ${curva.projectionAa.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% a.a. pela tendência observada.`,
                context: { indexCode: codigo, projectionAa: curva.projectionAa },
            });
        }
        if (curva.projectionAa == null && curva.realizedUntilMonth < H - 1) {
            diag.push({
                severity: "warning", code: "INDICE_SEM_PROJECAO",
                message: `${codigo} tem dado realizado só até o mês ${curva.realizedUntilMonth}; do mês seguinte em diante o valor fica congelado, sem correção.`,
                context: { indexCode: codigo, realizedUntilMonth: curva.realizedUntilMonth },
            });
        }
    }
    const receita = projetarReceitas(input, H, horizonteDeclarado, diag, options.includeRevenueCohorts !== false);
    const vendaPorMes = receita.vendaPorMes;
    const recebidoPorMes = receita.recebidoPorMes;
    const receitaBrutaTotal = receita.receitaBrutaTotal;
    const receitaRecebidaTotal = recebidoPorMes.reduce((s, x) => s + x, 0);
    const receitaBrutaPositivaTotal = receita.vendaPositivaPorMes.reduce((s, x) => s + x, 0);
    const receitaRecebidaPositivaTotal = receita.recebidoPositivoPorMes.reduce((s, x) => s + x, 0);
    const escoposReceita = validarEscoposDeReceita(input, diag);
    if (H > horizonteDeclarado) {
        diag.push({
            severity: "blocker", code: "HORIZONTE_INSUFICIENTE",
            message: `O horizonte declarado tem ${horizonteDeclarado} meses, mas compromissos e ` +
                `recebíveis exigem ${H}. A cauda foi calculada integralmente para não sumir, ` +
                `porém a versão deve ampliar o horizonte antes da aprovação.`,
            context: {
                declaredMonths: horizonteDeclarado,
                effectiveMonths: H,
                revenueTailBrl: round2(receita.receitaCaudaBrl),
            },
        });
    }
    // ─── 2. USOS ───────────────────────────────────────────────────────────────
    // Primeira passada sem as bases que dependem de total (evita autorreferência).
    const hardCostBase = somarUsos(input, ["hard_cost"], receitaBrutaTotal, 0, receitaRecebidaTotal, cen, escoposReceita.usosInvalidos, receitaBrutaPositivaTotal, receitaRecebidaPositivaTotal);
    const parcialTotal = somarUsos(input, GRUPOS.filter((g) => g !== "finance" && g !== "tax"), receitaBrutaTotal, hardCostBase, receitaRecebidaTotal, cen, escoposReceita.usosInvalidos, receitaBrutaPositivaTotal, receitaRecebidaPositivaTotal);
    const usosPorMes = new Array(H).fill(0);
    const usosPorGrupoMes = Object.fromEntries(GRUPOS.map((g) => [g, new Array(H).fill(0)]));
    for (const u of input.uses) {
        if (escoposReceita.usosInvalidos.has(u.id))
            continue;
        if (u.basis === "pct_financed") {
            // A base só existe depois do dimensionamento das fontes. Usar zero (comportamento
            // anterior) apagava tarifa/seguro financeiro sem qualquer aviso; estimar antes da
            // dívida criaria circularidade. Até existir a segunda passada, esta linha é veto.
            diag.push({
                severity: "blocker",
                code: "USO_PCT_FINANCIADO_NAO_RESOLVIDO",
                message: `A linha "${u.label}" é percentual do valor financiado, base que depende do ` +
                    "dimensionamento da dívida. O motor não a zerou nem a estimou: converta-a em " +
                    "valor/curva documentados ou implemente a reconciliação de funding.",
                context: { useId: u.id, group: u.group, pct: u.pct },
            });
            continue;
        }
        const total = valorDoUso(u, {
            receitaBruta: receitaBrutaTotal,
            receitaBrutaPositiva: receitaBrutaPositivaTotal,
            hardCost: hardCostBase,
            custoTotal: parcialTotal,
            terreno: somarUsos(input, ["land"], receitaBrutaTotal, hardCostBase, receitaRecebidaTotal, cen, escoposReceita.usosInvalidos),
            recebido: receitaRecebidaTotal,
            recebidoPositivo: receitaRecebidaPositivaTotal,
            financiado: 0,
            area: input.product.builtAreaM2 ?? 0,
            unidades: input.product.units ?? 0,
            cen,
        });
        if (total === 0)
            continue;
        const curvaManualUso = u.distribution === "manual" ? vetorManualValido(u.curve) : comoVetor(u.curve);
        if (u.distribution === "manual" && !curvaManualUso) {
            diag.push({
                severity: "blocker", code: "CURVA_MANUAL_USO_AUSENTE",
                message: `A linha de uso "${u.label}" declara distribuição manual, mas não possui ` +
                    "uma curva válida com pesos não negativos. A linha não foi convertida em linear.",
                context: { useId: u.id },
            });
            continue;
        }
        const atraso = inteiroNaoNegativo(cen.scheduleDelayMonths ?? 0);
        const serie = (0, curvas_1.espalhar)(total, inteiroNaoNegativo(u.startMonth) + (u.group === "hard_cost" ? atraso : 0), duracaoSegura(u.durationMonths), H, u.distribution, {
            skew: u.curve?.skew,
            manual: curvaManualUso ?? undefined,
            phaseCurve: u.phaseCurve ?? undefined,
        });
        const curva = u.indexCode ? input.indices[u.indexCode] : undefined;
        if (u.indexCode && !curva) {
            diag.push({
                severity: "warning", code: "INDICE_AUSENTE",
                message: `A linha "${u.label}" pede o índice ${u.indexCode}, que não está carregado — o valor ficou na data-base, sem correção.`,
                context: { useId: u.id, indexCode: u.indexCode },
            });
        }
        for (let m = 0; m < H; m++) {
            const fatorBase = u.indexRegime === "none" ? 1 : (0, curvas_1.fatorIndice)(curva, m);
            const corrigido = serie[m] * fatorBase * fatorCenarioIndice(cen.indexAa, m);
            usosPorMes[m] += corrigido;
            usosPorGrupoMes[u.group][m] += corrigido;
        }
        const fim = u.startMonth + u.durationMonths;
        if (fim > H) {
            diag.push({
                severity: "warning", code: "USO_ALEM_DO_HORIZONTE",
                message: `"${u.label}" termina no mês ${fim}, além do horizonte de ${H} meses — a parte excedente não entrou no fluxo.`,
                context: { useId: u.id },
            });
        }
    }
    const encargosPorLinha = projetarEncargosPorLinha(input, receita, escoposReceita, H, diag);
    for (let m = 0; m < H; m++) {
        usosPorMes[m] += encargosPorLinha.comissaoPorMes[m];
        usosPorGrupoMes.sales[m] += encargosPorLinha.comissaoPorMes[m];
    }
    // ─── 4. TRIBUTO ────────────────────────────────────────────────────────────
    const tributoPorMes = [...encargosPorLinha.tributoPorMes];
    if (escoposReceita.tributoGlobalValido && input.tax && input.tax.effectiveRatePct > 0) {
        const aliq = (input.tax.effectiveRatePct + (input.tax.contingencyRatePct ?? 0)) / 100;
        for (let m = 0; m < H; m++) {
            // RET incide sobre a receita EFETIVAMENTE RECEBIDA. Usar o vendido antecipa
            // imposto que a lei não cobra ainda — e distorce o caixa justamente no pico.
            const base = input.tax.basis === "received" ? recebidoPorMes[m] : vendaPorMes[m];
            const basePositiva = input.tax.basis === "received"
                ? receita.recebidoPositivoPorMes[m]
                : receita.vendaPositivaPorMes[m];
            const incidencia = input.tax.cancellationTreatment === "no_credit" ? basePositiva : base;
            tributoPorMes[m] += incidencia * aliq;
        }
    }
    for (let m = 0; m < H; m++)
        usosPorGrupoMes.tax[m] += tributoPorMes[m];
    // ─── 5. FONTES ─────────────────────────────────────────────────────────────
    const custoTotalSemFinanceiro = GRUPOS
        .filter((g) => g !== "finance")
        .reduce((total, g) => total + usosPorGrupoMes[g].reduce((s, x) => s + x, 0), 0);
    const saquesPorMes = new Array(H).fill(0);
    const saquesDividaElegivelPorMes = new Array(H).fill(0);
    const equityPorMes = new Array(H).fill(0);
    /** Juro pago governa caixa; juro apropriado governa custo econômico e DRE. */
    const jurosPagosPorMes = new Array(H).fill(0);
    const jurosAcruadosPorMes = new Array(H).fill(0);
    const servicoPorMes = new Array(H).fill(0);
    const saldoDividaPorMes = new Array(H).fill(0);
    /** Fontes que entram com o que faltar, na ordem de prioridade (§16.9). */
    const sobDemanda = [];
    for (const s of input.sources) {
        if (s.status === "expired" || s.status === "cancelled") {
            diag.push({
                severity: "warning", code: "FONTE_INDISPONIVEL",
                message: `A fonte "${s.label}" está ${s.status === "expired" ? "expirada" : "cancelada"} e não entrou no caixa.`,
                context: { sourceId: s.id, status: s.status },
            });
            continue;
        }
        if (s.kind === "bank_mortgage_transfer") {
            // Repasse PF é liquidação do saldo do comprador e já nasce como evento da
            // coorte de receita. Tratá-lo também como principal da SPE duplica entrada e cria
            // uma dívida que juridicamente pertence ao adquirente.
            diag.push({
                severity: "blocker", code: "REPASSE_PF_NAO_E_DIVIDA_DA_SPE",
                message: `A fonte "${s.label}" foi declarada como repasse/financiamento PF. Modele esse ` +
                    "valor exclusivamente no componente repasse do plano de pagamento; ele não " +
                    "pode entrar uma segunda vez como dívida da SPE.",
                context: { sourceId: s.id, kind: s.kind },
            });
            continue;
        }
        if (s.kind === "barter") {
            if (s.barterMode === "physical") {
                diag.push({
                    severity: "info", code: "PERMUTA_FISICA_SEM_CAIXA",
                    message: `A permuta física "${s.label}" não entrou como funding. Suas unidades devem ` +
                        "ser conciliadas no mix e excluídas do VGV do incorporador.",
                    context: { sourceId: s.id, barterPctVgv: s.barterPctVgv },
                });
            }
            else {
                diag.push({
                    severity: "blocker", code: "PERMUTA_FINANCEIRA_COMO_FONTE",
                    message: `A permuta "${s.label}" é ${s.barterMode ?? "sem modalidade"}. A parcela ` +
                        "financeira é pagamento do terreno e precisa ser uma linha de uso datada; " +
                        "tratá-la como fonte superestima o caixa.",
                    context: { sourceId: s.id, barterMode: s.barterMode },
                });
            }
            continue;
        }
        const disponivel = limiteDaFonte(s, {
            hardCost: hardCostBase,
            custoTotal: custoTotalSemFinanceiro,
            receitaBruta: receitaBrutaTotal,
            terreno: somarUsos(input, ["land"], receitaBrutaTotal, hardCostBase, receitaRecebidaTotal, cen, escoposReceita.usosInvalidos, receitaBrutaPositivaTotal, receitaRecebidaPositivaTotal),
        }, diag);
        if (disponivel <= 0)
            continue;
        if (s.drawDistribution === "on_demand") {
            if (s.kind === "equity_own" || s.kind === "equity_partner") {
                sobDemanda.push({ fonte: s, teto: disponivel });
                continue;
            }
            // Dívida sob demanda exigiria recalcular a agenda de juros a cada saque, e um
            // juro aproximado num estudo que decide obra é pior que uma curva declarada.
            diag.push({
                severity: "warning", code: "SOB_DEMANDA_SO_EQUITY",
                message: `"${s.label}" pediu saque sob demanda, que por ora vale só para capital próprio — declare a curva de saque desta fonte. Ela foi tratada como linear.`,
                context: { sourceId: s.id, kind: s.kind },
            });
        }
        const curvaManualFonte = s.drawDistribution === "manual"
            ? vetorManualValido(s.drawCurve)
            : comoVetor(s.drawCurve);
        if (s.drawDistribution === "manual" && !curvaManualFonte) {
            diag.push({
                severity: "blocker", code: "CURVA_MANUAL_FONTE_AUSENTE",
                message: `A fonte "${s.label}" declara saque manual, mas não possui curva válida. ` +
                    "O principal não foi liberado linearmente por aproximação.",
                context: { sourceId: s.id },
            });
            continue;
        }
        const serie = (0, curvas_1.espalhar)(disponivel, inteiroNaoNegativo(s.startMonth), duracaoSegura(s.durationMonths), H, s.drawDistribution === "on_demand" ? "linear" : s.drawDistribution, { manual: curvaManualFonte ?? undefined });
        if (ehDivida(s.kind)) {
            if (s.amortization === "cash_sweep" || s.amortization === "custom") {
                diag.push({
                    severity: "blocker", code: "AMORTIZACAO_NAO_MODELADA",
                    message: `A fonte "${s.label}" usa ${s.amortization}. Esse contrato depende de uma ` +
                        "política própria de caixa/amortização; substituí-lo silenciosamente por SAC " +
                        "alteraria juros, saldo devedor e retorno.",
                    context: { sourceId: s.id, amortization: s.amortization },
                });
                continue;
            }
            const taxaAa = new Array(H).fill(0).map((_, m) => {
                const base = s.fixedRateAa ?? 0;
                const idx = s.indexCode ? input.indices[s.indexCode] : undefined;
                // Indexador entra como variação do fator no mês, anualizada.
                const varIdx = idx && m > 0
                    ? ((0, curvas_1.fatorIndice)(idx, m) / (0, curvas_1.fatorIndice)(idx, m - 1) - 1) * 12 * 100
                    : 0;
                return base + (s.spreadAa ?? 0) + varIdx + (cen.interestAa ?? 0);
            });
            const agenda = (0, financeiro_1.agendaDivida)({
                principalPorMes: serie,
                taxaAaPorMes: taxaAa,
                graceMonths: s.graceMonths ?? 0,
                termMonths: s.termMonths ?? Math.max(1, H - s.startMonth),
                amortization: s.amortization ?? "sac",
                capitalizeInterest: s.capitalizeInterest,
                horizonMonths: H,
                startMonth: s.startMonth,
            });
            const elegivelParaLtc = fonteElegivelParaLtc(s);
            if (!elegivelParaLtc) {
                diag.push({
                    severity: "info", code: "FONTE_FORA_DO_LTC",
                    message: `A dívida "${s.label}" está no estado ${s.status} e foi mantida no cenário ` +
                        "de funding, mas não no numerador do LTC elegível.",
                    context: { sourceId: s.id, status: s.status },
                });
            }
            for (let m = 0; m < H; m++) {
                saquesPorMes[m] += serie[m];
                if (elegivelParaLtc)
                    saquesDividaElegivelPorMes[m] += serie[m];
                jurosPagosPorMes[m] += agenda[m].juros;
                jurosAcruadosPorMes[m] += agenda[m].jurosAcruado;
                servicoPorMes[m] += agenda[m].juros + agenda[m].amortizacao;
                saldoDividaPorMes[m] += agenda[m].saldo;
                usosPorGrupoMes.finance[m] += agenda[m].jurosAcruado;
            }
        }
        else if (s.kind === "equity_own" || s.kind === "equity_partner") {
            for (let m = 0; m < H; m++)
                equityPorMes[m] += serie[m];
        }
        else if (s.kind === "presales") {
            // Pré-venda já está no recebimento: contá-la de novo como fonte dobraria a receita.
            diag.push({
                severity: "info", code: "PRESALES_JA_NO_RECEBIMENTO",
                message: `A fonte "${s.label}" é pré-venda e já entra pelo recebimento das vendas; não foi somada duas vezes.`,
                context: { sourceId: s.id },
            });
        }
        else {
            for (let m = 0; m < H; m++)
                saquesPorMes[m] += serie[m];
        }
    }
    // ─── 5b. APORTE SOB DEMANDA ────────────────────────────────────────────────
    //
    // O capital próprio é o TAMPÃO do fluxo, não mais um cronograma para alguém
    // adivinhar. Aqui ele entra com exatamente o que falta em cada mês, na ordem de
    // prioridade e até o limite comprometido de cada sócio — e o que sobrar de buraco
    // continua aparecendo como funding faltante, porque essa é a pergunta que o estudo
    // existe para responder.
    //
    // Uma passada só, do mês 0 ao fim: o dinheiro aportado num mês fica em caixa e
    // reduz a necessidade dos meses seguintes por construção.
    const minCash = input.minCashBrl ?? 0;
    if (sobDemanda.length) {
        const restante = sobDemanda
            .slice()
            .sort((a, b) => a.fonte.priority - b.fonte.priority)
            .map((x) => ({ ...x, saldo: x.teto }));
        let caixa = 0;
        for (let m = 0; m < H; m++) {
            const entradas = recebidoPorMes[m] + saquesPorMes[m] + equityPorMes[m];
            const saidas = usosPorMes[m] + tributoPorMes[m] + jurosPagosPorMes[m]
                + (servicoPorMes[m] - jurosPagosPorMes[m]);
            let previsto = caixa + entradas - saidas;
            if (previsto < minCash) {
                let falta = minCash - previsto;
                for (const fonte of restante) {
                    if (falta <= 0.005)
                        break;
                    if (fonte.saldo <= 0 || m < fonte.fonte.startMonth)
                        continue;
                    const aporte = Math.min(falta, fonte.saldo);
                    fonte.saldo -= aporte;
                    falta -= aporte;
                    equityPorMes[m] += aporte;
                    previsto += aporte;
                }
            }
            caixa = previsto;
        }
        for (const fonte of restante) {
            if (fonte.saldo > 0.01 && fonte.saldo < fonte.teto) {
                diag.push({
                    severity: "info", code: "APORTE_PARCIAL",
                    message: `De "${fonte.fonte.label}" foram necessários ${brl(fonte.teto - fonte.saldo)} dos ${brl(fonte.teto)} comprometidos.`,
                    context: { sourceId: fonte.fonte.id, usado: fonte.teto - fonte.saldo },
                });
            }
        }
    }
    // ─── 6. FLUXO MENSAL ───────────────────────────────────────────────────────
    const cashflow = [];
    let saldo = 0;
    let saldoPreFunding = 0;
    const saldosPreFunding = [];
    const custosProjetoPorMes = new Array(H).fill(0).map((_, m) => GRUPOS
        .filter((g) => g !== "finance")
        .reduce((s, g) => s + usosPorGrupoMes[g][m], 0));
    for (let m = 0; m < H; m++) {
        // Caixa usa juro PAGO. O apropriado fica na DRE e no custo total, inclusive
        // quando capitalizado; somar o apropriado aqui cobraria o mesmo juro duas vezes.
        const usos = usosPorMes[m] + tributoPorMes[m] + jurosPagosPorMes[m];
        const abertura = saldo;
        const entradas = recebidoPorMes[m] + saquesPorMes[m] + equityPorMes[m];
        const saidas = usos + (servicoPorMes[m] - jurosPagosPorMes[m]); // amortização
        saldo = abertura + entradas - saidas;
        // Exposição é a necessidade operacional ANTES de funding. Dívida, subsídio e
        // equity não podem apagar o tamanho do cheque que o empreendimento exige.
        saldoPreFunding += recebidoPorMes[m] - custosProjetoPorMes[m];
        saldosPreFunding.push(saldoPreFunding);
        const gap = saldo < minCash ? minCash - saldo : 0;
        const porGrupo = zeroPorGrupo();
        for (const g of GRUPOS)
            porGrupo[g] = round2(usosPorGrupoMes[g][m]);
        cashflow.push({
            monthIndex: m,
            competencyMonth: (0, curvas_1.mesCompetencia)(input.baseDate, m),
            usesBrl: round2(usos),
            usesByGroup: porGrupo,
            revenueBrl: round2(vendaPorMes[m]),
            revenueReceivedBrl: round2(recebidoPorMes[m]),
            taxBrl: round2(tributoPorMes[m]),
            drawsBrl: round2(saquesPorMes[m]),
            debtServiceBrl: round2(servicoPorMes[m]),
            interestBrl: round2(jurosPagosPorMes[m]),
            equityInBrl: round2(equityPorMes[m]),
            distributionsBrl: 0,
            openingBalanceBrl: round2(abertura),
            closingBalanceBrl: round2(saldo),
            fundingGapBrl: round2(gap),
            netExposureBrl: round2(saldoPreFunding < 0 ? -saldoPreFunding : 0),
            debtBalanceBrl: round2(saldoDividaPorMes[m]),
        });
    }
    const mesesComGap = cashflow.filter((c) => c.fundingGapBrl > 0.01).length;
    const maiorGap = cashflow.reduce((mx, c) => Math.max(mx, c.fundingGapBrl), 0);
    if (mesesComGap > 0) {
        const primeiro = cashflow.find((c) => c.fundingGapBrl > 0.01);
        diag.push({
            severity: "blocker", code: "CAIXA_DESCOBERTO",
            message: `O caixa fica descoberto em ${mesesComGap} ${mesesComGap === 1 ? "mês" : "meses"}; o primeiro é ${primeiro.competencyMonth.slice(0, 7)}, faltando ${brl(primeiro.fundingGapBrl)}.`,
            context: { monthsWithGap: mesesComGap, firstMonth: primeiro.monthIndex },
        });
    }
    // ─── 7. INDICADORES ────────────────────────────────────────────────────────
    const totalUsos = GRUPOS.reduce((total, g) => total + usosPorGrupoMes[g].reduce((s, x) => s + x, 0), 0);
    const totalTributo = usosPorGrupoMes.tax.reduce((s, x) => s + x, 0);
    const totalJuros = jurosAcruadosPorMes.reduce((s, x) => s + x, 0);
    const totalJurosPagos = jurosPagosPorMes.reduce((s, x) => s + x, 0);
    const custoTotal = totalUsos;
    const lucro = receitaRecebidaTotal - custoTotal;
    if (totalJuros - totalJurosPagos > 0.01) {
        diag.push({
            severity: "info", code: "JUROS_CAPITALIZADOS_APROPRIADOS",
            message: `${brl(totalJuros - totalJurosPagos)} de juros foram capitalizados: não saíram ` +
                "no mês, mas entraram integralmente no custo financeiro, lucro e DRE.",
            context: { accruedInterestBrl: totalJuros, paidInterestBrl: totalJurosPagos },
        });
    }
    // Fluxo do PROJETO (desalavancado): receita recebida menos usos, sem dívida.
    const fluxoProjeto = cashflow.map((c, m) => c.revenueReceivedBrl - custosProjetoPorMes[m]);
    // Fluxo do EQUITY (alavancado): o que o dono põe e o que sobra depois da dívida.
    const fluxoEquity = cashflow.map((c, m) => c.revenueReceivedBrl - (usosPorMes[m] + tributoPorMes[m] + jurosPagosPorMes[m])
        - (servicoPorMes[m] - jurosPagosPorMes[m])
        + c.drawsBrl - c.equityInBrl);
    const tirProjeto = (0, financeiro_1.tir)(fluxoProjeto);
    const tirEquity = (0, financeiro_1.tir)(fluxoEquity);
    const exposicao = (0, financeiro_1.exposicaoMaxima)(saldosPreFunding);
    const equityTotal = equityPorMes.reduce((s, x) => s + x, 0);
    if (tirProjeto.motivo === "multiplas_raizes") {
        diag.push({
            severity: "warning", code: "TIR_MULTIPLA",
            message: `O fluxo do projeto troca de sinal mais de uma vez e admite ${tirProjeto.raizes?.length} taxas internas — use a MTIR, que é única.`,
            context: { raizes: tirProjeto.raizes },
        });
    }
    const ind = [
        num("npv_project", "VPL do projeto", (0, financeiro_1.vpl)(fluxoProjeto, taxaDescontoNominalAa), "BRL", "Σ fluxo_t / (1+TMA)^t, fluxo desalavancado, TMA declarada na versão", "project", { min: 0, source: "NBR 14653-4 §8.3.1", band: (v) => (v > 0 ? "ok" : "critical") }),
        num("irr_project", "TIR do projeto", tirProjeto.aa, "%aa", "Taxa que zera o VPL do fluxo desalavancado; anualizada por composição", "project", { min: 15, max: 25, source: "prática de development — não normativo" }),
        num("mirr_project", "MTIR do projeto", (0, financeiro_1.mtir)(fluxoProjeto, taxaDescontoNominalAa, taxaDescontoNominalAa), "%aa", "TIR modificada: reinveste positivos e financia negativos à TMA; sempre única", "project"),
        num("irr_equity", "TIR do equity", tirEquity.aa, "%aa", "Taxa que zera o VPL do fluxo do acionista, já deduzida a dívida", "equity", { min: 15, max: 30, source: "prática de mercado" }),
        num("profit", "Lucro", lucro, "BRL", "Receita recebida no horizonte menos custo total, incluindo tributo e juros", "project"),
        num("margin_on_revenue", "Margem sobre receita", receitaRecebidaTotal > 0 ? (lucro / receitaRecebidaTotal) * 100 : null, "%", "Lucro ÷ receita recebida", "project", { min: 10, max: 20, source: "prática BR", band: (v) => (v < 8 ? "critical" : v < 10 ? "attention" : "ok") }),
        num("profit_on_cost", "Margem sobre custo", custoTotal > 0 ? (lucro / custoTotal) * 100 : null, "%", "Lucro ÷ custo total (development margin do ARGUS)", "project"),
        num("max_cash_exposure", "Exposição máxima de caixa", exposicao.valor, "BRL", "Maior necessidade operacional acumulada antes de dívida, subsídio e equity", "project", { source: "Sienge; NBR 14653-4 análise dinâmica" }),
        num("roi_on_exposure", "ROI sobre exposição", exposicao.valor > 0 ? (lucro / exposicao.valor) * 100 : null, "%", "Lucro ÷ exposição máxima de caixa", "project", { min: 80, max: 150, source: "urbe.me — bandas de rating" }),
        num("payback_month", "Payback", (0, financeiro_1.payback)(fluxoProjeto), "mês", "Primeiro mês em que o fluxo acumulado do projeto deixa de ser negativo", "project", { source: "NBR 14653-4 §8.3.3" }),
        num("profitability_index", "Índice de lucratividade", indiceLucratividade(fluxoProjeto, taxaDescontoNominalAa), "x", "VP das entradas ÷ VP das saídas", "project", { min: 1, source: "NBR 14653-4 §8.3.4", band: (v) => (v > 1 ? "ok" : "critical") }),
        num("total_cost", "Custo total", custoTotal, "BRL", "Soma de todos os usos no horizonte, incluindo tributo e juros", "project"),
        num("gross_revenue", "Receita bruta (VGV)", receitaBrutaTotal, "BRL", "Soma do valor bruto de todas as linhas de receita", "project"),
        num("received_revenue", "Receita recebida", receitaRecebidaTotal, "BRL", "Soma do que entra em caixa no horizonte, após inadimplência e distrato", "project"),
        num("cost_over_revenue", "Custo ÷ VGV", receitaBrutaTotal > 0 ? (custoTotal / receitaBrutaTotal) * 100 : null, "%", "Custo total ÷ receita bruta", "project", { max: 90, source: "prática BR — fontes divergem, ver §21 do SPEC-VIAB-001" }),
        num("peak_equity", "Aporte total de equity", equityTotal, "BRL", "Total aportado pelos sócios no horizonte", "equity"),
        num("ltc", "LTC elegível", custoTotalSemFinanceiro > 0
            ? (saquesDividaElegivelPorMes.reduce((s, x) => s + x, 0) / custoTotalSemFinanceiro) * 100 : null, "%", "Dívida de projeto aprovada/comprometida/disponível/sacada ÷ custo antes do financiamento", "equity"),
        // MÁXIMO, nunca soma. O saldo negativo é carregado adiante: somar o déficit de
        // cada mês conta o MESMO buraco tantas vezes quantos meses ele durar. Um furo de
        // R$ 500 mil que dura nove meses viraria R$ 4,5 milhões de "funding faltante" —
        // e superestimar a necessidade de capital mata projeto viável tanto quanto
        // subestimar. O que falta é o pico: o cheque que zera o pior mês zera todos.
        num("funding_gap", "Funding faltante", maiorGap, "BRL", "Maior déficit de caixa do horizonte — o capital adicional que falta para o fluxo fechar. Qualquer valor > 0 veta a aprovação", "project", { band: (v) => (v > 0.01 ? "critical" : "ok") }),
    ];
    // Margem Barch no modo obra contratada: a variável de decisão daquele negócio.
    if (input.businessModel === "contracted_work") {
        ind.push(num("barch_margin_on_contract", "Margem Barch sobre contrato", receitaBrutaTotal > 0 ? (lucro / receitaBrutaTotal) * 100 : null, "%", "(Contrato − custo total − tributo) ÷ contrato", "barch", { source: "política Barch (MAN-008) — limiar interno a definir" }));
    }
    // ─── Retorno por sócio ─────────────────────────────────────────────────────
    const partnerReturns = retornoPorSocio(input, cashflow, lucro, diag);
    const totals = {
        usesBrl: round2(totalUsos),
        usesByGroup: Object.fromEntries(GRUPOS.map((g) => [g, round2(usosPorGrupoMes[g].reduce((s, x) => s + x, 0))])),
        revenueGrossBrl: round2(receitaBrutaTotal),
        revenueReceivedBrl: round2(receitaRecebidaTotal),
        taxBrl: round2(totalTributo),
        interestBrl: round2(totalJuros),
        profitBrl: round2(lucro),
        peakExposureBrl: round2(exposicao.valor),
        peakExposureMonth: exposicao.mes,
        fundingGapBrl: round2(maiorGap),
        monthsWithGap: mesesComGap,
        declaredHorizonMonths: horizonteDeclarado,
        effectiveHorizonMonths: H,
        revenueTailBrl: round2(receita.receitaCaudaBrl),
        cancellationLiabilityBrl: round2(receita.passivoDistratoBrl),
        returnedInventoryBrl: round2(receita.estoqueRetornadoBrl),
    };
    return {
        engineVersion: tipos_1.ENGINE_VERSION,
        inputHash: (0, financeiro_1.hashEstavel)(input),
        cashflow,
        revenueCohorts: receita.coortes,
        revenueLineProjections: options.includeRevenueCohorts === false
            ? []
            : receita.linhas.map((linha) => ({
                revenueId: linha.revenueId,
                contractEvents: linha.vendaPorMes.flatMap((amountBrl, monthIndex) => Math.abs(amountBrl) > 0.0000005
                    ? [{ monthIndex, amountBrl: round6(amountBrl) }]
                    : []),
                cashEvents: linha.recebidoPorMes.flatMap((amountBrl, monthIndex) => Math.abs(amountBrl) > 0.0000005
                    ? [{ monthIndex, amountBrl: round6(amountBrl) }]
                    : []),
            })),
        indicators: ind,
        partnerReturns,
        diagnostics: diag,
        totals,
    };
}
/**
 * Preserva a coorte mensal de cada revenue_id. Rodar o projetor canônico uma vez por
 * linha evita reimplementar plano de pagamento, distrato, repasse e índices numa
 * segunda fórmula para comissão/tributo.
 */
function projetarReceitas(input, horizonMonths, declaredHorizonMonths, diag, includeCohorts) {
    const vendaPorMes = new Array(horizonMonths).fill(0);
    const recebidoPorMes = new Array(horizonMonths).fill(0);
    const vendaPositivaPorMes = new Array(horizonMonths).fill(0);
    const recebidoPositivoPorMes = new Array(horizonMonths).fill(0);
    const linhas = [];
    const coortes = [];
    let passivoDistratoBrl = 0;
    let estoqueRetornadoBrl = 0;
    for (const revenue of input.revenues) {
        const linha = projetarReceitasSemDetalhe({ ...input, revenues: [revenue] }, horizonMonths, declaredHorizonMonths, diag, includeCohorts);
        linhas.push({
            revenueId: revenue.id,
            vendaPorMes: linha.vendaPorMes,
            recebidoPorMes: linha.recebidoPorMes,
            vendaPositivaPorMes: linha.vendaPositivaPorMes,
            recebidoPositivoPorMes: linha.recebidoPositivoPorMes,
        });
        coortes.push(...conciliarUnidadesProjetadas(revenue, linha.coortes));
        for (let m = 0; m < horizonMonths; m++) {
            vendaPorMes[m] += linha.vendaPorMes[m];
            recebidoPorMes[m] += linha.recebidoPorMes[m];
            vendaPositivaPorMes[m] += linha.vendaPositivaPorMes[m];
            recebidoPositivoPorMes[m] += linha.recebidoPositivoPorMes[m];
        }
        passivoDistratoBrl += linha.passivoDistratoBrl;
        estoqueRetornadoBrl += linha.estoqueRetornadoBrl;
    }
    return {
        vendaPorMes,
        recebidoPorMes,
        vendaPositivaPorMes,
        recebidoPositivoPorMes,
        linhas,
        coortes,
        receitaBrutaTotal: vendaPorMes.reduce((s, x) => s + x, 0),
        receitaCaudaBrl: recebidoPorMes
            .slice(declaredHorizonMonths)
            .reduce((s, x) => s + Math.max(0, x), 0),
        passivoDistratoBrl,
        estoqueRetornadoBrl,
    };
}
/**
 * O payload persistido usa seis casas para unidades. Em horizontes longos, arredondar
 * cada coorte isoladamente acumula resíduo (por exemplo, 1 unidade / 1.200 meses).
 * O true-up fica na última coorte da linha e não altera nenhum valor financeiro.
 */
function conciliarUnidadesProjetadas(revenue, cohorts) {
    if (revenue.units == null
        || !Number.isFinite(revenue.units)
        || revenue.units <= 0
        || cohorts.length === 0)
        return cohorts;
    const withUnits = cohorts
        .map((cohort, index) => ({ cohort, index }))
        .filter(({ cohort }) => cohort.projectedUnits != null);
    if (withUnits.length === 0)
        return cohorts;
    const target = round6(revenue.units);
    const current = round6(withUnits.reduce((sum, { cohort }) => sum + (cohort.projectedUnits ?? 0), 0));
    const difference = round6(target - current);
    if (Math.abs(difference) < 0.0000005)
        return cohorts;
    // A última coorte é o true-up temporal auditável. Se um caso patológico tornasse
    // seu saldo não positivo, a maior coorte absorve o resíduo sem criar unidade falsa.
    const last = withUnits.at(-1);
    const lastAdjusted = round6((last.cohort.projectedUnits ?? 0) + difference);
    const chosen = lastAdjusted > 0
        ? last
        : withUnits.reduce((largest, candidate) => (candidate.cohort.projectedUnits ?? 0) > (largest.cohort.projectedUnits ?? 0)
            ? candidate
            : largest);
    const adjusted = round6((chosen.cohort.projectedUnits ?? 0) + difference);
    if (!(adjusted > 0))
        return cohorts;
    return cohorts.map((cohort, index) => index === chosen.index
        ? { ...cohort, projectedUnits: adjusted }
        : cohort);
}
/** Venda de estoque só vira caixa com a mecânica de recebimento declarada. */
function exigePlanoDePagamento(r) {
    return r.kind === "unit_sale" || r.kind === "lot_sale";
}
/**
 * Descobre a última competência antes de alocar qualquer vetor. O horizonte deixa de
 * ser uma tesoura: quando a versão é curta, o motor amplia a memória, calcula a cauda
 * e emite blocker para que a versão seja corrigida antes de aprovar.
 */
function horizonteNecessarioDoInput(input) {
    const declarado = duracaoSegura(input.horizonMonths);
    const cen = input.scenario ?? {};
    let ultimoMes = declarado - 1;
    for (const u of input.uses) {
        const atraso = u.group === "hard_cost"
            ? inteiroNaoNegativo(cen.scheduleDelayMonths ?? 0)
            : 0;
        ultimoMes = Math.max(ultimoMes, inteiroNaoNegativo(u.startMonth) + atraso + duracaoSegura(u.durationMonths) - 1);
    }
    for (const s of input.sources) {
        const inicio = inteiroNaoNegativo(s.startMonth);
        ultimoMes = Math.max(ultimoMes, inicio + duracaoSegura(s.durationMonths) - 1);
        if (ehDivida(s.kind)) {
            ultimoMes = Math.max(ultimoMes, inicio + inteiroNaoNegativo(s.graceMonths ?? 0)
                + duracaoSegura(s.termMonths ?? declarado - inicio) - 1);
        }
    }
    for (const r of input.revenues) {
        if (r.kind === "rent")
            continue;
        const atraso = inteiroNaoNegativo(cen.salesSpeedMonths ?? 0);
        const ultimaVenda = inteiroNaoNegativo(r.salesStartMonth)
            + duracaoSegura(r.salesDurationMonths + atraso) - 1;
        ultimoMes = Math.max(ultimoMes, ultimaVenda);
        const plano = r.paymentPlan;
        if (!plano)
            continue;
        const entrega = mesEntregaDoPlano(r, plano);
        const onda = (plano.repassePct ?? 0) > 0
            ? (plano.repasseWave?.length ? plano.repasseWave : exports.ONDA_REPASSE_PADRAO)
            : [];
        const ultimoOffsetRepasse = onda.reduce((mx, p) => Math.max(mx, inteiroNaoNegativo(p.monthOffset)), 0);
        if (entrega != null) {
            ultimoMes = Math.max(ultimoMes, entrega, entrega + ultimoOffsetRepasse);
            // Estoque vendido depois da entrega ancora o repasse na própria venda.
            if (ultimaVenda >= entrega)
                ultimoMes = Math.max(ultimoMes, ultimaVenda + ultimoOffsetRepasse);
        }
        const politica = r.cancellationPolicy;
        if ((r.cancellationRatePct ?? 0) > 0 && politica) {
            const distrato = ultimaVenda + inteiroNaoNegativo(politica.eventMonthOffset);
            ultimoMes = Math.max(ultimoMes, distrato + inteiroNaoNegativo(politica.refundDelayMonths));
            if (politica.resaleDelayMonths != null) {
                const revenda = distrato + inteiroNaoNegativo(politica.resaleDelayMonths);
                ultimoMes = Math.max(ultimoMes, revenda, revenda + ultimoOffsetRepasse + 1);
            }
        }
    }
    return ultimoMes + 1;
}
function projetarReceitasSemDetalhe(input, horizonMonths, declaredHorizonMonths, diag, includeCohorts) {
    const vendaPorMes = new Array(horizonMonths).fill(0);
    const recebidoPorMes = new Array(horizonMonths).fill(0);
    const vendaPositivaPorMes = new Array(horizonMonths).fill(0);
    const recebidoPositivoPorMes = new Array(horizonMonths).fill(0);
    const coortes = [];
    const cen = input.scenario ?? {};
    let passivoDistratoBrl = 0;
    let estoqueRetornadoBrl = 0;
    const lancarRecebimento = (evento, r) => {
        if (evento.month < 0 || evento.month >= horizonMonths)
            return null;
        const fator = fatorReceitaNoMes(r, input, evento.month);
        const haircutCarteira = evento.component === "parcelas"
            ? 1 - taxaInadimplencia(r, cen.defaultRatePct ?? 0, diag)
            : 1;
        const valor = evento.amountAtBaseDateBrl * fator * haircutCarteira;
        recebidoPorMes[evento.month] += valor;
        if (valor > 0)
            recebidoPositivoPorMes[evento.month] += valor;
        return valor;
    };
    for (const r of input.revenues) {
        validarIndicesDaReceita(r, input, diag);
        if (r.kind === "rent") {
            const aluguel = r.monthlyRentBrl ?? 0;
            if (!(aluguel > 0)) {
                diag.push({
                    severity: "blocker", code: "RENDA_SEM_ALUGUEL_MENSAL",
                    message: `A linha de renda "${r.label}" não declara aluguel mensal; não há caixa operacional para projetar.`,
                    context: { revenueId: r.id },
                });
                continue;
            }
            const vacancia = percentualSeguro(r.vacancyPct ?? 0, "VACANCIA_INVALIDA", r, diag);
            const opex = percentualSeguro(r.opexPct ?? 0, "OPEX_INVALIDO", r, diag);
            const noiBase = aluguel * (1 - vacancia) * (1 - opex);
            const inicio = inteiroNaoNegativo(r.salesStartMonth);
            // O horizonte é também a duração econômica declarada da renda. Uma ampliação
            // técnica para pagar outra cauda não inventa meses adicionais de operação.
            const fim = Math.min(horizonMonths, declaredHorizonMonths);
            for (let m = inicio; m < fim; m++) {
                const noi = noiBase * fatorReceitaNoMes(r, input, m);
                vendaPorMes[m] += noi;
                recebidoPorMes[m] += noi;
                if (noi > 0) {
                    vendaPositivaPorMes[m] += noi;
                    recebidoPositivoPorMes[m] += noi;
                }
            }
            continue;
        }
        const brutoBase = valorBrutoReceita(r, cen.pricePct ?? 0);
        if (!(brutoBase > 0)) {
            diag.push({
                severity: "warning", code: "RECEITA_SEM_VALOR",
                message: `A linha de receita "${r.label}" não produz valor — confira unidades, área e preço.`,
                context: { id: r.id },
            });
            continue;
        }
        const atraso = inteiroNaoNegativo(cen.salesSpeedMonths ?? 0);
        const inicioVendas = inteiroNaoNegativo(r.salesStartMonth);
        const duracaoVendas = duracaoSegura(r.salesDurationMonths + atraso);
        const curvaFases = r.salesDistribution === "phase_curve"
            ? validarCurvaFasesReceita(r, inicioVendas, duracaoVendas, diag)
            : undefined;
        // `distribuir` preserva um fallback linear para usos genéricos. Receita é um
        // contrato econômico: se a linha declarou phase_curve, projetá-la sem a curva
        // física produziria caixa plausível, porém falso. Aqui o motor fecha a linha.
        if (r.salesDistribution === "phase_curve" && !curvaFases)
            continue;
        const curvaManualReceita = r.salesDistribution === "manual"
            ? vetorManualValido(r.salesCurve)
            : comoVetor(r.salesCurve);
        if (r.salesDistribution === "manual" && !curvaManualReceita) {
            diag.push({
                severity: "blocker", code: "CURVA_MANUAL_RECEITA_AUSENTE",
                message: `A receita "${r.label}" declara venda manual, mas não possui curva válida. ` +
                    "A venda não foi convertida em linear por aproximação.",
                context: { revenueId: r.id },
            });
            continue;
        }
        const vendasBase = (0, curvas_1.espalhar)(brutoBase, inicioVendas, duracaoVendas, horizonMonths, r.salesDistribution, { manual: curvaManualReceita ?? undefined, phaseCurve: curvaFases });
        if (exigePlanoDePagamento(r) && !r.paymentPlan) {
            diag.push({
                severity: "blocker",
                code: "PLANO_PAGAMENTO_NAO_DECLARADO",
                message: `A venda "${r.label}" não declara plano de pagamento. O motor preserva o valor ` +
                    "vendido, mas não o transforma em caixa: venda à vista precisa ser declarada " +
                    "como entrada de 100% e os demais componentes em 0%.",
                context: { revenueId: r.id, revenueKind: r.kind },
            });
        }
        const plano = r.paymentPlan ? validarPlano(r, r.paymentPlan, diag) : null;
        const taxaDistrato = taxaDistratoModelavel(r, diag);
        for (let saleMonth = 0; saleMonth < horizonMonths; saleMonth++) {
            const valorCoorteBase = vendasBase[saleMonth] ?? 0;
            if (!(valorCoorteBase > 0.005))
                continue;
            const valorContratado = valorCoorteBase * fatorReceitaNoMes(r, input, saleMonth);
            const guardarCoorte = includeCohorts
                && (r.kind === "unit_sale" || r.kind === "lot_sale");
            const contractEvents = guardarCoorte
                ? [{
                        monthIndex: saleMonth,
                        competencyMonth: (0, curvas_1.mesCompetencia)(input.baseDate, saleMonth),
                        kind: "sale",
                        amountBrl: valorContratado,
                    }]
                : [];
            const cashEvents = [];
            const registrarRecebimento = (evento) => {
                const valor = lancarRecebimento(evento, r);
                if (guardarCoorte && valor != null && Math.abs(valor) > 0.005) {
                    cashEvents.push({
                        monthIndex: evento.month,
                        competencyMonth: (0, curvas_1.mesCompetencia)(input.baseDate, evento.month),
                        component: evento.component,
                        amountBrl: valor,
                    });
                }
            };
            vendaPorMes[saleMonth] += valorContratado;
            if (valorContratado > 0)
                vendaPositivaPorMes[saleMonth] += valorContratado;
            if (taxaDistrato <= 0 || !r.cancellationPolicy) {
                for (const evento of eventosDaCoorte(r, valorCoorteBase, saleMonth, plano, diag)) {
                    registrarRecebimento(evento);
                }
                if (guardarCoorte) {
                    coortes.push(finalizarCoorte(r, input, saleMonth, valorCoorteBase, brutoBase, contractEvents, cashEvents));
                }
                continue;
            }
            const politica = r.cancellationPolicy;
            const baseMantida = valorCoorteBase * (1 - taxaDistrato);
            const baseDistratada = valorCoorteBase * taxaDistrato;
            for (const evento of eventosDaCoorte(r, baseMantida, saleMonth, plano, diag)) {
                registrarRecebimento(evento);
            }
            const mesDistrato = saleMonth + Math.max(0, Math.trunc(politica.eventMonthOffset));
            const eventosDistratados = eventosDaCoorte(r, baseDistratada, saleMonth, plano, diag);
            let pagoAteDistrato = 0;
            for (const evento of eventosDistratados) {
                if (evento.month >= mesDistrato)
                    continue; // cessa no próprio mês do distrato
                if (evento.month < 0 || evento.month >= horizonMonths)
                    continue;
                const fator = fatorReceitaNoMes(r, input, evento.month);
                const haircut = evento.component === "parcelas"
                    ? 1 - taxaInadimplencia(r, cen.defaultRatePct ?? 0, diag)
                    : 1;
                const recebido = evento.amountAtBaseDateBrl * fator * haircut;
                recebidoPorMes[evento.month] += recebido;
                if (recebido > 0)
                    recebidoPositivoPorMes[evento.month] += recebido;
                pagoAteDistrato += recebido;
                if (guardarCoorte && Math.abs(recebido) > 0.005) {
                    cashEvents.push({
                        monthIndex: evento.month,
                        competencyMonth: (0, curvas_1.mesCompetencia)(input.baseDate, evento.month),
                        component: evento.component,
                        amountBrl: recebido,
                    });
                }
            }
            if (mesDistrato >= 0 && mesDistrato < horizonMonths) {
                const cancelado = valorContratado * taxaDistrato;
                vendaPorMes[mesDistrato] -= cancelado;
                if (guardarCoorte && cancelado > 0.005) {
                    contractEvents.push({
                        monthIndex: mesDistrato,
                        competencyMonth: (0, curvas_1.mesCompetencia)(input.baseDate, mesDistrato),
                        kind: "cancellation",
                        amountBrl: -cancelado,
                    });
                }
            }
            estoqueRetornadoBrl += valorContratado * taxaDistrato;
            const retencao = clamp(politica.retentionPct / 100, 0, 1);
            const devolucaoBase = pagoAteDistrato * (1 - retencao);
            if (devolucaoBase > 0.005) {
                let mesDevolucao = mesDistrato + Math.max(0, Math.trunc(politica.refundDelayMonths));
                if (politica.resaleDelayMonths != null) {
                    const mesRevenda = mesDistrato + Math.max(0, Math.trunc(politica.resaleDelayMonths));
                    mesDevolucao = Math.min(mesDevolucao, mesRevenda + 1);
                }
                const fatorNoDistrato = fatorReceitaNoMes(r, input, mesDistrato);
                const fatorNaDevolucao = fatorReceitaNoMes(r, input, mesDevolucao);
                const devolucao = devolucaoBase * (fatorNoDistrato > 0 ? fatorNaDevolucao / fatorNoDistrato : 1);
                if (mesDevolucao >= 0 && mesDevolucao < horizonMonths) {
                    recebidoPorMes[mesDevolucao] -= devolucao;
                    if (guardarCoorte) {
                        cashEvents.push({
                            monthIndex: mesDevolucao,
                            competencyMonth: (0, curvas_1.mesCompetencia)(input.baseDate, mesDevolucao),
                            component: "refund",
                            amountBrl: -devolucao,
                        });
                    }
                }
                passivoDistratoBrl += devolucao;
            }
            if (politica.resaleDelayMonths != null) {
                const mesRevenda = mesDistrato + Math.max(0, Math.trunc(politica.resaleDelayMonths));
                const desconto = clamp((politica.resaleDiscountPct ?? 0) / 100, 0, 1);
                const baseRevenda = baseDistratada * (1 - desconto);
                if (mesRevenda >= 0 && mesRevenda < horizonMonths) {
                    const valorRevenda = baseRevenda * fatorReceitaNoMes(r, input, mesRevenda);
                    vendaPorMes[mesRevenda] += valorRevenda;
                    if (valorRevenda > 0)
                        vendaPositivaPorMes[mesRevenda] += valorRevenda;
                    if (guardarCoorte && valorRevenda > 0.005) {
                        contractEvents.push({
                            monthIndex: mesRevenda,
                            competencyMonth: (0, curvas_1.mesCompetencia)(input.baseDate, mesRevenda),
                            kind: "resale",
                            amountBrl: valorRevenda,
                        });
                    }
                }
                // A unidade retorna ao estoque e forma nova coorte. A taxa de distrato não é
                // aplicada outra vez: isso exigiria uma cadeia estocástica, não declarada aqui.
                for (const evento of eventosDaCoorte(r, baseRevenda, mesRevenda, plano, diag)) {
                    registrarRecebimento(evento);
                }
            }
            if (guardarCoorte) {
                coortes.push(finalizarCoorte(r, input, saleMonth, valorCoorteBase, brutoBase, contractEvents, cashEvents));
            }
        }
    }
    const receitaBrutaTotal = vendaPorMes.reduce((s, x) => s + x, 0);
    const receitaCaudaBrl = recebidoPorMes
        .slice(declaredHorizonMonths)
        .reduce((s, x) => s + Math.max(0, x), 0);
    return {
        vendaPorMes,
        recebidoPorMes,
        vendaPositivaPorMes,
        recebidoPositivoPorMes,
        linhas: [],
        coortes,
        receitaBrutaTotal,
        receitaCaudaBrl,
        passivoDistratoBrl,
        estoqueRetornadoBrl,
    };
}
function finalizarCoorte(revenue, input, saleMonth, valueAtBaseDateBrl, lineGrossAtBaseDateBrl, contractEvents, cashEvents) {
    const contractBySlot = new Map();
    for (const event of contractEvents) {
        const key = `${event.monthIndex}:${event.kind}`;
        const current = contractBySlot.get(key);
        contractBySlot.set(key, current
            ? { ...current, amountBrl: current.amountBrl + event.amountBrl }
            : { ...event });
    }
    const cashBySlot = new Map();
    for (const event of cashEvents) {
        const key = `${event.monthIndex}:${event.component}`;
        const current = cashBySlot.get(key);
        cashBySlot.set(key, current
            ? { ...current, amountBrl: current.amountBrl + event.amountBrl }
            : { ...event });
    }
    const units = revenue.units;
    const projectedUnits = units != null && Number.isFinite(units) && units > 0
        && lineGrossAtBaseDateBrl > 0
        ? Math.round((units * valueAtBaseDateBrl / lineGrossAtBaseDateBrl) * 1_000_000) / 1_000_000
        : null;
    return {
        revenueId: revenue.id,
        saleMonthIndex: saleMonth,
        saleCompetencyMonth: (0, curvas_1.mesCompetencia)(input.baseDate, saleMonth),
        projectedUnits,
        contractEvents: [...contractBySlot.values()]
            .filter((event) => Math.abs(event.amountBrl) > 0.005)
            .sort((a, b) => a.monthIndex - b.monthIndex || a.kind.localeCompare(b.kind))
            .map((event) => ({ ...event, amountBrl: round6(event.amountBrl) })),
        cashEvents: [...cashBySlot.values()]
            .filter((event) => Math.abs(event.amountBrl) > 0.005)
            .sort((a, b) => a.monthIndex - b.monthIndex || a.component.localeCompare(b.component))
            .map((event) => ({ ...event, amountBrl: round6(event.amountBrl) })),
    };
}
function eventosDaCoorte(r, valorBase, saleMonth, plano, diag) {
    if (!(valorBase > 0.005))
        return [];
    if (!r.paymentPlan) {
        if (exigePlanoDePagamento(r))
            return [];
        return [{ month: saleMonth, amountAtBaseDateBrl: valorBase, component: "entrada" }];
    }
    if (!plano?.valid)
        return []; // falha fechada: blocker já explica a premissa inválida
    const p = r.paymentPlan;
    const eventos = [];
    const entrega = plano.deliveryMonth;
    if (entrega != null && saleMonth >= entrega) {
        // Estoque pronto: não existem mensais nem chaves futuras. A carteira pré-entrega
        // migra para a entrada desta venda; só o saldo bancário conserva sua onda.
        const pctEntradaPronto = p.downPaymentPct + p.installmentsPct + p.keysPct;
        if (pctEntradaPronto > 0) {
            eventos.push({
                month: saleMonth,
                amountAtBaseDateBrl: valorBase * (pctEntradaPronto / 100),
                component: "entrada",
            });
        }
        for (const ponto of plano.repasseWave) {
            eventos.push({
                month: saleMonth + Math.trunc(ponto.monthOffset),
                amountAtBaseDateBrl: valorBase * (plano.repassePct / 100) * ponto.weight,
                component: "repasse",
            });
        }
        return eventos;
    }
    if (p.downPaymentPct > 0) {
        eventos.push({
            month: saleMonth,
            amountAtBaseDateBrl: valorBase * (p.downPaymentPct / 100),
            component: "entrada",
        });
    }
    if (p.installmentsPct > 0 && entrega != null) {
        const janela = Math.max(0, entrega - plano.installmentsEndBeforeDeliveryMonths - saleMonth);
        // O número de mensais é saída do motor, não segunda data de entrega disfarçada.
        // Quem compra mais tarde conserva a mesma fatia, em menos parcelas e de maior valor.
        const quantidade = janela;
        if (quantidade > 0) {
            const valorParcela = valorBase * (p.installmentsPct / 100) / quantidade;
            for (let k = 1; k <= quantidade; k++) {
                eventos.push({ month: saleMonth + k, amountAtBaseDateBrl: valorParcela, component: "parcelas" });
            }
        }
        else {
            // Conserva 100% da coorte sem empurrar parcela para depois da entrega.
            eventos.push({
                month: saleMonth,
                amountAtBaseDateBrl: valorBase * (p.installmentsPct / 100),
                component: "entrada",
            });
            diagnosticoUmaVez(diag, `COORTE_SEM_JANELA_PARCELAS:${r.id}:${saleMonth}`, {
                severity: "warning", code: "COORTE_SEM_JANELA_PARCELAS",
                message: `A coorte do mês ${saleMonth} em "${r.label}" não tem janela para parcelas ` +
                    `antes da entrega; essa fatia migrou para a entrada da própria coorte.`,
                context: { revenueId: r.id, saleMonth, deliveryMonth: entrega },
            });
        }
    }
    if (p.keysPct > 0 && entrega != null) {
        eventos.push({
            month: entrega,
            amountAtBaseDateBrl: valorBase * (p.keysPct / 100),
            component: "chaves",
        });
    }
    if (plano.repassePct > 0 && entrega != null) {
        for (const ponto of plano.repasseWave) {
            eventos.push({
                month: entrega + Math.trunc(ponto.monthOffset),
                amountAtBaseDateBrl: valorBase * (plano.repassePct / 100) * ponto.weight,
                component: "repasse",
            });
        }
    }
    return eventos;
}
function validarPlano(r, p, diag) {
    let valid = true;
    const repasseDeclarado = p.repassePct != null && Number.isFinite(p.repassePct);
    if (!repasseDeclarado) {
        valid = false;
        diag.push({
            severity: "blocker", code: "REPASSE_NAO_DECLARADO",
            message: `O plano de "${r.label}" não declara o repasse. O motor não deriva saldo por ` +
                `diferença: entrada, parcelas, chaves e repasse são quatro premissas auditáveis.`,
            context: { revenueId: r.id },
        });
    }
    const repassePct = repasseDeclarado ? Number(p.repassePct) : 0;
    const percentuais = [p.downPaymentPct, p.installmentsPct, p.keysPct, repassePct];
    if (percentuais.some((v) => !Number.isFinite(v) || v < 0 || v > 100)) {
        valid = false;
        diag.push({
            severity: "blocker", code: "PLANO_PAGAMENTO_PERCENTUAL_INVALIDO",
            message: `O plano de "${r.label}" contém percentual fora do intervalo de 0% a 100%.`,
            context: { revenueId: r.id },
        });
    }
    const soma = percentuais.reduce((s, x) => s + (Number.isFinite(x) ? x : 0), 0);
    if (Math.abs(soma - 100) > 0.01) {
        valid = false;
        diag.push({
            severity: "blocker", code: "PLANO_PAGAMENTO_NAO_FECHA",
            message: `O plano de pagamento de "${r.label}" soma ${soma.toFixed(2)}% em vez de ` +
                `100% — receita não pode sumir nem ser contada duas vezes.`,
            context: { revenueId: r.id, totalPct: soma },
        });
    }
    const leadDeclarado = p.installmentsEndBeforeDeliveryMonths ?? 1;
    if (!Number.isFinite(leadDeclarado) || leadDeclarado < 0) {
        valid = false;
        diag.push({
            severity: "blocker", code: "FOLGA_PARCELAS_INVALIDA",
            message: `A folga entre a última parcela e a entrega de "${r.label}" precisa ser um número não negativo.`,
            context: { revenueId: r.id, installmentsEndBeforeDeliveryMonths: leadDeclarado },
        });
    }
    const deliveryMonth = mesEntregaDoPlano(r, p);
    if ((p.keysPct > 0 || repassePct > 0 || p.installmentsPct > 0) && deliveryMonth == null) {
        valid = false;
        diag.push({
            severity: "blocker", code: "EVENTO_ENTREGA_NAO_DECLARADO",
            message: `O plano de "${r.label}" depende da entrega, mas não declara o mês do evento. ` +
                `Chaves e repasse não podem ser ancorados na data individual de cada venda.`,
            context: { revenueId: r.id },
        });
    }
    if (deliveryMonth != null && deliveryMonth < 0) {
        valid = false;
        diag.push({
            severity: "blocker", code: "EVENTO_ENTREGA_INVALIDO",
            message: `O mês de entrega de "${r.label}" não pode ser negativo.`,
            context: { revenueId: r.id, deliveryMonth },
        });
    }
    if (p.deliveryMonth == null && r.indexSwitchMonth == null && p.keysMonthOffset != null) {
        diagnosticoUmaVez(diag, `ANCORA_ENTREGA_LEGADA:${r.id}`, {
            severity: "warning", code: "ANCORA_ENTREGA_LEGADA",
            message: `"${r.label}" ainda usa keysMonthOffset. O valor foi lido como mês absoluto da ` +
                `entrega para preservar a âncora comum; migre a versão para deliveryMonth.`,
            context: { revenueId: r.id, deliveryMonth },
        });
    }
    let repasseWave = [];
    if (repassePct > 0) {
        repasseWave = p.repasseWave?.length ? p.repasseWave : exports.ONDA_REPASSE_PADRAO;
        if (!p.repasseWave?.length) {
            diag.push({
                severity: "info", code: "ONDA_REPASSE_PADRAO_APLICADA",
                message: `O repasse de "${r.label}" usa a onda operacional E a E+5. É uma premissa ` +
                    `de modelagem declarada, não uma estatística setorial.`,
                context: { revenueId: r.id, wave: exports.ONDA_REPASSE_PADRAO },
            });
        }
        const somaPesos = repasseWave.reduce((s, ponto) => s + ponto.weight, 0);
        const pontoInvalido = repasseWave.some((ponto) => !Number.isFinite(ponto.monthOffset) || ponto.monthOffset < 0
            || !Number.isFinite(ponto.weight) || ponto.weight < 0);
        if (pontoInvalido || Math.abs(somaPesos - 1) > 1e-9) {
            valid = false;
            diag.push({
                severity: "blocker", code: "ONDA_REPASSE_NAO_FECHA",
                message: `A onda de repasse de "${r.label}" precisa ter deslocamentos não negativos e pesos somando 1.`,
                context: { revenueId: r.id, totalWeight: somaPesos },
            });
        }
    }
    return {
        valid,
        deliveryMonth,
        installmentsEndBeforeDeliveryMonths: Math.max(0, Number.isFinite(leadDeclarado) ? Math.trunc(leadDeclarado) : 1),
        repassePct,
        repasseWave,
    };
}
function mesEntregaDoPlano(r, p) {
    const raw = p.deliveryMonth ?? r.indexSwitchMonth ?? p.keysMonthOffset;
    return raw == null || !Number.isFinite(raw) ? null : Math.trunc(raw);
}
function validarIndicesDaReceita(r, input, diag) {
    const codigos = [r.indexDuringWorks, r.indexAfterDelivery].filter((codigo) => Boolean(codigo));
    for (const codigo of new Set(codigos)) {
        if (input.indices[codigo])
            continue;
        diag.push({
            severity: "blocker", code: "INDICE_RECEITA_AUSENTE",
            message: `A receita "${r.label}" declara ${codigo}, mas a curva não está carregada. ` +
                `Publicar o fluxo sem correção de receita produziria um resultado oficialmente errado.`,
            context: { revenueId: r.id, indexCode: codigo },
        });
    }
    const jurosPosChaves = r.interestAfterKeysAm ?? 0;
    if (!Number.isFinite(jurosPosChaves) || jurosPosChaves < 0) {
        diag.push({
            severity: "blocker", code: "JUROS_POS_CHAVES_INVALIDO",
            message: `Os juros pós-chaves de "${r.label}" precisam ser uma taxa mensal não negativa.`,
            context: { revenueId: r.id, interestAfterKeysAm: jurosPosChaves },
        });
    }
    if (jurosPosChaves > 0 && r.indexAfterDelivery?.toUpperCase().includes("SELIC")) {
        diag.push({
            severity: "blocker", code: "SELIC_JUROS_BIS_IN_IDEM",
            message: `"${r.label}" combina Selic no pós-entrega com juros remuneratórios. Essa ` +
                `dupla remuneração precisa ser removida antes de publicar o fluxo.`,
            context: { revenueId: r.id, indexCode: r.indexAfterDelivery, interestAfterKeysAm: jurosPosChaves },
        });
    }
}
function fatorReceitaNoMes(r, input, month) {
    const lag = Math.max(0, Math.trunc(r.indexLagMonths ?? 0));
    const alvo = Math.max(0, Math.trunc(month) - lag);
    const entrega = r.paymentPlan ? mesEntregaDoPlano(r, r.paymentPlan) : r.indexSwitchMonth ?? null;
    const pre = r.indexDuringWorks ? input.indices[r.indexDuringWorks] : undefined;
    const pos = r.indexAfterDelivery ? input.indices[r.indexAfterDelivery] : undefined;
    let fator = 1;
    if (entrega != null && alvo > entrega && pos) {
        const fatorAteEntrega = (0, curvas_1.fatorIndice)(pre, entrega);
        const basePos = (0, curvas_1.fatorIndice)(pos, entrega);
        const fatorPos = (0, curvas_1.fatorIndice)(pos, alvo);
        fator = fatorAteEntrega * (basePos > 0 ? fatorPos / basePos : 1);
    }
    else {
        fator = (0, curvas_1.fatorIndice)(pre, alvo);
    }
    if (entrega != null && alvo > entrega && (r.interestAfterKeysAm ?? 0) > 0) {
        fator *= Math.pow(1 + (r.interestAfterKeysAm ?? 0) / 100, alvo - entrega);
    }
    return fator * fatorCenarioIndice(input.scenario?.indexAa, alvo);
}
function fatorCenarioIndice(indexAa, month) {
    if (!indexAa || !Number.isFinite(indexAa))
        return 1;
    const base = 1 + indexAa / 100;
    return base > 0 ? Math.pow(base, Math.max(0, month) / 12) : 1;
}
function taxaInadimplencia(r, scenarioDefaultRatePct, diag) {
    const total = (r.defaultRatePct ?? 0) + scenarioDefaultRatePct;
    if (!Number.isFinite(total) || total < 0 || total > 100) {
        diagnosticoUmaVez(diag, `INADIMPLENCIA_INVALIDA:${r.id}`, {
            severity: "blocker", code: "INADIMPLENCIA_INVALIDA",
            message: `A inadimplência total de "${r.label}" precisa estar entre 0% e 100%.`,
            context: { revenueId: r.id, totalPct: total },
        });
    }
    return clamp(total / 100, 0, 1);
}
function taxaDistratoModelavel(r, diag) {
    const pct = r.cancellationRatePct ?? 0;
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        diag.push({
            severity: "blocker", code: "DISTRATO_PERCENTUAL_INVALIDO",
            message: `A taxa de distrato de "${r.label}" precisa estar entre 0% e 100%.`,
            context: { revenueId: r.id, cancellationRatePct: pct },
        });
        return 0;
    }
    if (pct === 0)
        return 0;
    const p = r.cancellationPolicy;
    const invalida = !p
        || !Number.isFinite(p.eventMonthOffset) || p.eventMonthOffset < 0
        || !Number.isFinite(p.retentionPct) || p.retentionPct < 0 || p.retentionPct > 100
        || !Number.isFinite(p.refundDelayMonths) || p.refundDelayMonths < 0
        || (p.resaleDelayMonths != null
            && (!Number.isFinite(p.resaleDelayMonths) || p.resaleDelayMonths < 0))
        || (p.resaleDiscountPct != null
            && (!Number.isFinite(p.resaleDiscountPct) || p.resaleDiscountPct < 0 || p.resaleDiscountPct > 100));
    if (invalida) {
        diag.push({
            severity: "blocker", code: "DISTRATO_NAO_MODELAVEL",
            message: `A linha "${r.label}" declara ${pct}% de distrato, mas não informa uma ` +
                `política válida de evento, retenção, devolução e eventual revenda. A taxa ` +
                `não foi convertida em haircut silencioso.`,
            context: { revenueId: r.id, cancellationRatePct: pct },
        });
        return 0;
    }
    return pct / 100;
}
function percentualSeguro(pct, code, r, diag) {
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        diag.push({
            severity: "blocker", code,
            message: `O percentual informado em "${r.label}" precisa estar entre 0% e 100%.`,
            context: { revenueId: r.id, valuePct: pct },
        });
    }
    return clamp(pct / 100, 0, 1);
}
function diagnosticoUmaVez(diag, uniqueKey, diagnostic) {
    const contexto = diagnostic.context ?? {};
    if (diag.some((d) => d.context?.uniqueKey === uniqueKey))
        return;
    diag.push({ ...diagnostic, context: { ...contexto, uniqueKey } });
}
function ehDivida(kind) {
    return kind === "bank_construction" || kind === "private_debt" || kind === "consortium";
}
function fonteElegivelParaLtc(s) {
    return ehDivida(s.kind)
        && ["approved", "committed", "available", "drawn"].includes(s.status);
}
function valorBrutoReceita(r, pricePct) {
    const ajuste = 1 + pricePct / 100;
    if (r.grossAmountBrl != null && r.grossAmountBrl > 0)
        return r.grossAmountBrl * ajuste;
    const un = r.units ?? 0;
    if (un > 0 && r.unitPriceBrl != null)
        return un * r.unitPriceBrl * ajuste;
    if (un > 0 && r.unitAreaM2 != null && r.pricePerM2Brl != null) {
        return un * r.unitAreaM2 * r.pricePerM2Brl * ajuste;
    }
    return 0;
}
/**
 * Comissão e tributo podem ser agregados somente quando essa escolha está declarada.
 * Com mais de uma linha de receita, um `basisRef` livre não basta para calcular uma
 * incidência por produto/coorte; aplicar o VGV total produziria uma alíquota plausível
 * sobre a base errada. O contrato atual ainda não carrega escopo por revenue_id, então
 * essas linhas ficam fora da projeção e vetam a publicação.
 */
function validarEscoposDeReceita(input, diag) {
    const usosInvalidos = new Set();
    const receitasComissaoInvalidas = new Set();
    const receitasTributoInvalidas = new Set();
    const usosComissaoGlobal = [];
    for (const uso of input.uses) {
        if ((uso.group !== "sales" && uso.group !== "tax") || !baseDependeDeReceita(uso))
            continue;
        const naturezaCompativel = uso.group === "sales"
            ? uso.revenueChargeKind === "commission" || uso.revenueChargeKind === "other_sales"
            : uso.revenueChargeKind === "tax";
        if (uso.revenueScope !== "all_revenues" || !naturezaCompativel) {
            usosInvalidos.add(uso.id);
            diag.push({
                severity: "blocker",
                code: uso.group === "sales" ? "COMISSAO_ESCOPO_NAO_DECLARADO" : "TRIBUTO_ESCOPO_NAO_DECLARADO",
                message: `A linha "${uso.label}" depende de receita, mas não declara natureza e escopo ` +
                    "estruturados. basisRef é evidência humana, não instrução de cálculo; a linha não foi projetada.",
                context: {
                    useId: uso.id,
                    group: uso.group,
                    basis: uso.basis,
                    revenueScope: uso.revenueScope,
                    revenueChargeKind: uso.revenueChargeKind,
                },
            });
            continue;
        }
        if (uso.group === "tax") {
            usosInvalidos.add(uso.id);
            diag.push({
                severity: "blocker", code: "TRIBUTO_GLOBAL_SEM_REGIME",
                message: `A linha "${uso.label}" declara um tributo percentual, mas não carrega regime ` +
                    "nem fundamento legal. Use o setup tributário global ou o contrato por receita; a linha não entrou no fluxo.",
                context: { useId: uso.id },
            });
            continue;
        }
        if (uso.revenueChargeKind === "commission"
            && input.revenues.some((r) => (r.cancellationRatePct ?? 0) > 0)
            && uso.revenueCancellationTreatment !== "retained") {
            usosInvalidos.add(uso.id);
            diag.push({
                severity: "blocker", code: "COMISSAO_DISTRATO_SEM_POLITICA",
                message: `A comissão global "${uso.label}" cruza receita com distrato. Declare a política ` +
                    "conservadora retained (comissão paga não gera crédito) ou retire a incidência; a linha não foi projetada.",
                context: { useId: uso.id },
            });
            continue;
        }
        if (uso.revenueChargeKind === "commission")
            usosComissaoGlobal.push(uso);
    }
    const comissaoPorLinhaAtiva = input.revenues.some((r) => r.commissionPct != null || r.commissionBasis != null
        || r.commissionCancellationTreatment != null);
    if (comissaoPorLinhaAtiva && usosComissaoGlobal.length) {
        for (const uso of usosComissaoGlobal)
            usosInvalidos.add(uso.id);
        for (const receita of input.revenues)
            receitasComissaoInvalidas.add(receita.id);
        diag.push({
            severity: "blocker", code: "COMISSAO_ESCOPO_DUPLICADO",
            message: "Há comissão global e comissão por receita na mesma versão. Nenhuma das duas foi projetada: " +
                "escolha um único escopo para impedir dupla contagem.",
            context: { useIds: usosComissaoGlobal.map((u) => u.id), revenueIds: input.revenues.map((r) => r.id) },
        });
    }
    else if (comissaoPorLinhaAtiva) {
        for (const receita of input.revenues) {
            const pct = receita.commissionPct;
            const baseValida = receita.commissionBasis === "gross_revenue"
                || receita.commissionBasis === "received_revenue";
            if (pct == null || !Number.isFinite(pct) || pct < 0 || pct > 100 || !baseValida) {
                receitasComissaoInvalidas.add(receita.id);
                diag.push({
                    severity: "blocker", code: "COMISSAO_RECEITA_INCOMPLETA",
                    message: `A receita "${receita.label}" não declara o par percentual/base da comissão. ` +
                        "0% com base é ausência explícita; campo vazio não é.",
                    context: { revenueId: receita.id, commissionPct: pct, commissionBasis: receita.commissionBasis },
                });
            }
            else if (pct > 0 && (receita.cancellationRatePct ?? 0) > 0
                && receita.commissionCancellationTreatment !== "retained") {
                receitasComissaoInvalidas.add(receita.id);
                diag.push({
                    severity: "blocker", code: "COMISSAO_DISTRATO_SEM_POLITICA",
                    message: `A receita "${receita.label}" combina comissão e distrato sem declarar retained. ` +
                        "Sem uma política datada de clawback, a opção suportada conserva o custo pago e não gera crédito.",
                    context: { revenueId: receita.id },
                });
            }
        }
    }
    const tributoPorLinhaAtivo = input.revenues.some((r) => r.taxRegime != null || r.taxRatePct != null || r.taxBasis != null
        || r.taxPatrimonioAfetacao != null || r.taxOptionDate != null
        || Boolean(r.taxLegalBasisRef?.trim()) || r.taxCancellationTreatment != null);
    let tributoGlobalValido = true;
    const setup = input.tax;
    if (setup && tributoPorLinhaAtivo) {
        tributoGlobalValido = false;
        for (const receita of input.revenues)
            receitasTributoInvalidas.add(receita.id);
        diag.push({
            severity: "blocker", code: "TRIBUTO_ESCOPO_DUPLICADO",
            message: "Há setup tributário global e regimes por receita na mesma versão. Nenhum tributo foi projetado; " +
                "escolha um único escopo.",
            context: { revenueIds: input.revenues.map((r) => r.id) },
        });
    }
    else if (setup) {
        const contingencia = setup.contingencyRatePct ?? 0;
        const taxaTotal = setup.effectiveRatePct + contingencia;
        if (!Number.isFinite(setup.effectiveRatePct)
            || !Number.isFinite(contingencia)
            || setup.effectiveRatePct < 0
            || contingencia < 0
            || taxaTotal > 100) {
            tributoGlobalValido = false;
            diag.push({
                severity: "blocker",
                code: "TRIBUTO_TAXA_INVALIDA",
                message: "A taxa tributária efetiva e sua contingência precisam ser finitas, " +
                    "não negativas e somar no máximo 100%. Nenhum tributo global foi projetado.",
                context: {
                    regime: setup.regime,
                    effectiveRatePct: setup.effectiveRatePct,
                    contingencyRatePct: setup.contingencyRatePct,
                },
            });
        }
        if (setup.scope !== "all_revenues") {
            tributoGlobalValido = false;
            diag.push({
                severity: "blocker", code: "TRIBUTO_ESCOPO_GLOBAL_NAO_DECLARADO",
                message: "O setup tributário global não declara escopo sobre todas as receitas; nenhum rateio foi inferido.",
                context: { scope: setup.scope },
            });
        }
        if (setup.regime === "isento") {
            if (taxaTotal !== 0 || (setup.notes?.trim().length ?? 0) < 5) {
                tributoGlobalValido = false;
                diag.push({
                    severity: "blocker", code: "ISENCAO_SEM_FUNDAMENTO",
                    message: "Isenção exige taxa total de 0% e fundamento explícito; zero isolado não prova o regime.",
                    context: { effectiveRatePct: setup.effectiveRatePct },
                });
            }
        }
        else if (taxaTotal <= 0) {
            tributoGlobalValido = false;
            diag.push({
                severity: "blocker", code: "TRIBUTO_TAXA_NAO_DECLARADA",
                message: `O regime ${setup.regime} não pode usar 0% como substituto de alíquota ausente.`,
                context: { regime: setup.regime },
            });
        }
        if (taxaTotal > 0 && /(^|[_\s-])ret([_\s-]|$)/i.test(setup.regime) && setup.basis !== "received") {
            tributoGlobalValido = false;
            diag.push({
                severity: "blocker",
                code: "RET_BASE_INCOMPATIVEL",
                message: `O regime ${setup.regime} foi declarado com base ${setup.basis}. ` +
                    "RET precisa seguir a receita recebida; o motor não antecipou o tributo sobre vendas.",
                context: { regime: setup.regime, basis: setup.basis },
            });
        }
        if (taxaTotal > 0 && /(^|[_\s-])ret([_\s-]|$)/i.test(setup.regime)
            && (setup.patrimonioAfetacao !== true || !setup.optionDate)) {
            tributoGlobalValido = false;
            diag.push({
                severity: "blocker", code: "RET_ESCOPO_LEGAL_INCOMPLETO",
                message: "RET exige patrimônio de afetação e data da opção declarados; a sigla isolada não prova aplicabilidade.",
                context: { patrimonioAfetacao: setup.patrimonioAfetacao, optionDate: setup.optionDate },
            });
        }
        if (taxaTotal > 0 && input.revenues.some((r) => (r.cancellationRatePct ?? 0) > 0)
            && setup.cancellationTreatment !== "no_credit") {
            tributoGlobalValido = false;
            diag.push({
                severity: "blocker", code: "TRIBUTO_DISTRATO_SEM_POLITICA_FISCAL",
                message: "O estudo combina tributo global e distrato sem declarar no_credit. A política suportada " +
                    "é conservadora: imposto recolhido não gera crédito automático na devolução.",
            });
        }
    }
    else if (tributoPorLinhaAtivo) {
        for (const receita of input.revenues) {
            const regime = receita.taxRegime;
            const taxa = receita.taxRatePct;
            const fundamento = receita.taxLegalBasisRef?.trim() ?? "";
            const baseValida = receita.taxBasis === "received" || receita.taxBasis === "accrued";
            let invalida = !regime || taxa == null || !Number.isFinite(taxa)
                || taxa < 0 || taxa > 100 || !baseValida || fundamento.length < 5;
            if (regime === "isento")
                invalida ||= taxa !== 0;
            else if (regime)
                invalida ||= taxa == null || taxa <= 0;
            if ((regime === "ret_4" || regime === "ret_1")
                && (receita.taxBasis !== "received" || receita.taxPatrimonioAfetacao !== true || !receita.taxOptionDate)) {
                invalida = true;
            }
            if ((taxa ?? 0) > 0 && (receita.cancellationRatePct ?? 0) > 0
                && receita.taxCancellationTreatment !== "no_credit")
                invalida = true;
            if (invalida) {
                receitasTributoInvalidas.add(receita.id);
                diag.push({
                    severity: "blocker", code: "TRIBUTO_RECEITA_INCOMPLETO",
                    message: `A receita "${receita.label}" não tem contrato tributário defensável. Regime, taxa, base e ` +
                        "fundamento são obrigatórios; isenção aceita 0%, demais regimes não. RET também exige caixa recebido, " +
                        "patrimônio de afetação e data da opção; distrato exige política fiscal própria.",
                    context: { revenueId: receita.id, regime, taxa, basis: receita.taxBasis },
                });
            }
        }
    }
    return { usosInvalidos, tributoGlobalValido, receitasComissaoInvalidas, receitasTributoInvalidas };
}
function baseDependeDeReceita(uso) {
    return uso.basis === "pct_gross_revenue"
        || uso.basis === "pct_net_revenue"
        || uso.basis === "pct_received";
}
function projetarEncargosPorLinha(input, projecao, validacao, horizonte, _diag) {
    const comissaoPorMes = new Array(horizonte).fill(0);
    const tributoPorMes = new Array(horizonte).fill(0);
    const porId = new Map(projecao.linhas.map((linha) => [linha.revenueId, linha]));
    for (const receita of input.revenues) {
        const linha = porId.get(receita.id);
        if (!linha)
            continue;
        if (!validacao.receitasComissaoInvalidas.has(receita.id)
            && receita.commissionPct != null && receita.commissionBasis) {
            const base = receita.commissionBasis === "gross_revenue"
                ? linha.vendaPorMes : linha.recebidoPorMes;
            const basePositiva = receita.commissionBasis === "gross_revenue"
                ? linha.vendaPositivaPorMes : linha.recebidoPositivoPorMes;
            for (let m = 0; m < horizonte; m++) {
                const incidencia = receita.commissionCancellationTreatment === "retained"
                    ? basePositiva[m] : base[m];
                comissaoPorMes[m] += incidencia * receita.commissionPct / 100;
            }
        }
        if (!validacao.receitasTributoInvalidas.has(receita.id)
            && receita.taxRegime && receita.taxRatePct != null && receita.taxBasis) {
            const base = receita.taxBasis === "received" ? linha.recebidoPorMes : linha.vendaPorMes;
            const basePositiva = receita.taxBasis === "received"
                ? linha.recebidoPositivoPorMes : linha.vendaPositivaPorMes;
            for (let m = 0; m < horizonte; m++) {
                const incidencia = receita.taxCancellationTreatment === "no_credit"
                    ? basePositiva[m] : base[m];
                tributoPorMes[m] += incidencia * receita.taxRatePct / 100;
            }
        }
    }
    return { comissaoPorMes, tributoPorMes };
}
function valorDoUso(u, b) {
    let v = 0;
    const conservaDistrato = u.revenueChargeKind === "commission"
        && u.revenueCancellationTreatment === "retained";
    const receitaBruta = conservaDistrato ? (b.receitaBrutaPositiva ?? b.receitaBruta) : b.receitaBruta;
    const recebido = conservaDistrato ? (b.recebidoPositivo ?? b.recebido) : b.recebido;
    switch (u.basis) {
        case "fixed":
            v = u.amountBrl ?? 0;
            break;
        case "qty_unit":
        case "per_unit":
        case "per_area":
            v = (u.qty ?? 0) * (u.unitPriceBrl ?? 0);
            break;
        case "cub_x_area":
            v = (u.qty ?? 0) * (u.unitPriceBrl ?? 0);
            break;
        case "pct_gross_revenue":
            v = receitaBruta * ((u.pct ?? 0) / 100);
            break;
        case "pct_net_revenue":
            v = recebido * ((u.pct ?? 0) / 100);
            break;
        case "pct_hard_cost":
            v = b.hardCost * ((u.pct ?? 0) / 100);
            break;
        case "pct_total_cost":
            v = b.custoTotal * ((u.pct ?? 0) / 100);
            break;
        case "pct_land":
            v = b.terreno * ((u.pct ?? 0) / 100);
            break;
        case "pct_received":
            v = recebido * ((u.pct ?? 0) / 100);
            break;
        case "pct_financed":
            v = b.financiado * ((u.pct ?? 0) / 100);
            break;
        default: v = 0;
    }
    if (u.group === "hard_cost")
        v *= 1 + (b.cen.hardCostPct ?? 0) / 100;
    if (u.group === "soft_cost")
        v *= 1 + (b.cen.softCostPct ?? 0) / 100;
    return v;
}
function somarUsos(input, grupos, receita, hardCost, recebido, cen, ignorarIds = new Set(), receitaBrutaPositiva, recebidoPositivo) {
    let t = 0;
    for (const u of input.uses) {
        if (!grupos.includes(u.group) || ignorarIds.has(u.id))
            continue;
        t += valorDoUso(u, {
            receitaBruta: receita, receitaBrutaPositiva, hardCost, custoTotal: 0, terreno: 0,
            recebido, recebidoPositivo, financiado: 0,
            area: input.product.builtAreaM2 ?? 0, unidades: input.product.units ?? 0, cen,
        });
    }
    return t;
}
function limiteDaFonte(s, bases, diag) {
    // Consórcio sem contemplação CONFIRMADA não é caixa (§16.7, regra crítica).
    if (s.kind === "consortium" && !s.contemplatedAt) {
        diag.push({
            severity: "warning", code: "CONSORCIO_NAO_CONTEMPLADO",
            message: `A carta "${s.label}" ainda não foi contemplada: as parcelas entram como saída, mas o crédito NÃO entra como caixa disponível.`,
            context: { sourceId: s.id, expectedMonth: s.expectedContemplationMonth },
        });
        return 0;
    }
    let teto = s.nominalBrl;
    if (s.limitPct != null && s.limitBasis) {
        const base = s.limitBasis === "pct_hard_cost" ? bases.hardCost
            : s.limitBasis === "pct_total_cost" ? bases.custoTotal
                : s.limitBasis === "pct_gross_revenue" ? bases.receitaBruta
                    : s.limitBasis === "pct_land" ? bases.terreno
                        : 0;
        if (base <= 0) {
            diag.push({
                severity: "warning", code: "LIMITE_SEM_BASE",
                message: `A fonte "${s.label}" limita-se a ${s.limitPct}% de ${s.limitBasisRef ?? s.limitBasis}, mas essa base é zero no estudo — o limite não pôde ser aplicado.`,
                context: { sourceId: s.id },
            });
        }
        else {
            teto = Math.min(teto || Infinity, base * (s.limitPct / 100));
        }
    }
    if (s.limitCapBrl != null)
        teto = Math.min(teto || Infinity, s.limitCapBrl);
    // Lance embutido REDUZ o crédito líquido: somá-lo ao funding superestima o caixa.
    if (s.kind === "consortium" && s.embeddedBidPct) {
        teto *= 1 - s.embeddedBidPct / 100;
    }
    let disponivel = teto;
    if (s.eligibleBrl != null)
        disponivel = Math.min(disponivel, Math.max(0, s.eligibleBrl));
    if (s.availableBrl != null) {
        disponivel = Math.min(disponivel, Math.max(0, s.availableBrl));
    }
    else if (["committed", "available", "drawn"].includes(s.status)) {
        // Zero comprometido é zero, não autoriza cair de volta no nominal. O fallback
        // anterior transformava uma proposta ainda sem compromisso em caixa integral.
        disponivel = Math.min(disponivel, Math.max(0, s.committedBrl));
    }
    else if (s.committedBrl > 0) {
        disponivel = Math.min(disponivel, s.committedBrl);
    }
    return Math.max(0, disponivel);
}
function indiceLucratividade(fluxo, taxaAa) {
    const i = (0, financeiro_1.taxaMensal)(taxaAa);
    let entradas = 0;
    let saidas = 0;
    for (let m = 0; m < fluxo.length; m++) {
        const vp = fluxo[m] / Math.pow(1 + i, m);
        if (vp > 0)
            entradas += vp;
        else
            saidas += -vp;
    }
    return saidas > 0 ? entradas / saidas : null;
}
function retornoPorSocio(input, cashflow, lucro, diag) {
    if (!input.partners.length)
        return [];
    const comWaterfall = input.partners.filter((p) => (p.preferredReturnAa ?? 0) !== 0
        || (p.hurdleAa ?? 0) !== 0
        || (p.catchUpPct ?? 0) !== 0
        || (p.carryPct ?? 0) !== 0
        || p.waterfallTier != null);
    if (comWaterfall.length) {
        diag.push({
            severity: "blocker", code: "WATERFALL_SOCIOS_NAO_MODELADO",
            message: "O acordo declara retorno preferencial, hurdle, catch-up, carry ou tiers. " +
                "O motor não publicou TIR/MOIC pro rata como se esses direitos não existissem; " +
                "implemente a cascata contratual datada antes de aprovar.",
            context: { partnerIds: comWaterfall.map((p) => p.id) },
        });
        return [];
    }
    const somaPct = input.partners.reduce((s, p) => s + p.equityPct, 0);
    if (Math.abs(somaPct - 100) > 0.01) {
        diag.push({
            severity: "blocker", code: "PARTICIPACAO_NAO_FECHA",
            message: `As participações somam ${somaPct.toFixed(2)}% em vez de 100% — o retorno por sócio não pode ser distribuído.`,
            context: { partners: input.partners.length },
        });
    }
    const aporteTotal = cashflow.reduce((s, c) => s + c.equityInBrl, 0);
    return input.partners.map((p) => {
        const share = p.equityPct / 100;
        // Commitment é limite, não caixa investido. MOIC/TIR usam somente o aporte que
        // efetivamente entrou no fluxo, alocado pela participação simples declarada.
        const contribuido = aporteTotal * share;
        const distribuido = contribuido + lucro * share;
        // Fluxo simplificado do sócio: aporte no ritmo do equity, retorno no fim.
        const fluxo = cashflow.map((c) => -c.equityInBrl * share);
        fluxo[fluxo.length - 1] += distribuido;
        const t = (0, financeiro_1.tir)(fluxo);
        return {
            partnerId: p.id,
            displayName: p.displayName,
            contributedBrl: round2(contribuido),
            distributedBrl: round2(distribuido),
            irrAa: t.aa,
            moic: contribuido > 0 ? round2(distribuido / contribuido) : null,
            paybackMonth: (0, financeiro_1.payback)(fluxo),
        };
    });
}
function num(code, label, value, unit, definition, view, opts) {
    const v = value != null && Number.isFinite(value) ? round2(value) : null;
    let band = v == null ? "undefined" : "ok";
    if (v != null && opts?.band)
        band = opts.band(v);
    else if (v != null && (opts?.min != null || opts?.max != null)) {
        if (opts.min != null && v < opts.min)
            band = "attention";
        else if (opts.max != null && v > opts.max)
            band = "attention";
    }
    return {
        code, label, value: v, unit, definition, view, band,
        benchmarkMin: opts?.min ?? null,
        benchmarkMax: opts?.max ?? null,
        benchmarkSource: opts?.source ?? null,
        // Faixa de mercado é PRÁTICA até termos histórico próprio (§14 do SPEC-VIAB-001).
        benchmarkCalibrated: false,
    };
}
function comoVetor(v) {
    if (Array.isArray(v)) {
        return v.map((x) => typeof x === "number" ? x
            : x && typeof x === "object" && "pct" in x ? Number(x.pct) || 0
                : 0);
    }
    return undefined;
}
/**
 * Curva manual é uma declaração econômica, não um pedido de fallback. Ausência,
 * NaN, peso negativo ou soma nula recusam a linha; `distribuir()` conserva seu fallback
 * genérico para outros chamadores, mas o motor de decisão nunca o usa em silêncio.
 */
function vetorManualValido(v) {
    const vetor = comoVetor(v);
    if (!vetor?.length)
        return null;
    if (vetor.some((x) => !Number.isFinite(x) || x < 0))
        return null;
    return vetor.reduce((s, x) => s + x, 0) > 0 ? vetor : null;
}
function validarCurvaFasesReceita(receita, inicioVendas, duracaoVendas, diag) {
    const curva = receita.salesPhaseCurve;
    if (!Array.isArray(curva) || curva.length === 0) {
        diag.push({
            severity: "blocker",
            code: "CURVA_FASES_RECEITA_AUSENTE",
            message: `A receita "${receita.label}" declara distribuição por fases, mas não recebeu a curva física das etapas; a linha não foi projetada.`,
            context: { revenueId: receita.id, salesDistribution: receita.salesDistribution },
        });
        return undefined;
    }
    // A curva física é absoluta no horizonte do projeto. `espalhar`, porém, recebe
    // pesos relativos ao início da linha; recortar aqui impede que uma receita em M6
    // reutilize por engano as fases de M0..M5.
    const pesosNoPeriodo = curva.slice(inicioVendas, inicioVendas + duracaoVendas);
    const invalida = pesosNoPeriodo.length === 0
        || pesosNoPeriodo.some((peso) => !Number.isFinite(peso) || peso < 0)
        || pesosNoPeriodo.reduce((soma, peso) => soma + peso, 0) <= 0;
    if (invalida) {
        diag.push({
            severity: "blocker",
            code: "CURVA_FASES_RECEITA_INVALIDA",
            message: `A curva física da receita "${receita.label}" não contém pesos válidos no período de vendas; a linha não foi projetada.`,
            context: { revenueId: receita.id, startMonth: inicioVendas, durationMonths: duracaoVendas },
        });
        return undefined;
    }
    return pesosNoPeriodo;
}
function round2(v) {
    return Math.round((Number.isFinite(v) ? v : 0) * 100) / 100;
}
function round6(v) {
    return Math.round((Number.isFinite(v) ? v : 0) * 1_000_000) / 1_000_000;
}
function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
}
function inteiroNaoNegativo(v) {
    return Number.isFinite(v) ? Math.max(0, Math.trunc(v)) : 0;
}
function duracaoSegura(v) {
    return Number.isFinite(v) ? Math.max(1, Math.trunc(v)) : 1;
}
function brl(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
