import { test } from "node:test";
import assert from "node:assert/strict";

import { draftBlueprintFromInstruction } from "./nlToBlueprintContract.js";

const EXAMPLE_INSTRUCTION = "Crear una solución SaaS para una clínica dental de Málaga, con tres odontólogos, agenda, pacientes, recordatorios, formularios, landing page, PWA y branding premium.";

test("el ejemplo de instrucción de la Fase 15 detecta sector dental", () => {
  const draft = draftBlueprintFromInstruction(EXAMPLE_INSTRUCTION);
  assert.equal(draft.partialBlueprint.sector, "dental");
});

test("el ejemplo detecta la ciudad Málaga", () => {
  const draft = draftBlueprintFromInstruction(EXAMPLE_INSTRUCTION);
  assert.equal(draft.partialBlueprint.publicInfo.address.city, "Málaga");
});

test("el ejemplo detecta 3 profesionales", () => {
  const draft = draftBlueprintFromInstruction(EXAMPLE_INSTRUCTION);
  assert.equal(draft.partialBlueprint.professionals.length, 3);
});

test("el ejemplo detecta landing y pwa como features solicitadas", () => {
  const draft = draftBlueprintFromInstruction(EXAMPLE_INSTRUCTION);
  assert.ok(draft.detectedSignals.includes("feature:landing"));
  assert.ok(draft.detectedSignals.includes("feature:pwa"));
});

test("isRealLanguageUnderstanding siempre es false (nunca se afirma NLU real)", () => {
  const draft = draftBlueprintFromInstruction(EXAMPLE_INSTRUCTION);
  assert.equal(draft.isRealLanguageUnderstanding, false);
});

test("missingFields siempre exige businessId/tenantId/commercialName/plan aunque el texto sea muy completo", () => {
  const draft = draftBlueprintFromInstruction(EXAMPLE_INSTRUCTION);
  for (const field of ["businessId", "tenantId", "commercialName", "plan"]) {
    assert.ok(draft.missingFields.includes(field));
  }
});

test("una instrucción sin sector reconocible añade 'sector' a missingFields y baja la confianza", () => {
  const draft = draftBlueprintFromInstruction("Crear una solución para un negocio en Madrid");
  assert.equal(draft.partialBlueprint.sector, undefined);
  assert.ok(draft.missingFields.includes("sector"));
  assert.equal(draft.confidence, "baja");
});

test("una instrucción vacía no lanza y devuelve un draft de baja confianza", () => {
  const draft = draftBlueprintFromInstruction("");
  assert.equal(draft.confidence, "baja");
  assert.deepEqual(draft.detectedSignals, []);
});
