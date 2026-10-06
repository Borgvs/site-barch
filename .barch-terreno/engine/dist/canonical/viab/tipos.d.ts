/**
 * Módulo de Viabilidade · contrato do motor determinístico.
 * ARQ-VIAB-GATES-001 §23.1
 *
 * O motor é PURO: recebe inputs versionados, devolve outputs e diagnósticos. Não lê
 * banco, não chama rede, não olha o relógio. Isso não é purismo — é o que torna o
 * estudo reproduzível: mesmo input + mesma data-base + mesma seed = mesmo número, ao
 * centavo, hoje e daqui a dois anos, quando alguém precisar defender a decisão.
 *
 * Convenções que valem para o arquivo inteiro:
 * • Dinheiro em BRL, número JS (double). Arredondamento só na fronteira de saída.
 * • Tempo em índice de mês inteiro a partir de 0 = mês da data-base.
 * • Percentual em PONTOS (10 = 10%), nunca fração — o schema guarda assim e converter
 *   no meio do caminho é como nasce erro de 100×.
 */
export declare const ENGINE_VERSION = "viab-1.2.1";
export type Basis = "fixed" | "qty_unit" | "pct_gross_revenue" | "pct_net_revenue" | "pct_hard_cost" | "pct_total_cost" | "pct_land" | "pct_received" | "pct_financed" | "per_unit" | "per_area" | "cub_x_area";
/**
 * `on_demand` não é uma curva: é a ausência de uma. A fonte entra com o que faltar no
 * mês, na ordem de prioridade — é assim que capital próprio funciona num pro forma
 * real, e é o que permite ao estudo RESPONDER "de quanto eu preciso" em vez de exigir
 * que alguém adivinhe a curva até o buraco sumir.
 */
export type Distribution = "single" | "linear" | "s_curve" | "phase_curve" | "manual" | "on_demand";
export type UseGroup = "land" | "hard_cost" | "soft_cost" | "sales" | "finance" | "tax" | "contingency" | "operation_exit";
export type SourceKind = "equity_own" | "equity_partner" | "presales" | "bank_construction" | "bank_mortgage_transfer" | "consortium" | "private_debt" | "barter" | "subsidy" | "other";
export type Amortization = "sac" | "price" | "bullet" | "cash_sweep" | "custom";
export type BusinessModel = "contracted_work" | "development_for_sale" | "development_for_income" | "land_development" | "custom";
/** Curva de índice: fator acumulado por mês a partir da data-base. */
export type IndexCurve = {
    code: string;
    /** fator[m] = multiplicador para levar um valor da data-base até o mês m. */
    factors: number[];
    /** Até que mês a série é REALIZADA; depois disso é projeção declarada. */
    realizedUntilMonth: number;
    projectionAa: number | null;
};
export type UseLine = {
    id: string;
    group: UseGroup;
    category: string;
    label: string;
    basis: Basis;
    amountBrl?: number | null;
    qty?: number | null;
    unitPriceBrl?: number | null;
    pct?: number | null;
    basisRef?: string | null;
    /**
     * Escopo econômico explícito de linhas percentuais ligadas à receita. Texto livre
     * em `basisRef` continua sendo evidência humana, não instrução de cálculo.
     */
    revenueScope?: "all_revenues" | null;
    revenueChargeKind?: "commission" | "other_sales" | "tax" | null;
    /** Política conservadora quando comissão global cruza uma receita distratada. */
    revenueCancellationTreatment?: "retained" | null;
    distribution: Distribution;
    startMonth: number;
    durationMonths: number;
    curve?: unknown;
    indexCode?: string | null;
    indexRegime?: "none" | "realized_then_projected" | "projected" | null;
    /** Curva das etapas da EAP, quando distribution = phase_curve. */
    phaseCurve?: number[] | null;
};
export type SourceLine = {
    id: string;
    kind: SourceKind;
    label: string;
    status: string;
    nominalBrl: number;
    committedBrl: number;
    eligibleBrl?: number | null;
    availableBrl?: number | null;
    /** Já sacado. Em estudo é 0; em viabilidade contínua vem do realizado. */
    drawnBrl: number;
    limitBasis?: Basis | null;
    limitBasisRef?: string | null;
    limitPct?: number | null;
    limitCapBrl?: number | null;
    indexCode?: string | null;
    spreadAa?: number | null;
    fixedRateAa?: number | null;
    amortization?: Amortization | null;
    graceMonths?: number | null;
    termMonths?: number | null;
    capitalizeInterest: boolean;
    startMonth: number;
    durationMonths: number;
    drawDistribution: Distribution;
    drawCurve?: unknown;
    priority: number;
    /** Consórcio: só contemplação CONFIRMADA vira caixa disponível. */
    contemplatedAt?: string | null;
    expectedContemplationMonth?: number | null;
    adminFeePct?: number | null;
    reserveFundPct?: number | null;
    embeddedBidPct?: number | null;
    barterMode?: "physical" | "financial" | "mixed" | null;
    barterPctVgv?: number | null;
};
export type RevenueLine = {
    id: string;
    kind: "unit_sale" | "lot_sale" | "contract_billing" | "rent" | "exit_sale" | "other";
    label: string;
    units?: number | null;
    unitAreaM2?: number | null;
    pricePerM2Brl?: number | null;
    unitPriceBrl?: number | null;
    grossAmountBrl?: number | null;
    salesStartMonth: number;
    salesDurationMonths: number;
    salesDistribution: Distribution;
    salesCurve?: unknown;
    /** Comissão própria desta linha; `0` + base é declaração explícita de ausência. */
    commissionPct?: number | null;
    commissionBasis?: "gross_revenue" | "received_revenue" | null;
    commissionCancellationTreatment?: "retained" | null;
    /** Regime tributário próprio desta linha, quando não existe setup global homogêneo. */
    taxRegime?: "ret_4" | "ret_1" | "lucro_presumido" | "lucro_real" | "simples" | "isento" | null;
    taxRatePct?: number | null;
    taxBasis?: "received" | "accrued" | null;
    taxPatrimonioAfetacao?: boolean | null;
    taxOptionDate?: string | null;
    taxLegalBasisRef?: string | null;
    taxCancellationTreatment?: "no_credit" | null;
    /** Curva física das etapas/EAP, quando salesDistribution = phase_curve. */
    salesPhaseCurve?: number[] | null;
    defaultRatePct?: number | null;
    cancellationRatePct?: number | null;
    /**
     * Mecânica datada do distrato. Sem esta política o motor não transforma uma taxa
     * agregada em caixa: fazê-lo seria escolher silenciosamente retenção, vencimento da
     * devolução e revenda — três premissas que mudam a exposição máxima.
     */
    cancellationPolicy?: CancellationPolicy | null;
    /** Plano de pagamento: como o valor VENDIDO vira dinheiro RECEBIDO. */
    paymentPlan?: PaymentPlan | null;
    indexDuringWorks?: string | null;
    indexAfterDelivery?: string | null;
    interestAfterKeysAm?: number | null;
    indexSwitchMonth?: number | null;
    indexLagMonths: number;
    monthlyRentBrl?: number | null;
    vacancyPct?: number | null;
    opexPct?: number | null;
    capRateExit?: number | null;
    stabilizationMonths?: number | null;
};
/**
 * Plano de pagamento de venda. Sinal na assinatura, parcelas até a entrega, e o
 * saldo nas chaves (repasse ou financiamento). A soma tem de fechar 100% — o motor
 * recusa plano que não fecha, porque plano que não fecha esconde receita.
 */
export type PaymentPlan = {
    downPaymentPct: number;
    installmentsPct: number;
    /**
     * @deprecated Campo legado de UI. Com entrega declarada, a quantidade efetiva é
     * derivada por coorte (`entrega − folga − venda`); este valor não ancora o fluxo.
     */
    installmentsCount: number;
    keysPct: number;
    /**
     * Saldo bancário ou financiamento direto. É componente próprio: nunca é derivado
     * como resto do plano e nunca recebe o haircut de inadimplência da carteira própria.
     * Opcional somente para desserializar versões legadas; o motor bloqueia o cálculo
     * oficial quando a declaração está ausente.
     */
    repassePct?: number | null;
    /** Mês absoluto da entrega contado desde a data-base da versão. */
    deliveryMonth?: number | null;
    /** Quantos meses antes da entrega termina a carteira mensal. Default declarado: 1. */
    installmentsEndBeforeDeliveryMonths?: number | null;
    /** Onda do repasse a partir da entrega. Pesos precisam somar 1. */
    repasseWave?: RepasseWavePoint[] | null;
    /**
     * @deprecated Campo legado. Era documentado como offset da venda, mas as versões
     * iniciais gravaram nele o mês da entrega do empreendimento. O motor o aceita como
     * âncora absoluta, com diagnóstico, para não reancorar cada coorte na própria venda.
     */
    keysMonthOffset?: number | null;
};
export type RepasseWavePoint = {
    /** Deslocamento em meses a partir da entrega (ou da venda de estoque pronto). */
    monthOffset: number;
    weight: number;
};
export type CancellationPolicy = {
    /** Mês do distrato relativo à data de venda da coorte. */
    eventMonthOffset: number;
    /** Percentual do que já foi pago que permanece no empreendimento. */
    retentionPct: number;
    /** Prazo contratual/legal entre distrato e pagamento do passivo de devolução. */
    refundDelayMonths: number;
    /**
     * Prazo até a recolocação da unidade. `null` mantém a unidade em estoque até o fim
     * do estudo; quando há revenda, o passivo vence no menor entre a regra acima e o
     * mês seguinte à revenda.
     */
    resaleDelayMonths?: number | null;
    /** Desconto sobre o preço-base da unidade recolocada. Premissa declarada. */
    resaleDiscountPct?: number | null;
};
export type PartnerLine = {
    id: string;
    displayName: string;
    equityPct: number;
    commitmentBrl: number;
    preferredReturnAa?: number | null;
    hurdleAa?: number | null;
    catchUpPct?: number | null;
    carryPct?: number | null;
    waterfallTier?: number | null;
    isBarch: boolean;
};
export type TaxSetup = {
    regime: string;
    effectiveRatePct: number;
    basis: "received" | "accrued";
    contingencyRatePct?: number | null;
    scope?: "all_revenues" | null;
    patrimonioAfetacao?: boolean | null;
    optionDate?: string | null;
    notes?: string | null;
    cancellationTreatment?: "no_credit" | null;
};
export type ScenarioDeltas = {
    hardCostPct?: number;
    softCostPct?: number;
    pricePct?: number;
    salesSpeedMonths?: number;
    scheduleDelayMonths?: number;
    indexAa?: number;
    interestAa?: number;
    defaultRatePct?: number;
};
/**
 * A âncora de PROCEDÊNCIA da premissa de mercado que fundou a velocidade de venda do estudo,
 * lida na porta canônica (`market_facts_for_place`, MPBRC-081 D8). Entra no `input_hash`
 * porque a identidade da observação que ancora o estudo É insumo: quando a fonte publica um
 * ponto novo que supera este, o estudo muda de chão e o hash tem de dizer. Só a identidade
 * ESTÁVEL da observação viaja aqui — nunca um valor que varie a cada leitura.
 */
export type MarketProvenancePin = {
    metricId: string;
    /** Chave imutável da observação — a âncora da procedência. */
    observationKey: string;
    competencia: string;
    rung: string;
    fonteId: string;
};
export type FeasibilityInput = {
    engineVersion: string;
    businessModel: BusinessModel;
    baseDate: string;
    horizonMonths: number;
    discountRateAa: number;
    /** `true` somente após ato explícito; número default ou racional genérico não bastam. */
    discountRateDeclared: boolean;
    /** Deflator geral somente quando a TMA declarada é real. */
    generalInflationAa?: number | null;
    generalInflationSource?: string | null;
    /**
     * Natureza da TMA gravada na versão. O motor atual projeta caixa nominal; uma TMA
     * real sem deflator geral declarado precisa falhar fechada, nunca ser aplicada como
     * se fosse nominal.
     */
    discountRateIsReal: boolean;
    seed: number;
    uses: UseLine[];
    sources: SourceLine[];
    revenues: RevenueLine[];
    partners: PartnerLine[];
    tax: TaxSetup | null;
    indices: Record<string, IndexCurve>;
    /** Área e unidades do produto escolhido — denominadores de várias bases. */
    product: {
        builtAreaM2?: number | null;
        privateAreaM2?: number | null;
        units?: number | null;
    };
    /** Caixa mínimo exigido; abaixo dele o mês é considerado descoberto. */
    minCashBrl?: number;
    scenario?: ScenarioDeltas | null;
    /**
     * A procedência da premissa de mercado (VSO) lida na porta canônica, pinada no `input_hash`.
     * `null` quando a velocidade veio do prior curado (a porta não tinha fato ou não foi lida).
     */
    marketProvenance?: MarketProvenancePin | null;
};
export type CashflowMonth = {
    monthIndex: number;
    competencyMonth: string;
    /** Saída de caixa operacional/tributária/financeira paga no mês. Não inclui
     * amortização de principal e pode divergir da soma econômica de `usesByGroup`
     * quando há juro capitalizado. */
    usesBrl: number;
    /** Apropriação econômica mensal por natureza; finance inclui juro pago e
     * capitalizado, sem principal da dívida. */
    usesByGroup: Record<UseGroup, number>;
    revenueBrl: number;
    revenueReceivedBrl: number;
    taxBrl: number;
    drawsBrl: number;
    debtServiceBrl: number;
    /** Juro efetivamente pago no mês. O custo econômico (pago + capitalizado) vive em
     * `usesByGroup.finance` e em `totals.interestBrl`. */
    interestBrl: number;
    equityInBrl: number;
    distributionsBrl: number;
    openingBalanceBrl: number;
    closingBalanceBrl: number;
    fundingGapBrl: number;
    netExposureBrl: number;
    debtBalanceBrl: number;
};
export type RevenueCohortContractEvent = {
    monthIndex: number;
    competencyMonth: string;
    kind: "sale" | "cancellation" | "resale";
    amountBrl: number;
};
export type RevenueCohortCashEvent = {
    monthIndex: number;
    competencyMonth: string;
    component: "entrada" | "parcelas" | "chaves" | "repasse" | "refund";
    amountBrl: number;
};
/**
 * Coorte econômica preservada pelo motor para a viabilidade contínua. Não é uma
 * segunda fórmula: são os mesmos eventos usados para formar o fluxo agregado,
 * separados por `revenue_id` e mês de venda. Assim a carteira contratada pode
 * substituir fatos planejados sem ratear o caixa all-in por aproximação.
 */
export type RevenueCohortProjection = {
    revenueId: string;
    saleMonthIndex: number;
    saleCompetencyMonth: string;
    /** Unidades esperadas; pode ser fracionária numa projeção e `null` sem estoque. */
    projectedUnits: number | null;
    contractEvents: RevenueCohortContractEvent[];
    cashEvents: RevenueCohortCashEvent[];
};
export type RevenueLineProjectionEvent = {
    monthIndex: number;
    amountBrl: number;
};
/** Cobertura esparsa de toda linha de receita, inclusive renda e outros modelos. */
export type RevenueLineProjection = {
    revenueId: string;
    contractEvents: RevenueLineProjectionEvent[];
    cashEvents: RevenueLineProjectionEvent[];
};
export type Indicator = {
    code: string;
    label: string;
    value: number | null;
    unit: string;
    definition: string;
    view: "project" | "equity" | "barch" | "partner";
    band?: "ok" | "attention" | "critical" | "undefined";
    benchmarkMin?: number | null;
    benchmarkMax?: number | null;
    benchmarkSource?: string | null;
    benchmarkCalibrated?: boolean;
    diagnostics?: Record<string, unknown>;
};
/**
 * Diagnóstico é cidadão de primeira classe da saída. Um motor que devolve só números
 * obriga quem lê a adivinhar o que ficou de fora; este diz o que assumiu, o que não
 * conseguiu calcular e por quê.
 */
export type Diagnostic = {
    severity: "info" | "warning" | "blocker";
    code: string;
    message: string;
    context?: Record<string, unknown>;
};
export type PartnerReturn = {
    partnerId: string;
    displayName: string;
    contributedBrl: number;
    distributedBrl: number;
    irrAa: number | null;
    moic: number | null;
    paybackMonth: number | null;
};
export type FeasibilityOutput = {
    engineVersion: string;
    inputHash: string;
    cashflow: CashflowMonth[];
    revenueCohorts: RevenueCohortProjection[];
    revenueLineProjections: RevenueLineProjection[];
    indicators: Indicator[];
    partnerReturns: PartnerReturn[];
    diagnostics: Diagnostic[];
    /** Totais que a interface exibe sem precisar refazer conta. */
    totals: {
        /** Custo econômico total: usos declarados, tributos e juros apropriados; nunca
         * inclui saque ou amortização de principal. */
        usesBrl: number;
        usesByGroup: Record<UseGroup, number>;
        revenueGrossBrl: number;
        revenueReceivedBrl: number;
        taxBrl: number;
        interestBrl: number;
        profitBrl: number;
        peakExposureBrl: number;
        peakExposureMonth: number;
        fundingGapBrl: number;
        monthsWithGap: number;
        /** Horizonte declarado pela versão antes de o motor preservar a cauda. */
        declaredHorizonMonths?: number;
        /** Horizonte efetivamente calculado; nunca menor que o declarado. */
        effectiveHorizonMonths?: number;
        /** Receita cujo vencimento ficava além do horizonte declarado. */
        revenueTailBrl?: number;
        /** Passivo de devolução pago no fluxo por distratos modelados. */
        cancellationLiabilityBrl?: number;
        /** Valor-base das unidades devolvidas ao estoque por distrato. */
        returnedInventoryBrl?: number;
    };
};
