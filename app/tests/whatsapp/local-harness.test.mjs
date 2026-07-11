import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runHarnessCase, runHarnessOverFixtures, sanitizeHarnessOutput, HARNESS_STEPS } from "../../scripts/whatsapp/local-harness.mjs";
import { ConsentStore, SuppressionList } from "../../worker-reservas/messaging/whatsapp-consent.js";
import { repoPath } from "../../src/config/paths.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");

function loadFixture(relPath) {
  const { _why, ...fixture } = JSON.parse(readFileSync(path.join(APP_ROOT, relPath), "utf8"));
  return fixture;
}

const requestSchema = JSON.parse(readFileSync(repoPath("schemas", "whatsapp", "template-message-request.schema.json"), "utf8"));

// --- sanitized output ---------------------------------------------------------

test("sanitizeHarnessOutput: enmascara el teléfono, nunca expone el número completo", () => {
  const result = sanitizeHarnessOutput({ to: "+34600000001", template_name: "booking_confirmed", tenant_id: "tnt_x", idempotency_key: "wa_1" });
  assert.equal(result.to_masked, "+3460000****");
  assert.ok(!result.to_masked.includes("0001"));
});

test("sanitizeHarnessOutput: fixture sin 'to' no lanza", () => {
  const result = sanitizeHarnessOutput({});
  assert.equal(result.to_masked, "****");
});

// --- pipeline feliz: los 7 pasos en PASS --------------------------------------

test("runHarnessCase: fixture feliz con opt-in automático -> overall PASS, 7 pasos, ninguno FAIL", async () => {
  const fixture = loadFixture("fixtures/whatsapp/templates/01-booking-confirmed.json");
  const result = await runHarnessCase(fixture, { requestSchema, autoOptInSource: "booking_form" });

  assert.equal(result.overall, "PASS");
  assert.equal(result.steps.length, HARNESS_STEPS.length);
  assert.deepEqual(result.steps.map((s) => s.step), HARNESS_STEPS);
  assert.ok(result.steps.every((s) => s.status === "PASS" || s.status === "SKIPPED"));
});

test("runHarnessCase: retry_classification queda SKIPPED si no se simula providerSend", async () => {
  const fixture = loadFixture("fixtures/whatsapp/templates/01-booking-confirmed.json");
  const result = await runHarnessCase(fixture, { requestSchema, autoOptInSource: "booking_form" });
  const retryStep = result.steps.find((s) => s.step === "retry_classification");
  assert.equal(retryStep.status, "SKIPPED");
});

test("runHarnessCase: tenant_routing queda SKIPPED sin resolvedConfig (fixture usa tenant sintético propio)", async () => {
  const fixture = loadFixture("fixtures/whatsapp/templates/01-booking-confirmed.json");
  const result = await runHarnessCase(fixture, { requestSchema, autoOptInSource: "booking_form" });
  const tenantStep = result.steps.find((s) => s.step === "tenant_routing");
  assert.equal(tenantStep.status, "SKIPPED");
});

// --- short-circuit por cada paso ------------------------------------------------

test("runHarnessCase: teléfono inválido -> FAIL en 'validation', el pipeline no continúa (sin más pasos que validation)", async () => {
  const fixture = { to: "600000099", template_name: "reminder_24h", language: "es", tenant_id: "tnt_x", variables: {}, idempotency_key: "wa_x" };
  const result = await runHarnessCase(fixture, {});
  assert.equal(result.overall, "FAIL");
  assert.deepEqual(result.steps.map((s) => s.step), ["validation"]);
});

test("runHarnessCase: sin opt-in -> FAIL en 'consent_check', se detiene ahí (no llega a template_resolution)", async () => {
  // Sin requestSchema a propósito: unsupported-template.json viola el enum cerrado del schema
  // (por diseño, ver su _why) — aquí se aísla el paso consent_check, no el de validación de forma.
  const fixture = loadFixture("fixtures/whatsapp/negative/unsupported-template.json");
  const result = await runHarnessCase(fixture, {}); // sin autoOptInSource
  assert.equal(result.overall, "FAIL");
  assert.deepEqual(result.steps.map((s) => s.step), ["validation", "tenant_routing", "consent_check"]);
});

test("runHarnessCase: plantilla no soportada -> FAIL en 'template_resolution'", async () => {
  const fixture = loadFixture("fixtures/whatsapp/negative/unsupported-template.json");
  const result = await runHarnessCase(fixture, { autoOptInSource: "booking_form" });
  assert.equal(result.overall, "FAIL");
  assert.deepEqual(result.steps.map((s) => s.step), ["validation", "tenant_routing", "consent_check", "template_resolution"]);
});

test("runHarnessCase: locale incorrecto -> FAIL en 'template_resolution' con reason wrong_locale", async () => {
  const fixture = loadFixture("fixtures/whatsapp/negative/wrong-locale.json");
  const result = await runHarnessCase(fixture, { autoOptInSource: "booking_form" });
  const step = result.steps.find((s) => s.step === "template_resolution");
  assert.equal(step.status, "FAIL");
  assert.equal(step.reason, "wrong_locale");
});

test("runHarnessCase: variable obligatoria ausente -> FAIL en 'rendering'", async () => {
  const fixture = loadFixture("fixtures/whatsapp/negative/missing-variable.json");
  const result = await runHarnessCase(fixture, { autoOptInSource: "booking_form" });
  assert.equal(result.overall, "FAIL");
  const step = result.steps.find((s) => s.step === "rendering");
  assert.equal(step.status, "FAIL");
  assert.deepEqual(step.errors, ["missing_variable:booking_reference"]);
});

test("runHarnessCase: destinatario bloqueado por suppression list -> FAIL en 'consent_check', nunca llega a dedup", async () => {
  const blockedFixture = loadFixture("fixtures/whatsapp/consent/blocked-recipient.json");
  const suppressionList = new SuppressionList();
  suppressionList.add(blockedFixture.phone, { reason: blockedFixture.reason });
  const fixture = { to: blockedFixture.phone, template_name: "reminder_24h", language: "es", tenant_id: "tnt_x", variables: { player_name: "X", court_name: "Y", date_time: "Z" }, idempotency_key: "wa_blocked" };

  const result = await runHarnessCase(fixture, { requestSchema, autoOptInSource: "booking_form", suppressionList });
  assert.equal(result.overall, "FAIL");
  const step = result.steps.find((s) => s.step === "consent_check");
  assert.match(step.reason, /^blocked_recipient:/);
});

// --- dedup ------------------------------------------------------------------

test("runHarnessCase: segunda ejecución con el mismo idempotency_key/dedupStore -> overall WARN, dedup SKIPPED_DUPLICATE", async () => {
  const fixture = loadFixture("fixtures/whatsapp/templates/02-booking-cancelled.json");
  const consentStore = new ConsentStore();
  const { WhatsappDuplicateSendStore } = await import("../../worker-reservas/messaging/whatsapp-adapter.mock.js");
  const dedupStore = new WhatsappDuplicateSendStore();

  const first = await runHarnessCase(fixture, { requestSchema, autoOptInSource: "booking_form", consentStore, dedupStore });
  assert.equal(first.overall, "PASS");

  const second = await runHarnessCase(fixture, { requestSchema, consentStore, dedupStore });
  assert.equal(second.overall, "WARN");
  const dedupStep = second.steps.find((s) => s.step === "dedup");
  assert.equal(dedupStep.status, "SKIPPED_DUPLICATE");
});

// --- retry classification simulada ----------------------------------------

test("runHarnessCase: providerSend simula 429 -> retry_classification FAIL pero overall WARN (retryable)", async () => {
  const fixture = loadFixture("fixtures/whatsapp/templates/03-booking-rescheduled.json");
  const providerFixture = loadFixture("fixtures/whatsapp/provider/429-rate-limit.json");
  const result = await runHarnessCase(fixture, { requestSchema, autoOptInSource: "booking_form", providerSend: () => providerFixture });

  assert.equal(result.overall, "WARN");
  const retryStep = result.steps.find((s) => s.step === "retry_classification");
  assert.equal(retryStep.status, "FAIL");
  assert.equal(retryStep.retryable, true);
  assert.equal(retryStep.retryDecision.shouldRetry, true);
});

test("runHarnessCase: providerSend simula error permanente -> overall FAIL", async () => {
  const fixture = loadFixture("fixtures/whatsapp/templates/04-reminder-24h.json");
  const providerFixture = loadFixture("fixtures/whatsapp/provider/permanent-error-account-not-registered.json");
  const result = await runHarnessCase(fixture, { requestSchema, autoOptInSource: "booking_form", providerSend: () => providerFixture });

  assert.equal(result.overall, "FAIL");
  const retryStep = result.steps.find((s) => s.step === "retry_classification");
  assert.equal(retryStep.retryable, false);
});

// --- validación de forma (schema) -------------------------------------------

test("runHarnessCase: payload con campo desconocido (additionalProperties:false) -> FAIL en 'validation' antes de tocar nada más", async () => {
  const fixture = { ...loadFixture("fixtures/whatsapp/templates/01-booking-confirmed.json"), unexpected_field: "x" };
  const result = await runHarnessCase(fixture, { requestSchema });
  assert.equal(result.overall, "FAIL");
  assert.deepEqual(result.steps.map((s) => s.step), ["validation"]);
});

// --- runHarnessOverFixtures --------------------------------------------------

test("runHarnessOverFixtures: las 10 plantillas felices con auto opt-in -> overall PASS, 10 casos", async () => {
  const report = await runHarnessOverFixtures(path.join(APP_ROOT, "fixtures/whatsapp/templates"), { requestSchema, autoOptInSource: "booking_form" });
  assert.equal(report.overall, "PASS");
  assert.equal(report.cases.length, 10);
  assert.ok(report.cases.every((c) => c.overall === "PASS"));
});

test("runHarnessOverFixtures: fixtures negativos sin opt-in -> overall FAIL, cada caso reporta su propio paso de fallo", async () => {
  const report = await runHarnessOverFixtures(path.join(APP_ROOT, "fixtures/whatsapp/negative"), { requestSchema });
  assert.equal(report.overall, "FAIL");
  assert.ok(report.cases.length >= 3, "al menos missing-variable/unsupported-template/wrong-locale/malformed-payload-schema-violation");
  assert.ok(report.cases.every((c) => c.overall === "FAIL"));
});

test("runHarnessOverFixtures: cada caso trae salida sanitizada (nunca el teléfono completo)", async () => {
  const report = await runHarnessOverFixtures(path.join(APP_ROOT, "fixtures/whatsapp/templates"), { requestSchema, autoOptInSource: "booking_form" });
  for (const c of report.cases) {
    assert.ok(c.sanitized.to_masked.endsWith("****"));
  }
});
