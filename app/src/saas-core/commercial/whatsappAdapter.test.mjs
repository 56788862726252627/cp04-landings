import { test } from "node:test";
import assert from "node:assert/strict";

import { isWhatsAppConfigured, getWhatsAppRuntimeStatus, hasRecordedConsent, recordConsent, sendTemplateMessage, sendTextMessage, verifyWhatsAppWebhookSignature, parseWhatsAppWebhookEvent } from "./whatsappAdapter.js";
import { sampleWhatsAppTemplateParams, sampleWhatsAppTextParams, buildSignedWhatsAppWebhookFixture, createInMemoryConsentStore, FIXTURE_WHATSAPP_APP_SECRET } from "./commercialFixtures.js";

function throwingFetch() {
  throw new Error("fetchImpl NUNCA debería invocarse en este escenario");
}
const CONFIGURED_ENV = { WHATSAPP_ACCESS_TOKEN: "token_test_x", WHATSAPP_PHONE_NUMBER_ID: "1234567890" };

test("isWhatsAppConfigured/getWhatsAppRuntimeStatus: sin credenciales, unconfigured y nunca expone el token", () => {
  assert.equal(isWhatsAppConfigured({}), false);
  const status = getWhatsAppRuntimeStatus({});
  assert.equal(status.configured, false);
  assert.equal(status.accessTokenRedacted, null);
});

test("getWhatsAppRuntimeStatus configurado: nunca expone el token completo", () => {
  const status = getWhatsAppRuntimeStatus(CONFIGURED_ENV);
  assert.equal(status.configured, true);
  assert.ok(!status.accessTokenRedacted.includes(CONFIGURED_ENV.WHATSAPP_ACCESS_TOKEN));
});

test("hasRecordedConsent/recordConsent: sin registrar, false; tras recordConsent(granted:true), true", () => {
  const store = createInMemoryConsentStore();
  assert.equal(hasRecordedConsent(store, "+34600000001"), false);
  recordConsent(store, "+34600000001", { granted: true, source: "formulario-web", recordedAtIso: "2026-01-01T00:00:00Z" });
  assert.equal(hasRecordedConsent(store, "+34600000001"), true);
});

test("recordConsent(granted:false) dejar registrado un rechazo explícito (hasRecordedConsent sigue false)", () => {
  const store = createInMemoryConsentStore();
  recordConsent(store, "+34600000001", { granted: false, source: "opt-out" });
  assert.equal(hasRecordedConsent(store, "+34600000001"), false);
});

test("recordConsent exige granted:boolean explícito, nunca lo infiere", () => {
  const store = createInMemoryConsentStore();
  assert.throws(() => recordConsent(store, "+34600000001", { source: "x" }));
});

test("sendTemplateMessage sin consentimiento registrado: consent_not_recorded, fetchImpl NUNCA se invoca (aunque esté configurado)", async () => {
  const store = createInMemoryConsentStore();
  const result = await sendTemplateMessage(sampleWhatsAppTemplateParams(), { env: CONFIGURED_ENV, consentStore: store, fetchImpl: throwingFetch });
  assert.equal(result.status, "consent_not_recorded");
});

test("sendTemplateMessage con consentimiento pero sin configurar: not_configured, fetchImpl NUNCA se invoca", async () => {
  const store = createInMemoryConsentStore({ "+34600000001": { granted: true } });
  const result = await sendTemplateMessage(sampleWhatsAppTemplateParams(), { env: {}, consentStore: store, fetchImpl: throwingFetch });
  assert.equal(result.status, "not_configured");
});

test("sendTemplateMessage con params inválidos: invalid_params antes de comprobar consentimiento/config", async () => {
  const result = await sendTemplateMessage({}, { env: {}, consentStore: createInMemoryConsentStore(), fetchImpl: throwingFetch });
  assert.equal(result.status, "invalid_params");
  assert.ok(result.errors.length > 0);
});

test("sendTemplateMessage con consentimiento + configurado: construye la petición real correctamente", async () => {
  const store = createInMemoryConsentStore({ "+34600000001": { granted: true } });
  let capturedUrl;
  let capturedBody;
  const fakeFetch = async (url, init) => {
    capturedUrl = url;
    capturedBody = JSON.parse(init.body);
    return { ok: true, status: 200, json: async () => ({ messages: [{ id: "wamid.fixture" }] }) };
  };
  const result = await sendTemplateMessage(sampleWhatsAppTemplateParams(), { env: CONFIGURED_ENV, consentStore: store, fetchImpl: fakeFetch });
  assert.equal(result.status, "sent");
  assert.equal(result.messageId, "wamid.fixture");
  assert.equal(capturedUrl, "https://graph.facebook.com/v20.0/1234567890/messages");
  assert.equal(capturedBody.type, "template");
  assert.equal(capturedBody.to, "+34600000001");
});

test("sendTextMessage exige consentimiento igual que sendTemplateMessage", async () => {
  const store = createInMemoryConsentStore();
  const result = await sendTextMessage(sampleWhatsAppTextParams(), { env: CONFIGURED_ENV, consentStore: store, fetchImpl: throwingFetch });
  assert.equal(result.status, "consent_not_recorded");
});

test("sendTextMessage con consentimiento + configurado: envía correctamente", async () => {
  const store = createInMemoryConsentStore({ "+34600000001": { granted: true } });
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ messages: [{ id: "wamid.fixture2" }] }) });
  const result = await sendTextMessage(sampleWhatsAppTextParams(), { env: CONFIGURED_ENV, consentStore: store, fetchImpl: fakeFetch });
  assert.equal(result.status, "sent");
});

test("sendTemplateMessage/sendTextMessage propagan un error de Meta sin inventar un éxito", async () => {
  const store = createInMemoryConsentStore({ "+34600000001": { granted: true } });
  const fakeFetch = async () => ({ ok: false, status: 400, json: async () => ({ error: { message: "plantilla no aprobada" } }) });
  const result = await sendTemplateMessage(sampleWhatsAppTemplateParams(), { env: CONFIGURED_ENV, consentStore: store, fetchImpl: fakeFetch });
  assert.equal(result.status, "whatsapp_error");
  assert.equal(result.httpStatus, 400);
});

test("verifyWhatsAppWebhookSignature: firma real válida contra el fixture", () => {
  const fixture = buildSignedWhatsAppWebhookFixture();
  assert.equal(verifyWhatsAppWebhookSignature(fixture.rawPayload, fixture.signatureHeader, fixture.secret).valid, true);
});

test("verifyWhatsAppWebhookSignature: rechaza secreto incorrecto, payload alterado y cabecera mal formada", () => {
  const fixture = buildSignedWhatsAppWebhookFixture();
  assert.equal(verifyWhatsAppWebhookSignature(fixture.rawPayload, fixture.signatureHeader, "otro-secreto").valid, false);
  assert.equal(verifyWhatsAppWebhookSignature(fixture.rawPayload + "x", fixture.signatureHeader, fixture.secret).valid, false);
  assert.equal(verifyWhatsAppWebhookSignature(fixture.rawPayload, "no-tiene-prefijo", fixture.secret).valid, false);
});

test("parseWhatsAppWebhookEvent: con firma válida devuelve el evento parseado; con firma inválida nunca expone el evento", () => {
  const fixture = buildSignedWhatsAppWebhookFixture();
  const ok = parseWhatsAppWebhookEvent(fixture.rawPayload, fixture.signatureHeader, fixture.secret);
  assert.equal(ok.valid, true);
  assert.equal(ok.event.object, "whatsapp_business_account");

  const bad = parseWhatsAppWebhookEvent(fixture.rawPayload, fixture.signatureHeader, "otro-secreto");
  assert.equal(bad.valid, false);
  assert.equal(bad.event, null);
});

test("FIXTURE_WHATSAPP_APP_SECRET nunca se usa por accidente como si fuera un secreto de producción (constante marcada como fixture)", () => {
  assert.match(FIXTURE_WHATSAPP_APP_SECRET, /fixture/);
});
