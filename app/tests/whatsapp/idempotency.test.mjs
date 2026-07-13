import test from "node:test";
import assert from "node:assert/strict";
import { TenantScopedDedupStore, SendLockStore, guardedSend } from "../../worker-reservas/messaging/whatsapp-idempotency.mjs";

function acceptedSend() {
  return async () => ({ status: "accepted", providerMessageId: `wamid.MOCK_${Math.random().toString(36).slice(2)}` });
}

function failingSend(times = 1) {
  let calls = 0;
  return async () => {
    calls += 1;
    if (calls <= times) return { status: "failed", errorCode: 130429, retryable: true, category: "rate_limit" };
    return { status: "accepted", providerMessageId: "wamid.MOCK_recovered" };
  };
}

// --- duplicate send -----------------------------------------------------------

test("duplicate send: mismo tenant+key tras un envío aceptado -> skipped_duplicate", async () => {
  const dedupStore = new TenantScopedDedupStore();
  const lockStore = new SendLockStore();
  const params = { tenantId: "tnt_a", idempotencyKey: "wa_dup_001", dedupStore, lockStore };

  const first = await guardedSend(params, acceptedSend());
  assert.equal(first.status, "accepted");

  const second = await guardedSend(params, acceptedSend());
  assert.equal(second.status, "skipped_duplicate");
  assert.equal(second.reason, "already_completed");
});

// --- concurrent duplicate ------------------------------------------------------

test("concurrent duplicate: dos guardedSend() simultáneos con la misma clave -> solo uno se procesa, el otro queda 'locked'", async () => {
  const dedupStore = new TenantScopedDedupStore();
  const lockStore = new SendLockStore();
  const params = { tenantId: "tnt_b", idempotencyKey: "wa_concurrent_001", dedupStore, lockStore };

  let resolveSlowSend;
  const slowSend = () => new Promise((resolve) => { resolveSlowSend = () => resolve({ status: "accepted", providerMessageId: "wamid.SLOW" }); });

  const firstPromise = guardedSend(params, slowSend);
  // El lock ya está adquirido de forma síncrona antes de que slowSend() resuelva — un segundo intento mientras el primero sigue "en vuelo" debe ver 'locked'.
  const second = await guardedSend(params, acceptedSend());
  assert.equal(second.status, "locked");
  assert.equal(second.reason, "concurrent_duplicate_in_flight");

  resolveSlowSend();
  const first = await firstPromise;
  assert.equal(first.status, "accepted");
});

// --- retry after partial failure -----------------------------------------------

test("retry after partial failure: un envío fallido libera el lock SIN marcar dedup -> el mismo idempotency_key puede reintentarse", async () => {
  const dedupStore = new TenantScopedDedupStore();
  const lockStore = new SendLockStore();
  const params = { tenantId: "tnt_c", idempotencyKey: "wa_retry_001", dedupStore, lockStore };
  const send = failingSend(1);

  const attempt1 = await guardedSend(params, send);
  assert.equal(attempt1.status, "failed");
  assert.equal(lockStore.isLocked(`tnt_c:wa_retry_001`), false, "el lock debe liberarse tras un fallo, no quedar colgado");

  const attempt2 = await guardedSend(params, send);
  assert.equal(attempt2.status, "accepted", "un reintento con la misma clave tras un fallo previo debe poder completarse");
});

// --- stale lock -----------------------------------------------------------------

test("stale lock: un lock más viejo que staleAfterMs se recupera (acquired:true, stale:true), nunca bloquea para siempre", () => {
  const lockStore = new SendLockStore();
  const first = lockStore.tryAcquire("k1", { nowMs: 0, staleAfterMs: 30000 });
  assert.equal(first.acquired, true);
  assert.equal(first.stale, false);

  const tooSoon = lockStore.tryAcquire("k1", { nowMs: 5000, staleAfterMs: 30000 });
  assert.equal(tooSoon.acquired, false, "antes de staleAfterMs, un segundo intento debe seguir bloqueado");

  const recovered = lockStore.tryAcquire("k1", { nowMs: 40000, staleAfterMs: 30000 });
  assert.equal(recovered.acquired, true);
  assert.equal(recovered.stale, true, "pasado staleAfterMs, el lock se recupera y se marca explícitamente como stale para poder auditarlo");
});

test("stale lock: guardedSend() propaga stale:true cuando recupera un lock nunca liberado (worker caído simulado)", async () => {
  const dedupStore = new TenantScopedDedupStore();
  const lockStore = new SendLockStore();
  lockStore.tryAcquire("tnt_d:wa_stale_001", { nowMs: 0, staleAfterMs: 1000 }); // simula un lock huérfano de un worker caído, nunca liberado

  const result = await guardedSend(
    { tenantId: "tnt_d", idempotencyKey: "wa_stale_001", dedupStore, lockStore, nowMs: 5000, staleAfterMs: 1000 },
    acceptedSend(),
  );
  assert.equal(result.status, "accepted");
  assert.equal(result.stale, true);
});

// --- same business message, different request (distintas idempotency_key) -

test("same business message, different request: dos idempotency_key distintas para la misma reserva NO se deduplican entre sí (por diseño — dedup es por clave, no por contenido)", async () => {
  const dedupStore = new TenantScopedDedupStore();
  const lockStore = new SendLockStore();

  const first = await guardedSend({ tenantId: "tnt_e", idempotencyKey: "wa_bkg_777_attempt_1", dedupStore, lockStore }, acceptedSend());
  const second = await guardedSend({ tenantId: "tnt_e", idempotencyKey: "wa_bkg_777_attempt_2", dedupStore, lockStore }, acceptedSend());

  assert.equal(first.status, "accepted");
  assert.equal(second.status, "accepted", "distinta idempotency_key, aunque sea 'la misma reserva' de negocio, se trata como un envío independiente — el llamador es responsable de generar una clave estable si quiere dedup real");
});

// --- same idempotency key, different tenant -------------------------------------

test("same idempotency key, different tenant: la misma clave en dos tenants distintos NO colisiona (TenantScopedDedupStore aislado por tenant)", async () => {
  const dedupStore = new TenantScopedDedupStore();
  const lockStore = new SendLockStore();
  const sharedKey = "wa_shared_key_collision_test";

  const tenantA = await guardedSend({ tenantId: "tnt_f", idempotencyKey: sharedKey, dedupStore, lockStore }, acceptedSend());
  const tenantB = await guardedSend({ tenantId: "tnt_g", idempotencyKey: sharedKey, dedupStore, lockStore }, acceptedSend());

  assert.equal(tenantA.status, "accepted");
  assert.equal(tenantB.status, "accepted", "un tenant distinto con la misma clave nunca debe verse bloqueado por el envío de otro tenant");
  assert.equal(dedupStore.tenantCount, 2);
});

test("TenantScopedDedupStore: sin tenantId lanza — ningún tenant es implícito", () => {
  const dedupStore = new TenantScopedDedupStore();
  assert.throws(() => dedupStore.forTenant(undefined));
});

test("guardedSend: sin tenantId rechaza con missing_tenant_id antes de tocar dedup/lock", async () => {
  const dedupStore = new TenantScopedDedupStore();
  const lockStore = new SendLockStore();
  const result = await guardedSend({ tenantId: undefined, idempotencyKey: "wa_x", dedupStore, lockStore }, acceptedSend());
  assert.equal(result.status, "rejected");
  assert.equal(result.reason, "missing_tenant_id");
});
