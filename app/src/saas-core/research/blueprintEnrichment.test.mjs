import { test } from "node:test";
import assert from "node:assert/strict";

import { proposeBlueprintEnrichment, applyBlueprintEnrichment } from "./blueprintEnrichment.js";
import { MINIMAL_BUSINESS_BLUEPRINT } from "../factory/businessBlueprintExamples.js";
import { validateBusinessBlueprint } from "../factory/businessBlueprintSchema.js";
import { evaluateAllDimensions } from "./dimensionRegistry.js";
import { buildRecommendations } from "./recommendationEngine.js";
import { createEvidence } from "./evidenceSchema.js";

function auditFrom(evidence) {
  const dimensionResults = evaluateAllDimensions(evidence);
  return { dimensionResults, recommendations: buildRecommendations(dimensionResults) };
}

test("proposeBlueprintEnrichment nunca muta el blueprint original", () => {
  const original = JSON.parse(JSON.stringify(MINIMAL_BUSINESS_BLUEPRINT));
  const ev = createEvidence({ sourceId: "s", sourceType: "local_html", title: "t", excerpt: "sin reservas", normalizedContent: "sin reservas", relatedDimension: "bookingCapability", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  proposeBlueprintEnrichment(MINIMAL_BUSINESS_BLUEPRINT, auditFrom([ev]));
  assert.deepEqual(MINIMAL_BUSINESS_BLUEPRINT, original);
});

test("proposeBlueprintEnrichment añade el id de módulo 'citas' cuando bookingCapability es débil y no está ya presente", () => {
  const ev = createEvidence({ sourceId: "s", sourceType: "local_html", title: "t", excerpt: "sin reservas", normalizedContent: "sin reservas", relatedDimension: "bookingCapability", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  const proposal = proposeBlueprintEnrichment(MINIMAL_BUSINESS_BLUEPRINT, auditFrom([ev]));
  assert.ok(proposal.additions.modules.includes("citas"));
  assert.equal(proposal.validation.valid, true, JSON.stringify(proposal.validation.errors));
});

test("proposeBlueprintEnrichment preserva un módulo ya presente sin duplicarlo", () => {
  const blueprintWithCitas = { ...MINIMAL_BUSINESS_BLUEPRINT, modules: [...(MINIMAL_BUSINESS_BLUEPRINT.modules ?? []), "citas"] };
  const ev = createEvidence({ sourceId: "s", sourceType: "local_html", title: "t", excerpt: "sin reservas", normalizedContent: "sin reservas", relatedDimension: "bookingCapability", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  const proposal = proposeBlueprintEnrichment(blueprintWithCitas, auditFrom([ev]));
  assert.equal(proposal.additions.modules.length, 0);
  assert.ok(proposal.preserved.length > 0);
});

test("applyBlueprintEnrichment devuelve un blueprint válido según businessBlueprintSchema", () => {
  const ev = createEvidence({ sourceId: "s", sourceType: "local_html", title: "t", excerpt: "sin reservas", normalizedContent: "sin reservas", relatedDimension: "bookingCapability", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  const proposal = proposeBlueprintEnrichment(MINIMAL_BUSINESS_BLUEPRINT, auditFrom([ev]));
  const applied = applyBlueprintEnrichment(proposal);
  const { valid, errors } = validateBusinessBlueprint(applied);
  assert.equal(valid, true, JSON.stringify(errors));
});

test("applyBlueprintEnrichment lanza si la propuesta es inválida", () => {
  assert.throws(() => applyBlueprintEnrichment({ validation: { valid: false, errors: [] } }));
});
