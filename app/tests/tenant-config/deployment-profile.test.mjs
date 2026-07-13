// Fase 11: tests de "promotion gates" y "rollback metadata" — no existían
// todavía tests para config/deployment-profile.schema.json (solo existía
// para client-config.schema.json en src/config/schemaValidator.test.mjs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateAgainstSchema } from "../../src/config/schemaValidator.js";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
function loadJson(relPath) {
  return JSON.parse(readFileSync(path.join(APP_ROOT, relPath), "utf8"));
}

const GATE_NAMES = [
  "CONFIG_VALID",
  "BRANDING_VALID",
  "INTEGRATIONS_VALID",
  "SECURITY_VALID",
  "QA_VALID",
  "BACKUP_READY",
  "OBSERVABILITY_READY",
  "GO_LIVE_APPROVED",
];

test("deployment-profile.example.valid.json → 0 errores contra deployment-profile.schema.json", () => {
  const schema = loadJson("config/deployment-profile.schema.json");
  const doc = loadJson("config/deployment-profile.example.valid.json");
  const result = validateAgainstSchema(schema, doc);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test("deployment-profile.example.valid.json declara los 8 gates de promoción", () => {
  const doc = loadJson("config/deployment-profile.example.valid.json");
  assert.deepEqual(Object.keys(doc.gates).sort(), [...GATE_NAMES].sort());
});

test("deployment-profile.example.valid.json trae rollbackRef con trigger 'none' (sin despliegue previo)", () => {
  const doc = loadJson("config/deployment-profile.example.valid.json");
  assert.equal(doc.rollbackRef.trigger, "none");
  assert.equal(doc.rollbackRef.previousReleaseVersion, null);
  assert.equal(doc.rollbackRef.previousConfigRef, null);
});

test("deployment-profile.example.invalid.json → rechazado (releaseVersion no semver, deploymentStatus fuera de enum, gates incompleto, additionalProperties)", () => {
  const schema = loadJson("config/deployment-profile.schema.json");
  const doc = loadJson("config/deployment-profile.example.invalid.json");
  const result = validateAgainstSchema(schema, doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test("fixture 10 (invalid-disabled-tenant-deployment) SÍ valida contra el schema en solitario — su invalidez es de tenant, no de forma", () => {
  const schema = loadJson("config/deployment-profile.schema.json");
  const doc = loadJson("fixtures/tenant-config/invalid-disabled-tenant-deployment.deployment-profile.json");
  const result = validateAgainstSchema(schema, doc);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test("regla dura: environment=production exige qaStatus PASS y deploymentStatus avanzado (if/then del schema)", () => {
  const schema = loadJson("config/deployment-profile.schema.json");
  const valid = loadJson("config/deployment-profile.example.valid.json");
  const productionSinQA = { ...valid, environment: "production", qaStatus: "PENDING", deploymentStatus: "DEPLOYED" };
  const result = validateAgainstSchema(schema, productionSinQA);
  assert.equal(result.valid, false);
});
