import test from "node:test";
import assert from "node:assert/strict";
import { ENVIRONMENT_NAMES, getEnvironmentProfile, isIntegrationAllowed, requiresHumanDeployApproval, requiresHumanRollbackApproval } from "../../scripts/release/environments.mjs";

test("environments: exactamente los 5 entornos pedidos, en orden", () => {
  assert.deepEqual(ENVIRONMENT_NAMES, ["LOCAL", "TEST", "STAGING", "CANARY", "PRODUCTION"]);
});

test("environments: cada entorno define las 7 dimensiones pedidas", () => {
  for (const name of ENVIRONMENT_NAMES) {
    const profile = getEnvironmentProfile(name);
    for (const key of ["allowedIntegrations", "requiredSecrets", "dataPolicy", "loggingPolicy", "backupPolicy", "deploymentPermission", "rollbackPolicy"]) {
      assert.ok(key in profile, `${name} debería definir ${key}`);
    }
  }
});

test("environments: LOCAL/TEST no permiten ninguna integración real", () => {
  assert.equal(isIntegrationAllowed("LOCAL", "airtable_production"), false);
  assert.equal(isIntegrationAllowed("TEST", "make_production"), false);
});

test("environments: PRODUCTION sí permite airtable_production", () => {
  assert.equal(isIntegrationAllowed("PRODUCTION", "airtable_production"), true);
});

test("environments: entorno desconocido lanza en vez de devolver un perfil inventado", () => {
  assert.throws(() => getEnvironmentProfile("QA_MYSTERY"));
});

test("environments: PRODUCTION requiere aprobación humana para desplegar, STAGING no", () => {
  assert.equal(requiresHumanDeployApproval("PRODUCTION"), true);
  assert.equal(requiresHumanDeployApproval("STAGING"), false);
});

test("environments: PRODUCTION requiere aprobación humana para rollback salvo trigger=incident", () => {
  assert.equal(requiresHumanRollbackApproval("PRODUCTION", "manual"), true);
  assert.equal(requiresHumanRollbackApproval("PRODUCTION", "incident"), false);
  assert.equal(requiresHumanRollbackApproval("STAGING", "manual"), false);
});
