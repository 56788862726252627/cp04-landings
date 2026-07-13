import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTenantRuntimeContextValue } from "./buildTenantRuntimeContextValue.js";
import { loadResolvedRuntimeConfig } from "./loadResolvedRuntimeConfig.js";
import { repoPath } from "../config/paths.js";

function cp04Config() {
  return loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") }).resolvedConfig;
}

test("buildTenantRuntimeContextValue: expone exactamente el set pedido por la misión para Club Pádel 04 activo", () => {
  const value = buildTenantRuntimeContextValue({ resolvedConfig: cp04Config(), tenantStatus: { status: "active" } });

  assert.equal(value.tenantId, "cp04");
  assert.equal(value.verticalId, "padel");
  assert.equal(value.resolvedConfig.tenantId, "cp04");
  assert.equal(value.branding.clubName, "Club Pádel 04");
  assert.equal(value.resources.courts.length, 4);
  assert.deepEqual(value.businessHours.slots.slice(0, 2), ["08:00", "09:00"]);
  assert.equal(value.featureFlags.torneos, true);
  assert.ok(value.roleCapabilities.ADMIN.includes("admin.manage_config"));
  assert.equal(value.locale.language, "es-ES");
  assert.equal(value.timezone, "Europe/Madrid");
  assert.equal(value.maintenanceMode, false);
  assert.equal(value.deploymentState, "production");
});

test("buildTenantRuntimeContextValue: tenant en maintenance propaga maintenanceMode=true al valor del Provider", () => {
  const value = buildTenantRuntimeContextValue({ resolvedConfig: cp04Config(), tenantStatus: { status: "maintenance" } });
  assert.equal(value.maintenanceMode, true);
  assert.equal(value.status, "maintenance");
});

test("buildTenantRuntimeContextValue: dos tenants resuelven valores completamente aislados (sin fuga de datos entre ellos)", () => {
  const cp04Value = buildTenantRuntimeContextValue({ resolvedConfig: cp04Config(), tenantStatus: { status: "active" } });
  const secondConfig = loadResolvedRuntimeConfig({
    clientSource: repoPath("fixtures", "tenant-config", "valid-second-club-fixture.client-config.json"),
  }).resolvedConfig;
  const secondValue = buildTenantRuntimeContextValue({ resolvedConfig: secondConfig, tenantStatus: { status: "staging" } });

  assert.notEqual(cp04Value.tenantId, secondValue.tenantId);
  assert.notEqual(cp04Value.branding.clubName, secondValue.branding.clubName);
  assert.notEqual(cp04Value.resources.courts.length, secondValue.resources.courts.length);
  assert.equal(cp04Value.observability.tenantId, "cp04");
  assert.equal(secondValue.observability.tenantId, "fixture-club-02");
  assert.notEqual(cp04Value.observability.tenantId, secondValue.observability.tenantId);
});
