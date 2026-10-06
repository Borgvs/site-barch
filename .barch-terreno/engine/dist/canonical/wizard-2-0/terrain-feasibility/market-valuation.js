"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparableAssessmentPayloadSha256 = comparableAssessmentPayloadSha256;
exports.calculateLandMarketValuation = calculateLandMarketValuation;
const decimal_1 = require("./decimal");
const canonical_sha256_1 = require("./canonical-sha256");
const validation_1 = require("./validation");
const HARD_MINIMUM_COMPARABLE_COUNT = 3;
const HARD_MINIMUM_CLOSED_TRANSACTION_COUNT = 2;
const HARD_MINIMUM_INDEPENDENT_SOURCES = 2;
const HARD_MAXIMUM_AGE_MONTHS = 36;
const HARD_MAXIMUM_SINGLE_COMPARABLE_WEIGHT_PCT = "50";
const HARD_MAXIMUM_SOURCE_CONCENTRATION_PCT = "75";
const HARD_MAXIMUM_ABSOLUTE_ADJUSTMENT_PCT = "50";
const HARD_MINIMUM_CUMULATIVE_ADJUSTMENT_FACTOR = "0.5";
const HARD_MAXIMUM_CUMULATIVE_ADJUSTMENT_FACTOR = "2";
const SHA256 = /^[0-9a-f]{64}$/;
const VALID_COMPARABLE_KINDS = new Set([
    "closed_transaction", "asking_price", "broker_opinion", "auction", "internal_transaction",
]);
const VALID_ADJUSTMENT_KINDS = new Set([
    "negotiation", "time", "location", "scale", "shape_frontage", "topography_soil",
    "buildability", "infrastructure", "occupancy_demolition", "legal_liquidity", "other",
]);
function nonEmptyString(value) {
    return typeof value === "string" && Boolean(value.trim());
}
function comparableAssessmentPayloadSha256(assessment) {
    return (0, canonical_sha256_1.canonicalSha256)({
        schema: "terrain-market-comparable-assessment/v1",
        marketRecordId: assessment.marketRecordId,
        transactionId: assessment.transactionId,
        sourcePartyCanonicalId: assessment.sourcePartyCanonicalId,
        evidenceSnapshotId: assessment.evidenceSnapshotId,
        assessedPayload: assessment.assessedPayload,
    });
}
function invalidResult(input, reason) {
    return {
        state: "invalid",
        normalizationBasis: input.normalizationBasis,
        subjectNormalizationAreaM2: input.subjectNormalizationAreaM2,
        comparableCount: 0,
        closedTransactionCount: 0,
        independentSourceCount: 0,
        maximumComparableWeightPct: "0",
        maximumSourceConcentrationPct: "0",
        comparables: [],
        lowUnitValueBrl: null,
        medianUnitValueBrl: null,
        highUnitValueBrl: null,
        weightedMeanUnitValueBrl: null,
        lowSubjectValueBrl: null,
        medianSubjectValueBrl: null,
        highSubjectValueBrl: null,
        blockers: [reason],
        warnings: [],
    };
}
function validPolicy(input) {
    const policy = input.policy;
    if ((0, decimal_1.parseExactDecimal)(policy.maximumSingleComparableWeightPct) == null
        || (0, decimal_1.parseExactDecimal)(policy.maximumSourceConcentrationPct) == null)
        return false;
    return Boolean(policy.policyId.trim())
        && Number.isSafeInteger(policy.minimumComparableCount)
        && policy.minimumComparableCount >= HARD_MINIMUM_COMPARABLE_COUNT
        && Number.isSafeInteger(policy.minimumClosedTransactionCount)
        && policy.minimumClosedTransactionCount >= HARD_MINIMUM_CLOSED_TRANSACTION_COUNT
        && policy.minimumClosedTransactionCount <= policy.minimumComparableCount
        && Number.isSafeInteger(policy.minimumIndependentSources)
        && policy.minimumIndependentSources >= HARD_MINIMUM_INDEPENDENT_SOURCES
        && policy.minimumIndependentSources <= policy.minimumComparableCount
        && Number.isSafeInteger(policy.maximumAgeMonths)
        && policy.maximumAgeMonths >= 0
        && policy.maximumAgeMonths <= HARD_MAXIMUM_AGE_MONTHS
        && (0, decimal_1.decimalCompare)(policy.maximumSingleComparableWeightPct, "0") > 0
        && (0, decimal_1.decimalCompare)(policy.maximumSingleComparableWeightPct, HARD_MAXIMUM_SINGLE_COMPARABLE_WEIGHT_PCT) <= 0
        && (0, decimal_1.decimalCompare)(policy.maximumSourceConcentrationPct, "0") > 0
        && (0, decimal_1.decimalCompare)(policy.maximumSourceConcentrationPct, HARD_MAXIMUM_SOURCE_CONCENTRATION_PCT) <= 0;
}
function validAdjustments(item, evidence) {
    let cumulativeFactor = "1";
    for (const adjustment of item.adjustments) {
        if (!VALID_ADJUSTMENT_KINDS.has(adjustment.kind)
            || !nonEmptyString(adjustment.rationale)
            || !nonEmptyString(adjustment.evidenceSnapshotId)
            || !(0, validation_1.allEvidenceRefsExist)([adjustment.evidenceSnapshotId], evidence)
            || (0, decimal_1.parseExactDecimal)(adjustment.adjustmentPct) == null
            || (0, decimal_1.decimalCompare)(adjustment.adjustmentPct, `-${HARD_MAXIMUM_ABSOLUTE_ADJUSTMENT_PCT}`) < 0
            || (0, decimal_1.decimalCompare)(adjustment.adjustmentPct, HARD_MAXIMUM_ABSOLUTE_ADJUSTMENT_PCT) > 0) {
            return false;
        }
        cumulativeFactor = (0, decimal_1.decimalMultiply)(cumulativeFactor, (0, decimal_1.decimalAdd)("1", (0, decimal_1.decimalDivide)(adjustment.adjustmentPct, "100")));
    }
    return (0, decimal_1.decimalCompare)(cumulativeFactor, HARD_MINIMUM_CUMULATIVE_ADJUSTMENT_FACTOR) >= 0
        && (0, decimal_1.decimalCompare)(cumulativeFactor, HARD_MAXIMUM_CUMULATIVE_ADJUSTMENT_FACTOR) <= 0;
}
function sameAdjustment(left, right) {
    return left.id === right.id
        && left.kind === right.kind
        && left.adjustmentPct === right.adjustmentPct
        && left.rationale === right.rationale
        && left.evidenceSnapshotId === right.evidenceSnapshotId;
}
function sameAssessedPayload(item) {
    const payload = item.comparableAssessment?.assessedPayload;
    return payload != null
        && Array.isArray(item.adjustments)
        && payload.label === item.label
        && payload.kind === item.kind
        && payload.observedOn === item.observedOn
        && payload.sourcePartyId === item.sourcePartyId
        && payload.totalPriceBrl === item.totalPriceBrl
        && payload.normalizationAreaM2 === item.normalizationAreaM2
        && payload.weight === item.weight
        && Array.isArray(payload.adjustments)
        && payload.adjustments.length === item.adjustments.length
        && payload.adjustments.every((adjustment, index) => sameAdjustment(adjustment, item.adjustments[index]));
}
function reconciledAssessmentDigest(assessment) {
    try {
        return comparableAssessmentPayloadSha256(assessment) === assessment.assessmentContentSha256;
    }
    catch {
        return false;
    }
}
function uniqueNonEmpty(values) {
    const normalized = values.map((value) => value.trim());
    return normalized.every(Boolean) && new Set(normalized).size === normalized.length;
}
function validComparable(item, input, evidence) {
    const assessment = item.comparableAssessment;
    const receipt = assessment?.serverReceipt;
    const evidenceRef = evidence.get(item.evidenceSnapshotId);
    if (!nonEmptyString(item.id)
        || !nonEmptyString(item.label)
        || !VALID_COMPARABLE_KINDS.has(item.kind)
        || !nonEmptyString(item.sourcePartyId)
        || !nonEmptyString(item.evidenceSnapshotId)
        || !(0, validation_1.isIsoDate)(item.observedOn)
        || item.observedOn > input.asOfDate
        || !(0, validation_1.isIsoInstant)(input.calculatedAt)
        || !evidenceRef
        || evidenceRef.kind !== "market_evidence"
        || evidenceRef.status !== "published"
        || evidenceRef.contentSha256 == null
        || (0, decimal_1.normalizeMoneyBrl)(item.totalPriceBrl) == null
        || !(0, decimal_1.decimalIsPositive)(item.totalPriceBrl)
        || !(0, decimal_1.decimalIsPositive)(item.normalizationAreaM2)
        || !(0, decimal_1.decimalIsPositive)(item.weight)
        || !Array.isArray(item.adjustments)
        || !(0, validation_1.hasUniqueNonEmptyIds)(item.adjustments)
        || assessment == null
        || receipt == null
        || !nonEmptyString(assessment.assessmentId)
        || !nonEmptyString(assessment.marketRecordId)
        || !nonEmptyString(assessment.sourcePartyCanonicalId)
        || assessment.sourcePartyCanonicalId !== assessment.assessedPayload.sourcePartyId
        || assessment.evidenceSnapshotId !== item.evidenceSnapshotId
        || !SHA256.test(assessment.sourceEvidenceContentSha256)
        || assessment.sourceEvidenceContentSha256 !== evidenceRef.contentSha256
        || !SHA256.test(assessment.assessmentContentSha256)
        || !reconciledAssessmentDigest(assessment)
        || !nonEmptyString(assessment.reviewedBy)
        || !(0, validation_1.isIsoInstant)(assessment.reviewedAt)
        || Date.parse(assessment.reviewedAt) < Date.parse(evidenceRef.capturedAt)
        || Date.parse(assessment.reviewedAt) > Date.parse(input.calculatedAt)
        || !nonEmptyString(receipt.receiptId)
        || receipt.issuer !== "barch-governance-service"
        || receipt.issuanceBoundary !== "server_only"
        || !(0, validation_1.isIsoInstant)(receipt.issuedAt)
        || Date.parse(receipt.issuedAt) < Date.parse(assessment.reviewedAt)
        || Date.parse(receipt.issuedAt) > Date.parse(input.calculatedAt)
        || receipt.payloadContentSha256 !== assessment.assessmentContentSha256
        || ((item.kind === "closed_transaction" || item.kind === "internal_transaction")
            ? !nonEmptyString(assessment.transactionId)
            : assessment.transactionId != null)
        || !sameAssessedPayload(item))
        return false;
    return validAdjustments(item, evidence);
}
function calculateComparable(item, subjectArea) {
    const warnings = [];
    const rawUnit = (0, decimal_1.decimalDivide)(item.totalPriceBrl, item.normalizationAreaM2);
    let factor = "1";
    for (const adjustment of item.adjustments) {
        factor = (0, decimal_1.decimalMultiply)(factor, (0, decimal_1.decimalAdd)("1", (0, decimal_1.decimalDivide)(adjustment.adjustmentPct, "100")));
    }
    if (item.kind === "asking_price"
        && !item.adjustments.some((adjustment) => adjustment.kind === "negotiation")) {
        warnings.push("Oferta sem ajuste explícito de negociação; o motor não infere desconto.");
    }
    const adjustedUnitExact = (0, decimal_1.decimalMultiply)(rawUnit, factor);
    const adjustedUnitValueBrl = (0, decimal_1.decimalToMoney)(adjustedUnitExact);
    return {
        id: item.id,
        label: item.label,
        kind: item.comparableAssessment.assessedPayload.kind,
        sourcePartyId: item.comparableAssessment.sourcePartyCanonicalId,
        weight: (0, decimal_1.formatExactDecimal)((0, decimal_1.requireExactDecimal)(item.weight, `${item.id}.weight`)),
        rawUnitValueBrl: (0, decimal_1.decimalToMoney)(rawUnit),
        cumulativeAdjustmentFactor: factor,
        adjustedUnitValueBrl,
        indicatedSubjectValueBrl: (0, decimal_1.decimalToMoney)((0, decimal_1.decimalMultiply)(adjustedUnitExact, subjectArea)),
        warnings,
        adjustedUnitExact,
        unitScaled: (0, decimal_1.requireExactDecimal)(adjustedUnitExact, `${item.id}.adjustedUnitExact`),
        weightScaled: (0, decimal_1.requireExactDecimal)(item.weight, `${item.id}.weight`),
    };
}
function weightedQuantile(rows, pct) {
    const ordered = [...rows].sort((a, b) => a.unitScaled === b.unitScaled ? a.id.localeCompare(b.id) : a.unitScaled < b.unitScaled ? -1 : 1);
    const total = ordered.reduce((sum, row) => sum + row.weightScaled, 0n);
    let cumulative = 0n;
    for (const row of ordered) {
        cumulative += row.weightScaled;
        if (cumulative * 100n >= total * pct)
            return (0, decimal_1.formatExactDecimal)(row.unitScaled);
    }
    return (0, decimal_1.formatExactDecimal)(ordered[ordered.length - 1].unitScaled);
}
function concentrationPct(rows) {
    const total = rows.reduce((sum, row) => sum + row.weightScaled, 0n);
    const maxComparable = rows.reduce((max, row) => row.weightScaled > max ? row.weightScaled : max, 0n);
    const bySource = new Map();
    rows.forEach((row) => bySource.set(row.sourcePartyId, (bySource.get(row.sourcePartyId) ?? 0n) + row.weightScaled));
    const maxSource = [...bySource.values()].reduce((max, value) => value > max ? value : max, 0n);
    const asPct = (value) => (0, decimal_1.formatExactDecimal)(total === 0n ? 0n : (value * 100n * decimal_1.TERRAIN_DECIMAL_SCALE + total / 2n) / total);
    return { maximumComparable: asPct(maxComparable), maximumSource: asPct(maxSource) };
}
function calculateLandMarketValuation(input) {
    const evidence = (0, validation_1.evidenceMap)(input.evidence);
    if (!(0, validation_1.isIsoDate)(input.asOfDate))
        return invalidResult(input, "Data-base mercadológica inválida.");
    if (!(0, validation_1.isIsoInstant)(input.calculatedAt)) {
        return invalidResult(input, "Instante de cálculo mercadológico inválido.");
    }
    if (input.normalizationBasis !== "land_area_m2"
        && input.normalizationBasis !== "computable_area_m2") {
        return invalidResult(input, "Base de normalização mercadológica inválida.");
    }
    if (!evidence)
        return invalidResult(input, "Manifesto de evidências mercadológicas inválido.");
    if (!(0, decimal_1.decimalIsPositive)(input.subjectNormalizationAreaM2)) {
        return invalidResult(input, "Área de normalização do terreno deve ser positiva.");
    }
    if (!validPolicy(input))
        return invalidResult(input, "Política de comparáveis inválida.");
    if (!(0, validation_1.hasUniqueNonEmptyIds)(input.comparables))
        return invalidResult(input, "Comparáveis precisam de IDs únicos.");
    if (input.comparables.some((item) => !validComparable(item, input, evidence))) {
        return invalidResult(input, "Um ou mais comparáveis possuem dados ou proveniência inválidos.");
    }
    const assessmentIds = input.comparables.map((item) => item.comparableAssessment.assessmentId);
    const marketRecordIds = input.comparables.map((item) => item.comparableAssessment.marketRecordId);
    const primaryEvidenceIds = input.comparables.map((item) => item.comparableAssessment.evidenceSnapshotId);
    const receiptIds = input.comparables.map((item) => item.comparableAssessment.serverReceipt?.receiptId ?? "");
    const primaryEvidenceHashes = input.comparables.map((item) => evidence.get(item.comparableAssessment.evidenceSnapshotId).contentSha256);
    const transactionIds = input.comparables
        .map((item) => item.comparableAssessment.transactionId)
        .filter((id) => id != null);
    if (!uniqueNonEmpty(assessmentIds)
        || !uniqueNonEmpty(marketRecordIds)
        || !uniqueNonEmpty(primaryEvidenceIds)
        || !uniqueNonEmpty(primaryEvidenceHashes)
        || !uniqueNonEmpty(receiptIds)
        || !uniqueNonEmpty(transactionIds)) {
        return invalidResult(input, "Comparáveis reutilizam identidade de avaliação, registro, transação, recibo ou evidência primária.");
    }
    const eligible = input.comparables.filter((item) => {
        const age = (0, validation_1.monthsBetweenEarlierAndAsOf)(item.comparableAssessment.assessedPayload.observedOn, input.asOfDate);
        return age != null && age <= input.policy.maximumAgeMonths;
    });
    const excludedByAge = input.comparables.filter((item) => !eligible.includes(item));
    if (eligible.length === 0) {
        return {
            ...invalidResult(input, "Nenhum comparável permanece dentro da janela temporal da política."),
            state: "insufficient",
            comparableCount: 0,
            blockers: ["Nenhum comparável elegível na janela temporal."],
            warnings: excludedByAge.map((item) => `Comparável ${item.id} excluído por idade.`),
        };
    }
    const calculated = eligible.map((item) => calculateComparable(item, input.subjectNormalizationAreaM2));
    const sources = new Set(calculated.map((item) => item.sourcePartyId));
    const closedCount = calculated.filter((item) => item.kind === "closed_transaction" || item.kind === "internal_transaction").length;
    const concentration = concentrationPct(calculated);
    const blockers = [];
    if (calculated.length < input.policy.minimumComparableCount)
        blockers.push("Quantidade de comparáveis abaixo da política.");
    if (closedCount < input.policy.minimumClosedTransactionCount)
        blockers.push("Transações fechadas abaixo da política.");
    if (sources.size < input.policy.minimumIndependentSources)
        blockers.push("Fontes independentes abaixo da política.");
    if ((0, decimal_1.decimalCompare)(concentration.maximumComparable, input.policy.maximumSingleComparableWeightPct) > 0) {
        blockers.push("Peso de um comparável excede o limite da política.");
    }
    if ((0, decimal_1.decimalCompare)(concentration.maximumSource, input.policy.maximumSourceConcentrationPct) > 0) {
        blockers.push("Concentração por fonte excede o limite da política.");
    }
    const low = weightedQuantile(calculated, 25n);
    const median = weightedQuantile(calculated, 50n);
    const high = weightedQuantile(calculated, 75n);
    const mean = (0, decimal_1.decimalToMoney)((0, decimal_1.decimalWeightedMean)(calculated.map((row) => ({
        value: row.adjustedUnitExact,
        weight: row.weight,
    }))));
    const subject = input.subjectNormalizationAreaM2;
    const warnings = [
        ...excludedByAge.map((item) => `Comparável ${item.id} excluído por idade.`),
        ...calculated.flatMap((item) => item.warnings.map((warning) => `${item.id}: ${warning}`)),
    ];
    return {
        state: blockers.length > 0 ? "insufficient" : "ready",
        normalizationBasis: input.normalizationBasis,
        subjectNormalizationAreaM2: subject,
        comparableCount: calculated.length,
        closedTransactionCount: closedCount,
        independentSourceCount: sources.size,
        maximumComparableWeightPct: concentration.maximumComparable,
        maximumSourceConcentrationPct: concentration.maximumSource,
        comparables: calculated.map(({ adjustedUnitExact: _exact, unitScaled: _unit, weightScaled: _weight, ...row }) => row),
        lowUnitValueBrl: (0, decimal_1.decimalToMoney)(low),
        medianUnitValueBrl: (0, decimal_1.decimalToMoney)(median),
        highUnitValueBrl: (0, decimal_1.decimalToMoney)(high),
        weightedMeanUnitValueBrl: mean,
        lowSubjectValueBrl: (0, decimal_1.decimalToMoney)((0, decimal_1.decimalMultiply)(low, subject)),
        medianSubjectValueBrl: (0, decimal_1.decimalToMoney)((0, decimal_1.decimalMultiply)(median, subject)),
        highSubjectValueBrl: (0, decimal_1.decimalToMoney)((0, decimal_1.decimalMultiply)(high, subject)),
        blockers,
        warnings,
    };
}
