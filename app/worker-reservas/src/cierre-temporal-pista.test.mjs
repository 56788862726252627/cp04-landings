import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";

// PASO 07E (2026-07-19): tests de handleCierreTemporalPista
// (worker-reservas/src/index.js), réplica del patrón de Alta/Baja de
// Jugador. Ningún test de este archivo hace una petición de red real:
// cuando hace falta simular la respuesta del webhook de Make, se sustituye
// temporalmente globalThis.fetch por un stub local, restaurado siempre en
// el `finally`. Ninguna URL/token es real.

async function withFakeFetch(fakeFetchImpl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetchImpl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

function cierreRequest(body, { headers = {} } = {}) {
  return new Request("https://worker.test/api/pistas/cierre-temporal", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  pista: "Pista 2",
  fecha_inicio: "2026-07-20",
  hora_inicio: "09:00",
  fecha_fin: "2026-07-20",
  hora_fin: "13:00",
  motivo: "mantenimiento",
  observaciones: "Prueba automatizada, sin datos reales.",
  creado_por: "qa-staff@example.test",
  rol_origen: "STAFF",
  notify_players: true,
};

// --- Sin gate de rol activo (ENV sin CP04_ENFORCE_ROLE_GATES) ---

test("handleCierreTemporalPista: sin MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK configurado -> 503 seguro, sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch sin MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK configurado");
    },
    async () => {
      const response = await worker.fetch(cierreRequest(VALID_BODY), {});
      const data = await response.json();
      assert.equal(response.status, 503);
      assert.equal(data.ok, false);
      assert.equal(data.error, "Cierre temporal webhook not configured");
    }
  );
});

test("handleCierreTemporalPista: método no permitido -> 405", async () => {
  const request = new Request("https://worker.test/api/pistas/cierre-temporal", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, { MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake" });
  assert.equal(response.status, 405);
});

test("handleCierreTemporalPista: JSON inválido -> 400", async () => {
  const request = new Request("https://worker.test/api/pistas/cierre-temporal", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: "{ no es json",
  });
  const response = await worker.fetch(request, { MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake" });
  assert.equal(response.status, 400);
});

test("handleCierreTemporalPista: validación rechaza payload incompleto (sin pista, fechas, motivo) con 400 y campos", async () => {
  const response = await worker.fetch(
    cierreRequest({ creado_por: "qa@example.test", rol_origen: "STAFF" }),
    { MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.equal(data.ok, false);
  assert.ok(data.fields.pista);
  assert.ok(data.fields.fecha_inicio);
  assert.ok(data.fields.hora_inicio);
  assert.ok(data.fields.fecha_fin);
  assert.ok(data.fields.hora_fin);
  assert.ok(data.fields.motivo);
});

test("handleCierreTemporalPista: rechaza motivo fuera de la lista permitida", async () => {
  const response = await worker.fetch(
    cierreRequest({ ...VALID_BODY, motivo: "capricho" }),
    { MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.motivo);
});

test("handleCierreTemporalPista: rechaza fecha_fin anterior a fecha_inicio", async () => {
  const response = await worker.fetch(
    cierreRequest({ ...VALID_BODY, fecha_inicio: "2026-07-20", fecha_fin: "2026-07-19" }),
    { MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.fecha_fin);
});

test("handleCierreTemporalPista: rechaza hora_fin <= hora_inicio en el mismo día", async () => {
  const response = await worker.fetch(
    cierreRequest({ ...VALID_BODY, fecha_inicio: "2026-07-20", fecha_fin: "2026-07-20", hora_inicio: "10:00", hora_fin: "09:00" }),
    { MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.hora_fin);
});

test("handleCierreTemporalPista: rechaza rol_origen fuera de ADMIN/STAFF/SUPPORT", async () => {
  const response = await worker.fetch(
    cierreRequest({ ...VALID_BODY, rol_origen: "PLAYER" }),
    { MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.rol_origen);
});

test("handleCierreTemporalPista: acepta pista='todas' (cierre de todas las pistas)", async () => {
  await withFakeFetch(
    async () => new Response("OK", { status: 200 }),
    async () => {
      const response = await worker.fetch(
        cierreRequest({ ...VALID_BODY, pista: "todas" }),
        { MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake" }
      );
      assert.equal(response.status, 200);
    }
  );
});

test("handleCierreTemporalPista: payload válido reenvía a MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK con accion/estado/origen correctos y nunca confirma cierre real", async () => {
  let capturedBody = null;
  let capturedUrl = null;

  await withFakeFetch(
    async (url, init) => {
      capturedUrl = String(url?.url || url);
      capturedBody = JSON.parse(init.body);
      return new Response("OK", { status: 200 });
    },
    async () => {
      const response = await worker.fetch(cierreRequest(VALID_BODY), {
        MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake-cierre",
      });
      const data = await response.json();

      assert.equal(response.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.estado, "pendiente_confirmacion");
      assert.doesNotMatch(data.message, /pista cerrada/i);
      assert.equal(capturedUrl, "https://hook.example.test/fake-cierre");
      assert.equal(capturedBody.accion, "cierre_temporal_pista");
      assert.equal(capturedBody.pista, "Pista 2");
      assert.equal(capturedBody.fecha_inicio, "2026-07-20");
      assert.equal(capturedBody.hora_inicio, "09:00");
      assert.equal(capturedBody.fecha_fin, "2026-07-20");
      assert.equal(capturedBody.hora_fin, "13:00");
      assert.equal(capturedBody.motivo, "mantenimiento");
      assert.equal(capturedBody.origen, "APP_CLUB_PADEL_04");
      assert.equal(capturedBody.estado, "pendiente_confirmacion");
      assert.equal(capturedBody.bloquear_reservas, true);
      assert.equal(capturedBody.notify_players, true);
    }
  );
});

test("handleCierreTemporalPista: nunca confirma éxito si el webhook de Make responde con error (502, ok:false)", async () => {
  await withFakeFetch(
    async () => new Response("Internal Error", { status: 500 }),
    async () => {
      const response = await worker.fetch(cierreRequest(VALID_BODY), {
        MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake-cierre",
      });
      const data = await response.json();

      assert.equal(response.status, 502);
      assert.equal(data.ok, false);
      assert.notEqual(data.estado, "confirmado");
    }
  );
});

// --- Con gate de rol activo (CP04_ENFORCE_ROLE_GATES="true") ---

test("handleCierreTemporalPista: con CP04_ENFORCE_ROLE_GATES=true y sin token, se bloquea con 401 antes de llegar al handler", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch: el gate de rol debe bloquear antes");
    },
    async () => {
      const response = await worker.fetch(cierreRequest(VALID_BODY), {
        MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake-cierre",
        CP04_ENFORCE_ROLE_GATES: "true",
      });
      const data = await response.json();
      assert.equal(response.status, 401);
      assert.equal(data.ok, false);
      assert.equal(data.error, "MISSING_TOKEN");
    }
  );
});

test("handleCierreTemporalPista: OPTIONS siempre responde 204, incluso con el gate de rol activo", async () => {
  const request = new Request("https://worker.test/api/pistas/cierre-temporal", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, {
    MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake-cierre",
    CP04_ENFORCE_ROLE_GATES: "true",
  });
  assert.equal(response.status, 204);
});

// --- No rompe Alta/Baja de Jugador ni API Reservas (regresión) ---

test("regresión: /api/jugadores/alta sigue respondiendo 503 seguro sin MAKE_ALTA_JUGADOR_WEBHOOK, tras añadir cierre temporal", async () => {
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

test("regresión: /api/jugadores/baja sigue respondiendo 503 seguro sin MAKE_BAJA_JUGADOR_WEBHOOK, tras añadir cierre temporal", async () => {
  const request = new Request("https://worker.test/api/jugadores/baja", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: "QA", apellidos: "Baja Test", email: "qa-baja@example.test", telefono: "600000000",
      motivo_baja: "Voluntaria", fecha_baja: "2026-07-19",
    }),
  });
  const response = await worker.fetch(request, {});
  const data = await response.json();
  assert.equal(response.status, 503);
  assert.equal(data.error, "Baja webhook not configured");
});

test("regresión: /api/disponibilidad sigue respondiendo (no se rompió el dispatcher principal)", async () => {
  const request = new Request("https://worker.test/api/disponibilidad", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, {});
  assert.notEqual(response.status, 500);
});
