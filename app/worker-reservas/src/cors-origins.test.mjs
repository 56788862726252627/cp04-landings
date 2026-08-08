import test from "node:test";
import assert from "node:assert/strict";

import worker, { __resetIdempotencyStoreForTests } from "./index.js";

// MEJORA 2026-08-07 (deploy drift ALLOWED_ORIGIN localhost:5175, ver informe
// de diagnóstico de la misma fecha): valida el comportamiento CORS de
// /api/jugadores/alta contra la allowlist que debe estar desplegada. Ningún
// test de este archivo hace una petición de red real: cuando la ruta feliz
// necesita llegar hasta el fetch a Make, se sustituye globalThis.fetch por
// un stub local, restaurado siempre en el `finally`.
//
// Esta cadena de orígenes debe coincidir exactamente con
// worker-reservas/wrangler.toml [vars].ALLOWED_ORIGIN. Si cambia allí,
// debe cambiar aquí también (no hay una única fuente de verdad compartida
// entre el archivo de config y el test, ver limitación documentada en el
// informe).
const ALLOWED_ORIGIN =
  "https://club-padel-04.pages.dev,http://localhost:5173,http://localhost:5174,http://localhost:5175";

const BASE_ENV = {
  ALLOWED_ORIGIN,
  MAKE_ALTA_JUGADOR_WEBHOOK: "https://hook.example.test/fake",
};

function altaRequest({ method = "OPTIONS", origin, body } = {}) {
  const headers = {};
  if (origin !== undefined) headers.Origin = origin;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  return new Request("https://worker.test/api/jugadores/alta", {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function withFakeFetch(fakeFetchImpl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetchImpl;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

const VALID_BODY = {
  nombre: "PruebaCors",
  apellidos: "OrigenTest",
  email: "prueba-cors@example.test",
  telefono: "600000000",
  fecha_nacimiento: "2000-01-01",
  nivel: "Iniciación",
  genero: "Otro",
  comentarios: "CORS_TEST_CP04_20260807",
  acepta_condiciones: true,
  origen: "CORS_TEST_CP04_20260807",
};

for (const origin of [
  "http://localhost:5175",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://club-padel-04.pages.dev",
]) {
  test(`OPTIONS /api/jugadores/alta con Origin ${origin} (permitido) -> 204 con Access-Control-Allow-Origin exacto`, async () => {
    const response = await worker.fetch(altaRequest({ origin }), BASE_ENV);
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), origin);
    assert.equal(response.headers.get("Access-Control-Allow-Methods"), "GET, POST, OPTIONS");
    assert.equal(response.headers.get("Access-Control-Allow-Headers"), "Content-Type, Authorization");
  });
}

test("OPTIONS /api/jugadores/alta con Origin arbitrario -> 204 SIN Access-Control-Allow-Origin (rechazado)", async () => {
  const response = await worker.fetch(
    altaRequest({ origin: "http://evil.example.com" }),
    BASE_ENV
  );
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
});

test("OPTIONS /api/jugadores/alta sin cabecera Origin -> 204 SIN Access-Control-Allow-Origin", async () => {
  const response = await worker.fetch(altaRequest({}), BASE_ENV);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
});

test("POST /api/jugadores/alta con Origin permitido (5175) y payload válido -> respuesta con CORS correcto", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    async () =>
      new Response(JSON.stringify({ ok: true, status: "CREATED" }), { status: 201 }),
    async () => {
      const response = await worker.fetch(
        altaRequest({ method: "POST", origin: "http://localhost:5175", body: VALID_BODY }),
        BASE_ENV
      );
      assert.equal(response.headers.get("Access-Control-Allow-Origin"), "http://localhost:5175");
      const data = await response.json();
      assert.equal(response.status, 200);
      assert.equal(data.ok, true);
    }
  );
});

test("POST /api/jugadores/alta con Origin no permitido -> respuesta de error SIN Access-Control-Allow-Origin (sin filtrar el body)", async () => {
  __resetIdempotencyStoreForTests();
  const response = await worker.fetch(
    altaRequest({
      method: "POST",
      origin: "http://evil.example.com",
      body: { ...VALID_BODY, nivel: "" }, // payload inválido a propósito: no debe llegar a Make
    }),
    BASE_ENV
  );
  assert.equal(response.status, 400);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
});

test("POST /api/jugadores/alta con Origin permitido y payload inválido (400) -> conserva Access-Control-Allow-Origin", async () => {
  __resetIdempotencyStoreForTests();
  const response = await worker.fetch(
    altaRequest({
      method: "POST",
      origin: "http://localhost:5175",
      body: { ...VALID_BODY, nivel: "" },
    }),
    BASE_ENV
  );
  assert.equal(response.status, 400);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "http://localhost:5175");
});

test("POST /api/jugadores/alta con Origin permitido y Make inalcanzable -> 502 controlado, conserva CORS (hardening 2026-08-07)", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    async () => {
      throw new TypeError("network error simulado");
    },
    async () => {
      const response = await worker.fetch(
        altaRequest({ method: "POST", origin: "http://localhost:5175", body: VALID_BODY }),
        BASE_ENV
      );
      assert.equal(response.status, 502);
      assert.equal(response.headers.get("Access-Control-Allow-Origin"), "http://localhost:5175");
      const data = await response.json();
      assert.equal(data.ok, false);
      assert.equal(data.error, "Make unreachable");
    }
  );
});
