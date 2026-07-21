import { test } from "node:test";
import assert from "node:assert/strict";

import { buildResearchPlan, PIPELINE_STAGES } from "./researchPlanEngine.js";
import { buildResearchRequest } from "./researchRequestSchema.js";

test("PIPELINE_STAGES contiene las 20 etapas del pipeline del enunciado en orden", () => {
  assert.equal(PIPELINE_STAGES.length, 20);
  assert.equal(PIPELINE_STAGES[0], "normalize_request");
  assert.equal(PIPELINE_STAGES.at(-1), "persist_controlled_artifacts");
});

test("buildResearchPlan selecciona fixture_website para URLs en modo offline (nunca local_html directo a red)", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "padel-sports" }, inputs: { urls: ["https://ejemplo.invalid/"] } });
  const plan = buildResearchPlan(request);
  assert.ok(plan.selectedAdapters.includes("fixture_website"));
  assert.equal(plan.policySnapshot.mode, "offline");
});

test("buildResearchPlan clasifica archivos locales por extensión (html/json/md)", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, inputs: { localFiles: ["a.html", "b.json", "c.md"] } });
  const plan = buildResearchPlan(request);
  assert.ok(plan.selectedAdapters.includes("local_html"));
  assert.ok(plan.selectedAdapters.includes("local_json"));
  assert.ok(plan.selectedAdapters.includes("local_markdown"));
});

test("buildResearchPlan incluye las dimensiones prioritarias del preset sectorial en el plan", () => {
  const request = buildResearchRequest({ business: { name: "Club X", sector: "padel-sports" } });
  const plan = buildResearchPlan(request);
  assert.ok(plan.priorityDimensions.includes("bookingCapability"));
  assert.equal(plan.sectorPresetId, "padel-sports");
});

test("buildResearchPlan respeta requestedDimensions/excludedDimensions explícitos", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, requestedDimensions: ["accessibility", "seoTechnical", "branding"], excludedDimensions: ["branding"] });
  const plan = buildResearchPlan(request);
  assert.deepEqual(plan.dimensions, ["accessibility", "seoTechnical"]);
});

test("buildResearchPlan añade advertencia de riesgo cuando no hay fuentes de entrada declaradas", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" } });
  const plan = buildResearchPlan(request);
  assert.ok(plan.risks.some((r) => r.includes("Sin fuentes")));
  assert.equal(plan.expectedCoverage, "mínima (sin fuentes)");
});

test("buildResearchPlan hereda mustNotAutoInfer y prudentNote de sectores regulados", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "law" } });
  const plan = buildResearchPlan(request);
  assert.ok(plan.mustNotAutoInfer.length > 0);
  assert.ok(plan.prudentNote);
});

test("buildResearchPlan es determinista para el mismo request", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "restaurant" }, inputs: { fixtures: ["fixture-a"] } });
  const p1 = buildResearchPlan(request);
  const p2 = buildResearchPlan(request);
  assert.deepEqual(p1, p2);
});
