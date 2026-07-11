// FASE 4 (cierre técnico 2026-07-10) — cobertura de StripeEventProcessingLockStore
// (worker-reservas/payments/stripe-idempotency-lock-store.js), los 5 verbos y
// los 6 casos pedidos: duplicate, concurrent duplicate, replay, stale lock,
// retry after partial failure, lock timeout.
//
// Refactor Production Readiness (2026-07-10b, riesgo residual #2): los 5
// verbos son ahora async (interfaz intercambiable con un futuro adapter
// KV/D1) y aceptan un segundo parámetro opcional `tenantId` para
// same-key/different-tenant. Todos los tests de esta suite siguen sin pasar
// tenantId explícitamente (comportamiento por defecto = clave solo por
// eventId, 100% compatible con el comportamiento anterior) salvo el bloque
// dedicado "tenant scoping" al final, que sí lo ejercita.
import test from "node:test";
import assert from "node:assert/strict";
import { StripeEventProcessingLockStore, LOCK_STATES, IDEMPOTENCY_STORE_CONTRACT } from "../../worker-reservas/payments/stripe-idempotency-lock-store.js";

test("LOCK_STATES enumera exactamente los 3 estados del ciclo de vida", () => {
  assert.deepEqual(LOCK_STATES, ["PROCESSING", "PROCESSED", "FAILED"]);
});

test("IDEMPOTENCY_STORE_CONTRACT documenta las 5 firmas async, ni una de más ni de menos", () => {
  assert.deepEqual(Object.keys(IDEMPOTENCY_STORE_CONTRACT).sort(), [
    "hasProcessedEvent",
    "markEventFailed",
    "markEventProcessed",
    "markEventProcessing",
    "releaseProcessingLock",
  ]);
  for (const signature of Object.values(IDEMPOTENCY_STORE_CONTRACT)) {
    assert.match(signature, /Promise</, "todas las firmas del contrato deben ser async (Promise) para ser intercambiables con un adapter KV/D1");
  }
});

test("hasProcessedEvent: false para un evento nunca visto", async () => {
  const store = new StripeEventProcessingLockStore();
  assert.equal(await store.hasProcessedEvent("evt_1"), false);
});

test("ciclo feliz: markEventProcessing -> markEventProcessed dejan hasProcessedEvent en true", async () => {
  const store = new StripeEventProcessingLockStore();
  const lock = await store.markEventProcessing("evt_1");
  assert.equal(lock.acquired, true);
  assert.equal(store.getState("evt_1"), "PROCESSING");

  await store.markEventProcessed("evt_1");
  assert.equal(store.getState("evt_1"), "PROCESSED");
  assert.equal(await store.hasProcessedEvent("evt_1"), true);
});

test("duplicate: un evento ya PROCESSED no puede volver a tomar el lock", async () => {
  const store = new StripeEventProcessingLockStore();
  await store.markEventProcessing("evt_1");
  await store.markEventProcessed("evt_1");

  const retry = await store.markEventProcessing("evt_1");
  assert.equal(retry.acquired, false);
  assert.equal(retry.reason, "already_processed");
});

test("concurrent duplicate: un segundo intento mientras el primero sigue PROCESSING (dentro de la ventana) se rechaza como locked_in_progress", async () => {
  let now = 1_000_000;
  const store = new StripeEventProcessingLockStore({ now: () => now, staleLockMs: 30_000 });

  const first = await store.markEventProcessing("evt_concurrent");
  assert.equal(first.acquired, true);

  now += 5_000; // dentro de staleLockMs, el primer intento sigue "en vuelo"
  const second = await store.markEventProcessing("evt_concurrent");
  assert.equal(second.acquired, false);
  assert.equal(second.reason, "locked_in_progress");
});

test("replay: el mismo event.id reenviado por Stripe tras completarse se trata igual que duplicate (already_processed), nunca reejecuta el efecto", async () => {
  const store = new StripeEventProcessingLockStore();
  await store.markEventProcessing("evt_replay");
  await store.markEventProcessed("evt_replay");

  // Stripe reintenta el mismo evento (mismo event.id) más tarde, sin haber
  // fallado nada — el store debe seguir rechazando la re-adquisición.
  const replay = await store.markEventProcessing("evt_replay");
  assert.equal(replay.acquired, false);
  assert.equal(replay.reason, "already_processed");
});

test("stale lock: un lock abandonado (crash/timeout) más allá de staleLockMs se reclama, no bloquea para siempre", async () => {
  let now = 1_000_000;
  const store = new StripeEventProcessingLockStore({ now: () => now, staleLockMs: 30_000 });

  await store.markEventProcessing("evt_stale");
  now += 30_001; // justo por encima del umbral de lock abandonado

  const reclaimed = await store.markEventProcessing("evt_stale");
  assert.equal(reclaimed.acquired, true);
  assert.equal(reclaimed.reason, "stale_lock_reclaimed");
  assert.equal(store.getState("evt_stale"), "PROCESSING");
});

test("lock timeout: exactamente en el borde (ageMs === staleLockMs) todavía cuenta como en curso, no como abandonado", async () => {
  let now = 1_000_000;
  const store = new StripeEventProcessingLockStore({ now: () => now, staleLockMs: 30_000 });

  await store.markEventProcessing("evt_edge");
  now += 30_000; // ageMs === staleLockMs, <=  -> todavía "locked_in_progress"

  const atBoundary = await store.markEventProcessing("evt_edge");
  assert.equal(atBoundary.acquired, false);
  assert.equal(atBoundary.reason, "locked_in_progress");
});

test("retry after partial failure: markEventFailed libera el lock y un reintento posterior puede tomarlo de nuevo", async () => {
  const store = new StripeEventProcessingLockStore();
  await store.markEventProcessing("evt_partial");
  await store.markEventFailed("evt_partial");
  assert.equal(await store.hasProcessedEvent("evt_partial"), false);

  const retry = await store.markEventProcessing("evt_partial");
  assert.equal(retry.acquired, true);
  assert.equal(retry.reason, undefined);

  await store.markEventProcessed("evt_partial");
  assert.equal(await store.hasProcessedEvent("evt_partial"), true);
});

test("releaseProcessingLock: desbloquea sin decidir éxito/fallo, el evento vuelve a estar disponible como si nunca se hubiera intentado", async () => {
  const store = new StripeEventProcessingLockStore();
  await store.markEventProcessing("evt_release");
  await store.releaseProcessingLock("evt_release");

  assert.equal(store.getState("evt_release"), null);
  const fresh = await store.markEventProcessing("evt_release");
  assert.equal(fresh.acquired, true);
  assert.equal(fresh.reason, undefined);
});

test("markEventProcessed sin lock previo lanza un error de uso explícito", async () => {
  const store = new StripeEventProcessingLockStore();
  await assert.rejects(() => store.markEventProcessed("evt_never_locked"), /no está en PROCESSING/);
});

test("eventos distintos son completamente independientes", async () => {
  const store = new StripeEventProcessingLockStore();
  await store.markEventProcessing("evt_a");
  await store.markEventProcessed("evt_a");

  const evtB = await store.markEventProcessing("evt_b");
  assert.equal(evtB.acquired, true);
  assert.equal(await store.hasProcessedEvent("evt_a"), true);
  assert.equal(await store.hasProcessedEvent("evt_b"), false);
});

// --- tenant scoping (Production Readiness, riesgo residual #2) -----------

test("same key/different tenant: el mismo event.id bajo dos tenantId distintos son entradas completamente independientes", async () => {
  const store = new StripeEventProcessingLockStore();

  const lockA = await store.markEventProcessing("evt_shared", "tenant-a");
  assert.equal(lockA.acquired, true);

  // Mismo event.id, tenant distinto — NO debe verse bloqueado por el lock de tenant-a.
  const lockB = await store.markEventProcessing("evt_shared", "tenant-b");
  assert.equal(lockB.acquired, true, "un tenant distinto con el mismo event.id nunca debe heredar el lock de otro tenant");

  await store.markEventProcessed("evt_shared", "tenant-a");
  assert.equal(await store.hasProcessedEvent("evt_shared", "tenant-a"), true);
  assert.equal(await store.hasProcessedEvent("evt_shared", "tenant-b"), false, "PROCESSED en tenant-a no debe filtrarse a tenant-b");
});

test("tenantId omitido usa la misma clave que la versión anterior a esta sesión (compatibilidad hacia atrás)", async () => {
  const store = new StripeEventProcessingLockStore();
  await store.markEventProcessing("evt_no_tenant");
  await store.markEventProcessed("evt_no_tenant");

  assert.equal(await store.hasProcessedEvent("evt_no_tenant"), true);
  assert.equal(await store.hasProcessedEvent("evt_no_tenant", null), true, "tenantId=null debe ser equivalente a omitirlo");
});

// --- TTL (Production Readiness, riesgo residual #2) -----------------------

test("processedTtlMs: una entrada PROCESSED expira tras el TTL y vuelve a estar disponible como si nunca se hubiera visto", async () => {
  let now = 1_000_000;
  const store = new StripeEventProcessingLockStore({ now: () => now, processedTtlMs: 60_000 });

  await store.markEventProcessing("evt_ttl");
  await store.markEventProcessed("evt_ttl");
  assert.equal(await store.hasProcessedEvent("evt_ttl"), true);

  now += 60_001;
  assert.equal(await store.hasProcessedEvent("evt_ttl"), false, "PROCESSED debe expirar tras processedTtlMs");

  const reacquired = await store.markEventProcessing("evt_ttl");
  assert.equal(reacquired.acquired, true, "tras expirar, el evento debe poder procesarse de nuevo (sin reason especial: no es un stale lock, es una entrada nueva)");
});

test("sin processedTtlMs (valor por defecto) una entrada PROCESSED nunca expira", async () => {
  let now = 1_000_000;
  const store = new StripeEventProcessingLockStore({ now: () => now });

  await store.markEventProcessing("evt_no_ttl");
  await store.markEventProcessed("evt_no_ttl");

  now += 1000 * 60 * 60 * 24 * 365; // un año después
  assert.equal(await store.hasProcessedEvent("evt_no_ttl"), true, "sin TTL configurado, PROCESSED debe persistir indefinidamente (correcto solo para procesos de vida corta, ver nota de cabecera sobre adapter KV real)");
});
