import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTenantRegistry } from "./loadTenantRegistry.js";
import { repoPath } from "./paths.js";

test("loadTenantRegistry() lanza sin argumentos — no hay registro por defecto", () => {
  assert.throws(() => loadTenantRegistry(), /requiere una ruta o un objeto/);
});

test("loadTenantRegistry() carga config/tenant-registry.example.valid.json", () => {
  const registry = loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));
  assert.equal(registry.tenants.length, 4);
  assert.equal(registry.tenants[0].tenantId, "cp04");
  assert.equal(registry.tenants[0].status, "active");
});

test("loadTenantRegistry() no rechaza el registro con IDs/dominios duplicados a nivel de schema (es una regla de negocio, no de forma)", () => {
  // La forma (tipos/enum/required) es válida — la detección de duplicados
  // vive en checkTenantRegistryDuplicates (validateResolvedConfig.js).
  const registry = loadTenantRegistry(repoPath("config", "tenant-registry.example.invalid.json"));
  assert.equal(registry.tenants.length, 2);
});

test("loadTenantRegistry() rechaza status fuera del enum", () => {
  const registry = loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));
  const invalid = { ...registry, tenants: [{ ...registry.tenants[0], status: "LIVE" }] };
  assert.throws(() => loadTenantRegistry(invalid), /tenant-registry inválido/);
});
