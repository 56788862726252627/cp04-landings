import test from "node:test";
import assert from "node:assert/strict";
import {
  isInMaintenanceWindow,
  isKnownIssue,
  detectFlapping,
  evaluateSuppression,
  DEFAULT_FLAPPING_WINDOW_MS,
  DEFAULT_FLAPPING_THRESHOLD,
} from "../../scripts/observability/suppression.mjs";

const NOW = Date.parse("2026-07-08T12:00:00.000Z");

function group(service, error_code) {
  return { service, error_code };
}

test("una ventana de mantenimiento activa para el mismo servicio suprime", () => {
  const windows = [{ service: "airtable", starts_at: "2026-07-08T11:00:00.000Z", ends_at: "2026-07-08T13:00:00.000Z" }];
  assert.equal(isInMaintenanceWindow(group("airtable", "AIRTABLE_RATE_LIMIT.EXCEEDED"), windows, NOW), true);
});

test("una ventana de mantenimiento de otro servicio no suprime", () => {
  const windows = [{ service: "make", starts_at: "2026-07-08T11:00:00.000Z", ends_at: "2026-07-08T13:00:00.000Z" }];
  assert.equal(isInMaintenanceWindow(group("airtable", "AIRTABLE_RATE_LIMIT.EXCEEDED"), windows, NOW), false);
});

test("scope '*' de la ventana de mantenimiento aplica a cualquier servicio", () => {
  const windows = [{ service: "*", starts_at: "2026-07-08T11:00:00.000Z", ends_at: "2026-07-08T13:00:00.000Z" }];
  assert.equal(isInMaintenanceWindow(group("worker", "WORKER_5XX.INTERNAL_ERROR"), windows, NOW), true);
});

test("una ventana de mantenimiento ya terminada no suprime", () => {
  const windows = [{ service: "airtable", starts_at: "2026-07-08T08:00:00.000Z", ends_at: "2026-07-08T09:00:00.000Z" }];
  assert.equal(isInMaintenanceWindow(group("airtable", "AIRTABLE_RATE_LIMIT.EXCEEDED"), windows, NOW), false);
});

test("un known issue no expirado para el mismo error_code suprime", () => {
  const known = [{ error_code: "MAKE_EXECUTION.SCENARIO_FAILED", expires_at: "2026-07-09T00:00:00.000Z" }];
  assert.equal(isKnownIssue(group("make", "MAKE_EXECUTION.SCENARIO_FAILED"), known, NOW), true);
});

test("un known issue expirado ya no suprime — nunca supresión permanente sin revisión", () => {
  const known = [{ error_code: "MAKE_EXECUTION.SCENARIO_FAILED", expires_at: "2026-07-01T00:00:00.000Z" }];
  assert.equal(isKnownIssue(group("make", "MAKE_EXECUTION.SCENARIO_FAILED"), known, NOW), false);
});

test("detectFlapping por debajo del umbral no marca flapping", () => {
  const transitions = [{ timestamp: "2026-07-08T11:55:00.000Z" }, { timestamp: "2026-07-08T11:57:00.000Z" }];
  assert.equal(detectFlapping(transitions, NOW), false);
});

test("detectFlapping con transiciones >= umbral dentro de la ventana marca flapping", () => {
  const transitions = Array.from({ length: DEFAULT_FLAPPING_THRESHOLD }, (_, i) => ({
    timestamp: new Date(NOW - i * 60 * 1000).toISOString(),
  }));
  assert.equal(detectFlapping(transitions, NOW), true);
});

test("detectFlapping ignora transiciones fuera de la ventana", () => {
  const transitions = [{ timestamp: new Date(NOW - DEFAULT_FLAPPING_WINDOW_MS - 60_000).toISOString() }];
  assert.equal(detectFlapping(transitions, NOW), false);
});

test("evaluateSuppression prioriza MAINTENANCE_WINDOW y expone el motivo explícito", () => {
  const result = evaluateSuppression(group("airtable", "AIRTABLE_RATE_LIMIT.EXCEEDED"), {
    maintenanceWindows: [{ service: "airtable", starts_at: "2026-07-08T11:00:00.000Z", ends_at: "2026-07-08T13:00:00.000Z" }],
    nowMs: NOW,
  });
  assert.deepEqual(result, { suppressed: true, reason: "MAINTENANCE_WINDOW" });
});

test("evaluateSuppression sin ninguna condición devuelve suppressed:false, reason:null", () => {
  const result = evaluateSuppression(group("worker", "WORKER_5XX.INTERNAL_ERROR"), { nowMs: NOW });
  assert.deepEqual(result, { suppressed: false, reason: null });
});

test("evaluateSuppression detecta KNOWN_ISSUE cuando no hay ventana de mantenimiento activa", () => {
  const result = evaluateSuppression(group("make", "MAKE_EXECUTION.SCENARIO_FAILED"), {
    knownIssues: [{ error_code: "MAKE_EXECUTION.SCENARIO_FAILED", expires_at: "2026-07-09T00:00:00.000Z" }],
    nowMs: NOW,
  });
  assert.deepEqual(result, { suppressed: true, reason: "KNOWN_ISSUE" });
});
