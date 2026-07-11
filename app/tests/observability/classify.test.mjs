import test from "node:test";
import assert from "node:assert/strict";
import { classify } from "../../scripts/observability/classify.mjs";
import { normalize } from "../../scripts/observability/normalize.mjs";

function classifyRaw(raw) {
  const { event } = normalize(raw);
  return classify(event);
}

test("clasificación 401 -> AUTH.MISSING_TOKEN", () => {
  const c = classifyRaw({ type: "worker_http_error", route: "/x", method: "GET", http_status: 401, reason: "missing_token", occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(c.error_code, "AUTH.MISSING_TOKEN");
  assert.equal(c.status, "failure");
});

test("clasificación 403 -> AUTHZ.ROLE_FORBIDDEN", () => {
  const c = classifyRaw({ type: "worker_http_error", route: "/x", method: "GET", http_status: 403, reason: "role_forbidden", occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(c.error_code, "AUTHZ.ROLE_FORBIDDEN");
});

test("clasificación 429 -> WORKER_4XX.RATE_LIMITED (rate-limit del propio Worker)", () => {
  const c = classifyRaw({ type: "worker_http_error", route: "/x", method: "POST", http_status: 429, reason: "rate_limited", occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(c.error_code, "WORKER_4XX.RATE_LIMITED");
});

test("clasificación de cuota mensual de Airtable -> AIRTABLE_MONTHLY_QUOTA.EXHAUSTED (no confundir con rate-limit)", () => {
  const c = classifyRaw({ type: "airtable_response", table: "reservas", http_status: 402, quota_exhausted: true, occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(c.error_code, "AIRTABLE_MONTHLY_QUOTA.EXHAUSTED");
});

test("clasificación 429 de Airtable -> AIRTABLE_RATE_LIMIT.EXCEEDED", () => {
  const c = classifyRaw({ type: "airtable_response", table: "reservas", http_status: 429, occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(c.error_code, "AIRTABLE_RATE_LIMIT.EXCEEDED");
});

test("clasificación 500 -> WORKER_5XX.INTERNAL_ERROR con level='critical' (severidad de la taxonomía, no hardcodeada aquí)", () => {
  const c = classifyRaw({ type: "worker_http_error", route: "/x", method: "POST", http_status: 500, reason: "internal_error", occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(c.error_code, "WORKER_5XX.INTERNAL_ERROR");
  assert.equal(c.level, "critical");
});

test("clasificación de timeout -> TIMEOUT.UPSTREAM_TIMEOUT con status=unknown (nunca failure inventado)", () => {
  const c = classifyRaw({ type: "external_provider_call", provider: "google_calendar", outcome: "timeout", occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(c.error_code, "TIMEOUT.UPSTREAM_TIMEOUT");
  assert.equal(c.status, "unknown");
});

test("clasificación de Make ejecución fallida -> MAKE_EXECUTION.SCENARIO_FAILED", () => {
  const c = classifyRaw({ type: "make_execution", scenario_id: "6199248", status: "failed", occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(c.error_code, "MAKE_EXECUTION.SCENARIO_FAILED");
});

test("clasificación de un evento sin categoría reconocible -> UNKNOWN.UNCLASSIFIED, nunca se descarta en silencio", () => {
  const c = classify({ event_type: "algo_raro", service: "worker", status: null, metadata: { http_status: 999 } });
  assert.equal(c.error_code, "UNKNOWN.UNCLASSIFIED");
});

test("un evento exitoso (2xx) siempre lleva error_code=null y level='info'", () => {
  const c = classifyRaw({ type: "worker_http_request", route: "/x", method: "GET", http_status: 200, occurred_at: "2026-07-08T13:00:00.000Z" });
  assert.equal(c.error_code, null);
  assert.equal(c.level, "info");
});

test("no se inventa ninguna categoría nueva — todo error_code producido existe en error-taxonomy.json", async () => {
  const { readFileSync } = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const taxonomy = JSON.parse(readFileSync(path.join(__dirname, "../../schemas/observability/error-taxonomy.json"), "utf8"));

  const cases = [
    { type: "worker_http_error", route: "/x", method: "GET", http_status: 401, occurred_at: "2026-07-08T13:00:00.000Z" },
    { type: "worker_http_error", route: "/x", method: "GET", http_status: 403, occurred_at: "2026-07-08T13:00:00.000Z" },
    { type: "worker_http_error", route: "/x", method: "GET", http_status: 429, occurred_at: "2026-07-08T13:00:00.000Z" },
    { type: "worker_http_error", route: "/x", method: "GET", http_status: 500, occurred_at: "2026-07-08T13:00:00.000Z" },
    { type: "airtable_response", table: "t", http_status: 402, quota_exhausted: true, occurred_at: "2026-07-08T13:00:00.000Z" },
    { type: "make_execution", scenario_id: "1", status: "failed", occurred_at: "2026-07-08T13:00:00.000Z" },
    { type: "external_provider_call", provider: "google_calendar", outcome: "timeout", occurred_at: "2026-07-08T13:00:00.000Z" },
  ];

  for (const raw of cases) {
    const c = classifyRaw(raw);
    if (!c.error_code) continue;
    const [category] = c.error_code.split(".");
    assert.ok(taxonomy.categories[category], `categoría ${category} no existe en la taxonomía`);
    assert.ok(taxonomy.categories[category].codes.some((code) => code.code === c.error_code), `${c.error_code} no existe en la taxonomía`);
  }
});
