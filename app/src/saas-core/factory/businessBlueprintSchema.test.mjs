import { test } from "node:test";
import assert from "node:assert/strict";

import {
  BUSINESS_BLUEPRINT_SCHEMA_VERSION,
  validateBusinessBlueprint,
  assertValidBusinessBlueprint,
  migrateBusinessBlueprint,
} from "./businessBlueprintSchema.js";
import {
  MINIMAL_BUSINESS_BLUEPRINT,
  FULL_BUSINESS_BLUEPRINT,
  LEGACY_BUSINESS_BLUEPRINT_EXAMPLE,
  INVALID_BUSINESS_BLUEPRINT_EXAMPLES,
} from "./businessBlueprintExamples.js";

test("el blueprint mínimo válido pasa la validación", () => {
  const { valid, errors } = validateBusinessBlueprint(MINIMAL_BUSINESS_BLUEPRINT);
  assert.equal(valid, true, JSON.stringify(errors));
});

test("el blueprint completo (clínica dental) pasa la validación", () => {
  const { valid, errors } = validateBusinessBlueprint(FULL_BUSINESS_BLUEPRINT);
  assert.equal(valid, true, JSON.stringify(errors));
});

test("assertValidBusinessBlueprint lanza con mensaje útil para un blueprint inválido", () => {
  assert.throws(
    () => assertValidBusinessBlueprint(INVALID_BUSINESS_BLUEPRINT_EXAMPLES.missingRequiredFields),
    /Business Blueprint inválido/,
  );
});

test("un blueprint que no es objeto falla con error $ explícito", () => {
  const { valid, errors } = validateBusinessBlueprint(null);
  assert.equal(valid, false);
  assert.equal(errors[0].path, "$");
});

test("faltan campos obligatorios -> errores por cada uno", () => {
  const { valid, errors } = validateBusinessBlueprint(INVALID_BUSINESS_BLUEPRINT_EXAMPLES.missingRequiredFields);
  assert.equal(valid, false);
  const paths = errors.map((e) => e.path);
  assert.ok(paths.includes("tenantId"));
  assert.ok(paths.includes("sector"));
  assert.ok(paths.includes("currencies"));
});

test("sector desconocido es rechazado con mensaje útil", () => {
  const { valid, errors } = validateBusinessBlueprint(INVALID_BUSINESS_BLUEPRINT_EXAMPLES.unknownSector);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "sector" && /debe ser uno de/.test(e.message)));
});

test("tenantId con espacios es rechazado", () => {
  const { valid, errors } = validateBusinessBlueprint(INVALID_BUSINESS_BLUEPRINT_EXAMPLES.badTenantId);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "tenantId"));
});

test("un secreto filtrado en cualquier campo de texto es detectado", () => {
  const { valid, errors } = validateBusinessBlueprint(INVALID_BUSINESS_BLUEPRINT_EXAMPLES.secretLookalike);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "$" && /secreto/.test(e.message)));
});

test("una propiedad de nivel superior desconocida es rechazada (fail-closed)", () => {
  const { valid, errors } = validateBusinessBlueprint(INVALID_BUSINESS_BLUEPRINT_EXAMPLES.unknownTopLevelKey);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "unexpectedField"));
});

test("envVars con un valor en vez de un nombre es rechazado", () => {
  const bad = { ...MINIMAL_BUSINESS_BLUEPRINT, integrations: { payments: { status: "not_configured", envVars: ["STRIPE_SECRET_KEY=sk_live_abc"] } } };
  const { valid, errors } = validateBusinessBlueprint(bad);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "integrations.payments.envVars"));
});

test("automations con una capacidad fuera del catálogo genérico es rechazada", () => {
  const bad = { ...MINIMAL_BUSINESS_BLUEPRINT, automations: ["capacidad_inventada"] };
  const { valid, errors } = validateBusinessBlueprint(bad);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "automations"));
});

test("branding.colors con un valor no hexadecimal es rechazado", () => {
  const bad = { ...MINIMAL_BUSINESS_BLUEPRINT, branding: { colors: { primary: "blue" } } };
  const { valid, errors } = validateBusinessBlueprint(bad);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "branding.colors.primary"));
});

test("migrateBusinessBlueprint convierte un blueprint legacy (currency singular) a v1", () => {
  const { blueprint, migrated, notes } = migrateBusinessBlueprint(LEGACY_BUSINESS_BLUEPRINT_EXAMPLE);
  assert.equal(migrated, true);
  assert.equal(blueprint.schemaVersion, BUSINESS_BLUEPRINT_SCHEMA_VERSION);
  assert.deepEqual(blueprint.currencies, ["EUR"]);
  assert.equal(blueprint.currency, undefined);
  assert.ok(notes.length > 0);
  const { valid } = validateBusinessBlueprint(blueprint);
  assert.equal(valid, true);
});

test("migrateBusinessBlueprint es un no-op (migrated:false) para un blueprint ya en v1", () => {
  const { blueprint, migrated } = migrateBusinessBlueprint(MINIMAL_BUSINESS_BLUEPRINT);
  assert.equal(migrated, false);
  assert.equal(blueprint.schemaVersion, BUSINESS_BLUEPRINT_SCHEMA_VERSION);
});

test("migrateBusinessBlueprint no muta el objeto de entrada", () => {
  const input = { ...LEGACY_BUSINESS_BLUEPRINT_EXAMPLE };
  migrateBusinessBlueprint(input);
  assert.equal(input.currency, "EUR");
  assert.equal(input.schemaVersion, undefined);
});
