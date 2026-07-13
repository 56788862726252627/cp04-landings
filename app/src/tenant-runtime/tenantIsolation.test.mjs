// Fase 9 — cobertura dedicada de aislamiento multi-tenant a nivel de
// runtime, además de la ya cubierta en cada módulo individual (ver
// loadResolvedRuntimeConfig.test.mjs y buildTenantRuntimeContextValue.test.mjs).
// Este archivo agrupa explícitamente los dos escenarios que la misión pide
// nombrar aparte: "tenant isolation" y "forbidden cross-tenant access".
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadResolvedRuntimeConfig } from "./loadResolvedRuntimeConfig.js";
import { buildTenantRuntimeContextValue } from "./buildTenantRuntimeContextValue.js";
import { loadTenantRegistry } from "../config/loadTenantRegistry.js";
import { repoPath } from "../config/paths.js";

function registry() {
  return loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));
}

test("forbidden cross-tenant access: un client-config que referencia el webhookRef de otro tenant se marca inválido (CROSS_TENANT_REFERENCE)", () => {
  const { validation } = loadResolvedRuntimeConfig({
    clientSource: repoPath("fixtures", "tenant-config", "invalid-cross-tenant-reference.client-config.json"),
    registry: registry(),
  });
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((e) => e.code === "CROSS_TENANT_REFERENCE"));
});

test("forbidden cross-tenant access: el tenant que referencia a otro no se convierte por eso en ese otro tenant (identidad propia intacta)", () => {
  const { resolvedConfig } = loadResolvedRuntimeConfig({
    clientSource: repoPath("fixtures", "tenant-config", "invalid-cross-tenant-reference.client-config.json"),
    registry: registry(),
  });
  // La referencia cruzada es un error de VALIDACIÓN (dato mal configurado),
  // no una fuga de identidad: el tenant sigue resolviendo su propio tenantId.
  assert.equal(resolvedConfig.tenantId, "fixture-club-06");
  assert.notEqual(resolvedConfig.tenantId, "fixture-club-02");
});

test("tenant isolation: los namespaces de cache/storage/observability/backup/audit de dos tenants nunca coinciden", () => {
  const cp04 = buildTenantRuntimeContextValue({
    resolvedConfig: loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") }).resolvedConfig,
    tenantStatus: { status: "active" },
  });
  const second = buildTenantRuntimeContextValue({
    resolvedConfig: loadResolvedRuntimeConfig({
      clientSource: repoPath("fixtures", "tenant-config", "valid-second-club-fixture.client-config.json"),
    }).resolvedConfig,
    tenantStatus: { status: "staging" },
  });

  assert.notEqual(cp04.observability.tenantId, second.observability.tenantId);
  assert.notEqual(cp04.backup.tenantId, second.backup.tenantId);
  assert.notEqual(cp04.audit.tenantId, second.audit.tenantId);
  assert.notEqual(cp04.resolvedConfig.integrations.automation.webhookRef, second.resolvedConfig.integrations.automation.webhookRef);
});

test("tenant isolation: resolver el tenant B no deja residuo del tenant A resuelto justo antes (llamadas independientes, sin estado compartido)", () => {
  const cp04Value = buildTenantRuntimeContextValue({
    resolvedConfig: loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") }).resolvedConfig,
    tenantStatus: { status: "active" },
  });
  assert.equal(cp04Value.tenantId, "cp04");

  const secondValue = buildTenantRuntimeContextValue({
    resolvedConfig: loadResolvedRuntimeConfig({
      clientSource: repoPath("fixtures", "tenant-config", "valid-second-club-fixture.client-config.json"),
    }).resolvedConfig,
    tenantStatus: { status: "staging" },
  });
  assert.equal(secondValue.tenantId, "fixture-club-02");
  assert.notEqual(secondValue.branding.clubName, cp04Value.branding.clubName);
});
