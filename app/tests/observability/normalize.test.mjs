import test from "node:test";
import assert from "node:assert/strict";
import { normalize, SUPPORTED_RAW_TYPES } from "../../scripts/observability/normalize.mjs";

test("soporta los 6 tipos de origen que cubren las 8 categorías pedidas (worker request+error, make, airtable, auth, external provider)", () => {
  assert.deepEqual(
    [...SUPPORTED_RAW_TYPES].sort(),
    ["airtable_response", "auth_event", "external_provider_call", "make_execution", "worker_http_error", "worker_http_request"].sort()
  );
});

test("normaliza un worker_http_request 200 a la forma canónica con status=success", () => {
  const result = normalize({
    type: "worker_http_request",
    route: "/api/reservas",
    method: "POST",
    http_status: 200,
    duration_ms: 120,
    request_id: "req_test-0001",
    correlation_id: "corr_test-0001",
    occurred_at: "2026-07-08T13:00:00.000Z",
  });
  assert.equal(result.ok, true);
  assert.equal(result.event.service, "worker");
  assert.equal(result.event.status, "success");
  assert.equal(result.event.request_id, "req_test-0001");
  assert.equal(result.event.correlation_id, "corr_test-0001");
  assert.equal(result.event.duration_ms, 120);
});

test("nunca inventa request_id/correlation_id — si el crudo no los trae, quedan null", () => {
  const result = normalize({ type: "worker_http_error", route: "/x", method: "GET", http_status: 500, occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(result.event.request_id, null);
  assert.equal(result.event.correlation_id, null);
});

test("un tipo de evento crudo desconocido no lanza excepción — devuelve ok:false con motivo explícito", () => {
  const result = normalize({ type: "esto_no_existe", occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "UNKNOWN_RAW_EVENT_TYPE");
});

test("un evento crudo sin 'type' tampoco lanza excepción", () => {
  const result = normalize({ foo: "bar" });
  assert.equal(result.ok, false);
});

test("nunca usa un email como identificador — un user_identifier con forma de email se hashea igual que un UUID, nunca se guarda en claro", () => {
  const result = normalize({
    type: "worker_http_request",
    route: "/x",
    method: "GET",
    http_status: 200,
    user_identifier: "alguien@example.com",
    occurred_at: "2026-07-08T13:00:00.000Z",
  });
  assert.notEqual(result.event.user_id_hash, "alguien@example.com");
  assert.match(result.event.user_id_hash, /^[a-f0-9]{16}$/);
});

test("client_id por defecto es el único cliente real hoy ('club-padel-04'), nunca un tenant inventado distinto", () => {
  const result = normalize({ type: "worker_http_request", route: "/x", method: "GET", http_status: 200, occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(result.event.client_id, "club-padel-04");
});

test("tenant_id nunca se rellena aquí — sigue reservado (decisión de arquitectura pendiente)", () => {
  const result = normalize({ type: "worker_http_request", route: "/x", method: "GET", http_status: 200, occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(result.event.tenant_id, null);
});

test("make_execution failed produce status=failure y preserva scenario_id/execution_id", () => {
  const result = normalize({
    type: "make_execution",
    scenario_id: "6199248",
    status: "failed",
    execution_id: "exec_test-0001",
    occurred_at: "2026-07-08T13:00:00.000Z",
  });
  assert.equal(result.event.status, "failure");
  assert.equal(result.event.scenario_id, "6199248");
  assert.equal(result.event.execution_id, "exec_test-0001");
});

test("airtable_response con quota_exhausted queda marcado en metadata para que CLASSIFY lo use", () => {
  const result = normalize({ type: "airtable_response", table: "reservas", http_status: 402, quota_exhausted: true, occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(result.event.metadata.quota_exhausted, true);
});

test("external_provider_call con outcome=timeout produce status=unknown (nunca success/failure inventado)", () => {
  const result = normalize({ type: "external_provider_call", provider: "google_calendar", outcome: "timeout", occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(result.event.status, "unknown");
});
