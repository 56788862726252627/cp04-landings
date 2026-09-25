import { test } from "node:test";
import assert from "node:assert/strict";

import { buildEvidenceFromPerfFinding, buildEvidenceFromPerfFindings } from "./perfEvidence.js";
import { validateEvidence } from "../../evidenceSchema.js";
import { analyzePerformanceForPage } from "./perfAnalyzer.js";

function sampleFinding(overrides = {}) {
  return {
    id: "perf.html.size",
    category: "html",
    dimension: "performance",
    metric: "html.sizeBytes",
    unit: "bytes",
    status: "measured",
    severity: "low",
    polarity: "positive",
    strength: 0.1,
    confidence: 1,
    title: "HTML de 200 bytes",
    value: 200,
    rule: "regla de ejemplo",
    url: "https://x.example/",
    limitations: [],
    ...overrides,
  };
}

test("buildEvidenceFromPerfFinding produce una Evidence válida contra evidenceSchema.js", () => {
  const ev = buildEvidenceFromPerfFinding(sampleFinding());
  const { valid, errors } = validateEvidence(ev);
  assert.equal(valid, true, JSON.stringify(errors));
  assert.equal(ev.sourceType, "performance_analysis_derived");
  assert.equal(ev.relatedDimension, "performance");
});

test("buildEvidenceFromPerfFinding traduce status a classification correctamente", () => {
  assert.equal(buildEvidenceFromPerfFinding(sampleFinding({ status: "observed" })).classification, "confirmed");
  assert.equal(buildEvidenceFromPerfFinding(sampleFinding({ status: "estimated" })).classification, "inferred");
  assert.equal(buildEvidenceFromPerfFinding(sampleFinding({ status: "not_measured" })).classification, "unavailable");
  assert.equal(buildEvidenceFromPerfFinding(sampleFinding({ status: "unavailable" })).classification, "unavailable");
});

test("buildEvidenceFromPerfFinding conserva providerId/metric/unit/measurementType/severidad/perfil en metadata", () => {
  const ev = buildEvidenceFromPerfFinding(sampleFinding(), { sourceProviderId: "publicWebsiteFetcher", profileId: "hotel" });
  assert.equal(ev.metadata.providerId, "performanceProvider");
  assert.equal(ev.metadata.metric, "html.sizeBytes");
  assert.equal(ev.metadata.unit, "bytes");
  assert.equal(ev.metadata.measurementType, "measured");
  assert.equal(ev.metadata.profileId, "hotel");
});

test("buildEvidenceFromPerfFinding nunca incluye un timestamp real (idempotencia)", () => {
  const ev = buildEvidenceFromPerfFinding(sampleFinding());
  assert.equal("timestamp" in ev.metadata, false);
});

test("dos findings idénticos producen el mismo contentHash/evidenceId (determinismo)", () => {
  const a = buildEvidenceFromPerfFinding(sampleFinding());
  const b = buildEvidenceFromPerfFinding(sampleFinding());
  assert.equal(a.contentHash, b.contentHash);
  assert.equal(a.evidenceId, b.evidenceId);
});

test("buildEvidenceFromPerfFindings produce Evidence válida por cada finding real de perfAnalyzer", () => {
  const page = { url: "https://x.example/", httpStatus: 200, body: "<html><head><title>t</title></head></html>", headers: {}, timing: { timeToHeadersMs: 50, totalMs: 100 }, httpVersion: "1.1", redirectChain: [], byteSize: 100 };
  const findings = analyzePerformanceForPage(page);
  const evidenceList = buildEvidenceFromPerfFindings(findings, { profileId: "generic" });
  assert.equal(evidenceList.length, findings.length);
  for (const ev of evidenceList) {
    const { valid, errors } = validateEvidence(ev);
    assert.equal(valid, true, JSON.stringify(errors));
  }
});
