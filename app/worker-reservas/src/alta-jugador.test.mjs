import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";

// Auditoría 2026-08-07 (audit/alta-general-jugador-final-.../): tests de
// handleAltaJugador (worker-reservas/src/index.js) tras corregir el
// contrato — campos antes obligatorios (telefono/fecha_nacimiento/nivel/
// genero) pasan a opcionales, se genera/reenvía request_id, y las
// respuestas 400/409/500 que Make devuelve con intención ya no se colapsan
// en un 502 genérico. Ningún test hace una petición de red real:
// globalThis.fetch se sustituye por un stub local, restaurado siempre en
// el `finally`. Ningún token/credencial/email es real.

async function withFakeFetch(fakeFetchImpl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetchImpl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

function altaRequest(body, { headers = {} } = {}) {
  return new Request("https://worker.test/api/jugadores/alta", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const MINIMAL_VALID_BODY = {
  nombre: "QA",
  apellidos: "Alta Test",
  email: "qa-alta@example.test",
  acepta_condiciones: true,
};

const ENV = { MAKE_ALTA_JUGADOR_WEBHOOK: "https://hook.example.test/fake" };

test("handleAltaJugador: sin MAKE_ALTA_JUGADOR_WEBHOOK configurado -> 503, sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch sin MAKE_ALTA_JUGADOR_WEBHOOK configurado");
    },
    async () => {
      const response = await worker.fetch(altaRequest(MINIMAL_VALID_BODY), {});
      const data = await response.json();
      assert.equal(response.status, 503);
      assert.equal(data.ok, false);
      assert.equal(data.error, "Alta webhook not configured");
    }
  );
});

test("handleAltaJugador: telefono/fecha_nacimiento/nivel/genero AUSENTES -> ya no se rechaza (antes eran obligatorios)", async () => {
  await withFakeFetch(
    async (url, options) => {
      const body = JSON.parse(options.body);
      assert.equal(body.telefono, "");
      assert.equal(body.fecha_nacimiento, "");
      assert.equal(body.nivel, "");
      assert.equal(body.genero, "");
      return new Response(JSON.stringify({ ok: true, status: "CREATED", message: "ok", player_id: "p1", request_id: body.request_id }), { status: 201 });
    },
    async () => {
      const response = await worker.fetch(altaRequest(MINIMAL_VALID_BODY), ENV);
      assert.equal(response.status, 201);
    }
  );
});

test("handleAltaJugador: nombre/apellidos/email/acepta_condiciones siguen siendo obligatorios", async () => {
  const response = await worker.fetch(altaRequest({ nombre: "", apellidos: "", email: "no-es-email", acepta_condiciones: false }), ENV);
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.equal(data.ok, false);
  assert.equal(data.status, "VALIDATION_ERROR");
  assert.ok(data.fields.nombre);
  assert.ok(data.fields.apellidos);
  assert.ok(data.fields.email);
  assert.ok(data.fields.acepta_condiciones);
});

test("handleAltaJugador: fecha_nacimiento con formato inválido SÍ se rechaza cuando se envía", async () => {
  const response = await worker.fetch(
    altaRequest({ ...MINIMAL_VALID_BODY, fecha_nacimiento: "19-90-01" }),
    ENV
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.fecha_nacimiento);
});

test("handleAltaJugador: request_id generado por el Worker si la app no lo manda", async () => {
  await withFakeFetch(
    async (url, options) => {
      const body = JSON.parse(options.body);
      assert.ok(body.request_id, "el Worker debe generar un request_id");
      assert.match(body.request_id, /^[0-9a-f-]{36}$/i);
      return new Response(JSON.stringify({ ok: true, status: "CREATED", message: "ok", player_id: "p1" }), { status: 201 });
    },
    async () => {
      const response = await worker.fetch(altaRequest(MINIMAL_VALID_BODY), ENV);
      const data = await response.json();
      assert.ok(data.request_id, "la respuesta debe incluir request_id");
    }
  );
});

test("handleAltaJugador: request_id de la app se conserva y se reenvía a Make", async () => {
  await withFakeFetch(
    async (url, options) => {
      const body = JSON.parse(options.body);
      assert.equal(body.request_id, "req-fijo-de-prueba-123");
      return new Response(JSON.stringify({ ok: true, status: "CREATED", message: "ok", player_id: "p1", request_id: "req-fijo-de-prueba-123" }), { status: 201 });
    },
    async () => {
      const response = await worker.fetch(
        altaRequest({ ...MINIMAL_VALID_BODY, request_id: "req-fijo-de-prueba-123" }),
        ENV
      );
      const data = await response.json();
      assert.equal(data.request_id, "req-fijo-de-prueba-123");
    }
  );
});

test("handleAltaJugador: Make responde 409 (ya existe) -> el Worker reenvía 409 real, no 502", async () => {
  await withFakeFetch(
    async () => new Response(
      JSON.stringify({ ok: false, status: "PLAYER_ALREADY_EXISTS", message: "Ya existe un jugador activo con ese email.", request_id: "x" }),
      { status: 409 }
    ),
    async () => {
      const response = await worker.fetch(altaRequest(MINIMAL_VALID_BODY), ENV);
      const data = await response.json();
      assert.equal(response.status, 409);
      assert.equal(data.ok, false);
      assert.equal(data.status, "PLAYER_ALREADY_EXISTS");
    }
  );
});

test("handleAltaJugador: Make responde 400 (validación) -> el Worker reenvía 400 real, no 502", async () => {
  await withFakeFetch(
    async () => new Response(
      JSON.stringify({ ok: false, status: "VALIDATION_ERROR", message: "motivo", request_id: "x" }),
      { status: 400 }
    ),
    async () => {
      const response = await worker.fetch(altaRequest(MINIMAL_VALID_BODY), ENV);
      assert.equal(response.status, 400);
    }
  );
});

test("handleAltaJugador: Make responde 200 REACTIVATED -> el Worker reenvía 200 real", async () => {
  await withFakeFetch(
    async () => new Response(
      JSON.stringify({ ok: true, status: "REACTIVATED", message: "ok", player_id: "p1", request_id: "x" }),
      { status: 200 }
    ),
    async () => {
      const response = await worker.fetch(altaRequest(MINIMAL_VALID_BODY), ENV);
      const data = await response.json();
      assert.equal(response.status, 200);
      assert.equal(data.status, "REACTIVATED");
    }
  );
});

test("handleAltaJugador: Make devuelve un body no interpretable como JSON -> 502 genérico (comportamiento de respaldo)", async () => {
  await withFakeFetch(
    async () => new Response("<html>error inesperado</html>", { status: 500 }),
    async () => {
      const response = await worker.fetch(altaRequest(MINIMAL_VALID_BODY), ENV);
      const data = await response.json();
      assert.equal(response.status, 502);
      assert.equal(data.ok, false);
      assert.equal(data.status, "INTERNAL_ERROR");
    }
  );
});

test("handleAltaJugador: fallo real de red hacia Make (fetch lanza) -> 502 controlado, nunca cuelga", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("network down");
    },
    async () => {
      const response = await worker.fetch(altaRequest(MINIMAL_VALID_BODY), ENV);
      assert.equal(response.status, 502);
    }
  );
});

test("handleAltaJugador: método no permitido -> 405", async () => {
  const request = new Request("https://worker.test/api/jugadores/alta", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, ENV);
  assert.equal(response.status, 405);
});

test("handleAltaJugador: JSON inválido -> 400", async () => {
  const request = new Request("https://worker.test/api/jugadores/alta", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: "{ no es json",
  });
  const response = await worker.fetch(request, ENV);
  assert.equal(response.status, 400);
});
