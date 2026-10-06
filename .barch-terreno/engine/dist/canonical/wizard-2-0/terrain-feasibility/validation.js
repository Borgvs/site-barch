"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIsoDate = isIsoDate;
exports.isIsoInstant = isIsoInstant;
exports.hasUniqueNonEmptyIds = hasUniqueNonEmptyIds;
exports.evidenceMap = evidenceMap;
exports.allEvidenceRefsExist = allEvidenceRefsExist;
exports.monthsBetweenEarlierAndAsOf = monthsBetweenEarlierAndAsOf;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SHA256 = /^[0-9a-f]{64}$/;
function nonEmptyString(value) {
    return typeof value === "string" && Boolean(value.trim());
}
function isIsoDate(value) {
    if (!DATE.test(value))
        return false;
    const instant = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(instant.getTime())
        && instant.toISOString().slice(0, 10) === value;
}
function isIsoInstant(value) {
    if (typeof value !== "string")
        return false;
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
    if (match == null || !isIsoDate(match[1]))
        return false;
    const hour = Number(match[2]);
    const minute = Number(match[3]);
    const second = Number(match[4]);
    if (hour > 23 || minute > 59 || second > 59)
        return false;
    if (match[5] !== "Z") {
        const offsetHour = Number(match[7]);
        const offsetMinute = Number(match[8]);
        if (offsetHour > 14 || offsetMinute > 59 || (offsetHour === 14 && offsetMinute !== 0)) {
            return false;
        }
    }
    const time = Date.parse(value);
    return Number.isFinite(time);
}
function hasUniqueNonEmptyIds(rows) {
    const ids = rows.map((row) => typeof row?.id === "string" ? row.id.trim() : "");
    return ids.every(Boolean) && new Set(ids).size === ids.length;
}
function evidenceMap(evidence) {
    const map = new Map();
    const attestationIds = new Set();
    for (const source of evidence) {
        const governance = source.governance;
        if (!source.snapshotId.trim()
            || map.has(source.snapshotId)
            || !source.title.trim()
            || !source.locator.trim()
            || !isIsoDate(source.effectiveDate)
            || !isIsoInstant(source.capturedAt)
            || (source.contentSha256 != null && !SHA256.test(source.contentSha256))
            || (source.status === "published" && source.contentSha256 == null)
            || (governance != null && (source.status !== "published"
                || !nonEmptyString(governance.releaseId)
                || !nonEmptyString(governance.attestationId)
                || attestationIds.has(governance.attestationId)
                || !nonEmptyString(governance.approvedBy)
                || governance.issuer !== "barch-governance-service"
                || !SHA256.test(governance.immutableRecordSha256)
                || governance.immutableRecordSha256 !== source.contentSha256
                || !["server_verified", "unverified"].includes(governance.verificationState)
                || !isIsoInstant(governance.publishedAt)
                || !isIsoInstant(governance.verifiedAt)
                || Date.parse(governance.publishedAt) < Date.parse(source.capturedAt)
                || Date.parse(governance.verifiedAt) < Date.parse(governance.publishedAt)
                || governance.approvalState !== "approved"
                || !["curated_release", "server_attestation"]
                    .includes(governance.issuanceBoundary))))
            return null;
        if (governance != null)
            attestationIds.add(governance.attestationId);
        map.set(source.snapshotId, source);
    }
    return map;
}
function allEvidenceRefsExist(refs, evidence) {
    return refs.length > 0 && refs.every((id) => evidence.has(id));
}
function monthsBetweenEarlierAndAsOf(earlier, asOf) {
    if (!isIsoDate(earlier) || !isIsoDate(asOf) || earlier > asOf)
        return null;
    const [ey, em, ed] = earlier.split("-").map(Number);
    const [ay, am, ad] = asOf.split("-").map(Number);
    let months = (ay - ey) * 12 + (am - em);
    if (ad < ed)
        months -= 1;
    return months;
}
