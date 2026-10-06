import type { LandComparableInput, LandComparableValuationInput, LandMarketValuationResult } from "./types";
type ComparableAssessment = LandComparableInput["comparableAssessment"];
export declare function comparableAssessmentPayloadSha256(assessment: Pick<ComparableAssessment, "marketRecordId" | "transactionId" | "sourcePartyCanonicalId" | "evidenceSnapshotId" | "assessedPayload">): string;
export declare function calculateLandMarketValuation(input: LandComparableValuationInput): LandMarketValuationResult;
export {};
