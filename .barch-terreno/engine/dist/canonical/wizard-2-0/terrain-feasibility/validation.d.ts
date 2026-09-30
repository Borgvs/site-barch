import type { TerrainEvidenceRef } from "./types";
export declare function isIsoDate(value: string): boolean;
export declare function isIsoInstant(value: string): boolean;
export declare function hasUniqueNonEmptyIds(rows: readonly {
    id: string;
}[]): boolean;
export declare function evidenceMap(evidence: readonly TerrainEvidenceRef[]): ReadonlyMap<string, TerrainEvidenceRef> | null;
export declare function allEvidenceRefsExist(refs: readonly string[], evidence: ReadonlyMap<string, TerrainEvidenceRef>): boolean;
export declare function monthsBetweenEarlierAndAsOf(earlier: string, asOf: string): number | null;
