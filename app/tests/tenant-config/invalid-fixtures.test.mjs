// Fase 10 + 11: cada fixture inválido aísla exactamente una violación.
// Este test es la matriz que demuestra cuál capa la detecta: schema de
// client-config (forma de un solo documento) o validateResolvedConfig
// (cruce entre documentos / heurísticas).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateAgainstSchema } from "../../src/config/schemaValidator.js";
import { loadCoreConfig } from "../../src/config/loadCoreConfig.js";
import { loadVerticalConfig } from "../../src/config/loadVerticalConfig.js";
import { mergeConfigLayers } from "../../src/config/mergeConfigLayers.js";
import { validateResolvedConfig, checkTenantRegistryDuplicates } from "../../src/config/validateResolvedConfig.js";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
function loadJson(relPath) {
  return JSON.parse(readFileSync(path.join(APP_ROOT, relPath), "utf8"));
}

const clientConfigSchema = loadJson("config/client-config.schema.json");

test("fixture 3 — missing branding: rechazado por client-config.schema.json (required)", () => {
  const doc = loadJson("fixtures/tenant-config/invalid-missing-branding.client-config.json");
  const result = validateAgainstSchema(clientConfigSchema, doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.brand"));
});

test("fixture 4 — unknown feature: rechazado por client-config.schema.json (additionalProperties)", () => {
  const doc = loadJson("fixtures/tenant-config/invalid-unknown-feature.client-config.json");
  const result = validateAgainstSchema(clientConfigSchema, doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path.includes("descuentosVip")));
});

test("fixture 5 — forbidden core override: rechazado por client-config.schema.json (const:false en features.pagos)", () => {
  const doc = loadJson("fixtures/tenant-config/invalid-forbidden-core-override.client-config.json");
  const result = validateAgainstSchema(clientConfigSchema, doc);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.features.pagos"));
});

test("fixture 6 — cross-tenant reference: válido a nivel de schema, inválido a nivel de validateResolvedConfig+registry", () => {
  const doc = loadJson("fixtures/tenant-config/invalid-cross-tenant-reference.client-config.json");
  const schemaResult = validateAgainstSchema(clientConfigSchema, doc);
  assert.equal(schemaResult.valid, true);

  const core = loadCoreConfig();
  const vertical = loadVerticalConfig();
  const resolved = mergeConfigLayers({ core, vertical, client: doc });
  // El registro ya trae fixture-club-02 (staging) — suficiente para detectar la referencia cruzada.
  const registry = loadJson("config/tenant-registry.example.valid.json");
  const crossResult = validateResolvedConfig(resolved, { core, registry });
  assert.ok(crossResult.errors.some((e) => e.code === "CROSS_TENANT_REFERENCE"));
});

test("fixture 7 — secret literal: válido a nivel de schema, inválido a nivel de validateResolvedConfig", () => {
  const doc = loadJson("fixtures/tenant-config/invalid-secret-literal.client-config.json");
  const schemaResult = validateAgainstSchema(clientConfigSchema, doc);
  assert.equal(schemaResult.valid, true);

  const core = loadCoreConfig();
  const vertical = loadVerticalConfig();
  const resolved = mergeConfigLayers({ core, vertical, client: doc });
  const result = validateResolvedConfig(resolved, { core });
  assert.ok(result.errors.some((e) => e.code === "SECRET_LITERAL"));
});

test("fixture 8 — duplicate domain: registro válido a nivel de schema, detectado por checkTenantRegistryDuplicates", () => {
  const registrySchema = loadJson("config/tenant-registry.schema.json");
  const registry = loadJson("fixtures/tenant-config/invalid-duplicate-domain.registry.json");
  const schemaResult = validateAgainstSchema(registrySchema, registry);
  assert.equal(schemaResult.valid, true);

  const dupResult = checkTenantRegistryDuplicates(registry);
  assert.equal(dupResult.valid, false);
  assert.deepEqual(dupResult.errors.map((e) => e.code), ["DUPLICATE_DOMAIN"]);
});

test("fixture 9 — incompatible feature dependency: schema-válido, la cascada degrada automáticamente en vez de fallar duro", () => {
  const doc = loadJson("fixtures/tenant-config/invalid-incompatible-feature-dependency.client-config.json");
  const schemaResult = validateAgainstSchema(clientConfigSchema, doc);
  assert.equal(schemaResult.valid, true);

  const core = loadCoreConfig();
  const vertical = loadVerticalConfig();
  const resolved = mergeConfigLayers({ core, vertical, client: doc });
  assert.equal(resolved.features.listaEspera, false); // degradado, no lanzado
  assert.ok(resolved.featuresDegraded.some((d) => d.feature === "listaEspera"));

  const result = validateResolvedConfig(resolved, { core });
  assert.deepEqual(result.errors, []); // tras la degradación automática, el resuelto ya es consistente
});
