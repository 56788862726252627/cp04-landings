import { test } from "node:test";
import assert from "node:assert/strict";

import { proposeIntentEnrichment, applyIntentEnrichment } from "./intentEnrichment.js";
import { MINIMAL_BUSINESS_INTENT } from "../nl-builder/businessIntentExamples.js";
import { validateBusinessIntent } from "../nl-builder/businessIntentSchema.js";
import { evaluateAllDimensions } from "./dimensionRegistry.js";
import { buildRecommendations } from "./recommendationEngine.js";
import { createEvidence } from "./evidenceSchema.js";

function auditFrom(evidence) {
  const dimensionResults = evaluateAllDimensions(evidence);
  return { dimensionResults, recommendations: buildRecommendations(dimensionResults), sectorPresetId: "dental" };
}

test("proposeIntentEnrichment nunca muta el intent original", () => {
  const original = JSON.parse(JSON.stringify(MINIMAL_BUSINESS_INTENT));
  const ev = createEvidence({ sourceId: "s", sourceType: "local_html", title: "t", excerpt: "sin reservas", normalizedContent: "sin reservas", relatedDimension: "bookingCapability", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  proposeIntentEnrichment(MINIMAL_BUSINESS_INTENT, auditFrom([ev]));
  assert.deepEqual(MINIMAL_BUSINESS_INTENT, original);
});

test("proposeIntentEnrichment añade un módulo sugerido cuando la auditoría detecta un hueco con mapeo a módulo", () => {
  const ev = createEvidence({ sourceId: "s", sourceType: "local_html", title: "t", excerpt: "sin reservas", normalizedContent: "sin reservas", relatedDimension: "bookingCapability", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  const proposal = proposeIntentEnrichment(MINIMAL_BUSINESS_INTENT, auditFrom([ev]));
  assert.ok(proposal.additions.modules.some((m) => m.id === "citas"));
  assert.equal(proposal.validation.valid, true, JSON.stringify(proposal.validation.errors));
});

test("proposeIntentEnrichment preserva (no duplica) un módulo que ya existe en el intent", () => {
  const intentWithCitas = { ...MINIMAL_BUSINESS_INTENT, modules: [{ id: "citas", source: "explicit", status: "enabled" }] };
  const ev = createEvidence({ sourceId: "s", sourceType: "local_html", title: "t", excerpt: "sin reservas", normalizedContent: "sin reservas", relatedDimension: "bookingCapability", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  const proposal = proposeIntentEnrichment(intentWithCitas, auditFrom([ev]));
  assert.equal(proposal.additions.modules.length, 0);
  assert.ok(proposal.preserved.some((p) => p.includes("citas")));
});

test("proposeIntentEnrichment propone preguntas recomendadas para dimensiones sin evidencia (unknown)", () => {
  const proposal = proposeIntentEnrichment(MINIMAL_BUSINESS_INTENT, auditFrom([]));
  assert.ok(proposal.additions.recommendedQuestions.length > 0);
});

test("applyIntentEnrichment devuelve un intent válido según businessIntentSchema", () => {
  const ev = createEvidence({ sourceId: "s", sourceType: "local_html", title: "t", excerpt: "sin reservas", normalizedContent: "sin reservas", relatedDimension: "bookingCapability", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  const proposal = proposeIntentEnrichment(MINIMAL_BUSINESS_INTENT, auditFrom([ev]));
  const applied = applyIntentEnrichment(proposal);
  const { valid, errors } = validateBusinessIntent(applied);
  assert.equal(valid, true, JSON.stringify(errors));
  assert.equal(applied.generationMetadata.enrichedFromAudit, true);
});

test("proposeIntentEnrichment añade automatizaciones recomendadas que no estén ya presentes en el intent", () => {
  const ev = createEvidence({ sourceId: "s", sourceType: "local_html", title: "t", excerpt: "sin reservas", normalizedContent: "sin reservas", relatedDimension: "bookingCapability", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  const audit = auditFrom([ev]);
  const proposal = proposeIntentEnrichment(MINIMAL_BUSINESS_INTENT, { ...audit, automations: audit.recommendations.length > 0 ? [{ id: "confirmacion_reserva" }] : [] });
  assert.ok(proposal.additions.automations.includes("confirmacion_reserva"));
});

test("applyIntentEnrichment lanza si se le pasa una propuesta inválida (defensa en profundidad)", () => {
  assert.throws(() => applyIntentEnrichment({ validation: { valid: false, errors: [{ path: "x", message: "y" }] } }));
});
