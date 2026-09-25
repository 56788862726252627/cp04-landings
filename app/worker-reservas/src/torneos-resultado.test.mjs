import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";

// FLUJO 11 (2026-09-08): tests de handleTorneoResultado (POST /api/torneos/resultado).
// Mismo patrón que alta/baja-jugador: ningún test hace red real; fetch se
// sustituye temporalmente por un stub local restaurado siempre en el finally.

async function withFakeFetch(fakeFetchImpl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetchImpl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

function resultadoRequest(body, { headers = {} } = {}) {
  return new Request("https://worker.test/api/torneos/resultado", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  id_partido: "QA-PARTIDO-001",
  juegos_local: 6,
  juegos_visitante: 4,
};

// --- Sin webhook configurado ---

test("handleTorneoResultado: sin MAKE_RESULTADOS_TORNEO_WEBHOOK → 503 seguro, fetch no llamado", async () => {
  await withFakeFetch(
    async () => { throw new Error("no debería llamarse a fetch sin webhook configurado"); },
    async () => {
      const response = await worker.fetch(resultadoRequest(VALID_BODY), {});
      const data = await response.json();
      assert.equal(response.status, 503);
      assert.equal(data.ok, false);
      assert.equal(data.error, "Torneo results webhook not configured");
    }
  );
});

// --- Método incorrecto ---

test("handleTorneoResultado: GET → 405", async () => {
  const request = new Request("https://worker.test/api/torneos/resultado", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, { MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake" });
  assert.equal(response.status, 405);
});

test("handleTorneoResultado: OPTIONS → 204 (CORS preflight)", async () => {
  const request = new Request("https://worker.test/api/torneos/resultado", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, { MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake" });
  assert.equal(response.status, 204);
});

// --- JSON inválido ---

test("handleTorneoResultado: JSON inválido → 400", async () => {
  const request = new Request("https://worker.test/api/torneos/resultado", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: "{ no es json",
  });
  const response = await worker.fetch(request, { MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake" });
  assert.equal(response.status, 400);
});

// --- Validación de campos ---

test("handleTorneoResultado: sin id_partido → 400 con campo marcado", async () => {
  const response = await worker.fetch(
    resultadoRequest({ juegos_local: 6, juegos_visitante: 4 }),
    { MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.equal(data.ok, false);
  assert.ok(data.fields?.id_partido);
});

test("handleTorneoResultado: juegos_local como string → 400", async () => {
  const response = await worker.fetch(
    resultadoRequest({ id_partido: "P-001", juegos_local: "seis", juegos_visitante: 4 }),
    { MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields?.juegos_local);
});

test("handleTorneoResultado: juegos negativo → 400", async () => {
  const response = await worker.fetch(
    resultadoRequest({ id_partido: "P-001", juegos_local: -1, juegos_visitante: 4 }),
    { MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields?.juegos_local);
});

test("handleTorneoResultado: empate (juegos iguales) → 422", async () => {
  const response = await worker.fetch(
    resultadoRequest({ id_partido: "P-001", juegos_local: 6, juegos_visitante: 6 }),
    { MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 422);
  assert.equal(data.ok, false);
  assert.ok(data.error.includes("Draw not allowed"));
});

// --- Payload válido → forward a Make ---

test("handleTorneoResultado: payload válido reenvía a MAKE_RESULTADOS_TORNEO_WEBHOOK con campos correctos", async () => {
  let capturedUrl = null;
  let capturedBody = null;

  await withFakeFetch(
    async (url, init) => {
      capturedUrl = String(url?.url || url);
      capturedBody = JSON.parse(init.body);
      return new Response("Accepted", { status: 200 });
    },
    async () => {
      const response = await worker.fetch(resultadoRequest(VALID_BODY), {
        MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake-resultado",
      });
      const data = await response.json();

      assert.equal(response.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.status, "forwarded");
      assert.equal(capturedUrl, "https://hook.example.test/fake-resultado");
      assert.equal(capturedBody.id_partido, "QA-PARTIDO-001");
      assert.equal(capturedBody.juegos_local, 6);
      assert.equal(capturedBody.juegos_visitante, 4);
    }
  );
});

test("handleTorneoResultado: respuesta ok:true nunca confirma resultado como definitivo (status=forwarded)", async () => {
  await withFakeFetch(
    async () => new Response("Accepted", { status: 200 }),
    async () => {
      const response = await worker.fetch(resultadoRequest(VALID_BODY), {
        MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake-resultado",
      });
      const data = await response.json();
      assert.equal(data.ok, true);
      assert.equal(data.status, "forwarded");
    }
  );
});

test("handleTorneoResultado: Make responde error → 502, ok:false", async () => {
  await withFakeFetch(
    async () => new Response("Internal Error", { status: 500 }),
    async () => {
      const response = await worker.fetch(resultadoRequest(VALID_BODY), {
        MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake-resultado",
      });
      const data = await response.json();
      assert.equal(response.status, 502);
      assert.equal(data.ok, false);
    }
  );
});

// --- id_partido se normaliza (trim) ---

test("handleTorneoResultado: id_partido con espacios extra se envía trimmed a Make", async () => {
  let capturedBody = null;

  await withFakeFetch(
    async (url, init) => {
      capturedBody = JSON.parse(init.body);
      return new Response("Accepted", { status: 200 });
    },
    async () => {
      await worker.fetch(
        resultadoRequest({ id_partido: "  QA-001  ", juegos_local: 6, juegos_visitante: 4 }),
        { MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake-resultado" }
      );
      assert.equal(capturedBody.id_partido, "QA-001");
    }
  );
});

// --- Gate de rol ---

test("handleTorneoResultado: con CP04_ENFORCE_ROLE_GATES=true y sin token → 401 MISSING_TOKEN", async () => {
  await withFakeFetch(
    async () => { throw new Error("no debería llamarse a fetch: el gate debe bloquear antes"); },
    async () => {
      const response = await worker.fetch(resultadoRequest(VALID_BODY), {
        MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake-resultado",
        CP04_ENFORCE_ROLE_GATES: "true",
      });
      const data = await response.json();
      assert.equal(response.status, 401);
      assert.equal(data.ok, false);
      assert.equal(data.error, "MISSING_TOKEN");
    }
  );
});

test("handleTorneoResultado: OPTIONS pasa con gate activo → 204", async () => {
  const request = new Request("https://worker.test/api/torneos/resultado", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, {
    MAKE_RESULTADOS_TORNEO_WEBHOOK: "https://hook.example.test/fake-resultado",
    CP04_ENFORCE_ROLE_GATES: "true",
  });
  assert.equal(response.status, 204);
});

// --- Regresión: otros endpoints no se rompen ---

test("regresión: /api/jugadores/baja sigue respondiendo 503 sin MAKE_BAJA_JUGADOR_WEBHOOK", async () => {
  const request = new Request("https://worker.test/api/jugadores/baja", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: "QA", apellidos: "Test", email: "qa@test.com", telefono: "600000000",
      motivo_baja: "Voluntaria", fecha_baja: "2026-09-08",
    }),
  });
  const response = await worker.fetch(request, {});
  const data = await response.json();
  assert.equal(response.status, 503);
  assert.equal(data.error, "Baja webhook not configured");
});

test("regresión: /api/jugadores/alta sigue respondiendo 503 sin MAKE_ALTA_JUGADOR_WEBHOOK", async () => {
  const request = new Request("https://worker.test/api/jugadores/alta", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: "QA", apellidos: "Alta", email: "qa-alta@test.com", telefono: "600000000",
      fecha_nacimiento: "2000-01-01", nivel: "Iniciación", genero: "Otro", acepta_condiciones: true,
    }),
  });
  const response = await worker.fetch(request, {});
  const data = await response.json();
  assert.equal(response.status, 503);
  assert.equal(data.error, "Alta webhook not configured");
});
