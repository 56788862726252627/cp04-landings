import test from "node:test";
import assert from "node:assert/strict";
import { dedupeAlerts, fingerprintOf, alertLevelOf, DEFAULT_DEDUP_WINDOW_MS } from "../../scripts/observability/dedup.mjs";

function ev(service, error_code, timestamp, correlation_id = null) {
  return { service, error_code, timestamp, correlation_id };
}

test("eventos sin error_code no son candidatos a alerta y no producen grupo", () => {
  const groups = dedupeAlerts([{ service: "worker", error_code: null, timestamp: "2026-07-08T10:00:00.000Z" }]);
  assert.equal(groups.length, 0);
});

test("dos ocurrencias del mismo fingerprint dentro de la ventana colapsan en un solo grupo con count=2", () => {
  const groups = dedupeAlerts([
    ev("airtable", "AIRTABLE_RATE_LIMIT.EXCEEDED", "2026-07-08T10:00:00.000Z"),
    ev("airtable", "AIRTABLE_RATE_LIMIT.EXCEEDED", "2026-07-08T10:02:00.000Z"),
  ]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].count, 2);
  assert.equal(groups[0].first_seen, "2026-07-08T10:00:00.000Z");
  assert.equal(groups[0].last_seen, "2026-07-08T10:02:00.000Z");
});

test("un hueco mayor que la ventana para el mismo fingerprint abre un grupo nuevo (no es la misma racha)", () => {
  const groups = dedupeAlerts([
    ev("worker", "WORKER_5XX.INTERNAL_ERROR", "2026-07-08T10:00:00.000Z"),
    ev("worker", "WORKER_5XX.INTERNAL_ERROR", "2026-07-08T10:30:00.000Z"),
  ], { windowMs: DEFAULT_DEDUP_WINDOW_MS });
  assert.equal(groups.length, 2);
  assert.equal(groups[0].count, 1);
  assert.equal(groups[1].count, 1);
});

test("fingerprints distintos (service o error_code) nunca se mezclan en el mismo grupo", () => {
  const groups = dedupeAlerts([
    ev("worker", "WORKER_5XX.INTERNAL_ERROR", "2026-07-08T10:00:00.000Z"),
    ev("airtable", "AIRTABLE_RATE_LIMIT.EXCEEDED", "2026-07-08T10:00:00.000Z"),
    ev("worker", "WORKER_4XX.RATE_LIMITED", "2026-07-08T10:00:00.000Z"),
  ]);
  assert.equal(groups.length, 3);
});

test("alert_level se resuelve desde error-taxonomy.json, nunca hardcodeado en dedup.mjs", () => {
  assert.equal(alertLevelOf("AIRTABLE_MONTHLY_QUOTA.EXHAUSTED"), "P0");
  assert.equal(alertLevelOf("AIRTABLE_RATE_LIMIT.EXCEEDED"), "P1");
  assert.equal(alertLevelOf(null), null);
});

test("un error_code no reconocido en la taxonomía resuelve a P1 conservador, nunca a null/None", () => {
  assert.equal(alertLevelOf("NO_EXISTE.CODIGO_INVENTADO"), "P1");
});

test("fingerprintOf combina service + error_code, no incluye timestamp ni correlation_id", () => {
  assert.equal(fingerprintOf({ service: "make", error_code: "MAKE_EXECUTION.SCENARIO_FAILED" }), "make|MAKE_EXECUTION.SCENARIO_FAILED");
});

test("los grupos se devuelven ordenados por first_seen ascendente, sea cual sea el orden de entrada", () => {
  const groups = dedupeAlerts([
    ev("worker", "WORKER_5XX.INTERNAL_ERROR", "2026-07-08T12:00:00.000Z"),
    ev("airtable", "AIRTABLE_RATE_LIMIT.EXCEEDED", "2026-07-08T09:00:00.000Z"),
  ]);
  assert.deepEqual(groups.map((g) => g.service), ["airtable", "worker"]);
});

test("correlation_ids del grupo se acumulan sin duplicados y sin incluir null", () => {
  const groups = dedupeAlerts([
    ev("make", "MAKE_EXECUTION.SCENARIO_FAILED", "2026-07-08T10:00:00.000Z", "corr_a"),
    ev("make", "MAKE_EXECUTION.SCENARIO_FAILED", "2026-07-08T10:01:00.000Z", "corr_a"),
    ev("make", "MAKE_EXECUTION.SCENARIO_FAILED", "2026-07-08T10:02:00.000Z", null),
  ]);
  assert.deepEqual(groups[0].correlation_ids, ["corr_a"]);
});
