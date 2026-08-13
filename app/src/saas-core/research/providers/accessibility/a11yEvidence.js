// Paso 17 · Fase 4 — Traduce hallazgos de a11yAnalyzer.js a Evidence
// válidas (evidenceSchema.js, Paso 12), para que fluyan por el mismo
// motor de dimensiones/scoring que cualquier otra fuente. Nunca incluye
// un timestamp real (rompería el hash determinista/idempotencia — mismo
// principio que publicWebsiteFetcher.js/seoEvidence.js).

import { createEvidence } from "../../evidenceSchema.js";

const STATUS_TO_CLASSIFICATION = Object.freeze({
  observed: "confirmed",
  calculated: "confirmed",
  inferred: "inferred",
  unavailable: "unavailable",
  unverified: "unknown",
  blocked: "unavailable",
  manual_required: "unknown",
  fixture: "confirmed",
});

/**
 * @param {object} finding - de a11yAnalyzer.js
 * @param {{sourceProviderId?: string, profileId?: string|null}} context
 * @returns {object} Evidence (createEvidence)
 */
export function buildEvidenceFromA11yFinding(finding, { sourceProviderId = "publicWebsiteFetcher", profileId = null } = {}) {
  const classification = STATUS_TO_CLASSIFICATION[finding.status] ?? "unknown";
  const normalizedContent = `accessibilityProvider|${finding.id}|${finding.url}|${JSON.stringify(finding.observedValue)}`;

  return createEvidence({
    sourceId: finding.url,
    sourceType: "accessibility_analysis_derived",
    title: finding.title,
    excerpt: finding.title,
    normalizedContent,
    classification,
    relatedDimension: finding.dimension,
    signal: { strength: finding.strength, polarity: finding.polarity },
    confidence: finding.confidence,
    provenance: `accessibilityProvider:${finding.category}:${finding.id}`,
    limitations: finding.limitations,
    metadata: {
      providerId: "accessibilityProvider",
      sourceProviderId,
      category: finding.category,
      severity: finding.severity,
      checkType: finding.checkType,
      rule: finding.rule,
      ruleId: finding.id,
      observedValue: finding.observedValue,
      evidenceKind: finding.status,
      element: finding.element,
      selector: finding.selector,
      wcag: finding.wcag,
      profileId,
    },
  });
}

export function buildEvidenceFromA11yFindings(findings, context = {}) {
  return findings.map((f) => buildEvidenceFromA11yFinding(f, context));
}
