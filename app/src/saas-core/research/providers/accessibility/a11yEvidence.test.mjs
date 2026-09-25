import { test } from "node:test";
import assert from "node:assert/strict";

import { buildEvidenceFromA11yFinding, buildEvidenceFromA11yFindings } from "./a11yEvidence.js";
import { validateEvidence } from "../../evidenceSchema.js";
import { analyzeAccessibilityForPage } from "./a11yAnalyzer.js";

function sampleFinding(overrides = {}) {
  return {
    id: "a11y.document.lang",
    category: "document",
    dimension: "accessibility",
    status: "observed",
    severity: "critical",
    checkType: "automatic",
    polarity: "negative",
    strength: 1,
    confidence: 1,
    title: "Sin lang",
    observedValue: null,
    rule: "regla de ejemplo",
    url: "https://x.example/",
    element: null,
    selector: null,
    wcag: { criterion: "3.1.1", level: "A", technique: null },
    limitations: [],
    ...overrides,
  };
}

test("buildEvidenceFromA11yFinding produce una Evidence válida contra evidenceSchema.js", () => {
  const ev = buildEvidenceFromA11yFinding(sampleFinding());
  const { valid, errors } = validateEvidence(ev);
  assert.equal(valid, true, JSON.stringify(errors));
  assert.equal(ev.sourceType, "accessibility_analysis_derived");
  assert.equal(ev.relatedDimension, "accessibility");
});

test("buildEvidenceFromA11yFinding traduce status a classification correctamente", () => {
  assert.equal(buildEvidenceFromA11yFinding(sampleFinding({ status: "observed" })).classification, "confirmed");
  assert.equal(buildEvidenceFromA11yFinding(sampleFinding({ status: "manual_required" })).classification, "unknown");
  assert.equal(buildEvidenceFromA11yFinding(sampleFinding({ status: "unavailable" })).classification, "unavailable");
});

test("buildEvidenceFromA11yFinding conserva providerId/checkType/wcag/severidad en metadata", () => {
  const ev = buildEvidenceFromA11yFinding(sampleFinding(), { sourceProviderId: "publicWebsiteFetcher", profileId: "clinica" });
  assert.equal(ev.metadata.providerId, "accessibilityProvider");
  assert.equal(ev.metadata.checkType, "automatic");
  assert.deepEqual(ev.metadata.wcag, { criterion: "3.1.1", level: "A", technique: null });
  assert.equal(ev.metadata.profileId, "clinica");
});

test("buildEvidenceFromA11yFinding nunca incluye un timestamp real (idempotencia)", () => {
  const ev = buildEvidenceFromA11yFinding(sampleFinding());
  assert.equal("timestamp" in ev.metadata, false);
});

test("dos findings idénticos producen el mismo contentHash/evidenceId (determinismo)", () => {
  const a = buildEvidenceFromA11yFinding(sampleFinding());
  const b = buildEvidenceFromA11yFinding(sampleFinding());
  assert.equal(a.contentHash, b.contentHash);
  assert.equal(a.evidenceId, b.evidenceId);
});

test("buildEvidenceFromA11yFindings produce Evidence válida por cada finding real de a11yAnalyzer", () => {
  const page = { url: "https://x.example/", body: "<html><head><title>t</title></head></html>" };
  const findings = analyzeAccessibilityForPage(page);
  const evidenceList = buildEvidenceFromA11yFindings(findings, { profileId: "generic" });
  assert.equal(evidenceList.length, findings.length);
  for (const ev of evidenceList) {
    const { valid, errors } = validateEvidence(ev);
    assert.equal(valid, true, JSON.stringify(errors));
  }
});
