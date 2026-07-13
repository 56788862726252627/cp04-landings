// Complementa role-coverage-report.test.mjs (cobertura POSITIVA: qué rol
// puede hacer qué) con cobertura NEGATIVA: confirmar que un rol FUERA de
// initiating_role queda denegado (403) para cada escenario, usando
// rbac-auth-simulator.mjs. Refuerza [[KNOWN_ROLE_GATE_CAVEAT]] — esto
// prueba el contrato deseado, no el Worker real (gate inactivo hoy).

import test from "node:test";
import assert from "node:assert/strict";
import { loadScenarios } from "../../scripts/make-qa/manifest-loader.mjs";
import { simulateRequest } from "../../scripts/make-qa/rbac-auth-simulator.mjs";

const BUSINESS_ROLES = ["PLAYER", "STAFF", "ADMIN", "SUPPORT"];

test("cada uno de los 4 roles de negocio tiene al menos un escenario donde NO está en initiating_role (el negativo es significativo, no vacío)", () => {
  const scenarios = loadScenarios();
  for (const role of BUSINESS_ROLES) {
    const hasExclusion = scenarios.some((s) => !s.initiating_role.includes(role));
    assert.ok(hasExclusion, `${role} está en initiating_role de TODOS los escenarios — el negativo no probaría nada`);
  }
});

test("para todos los escenarios con initiating_role limitado a roles de negocio, un rol de negocio ausente de la lista recibe 403", () => {
  const scenarios = loadScenarios().filter((s) => s.initiating_role.some((r) => BUSINESS_ROLES.includes(r)));
  let checked = 0;
  for (const scenario of scenarios) {
    const wrongRole = BUSINESS_ROLES.find((r) => !scenario.initiating_role.includes(r));
    if (!wrongRole) continue; // los 4 roles están permitidos, no hay un "wrong role" de negocio posible
    const result = simulateRequest({ hasToken: true, tokenValid: true, role: wrongRole, allowedRoles: scenario.initiating_role });
    assert.equal(result.http_status, 403, `${scenario.scenario_name}: se esperaba 403 para el rol "${wrongRole}"`);
    checked += 1;
  }
  assert.ok(checked >= 25, `se esperaban >=25 escenarios verificados, se verificaron ${checked}`);
});

test("PLAYER queda denegado en un escenario exclusivo de ADMIN (Instagram Borrador con IA)", () => {
  const scenarios = loadScenarios();
  const scenario = scenarios.find((s) => s.scenario_id === "6335114");
  const result = simulateRequest({ hasToken: true, tokenValid: true, role: "PLAYER", allowedRoles: scenario.initiating_role });
  assert.equal(result.http_status, 403);
});

test("ADMIN/STAFF quedan denegados en un escenario iniciado solo por PLAYER (API Reservas)", () => {
  const scenario = loadScenarios().find((s) => s.scenario_id === "5697630");
  for (const role of ["ADMIN", "STAFF"]) {
    const result = simulateRequest({ hasToken: true, tokenValid: true, role, allowedRoles: scenario.initiating_role });
    assert.equal(result.http_status, 403, role);
  }
});

test("SUPPORT queda denegado en escenarios operativos que no le corresponden (Alta de Jugador)", () => {
  const scenario = loadScenarios().find((s) => s.scenario_id === "6199248");
  const result = simulateRequest({ hasToken: true, tokenValid: true, role: "SUPPORT", allowedRoles: scenario.initiating_role });
  assert.equal(result.http_status, 403);
});
