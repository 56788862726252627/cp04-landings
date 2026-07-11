import test from "node:test";
import assert from "node:assert/strict";
import { simulateAuthCheck, simulateRoleCheck, simulateRequest, buildStandardAuthCases, KNOWN_ROLE_GATE_CAVEAT } from "../../scripts/make-qa/rbac-auth-simulator.mjs";
import { findByScenarioId } from "../../scripts/make-qa/manifest-loader.mjs";

test("no-token -> 401", () => {
  const result = simulateAuthCheck({ hasToken: false, tokenValid: false });
  assert.equal(result.status, 401);
  assert.match(result.reason, /no_token/);
});

test("invalid-token (presente pero inválido) -> 401", () => {
  const result = simulateAuthCheck({ hasToken: true, tokenValid: false });
  assert.equal(result.status, 401);
  assert.match(result.reason, /invalid_token/);
});

test("token válido -> 200 en la capa de auth", () => {
  const result = simulateAuthCheck({ hasToken: true, tokenValid: true });
  assert.equal(result.status, 200);
});

test("wrong-role -> 403", () => {
  const result = simulateRoleCheck({ role: "PLAYER", allowedRoles: ["STAFF", "ADMIN"] });
  assert.equal(result.status, 403);
});

test("rol permitido -> 200 en la capa de rol", () => {
  const result = simulateRoleCheck({ role: "STAFF", allowedRoles: ["STAFF", "ADMIN"] });
  assert.equal(result.status, 200);
});

test("simulateRequest: sin token nunca llega a evaluar el rol (falla en auth primero)", () => {
  const result = simulateRequest({ hasToken: false, tokenValid: false, role: "ADMIN", allowedRoles: ["STAFF"] });
  assert.equal(result.http_status, 401);
  assert.equal(result.stage, "auth");
});

test("simulateRequest: token válido pero rol incorrecto -> 403 en la etapa 'role'", () => {
  const result = simulateRequest({ hasToken: true, tokenValid: true, role: "PLAYER", allowedRoles: ["STAFF", "ADMIN"] });
  assert.equal(result.http_status, 403);
  assert.equal(result.stage, "role");
});

test("simulateRequest: token válido y rol correcto -> 200", () => {
  const result = simulateRequest({ hasToken: true, tokenValid: true, role: "STAFF", allowedRoles: ["STAFF", "ADMIN"] });
  assert.equal(result.http_status, 200);
  assert.equal(result.stage, "pass");
});

test("buildStandardAuthCases genera exactamente 4 casos (no_token, invalid_token, wrong_role, happy_path) por escenario", () => {
  const scenario = findByScenarioId("5697630"); // API Reservas, initiating_role: [PLAYER]
  const cases = buildStandardAuthCases(scenario, "ADMIN");
  assert.equal(cases.length, 4);
  assert.deepEqual(cases.map((c) => c.name).sort(), ["happy_path", "invalid_token", "no_token", "wrong_role"].sort());
});

test("los 4 casos estándar de API Reservas (5697630) producen exactamente los status esperados vía simulateRequest", () => {
  const scenario = findByScenarioId("5697630");
  const cases = buildStandardAuthCases(scenario, "ADMIN");
  for (const c of cases) {
    const result = simulateRequest(c.params);
    assert.equal(result.http_status, c.expected_status, `caso ${c.name}`);
  }
});

test("KNOWN_ROLE_GATE_CAVEAT documenta que CP04_ENFORCE_ROLE_GATES está inactivo en producción hoy", () => {
  assert.match(KNOWN_ROLE_GATE_CAVEAT, /CP04_ENFORCE_ROLE_GATES/);
});
