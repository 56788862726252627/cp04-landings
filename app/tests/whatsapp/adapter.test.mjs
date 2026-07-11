import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  sendTemplateMessage,
  sendTextMessage,
  handleProviderResponse,
  classifyProviderError,
  computeRetryDecision,
  deduplicateOutboundMessage,
  WhatsappDuplicateSendStore,
} from "../../worker-reservas/messaging/whatsapp-adapter.mock.js";
import { ConsentStore, SuppressionList } from "../../worker-reservas/messaging/whatsapp-consent.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");
const FIXTURES = path.join(APP_ROOT, "fixtures/whatsapp");

function load(relPath) {
  const { _why, ...fixture } = JSON.parse(readFileSync(path.join(FIXTURES, relPath), "utf8"));
  return fixture;
}

function optedInConsentStore(phone, source = "booking_form") {
  const store = new ConsentStore();
  store.recordOptIn(phone, { source });
  return store;
}

// --- handleProviderResponse -------------------------------------------------

test("handleProviderResponse: respuesta de éxito real de Meta produce accepted + providerMessageId", () => {
  const result = handleProviderResponse({ messages: [{ id: "wamid.HBgLMzQ2MDAwMDAwMDE" }] });
  assert.equal(result.status, "accepted");
  assert.equal(result.providerMessageId, "wamid.HBgLMzQ2MDAwMDAwMDE");
});

test("handleProviderResponse: respuesta de error real de Meta produce failed + errorCode", () => {
  const fixture = load("provider/429-rate-limit.json");
  const result = handleProviderResponse(fixture);
  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, 130429);
});

test("handleProviderResponse: respuesta sin messages ni error -> malformed_provider_response, nunca lanza", () => {
  const result = handleProviderResponse({ unexpected: true });
  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, null);
  assert.equal(result.errorMessage, "malformed_provider_response");
});

// --- classifyProviderError --------------------------------------------------

test("classifyProviderError: 130429 (rate limit) es retryable", () => {
  const result = classifyProviderError(130429);
  assert.equal(result.retryable, true);
  assert.equal(result.category, "rate_limit");
});

test("classifyProviderError: 131047 (ventana cerrada) NO es retryable", () => {
  const result = classifyProviderError(131047);
  assert.equal(result.retryable, false);
  assert.equal(result.category, "session_expired");
});

test("classifyProviderError: 133010 (cuenta no registrada) NO es retryable — permanent error", () => {
  const fixture = load("provider/permanent-error-account-not-registered.json");
  const result = classifyProviderError(fixture.error.code);
  assert.equal(result.retryable, false);
  assert.equal(result.category, "account_error");
});

test("classifyProviderError: 131000 (fallo genérico, equivalente a 500) es retryable", () => {
  const fixture = load("provider/500-generic-provider-failure.json");
  const result = classifyProviderError(fixture.error.code);
  assert.equal(result.retryable, true);
});

test("classifyProviderError: código no catalogado se trata como permanente por precaución", () => {
  const result = classifyProviderError(999999);
  assert.equal(result.retryable, false);
  assert.equal(result.category, "unrecognized");
});

// --- computeRetryDecision ---------------------------------------------------

test("computeRetryDecision: error permanente nunca reintenta, sin importar el intento", () => {
  const result = computeRetryDecision({ attempt: 1, retryable: false });
  assert.equal(result.shouldRetry, false);
  assert.equal(result.reason, "permanent_error_no_retry");
});

test("computeRetryDecision: agota el presupuesto de reintentos", () => {
  const result = computeRetryDecision({ attempt: 5, retryable: true, maxAttempts: 5 });
  assert.equal(result.shouldRetry, false);
  assert.equal(result.reason, "retry_budget_exhausted");
});

test("computeRetryDecision: honra retryAfterMs del proveedor cuando viene informado", () => {
  const result = computeRetryDecision({ attempt: 1, retryable: true, retryAfterMs: 5000 });
  assert.equal(result.shouldRetry, true);
  assert.equal(result.delayMs, 5000);
  assert.equal(result.reason, "provider_retry_after_honored");
});

test("computeRetryDecision: backoff exponencial crece con el intento y respeta el techo (maxMs)", () => {
  const delays = [1, 2, 3, 4, 10].map(
    (attempt) => computeRetryDecision({ attempt, retryable: true, maxAttempts: 20, baseMs: 1000, maxMs: 30000, jitterMs: 250 }).delayMs,
  );
  assert.ok(delays[0] >= 1000 && delays[0] < 1250);
  assert.ok(delays[1] >= 2000 && delays[1] < 2250);
  assert.ok(delays[2] >= 4000 && delays[2] < 4250);
  assert.ok(delays[3] >= 8000 && delays[3] < 8250);
  assert.ok(delays[4] >= 30000 && delays[4] < 30250, "el intento 10 debe quedar topado en maxMs, no crecer sin límite");
});

test("computeRetryDecision: el jitter nunca hace que el delay baje del suelo exponencial", () => {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const { delayMs } = computeRetryDecision({ attempt, retryable: true, maxAttempts: 20, baseMs: 1000, maxMs: 30000, jitterMs: 250 });
    const floor = Math.min(30000, 1000 * 2 ** (attempt - 1));
    assert.ok(delayMs >= floor, `attempt ${attempt}: ${delayMs} por debajo del suelo ${floor}`);
  }
});

// --- deduplicateOutboundMessage ---------------------------------------------

test("deduplicateOutboundMessage: primera vez no es duplicado, segunda vez sí", () => {
  const store = new WhatsappDuplicateSendStore();
  assert.equal(deduplicateOutboundMessage("wa_x", store), false);
  assert.equal(deduplicateOutboundMessage("wa_x", store), true);
  assert.equal(store.sentCount, 1);
});

// --- sendTemplateMessage (orquestación end-to-end) --------------------------

test("sendTemplateMessage: caso feliz -> accepted con providerMessageId", async () => {
  const fixture = load("templates/01-booking-confirmed.json");
  const consentStore = optedInConsentStore(fixture.to);
  const dedupStore = new WhatsappDuplicateSendStore();

  const result = await sendTemplateMessage(
    { to: fixture.to, templateName: fixture.template_name, language: fixture.language, variables: fixture.variables, tenantId: fixture.tenant_id, idempotencyKey: fixture.idempotency_key },
    { consentStore, dedupStore },
  );

  assert.equal(result.status, "accepted");
  assert.ok(result.providerMessageId.startsWith("wamid."));
});

test("sendTemplateMessage: destinatario sin opt-in -> rejected/recipient_not_opted_in, nunca llega al 'proveedor'", async () => {
  const fixture = load("templates/01-booking-confirmed.json");
  const consentStore = new ConsentStore(); // sin opt-in
  const dedupStore = new WhatsappDuplicateSendStore();
  let providerCalled = false;

  const result = await sendTemplateMessage(
    { to: fixture.to, templateName: fixture.template_name, language: fixture.language, variables: fixture.variables, tenantId: fixture.tenant_id, idempotencyKey: fixture.idempotency_key },
    { consentStore, dedupStore, providerSend: () => { providerCalled = true; return {}; } },
  );

  assert.equal(result.status, "rejected");
  assert.equal(result.reason, "recipient_not_opted_in");
  assert.equal(providerCalled, false, "un destinatario rechazado nunca debe llegar a 'enviarse'");
});

test("sendTemplateMessage: blocked_recipient (suppression list) rechaza incluso con opt-in vigente", async () => {
  const blockedFixture = load("consent/blocked-recipient.json");
  const consentStore = optedInConsentStore(blockedFixture.phone);
  const suppressionList = new SuppressionList();
  suppressionList.add(blockedFixture.phone, { reason: blockedFixture.reason });
  const dedupStore = new WhatsappDuplicateSendStore();

  const result = await sendTemplateMessage(
    { to: blockedFixture.phone, templateName: "reminder_24h", language: "es", variables: { player_name: "X", court_name: "Y", date_time: "Z" }, tenantId: "tnt_qacp04_test", idempotencyKey: "wa_blocked_test" },
    { consentStore, suppressionList, dedupStore },
  );

  assert.equal(result.status, "rejected");
  assert.match(result.reason, /^blocked_recipient:/);
});

test("sendTemplateMessage: teléfono inválido rechaza antes de resolver plantilla", async () => {
  const consentStore = new ConsentStore();
  const dedupStore = new WhatsappDuplicateSendStore();

  const result = await sendTemplateMessage(
    { to: "600000099", templateName: "reminder_24h", language: "es", variables: {}, tenantId: "tnt_qacp04_test", idempotencyKey: "wa_invalid_phone_test" },
    { consentStore, dedupStore },
  );

  assert.equal(result.status, "rejected");
  assert.match(result.reason, /^invalid_phone:/);
});

test("sendTemplateMessage: plantilla no soportada rechaza con unsupported_template", async () => {
  const fixture = load("negative/unsupported-template.json");
  const consentStore = optedInConsentStore(fixture.to);
  const dedupStore = new WhatsappDuplicateSendStore();

  const result = await sendTemplateMessage(
    { to: fixture.to, templateName: fixture.template_name, language: fixture.language, variables: fixture.variables, tenantId: fixture.tenant_id, idempotencyKey: fixture.idempotency_key },
    { consentStore, dedupStore },
  );

  assert.equal(result.status, "rejected");
  assert.equal(result.reason, "unsupported_template");
});

test("sendTemplateMessage: locale incorrecto rechaza con wrong_locale", async () => {
  const fixture = load("negative/wrong-locale.json");
  const consentStore = optedInConsentStore(fixture.to);
  const dedupStore = new WhatsappDuplicateSendStore();

  const result = await sendTemplateMessage(
    { to: fixture.to, templateName: fixture.template_name, language: fixture.language, variables: fixture.variables, tenantId: fixture.tenant_id, idempotencyKey: fixture.idempotency_key },
    { consentStore, dedupStore },
  );

  assert.equal(result.status, "rejected");
  assert.equal(result.reason, "wrong_locale");
});

test("sendTemplateMessage: variable obligatoria ausente rechaza con invalid_template_payload y errors detallados", async () => {
  const fixture = load("negative/missing-variable.json");
  const consentStore = optedInConsentStore(fixture.to);
  const dedupStore = new WhatsappDuplicateSendStore();

  const result = await sendTemplateMessage(
    { to: fixture.to, templateName: fixture.template_name, language: fixture.language, variables: fixture.variables, tenantId: fixture.tenant_id, idempotencyKey: fixture.idempotency_key },
    { consentStore, dedupStore },
  );

  assert.equal(result.status, "rejected");
  assert.equal(result.reason, "invalid_template_payload");
  assert.deepEqual(result.errors, ["missing_variable:booking_reference"]);
});

test("sendTemplateMessage: sin tenantId rechaza con missing_tenant_id antes de tocar nada más", async () => {
  const consentStore = new ConsentStore();
  const dedupStore = new WhatsappDuplicateSendStore();
  const result = await sendTemplateMessage(
    { to: "+34600000001", templateName: "reminder_24h", variables: {}, idempotencyKey: "wa_no_tenant" },
    { consentStore, dedupStore },
  );
  assert.equal(result.status, "rejected");
  assert.equal(result.reason, "missing_tenant_id");
});

test("sendTemplateMessage: duplicate -> skipped_duplicate en el segundo envío con el mismo idempotency_key", async () => {
  const fixture = load("templates/01-booking-confirmed.json");
  const consentStore = optedInConsentStore(fixture.to);
  const dedupStore = new WhatsappDuplicateSendStore();
  const params = { to: fixture.to, templateName: fixture.template_name, language: fixture.language, variables: fixture.variables, tenantId: fixture.tenant_id, idempotencyKey: fixture.idempotency_key };

  const first = await sendTemplateMessage(params, { consentStore, dedupStore });
  assert.equal(first.status, "accepted");

  const second = await sendTemplateMessage(params, { consentStore, dedupStore });
  assert.equal(second.status, "skipped_duplicate");
  assert.equal(dedupStore.sentCount, 1);
});

test("sendTemplateMessage: 429 del proveedor -> failed, retryable:true, category:'rate_limit'", async () => {
  const fixture = load("templates/01-booking-confirmed.json");
  const consentStore = optedInConsentStore(fixture.to);
  const dedupStore = new WhatsappDuplicateSendStore();
  const providerFixture = load("provider/429-rate-limit.json");

  const result = await sendTemplateMessage(
    { to: fixture.to, templateName: fixture.template_name, language: fixture.language, variables: fixture.variables, tenantId: fixture.tenant_id, idempotencyKey: fixture.idempotency_key },
    { consentStore, dedupStore, providerSend: () => providerFixture },
  );

  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, 130429);
  assert.equal(result.retryable, true);
  assert.equal(result.category, "rate_limit");
  assert.equal(dedupStore.sentCount, 1, "un fallo del proveedor NO debe deshacer la marca de dedup — reintentar es responsabilidad de otro idempotency_key/orquestador, no de reenviar el mismo silenciosamente");
});

test("sendTemplateMessage: 500-equivalente (fallo genérico) del proveedor -> failed, retryable:true", async () => {
  const fixture = load("templates/02-booking-cancelled.json");
  const consentStore = optedInConsentStore(fixture.to);
  const dedupStore = new WhatsappDuplicateSendStore();
  const providerFixture = load("provider/500-generic-provider-failure.json");

  const result = await sendTemplateMessage(
    { to: fixture.to, templateName: fixture.template_name, language: fixture.language, variables: fixture.variables, tenantId: fixture.tenant_id, idempotencyKey: fixture.idempotency_key },
    { consentStore, dedupStore, providerSend: () => providerFixture },
  );

  assert.equal(result.status, "failed");
  assert.equal(result.retryable, true);
});

test("sendTemplateMessage: timeout/fallo de red (providerSend lanza) -> failed, retryable:true, category:'network_failure'", async () => {
  const fixture = load("templates/03-booking-rescheduled.json");
  const consentStore = optedInConsentStore(fixture.to);
  const dedupStore = new WhatsappDuplicateSendStore();
  const timeoutFixture = load("provider/timeout-network-failure.json");

  const result = await sendTemplateMessage(
    { to: fixture.to, templateName: fixture.template_name, language: fixture.language, variables: fixture.variables, tenantId: fixture.tenant_id, idempotencyKey: fixture.idempotency_key },
    { consentStore, dedupStore, providerSend: () => { throw new Error(timeoutFixture.simulated_error_message); } },
  );

  assert.equal(result.status, "failed");
  assert.equal(result.errorCode, timeoutFixture.expected_classification.errorCode);
  assert.equal(result.retryable, timeoutFixture.expected_classification.retryable);
  assert.equal(result.category, timeoutFixture.expected_classification.category);
});

test("sendTemplateMessage: error permanente (cuenta no registrada) -> failed, retryable:false", async () => {
  const fixture = load("templates/04-reminder-24h.json");
  const consentStore = optedInConsentStore(fixture.to);
  const dedupStore = new WhatsappDuplicateSendStore();
  const providerFixture = load("provider/permanent-error-account-not-registered.json");

  const result = await sendTemplateMessage(
    { to: fixture.to, templateName: fixture.template_name, language: fixture.language, variables: fixture.variables, tenantId: fixture.tenant_id, idempotencyKey: fixture.idempotency_key },
    { consentStore, dedupStore, providerSend: () => providerFixture },
  );

  assert.equal(result.status, "failed");
  assert.equal(result.retryable, false);
  assert.equal(result.category, "account_error");
});

// --- sendTextMessage ---------------------------------------------------------

test("sendTextMessage: caso feliz dentro de ventana de sesión -> accepted", async () => {
  const consentStore = optedInConsentStore("+34600000040");
  const dedupStore = new WhatsappDuplicateSendStore();

  const result = await sendTextMessage(
    { to: "+34600000040", text: "Gracias por tu mensaje, te confirmamos en breve.", tenantId: "tnt_qacp04_test", idempotencyKey: "wa_text_001", sessionWindowOpen: true },
    { consentStore, dedupStore },
  );

  assert.equal(result.status, "accepted");
});

test("sendTextMessage: ventana de sesión cerrada rechaza con session_window_closed, sin tocar el proveedor", async () => {
  const consentStore = optedInConsentStore("+34600000041");
  const dedupStore = new WhatsappDuplicateSendStore();
  let providerCalled = false;

  const result = await sendTextMessage(
    { to: "+34600000041", text: "Mensaje libre fuera de ventana", tenantId: "tnt_qacp04_test", idempotencyKey: "wa_text_002", sessionWindowOpen: false },
    { consentStore, dedupStore, providerSend: () => { providerCalled = true; return {}; } },
  );

  assert.equal(result.status, "rejected");
  assert.equal(result.reason, "session_window_closed");
  assert.equal(providerCalled, false);
});

test("sendTextMessage: texto vacío o excesivamente largo se rechaza", async () => {
  const consentStore = optedInConsentStore("+34600000042");
  const dedupStore = new WhatsappDuplicateSendStore();

  const empty = await sendTextMessage(
    { to: "+34600000042", text: "", tenantId: "tnt_qacp04_test", idempotencyKey: "wa_text_003", sessionWindowOpen: true },
    { consentStore, dedupStore },
  );
  assert.equal(empty.reason, "empty_text");

  const tooLong = await sendTextMessage(
    { to: "+34600000042", text: "x".repeat(5000), tenantId: "tnt_qacp04_test", idempotencyKey: "wa_text_004", sessionWindowOpen: true },
    { consentStore, dedupStore },
  );
  assert.equal(tooLong.reason, "text_too_long");
});

test("sendTextMessage: duplicate -> skipped_duplicate en el segundo envío", async () => {
  const consentStore = optedInConsentStore("+34600000043");
  const dedupStore = new WhatsappDuplicateSendStore();
  const params = { to: "+34600000043", text: "Hola", tenantId: "tnt_qacp04_test", idempotencyKey: "wa_text_005", sessionWindowOpen: true };

  const first = await sendTextMessage(params, { consentStore, dedupStore });
  assert.equal(first.status, "accepted");
  const second = await sendTextMessage(params, { consentStore, dedupStore });
  assert.equal(second.status, "skipped_duplicate");
});
