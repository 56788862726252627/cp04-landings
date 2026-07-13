import { test } from "node:test";
import assert from "node:assert/strict";
import { createTenantRuntimeContext } from "./createTenantRuntimeContext.js";
import { loadResolvedRuntimeConfig } from "./loadResolvedRuntimeConfig.js";
import { repoPath } from "../config/paths.js";

function cp04Config() {
  return loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") }).resolvedConfig;
}

test("createTenantRuntimeContext: lanza sin tenantStatus.status — ningún estado es implícito", () => {
  assert.throws(() => createTenantRuntimeContext({ resolvedConfig: cp04Config() }), /requiere tenantStatus.status/);
});

test("createTenantRuntimeContext: tenant active no está en mantenimiento ni deshabilitado", () => {
  const ctx = createTenantRuntimeContext({ resolvedConfig: cp04Config(), tenantStatus: { status: "active" } });
  assert.equal(ctx.tenantId, "cp04");
  assert.equal(ctx.maintenanceMode, false);
  assert.equal(ctx.disabled, false);
  assert.equal(ctx.deploymentState, "production");
});

test("createTenantRuntimeContext: tenant maintenance activa maintenanceMode", () => {
  const ctx = createTenantRuntimeContext({ resolvedConfig: cp04Config(), tenantStatus: { status: "maintenance" } });
  assert.equal(ctx.maintenanceMode, true);
  assert.equal(ctx.disabled, false);
});

test("createTenantRuntimeContext: tenant disabled activa disabled (no maintenanceMode)", () => {
  const ctx = createTenantRuntimeContext({ resolvedConfig: cp04Config(), tenantStatus: { status: "disabled" } });
  assert.equal(ctx.disabled, true);
  assert.equal(ctx.maintenanceMode, false);
});

test("createTenantRuntimeContext: preserva observability/backup/audit context de resolveTenantContext sin reimplementarlo", () => {
  const ctx = createTenantRuntimeContext({ resolvedConfig: cp04Config(), tenantStatus: { status: "active" } });
  assert.equal(ctx.observability.tenantId, "cp04");
  assert.equal(ctx.backup.tenantId, "cp04");
  assert.equal(ctx.audit.tenantId, "cp04");
  assert.equal(ctx.cacheNamespace, "tenant:cp04");
});
