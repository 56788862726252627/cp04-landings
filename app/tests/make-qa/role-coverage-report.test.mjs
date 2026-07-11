import test from "node:test";
import assert from "node:assert/strict";
import { buildRoleCoverageReport } from "../../scripts/make-qa/role-coverage-report.mjs";

test("cubre los 4 roles de negocio pedidos: PLAYER, STAFF, ADMIN, SUPPORT", () => {
  const report = buildRoleCoverageReport();
  for (const role of ["PLAYER", "STAFF", "ADMIN", "SUPPORT"]) {
    assert.ok(report.roles[role], `falta el rol ${role}`);
    assert.ok(report.roles[role].distinct_scenarios > 0, `${role} debería tener al menos 1 escenario`);
  }
});

test("PLAYER incluye Generación QR Acceso como iniciador", () => {
  const report = buildRoleCoverageReport();
  const ids = report.roles.PLAYER.as_initiator.map((s) => s.scenario_id);
  assert.ok(ids.includes("6244975"));
});

test("SUPPORT incluye Mapa de Flujos como consumidor", () => {
  const report = buildRoleCoverageReport();
  const ids = report.roles.SUPPORT.as_consumer.map((s) => s.scenario_id);
  assert.ok(ids.includes("6233755"));
});

test("total_scenarios coincide con el manifest (50)", () => {
  const report = buildRoleCoverageReport();
  assert.equal(report.total_scenarios, 50);
});

test("PASS_VERIFIED por rol nunca supera 1 (el único PASS_VERIFIED real de todo el manifest)", () => {
  const report = buildRoleCoverageReport();
  for (const role of ["PLAYER", "STAFF", "ADMIN", "SUPPORT"]) {
    assert.ok(report.roles[role].pass_verified <= 1);
  }
});
