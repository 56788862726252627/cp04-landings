import test from "node:test";
import assert from "node:assert/strict";
import { preflight } from "../../scripts/make-qa/preflight-runner.mjs";

test("escenario PASS_VERIFIED sin dependencias bloqueantes (GMAIL solo) devuelve GO", () => {
  const result = preflight({ scenarioId: "6244975" }); // QR Acceso
  assert.equal(result.decision, "GO");
});

test("escenario CONFIG_ERROR devuelve NO_GO_STRUCTURAL sin evaluar dependencias", () => {
  const result = preflight({ scenarioId: "6233755" }); // Mapa de Flujos
  assert.equal(result.decision, "NO_GO_STRUCTURAL");
  assert.match(result.reasons[0].message, /CONFIG_ERROR/);
});

test("escenario NOT_SAFE devuelve NO_GO_STRUCTURAL", () => {
  const result = preflight({ scenarioId: "5791113" }); // Gestión Lista de Espera
  assert.equal(result.decision, "NO_GO_STRUCTURAL");
});

test("escenario dependiente de Airtable con cuota 'unknown' devuelve GO_PENDING_LIVE_PREFLIGHT_CHECK, nunca BLOCKED por defecto (objetivo 2)", () => {
  const result = preflight({ scenarioId: "5291559" }); // Control Acceso QR
  assert.equal(result.decision, "GO_PENDING_LIVE_PREFLIGHT_CHECK");
  assert.ok(result.reasons.some((r) => r.source === "AIRTABLE_MONTHLY_QUOTA"));
});

test("escenario afectado por el rate-limit por minuto (P0-2) devuelve NO_GO_BLOCKED_DEPENDENCY", () => {
  const result = preflight({ scenarioId: "5736463" }); // Recordatorio 2h Antes
  assert.equal(result.decision, "NO_GO_BLOCKED_DEPENDENCY");
  assert.ok(result.reasons.some((r) => r.source === "AIRTABLE_RATE_LIMIT_PER_MINUTE"));
});

test("payload válido para un test_id conocido no añade motivos de bloqueo por forma", () => {
  const payload = { clave_reserva: "QA_CP04_QR_NOMATCH_20260708A3" };
  const result = preflight({ testId: "QA-A3-001", payload });
  assert.notEqual(result.decision, "NO_GO_INVALID_PAYLOAD");
});

test("payload inválido para un test_id conocido devuelve NO_GO_INVALID_PAYLOAD", () => {
  const payload = { clave_reserva: "SIN_PREFIJO" };
  const result = preflight({ testId: "QA-A3-001", payload });
  assert.equal(result.decision, "NO_GO_INVALID_PAYLOAD");
});

test("escenario inexistente no lanza excepción, devuelve NO_GO_STRUCTURAL", () => {
  const result = preflight({ scenarioId: "0000000" });
  assert.equal(result.decision, "NO_GO_STRUCTURAL");
});

test("escenario Stripe con dependencia Airtable+Stripe ambas 'unknown' reporta ambas en requires_live_check", () => {
  const result = preflight({ scenarioId: "6323441" }); // Pago Confirmado Stripe
  assert.equal(result.decision, "GO_PENDING_LIVE_PREFLIGHT_CHECK");
  const sources = result.reasons.map((r) => r.source);
  assert.ok(sources.includes("AIRTABLE_MONTHLY_QUOTA"));
  assert.ok(sources.includes("STRIPE_SANDBOX_EVENT"));
});

test("escenario destructivo con WhatsApp bloqueado devuelve NO_GO_BLOCKED_DEPENDENCY (Dunning Stripe)", () => {
  const result = preflight({ scenarioId: "6335117" }); // Dunning
  assert.equal(result.decision, "NO_GO_BLOCKED_DEPENDENCY");
  assert.ok(result.reasons.some((r) => r.source === "WHATSAPP_REAL_SEND"));
});
