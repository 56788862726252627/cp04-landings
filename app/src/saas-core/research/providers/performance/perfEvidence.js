// Paso 18 · Fase 4 — Traduce hallazgos de perfAnalyzer.js a Evidence
// válidas (evidenceSchema.js, Paso 12), para que fluyan por el mismo
// motor de dimensiones/scoring que cualquier otra fuente. Nunca incluye
// un timestamp real (rompería el hash determinista/idempotencia — mismo
// principio que publicWebsiteFetcher.js/seoEvidence.js/a11yEvidence.js).

import { createEvidence } from "../../evidenceSchema.js";

const STATUS_TO_CLASSIFICATION = Object.freeze({
  observed: "confirmed",
  measured: "confirmed",
  calculated: "confirmed",
  estimated: "inferred",
  not_measured: "unavailable",
  unavailable: "unavailable",
  fixture: "confirmed",
});

/**
 * @param {object} finding - de perfAnalyzer.js
 * @param {{sourceProviderId?: string, profileId?: string|null}} context
 * @returns {object} Evidence (createEvidence)
 */
export function buildEvidenceFromPerfFinding(finding, { sourceProviderId = "publicWebsiteFetcher", profileId = null } = {}) {
  const classification = STATUS_TO_CLASSIFICATION[finding.status] ?? "unknown";
  const normalizedContent = `performanceProvider|${finding.id}|${finding.url}|${JSON.stringify(finding.value)}`;

  return createEvidence({
    sourceId: finding.url,
    sourceType: "performance_analysis_derived",
    title: finding.title,
    excerpt: finding.title,
    normalizedContent,
    classification,
    relatedDimension: finding.dimension,
    signal: { strength: finding.strength, polarity: finding.polarity },
    confidence: finding.confidence,
    provenance: `performanceProvider:${finding.category}:${finding.id}`,
    limitations: finding.limitations,
    metadata: {
      providerId: "performanceProvider",
      sourceProviderId,
      category: finding.category,
      severity: finding.severity,
      metric: finding.metric,
      unit: finding.unit,
      measurementType: finding.status,
      rule: finding.rule,
      ruleId: finding.id,
      value: finding.value,
      evidenceKind: finding.status,
      profileId,
    },
  });
}

export function buildEvidenceFromPerfFindings(findings, context = {}) {
  return findings.map((f) => buildEvidenceFromPerfFinding(f, context));
}
