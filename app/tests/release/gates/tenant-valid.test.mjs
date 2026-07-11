import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluateTenantValid } from "../../../scripts/release/gates/tenant-valid.mjs";
import { repoPath } from "../../../src/config/paths.js";

const tenantRegistrySchema = JSON.parse(readFileSync(repoPath("config", "tenant-registry.schema.json"), "utf8"));
const validRegistry = JSON.parse(readFileSync(repoPath("config", "tenant-registry.example.valid.json"), "utf8"));
const duplicateIdRegistry = JSON.parse(readFileSync(repoPath("config", "tenant-registry.example.invalid.json"), "utf8"));
const duplicateDomainRegistry = JSON.parse(readFileSync(repoPath("fixtures", "tenant-config", "invalid-duplicate-domain.registry.json"), "utf8"));
const disabledTenantDeploymentProfile = JSON.parse(readFileSync(repoPath("fixtures", "tenant-config", "invalid-disabled-tenant-deployment.deployment-profile.json"), "utf8"));

test("TENANT_VALID: LOCAL/TEST -> NOT_REQUIRED, nunca exige registro", () => {
  const local = evaluateTenantValid({ environment: "LOCAL" });
  const t = evaluateTenantValid({ environment: "TEST" });
  assert.equal(local.status, "NOT_REQUIRED");
  assert.equal(t.status, "NOT_REQUIRED");
});

test("TENANT_VALID: STAGING sin tenant-registry cargado -> UNVERIFIED, nunca PASS implícito", () => {
  const result = evaluateTenantValid({ environment: "STAGING", tenantRegistry: null, evidenceRef: "x" });
  assert.equal(result.status, "UNVERIFIED");
});

test("TENANT_VALID: registro válido en STAGING (sin deploymentProfile) -> PASS", () => {
  const result = evaluateTenantValid({ environment: "STAGING", tenantRegistry: validRegistry, tenantRegistrySchema, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("TENANT_VALID: tenantId duplicado en el registro -> FAIL", () => {
  const result = evaluateTenantValid({ environment: "STAGING", tenantRegistry: duplicateIdRegistry, evidenceRef: "x" });
  assert.equal(result.status, "FAIL");
  assert.match(result.reason, /duplicad/i);
});

test("TENANT_VALID: dominio duplicado entre tenants -> FAIL", () => {
  const result = evaluateTenantValid({ environment: "STAGING", tenantRegistry: duplicateDomainRegistry, evidenceRef: "x" });
  assert.equal(result.status, "FAIL");
});

test("TENANT_VALID: registro inválido contra schema -> FAIL", () => {
  const brokenRegistry = { schemaVersion: "1.0.0", layer: "registry", tenants: [{ tenantId: "x" }] };
  const result = evaluateTenantValid({ environment: "STAGING", tenantRegistry: brokenRegistry, tenantRegistrySchema, evidenceRef: "x" });
  assert.equal(result.status, "FAIL");
});

test("TENANT_VALID: PRODUCTION sin deploymentProfile -> UNVERIFIED (no se puede confirmar tenant activo)", () => {
  const result = evaluateTenantValid({ environment: "PRODUCTION", tenantRegistry: validRegistry, evidenceRef: "x" });
  assert.equal(result.status, "UNVERIFIED");
});

test("TENANT_VALID: PRODUCTION con tenant disabled/staging/maintenance -> BLOCKED", () => {
  const result = evaluateTenantValid({
    environment: "PRODUCTION",
    tenantRegistry: validRegistry,
    deploymentProfile: disabledTenantDeploymentProfile,
    evidenceRef: "x",
  });
  assert.equal(result.status, "BLOCKED");
});

test("TENANT_VALID: PRODUCTION con tenant active -> PASS", () => {
  const activeDeploymentProfile = { ...disabledTenantDeploymentProfile, clientSlug: "club-padel-04" };
  const result = evaluateTenantValid({
    environment: "PRODUCTION",
    tenantRegistry: validRegistry,
    tenantRegistrySchema,
    deploymentProfile: activeDeploymentProfile,
    evidenceRef: "x",
  });
  assert.equal(result.status, "PASS");
});

test("TENANT_VALID: cada resultado lleva evidence/reason/timestamp/evaluator/remediation_hint", () => {
  const result = evaluateTenantValid({ environment: "STAGING", tenantRegistry: validRegistry, evidenceRef: "ref" });
  assert.equal(result.gate, "TENANT_VALID");
  assert.ok("evidence" in result);
  assert.ok("reason" in result);
  assert.ok("timestamp" in result);
  assert.ok(result.evaluator.includes("tenant-valid.mjs"));
  assert.ok("remediation_hint" in result);
});
