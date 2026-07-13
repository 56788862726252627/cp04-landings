import test from "node:test";
import assert from "node:assert/strict";
import { classify, classifyAll, READINESS_ENUM } from "../../scripts/make-qa/dependency-readiness-classifier.mjs";
import { findByScenarioId } from "../../scripts/make-qa/manifest-loader.mjs";
import { validateAgainstSchema } from "../../scripts/make-qa/schema-validator.mjs";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA = JSON.parse(readFileSync(path.resolve(__dirname, "../../schemas/make-qa/dependency-readiness.schema.json"), "utf8"));

test("READINESS_ENUM tiene exactamente los 10 valores pedidos en esta fase", () => {
  assert.deepEqual(
    [...READINESS_ENUM].sort(),
    ["AIRTABLE_BLOCKED", "AIRTABLE_OBSERVING", "CONFIG_ERROR", "LOCAL_READY", "MAKE_LIVE_EXECUTION_REQUIRED", "NOT_SAFE", "READY_FOR_LIVE_QA", "READY_FOR_PREFLIGHT", "STRIPE_TEST_REQUIRED", "WHATSAPP_SETUP_REQUIRED"].sort()
  );
});

test("clasificación total suma 50 y todas las claves están dentro del enum", () => {
  const result = classifyAll();
  const total = Object.values(result.by_status).reduce((a, b) => a + b, 0);
  assert.equal(total, 50);
  for (const key of Object.keys(result.by_status)) assert.ok(READINESS_ENUM.includes(key));
});

test("QR Acceso (sin dependencia externa bloqueante, solo Gmail) -> LOCAL_READY", () => {
  const result = classify(findByScenarioId("6244975"));
  assert.equal(result.status, "LOCAL_READY");
});

test("Mapa de Flujos (CONFIG_ERROR) -> CONFIG_ERROR", () => {
  const result = classify(findByScenarioId("6233755"));
  assert.equal(result.status, "CONFIG_ERROR");
});

test("Gestión Lista de Espera (NOT_SAFE) -> NOT_SAFE", () => {
  const result = classify(findByScenarioId("5791113"));
  assert.equal(result.status, "NOT_SAFE");
});

test("Control Acceso QR (Airtable dependiente, cuota 'unknown') -> READY_FOR_PREFLIGHT", () => {
  const result = classify(findByScenarioId("5291559"));
  assert.equal(result.status, "READY_FOR_PREFLIGHT");
});

test("Pago Confirmado Stripe -> STRIPE_TEST_REQUIRED como bloqueo primario", () => {
  const result = classify(findByScenarioId("6323441"));
  assert.equal(result.status, "STRIPE_TEST_REQUIRED");
});

test("Dunning Stripe depende de Stripe Y WhatsApp -> primario STRIPE_TEST_REQUIRED, WHATSAPP_SETUP_REQUIRED en additional_blockers", () => {
  const result = classify(findByScenarioId("6335117"));
  assert.equal(result.status, "STRIPE_TEST_REQUIRED");
  assert.ok(result.additional_blockers.includes("WHATSAPP_SETUP_REQUIRED"));
});

test("Recordatorio 2h Antes (P0-2, rate-limit activo) -> AIRTABLE_OBSERVING como primario", () => {
  const result = classify(findByScenarioId("5736463"));
  assert.equal(result.status, "AIRTABLE_OBSERVING");
});

test("Cierre Temporal de Pistas (WhatsApp destructivo, Run once pendiente) -> WHATSAPP_SETUP_REQUIRED", () => {
  const result = classify(findByScenarioId("5791133"));
  assert.equal(result.status, "WHATSAPP_SETUP_REQUIRED");
});

test("Dashboard Ejecutivo Diario (inactivo, sin bloqueo Stripe/WhatsApp/estructural) -> MAKE_LIVE_EXECUTION_REQUIRED", () => {
  const result = classify(findByScenarioId("5736800"));
  assert.equal(result.status, "MAKE_LIVE_EXECUTION_REQUIRED");
});

test("cada entrada de classifyAll() cumple dependency-readiness.schema.json", () => {
  const result = classifyAll();
  for (const s of result.scenarios) {
    const check = validateAgainstSchema(SCHEMA, s);
    assert.equal(check.valid, true, `${s.scenario_name}: ${JSON.stringify(check.errors)}`);
  }
});

test("ningún escenario queda con status fuera del enum ni con additional_blockers repitiendo el status primario", () => {
  const result = classifyAll();
  for (const s of result.scenarios) {
    assert.ok(READINESS_ENUM.includes(s.status));
    assert.ok(!s.additional_blockers.includes(s.status));
  }
});
