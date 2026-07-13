import { test } from "node:test";
import assert from "node:assert/strict";
import { loadResolvedRuntimeConfig } from "./loadResolvedRuntimeConfig.js";
import { loadTenantRegistry } from "../config/loadTenantRegistry.js";
import { repoPath } from "../config/paths.js";

function registry() {
  return loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));
}

test("loadResolvedRuntimeConfig: lanza sin clientSource — no hay cliente por defecto", () => {
  assert.throws(() => loadResolvedRuntimeConfig({}), /requiere clientSource/);
});

test("loadResolvedRuntimeConfig: resuelve Club Pádel 04 de extremo a extremo (core+vertical por defecto)", () => {
  const { resolvedConfig, validation } = loadResolvedRuntimeConfig({
    clientSource: repoPath("config", "client-config.example.valid.json"),
    registry: registry(),
  });
  assert.equal(resolvedConfig.tenantId, "cp04");
  assert.equal(resolvedConfig.verticalId, "padel");
  assert.equal(resolvedConfig.features.torneos, true);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test("loadResolvedRuntimeConfig: resuelve el segundo tenant fixture (staging) reutilizando el mismo core/vertical", () => {
  const { resolvedConfig, validation } = loadResolvedRuntimeConfig({
    clientSource: repoPath("fixtures", "tenant-config", "valid-second-club-fixture.client-config.json"),
    registry: registry(),
  });
  assert.equal(resolvedConfig.tenantId, "fixture-club-02");
  assert.equal(resolvedConfig.slug, "club-deportivo-fixture-dos");
  assert.equal(validation.valid, true);
});

test("loadResolvedRuntimeConfig: propaga el error de schema si el client-config viola un campo protegido (defensa en profundidad: el schema ya rechaza features.pagos=true vía const:false, antes de llegar a mergeConfigLayers)", () => {
  assert.throws(
    () =>
      loadResolvedRuntimeConfig({
        clientSource: repoPath("fixtures", "tenant-config", "invalid-forbidden-core-override.client-config.json"),
      }),
    /client-config inválido/
  );
});

test("loadResolvedRuntimeConfig: la validación cruzada detecta una referencia cross-tenant sin lanzar (reporta en validation.errors)", () => {
  const { validation } = loadResolvedRuntimeConfig({
    clientSource: repoPath("fixtures", "tenant-config", "invalid-cross-tenant-reference.client-config.json"),
    registry: registry(),
  });
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((e) => e.code === "CROSS_TENANT_REFERENCE"));
});
