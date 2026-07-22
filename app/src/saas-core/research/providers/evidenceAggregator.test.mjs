import { test } from "node:test";
import assert from "node:assert/strict";

import { aggregateProviderResults, mapToOrchestratorStatus, sanitizeErrorMessage, buildEvidenceConflictReport, buildProviderScoreBreakdown } from "./evidenceAggregator.js";
import { defineProviderResult } from "./core/providerTypes.js";
import { createEvidence } from "../evidenceSchema.js";
import { evaluateAllDimensions } from "../dimensionRegistry.js";

function ev({ sourceId, relatedDimension, polarity, strength = 0.8, confidence = 0.8 }) {
  return createEvidence({
    sourceId,
    sourceType: "public_website_real",
    title: `t-${sourceId}`,
    excerpt: "x",
    normalizedContent: `${sourceId}-${relatedDimension}-${polarity}`,
    classification: "confirmed",
    relatedDimension,
    signal: { strength, polarity },
    confidence,
    provenance: sourceId,
  });
}

test("mapToOrchestratorStatus traduce el vocabulario de ProviderResult al de orquestación (Fase 3)", () => {
  assert.equal(mapToOrchestratorStatus("success"), "available");
  assert.equal(mapToOrchestratorStatus("partial"), "available");
  assert.equal(mapToOrchestratorStatus("not_implemented"), "unavailable");
  assert.equal(mapToOrchestratorStatus("failed"), "failed");
  assert.equal(mapToOrchestratorStatus("skipped"), "skipped");
  assert.equal(mapToOrchestratorStatus("timeout"), "timed_out");
  assert.equal(mapToOrchestratorStatus("cancelled"), "cancelled");
  assert.equal(mapToOrchestratorStatus("failed", { blocked: true }), "blocked");
});

test("sanitizeErrorMessage redacta patrones con pinta de secreto y trunca mensajes largos", () => {
  assert.equal(sanitizeErrorMessage("fallo con token sk_live_abcdefghijklmnop"), "fallo con token [redactado]");
  assert.equal(sanitizeErrorMessage("línea 1\nstack interno\n/root/secreto"), "línea 1");
  assert.ok(sanitizeErrorMessage("x".repeat(500)).length <= 301);
});

test("aggregateProviderResults: un proveedor stub (not_implemented) NUNCA aporta evidencia real", () => {
  const stubEvidenceLike = [{ sourceId: "s", sourceType: "provider_stub" }]; // forma placeholder, no createEvidence real
  const entries = [{ providerId: "seoProvider", priority: 50, result: defineProviderResult({ providerId: "seoProvider", status: "not_implemented", evidence: stubEvidenceLike }) }];
  const { evidence, providerSummaries } = aggregateProviderResults(entries);
  assert.deepEqual(evidence, []);
  assert.equal(providerSummaries[0].evidenceContributed, 0);
  assert.equal(providerSummaries[0].orchestratorStatus, "unavailable");
});

test("aggregateProviderResults: un proveedor real (success) sí aporta evidencia y queda indexado en provenanceIndex", () => {
  const evidence1 = ev({ sourceId: "https://x.example", relatedDimension: "trustSignals", polarity: "positive" });
  const entries = [{ providerId: "publicWebsiteFetcher", priority: 10, result: defineProviderResult({ providerId: "publicWebsiteFetcher", status: "success", evidence: [evidence1] }) }];
  const { evidence, provenanceIndex, providerSummaries } = aggregateProviderResults(entries);
  assert.equal(evidence.length, 1);
  assert.equal(provenanceIndex[evidence1.evidenceId].providerId, "publicWebsiteFetcher");
  assert.equal(providerSummaries[0].evidenceContributed, 1);
  assert.equal(providerSummaries[0].orchestratorStatus, "available");
});

test("aggregateProviderResults deduplica evidencia entre proveedores (mismo sourceId+contentHash)", () => {
  const shared = ev({ sourceId: "https://x.example", relatedDimension: "trustSignals", polarity: "positive" });
  const entries = [
    { providerId: "a", priority: 10, result: defineProviderResult({ providerId: "a", status: "success", evidence: [shared] }) },
    { providerId: "b", priority: 20, result: defineProviderResult({ providerId: "b", status: "success", evidence: [shared] }) },
  ];
  const { evidence } = aggregateProviderResults(entries);
  assert.equal(evidence.length, 1);
});

test("aggregateProviderResults sanea los mensajes de error de cada proveedor", () => {
  const entries = [{ providerId: "p", priority: 50, result: defineProviderResult({ providerId: "p", status: "failed", errors: [{ message: "token sk_test_xxxxxxxxxxxxxxxxxxxx" }] }) }];
  const { providerSummaries } = aggregateProviderResults(entries);
  assert.equal(providerSummaries[0].errors[0].message, "token [redactado]");
});

test("buildEvidenceConflictReport atribuye cada lado de una contradicción de dimensión a su proveedor", () => {
  const positive = ev({ sourceId: "prov-a", relatedDimension: "trustSignals", polarity: "positive" });
  const negative = ev({ sourceId: "prov-b", relatedDimension: "trustSignals", polarity: "negative" });
  const dimensionResults = evaluateAllDimensions([positive, negative]);
  const provenanceIndex = { [positive.evidenceId]: { providerId: "providerA" }, [negative.evidenceId]: { providerId: "providerB" } };
  const conflicts = buildEvidenceConflictReport(dimensionResults, provenanceIndex);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].dimensionId, "trustSignals");
  assert.deepEqual(conflicts[0].providersInvolved.sort(), ["providerA", "providerB"]);
});

test("buildEvidenceConflictReport no reporta nada cuando no hay contradicciones", () => {
  const positive = ev({ sourceId: "prov-a", relatedDimension: "trustSignals", polarity: "positive" });
  const dimensionResults = evaluateAllDimensions([positive]);
  const conflicts = buildEvidenceConflictReport(dimensionResults, { [positive.evidenceId]: { providerId: "providerA" } });
  assert.deepEqual(conflicts, []);
});

test("buildProviderScoreBreakdown agrupa evidencia y dimensiones contribuidas por proveedor", () => {
  const a1 = ev({ sourceId: "s1", relatedDimension: "trustSignals", polarity: "positive" });
  const a2 = ev({ sourceId: "s1", relatedDimension: "contactInfo", polarity: "positive" });
  const dimensionResults = evaluateAllDimensions([a1, a2]);
  const provenanceIndex = { [a1.evidenceId]: { providerId: "publicWebsiteFetcher" }, [a2.evidenceId]: { providerId: "publicWebsiteFetcher" } };
  const breakdown = buildProviderScoreBreakdown(dimensionResults, provenanceIndex);
  assert.equal(breakdown.length, 1);
  assert.equal(breakdown[0].providerId, "publicWebsiteFetcher");
  assert.equal(breakdown[0].evidenceCount, 2);
  assert.deepEqual(breakdown[0].dimensionsContributed, ["contactInfo", "trustSignals"]);
});
