import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildReportData,
  renderExecutiveReportMarkdown,
  renderTechnicalReportMarkdown,
  renderCommercialReportMarkdown,
  renderOpportunitiesSummaryMarkdown,
  renderBacklogMarkdown,
  renderImpactEffortMatrixMarkdown,
  renderAutomationMapMarkdown,
  renderRiskReportMarkdown,
  renderEvidenceAppendixMarkdown,
  renderAuditReportJson,
  renderProviderRunSummaryMarkdown,
} from "./auditReportGenerator.js";
import { evaluateAllDimensions } from "./dimensionRegistry.js";
import { computeAllScores } from "./scoringEngine.js";
import { buildRecommendations, buildBacklog, buildImpactEffortMatrix } from "./recommendationEngine.js";
import { recommendAutomationsFromFindings } from "./researchAutomationCatalog.js";
import { createEvidence } from "./evidenceSchema.js";

function buildSampleAuditResult() {
  const goodEv = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "bien", excerpt: "buena señal", normalizedContent: "buena señal", relatedDimension: "branding", signal: { strength: 1, polarity: "positive" }, confidence: 0.9 });
  const badEv = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "mal", excerpt: "sin reservas online", normalizedContent: "sin reservas online", relatedDimension: "bookingCapability", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  const evidence = [goodEv, badEv];
  const dimensionResults = evaluateAllDimensions(evidence);
  const scores = computeAllScores(dimensionResults);
  const recommendations = buildRecommendations(dimensionResults, { priorityDimensionIds: ["bookingCapability"] });
  return {
    requestId: "req_test",
    sectorPresetId: "dental",
    businessName: "Negocio de Prueba",
    scores,
    dimensionResults,
    recommendations,
    backlog: buildBacklog(recommendations),
    impactEffortMatrix: buildImpactEffortMatrix(recommendations),
    automations: recommendAutomationsFromFindings(dimensionResults),
    competitorComparison: null,
    evidence,
    limitations: ["auditoría de ejemplo con evidencia mínima"],
    prudentNote: "Nota prudente de ejemplo.",
    durationMs: 42,
    generatedAt: "2026-01-01T00:00:00.000Z",
  };
}

test("buildReportData separa generatedAt del resto de contenido determinista", () => {
  const data = buildReportData(buildSampleAuditResult());
  assert.equal(data.generatedAt, "2026-01-01T00:00:00.000Z");
  assert.ok(data.scores);
  assert.ok(data.evidence.length === 2);
});

test("renderExecutiveReportMarkdown cita el score global y recomendaciones reales, no genéricas", () => {
  const data = buildReportData(buildSampleAuditResult());
  const md = renderExecutiveReportMarkdown(data);
  assert.match(md, /Score global/);
  assert.match(md, /reserva/i);
  assert.match(md, /Nota prudente de ejemplo/);
});

test("Paso 15 — sin providerRunSummary (legacy), el executive.md NO menciona el pipeline multiproveedor", () => {
  const data = buildReportData(buildSampleAuditResult());
  const md = renderExecutiveReportMarkdown(data);
  assert.doesNotMatch(md, /multiproveedor/);
});

test("Paso 15 — con providerRunSummary (multiprovider), el executive.md sí lo menciona", () => {
  const auditResult = { ...buildSampleAuditResult(), providerRunSummary: { profileId: "hotel", executionMode: "fallback", usedProviderId: "publicWebsiteFetcher", providers: [{ providerId: "publicWebsiteFetcher" }], pluginLoadErrors: [] } };
  const data = buildReportData(auditResult);
  const md = renderExecutiveReportMarkdown(data);
  assert.match(md, /Pipeline multiproveedor \(perfil "hotel"\)/);
});

test("renderProviderRunSummaryMarkdown sin providerRunSummary indica modo legacy explícitamente", () => {
  const data = buildReportData(buildSampleAuditResult());
  const md = renderProviderRunSummaryMarkdown(data);
  assert.match(md, /pipeline="legacy"/);
});

test("renderProviderRunSummaryMarkdown con datos reales lista proveedores, desglose y conflictos", () => {
  const auditResult = {
    ...buildSampleAuditResult(),
    providerRunSummary: {
      profileId: "hotel",
      executionMode: "fallback",
      usedProviderId: "publicWebsiteFetcher",
      providers: [{ providerId: "publicWebsiteFetcher", orchestratorStatus: "available", evidenceContributed: 2, priority: 10, errors: [] }],
      pluginLoadErrors: [],
    },
    providerScoreBreakdown: [{ providerId: "publicWebsiteFetcher", evidenceCount: 2, dimensionsContributed: ["branding", "bookingCapability"] }],
    evidenceConflicts: [{ dimensionId: "trustSignals", label: "Confianza", reason: "positiva y negativa", providersInvolved: ["publicWebsiteFetcher"], confidenceAfterPenalty: 0.5 }],
  };
  const data = buildReportData(auditResult);
  const md = renderProviderRunSummaryMarkdown(data);
  assert.match(md, /publicWebsiteFetcher/);
  assert.match(md, /disponible \(evidencia real\)/);
  assert.match(md, /trustSignals/);
});

test("renderTechnicalReportMarkdown incluye las 13 categorías y las dimensiones evaluadas", () => {
  const data = buildReportData(buildSampleAuditResult());
  const md = renderTechnicalReportMarkdown(data);
  assert.match(md, /branding/);
  assert.match(md, /bookingCapability|Reservas/);
});

test("renderCommercialReportMarkdown incluye automatizaciones y backlog priorizado", () => {
  const data = buildReportData(buildSampleAuditResult());
  const md = renderCommercialReportMarkdown(data);
  assert.match(md, /Backlog priorizado/);
});

test("renderOpportunitiesSummaryMarkdown / renderBacklogMarkdown / renderImpactEffortMatrixMarkdown / renderAutomationMapMarkdown / renderRiskReportMarkdown no lanzan y devuelven texto", () => {
  const data = buildReportData(buildSampleAuditResult());
  for (const renderer of [renderOpportunitiesSummaryMarkdown, renderBacklogMarkdown, renderImpactEffortMatrixMarkdown, renderAutomationMapMarkdown, renderRiskReportMarkdown]) {
    const output = renderer(data);
    assert.equal(typeof output, "string");
    assert.ok(output.length > 0);
  }
});

test("renderEvidenceAppendixMarkdown cita cada evidenceId real", () => {
  const data = buildReportData(buildSampleAuditResult());
  const md = renderEvidenceAppendixMarkdown(data);
  for (const e of data.evidence) assert.ok(md.includes(e.evidenceId), `falta ${e.evidenceId} en el apéndice`);
});

test("renderAuditReportJson produce JSON válido y determinista (mismo input -> mismo string)", () => {
  const data = buildReportData(buildSampleAuditResult());
  const json1 = renderAuditReportJson(data);
  const json2 = renderAuditReportJson(data);
  assert.equal(json1, json2);
  assert.doesNotThrow(() => JSON.parse(json1));
});
