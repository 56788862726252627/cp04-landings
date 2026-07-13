import test from "node:test";
import assert from "node:assert/strict";
import { ConsentStore, SuppressionList, CONSENT_STATE } from "../../worker-reservas/messaging/whatsapp-consent.js";
import { validateRecipient } from "../../worker-reservas/messaging/whatsapp-adapter.mock.js";

test("ConsentStore: un número nuevo está PENDING", () => {
  const store = new ConsentStore();
  assert.equal(store.getConsentState("+34600000030"), CONSENT_STATE.PENDING);
  assert.equal(store.isOptedIn("+34600000030"), false);
});

test("ConsentStore: recordOptIn con source válido pasa a OPTED_IN y guarda el historial", () => {
  const store = new ConsentStore();
  store.recordOptIn("+34600000030", { source: "booking_form", atMs: 1000 });
  assert.equal(store.getConsentState("+34600000030"), CONSENT_STATE.OPTED_IN);
  assert.equal(store.isOptedIn("+34600000030"), true);
  assert.deepEqual(store.getHistory("+34600000030"), [{ type: "opt_in", source: "booking_form", atMs: 1000 }]);
});

test("ConsentStore: recordOptIn con source desconocido lanza", () => {
  const store = new ConsentStore();
  assert.throws(() => store.recordOptIn("+34600000030", { source: "cold_call" }));
});

test("ConsentStore: recordOptOut siempre funciona, incluso desde PENDING", () => {
  const store = new ConsentStore();
  store.recordOptOut("+34600000031", { reason: "nunca hizo opt-in, pero pide baja preventiva" });
  assert.equal(store.getConsentState("+34600000031"), CONSENT_STATE.OPTED_OUT);
});

test("ConsentStore: tras opt-out, recordOptIn() lanza — hay que usar resubscribe()", () => {
  const store = new ConsentStore();
  store.recordOptIn("+34600000030", { source: "booking_form" });
  store.recordOptOut("+34600000030", { reason: "solicitud del socio" });
  assert.throws(() => store.recordOptIn("+34600000030", { source: "booking_form" }), /resubscribe/);
});

test("ConsentStore: resubscribe() solo funciona si el estado actual es OPTED_OUT", () => {
  const store = new ConsentStore();
  assert.throws(() => store.resubscribe("+34600000030", { source: "whatsapp_reply" }), /nada que resuscribir/);
});

test("ConsentStore: ciclo completo opt_in -> opt_out -> resubscribe queda reflejado en el historial", () => {
  const store = new ConsentStore();
  store.recordOptIn("+34600000030", { source: "booking_form", atMs: 1000 });
  store.recordOptOut("+34600000030", { atMs: 2000, reason: "pausa temporal" });
  store.resubscribe("+34600000030", { source: "whatsapp_reply", atMs: 3000 });
  assert.equal(store.getConsentState("+34600000030"), CONSENT_STATE.OPTED_IN);
  const history = store.getHistory("+34600000030");
  assert.deepEqual(
    history.map((h) => h.type),
    ["opt_in", "opt_out", "resubscribe"],
  );
});

test("ConsentStore: getHistory devuelve una copia — mutarla no afecta al store", () => {
  const store = new ConsentStore();
  store.recordOptIn("+34600000030", { source: "booking_form" });
  const history = store.getHistory("+34600000030");
  history.push({ type: "opt_in", source: "fake", atMs: 0 });
  assert.equal(store.getHistory("+34600000030").length, 1);
});

test("SuppressionList: bloquea y desbloquea independientemente del consentimiento", () => {
  const list = new SuppressionList();
  assert.equal(list.isBlocked("+34600000021"), false);
  list.add("+34600000021", { reason: "queja_reiterada_spam_reportado" });
  assert.equal(list.isBlocked("+34600000021"), true);
  assert.equal(list.getReason("+34600000021"), "queja_reiterada_spam_reportado");
  list.remove("+34600000021");
  assert.equal(list.isBlocked("+34600000021"), false);
});

test("validateRecipient: bloquea por suppression list incluso con opt-in vigente", () => {
  const consentStore = new ConsentStore();
  const suppressionList = new SuppressionList();
  consentStore.recordOptIn("+34600000021", { source: "booking_form" });
  suppressionList.add("+34600000021", { reason: "queja_reiterada_spam_reportado" });

  const result = validateRecipient("+34600000021", consentStore, suppressionList);
  assert.equal(result.allowed, false);
  assert.match(result.reason, /^blocked_recipient:/);
});

test("validateRecipient: rechaza PENDING (nunca opt-in) con recipient_not_opted_in", () => {
  const consentStore = new ConsentStore();
  const result = validateRecipient("+34600000032", consentStore);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "recipient_not_opted_in");
});

test("validateRecipient: rechaza OPTED_OUT con recipient_opted_out", () => {
  const consentStore = new ConsentStore();
  consentStore.recordOptIn("+34600000033", { source: "booking_form" });
  consentStore.recordOptOut("+34600000033", { reason: "baja" });
  const result = validateRecipient("+34600000033", consentStore);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "recipient_opted_out");
});

test("validateRecipient: rechaza formato E.164 inválido antes de mirar consentimiento", () => {
  const consentStore = new ConsentStore();
  const result = validateRecipient("600000034", consentStore);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "invalid_phone_format");
});

test("validateRecipient: permite un número OPTED_IN sin bloqueo de supresión", () => {
  const consentStore = new ConsentStore();
  consentStore.recordOptIn("+34600000035", { source: "admin_manual" });
  const result = validateRecipient("+34600000035", consentStore, new SuppressionList());
  assert.equal(result.allowed, true);
});
