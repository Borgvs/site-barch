import type { ExactDecimal, MoneyBrl } from "./decimal";
export declare const TERRAIN_FEASIBILITY_ENGINE_VERSION: "terrain-feasibility/1.1";
export type TerrainEvidenceKind = "published_normative_snapshot" | "market_evidence" | "survey" | "technical_study" | "parcel_applicability_assessment" | "explicit_user_input";
export interface TerrainEvidenceGovernance {
    readonly releaseId: string;
    readonly attestationId: string;
    readonly approvedBy: string;
    readonly publishedAt: string;
    readonly approvalState: "approved";
    readonly issuanceBoundary: "curated_release" | "server_attestation";
    readonly issuer: "barch-governance-service";
    readonly immutableRecordSha256: string;
    readonly verificationState: "server_verified" | "unverified";
    readonly verifiedAt: string;
}
export interface TerrainEvidenceRef {
    readonly snapshotId: string;
    readonly title: string;
    readonly kind: TerrainEvidenceKind;
    readonly locator: string;
    readonly effectiveDate: string;
    readonly capturedAt: string;
    readonly status: "draft" | "published" | "superseded";
    readonly contentSha256: string | null;
    readonly synthetic: boolean;
    /**
     * Atesto de publicação do sistema de origem. `status: published` sozinho não
     * transforma um snapshot em evidência governada.
     */
    readonly governance: TerrainEvidenceGovernance | null;
}
export type StatutoryInstrumentCode = "onerous_grant" | "building_right_purchase" | "impact_mitigation" | "mobility_measure" | "environmental_compensation" | "heritage_measure" | "utility_connection" | "licensing_fee" | "land_cession" | "other";
export type EntitlementItemState = "not_applicable" | "estimated" | "quoted" | "confirmed" | "unresolved" | "blocked";
export type EntitlementCostBasis = {
    readonly kind: "none";
} | {
    readonly kind: "fixed";
    readonly amountBrl: MoneyBrl;
} | {
    readonly kind: "rate_per_chargeable_m2";
    readonly chargeableAreaM2: ExactDecimal;
    readonly unitRateBrlM2: MoneyBrl;
} | {
    readonly kind: "percentage_of_explicit_base";
    readonly baseAmountBrl: MoneyBrl;
    readonly ratePct: ExactDecimal;
} | {
    /** Resultado de fórmula externa versionada; o motor não reinterpreta a lei. */
    readonly kind: "external_assessment";
    readonly assessedAmountBrl: MoneyBrl;
    readonly formulaSnapshotId: string;
    readonly humanValidated: boolean;
    readonly humanValidation: {
        readonly reviewerId: string;
        readonly reviewedAt: string;
        readonly assessmentSnapshotId: string;
        readonly assessmentContentSha256: string;
    } | null;
} | {
    readonly kind: "unresolved";
    readonly reason: string;
};
export interface EntitlementLedgerItemInput {
    readonly id: string;
    readonly label: string;
    /** Identidade da obrigação na release jurisdicional, distinta da classe genérica. */
    readonly jurisdictionalInstrumentId: string;
    readonly instrument: StatutoryInstrumentCode;
    readonly state: EntitlementItemState;
    readonly costBasis: EntitlementCostBasis;
    readonly additionalComputableAreaM2: ExactDecimal;
    readonly deductedComputableAreaM2: ExactDecimal;
    readonly requiredLandCessionAreaM2: ExactDecimal;
    readonly scheduleImpactMonths: ExactDecimal;
    /** Estado do gate, separado da maturidade/certeza do custo. */
    readonly approvalState: "not_required" | "pending" | "approved" | "rejected" | "unknown";
    readonly paymentMilestone: "not_applicable" | "approval" | "permit" | "construction_start" | "occupancy_permit" | "negotiated";
    readonly evidenceSnapshotIds: readonly string[];
    readonly note: string;
    readonly applicabilityAssessment: {
        readonly itemId: string;
        readonly parcelId: string;
        readonly instrument: StatutoryInstrumentCode;
        readonly jurisdictionalInstrumentId: string;
        /** Resultado parcelar emitido pelo avaliador; também vincula a base de custo usada no ledger. */
        readonly determination: "applicable" | "not_applicable";
        readonly assessedModeledCostBrl: MoneyBrl | null;
        readonly assessmentSnapshotId: string;
        readonly sourceEvidenceContentSha256: string;
        /** Digest do payload decisório extraído, distinto do hash do artefato-fonte. */
        readonly assessmentContentSha256: string;
        readonly assessedPayload: {
            readonly label: string;
            readonly state: EntitlementItemState;
            readonly costBasis: EntitlementCostBasis;
            readonly additionalComputableAreaM2: ExactDecimal;
            readonly deductedComputableAreaM2: ExactDecimal;
            readonly requiredLandCessionAreaM2: ExactDecimal;
            readonly scheduleImpactMonths: ExactDecimal;
            readonly approvalState: EntitlementLedgerItemInput["approvalState"];
            readonly paymentMilestone: EntitlementLedgerItemInput["paymentMilestone"];
            readonly evidenceSnapshotIds: readonly string[];
            readonly note: string;
        };
        readonly reviewerId: string;
        readonly reviewedAt: string;
        readonly serverReceipt?: {
            readonly receiptId: string;
            readonly issuer: "barch-governance-service";
            readonly issuanceBoundary: "server_only";
            readonly issuedAt: string;
            readonly payloadContentSha256: string;
        };
    } | null;
}
export interface EntitlementLedgerInput {
    readonly asOfDate: string;
    readonly subjectParcelId: string;
    readonly evidence: readonly TerrainEvidenceRef[];
    readonly coveragePolicy: {
        readonly policyId: string;
        readonly normativeSnapshotId: string;
        readonly requiredInstruments: readonly StatutoryInstrumentCode[];
        readonly reviewedAt: string;
        readonly reviewedBy: string;
        readonly jurisdictionalCatalog: {
            readonly catalogId: string;
            readonly catalogSnapshotId: string;
            readonly sourceEvidenceContentSha256: string;
            readonly assessmentContentSha256: string;
            readonly requiredItems: readonly {
                readonly jurisdictionalInstrumentId: string;
                readonly instrumentCode: StatutoryInstrumentCode;
            }[];
            readonly reviewedAt: string;
            readonly reviewedBy: string;
            readonly serverReceipt?: {
                readonly receiptId: string;
                readonly issuer: "barch-governance-service";
                readonly issuanceBoundary: "server_only";
                readonly issuedAt: string;
                readonly payloadContentSha256: string;
            };
        };
    };
    readonly items: readonly EntitlementLedgerItemInput[];
}
export interface EntitlementLedgerItemResult extends EntitlementLedgerItemInput {
    readonly resolution: "known" | "not_applicable" | "unresolved" | "blocked";
    readonly modeledCostBrl: MoneyBrl | null;
    readonly blockers: readonly string[];
}
export interface EntitlementLedgerResult {
    readonly state: "ready" | "conditional" | "blocked" | "invalid";
    readonly asOfDate: string;
    readonly items: readonly EntitlementLedgerItemResult[];
    readonly confirmedCostBrl: MoneyBrl;
    readonly quotedCostBrl: MoneyBrl;
    readonly estimatedCostBrl: MoneyBrl;
    readonly totalModeledCostBrl: MoneyBrl;
    readonly additionalComputableAreaM2: ExactDecimal;
    readonly deductedComputableAreaM2: ExactDecimal;
    readonly netAdditionalComputableAreaM2: ExactDecimal;
    readonly requiredLandCessionAreaM2: ExactDecimal;
    readonly maximumScheduleImpactMonths: ExactDecimal;
    readonly unresolvedItemIds: readonly string[];
    readonly blockingItemIds: readonly string[];
    readonly blockers: readonly string[];
    readonly warnings: readonly string[];
}
export type LandComparableKind = "closed_transaction" | "asking_price" | "broker_opinion" | "auction" | "internal_transaction";
export type ComparableAdjustmentKind = "negotiation" | "time" | "location" | "scale" | "shape_frontage" | "topography_soil" | "buildability" | "infrastructure" | "occupancy_demolition" | "legal_liquidity" | "other";
export interface ComparableAdjustment {
    readonly id: string;
    readonly kind: ComparableAdjustmentKind;
    /** Ajuste assinado aplicado multiplicativamente; ex.: -8 = fator 0,92. */
    readonly adjustmentPct: ExactDecimal;
    readonly rationale: string;
    readonly evidenceSnapshotId: string;
}
export interface LandComparableInput {
    readonly id: string;
    readonly label: string;
    readonly kind: LandComparableKind;
    readonly observedOn: string;
    readonly sourcePartyId: string;
    readonly evidenceSnapshotId: string;
    readonly totalPriceBrl: MoneyBrl;
    readonly normalizationAreaM2: ExactDecimal;
    /** Peso explicitamente curado. O motor não infere qualidade ou proximidade. */
    readonly weight: ExactDecimal;
    readonly adjustments: readonly ComparableAdjustment[];
    /**
     * Extração canônica emitida no boundary server-only. Os campos duplicados
     * acima permanecem como DTO de cálculo, mas só são consumidos quando
     * reconciliam integralmente com este atesto.
     */
    readonly comparableAssessment: {
        readonly assessmentId: string;
        readonly marketRecordId: string;
        /** Obrigatório para transações fechadas; null para ofertas/opiniões/leilões. */
        readonly transactionId: string | null;
        /** Identidade canônica da fonte, emitida pelo registro de partes do servidor. */
        readonly sourcePartyCanonicalId: string;
        readonly evidenceSnapshotId: string;
        readonly sourceEvidenceContentSha256: string;
        /** Digest SHA-256 calculado sobre o payload canônico da extração. */
        readonly assessmentContentSha256: string;
        readonly reviewedAt: string;
        readonly reviewedBy: string;
        readonly assessedPayload: {
            readonly label: string;
            readonly kind: LandComparableKind;
            readonly observedOn: string;
            readonly sourcePartyId: string;
            readonly totalPriceBrl: MoneyBrl;
            readonly normalizationAreaM2: ExactDecimal;
            readonly weight: ExactDecimal;
            readonly adjustments: readonly ComparableAdjustment[];
        };
        readonly serverReceipt?: {
            readonly receiptId: string;
            readonly issuer: "barch-governance-service";
            readonly issuanceBoundary: "server_only";
            readonly issuedAt: string;
            readonly payloadContentSha256: string;
        };
    };
}
export interface LandComparablePolicy {
    readonly policyId: string;
    readonly minimumComparableCount: number;
    readonly minimumClosedTransactionCount: number;
    readonly minimumIndependentSources: number;
    readonly maximumAgeMonths: number;
    readonly maximumSingleComparableWeightPct: ExactDecimal;
    readonly maximumSourceConcentrationPct: ExactDecimal;
}
export interface LandComparableValuationInput {
    readonly asOfDate: string;
    readonly calculatedAt: string;
    readonly normalizationBasis: "land_area_m2" | "computable_area_m2";
    readonly subjectNormalizationAreaM2: ExactDecimal;
    readonly evidence: readonly TerrainEvidenceRef[];
    readonly policy: LandComparablePolicy;
    readonly comparables: readonly LandComparableInput[];
}
export interface LandComparableResult {
    readonly id: string;
    readonly label: string;
    readonly kind: LandComparableKind;
    readonly sourcePartyId: string;
    readonly weight: ExactDecimal;
    readonly rawUnitValueBrl: MoneyBrl;
    readonly cumulativeAdjustmentFactor: ExactDecimal;
    readonly adjustedUnitValueBrl: MoneyBrl;
    readonly indicatedSubjectValueBrl: MoneyBrl;
    readonly warnings: readonly string[];
}
export interface LandMarketValuationResult {
    readonly state: "ready" | "insufficient" | "invalid";
    readonly normalizationBasis: "land_area_m2" | "computable_area_m2";
    readonly subjectNormalizationAreaM2: ExactDecimal;
    readonly comparableCount: number;
    readonly closedTransactionCount: number;
    readonly independentSourceCount: number;
    readonly maximumComparableWeightPct: ExactDecimal;
    readonly maximumSourceConcentrationPct: ExactDecimal;
    readonly comparables: readonly LandComparableResult[];
    readonly lowUnitValueBrl: MoneyBrl | null;
    readonly medianUnitValueBrl: MoneyBrl | null;
    readonly highUnitValueBrl: MoneyBrl | null;
    readonly weightedMeanUnitValueBrl: MoneyBrl | null;
    readonly lowSubjectValueBrl: MoneyBrl | null;
    readonly medianSubjectValueBrl: MoneyBrl | null;
    readonly highSubjectValueBrl: MoneyBrl | null;
    readonly blockers: readonly string[];
    readonly warnings: readonly string[];
}
export type ResidualCostCategory = "construction" | "professional_services" | "approvals" | "taxes" | "finance" | "marketing_sales" | "contingency" | "developer_return" | "other";
export interface ResidualCostLineInput {
    readonly id: string;
    readonly label: string;
    readonly category: ResidualCostCategory;
    /** Custos estatutários pertencem exclusivamente ao entitlement ledger. */
    readonly scope: "non_statutory";
    readonly amountBrl: MoneyBrl;
    readonly evidenceSnapshotIds: readonly string[];
    readonly note: string;
    /**
     * Classificação e valor reconciliados por avaliação versionada. Isto impede
     * que `scope: non_statutory` ou custo zero sejam meras flags do caller.
     */
    readonly costAssessment: {
        readonly assessmentId: string;
        readonly costLineId: string;
        readonly category: ResidualCostCategory;
        readonly scopeDetermination: "non_statutory";
        readonly determination: "applicable" | "not_applicable";
        readonly assessedAmountBrl: MoneyBrl;
        readonly assessmentSnapshotId: string;
        readonly sourceEvidenceContentSha256: string;
        readonly assessmentContentSha256: string;
        readonly reviewedAt: string;
        readonly reviewedBy: string;
        readonly serverReceipt?: {
            readonly receiptId: string;
            readonly issuer: "barch-governance-service";
            readonly issuanceBoundary: "server_only";
            readonly issuedAt: string;
            readonly payloadContentSha256: string;
        };
    };
}
export interface ResidualLandValueInput {
    readonly grossRevenueBrl: MoneyBrl;
    readonly revenueEvidenceSnapshotIds: readonly string[];
    readonly revenueAssessment: {
        readonly assessmentId: string;
        readonly assessedGrossRevenueBrl: MoneyBrl;
        readonly sourceEvidenceContentSha256: string;
        readonly assessmentContentSha256: string;
        readonly reviewedAt: string;
        readonly reviewedBy: string;
        readonly assessedPayload: {
            readonly grossRevenueBrl: MoneyBrl;
            readonly revenueEvidenceSnapshotIds: readonly string[];
            readonly statutoryCostTreatment: ResidualLandValueInput["statutoryCostTreatment"];
        };
        readonly serverReceipt?: {
            readonly receiptId: string;
            readonly issuer: "barch-governance-service";
            readonly issuanceBoundary: "server_only";
            readonly issuedAt: string;
            readonly payloadContentSha256: string;
        };
    };
    readonly statutoryCostTreatment: "ledger_only_excluded_from_cost_lines";
    readonly costLines: readonly ResidualCostLineInput[];
}
export interface ResidualLandValueResult {
    readonly state: "ready" | "blocked" | "invalid";
    readonly grossRevenueBrl: MoneyBrl;
    readonly nonLandCostBrl: MoneyBrl;
    readonly entitlementCostBrl: MoneyBrl;
    readonly totalBeforeLandBrl: MoneyBrl;
    readonly rawResidualLandValueBrl: MoneyBrl;
    /** Orçamento residual total disponível para aquisição, incluindo custos transacionais. */
    readonly maximumAllInAcquisitionCostBrl: MoneyBrl | null;
    /** @deprecated Alias histórico do teto all-in; não representa preço líquido do proprietário. */
    readonly maximumSupportableLandValueBrl: MoneyBrl | null;
    readonly blockers: readonly string[];
    readonly warnings: readonly string[];
}
export interface LandValueReferencesInput {
    readonly askingPriceBrl: MoneyBrl | null;
    readonly negotiatedPriceBrl: MoneyBrl | null;
    readonly contractedPriceBrl: MoneyBrl | null;
    readonly selectedBasis: "asking" | "negotiated" | "contracted" | "economic_reference" | null;
    readonly evidenceSnapshotIds: readonly string[];
    readonly decisionNote: string;
}
export interface LandValuePositionResult {
    readonly marketMedianBrl: MoneyBrl | null;
    /** Orçamento residual total da aquisição antes de deduzir custos transacionais. */
    readonly allInAcquisitionCeilingBrl: MoneyBrl | null;
    readonly transactionCostsBrl: MoneyBrl | null;
    /** Teto negociável do proprietário após deduzir custos transacionais do residual all-in. */
    readonly residualCeilingBrl: MoneyBrl | null;
    /** Menor entre mediana mercadológica e residual; não é recomendação/oferta. */
    readonly economicReferenceBrl: MoneyBrl | null;
    readonly askingPriceBrl: MoneyBrl | null;
    readonly negotiatedPriceBrl: MoneyBrl | null;
    readonly contractedPriceBrl: MoneyBrl | null;
    readonly selectedBasis: LandValueReferencesInput["selectedBasis"];
    readonly selectedLandValueBrl: MoneyBrl | null;
    readonly selectedVsMarketBrl: MoneyBrl | null;
    readonly selectedVsResidualBrl: MoneyBrl | null;
    readonly blockers: readonly string[];
    readonly warnings: readonly string[];
    readonly decisionBoundary: "human_only";
    readonly automaticRecommendation: false;
}
export type AcquisitionStructureKind = "cash" | "financial_swap" | "physical_swap" | "mixed" | "land_contribution";
export type AcquisitionLegInput = {
    readonly id: string;
    readonly kind: "cash";
    readonly label: string;
    readonly amountBrl: MoneyBrl;
    readonly due: "signing" | "closing" | "deferred";
} | {
    readonly id: string;
    readonly kind: "financial_swap";
    readonly label: string;
    readonly eligibleVgvBrl: MoneyBrl;
    readonly sharePct: ExactDecimal;
    readonly minimumBrl: MoneyBrl | null;
    readonly maximumBrl: MoneyBrl | null;
} | {
    readonly id: string;
    readonly kind: "physical_swap";
    readonly label: string;
    readonly quantity: ExactDecimal;
    readonly referenceUnitValueBrl: MoneyBrl;
    readonly avoidedSellingCostsPct: ExactDecimal;
    readonly incrementalTransferCostBrl: MoneyBrl;
} | {
    readonly id: string;
    readonly kind: "equity_contribution";
    readonly label: string;
    readonly recognizedLandValueBrl: MoneyBrl;
    readonly ownershipSharePct: ExactDecimal;
};
export interface AcquisitionStructureInput {
    readonly kind: AcquisitionStructureKind;
    readonly label: string;
    readonly evidenceSnapshotIds: readonly string[];
    readonly note: string;
    readonly legs: readonly AcquisitionLegInput[];
    /** Até existir fluxo de caixa datado/avaliado, toda consideração permanece nominal. */
    readonly temporalAssessment?: AcquisitionTemporalAssessment;
    /**
     * Custos de fechamento não constituem contraprestação ao proprietário.
     * Opcional apenas para compatibilidade de migração; ausência invalida o cálculo.
     */
    readonly transactionCosts?: readonly AcquisitionTransactionCostInput[];
    /** Cobertura explícita do catálogo, inclusive quando nenhum custo foi identificado. */
    readonly transactionCostCoverage?: AcquisitionTransactionCostCoverage;
}
export interface AcquisitionTemporalAssessment {
    readonly assessmentId: string;
    readonly state: "nominal_unresolved";
    readonly cashFlowDatesComplete: false;
    readonly valuationDate: null;
    readonly discountRatePct: null;
    readonly indexationBasis: null;
    readonly assessedAt: string;
    readonly assessedBy: string;
    readonly evidenceSnapshotIds: readonly string[];
    readonly assessmentContentSha256: string;
}
export type AcquisitionTransactionCostCategory = "transfer_tax" | "notary_registration" | "brokerage" | "legal_due_diligence" | "technical_due_diligence" | "financing";
export interface AcquisitionTransactionCostCoverage {
    readonly assessmentId: string;
    readonly catalogId: string;
    readonly reviewedCategories: readonly AcquisitionTransactionCostCategory[];
    readonly conclusion: "costs_listed" | "no_additional_costs_identified";
    readonly assessedAt: string;
    readonly assessedBy: string;
    readonly evidenceSnapshotIds: readonly string[];
    readonly sourceEvidenceContentSha256: string;
    readonly assessmentContentSha256: string;
    readonly assessedPayload: {
        readonly conclusion: AcquisitionTransactionCostCoverage["conclusion"];
        readonly reviewedCategories: readonly AcquisitionTransactionCostCategory[];
        readonly categoryAssessments: readonly {
            readonly category: AcquisitionTransactionCostCategory;
            readonly determination: "applicable" | "not_applicable";
            readonly assessedTotalBrl: MoneyBrl;
        }[];
        readonly transactionCosts: readonly AcquisitionTransactionCostInput[];
    };
    readonly serverReceipt?: {
        readonly receiptId: string;
        readonly issuer: "barch-governance-service";
        readonly issuanceBoundary: "server_only";
        readonly issuedAt: string;
        readonly payloadContentSha256: string;
    };
}
export interface AcquisitionTransactionCostInput {
    readonly id: string;
    readonly label: string;
    readonly category: AcquisitionTransactionCostCategory;
    readonly amountBrl: MoneyBrl;
    readonly evidenceSnapshotIds: readonly string[];
    readonly note: string;
}
export interface AcquisitionTransactionCostResult extends AcquisitionTransactionCostInput {
    readonly amountBrl: MoneyBrl;
}
export interface AcquisitionLegResult {
    readonly id: string;
    readonly kind: AcquisitionLegInput["kind"];
    readonly label: string;
    readonly economicConsiderationBrl: MoneyBrl;
    readonly immediateCashBrl: MoneyBrl;
    readonly contingentConsiderationBrl: MoneyBrl;
    readonly note: string;
}
export interface AcquisitionStructureResult {
    readonly state: "ready" | "conditional" | "invalid";
    readonly kind: AcquisitionStructureKind;
    readonly label: string;
    readonly legs: readonly AcquisitionLegResult[];
    readonly transactionCosts: readonly AcquisitionTransactionCostResult[];
    readonly transactionCostCoverage: AcquisitionTransactionCostCoverage | null;
    readonly temporalAssessment: AcquisitionTemporalAssessment | null;
    readonly valuationBasis: "nominal_unadjusted" | null;
    readonly nominalOwnerConsiderationBrl: MoneyBrl;
    readonly nominalAllInAcquisitionCostBrl: MoneyBrl;
    readonly nominalSigningOrClosingCashBrl: MoneyBrl;
    /** @deprecated Alias nominal; não representa valor presente econômico. */
    /** Alias compatível: representa somente a contraprestação ao proprietário. */
    readonly totalEconomicConsiderationBrl: MoneyBrl;
    /** @deprecated Alias nominal até existir assessment temporal. */
    readonly ownerEconomicConsiderationBrl: MoneyBrl;
    readonly transactionCostsBrl: MoneyBrl;
    /** @deprecated Alias nominal até existir assessment temporal. */
    readonly allInAcquisitionCostBrl: MoneyBrl;
    /** @deprecated Use nominalSigningOrClosingCashBrl; fechamento não significa caixa imediato. */
    readonly immediateCashBrl: MoneyBrl;
    readonly nonCashOrContingentBrl: MoneyBrl;
    readonly blockers: readonly string[];
    readonly warnings: readonly string[];
}
export interface TerrainParcelGeometryPayload {
    readonly parcelId: string;
    readonly parcelEvidenceSnapshotId: string;
    readonly geometryEvidenceSnapshotId: string;
    readonly geometryContentSha256: string;
    readonly sourceFormat: "dwg" | "svg" | "pdf_vector" | "geospatial";
    /** DWG/SVG/geospatial devem ser 1:1; PDF vetorial declara sua escala gráfica. */
    readonly sourceScale: string;
    readonly sourceArtifactLocator: string;
    readonly geometryType: "Polygon" | "MultiPolygon";
    readonly geometryDimension: "2D" | "2.5D" | "3D";
    readonly canonicalCrs: string;
    readonly horizontalDatum: string;
    readonly verticalDatum: string | null;
    readonly coordinateUnit: "m";
    readonly areaM2: ExactDecimal;
    readonly benchmarks: readonly TerrainGeometryBenchmark[];
    readonly controlDimensions: readonly TerrainGeometryControlDimension[];
    readonly boundaryEdges: readonly TerrainGeometryBoundaryEdge[];
    readonly topologyState: "verified" | "unverified" | "invalid";
    readonly spatialBindingState: "verified" | "unverified" | "rejected";
    readonly verifiedAt: string | null;
    readonly verifiedBy: string | null;
}
export interface TerrainParcelGeometryProvenance extends TerrainParcelGeometryPayload {
    /**
     * Extração canônica do artefato. Mantida opcional apenas durante migração de
     * DTOs; o motor sempre bloqueia o cenário quando o atesto estiver ausente.
     */
    readonly geometryAssessment?: {
        readonly assessmentId: string;
        readonly geometryEvidenceSnapshotId: string;
        readonly sourceEvidenceContentSha256: string;
        readonly assessmentContentSha256: string;
        readonly reviewedAt: string;
        readonly reviewedBy: string;
        readonly assessedPayload: TerrainParcelGeometryPayload;
        readonly serverReceipt?: {
            readonly receiptId: string;
            readonly issuer: "barch-governance-service";
            readonly issuanceBoundary: "server_only";
            readonly issuedAt: string;
            readonly payloadContentSha256: string;
        };
    };
}
export interface TerrainGeometryBenchmark {
    readonly id: string;
    readonly eastingM: ExactDecimal;
    readonly northingM: ExactDecimal;
    readonly elevationM: ExactDecimal | null;
}
export interface TerrainGeometryControlDimension {
    readonly id: string;
    readonly label: string;
    readonly lengthM: ExactDecimal;
    readonly bearingDeg: ExactDecimal;
}
export interface TerrainGeometryBoundaryEdge {
    readonly id: string;
    readonly fromVertexId: string;
    readonly toVertexId: string;
    readonly lengthM: ExactDecimal;
}
export interface TerrainTowerCapacityPayload {
    readonly envelopeSnapshotId: string;
    readonly lotAreaM2: ExactDecimal;
    /** Área remanescente após cessões estatutárias, usada pelo envelope. */
    readonly netDevelopableLotAreaM2: ExactDecimal;
    readonly buildableGroundAreaM2: ExactDecimal;
    readonly baseComputableAreaM2: ExactDecimal;
    readonly additionalComputableAreaM2: ExactDecimal;
    readonly totalAboveGroundAreaM2: ExactDecimal;
    readonly totalBelowGroundAreaM2: ExactDecimal;
    readonly podiumFootprintM2: ExactDecimal;
    readonly typicalTowerFloorAreaM2: ExactDecimal;
    readonly maximumHeightM: ExactDecimal;
    readonly aboveGroundFloorCount: number;
    readonly basementFloorCount: number;
    readonly constraintRuleIds: readonly string[];
}
export interface TerrainTowerCapacityInput extends TerrainTowerCapacityPayload {
    /** Extração canônica do envelope; valores top-level só valem se reconciliados. */
    readonly capacityAssessment: {
        readonly assessmentId: string;
        readonly envelopeSnapshotId: string;
        readonly sourceEvidenceContentSha256: string;
        readonly assessmentContentSha256: string;
        readonly reviewedAt: string;
        readonly reviewedBy: string;
        readonly assessedPayload: TerrainTowerCapacityPayload;
        /** Somente um serviço server-side pode preencher este recibo. */
        readonly serverReceipt?: {
            readonly receiptId: string;
            readonly issuer: "barch-governance-service";
            readonly issuanceBoundary: "server_only";
            readonly issuedAt: string;
            readonly payloadContentSha256: string;
        };
    };
}
export interface TerrainFeasibilityScenarioInput {
    readonly scenarioId: string;
    readonly label: string;
    readonly dataMode: "synthetic" | "governed";
    readonly asOfDate: string;
    readonly calculatedAt: string;
    readonly normativeState: "published" | "draft" | "stale" | "missing";
    readonly evidence: readonly TerrainEvidenceRef[];
    readonly parcelGeometry: TerrainParcelGeometryProvenance;
    readonly capacity: TerrainTowerCapacityInput;
    readonly entitlementLedger: EntitlementLedgerInput;
    readonly marketValuation: LandComparableValuationInput;
    readonly residualValue: ResidualLandValueInput;
    readonly landValues: LandValueReferencesInput;
    readonly acquisition: AcquisitionStructureInput;
}
export interface TerrainToTowerDirective {
    readonly contractVersion: "terrain-to-tower/1.0";
    readonly engineVersion: typeof TERRAIN_FEASIBILITY_ENGINE_VERSION;
    readonly scenarioId: string;
    readonly label: string;
    readonly dataMode: TerrainFeasibilityScenarioInput["dataMode"];
    readonly calculatedAt: string;
    readonly readiness: "ready" | "conditional" | "blocked";
    readonly decisionBoundary: "human_only";
    readonly automaticRecommendation: false;
    readonly sourceSnapshotIds: readonly string[];
    readonly parcelGeometry: TerrainParcelGeometryProvenance;
    readonly capacity: TerrainTowerCapacityInput;
    readonly statutory: EntitlementLedgerResult;
    readonly market: LandMarketValuationResult;
    readonly residual: ResidualLandValueResult;
    readonly landValue: LandValuePositionResult;
    readonly acquisition: AcquisitionStructureResult;
    /** Teto residual owner-only menos aquisição all-in; negativo bloqueia o cenário. */
    readonly residualHeadroomAfterAcquisitionBrl: MoneyBrl | null;
    readonly allInSiteBasisValuation: "nominal_unadjusted" | null;
    readonly allInSiteBasisBrl: MoneyBrl | null;
    readonly blockers: readonly string[];
    readonly warnings: readonly string[];
}
export interface TerrainScenarioMatrixRow {
    readonly scenarioId: string;
    readonly label: string;
    readonly readiness: TerrainToTowerDirective["readiness"];
    readonly totalAboveGroundAreaM2: ExactDecimal;
    readonly entitlementCostBrl: MoneyBrl;
    readonly marketMedianBrl: MoneyBrl | null;
    readonly allInAcquisitionCeilingBrl: MoneyBrl | null;
    readonly residualCeilingBrl: MoneyBrl | null;
    readonly selectedLandValueBrl: MoneyBrl | null;
    readonly acquisitionValuationBasis: AcquisitionStructureResult["valuationBasis"];
    readonly acquisitionConsiderationBrl: MoneyBrl | null;
    readonly residualHeadroomAfterAcquisitionBrl: MoneyBrl | null;
    readonly blockerCount: number;
}
export interface TerrainScenarioSetResult {
    readonly engineVersion: typeof TERRAIN_FEASIBILITY_ENGINE_VERSION;
    readonly state: "ready" | "conditional" | "blocked" | "invalid";
    readonly blockers: readonly string[];
    readonly decisionBoundary: "human_only";
    readonly automaticRecommendation: false;
    readonly orderingMeaning: "input_order_only";
    readonly directives: readonly TerrainToTowerDirective[];
    readonly matrix: readonly TerrainScenarioMatrixRow[];
}
