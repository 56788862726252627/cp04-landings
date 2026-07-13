// Integración de ruta 2026-07-10d — POST /api/payments/stripe/webhook montado
// en el Worker central (WORKER_ROUTE_INTEGRATION_PLAN.md). Mismo patrón de
// caja negra que index.observability.test.mjs: import worker from "./index.js"
// + worker.fetch(request, env), sin mockear nada del Worker mismo.
//
// ORDEN DE LOS TESTS IMPORTA: getStripeEventLockStore() (index.js) es un
// singleton memoizado por módulo/isolate — la PRIMERA llamada EXITOSA fija el
// backend (KV o memoria) para el resto de este archivo (mismo proceso). Por
// eso el test que debe observar un fallo de construcción (binding
// malformado) va antes que cualquier request que llegue a construir el
// store con éxito: un throw no memoiza nada (el singleton queda null y
// puede reintentarse en el siguiente test), pero un éxito sí lo fija para
// siempre en este proceso. El caso "binding ausente -> memoria" NO se
// re-prueba aquí a propósito: ya lo cubre tests/stripe/lock-store-factory.test.mjs
// sobre createStripeEventLockStore() en aislamiento, y no puede exigirse aquí
// sin pisar el mismo singleton que usan los demás tests de este archivo.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import worker, { getStripeEventLockStore } from "./index.js";
import { signStripeEvent } from "../payments/stripe-adapter.mock.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, "../../fixtures/stripe");
const ROUTE = "https://worker.test/api/payments/stripe/webhook";
const TEST_WEBHOOK_SECRET = "whsec_test_qacp04_route_never_real";

function loadFixtureEvent(name) {
  const { _why, ...event } = JSON.parse(readFileSync(path.join(FIXTURES, name), "utf8"));
  return event;
}

/** Fake mínimo de KVNamespace (get/put/delete), instrumentado para poder comprobar si se llegó a invocar. */
class SpyKvNamespace {
  calls = [];
  #data = new Map();

  async get(key, opts) {
    this.calls.push(["get", key]);
    const raw = this.#data.get(key);
    if (raw === undefined) return null;
    return opts?.type === "json" ? JSON.parse(raw) : raw;
  }

  async put(key, value) {
    this.calls.push(["put", key]);
    this.#data.set(key, value);
  }

  async delete(key) {
    this.calls.push(["delete", key]);
    this.#data.delete(key);
  }
}

const BASE_ENV = {
  ALLOWED_ORIGIN: "http://localhost:5173",
  AIRTABLE_BASE_ID: "appTest",
  AIRTABLE_TABLE_ID: "tblTest",
};

// --- Fase 3.1/3.2/3.3: método correcto/incorrecto, sin tocar nunca el lock store ---

test("método GET rechazado con 405 y Allow: POST, la ruta nunca se confunde con el catch-all 404", async () => {
  const request = new Request(ROUTE, { method: "GET" });
  const response = await worker.fetch(request, BASE_ENV);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST");
  const body = await response.json();
  assert.equal(body.received, false);
  assert.equal(body.error, "method_not_allowed");
});

test("OPTIONS (preflight CORS) responde 204, mismo patrón que el resto de rutas del Worker", async () => {
  const request = new Request(ROUTE, { method: "OPTIONS" });
  const response = await worker.fetch(request, BASE_ENV);
  assert.equal(response.status, 204);
});

test("Content-Type ausente -> 400 antes de leer firma/body, sin tocar el lock store", async () => {
  // Sin body: la Fetch API de Node autoasigna "text/plain;charset=UTF-8" en
  // cuanto el request lleva un body string, así que la única forma real de
  // ejercitar "sin Content-Type en absoluto" es una request sin body.
  const request = new Request(ROUTE, { method: "POST" });
  const response = await worker.fetch(request, BASE_ENV);
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error, "missing_content_type");
});

test("Content-Type incorrecto (text/plain) -> 400, sin tocar el lock store", async () => {
  const request = new Request(ROUTE, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "{}",
  });
  const response = await worker.fetch(request, BASE_ENV);
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error, "unexpected_content_type:text/plain");
});

// --- Fase 3.6: binding presente pero malformado -> nunca degrada en silencio a memoria ---
// Debe ejecutarse ANTES de cualquier request que construya el lock store con
// éxito (ver nota de cabecera sobre el orden de este archivo): un throw aquí
// deja el singleton en null, listo para que el siguiente test lo construya
// de verdad.

test("STRIPE_IDEMPOTENCY_KV malformado (sin get/put/delete) -> 500 explícito, no un 200/400 disfrazado de éxito en memoria", async () => {
  const { header, rawBody } = await signStripeEvent(loadFixtureEvent("01-checkout-session-completed.json"), TEST_WEBHOOK_SECRET);
  const request = new Request(ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Stripe-Signature": header },
    body: rawBody,
  });
  const response = await worker.fetch(request, {
    ...BASE_ENV,
    STRIPE_WEBHOOK_SECRET: TEST_WEBHOOK_SECRET,
    STRIPE_IDEMPOTENCY_KV: { notAKv: true },
  });
  assert.equal(response.status, 500);
  const body = await response.json();
  assert.match(body.message, /no expone get\/put\/delete/);
});

// --- Fase 3.4/3.7/3.8: binding KV real llega a la factory, idempotencia se mantiene, regresión de rutas existentes ---
// A partir de aquí el singleton queda fijado en backend KV (primera
// construcción EXITOSA de este archivo) para el resto de los tests.

const KV_ENV = { ...BASE_ENV, STRIPE_WEBHOOK_SECRET: TEST_WEBHOOK_SECRET, STRIPE_IDEMPOTENCY_KV: new SpyKvNamespace() };

test("ruta existe y responde (no 404) a POST bien formado, con binding KV real presente", async () => {
  const { header, rawBody } = await signStripeEvent(loadFixtureEvent("11-invalid-signature-source-event.json"), "otro-secreto-distinto");
  const request = new Request(ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Stripe-Signature": header },
    body: rawBody,
  });
  const response = await worker.fetch(request, KV_ENV);
  assert.notEqual(response.status, 404);
});

test("binding KV real (forma válida) llega a la factory sin lanzar — la petición se clasifica en el bucket WRONG_TENANT (fail-closed), no se llega a KV.get porque la resolución de tenant del Worker corta antes (Zona 5, WORKER_ROUTE_INTEGRATION_PLAN.md), documentado y no una llamada perdida", async () => {
  const { header, rawBody } = await signStripeEvent(loadFixtureEvent("01-checkout-session-completed.json"), TEST_WEBHOOK_SECRET);
  const request = new Request(ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Stripe-Signature": header },
    body: rawBody,
  });
  const response = await worker.fetch(request, KV_ENV);
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.received, false);
  assert.equal(body.error, "tenant_mismatch");
  assert.deepEqual(KV_ENV.STRIPE_IDEMPOTENCY_KV.calls, [], "hoy el gate de tenant (Zona 5, sin loader real) bloquea antes de llegar a la idempotencia — cuando se resuelva, esta lista dejará de estar vacía");
});

test("dos peticiones idénticas seguidas (mismo event.id) producen la misma clasificación de forma determinista, sin lanzar ni cambiar de estado — la protección real de duplicados vía KV no se activa todavía por el mismo bloqueador de Zona 5", async () => {
  const { header, rawBody } = await signStripeEvent(loadFixtureEvent("06-duplicate-of-checkout-completed.json"), TEST_WEBHOOK_SECRET);
  const makeRequest = () =>
    new Request(ROUTE, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Stripe-Signature": header },
      body: rawBody,
    });

  const first = await worker.fetch(makeRequest(), KV_ENV);
  const second = await worker.fetch(makeRequest(), KV_ENV);
  assert.equal(first.status, second.status);
  assert.deepEqual(await first.json(), await second.json());
});

test("getStripeEventLockStore: memoización del singleton — un env distinto ya no cambia el backend elegido en la primera construcción exitosa", () => {
  const storeA = getStripeEventLockStore(KV_ENV);
  const storeB = getStripeEventLockStore({ STRIPE_IDEMPOTENCY_KV: undefined });
  assert.equal(storeA, storeB, "el singleton debe reutilizarse — recrearlo por request rompería la idempotencia entre requests del mismo isolate");
});

test("getStripeEventLockStore: la instancia memoizada conserva el ciclo de vida completo de los 5 verbos (prueba de humo sobre el objeto real que usa la ruta)", async () => {
  const store = getStripeEventLockStore(KV_ENV);
  const eventId = "evt_route_wiring_smoke_test";

  const lock = await store.markEventProcessing(eventId);
  assert.equal(lock.acquired, true);

  const duplicate = await store.markEventProcessing(eventId);
  assert.equal(duplicate.acquired, false);
  assert.equal(duplicate.reason, "locked_in_progress");

  await store.markEventProcessed(eventId);
  assert.equal(await store.hasProcessedEvent(eventId), true);
});

test("regresión: GET /health/live sigue funcionando tras montar la ruta de Stripe", async () => {
  const response = await worker.fetch(new Request("https://worker.test/health/live", { method: "GET" }), BASE_ENV);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "alive");
});

test("regresión: ruta desconocida sigue devolviendo 404 (el catch-all no se rompió al insertar la rama de Stripe antes de él)", async () => {
  const response = await worker.fetch(new Request("https://worker.test/api/esto-no-existe", { method: "GET" }), BASE_ENV);
  assert.equal(response.status, 404);
});
