import test from "node:test";
import assert from "node:assert/strict";

import {
  cp04FetchOcupadas,
  cp04CheckIdempotency,
  cp04CheckCrearReservaRateLimit,
  __resetCrearReservaRateLimitForTests,
} from "./index.js";
import worker from "./index.js";

// Todos los tests de este archivo son deterministas y no hacen ninguna
// petición de red real: cuando hace falta simular una respuesta de
// Airtable, se sustituye temporalmente globalThis.fetch por un stub local
// y se restaura siempre en el `finally`. Ningún token/URL es real.

const FAKE_AIRTABLE_ENV = {
  AIRTABLE_TOKEN: "fake-token-not-real",
  AIRTABLE_BASE_ID: "appFAKEBASE00000",
  AIRTABLE_TABLE_ID: "tblFAKETABLE00000",
};

async function withFakeFetch(fakeFetchImpl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetchImpl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

// cp04FetchOcupadas -------------------------------------------------------

test("cp04FetchOcupadas: Airtable no configurado -> not_configured, sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch si Airtable no está configurado");
    },
    async () => {
      const result = await cp04FetchOcupadas({}, "2026-08-01");
      assert.deepEqual(result, { ok: false, reason: "not_configured" });
    }
  );
});

test("cp04FetchOcupadas: escapa un intento de inyección en el filtro antes de enviarlo", async () => {
  let capturedUrl = null;

  await withFakeFetch(
    async (url) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    },
    async () => {
      const injection = '2026-08-01") , OR(1=1';
      const result = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, injection);
      assert.equal(result.ok, true);
    }
  );

  assert.ok(capturedUrl, "debería haberse capturado la URL enviada a fetch");
  const formula = new URL(capturedUrl).searchParams.get("filterByFormula");
  // La comilla original debe llegar escapada (\"), nunca sin escapar rompiendo el filtro.
  assert.ok(formula.includes('2026-08-01\\")'), `formula debería contener la comilla escapada, recibido: ${formula}`);
  assert.ok(!formula.includes('2026-08-01")'), "la comilla no debe llegar sin escapar");
});

test("cp04FetchOcupadas: Airtable responde con error HTTP -> ok:false, reason airtable_error, se propaga status/details internamente (no al cliente, eso lo filtra el handler)", async () => {
  await withFakeFetch(
    async () => new Response(JSON.stringify({ error: "INVALID_FILTER_BY_FORMULA" }), { status: 422 }),
    async () => {
      const result = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-08-01");
      assert.equal(result.ok, false);
      assert.equal(result.reason, "airtable_error");
      assert.equal(result.status, 422);
    }
  );
});

test("cp04FetchOcupadas: fallo de red (fetch lanza) -> ok:false, reason network_error", async () => {
  await withFakeFetch(
    async () => {
      throw new TypeError("network down");
    },
    async () => {
      const result = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-08-01");
      assert.deepEqual(result, { ok: false, reason: "network_error" });
    }
  );
});

test("cp04FetchOcupadas: éxito -> extrae ocupadas desde records[].fields.clave_slot", async () => {
  await withFakeFetch(
    async () =>
      new Response(
        JSON.stringify({
          records: [
            { fields: { clave_slot: "2026-08-01|Pista 1|10:00" } },
            { fields: { clave_slot: "2026-08-01|Pista 2|11:00" } },
            { fields: {} }, // sin clave_slot: se descarta (Boolean filter)
          ],
        }),
        { status: 200 }
      ),
    async () => {
      const result = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-08-01");
      assert.equal(result.ok, true);
      assert.deepEqual(result.ocupadas, ["2026-08-01|Pista 1|10:00", "2026-08-01|Pista 2|11:00"]);
      assert.equal(result.records.length, 3);
    }
  );
});

// cp04CheckIdempotency -----------------------------------------------------

function makeFakeCaches() {
  const store = new Set();
  return {
    default: {
      async match(request) {
        return store.has(request.url) ? new Response("1") : undefined;
      },
      async put(request) {
        store.add(request.url);
      },
    },
  };
}

async function withFakeCaches(run) {
  const original = globalThis.caches;
  globalThis.caches = makeFakeCaches();
  try {
    await run();
  } finally {
    if (original === undefined) {
      delete globalThis.caches;
    } else {
      globalThis.caches = original;
    }
  }
}

test("cp04CheckIdempotency: accion no reconocida -> duplicate:false sin tocar la Cache API (no revienta aunque caches no exista)", async () => {
  assert.equal(globalThis.caches, undefined, "precondición: caches no debería existir en este entorno de test");
  const request = new Request("https://worker.test/api/reservas", { method: "POST" });
  const result = await cp04CheckIdempotency(request, { accion: "consultar_disponibilidad" });
  assert.equal(result.duplicate, false);
});

test("cp04CheckIdempotency: primera solicitud no es duplicado; tras markDone, la misma solicitud sí lo es", async () => {
  await withFakeCaches(async () => {
    const request = new Request("https://worker.test/api/reservas", { method: "POST" });
    const payload = {
      accion: "crear_reserva",
      reserva: { fecha: "2026-08-01", pista: "Pista 1", hora: "10:00" },
      jugador: { email: "ana@example.test" },
    };

    const first = await cp04CheckIdempotency(request, payload);
    assert.equal(first.duplicate, false);
    await first.markDone();

    const second = await cp04CheckIdempotency(request, payload);
    assert.equal(second.duplicate, true);
  });
});

test("cp04CheckIdempotency: una solicitud distinta (otra hora) no se confunde con la anterior", async () => {
  await withFakeCaches(async () => {
    const request = new Request("https://worker.test/api/reservas", { method: "POST" });
    const payloadA = {
      accion: "crear_reserva",
      reserva: { fecha: "2026-08-01", pista: "Pista 1", hora: "10:00" },
      jugador: { email: "ana@example.test" },
    };
    const payloadB = {
      accion: "crear_reserva",
      reserva: { fecha: "2026-08-01", pista: "Pista 1", hora: "11:00" },
      jugador: { email: "ana@example.test" },
    };

    const a = await cp04CheckIdempotency(request, payloadA);
    await a.markDone();

    const b = await cp04CheckIdempotency(request, payloadB);
    assert.equal(b.duplicate, false);
  });
});

// Integración /api/disponibilidad vía worker.fetch (sin red real) ----------

const ENV_BASE = { ALLOWED_ORIGIN: "http://localhost:5173" };

function disponibilidadRequest(fecha) {
  const qs = fecha === undefined ? "" : `?fecha=${encodeURIComponent(fecha)}`;
  return new Request(`https://worker.test/api/disponibilidad${qs}`, {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
}

test("Integración /api/disponibilidad: domingo -> 200 cerrado:true, sin necesitar Airtable configurado", async () => {
  const response = await worker.fetch(disponibilidadRequest("2026-08-02"), ENV_BASE); // domingo real
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.cerrado, true);
  assert.deepEqual(body.ocupadas, []);
});

test("Integración /api/disponibilidad: sin parámetro fecha -> 400", async () => {
  const response = await worker.fetch(disponibilidadRequest(undefined), ENV_BASE);
  assert.equal(response.status, 400);
});

test("Integración /api/disponibilidad: formato de fecha inválido -> 400 (defensa añadida en Lote 2)", async () => {
  const response = await worker.fetch(disponibilidadRequest("2026/08/03"), ENV_BASE);
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
});

test("Integración /api/disponibilidad: Airtable no configurado -> 500 con detalle de qué falta", async () => {
  const response = await worker.fetch(disponibilidadRequest("2026-08-03"), ENV_BASE);
  const body = await response.json();
  assert.equal(response.status, 500);
  assert.equal(body.configured.token, false);
});

test("Integración /api/disponibilidad: error de Airtable -> 500 genérico, sin reenviar detalles internos (Lote 2)", async () => {
  await withFakeFetch(
    async () => new Response(JSON.stringify({ error: { type: "INVALID_FILTER_BY_FORMULA", detalleInterno: "tabla-secreta" } }), { status: 422 }),
    async () => {
      const env = { ...ENV_BASE, ...FAKE_AIRTABLE_ENV };
      const response = await worker.fetch(disponibilidadRequest("2026-08-03"), env);
      const body = await response.json();

      assert.equal(response.status, 500);
      assert.equal(body.error, "Error consultando disponibilidad en Airtable");
      assert.equal(body.details, undefined, "no debe reenviar el cuerpo crudo de error de Airtable");
      assert.equal(body.status, undefined, "no debe reenviar el status crudo de Airtable");
    }
  );
});

test("Integración /api/disponibilidad: éxito -> 200 con ocupadas calculadas desde Airtable (mockeado)", async () => {
  await withFakeFetch(
    async () =>
      new Response(
        JSON.stringify({
          records: [
            {
              fields: {
                clave_slot: "2026-08-03|Pista 1|10:00",
                estado_reserva: "confirmada",
                fecha_reserva: "2026-08-03",
                hora_inicio: "10:00",
                hora_fin: "11:00",
                Pista: "Pista 1",
              },
            },
          ],
        }),
        { status: 200 }
      ),
    async () => {
      const env = { ...ENV_BASE, ...FAKE_AIRTABLE_ENV };
      const response = await worker.fetch(disponibilidadRequest("2026-08-03"), env);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.deepEqual(body.ocupadas, ["2026-08-03|Pista 1|10:00"]);
      assert.equal(body.total, 1);
    }
  );
});

// Integración POST /api/reservas: rate limit de crear_reserva (sin red, la
// validación falla antes de llegar a idempotencia/Airtable/Make) ----------

test("Integración POST /api/reservas: rate limit de crear_reserva devuelve 429 tras el máximo configurado", async () => {
  __resetCrearReservaRateLimitForTests();

  function crearReservaRequest() {
    return new Request("https://worker.test/api/reservas", {
      method: "POST",
      headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "crear_reserva" }), // payload incompleto a propósito: no debe importar, el rate limit corta antes que la validación
    });
  }

  let lastStatus = null;
  for (let i = 0; i < 30; i += 1) {
    const response = await worker.fetch(crearReservaRequest(), ENV_BASE);
    lastStatus = response.status;
  }
  // Con payload incompleto, las 30 primeras deberían fallar validación (422), no 429.
  assert.equal(lastStatus, 422);

  const response31 = await worker.fetch(crearReservaRequest(), ENV_BASE);
  const body31 = await response31.json();
  assert.equal(response31.status, 429);
  assert.equal(body31.error, "RATE_LIMITED");

  __resetCrearReservaRateLimitForTests();
});

test("cp04CheckCrearReservaRateLimit: queda accesible y determinista con timestamps inyectados (regresión Lote 2)", () => {
  __resetCrearReservaRateLimitForTests();
  const now = 1_000_000;
  assert.equal(cp04CheckCrearReservaRateLimit(now), true);
  __resetCrearReservaRateLimitForTests();
});
