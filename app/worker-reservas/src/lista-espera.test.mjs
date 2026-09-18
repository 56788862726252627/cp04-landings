import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";

// Flujo #8 "Gestión Lista de Espera" (dominio PISTA/RESERVA, distinto de la
// espera de MEMBRESÍA de "Baja de Jugador + Promoción"): tests de
// handleListaEspera (worker-reservas/src/index.js). Ningún test hace una
// petición de red real: cuando hace falta simular la respuesta del webhook
// de Make, se sustituye temporalmente globalThis.fetch por un stub local,
// restaurado siempre en el `finally`. Ninguna URL/token es real.

async function withFakeFetch(fakeFetchImpl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetchImpl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

function listaEsperaRequest(body, { headers = {} } = {}) {
  return new Request("https://worker.test/api/lista-espera", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const VALID_APUNTARSE_BODY = {
  accion: "apuntarse",
  nombre: "QA Espera",
  apellidos: "Pista Test",
  email: "qa-espera@example.test",
  telefono: "600000000",
  nivel: "Intermedio",
  pista: "Pista 2",
  fecha: "2026-09-25",
  hora_inicio: "09:00",
  hora_fin: "10:30",
};

const VALID_SALIR_BODY = {
  accion: "salir",
  email: "qa-espera@example.test",
  pista: "Pista 2",
  fecha: "2026-09-25",
  hora_inicio: "09:00",
  hora_fin: "10:30",
};

test("handleListaEspera: sin MAKE_LISTA_ESPERA_PISTA_WEBHOOK configurado -> 503 seguro, sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => { throw new Error("no debería llamarse a fetch sin webhook configurado"); },
    async () => {
      const response = await worker.fetch(listaEsperaRequest(VALID_APUNTARSE_BODY), {});
      const data = await response.json();
      assert.equal(response.status, 503);
      assert.equal(data.ok, false);
    }
  );
});

test("handleListaEspera: método no permitido -> 405", async () => {
  const request = new Request("https://worker.test/api/lista-espera", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, { MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake" });
  assert.equal(response.status, 405);
});

test("handleListaEspera: OPTIONS siempre responde 204", async () => {
  const request = new Request("https://worker.test/api/lista-espera", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, { MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake" });
  assert.equal(response.status, 204);
});

test("handleListaEspera: JSON inválido -> 400", async () => {
  const request = new Request("https://worker.test/api/lista-espera", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: "{ no es json",
  });
  const response = await worker.fetch(request, { MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake" });
  assert.equal(response.status, 400);
});

test("handleListaEspera: accion fuera de apuntarse/salir -> 400", async () => {
  const response = await worker.fetch(
    listaEsperaRequest({ ...VALID_APUNTARSE_BODY, accion: "otra_cosa" }),
    { MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.accion);
});

test("handleListaEspera: apuntarse rechaza payload incompleto (sin nombre/pista/fecha/horas) con 400 y campos", async () => {
  const response = await worker.fetch(
    listaEsperaRequest({ accion: "apuntarse", email: "qa@example.test" }),
    { MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.nombre);
  assert.ok(data.fields.pista);
  assert.ok(data.fields.fecha);
  assert.ok(data.fields.hora_inicio);
  assert.ok(data.fields.hora_fin);
});

test("handleListaEspera: apuntarse rechaza email inválido", async () => {
  const response = await worker.fetch(
    listaEsperaRequest({ ...VALID_APUNTARSE_BODY, email: "no-es-email" }),
    { MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.email);
});

test("handleListaEspera: apuntarse rechaza pista fuera de catálogo", async () => {
  const response = await worker.fetch(
    listaEsperaRequest({ ...VALID_APUNTARSE_BODY, pista: "Pista 99" }),
    { MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.pista);
});

test("handleListaEspera: salir NO exige nombre (solo identifica el slot a abandonar)", async () => {
  await withFakeFetch(
    async () => new Response(JSON.stringify({ ok: true, accion: "salir", removed: true }), { status: 200 }),
    async () => {
      const response = await worker.fetch(
        listaEsperaRequest(VALID_SALIR_BODY),
        { MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake" }
      );
      assert.equal(response.status, 200);
    }
  );
});

test("handleListaEspera: apuntarse reenvía a MAKE_LISTA_ESPERA_PISTA_WEBHOOK con accion/origen correctos", async () => {
  let capturedBody = null;
  let capturedUrl = null;

  await withFakeFetch(
    async (url, init) => {
      capturedUrl = String(url?.url || url);
      capturedBody = JSON.parse(init.body);
      return new Response(JSON.stringify({ ok: true, accion: "apuntarse", duplicate: false, orden_espera: 1, clave_espera: "x" }), { status: 200 });
    },
    async () => {
      const response = await worker.fetch(listaEsperaRequest(VALID_APUNTARSE_BODY), {
        MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake-espera",
      });
      const data = await response.json();

      assert.equal(response.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.duplicate, false);
      assert.equal(data.orden_espera, 1);
      assert.equal(capturedUrl, "https://hook.example.test/fake-espera");
      assert.equal(capturedBody.accion, "apuntarse");
      assert.equal(capturedBody.email, "qa-espera@example.test");
      assert.equal(capturedBody.pista, "Pista 2");
      assert.equal(capturedBody.fecha, "2026-09-25");
      assert.equal(capturedBody.hora_inicio, "09:00");
      assert.equal(capturedBody.hora_fin, "10:30");
      assert.equal(capturedBody.origen, "APP_CLUB_PADEL_04");
    }
  );
});

test("handleListaEspera: el Worker nunca inventa el resultado — pasa tal cual duplicate:true de Make (idempotencia)", async () => {
  await withFakeFetch(
    async () => new Response(JSON.stringify({ ok: true, accion: "apuntarse", duplicate: true, orden_espera: 1, clave_espera: "x" }), { status: 200 }),
    async () => {
      const response = await worker.fetch(listaEsperaRequest(VALID_APUNTARSE_BODY), {
        MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake-espera",
      });
      const data = await response.json();
      assert.equal(response.status, 200);
      assert.equal(data.duplicate, true);
    }
  );
});

test("handleListaEspera: nunca confirma éxito si el webhook de Make responde con error", async () => {
  await withFakeFetch(
    async () => new Response("Internal Error", { status: 500 }),
    async () => {
      const response = await worker.fetch(listaEsperaRequest(VALID_APUNTARSE_BODY), {
        MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake-espera",
      });
      const data = await response.json();
      assert.equal(response.status, 502);
      assert.equal(data.ok, false);
    }
  );
});

test("handleListaEspera: fallo de red hacia Make -> 502 NETWORK_ERROR, nunca cuelga", async () => {
  await withFakeFetch(
    async () => { throw new Error("network down"); },
    async () => {
      const response = await worker.fetch(listaEsperaRequest(VALID_APUNTARSE_BODY), {
        MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake-espera",
      });
      const data = await response.json();
      assert.equal(response.status, 502);
      assert.equal(data.code, "NETWORK_ERROR");
    }
  );
});

test("handleListaEspera: respuesta de Make no interpretable -> 502 seguro, sin fingir éxito", async () => {
  await withFakeFetch(
    async () => new Response("no es json", { status: 200 }),
    async () => {
      const response = await worker.fetch(listaEsperaRequest(VALID_APUNTARSE_BODY), {
        MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.example.test/fake-espera",
      });
      const data = await response.json();
      assert.equal(response.status, 502);
      assert.equal(data.ok, false);
    }
  );
});

// --- No rompe otros endpoints (regresión) ---

test("regresión: /api/jugadores/alta sigue respondiendo 503 seguro tras añadir lista de espera", async () => {
  const request = new Request("https://worker.test/api/jugadores/alta", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: "QA", apellidos: "Alta Test", email: "qa-alta@example.test", telefono: "600000000",
      fecha_nacimiento: "2000-01-01", nivel: "Iniciación", genero: "Otro", acepta_condiciones: true,
    }),
  });
  const response = await worker.fetch(request, {});
  const data = await response.json();
  assert.equal(response.status, 503);
  assert.equal(data.error, "Alta webhook not configured");
});

test("regresión: /api/pistas/cierre-temporal sigue respondiendo tras añadir lista de espera", async () => {
  const request = new Request("https://worker.test/api/pistas/cierre-temporal", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, {});
  assert.equal(response.status, 405);
});

test("regresión: /api/disponibilidad sigue respondiendo (no se rompió el dispatcher principal)", async () => {
  const request = new Request("https://worker.test/api/disponibilidad", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, {});
  assert.notEqual(response.status, 500);
});
