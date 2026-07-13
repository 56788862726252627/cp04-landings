// Fase 11: pipeline completo (load -> merge -> validate -> tenant context ->
// role capabilities -> domain resolution) para los 2 fixtures válidos:
// Club Pádel 04 (cliente real) y el segundo club técnico (fixture, no real).
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadCoreConfig } from "../../src/config/loadCoreConfig.js";
import { loadVerticalConfig } from "../../src/config/loadVerticalConfig.js";
import { loadClientConfig } from "../../src/config/loadClientConfig.js";
import { loadTenantRegistry } from "../../src/config/loadTenantRegistry.js";
import { mergeConfigLayers } from "../../src/config/mergeConfigLayers.js";
import { validateResolvedConfig } from "../../src/config/validateResolvedConfig.js";
import { resolveTenantContext } from "../../src/config/resolveTenantContext.js";
import { resolveRoleCapabilities } from "../../src/config/resolveRoleCapabilities.js";
import { resolveDomainTenant } from "../../src/config/resolveDomainTenant.js";
import { repoPath } from "../../src/config/paths.js";

function runPipeline(clientConfigRelPath, hostname) {
  const core = loadCoreConfig();
  const vertical = loadVerticalConfig();
  const client = loadClientConfig(repoPath(...clientConfigRelPath));
  const registry = loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));

  const resolved = mergeConfigLayers({ core, vertical, client });
  const validation = validateResolvedConfig(resolved, { core, registry });
  const tenantContext = resolveTenantContext(resolved);
  const capabilities = resolveRoleCapabilities(resolved);
  const domain = resolveDomainTenant(hostname, registry);

  return { resolved, validation, tenantContext, capabilities, domain };
}

test("pipeline completo — Club Pádel 04 (cliente real): 0 errores de principio a fin", () => {
  const { validation, domain, resolved, capabilities } = runPipeline(
    ["config", "client-config.example.valid.json"],
    "club-padel-04.pages.dev"
  );
  assert.equal(validation.valid, true);
  assert.equal(domain.status, "active");
  assert.equal(domain.tenantId, resolved.tenantId);
  assert.ok(capabilities.ADMIN.includes("tournament.manage"));
});

test("pipeline completo — segundo club técnico (fixture, NO cliente real): resuelve en staging sin tocar CORE", () => {
  const { validation, domain, resolved } = runPipeline(
    ["fixtures", "tenant-config", "valid-second-club-fixture.client-config.json"],
    "club-deportivo-fixture-dos.pages.dev"
  );
  assert.equal(validation.valid, true);
  assert.equal(domain.status, "staging");
  assert.equal(resolved.tenantId, "fixture-club-02");
  assert.equal(resolved.verticalId, "padel"); // mismo vertical, sin duplicar vocabulario
});

test("pipeline completo: tenantContext.cacheNamespace y validation.valid concuerdan para ambos clientes", () => {
  const cp04 = runPipeline(["config", "client-config.example.valid.json"], "club-padel-04.pages.dev");
  const fixture2 = runPipeline(
    ["fixtures", "tenant-config", "valid-second-club-fixture.client-config.json"],
    "club-deportivo-fixture-dos.pages.dev"
  );
  assert.notEqual(cp04.tenantContext.cacheNamespace, fixture2.tenantContext.cacheNamespace);
  assert.equal(cp04.tenantContext.cacheNamespace, "tenant:cp04");
  assert.equal(fixture2.tenantContext.cacheNamespace, "tenant:fixture-club-02");
});
