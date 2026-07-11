import test from "node:test";
import assert from "node:assert/strict";
import { PaymentIdempotencyStore } from "../../worker-reservas/payments/stripe-idempotency.js";
import { idempotencyKey } from "../../worker-reservas/payments/stripe-adapter.mock.js";

test("processOnce: primera ejecución exitosa se marca como completed", async () => {
  const store = new PaymentIdempotencyStore();
  const key = idempotencyKey({ tenantId: "tnt_a", bookingId: "bkg_1", paymentReference: "payref_1" });

  const result = await store.processOnce(key, () => ({ cuotaActualizada: true }));

  assert.equal(result.outcome, "completed");
  assert.deepEqual(result.result, { cuotaActualizada: true });
  assert.equal(store.isCompleted(key), true);
  assert.equal(store.completedCount, 1);
});

test("processOnce: segunda llamada con la misma clave devuelve already_completed sin reejecutar el efecto", async () => {
  const store = new PaymentIdempotencyStore();
  const key = idempotencyKey({ tenantId: "tnt_a", bookingId: "bkg_1", paymentReference: "payref_1" });
  let callCount = 0;
  const effect = () => {
    callCount += 1;
    return { call: callCount };
  };

  const first = await store.processOnce(key, effect);
  const second = await store.processOnce(key, effect);

  assert.equal(first.outcome, "completed");
  assert.equal(second.outcome, "already_completed");
  assert.equal(callCount, 1, "el efecto de negocio solo debe ejecutarse una vez, nunca dos, para la misma clave");
  assert.deepEqual(second.result, first.result);
});

test("retry-safe: un efecto que falla NO se marca como completado — un reintento posterior puede volver a intentarlo", async () => {
  const store = new PaymentIdempotencyStore();
  const key = idempotencyKey({ tenantId: "tnt_a", bookingId: "bkg_2", paymentReference: "payref_2" });

  const failing = await store.processOnce(key, () => {
    throw new Error("Airtable no disponible temporalmente");
  });
  assert.equal(failing.outcome, "failed_retry_safe");
  assert.equal(failing.error, "Airtable no disponible temporalmente");
  assert.equal(store.isCompleted(key), false);

  const retry = await store.processOnce(key, () => ({ cuotaActualizada: true }));
  assert.equal(retry.outcome, "completed");
  assert.equal(store.isCompleted(key), true);
});

test("recuperación de fallo parcial: tras varios fallos, el efecto se ejecuta una vez por intento hasta el éxito", async () => {
  const store = new PaymentIdempotencyStore();
  const key = idempotencyKey({ tenantId: "tnt_a", bookingId: "bkg_3", paymentReference: "payref_3" });
  let attempts = 0;
  const effect = () => {
    attempts += 1;
    if (attempts < 3) throw new Error(`fallo simulado en intento ${attempts}`);
    return { attempts };
  };

  assert.equal((await store.processOnce(key, effect)).outcome, "failed_retry_safe");
  assert.equal((await store.processOnce(key, effect)).outcome, "failed_retry_safe");
  const success = await store.processOnce(key, effect);
  assert.equal(success.outcome, "completed");
  assert.equal(success.result.attempts, 3);
  assert.equal(attempts, 3, "cada reintento debe ejecutar el efecto exactamente una vez, no más");
});

test("protección de concurrencia: una clave en curso (in-flight) se marca in_flight_skip, no se ejecuta dos veces en paralelo", async () => {
  const store = new PaymentIdempotencyStore();
  const key = idempotencyKey({ tenantId: "tnt_a", bookingId: "bkg_4", paymentReference: "payref_4" });
  let concurrentCalls = 0;
  let maxConcurrent = 0;

  const slowEffect = async () => {
    concurrentCalls += 1;
    maxConcurrent = Math.max(maxConcurrent, concurrentCalls);
    await new Promise((resolve) => setTimeout(resolve, 20));
    concurrentCalls -= 1;
    return { ok: true };
  };

  const [a, b] = await Promise.all([store.processOnce(key, slowEffect), store.processOnce(key, slowEffect)]);
  const outcomes = [a.outcome, b.outcome].sort();

  assert.deepEqual(outcomes, ["completed", "in_flight_skip"]);
  assert.equal(maxConcurrent, 1, "el efecto de negocio nunca debe ejecutarse dos veces en paralelo para la misma clave");
});

test("claves distintas son completamente independientes", async () => {
  const store = new PaymentIdempotencyStore();
  const keyA = idempotencyKey({ tenantId: "tnt_a", bookingId: "bkg_5", paymentReference: "payref_5" });
  const keyB = idempotencyKey({ tenantId: "tnt_a", bookingId: "bkg_6", paymentReference: "payref_6" });

  await store.processOnce(keyA, () => ({ tag: "A" }));
  await store.processOnce(keyB, () => ({ tag: "B" }));

  assert.equal(store.completedCount, 2);
  assert.equal(store.isCompleted(keyA), true);
  assert.equal(store.isCompleted(keyB), true);
});
