// Integración KV 2026-07-10c — cobertura de createStripeEventLockStore()
// (worker-reservas/payments/stripe-lock-store-factory.js): selección entre el
// adapter KV real (StripeEventProcessingKvLockStore) y el fallback en memoria
// (StripeEventProcessingLockStore), sin degradar en silencio a memoria cuando
// el binding real está presente.
import test from "node:test";
import assert from "node:assert/strict";
import { createStripeEventLockStore } from "../../worker-reservas/payments/stripe-lock-store-factory.js";
import { StripeEventProcessingLockStore } from "../../worker-reservas/payments/stripe-idempotency-lock-store.js";
import { StripeEventProcessingKvLockStore } from "../../worker-reservas/payments/stripe-idempotency-kv-adapter.skeleton.js";

/** Fake mínimo de KVNamespace (Cloudflare Workers Runtime API) respaldado por un Map, solo para tests de este factory. */
class FakeKvNamespace {
  #data = new Map();

  async get(key, opts) {
    const raw = this.#data.get(key);
    if (raw === undefined) return null;
    return opts?.type === "json" ? JSON.parse(raw) : raw;
  }

  async put(key, value) {
    this.#data.set(key, value);
  }

  async delete(key) {
    this.#data.delete(key);
  }

  get size() {
    return this.#data.size;
  }
}

test("sin env.STRIPE_IDEMPOTENCY_KV: usa el fallback en memoria", () => {
  const { store, backend } = createStripeEventLockStore({});
  assert.equal(backend, "memory");
  assert.ok(store instanceof StripeEventProcessingLockStore);
});

test("env undefined: usa el fallback en memoria (no lanza)", () => {
  const { store, backend } = createStripeEventLockStore(undefined);
  assert.equal(backend, "memory");
  assert.ok(store instanceof StripeEventProcessingLockStore);
});

test("con env.STRIPE_IDEMPOTENCY_KV real (forma KVNamespace): usa el adapter KV, nunca memoria", () => {
  const fakeKv = new FakeKvNamespace();
  const { store, backend } = createStripeEventLockStore({ STRIPE_IDEMPOTENCY_KV: fakeKv });
  assert.equal(backend, "kv");
  assert.ok(store instanceof StripeEventProcessingKvLockStore);
});

test("binding presente pero malformado (sin get/put/delete): lanza, no degrada en silencio a memoria", () => {
  assert.throws(
    () => createStripeEventLockStore({ STRIPE_IDEMPOTENCY_KV: { notAKv: true } }),
    /no expone get\/put\/delete/,
  );
});

test("binding presente pero null: se trata como ausente (fallback memoria explícito, no un malformado)", () => {
  const { backend } = createStripeEventLockStore({ STRIPE_IDEMPOTENCY_KV: null });
  assert.equal(backend, "memory");
});

test("paridad de comportamiento: el backend KV resuelve el ciclo completo de los 5 verbos igual que memoria", async () => {
  const fakeKv = new FakeKvNamespace();
  const { store } = createStripeEventLockStore({ STRIPE_IDEMPOTENCY_KV: fakeKv });

  assert.equal(await store.hasProcessedEvent("evt_1"), false);

  const lock = await store.markEventProcessing("evt_1");
  assert.equal(lock.acquired, true);

  const duplicate = await store.markEventProcessing("evt_1");
  assert.equal(duplicate.acquired, false);
  assert.equal(duplicate.reason, "locked_in_progress");

  await store.markEventProcessed("evt_1");
  assert.equal(await store.hasProcessedEvent("evt_1"), true);

  const replay = await store.markEventProcessing("evt_1");
  assert.equal(replay.acquired, false);
  assert.equal(replay.reason, "already_processed");
});

test("retry after partial failure (backend KV): markEventFailed libera el lock para un reintento posterior", async () => {
  const fakeKv = new FakeKvNamespace();
  const { store } = createStripeEventLockStore({ STRIPE_IDEMPOTENCY_KV: fakeKv });

  await store.markEventProcessing("evt_partial");
  await store.markEventFailed("evt_partial");
  assert.equal(await store.hasProcessedEvent("evt_partial"), false);

  const retry = await store.markEventProcessing("evt_partial");
  assert.equal(retry.acquired, true);
});

test("releaseProcessingLock (backend KV): desbloquea sin decidir éxito/fallo", async () => {
  const fakeKv = new FakeKvNamespace();
  const { store } = createStripeEventLockStore({ STRIPE_IDEMPOTENCY_KV: fakeKv });

  await store.markEventProcessing("evt_release");
  await store.releaseProcessingLock("evt_release");

  const fresh = await store.markEventProcessing("evt_release");
  assert.equal(fresh.acquired, true);
  assert.equal(fresh.reason, undefined);
});

test("same key/different tenant (backend KV): dos tenants con el mismo event.id no comparten lock", async () => {
  const fakeKv = new FakeKvNamespace();
  const { store } = createStripeEventLockStore({ STRIPE_IDEMPOTENCY_KV: fakeKv });

  const lockA = await store.markEventProcessing("evt_shared", "tenant-a");
  assert.equal(lockA.acquired, true);

  const lockB = await store.markEventProcessing("evt_shared", "tenant-b");
  assert.equal(lockB.acquired, true, "un tenant distinto con el mismo event.id nunca debe heredar el lock de otro tenant");

  await store.markEventProcessed("evt_shared", "tenant-a");
  assert.equal(await store.hasProcessedEvent("evt_shared", "tenant-a"), true);
  assert.equal(await store.hasProcessedEvent("evt_shared", "tenant-b"), false);
});
