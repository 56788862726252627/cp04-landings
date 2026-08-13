import test from "node:test";
import assert from "node:assert/strict";

import worker, { __resetIdempotencyStoreForTests } from "./index.js";
import { requireRoles } from "../auth/authorization.js";

const SUPABASE_ENV = {
  SUPABASE_URL: "https://example-project.supabase.co",
  SUPABASE_ANON_KEY: "anon-key-not-real",
};

function verifierFor(result) {
  return async () => result;
}

// PASO 07C (2026-07-19): tests de handleBajaJugador (worker-reservas/src/index.js),
// réplica del patrón de Alta de Jugador. Ningún test de este archivo hace
// una petición de red real: cuando hace falta simular la respuesta del
// webhook de Make, se sustituye temporalmente globalThis.fetch por un stub
// local, restaurado siempre en el `finally`. Ninguna URL/token es real.

async function withFakeFetch(fakeFetchImpl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetchImpl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

function bajaRequest(body, { headers = {} } = {}) {
  return new Request("https://worker.test/api/jugadores/baja", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  nombre: "QA",
  apellidos: "Baja Test",
  email: "qa-baja@example.test",
  telefono: "600000000",
  motivo_baja: "Voluntaria",
  fecha_baja: "2026-07-19",
  promocionar_siguiente_si_aplica: true,
  observaciones: "Prueba automatizada, sin datos reales.",
  origen: "APP_CLUB_PADEL_04",
  accion: "baja_jugador",
};

// --- Sin gate de rol activo (ENV sin CP04_ENFORCE_ROLE_GATES) ---

test("handleBajaJugador: sin MAKE_BAJA_JUGADOR_WEBHOOK configurado -> 503 seguro, sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch sin MAKE_BAJA_JUGADOR_WEBHOOK configurado");
    },
    async () => {
      const response = await worker.fetch(bajaRequest(VALID_BODY), {});
      const data = await response.json();
      assert.equal(response.status, 503);
      assert.equal(data.ok, false);
      assert.equal(data.error, "Baja webhook not configured");
    }
  );
});

test("handleBajaJugador: método no permitido -> 405", async () => {
  const request = new Request("https://worker.test/api/jugadores/baja", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, { MAKE_BAJA_JUGADOR_WEBHOOK: "https://hook.example.test/fake" });
  assert.equal(response.status, 405);
});

test("handleBajaJugador: JSON inválido -> 400", async () => {
  const request = new Request("https://worker.test/api/jugadores/baja", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: "{ no es json",
  });
  const response = await worker.fetch(request, { MAKE_BAJA_JUGADOR_WEBHOOK: "https://hook.example.test/fake" });
  assert.equal(response.status, 400);
});

test("handleBajaJugador: validación rechaza payload incompleto (sin motivo_baja ni fecha_baja) con 400 y campos", async () => {
  const response = await worker.fetch(
    bajaRequest({ nombre: "QA", apellidos: "Test", email: "qa@example.test", telefono: "600000000" }),
    { MAKE_BAJA_JUGADOR_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.equal(data.ok, false);
  assert.ok(data.fields.motivo_baja);
  assert.ok(data.fields.fecha_baja);
});

test("handleBajaJugador: payload válido reenvía a MAKE_BAJA_JUGADOR_WEBHOOK con accion='baja_jugador'", async () => {
  __resetIdempotencyStoreForTests();
  let capturedBody = null;
  let capturedUrl = null;

  await withFakeFetch(
    async (url, init) => {
      capturedUrl = String(url?.url || url);
      capturedBody = JSON.parse(init.body);
      return new Response("OK", { status: 200 });
    },
    async () => {
      const response = await worker.fetch(bajaRequest(VALID_BODY), {
        MAKE_BAJA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-baja",
      });
      const data = await response.json();

      assert.equal(response.status, 200);
      assert.equal(data.ok, true);
      assert.equal(capturedUrl, "https://hook.example.test/fake-baja");
      assert.equal(capturedBody.accion, "baja_jugador");
      assert.equal(capturedBody.motivo_baja, "Voluntaria");
      assert.equal(capturedBody.promocionar_siguiente_si_aplica, true);
    }
  );
});

test("handleBajaJugador: nunca confirma éxito si el webhook de Make responde con error (502, ok:false)", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    async () => new Response("Internal Error", { status: 500 }),
    async () => {
      const response = await worker.fetch(bajaRequest(VALID_BODY), {
        MAKE_BAJA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-baja",
      });
      const data = await response.json();

      assert.equal(response.status, 502);
      assert.equal(data.ok, false);
      assert.notEqual(data.message, "Baja de jugador registrada correctamente");
    }
  );
});

// AUDITORÍA 2026-08-02 (Baja de Jugador, oleada operativa): handleBajaJugador
// no tiene ni puede tener una comprobación local de "¿existe este jugador?"
// — no hay lookup a Airtable en este handler (mismo diseño que Alta:
// Make/Airtable es la única fuente de verdad de existencia, fuera del
// alcance de este Worker). Lo único verificable desde aquí es que, si Make
// rechaza la solicitud (por ejemplo porque el jugador no existe en su
// tabla), el Worker nunca confirma la baja como realizada — mismo criterio
// que el test de "error controlado de Make" de arriba, con un status
// distinto para dejar explícito el caso "no encontrado".
test("handleBajaJugador: jugador inexistente (Make responde 404) -> nunca confirma baja, no es un 200 falso", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    async () => new Response(JSON.stringify({ error: "player_not_found" }), { status: 404 }),
    async () => {
      const response = await worker.fetch(bajaRequest(VALID_BODY), {
        MAKE_BAJA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-baja",
      });
      const data = await response.json();

      assert.equal(response.status, 502);
      assert.equal(data.ok, false);
      assert.notEqual(data.message, "Baja de jugador registrada correctamente");
    }
  );
});

// CORRECCIÓN 2026-08-02 (audit/make-50-operational-readiness-20260802/06-BLOCKERS.md):
// mismo hallazgo y misma corrección que Alta de Jugador — handleBajaJugador
// reenviaba duplicados sin deduplicar. Ahora reutiliza
// cp04IsIdempotentDuplicate/cp04MarkIdempotentSuccess (mismo mecanismo que
// handleReservas y handleAltaJugador).
test("handleBajaJugador: segundo envío idéntico dentro del TTL -> 409 IDEMPOTENT_DUPLICATE, no reenvía a Make", async () => {
  __resetIdempotencyStoreForTests();
  let callCount = 0;

  await withFakeFetch(
    async () => {
      callCount += 1;
      return new Response("OK", { status: 200 });
    },
    async () => {
      const first = await worker.fetch(bajaRequest(VALID_BODY), {
        MAKE_BAJA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-baja",
      });
      const second = await worker.fetch(bajaRequest(VALID_BODY), {
        MAKE_BAJA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-baja",
      });
      const secondData = await second.json();

      assert.equal(first.status, 200);
      assert.equal(second.status, 409);
      assert.equal(secondData.code, "IDEMPOTENT_DUPLICATE");
      assert.equal(callCount, 1, "el segundo envío no debería llegar a fetch/Make");
    }
  );
});

// --- Con gate de rol activo (CP04_ENFORCE_ROLE_GATES="true") ---

test("handleBajaJugador: con CP04_ENFORCE_ROLE_GATES=true y sin token, se bloquea con 401 antes de llegar al handler", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch: el gate de rol debe bloquear antes");
    },
    async () => {
      const response = await worker.fetch(bajaRequest(VALID_BODY), {
        MAKE_BAJA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-baja",
        CP04_ENFORCE_ROLE_GATES: "true",
      });
      const data = await response.json();
      assert.equal(response.status, 401);
      assert.equal(data.ok, false);
      assert.equal(data.error, "MISSING_TOKEN");
    }
  );
});

// El handler de /api/jugadores/baja solo llama a
// requireRoles(request, env, ["STAFF", "ADMIN", "SUPPORT"]) (ver index.js) —
// su contrato de autorización es exactamente el que ya prueba requireRoles
// de forma genérica en worker-reservas/auth/authorization.test.mjs. Aquí se
// deja explícito para esta ruta concreta, mismo patrón que el test
// equivalente de Centro Técnico en ese archivo.
test("handleBajaJugador: rol no autorizado (PLAYER) es denegado (403 INSUFFICIENT_ROLE)", async () => {
  const gate = await requireRoles(
    bajaRequest(VALID_BODY, { headers: { Authorization: "Bearer p" } }),
    SUPABASE_ENV,
    ["STAFF", "ADMIN", "SUPPORT"],
    { verify: verifierFor({ ok: true, userId: "1", email: "jugador@demo.local", role: "PLAYER" }) }
  );
  assert.equal(gate.ok, false);
  assert.equal(gate.status, 403);
  assert.equal(gate.body.error, "INSUFFICIENT_ROLE");
});

test("handleBajaJugador: STAFF, ADMIN y SUPPORT están autorizados por el mismo gate", async () => {
  for (const role of ["STAFF", "ADMIN", "SUPPORT"]) {
    const gate = await requireRoles(
      bajaRequest(VALID_BODY, { headers: { Authorization: "Bearer t" } }),
      SUPABASE_ENV,
      ["STAFF", "ADMIN", "SUPPORT"],
      { verify: verifierFor({ ok: true, userId: "1", email: "staff@demo.local", role }) }
    );
    assert.equal(gate.ok, true, `${role} debería estar autorizado`);
    assert.equal(gate.auth.role, role);
  }
});

test("handleBajaJugador: OPTIONS siempre responde 204, incluso con el gate de rol activo", async () => {
  const request = new Request("https://worker.test/api/jugadores/baja", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, {
    MAKE_BAJA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-baja",
    CP04_ENFORCE_ROLE_GATES: "true",
  });
  assert.equal(response.status, 204);
});

// --- No rompe Alta de Jugador (regresión) ---

test("regresión: /api/jugadores/alta sigue respondiendo 503 seguro sin MAKE_ALTA_JUGADOR_WEBHOOK, tras añadir baja", async () => {
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
