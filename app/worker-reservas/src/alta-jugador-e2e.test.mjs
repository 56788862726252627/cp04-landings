import test from "node:test";
import assert from "node:assert/strict";

import worker, { __resetIdempotencyStoreForTests } from "./index.js";

// AUDITORIA 2026-08-01/02 (audit/airtable-e2e-20260801/ALTA-JUGADOR-E2E.md,
// audit/make-50-operational-readiness-20260802/06-BLOCKERS.md): valida el
// tramo App/Worker de Alta de Jugador (validación de payload + mapeo de
// campos + idempotencia hacia el webhook de Make) con datos 100%
// sintéticos, marcados E2E_TEST_CP04_20260801. Ningún test de este archivo
// hace una petición de red real: globalThis.fetch se sustituye por un stub
// local, restaurado siempre en el `finally`. No hay ninguna llamada real a
// Make ni a Airtable en este archivo — ese tramo (Make -> Airtable) es
// opaco desde este repo (sin tabla/base conocida) y queda documentado como
// pendiente en el informe, no simulado como si fuera real.

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

const SYNTHETIC_BODY = {
  nombre: "E2E",
  apellidos: "Test CP04",
  email: "e2e-test-cp04@example.test",
  telefono: "600000000",
  fecha_nacimiento: "2000-01-01",
  nivel: "Iniciación",
  genero: "Otro",
  comentarios: "E2E_TEST_CP04_20260801",
  acepta_condiciones: true,
  origen: "E2E_TEST_CP04_20260801",
};

test("handleAltaJugador: sin MAKE_ALTA_JUGADOR_WEBHOOK configurado -> 503 seguro, sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch sin MAKE_ALTA_JUGADOR_WEBHOOK configurado");
    },
    async () => {
      const response = await worker.fetch(altaRequest(SYNTHETIC_BODY), {});
      const data = await response.json();
      assert.equal(response.status, 503);
      assert.equal(data.ok, false);
      assert.equal(data.error, "Alta webhook not configured");
    }
  );
});

test("handleAltaJugador: validación rechaza payload incompleto (sin nivel ni acepta_condiciones) con 400 y campos", async () => {
  const response = await worker.fetch(
    altaRequest({
      nombre: "E2E",
      apellidos: "Test CP04",
      email: "e2e-test-cp04@example.test",
      telefono: "600000000",
      fecha_nacimiento: "2000-01-01",
      genero: "Otro",
      comentarios: "E2E_TEST_CP04_20260801",
    }),
    { MAKE_ALTA_JUGADOR_WEBHOOK: "https://hook.example.test/fake" }
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.equal(data.ok, false);
  assert.ok(data.fields.nivel);
  assert.ok(data.fields.acepta_condiciones);
});

test("handleAltaJugador: payload sintético E2E_TEST_CP04_20260801 válido -> normaliza y reenvía a MAKE_ALTA_JUGADOR_WEBHOOK", async () => {
  __resetIdempotencyStoreForTests();
  let capturedUrl = null;
  let capturedBody = null;

  await withFakeFetch(
    async (url, init) => {
      capturedUrl = String(url?.url || url);
      capturedBody = JSON.parse(init.body);
      return new Response("OK", { status: 200 });
    },
    async () => {
      const response = await worker.fetch(altaRequest(SYNTHETIC_BODY), {
        MAKE_ALTA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-alta",
      });
      const data = await response.json();

      assert.equal(response.status, 200);
      assert.equal(data.ok, true);
      assert.equal(capturedUrl, "https://hook.example.test/fake-alta");
      assert.deepEqual(capturedBody, {
        nombre: "E2E",
        apellidos: "Test CP04",
        email: "e2e-test-cp04@example.test",
        telefono: "600000000",
        fecha_nacimiento: "2000-01-01",
        nivel: "Iniciación",
        genero: "Otro",
        comentarios: "E2E_TEST_CP04_20260801",
        acepta_condiciones: true,
        origen: "E2E_TEST_CP04_20260801",
      });
    }
  );
});

// CORRECCIÓN 2026-08-02 (audit/make-50-operational-readiness-20260802/06-BLOCKERS.md):
// hallazgo original — a diferencia de la reserva (que sí tiene idempotencia
// vía cp04BuildIdempotencyKey, ver handleReservas), handleAltaJugador
// reenviaba dos veces el mismo payload a Make sin deduplicar. Corregido
// reutilizando el mismo mecanismo ya probado (cp04IsIdempotentDuplicate /
// cp04MarkIdempotentSuccess / TTL 3 min), no un adaptador nuevo — ver
// cp04BuildAltaJugadorIdempotencyKey en index.js. Esto protege el tramo
// App->Worker; lo que haga Make/Airtable del otro lado sigue siendo opaco
// desde este repo.
test("handleAltaJugador: segundo envío idéntico dentro del TTL -> 409 IDEMPOTENT_DUPLICATE, no reenvía a Make", async () => {
  __resetIdempotencyStoreForTests();
  let callCount = 0;

  await withFakeFetch(
    async () => {
      callCount += 1;
      return new Response("OK", { status: 200 });
    },
    async () => {
      const first = await worker.fetch(altaRequest(SYNTHETIC_BODY), {
        MAKE_ALTA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-alta",
      });
      const second = await worker.fetch(altaRequest(SYNTHETIC_BODY), {
        MAKE_ALTA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-alta",
      });
      const secondData = await second.json();

      assert.equal(first.status, 200);
      assert.equal(second.status, 409);
      assert.equal(secondData.ok, false);
      assert.equal(secondData.code, "IDEMPOTENT_DUPLICATE");
      assert.equal(secondData.duplicated, true);
      assert.equal(callCount, 1, "el segundo envío no debería llegar a fetch/Make");
    }
  );
});

test("handleAltaJugador: tras un fallo de Make (502), la clave no queda marcada -> el reintento legítimo sí llega a fetch", async () => {
  __resetIdempotencyStoreForTests();
  let callCount = 0;

  await withFakeFetch(
    async () => {
      callCount += 1;
      return new Response("fallo simulado", { status: 500 });
    },
    async () => {
      const first = await worker.fetch(altaRequest(SYNTHETIC_BODY), {
        MAKE_ALTA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-alta",
      });
      const retry = await worker.fetch(altaRequest(SYNTHETIC_BODY), {
        MAKE_ALTA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-alta",
      });

      assert.equal(first.status, 502);
      assert.equal(retry.status, 502);
      assert.equal(callCount, 2, "un fallo previo no debe bloquear un reintento legítimo");
    }
  );
});

test("handleAltaJugador: si Make responde con error, el Worker no confirma el alta (502)", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    async () => new Response("fallo simulado", { status: 500 }),
    async () => {
      const response = await worker.fetch(altaRequest(SYNTHETIC_BODY), {
        MAKE_ALTA_JUGADOR_WEBHOOK: "https://hook.example.test/fake-alta",
      });
      const data = await response.json();
      assert.equal(response.status, 502);
      assert.equal(data.ok, false);
    }
  );
});
