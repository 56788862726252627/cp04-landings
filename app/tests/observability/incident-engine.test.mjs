import test from "node:test";
import assert from "node:assert/strict";
import { decideIncident, runIncidentEngine, DEFAULT_RECOVERY_WINDOW_MS } from "../../scripts/observability/incident-engine.mjs";

const NOW = Date.parse("2026-07-08T12:00:00.000Z");

function group(overrides = {}) {
  return {
    fingerprint: "airtable|AIRTABLE_RATE_LIMIT.EXCEEDED",
    service: "airtable",
    error_code: "AIRTABLE_RATE_LIMIT.EXCEEDED",
    alert_level: "P1",
    first_seen: "2026-07-08T12:00:00.000Z",
    last_seen: "2026-07-08T12:00:00.000Z",
    count: 1,
    correlation_ids: [],
    ...overrides,
  };
}

test("primer grupo visto sin incidente previo abre un incidente nuevo en estado OPEN y notifica", () => {
  const incident = decideIncident({ group: group(), nowMs: NOW });
  assert.equal(incident.state, "OPEN");
  assert.equal(incident.severity, "P1");
  assert.equal(incident.notify, true);
  assert.equal(incident.resolved_at, null);
});

test("un incidente ya abierto que no ha envejecido lo suficiente se mantiene OPEN, sin notificar de nuevo", () => {
  const prevIncident = decideIncident({ group: group(), nowMs: NOW });
  const later = decideIncident({ group: group({ last_seen: "2026-07-08T12:05:00.000Z", count: 2 }), prevIncident, nowMs: Date.parse("2026-07-08T12:05:00.000Z") });
  assert.equal(later.state, "OPEN");
  assert.equal(later.notify, false);
  assert.equal(later.occurrence_count, 2);
});

test("un incidente P1 que envejece más de 1h sin resolver escala a ESCALATED/P0 y vuelve a notificar", () => {
  const opened = decideIncident({ group: group(), nowMs: NOW });
  const laterMs = NOW + 61 * 60 * 1000;
  const escalated = decideIncident({ group: group({ last_seen: new Date(laterMs).toISOString() }), prevIncident: opened, nowMs: laterMs });
  assert.equal(escalated.state, "ESCALATED");
  assert.equal(escalated.severity, "P0");
  assert.equal(escalated.notify, true);
});

test("sin grupo activo y dentro de la ventana de recuperación, el incidente previo se mantiene sin cambios", () => {
  const opened = decideIncident({ group: group(), nowMs: NOW });
  const stillOpen = decideIncident({ group: null, prevIncident: opened, nowMs: NOW + 5 * 60 * 1000, recoveryWindowMs: DEFAULT_RECOVERY_WINDOW_MS });
  assert.equal(stillOpen, opened);
});

test("sin grupo activo y superada la ventana de recuperación, el incidente se resuelve y notifica", () => {
  const opened = decideIncident({ group: group(), nowMs: NOW });
  const resolvedAtMs = NOW + DEFAULT_RECOVERY_WINDOW_MS + 1000;
  const resolved = decideIncident({ group: null, prevIncident: opened, nowMs: resolvedAtMs });
  assert.equal(resolved.state, "RESOLVED");
  assert.equal(resolved.notify, true);
  assert.ok(resolved.resolved_at);
});

test("sin grupo y sin incidente previo no produce nada (null)", () => {
  assert.equal(decideIncident({ group: null, prevIncident: null, nowMs: NOW }), null);
});

test("un incidente ya resuelto no se reabre solo porque vuelva a faltar el grupo", () => {
  const resolved = { fingerprint: "x", state: "RESOLVED", last_seen: "2026-07-08T10:00:00.000Z" };
  const result = decideIncident({ group: null, prevIncident: resolved, nowMs: NOW });
  assert.equal(result, resolved);
});

test("supresión activa impide notificar aunque el incidente sea nuevo, pero el incidente se registra igual", () => {
  const incident = decideIncident({ group: group(), suppression: { suppressed: true, reason: "MAINTENANCE_WINDOW" }, nowMs: NOW });
  assert.equal(incident.notify, false);
  assert.equal(incident.suppressed_reason, "MAINTENANCE_WINDOW");
  assert.equal(incident.state, "OPEN");
});

test("runIncidentEngine abre incidentes nuevos para grupos sin historial previo", () => {
  const incidents = runIncidentEngine([group()], [], { nowMs: NOW });
  assert.equal(incidents.length, 1);
  assert.equal(incidents[0].state, "OPEN");
});

test("runIncidentEngine resuelve incidentes cuyo fingerprint ya no aparece en los grupos, tras la ventana de recuperación", () => {
  const opened = decideIncident({ group: group(), nowMs: NOW });
  const laterMs = NOW + DEFAULT_RECOVERY_WINDOW_MS + 1000;
  const incidents = runIncidentEngine([], [opened], { nowMs: laterMs });
  assert.equal(incidents.length, 1);
  assert.equal(incidents[0].state, "RESOLVED");
});

test("runIncidentEngine aplica maintenanceWindows por fingerprint vía suppression.mjs, sin duplicar esa lógica", () => {
  const incidents = runIncidentEngine([group()], [], {
    maintenanceWindows: [{ service: "airtable", starts_at: "2026-07-08T11:00:00.000Z", ends_at: "2026-07-08T13:00:00.000Z" }],
    nowMs: NOW,
  });
  assert.equal(incidents[0].notify, false);
  assert.equal(incidents[0].suppressed_reason, "MAINTENANCE_WINDOW");
});

test("escalation_chain del incidente coincide con escalationChainFor(severity) — una sola fuente de verdad", () => {
  const incident = decideIncident({ group: group(), nowMs: NOW });
  assert.deepEqual(incident.escalation_chain, ["on-call-primario", "responsable-tecnico"]);
});
