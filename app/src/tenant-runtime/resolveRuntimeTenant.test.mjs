import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveRuntimeTenant } from "./resolveRuntimeTenant.js";
import { loadTenantRegistry } from "../config/loadTenantRegistry.js";
import { repoPath } from "../config/paths.js";

function registry() {
  return loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));
}

test("resolveRuntimeTenant: dominio activo conocido resuelve status active, resolvedVia domain", () => {
  const result = resolveRuntimeTenant("club-padel-04.pages.dev", registry());
  assert.equal(result.status, "active");
  assert.equal(result.tenantId, "cp04");
  assert.equal(result.resolvedVia, "domain");
});

test("resolveRuntimeTenant: dominio staging conocido resuelve status staging", () => {
  const result = resolveRuntimeTenant("club-deportivo-fixture-dos.pages.dev", registry());
  assert.equal(result.status, "staging");
  assert.equal(result.tenantId, "fixture-club-02");
  assert.equal(result.resolvedVia, "domain");
});

test("resolveRuntimeTenant: tenant maintenance resuelve status maintenance (no oculta el estado)", () => {
  const result = resolveRuntimeTenant("club-deportivo-fixture-cuatro.pages.dev", registry());
  assert.equal(result.status, "maintenance");
  assert.equal(result.tenantId, "fixture-club-04");
});

test("resolveRuntimeTenant: tenant disabled resuelve status disabled (no oculta el estado)", () => {
  const result = resolveRuntimeTenant("club-deportivo-fixture-tres.pages.dev", registry());
  assert.equal(result.status, "disabled");
  assert.equal(result.tenantId, "fixture-club-03");
});

test("resolveRuntimeTenant: dominio desconocido SIN fallback configurado sigue siendo unknown_domain", () => {
  const result = resolveRuntimeTenant("dominio-no-registrado.pages.dev", registry());
  assert.equal(result.status, "unknown_domain");
  assert.equal(result.tenantId, null);
  assert.equal(result.resolvedVia, "none");
});

test("resolveRuntimeTenant: dominio desconocido CON fallback explícito usa el tenant de fallback", () => {
  const result = resolveRuntimeTenant("dominio-no-registrado.pages.dev", registry(), { fallbackTenantId: "cp04" });
  assert.equal(result.status, "active");
  assert.equal(result.tenantId, "cp04");
  assert.equal(result.resolvedVia, "fallback");
});

test("resolveRuntimeTenant: dominio CONOCIDO ignora fallback (el fallback solo aplica a unknown_domain)", () => {
  const result = resolveRuntimeTenant("club-deportivo-fixture-dos.pages.dev", registry(), { fallbackTenantId: "cp04" });
  assert.equal(result.tenantId, "fixture-club-02");
  assert.equal(result.resolvedVia, "domain");
});

test("resolveRuntimeTenant: fallbackTenantId que no existe en el registry lanza (no fabrica un tenant)", () => {
  assert.throws(
    () => resolveRuntimeTenant("dominio-no-registrado.pages.dev", registry(), { fallbackTenantId: "no-existe" }),
    /no existe en el tenant-registry/
  );
});

test("resolveRuntimeTenant: localhost SIN fallback configurado es unknown_domain, nunca resuelve un tenant implícito (entorno de desarrollo local)", () => {
  const result = resolveRuntimeTenant("localhost:5173", registry());
  assert.equal(result.status, "unknown_domain");
  assert.equal(result.tenantId, null);
  assert.equal(result.resolvedVia, "none");
});

test("resolveRuntimeTenant: localhost fallback explícito (uso previsto para desarrollo local) resuelve el tenant de fallback, resolvedVia fallback", () => {
  const result = resolveRuntimeTenant("localhost:5173", registry(), { fallbackTenantId: "cp04" });
  assert.equal(result.status, "active");
  assert.equal(result.tenantId, "cp04");
  assert.equal(result.resolvedVia, "fallback");
});
