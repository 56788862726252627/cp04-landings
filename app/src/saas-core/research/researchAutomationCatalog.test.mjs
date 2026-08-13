import { test } from "node:test";
import assert from "node:assert/strict";

import { RESEARCH_AUTOMATION_ADDITIONS, COMBINED_AUTOMATION_CATALOG, recommendAutomationsFromFindings } from "./researchAutomationCatalog.js";
import { AUTOMATION_CATALOG } from "../nl-builder/automationCatalog.js";
import { evaluateAllDimensions } from "./dimensionRegistry.js";
import { createEvidence } from "./evidenceSchema.js";

test("RESEARCH_AUTOMATION_ADDITIONS añade exactamente las 6 automatizaciones nuevas del enunciado de Paso 12", () => {
  assert.equal(RESEARCH_AUTOMATION_ADDITIONS.length, 6);
  for (const id of ["ticket_soporte_incidencia", "reporting_periodico_kpis", "sincronizacion_datos_externos", "registro_consentimiento", "campana_estacional", "actualizacion_contenido_programada"]) {
    assert.ok(RESEARCH_AUTOMATION_ADDITIONS.some((a) => a.id === id), `falta automatización: ${id}`);
  }
});

test("COMBINED_AUTOMATION_CATALOG no duplica ninguna automatización de Paso 11 y añade las 6 nuevas", () => {
  assert.equal(COMBINED_AUTOMATION_CATALOG.length, AUTOMATION_CATALOG.length + 6);
  const ids = COMBINED_AUTOMATION_CATALOG.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length, "no debe haber ids duplicados");
});

test("cada automatización nueva tiene la misma forma completa que las de Paso 11 (trigger/conditions/actions/idempotency/etc.)", () => {
  for (const automation of RESEARCH_AUTOMATION_ADDITIONS) {
    for (const field of ["id", "capability", "label", "trigger", "conditions", "actions", "dataNeeded", "errorHandling", "idempotency", "logs", "priority", "qualitativeROI", "recommendedImplementation", "requiredModules"]) {
      assert.ok(automation[field] !== undefined, `${automation.id} le falta el campo ${field}`);
    }
  }
});

test("recommendAutomationsFromFindings no sugiere nada cuando todas las dimensiones tienen score alto o son unknown", () => {
  const ev = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "bien", excerpt: "bien", normalizedContent: "bien", relatedDimension: "bookingCapability", signal: { strength: 1, polarity: "positive" }, confidence: 0.9 });
  const dims = evaluateAllDimensions([ev]);
  assert.deepEqual(recommendAutomationsFromFindings(dims), []);
});

test("recommendAutomationsFromFindings sugiere confirmación/recordatorio de reserva cuando bookingCapability es débil", () => {
  const ev = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "mal", excerpt: "sin reservas", normalizedContent: "sin reservas", relatedDimension: "bookingCapability", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  const dims = evaluateAllDimensions([ev]);
  const suggestions = recommendAutomationsFromFindings(dims);
  assert.ok(suggestions.some((a) => a.id === "confirmacion_reserva"));
});

test("recommendAutomationsFromFindings no duplica automatizaciones aunque varias dimensiones las sugieran", () => {
  const evPrivacy = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "mal", excerpt: "sin privacidad", normalizedContent: "sin privacidad", relatedDimension: "visiblePrivacy", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  const evCompliance = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "mal", excerpt: "sin cumplimiento", normalizedContent: "sin cumplimiento", relatedDimension: "visibleCompliance", signal: { strength: 1, polarity: "negative" }, confidence: 0.8 });
  const dims = evaluateAllDimensions([evPrivacy, evCompliance]);
  const suggestions = recommendAutomationsFromFindings(dims);
  const consentSuggestions = suggestions.filter((a) => a.id === "registro_consentimiento");
  assert.equal(consentSuggestions.length, 1);
});
