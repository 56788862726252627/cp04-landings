// Paso 16 · Fase 4 — Traduce hallazgos de seoAnalyzer.js a Evidence
// válidas (evidenceSchema.js, Paso 12), para que fluyan por el MISMO
// motor de dimensiones/scoring que cualquier otra fuente. Nunca incluye
// un timestamp real (rompería el hash determinista/idempotencia — mismo
// principio que publicWebsiteFetcher.js, Paso 13/16).

import { createEvidence } from "../../evidenceSchema.js";

const STATUS_TO_CLASSIFICATION = Object.freeze({
  observed: "confirmed",
  calculated: "confirmed",
  inferred: "inferred",
  unavailable: "unavailable",
  unverified: "unknown",
  blocked: "unavailable",
  fixture: "confirmed",
});

/**
 * @param {object} finding - de seoAnalyzer.js (analyzeSeoForPage/analyzeSeoForPages)
 * @param {{sourceProviderId?: string, profileId?: string|null}} context
 * @returns {object} Evidence (createEvidence)
 */
export function buildEvidenceFromSeoFinding(finding, { sourceProviderId = "publicWebsiteFetcher", profileId = null } = {}) {
  const classification = STATUS_TO_CLASSIFICATION[finding.status] ?? "unknown";
  const normalizedContent = `seoProvider|${finding.id}|${finding.url}|${JSON.stringify(finding.observedValue)}`;

  return createEvidence({
    sourceId: finding.url,
    sourceType: "seo_analysis_derived",
    title: finding.title,
    excerpt: finding.title,
    normalizedContent,
    classification,
    relatedDimension: finding.dimension,
    signal: { strength: finding.strength, polarity: finding.polarity },
    confidence: finding.confidence,
    provenance: `seoProvider:${finding.category}:${finding.id}`,
    limitations: finding.limitations,
    metadata: {
      providerId: "seoProvider",
      sourceProviderId,
      category: finding.category,
      severity: finding.severity,
      rule: finding.rule,
      ruleId: finding.id,
      observedValue: finding.observedValue,
      evidenceKind: finding.status, // vocabulario preciso: observed/calculated/inferred/unavailable/unverified/blocked/fixture
      profileId,
    },
  });
}

export function buildEvidenceFromSeoFindings(findings, context = {}) {
  return findings.map((f) => buildEvidenceFromSeoFinding(f, context));
}
