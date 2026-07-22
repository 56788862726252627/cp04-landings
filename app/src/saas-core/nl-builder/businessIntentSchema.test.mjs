import { test } from "node:test";
import assert from "node:assert/strict";

import {
  BUSINESS_INTENT_SCHEMA_VERSION,
  validateBusinessIntent,
  assertValidBusinessIntent,
  migrateBusinessIntent,
} from "./businessIntentSchema.js";
import { MINIMAL_BUSINESS_INTENT, FULL_BUSINESS_INTENT, INVALID_BUSINESS_INTENT_EXAMPLES } from "./businessIntentExamples.js";

test("el intent mínimo válido pasa la validación", () => {
  const { valid, errors } = validateBusinessIntent(MINIMAL_BUSINESS_INTENT);
  assert.equal(valid, true, JSON.stringify(errors));
});

test("el intent completo (fisioterapia) pasa la validación", () => {
  const { valid, errors } = validateBusinessIntent(FULL_BUSINESS_INTENT);
  assert.equal(valid, true, JSON.stringify(errors));
});

test("un intent que no es objeto falla con error $ explícito", () => {
  const { valid, errors } = validateBusinessIntent(null);
  assert.equal(valid, false);
  assert.equal(errors[0].path, "$");
});

test("faltan campos obligatorios -> errores por cada campo ausente", () => {
  const { valid, errors } = validateBusinessIntent(INVALID_BUSINESS_INTENT_EXAMPLES.missingRequiredFields);
  assert.equal(valid, false);
  const paths = errors.map((e) => e.path);
  assert.ok(paths.includes("requestId"));
  assert.ok(paths.includes("business"));
  assert.ok(paths.includes("confidence"));
});

test("business.sector no-string produce un error específico", () => {
  const { valid, errors } = validateBusinessIntent(INVALID_BUSINESS_INTENT_EXAMPLES.sectorNotAString);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "business.sector"));
});

test("confidence.overall fuera de rango produce un error", () => {
  const { valid, errors } = validateBusinessIntent(INVALID_BUSINESS_INTENT_EXAMPLES.confidenceOutOfRange);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "confidence.overall"));
});

test("assertValidBusinessIntent lanza con mensaje útil para un intent inválido", () => {
  assert.throws(() => assertValidBusinessIntent(INVALID_BUSINESS_INTENT_EXAMPLES.missingRequiredFields), /Business Intent inválido/);
});

test("assertValidBusinessIntent no lanza y devuelve el intent para uno válido", () => {
  assert.deepEqual(assertValidBusinessIntent(MINIMAL_BUSINESS_INTENT), MINIMAL_BUSINESS_INTENT);
});

test("propiedad de nivel superior desconocida se rechaza", () => {
  const { valid, errors } = validateBusinessIntent({ ...MINIMAL_BUSINESS_INTENT, notAField: true });
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "notAField"));
});

test("modules[] con status inválido produce un error acotado a ese índice", () => {
  const { valid, errors } = validateBusinessIntent({ ...MINIMAL_BUSINESS_INTENT, modules: [{ id: "citas", status: "not-a-status" }] });
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "modules[0].status"));
});

test("un intent con un valor que parece secreto se rechaza", () => {
  const { valid, errors } = validateBusinessIntent({
    ...MINIMAL_BUSINESS_INTENT,
    normalizedSummary: "usar sk_live_12345 para pagos",
  });
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "$"));
});

test("migrateBusinessIntent asigna schemaVersion a un intent legacy sin mutar la entrada", () => {
  const legacy = { requestId: "x", language: "es", locale: "es-ES", country: "ES", currency: "EUR", timezone: "Europe/Madrid", business: { proposedName: "X", sector: "padel" }, sourceText: "", confidence: { overall: 0.1 } };
  const frozenCopy = JSON.parse(JSON.stringify(legacy));
  const { intent, migrated, notes } = migrateBusinessIntent(legacy);
  assert.equal(migrated, true);
  assert.equal(intent.schemaVersion, BUSINESS_INTENT_SCHEMA_VERSION);
  assert.ok(notes.length > 0);
  assert.deepEqual(legacy, frozenCopy);
});

test("migrateBusinessIntent no reporta cambios para un intent ya en la versión actual", () => {
  const { migrated } = migrateBusinessIntent(MINIMAL_BUSINESS_INTENT);
  assert.equal(migrated, false);
});

test("migrateBusinessIntent lanza para un objeto que no es plain object", () => {
  assert.throws(() => migrateBusinessIntent(null), /requiere un objeto/);
});
