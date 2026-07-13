import test from "node:test";
import assert from "node:assert/strict";
import { ConsentStore, SuppressionList, EFFECTIVE_CONSENT_STATUS, resolveEffectiveConsentStatus } from "../../worker-reservas/messaging/whatsapp-consent.js";
import { validateRecipient } from "../../worker-reservas/messaging/whatsapp-adapter.mock.js";

// --- opt-in / opt-out / resubscribe (vía el modelo de 5 estados) -----------

test("resolveEffectiveConsentStatus: número nunca visto -> UNKNOWN", () => {
  const consentStore = new ConsentStore();
  const result = resolveEffectiveConsentStatus("+34600000050", consentStore);
  assert.equal(result.status, EFFECTIVE_CONSENT_STATUS.UNKNOWN);
});

test("resolveEffectiveConsentStatus: opt-in -> OPTED_IN", () => {
  const consentStore = new ConsentStore();
  consentStore.recordOptIn("+34600000050", { source: "booking_form" });
  assert.equal(resolveEffectiveConsentStatus("+34600000050", consentStore).status, EFFECTIVE_CONSENT_STATUS.OPTED_IN);
});

test("resolveEffectiveConsentStatus: opt-out -> OPTED_OUT", () => {
  const consentStore = new ConsentStore();
  consentStore.recordOptIn("+34600000050", { source: "booking_form" });
  consentStore.recordOptOut("+34600000050", { reason: "baja" });
  assert.equal(resolveEffectiveConsentStatus("+34600000050", consentStore).status, EFFECTIVE_CONSENT_STATUS.OPTED_OUT);
});

test("resolveEffectiveConsentStatus: resubscribe tras opt-out vuelve a OPTED_IN", () => {
  const consentStore = new ConsentStore();
  consentStore.recordOptIn("+34600000050", { source: "booking_form" });
  consentStore.recordOptOut("+34600000050", { reason: "baja" });
  consentStore.resubscribe("+34600000050", { source: "whatsapp_reply" });
  assert.equal(resolveEffectiveConsentStatus("+34600000050", consentStore).status, EFFECTIVE_CONSENT_STATUS.OPTED_IN);
});

// --- suppression: BLOCKED (administrativo) vs SUPPRESSED (sistema) --------

test("resolveEffectiveConsentStatus: en suppressionList (admin) -> BLOCKED", () => {
  const consentStore = new ConsentStore();
  consentStore.recordOptIn("+34600000051", { source: "booking_form" });
  const suppressionList = new SuppressionList();
  suppressionList.add("+34600000051", { reason: "queja_reiterada_spam_reportado" });

  const result = resolveEffectiveConsentStatus("+34600000051", consentStore, { suppressionList });
  assert.equal(result.status, EFFECTIVE_CONSENT_STATUS.BLOCKED);
  assert.equal(result.reason, "queja_reiterada_spam_reportado");
});

test("resolveEffectiveConsentStatus: en autoSuppressionList (sistema) -> SUPPRESSED, distinto de BLOCKED", () => {
  const consentStore = new ConsentStore();
  consentStore.recordOptIn("+34600000052", { source: "booking_form" });
  const autoSuppressionList = new SuppressionList();
  autoSuppressionList.add("+34600000052", { reason: "provider_error_131026_recipient_not_on_whatsapp" });

  const result = resolveEffectiveConsentStatus("+34600000052", consentStore, { autoSuppressionList });
  assert.equal(result.status, EFFECTIVE_CONSENT_STATUS.SUPPRESSED);
  assert.notEqual(result.status, EFFECTIVE_CONSENT_STATUS.BLOCKED);
});

test("resolveEffectiveConsentStatus: BLOCKED (admin) tiene precedencia sobre SUPPRESSED (sistema) si ambos aplican", () => {
  const consentStore = new ConsentStore();
  const suppressionList = new SuppressionList();
  const autoSuppressionList = new SuppressionList();
  suppressionList.add("+34600000053", { reason: "admin_block" });
  autoSuppressionList.add("+34600000053", { reason: "system_suppress" });

  const result = resolveEffectiveConsentStatus("+34600000053", consentStore, { suppressionList, autoSuppressionList });
  assert.equal(result.status, EFFECTIVE_CONSENT_STATUS.BLOCKED);
});

test("resolveEffectiveConsentStatus: BLOCKED/SUPPRESSED anulan un OPTED_IN vigente (el consentimiento del usuario no levanta un bloqueo)", () => {
  const consentStore = new ConsentStore();
  consentStore.recordOptIn("+34600000054", { source: "booking_form" });
  const suppressionList = new SuppressionList();
  suppressionList.add("+34600000054", { reason: "legal_hold" });

  assert.equal(resolveEffectiveConsentStatus("+34600000054", consentStore, { suppressionList }).status, EFFECTIVE_CONSENT_STATUS.BLOCKED);
});

// --- duplicate request -------------------------------------------------------

test("recordOptIn: petición de opt-in duplicada (mismo source, ya OPTED_IN) no lanza y queda auditada dos veces en el historial", () => {
  const consentStore = new ConsentStore();
  consentStore.recordOptIn("+34600000055", { source: "booking_form", atMs: 1000 });
  const secondState = consentStore.recordOptIn("+34600000055", { source: "booking_form", atMs: 2000 });
  assert.equal(secondState, "OPTED_IN");
  assert.equal(consentStore.getHistory("+34600000055").length, 2, "una petición de opt-in duplicada se audita, no se descarta silenciosamente");
});

// --- send blocked when opted out (a través del pipeline real) --------------

test("send blocked when opted out: validateRecipient rechaza tras opt-out, coherente con resolveEffectiveConsentStatus", () => {
  const consentStore = new ConsentStore();
  consentStore.recordOptIn("+34600000056", { source: "booking_form" });
  consentStore.recordOptOut("+34600000056", { reason: "baja" });

  const effective = resolveEffectiveConsentStatus("+34600000056", consentStore);
  const recipientCheck = validateRecipient("+34600000056", consentStore);

  assert.equal(effective.status, EFFECTIVE_CONSENT_STATUS.OPTED_OUT);
  assert.equal(recipientCheck.allowed, false);
  assert.equal(recipientCheck.reason, "recipient_opted_out");
});
