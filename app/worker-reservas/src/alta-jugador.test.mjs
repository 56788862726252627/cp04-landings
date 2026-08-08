import test from "node:test";
import assert from "node:assert/strict";

import worker, { __resetIdempotencyStoreForTests } from "./index.js";

// Tests de regresión para handleAltaJugador (2026-08-08):
// A) 201 PLAYER_CREATED sigue funcionando.
// B) 409 PLAYER_ALREADY_EXISTS de Make se propaga como código de negocio.
// C) 5xx real de Make sigue siendo error técnico 502.
// D) No existe retry automático destructivo para el 409.
// E) El mensaje final de UI es específico ("Este jugador ya está registrado
//    y activo."), nunca "Make request failed".
//
// Ningún test aquí llama a red real: fetch global se sustituye por stubs.
// Ningún token ni secret real es expuesto.

const WORKER_ENV = {
  SUPABASE_URL: "https://fake.supabase.test",
  SUPABASE_ANON_KEY: "fake-anon-key",
  MAKE_ALTA_JUGADOR_WEBHOOK: "https://hook.eu1.make.com/fake-hook-for-tests",
  ALLOWED_ORIGIN: "http://localhost:5175",
  CP04_ENFORCE_ROLE_GATES: "false", // desactivado: no llama a Supabase en tests
};

const VALID_PAYLOAD = {
  nombre: "Test",
  apellidos: "Jugador",
  email: "test.alta@example.com",
  telefono: "600000100",
  fecha_nacimiento: "1990-01-01",
  nivel: "Intermedio",
  genero: "M",
  comentarios: "",
  acepta_condiciones: true,
  origen: "app",
};

function altaRequest(body = VALID_PAYLOAD) {
  return new Request("https://worker.test/api/jugadores/alta", {
    method: "POST",
    headers: {
      Origin: "http://localhost:5175",
      "Content-Type": "application/json",
      Authorization: "Bearer fake-staff-token",
    },
    body: JSON.stringify(body),
  });
}

function fakeResponse(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function withFakeFetch(fakeFetch, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetch;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

// Limpia la tienda de idempotencia entre tests para que ningún test bloquee
// el siguiente con la misma clave (email+teléfono).
function resetStore() {
  __resetIdempotencyStoreForTests();
}

// --- A) PLAYER_CREATED ---

test("alta: Make responde 200 OK -> Worker devuelve 200 ok:true con mensaje de éxito", async () => {
  resetStore();

  const response = await withFakeFetch(
    async () => fakeResponse(200, "Accepted"),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.message, "Jugador registrado correctamente");
});

// --- B) 409 PLAYER_ALREADY_EXISTS propagado como código de negocio ---

test("alta: Make responde 409 PLAYER_ALREADY_EXISTS -> Worker devuelve 409 con código de negocio, no 502", async () => {
  resetStore();

  const make409Body = {
    ok: false,
    status: "PLAYER_ALREADY_EXISTS",
    message: "Ya existe un jugador activo con este email.",
    player_id: "rec123abc",
    ID_Jugador: "42",
    email_jugador: "test.alta@example.com",
    request_id: "req-xyz",
  };

  const response = await withFakeFetch(
    async () => fakeResponse(409, make409Body),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 409, "debe preservar 409, no convertirlo en 502");
  assert.equal(data.ok, false);
  assert.equal(data.code, "PLAYER_ALREADY_EXISTS");
  assert.equal(data.message, "Este jugador ya está registrado y activo.");
  assert.equal(data.player_id, "rec123abc");
  assert.notEqual(data.error, "Make request failed", "nunca debe mostrar el error técnico genérico");
});

// --- E) Mensaje UI específico (test explícito de la frase española) ---

test("alta: 409 PLAYER_ALREADY_EXISTS -> el mensaje es en español y específico, nunca genérico", async () => {
  resetStore();

  const response = await withFakeFetch(
    async () =>
      fakeResponse(409, {
        status: "PLAYER_ALREADY_EXISTS",
        player_id: "recABC",
        email_jugador: "test.alta@example.com",
      }),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(data.message, "Este jugador ya está registrado y activo.");
  assert.equal(data.error, undefined, "no debe existir campo 'error' técnico en una respuesta de negocio");
});

// --- C) 5xx real de Make sigue siendo error técnico 502 ---

test("alta: Make responde 500 -> Worker devuelve 502 Make request failed (error técnico)", async () => {
  resetStore();

  const response = await withFakeFetch(
    async () => fakeResponse(500, { error: "Internal Server Error" }),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 502);
  assert.equal(data.ok, false);
  assert.equal(data.error, "Make request failed");
});

test("alta: Make responde 503 -> Worker devuelve 502 Make request failed (error técnico)", async () => {
  resetStore();

  const response = await withFakeFetch(
    async () => fakeResponse(503, "Service Unavailable"),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 502);
  assert.equal(data.ok, false);
  assert.equal(data.error, "Make request failed");
});

test("alta: Make es inalcanzable (red) -> Worker devuelve 502 Make unreachable (error técnico)", async () => {
  resetStore();

  const response = await withFakeFetch(
    async () => { throw new TypeError("Failed to fetch"); },
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 502);
  assert.equal(data.ok, false);
  assert.equal(data.error, "Make unreachable");
});

// --- D) Sin retry automático destructivo para el 409 ---

test("alta: 409 PLAYER_ALREADY_EXISTS -> Make se llama exactamente UNA vez, nunca se reintenta", async () => {
  resetStore();

  let makeCalls = 0;

  const response = await withFakeFetch(
    async () => {
      makeCalls += 1;
      return fakeResponse(409, {
        status: "PLAYER_ALREADY_EXISTS",
        player_id: "recRETRY",
        email_jugador: "test.alta@example.com",
      });
    },
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  assert.equal(makeCalls, 1, "el Worker debe llamar a Make exactamente una vez: nunca debe reintentar un 409");
  assert.equal(response.status, 409);
});

// --- Regresión: 409 con body no reconocido sigue siendo 502 (no se asume PLAYER_ALREADY_EXISTS) ---

test("alta: Make responde 409 con body distinto de PLAYER_ALREADY_EXISTS -> Worker devuelve 502 genérico", async () => {
  resetStore();

  const response = await withFakeFetch(
    async () => fakeResponse(409, { status: "OTRA_RAZON", message: "Conflicto inesperado de Make" }),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 502, "un 409 desconocido de Make no debe tratarse como PLAYER_ALREADY_EXISTS");
  assert.equal(data.error, "Make request failed");
});

// --- Fallback resiliente: body malformado (JSON inválido) pero texto contiene PLAYER_ALREADY_EXISTS ---

test("alta: Make responde 409 + JSON inválido pero texto contiene PLAYER_ALREADY_EXISTS -> Worker devuelve 409 negocio, nunca 502", async () => {
  resetStore();

  // Simula el caso real: Make incrusta un objeto Airtable dentro de un string JSON
  // produciendo un body que no se puede parsear con JSON.parse.
  const bodyMalformado =
    '{"ok":false,"status":"PLAYER_ALREADY_EXISTS","player_id":{"id":"recABC","fields":{}}.id,"request_id":"req-test"}';

  const response = await withFakeFetch(
    async () =>
      new Response(bodyMalformado, {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 409, "debe preservar 409 incluso con body malformado");
  assert.equal(data.ok, false);
  assert.equal(data.code, "PLAYER_ALREADY_EXISTS");
  assert.equal(data.message, "Este jugador ya está registrado y activo.");
  assert.equal(data.error, undefined, "nunca debe exponer el error técnico genérico");
  // player_id y email_jugador son null cuando el JSON no pudo parsearse
  assert.equal(data.player_id, null);
  assert.equal(data.email_jugador, null);
});

// --- Guardia de falso positivo: 409 con JSON inválido que NO contiene PLAYER_ALREADY_EXISTS ---

test("alta: Make responde 409 + JSON inválido SIN PLAYER_ALREADY_EXISTS -> Worker devuelve 502 fail-closed", async () => {
  resetStore();

  // Body malformado sin ninguna pista de PLAYER_ALREADY_EXISTS: debe quedar
  // como error técnico 502, nunca elevarse a error de negocio.
  const bodyMalformadoOtro = '{"ok":false,"status":{"id":"recXXX"}.id,"request_id":"req-2"}';

  const response = await withFakeFetch(
    async () =>
      new Response(bodyMalformadoOtro, {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 502, "409 con body inválido desconocido debe ser 502, no PLAYER_ALREADY_EXISTS");
  assert.equal(data.ok, false);
  assert.equal(data.error, "Make request failed");
  assert.equal(data.code, undefined, "no debe existir code de negocio en un error técnico");
});

// --- ESTADO_DESCONOCIDO: Make 500 + JSON empresarial válido ---

test("alta: Make 500 INTERNAL_ERROR con JSON válido -> Worker devuelve 500 con message y request_id, nunca 502", async () => {
  resetStore();

  const make500Body = {
    ok: false,
    status: "INTERNAL_ERROR",
    message: "No se pudo completar el alta",
    request_id: "req-estado-desconocido",
  };

  const response = await withFakeFetch(
    async () => fakeResponse(500, make500Body),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 500, "debe preservar HTTP 500 de Make, nunca convertir en 502");
  assert.equal(data.ok, false);
  assert.equal(data.code, "INTERNAL_ERROR");
  assert.equal(data.message, "No se pudo completar el alta");
  assert.equal(data.request_id, "req-estado-desconocido");
  assert.equal(data.error, undefined, "no debe existir campo 'error' técnico en respuesta empresarial");
});

// --- Make 500 con body inválido sigue siendo error técnico 502 ---

test("alta: Make 500 sin JSON válido -> Worker devuelve 502 genérico fail-closed", async () => {
  resetStore();

  const response = await withFakeFetch(
    async () =>
      new Response("Internal Server Error", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 502, "500 sin JSON empresarial debe quedar como error técnico 502");
  assert.equal(data.ok, false);
  assert.equal(data.error, "Make request failed");
  assert.equal(data.code, undefined, "no debe existir code de negocio cuando no hay JSON válido");
});

// --- Make 500 con JSON pero ok !== false no se promueve a negocio ---

test("alta: Make 500 con JSON pero ok:true -> Worker devuelve 502 fail-closed (guardia ok===false)", async () => {
  resetStore();

  const response = await withFakeFetch(
    async () => fakeResponse(500, { ok: true, message: "Inesperado" }),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 502, "500 con ok:true no debe promoverse a respuesta empresarial");
  assert.equal(data.error, "Make request failed");
});

// --- Sin retry automático ante Make 500 ---

test("alta: Make 500 INTERNAL_ERROR -> Make se llama exactamente UNA vez, sin retry automático", async () => {
  resetStore();

  let makeCalls = 0;

  const response = await withFakeFetch(
    async () => {
      makeCalls += 1;
      return fakeResponse(500, {
        ok: false,
        status: "INTERNAL_ERROR",
        message: "No se pudo completar el alta",
        request_id: "req-retry-test",
      });
    },
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  assert.equal(makeCalls, 1, "nunca debe reintentar un 500: llamada a Make exactamente una vez");
  assert.equal(response.status, 500);
});

// --- 200 PLAYER_REACTIVATED: sin regresión ---

test("alta: Make responde 200 REACTIVATED -> Worker devuelve 200 ok:true (sin regresión REACTIVACION)", async () => {
  resetStore();

  const make200Body = {
    ok: true,
    status: "REACTIVATED",
    message: "Jugador reactivado correctamente",
    player_id: "recREACTIVATED123",
    request_id: "req-reactivated",
  };

  const response = await withFakeFetch(
    async () => fakeResponse(200, make200Body),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.message, "Jugador registrado correctamente");
});

// --- VALIDATION_ERROR: Make 400 + JSON empresarial válido ---

test("alta: Make 400 VALIDATION_ERROR con JSON válido -> Worker devuelve 400 con code, message y request_id, nunca 502", async () => {
  resetStore();

  const make400Body = {
    ok: false,
    status: "VALIDATION_ERROR",
    message: "El email o la fecha de nacimiento no tienen un formato válido.",
    request_id: "req-validation-error",
  };

  const response = await withFakeFetch(
    async () => fakeResponse(400, make400Body),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 400, "debe preservar HTTP 400 de Make, nunca convertir en 502");
  assert.equal(data.ok, false);
  assert.equal(data.code, "VALIDATION_ERROR");
  assert.equal(data.message, "El email o la fecha de nacimiento no tienen un formato válido.");
  assert.equal(data.request_id, "req-validation-error");
  assert.equal(data.error, undefined, "no debe existir campo 'error' técnico en respuesta empresarial");
});

// --- Make 400 con body inválido sigue siendo error técnico 502 ---

test("alta: Make 400 sin JSON válido -> Worker devuelve 502 genérico fail-closed", async () => {
  resetStore();

  const response = await withFakeFetch(
    async () =>
      new Response("Bad Request", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      }),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 502, "400 sin JSON empresarial debe quedar como error técnico 502");
  assert.equal(data.ok, false);
  assert.equal(data.error, "Make request failed");
  assert.equal(data.code, undefined);
});

// --- Make 400 con ok !== false no se promueve a negocio ---

test("alta: Make 400 con JSON pero ok:true -> Worker devuelve 502 fail-closed (guardia ok===false)", async () => {
  resetStore();

  const response = await withFakeFetch(
    async () => fakeResponse(400, { ok: true, message: "Bad request inesperado" }),
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  const data = await response.json();
  assert.equal(response.status, 502, "400 con ok:true no debe promoverse a respuesta empresarial");
  assert.equal(data.error, "Make request failed");
  assert.equal(data.code, undefined);
});

// --- Sin retry automático ante Make 400 ---

test("alta: Make 400 VALIDATION_ERROR -> Make se llama exactamente UNA vez, sin retry automático", async () => {
  resetStore();

  let makeCalls = 0;

  const response = await withFakeFetch(
    async () => {
      makeCalls += 1;
      return fakeResponse(400, {
        ok: false,
        status: "VALIDATION_ERROR",
        message: "El nombre es obligatorio.",
        request_id: "req-no-retry",
      });
    },
    () => worker.fetch(altaRequest(), WORKER_ENV)
  );

  assert.equal(makeCalls, 1, "nunca debe reintentar un 400: llamada a Make exactamente una vez");
  assert.equal(response.status, 400);
});
