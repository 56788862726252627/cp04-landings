// FASE 3 (cierre técnico 2026-07-10) — cobertura de createInMemorySideEffects()
// y del contrato de las 5 firmas (worker-reservas/payments/stripe-side-effects.js).
import test from "node:test";
import assert from "node:assert/strict";
import {
  createInMemorySideEffects,
  SIDE_EFFECT_CONTRACT,
  SIDE_EFFECT_NAMES,
  PRIMARY_EFFECT_BY_STATUS,
  RetryableSideEffectError,
  PermanentSideEffectError,
} from "../../worker-reservas/payments/stripe-side-effects.js";

test("SIDE_EFFECT_NAMES contiene exactamente los 5 efectos pedidos por la misión", () => {
  assert.deepEqual(SIDE_EFFECT_NAMES, ["markBookingPaid", "markPaymentFailed", "markRefunded", "publishPaymentEvent", "writeAuditEvent"]);
  assert.deepEqual(Object.keys(SIDE_EFFECT_CONTRACT), SIDE_EFFECT_NAMES);
});

test("createInMemorySideEffects expone las 5 funciones del contrato", () => {
  const sideEffects = createInMemorySideEffects();
  for (const name of SIDE_EFFECT_NAMES) {
    assert.equal(typeof sideEffects[name], "function", `falta ${name}`);
  }
});

test("cada llamada queda registrada en .calls, en orden, sin tocar red ni Airtable/Make", async () => {
  const sideEffects = createInMemorySideEffects();
  await sideEffects.markBookingPaid({ tenantId: "tnt_a", bookingId: "bkg_1", eventId: "evt_1" });
  await sideEffects.publishPaymentEvent({ eventType: "checkout.session.completed", status: "PAID", tenantId: "tnt_a", bookingId: "bkg_1", eventId: "evt_1" });
  await sideEffects.writeAuditEvent({ action: "stripe_webhook_paid", tenantId: "tnt_a", eventId: "evt_1", metadata: {} });

  assert.equal(sideEffects.calls.length, 3);
  assert.deepEqual(sideEffects.calls.map((c) => c.name), ["markBookingPaid", "publishPaymentEvent", "writeAuditEvent"]);
  assert.equal(sideEffects.calls[0].params.bookingId, "bkg_1");
  assert.ok(sideEffects.calls[0].at, "cada llamada registra un timestamp");
});

test("markPaymentFailed y markRefunded quedan registrados igual que los demás", async () => {
  const sideEffects = createInMemorySideEffects();
  await sideEffects.markPaymentFailed({ tenantId: "tnt_a", bookingId: "bkg_1", eventId: "evt_1", reason: "card_declined" });
  await sideEffects.markRefunded({ tenantId: "tnt_a", bookingId: "bkg_1", eventId: "evt_2" });

  assert.deepEqual(sideEffects.calls.map((c) => c.name), ["markPaymentFailed", "markRefunded"]);
});

test("simulateFailureFor retryable: lanza RetryableSideEffectError, pero la llamada ya quedó registrada antes de fallar", async () => {
  const sideEffects = createInMemorySideEffects({ simulateFailureFor: { markBookingPaid: "retryable" } });
  await assert.rejects(() => sideEffects.markBookingPaid({ tenantId: "tnt_a", bookingId: "bkg_1", eventId: "evt_1" }), RetryableSideEffectError);
  assert.equal(sideEffects.calls.length, 1);
});

test("simulateFailureFor permanent: lanza PermanentSideEffectError", async () => {
  const sideEffects = createInMemorySideEffects({ simulateFailureFor: { markRefunded: "permanent" } });
  await assert.rejects(() => sideEffects.markRefunded({ tenantId: "tnt_a", bookingId: "bkg_1", eventId: "evt_1" }), PermanentSideEffectError);
});

test("RetryableSideEffectError/PermanentSideEffectError exponen .retryable correctamente", () => {
  const retryable = new RetryableSideEffectError("x");
  const permanent = new PermanentSideEffectError("x");
  assert.equal(retryable.retryable, true);
  assert.equal(permanent.retryable, false);
});

test("PRIMARY_EFFECT_BY_STATUS mapea PAID/FAILED/REFUNDED a su efecto y EXPIRED a null (nunca hubo pago que marcar)", () => {
  assert.deepEqual(PRIMARY_EFFECT_BY_STATUS, {
    PAID: "markBookingPaid",
    FAILED: "markPaymentFailed",
    REFUNDED: "markRefunded",
    EXPIRED: null,
  });
});

test("dos instancias de createInMemorySideEffects no comparten estado (.calls aislado por instancia)", async () => {
  const a = createInMemorySideEffects();
  const b = createInMemorySideEffects();
  await a.writeAuditEvent({ action: "x", tenantId: "tnt_a", eventId: "evt_1", metadata: {} });
  assert.equal(a.calls.length, 1);
  assert.equal(b.calls.length, 0);
});
