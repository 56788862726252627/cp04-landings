import { test } from "node:test";
import assert from "node:assert/strict";

import { buildEvidenceFromSeoFinding, buildEvidenceFromSeoFindings } from "./seoEvidence.js";
import { validateEvidence } from "../../evidenceSchema.js";
import { analyzeSeoForPage } from "./seoAnalyzer.js";

function sampleFinding(overrides = {}) {
  return {
    id: "seo.metadata.title",
    category: "metadata",
    dimension: "seoContent",
    status: "observed",
    severity: "low",
    polarity: "positive",
    strength: 0.3,
    confidence: 0.9,
    title: "Title correcto",
    observedValue: "Mi título",
    rule: "regla de ejemplo",
    url: "https://x.example/",
    limitations: [],
    ...overrides,
  };
}

test("buildEvidenceFromSeoFinding produce una Evidence válida contra evidenceSchema.js", () => {
  const ev = buildEvidenceFromSeoFinding(sampleFinding());
  const { valid, errors } = validateEvidence(ev);
  assert.equal(valid, true, JSON.stringify(errors));
  assert.equal(ev.sourceType, "seo_analysis_derived");
});

test("buildEvidenceFromSeoFinding traduce status a classification correctamente", () => {
  assert.equal(buildEvidenceFromSeoFinding(sampleFinding({ status: "observed" })).classification, "confirmed");
  assert.equal(buildEvidenceFromSeoFinding(sampleFinding({ status: "inferred" })).classification, "inferred");
  assert.equal(buildEvidenceFromSeoFinding(sampleFinding({ status: "unavailable" })).classification, "unavailable");
  assert.equal(buildEvidenceFromSeoFinding(sampleFinding({ status: "unverified" })).classification, "unknown");
  assert.equal(buildEvidenceFromSeoFinding(sampleFinding({ status: "blocked" })).classification, "unavailable");
});

test("buildEvidenceFromSeoFinding conserva providerId/sourceProviderId/severidad/regla/perfil en metadata", () => {
  const ev = buildEvidenceFromSeoFinding(sampleFinding(), { sourceProviderId: "publicWebsiteFetcher", profileId: "restaurante" });
  assert.equal(ev.metadata.providerId, "seoProvider");
  assert.equal(ev.metadata.sourceProviderId, "publicWebsiteFetcher");
  assert.equal(ev.metadata.severity, "low");
  assert.equal(ev.metadata.profileId, "restaurante");
  assert.equal(ev.metadata.evidenceKind, "observed");
});

test("buildEvidenceFromSeoFinding nunca incluye un timestamp real (idempotencia)", () => {
  const ev = buildEvidenceFromSeoFinding(sampleFinding());
  assert.equal("timestamp" in ev.metadata, false);
  assert.equal("fetchedAt" in ev.metadata, false);
  assert.equal("capturedAt" in ev.metadata, false);
});

test("dos findings idénticos producen el mismo contentHash/evidenceId (determinismo)", () => {
  const a = buildEvidenceFromSeoFinding(sampleFinding());
  const b = buildEvidenceFromSeoFinding(sampleFinding());
  assert.equal(a.contentHash, b.contentHash);
  assert.equal(a.evidenceId, b.evidenceId);
});

test("buildEvidenceFromSeoFindings produce una Evidence válida por cada finding real de seoAnalyzer", () => {
  const page = { url: "https://x.example/", httpStatus: 200, body: "<html><head><title>t</title></head></html>", headers: {}, robotsTxt: { available: false, content: "" }, redirectChain: [] };
  const findings = analyzeSeoForPage(page);
  const evidenceList = buildEvidenceFromSeoFindings(findings, { profileId: "generic" });
  assert.equal(evidenceList.length, findings.length);
  for (const ev of evidenceList) {
    const { valid, errors } = validateEvidence(ev);
    assert.equal(valid, true, JSON.stringify(errors));
  }
});
