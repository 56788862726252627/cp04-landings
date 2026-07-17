import test from "node:test";
import assert from "node:assert/strict";

import {
  cp04FetchOcupadas,
  cp04CheckIdempotency,
  cp04CheckCrearReservaRateLimit,
  __resetCrearReservaRateLimitForTests,
  cp04GetCachedAvailability,
  cp04SetCachedAvailability,
  cp04InvalidateAvailabilityCache,
  __resetAvailabilityCacheForTests,
  CP04_AVAILABILITY_CACHE_TTL_MS,
  cp04IsAirtableRateLimited,
  cp04BuildAirtableDegradedResponse,
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
  __resetAvailabilityCacheForTests();
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
  __resetAvailabilityCacheForTests();
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
  __resetAvailabilityCacheForTests();
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
  __resetAvailabilityCacheForTests();
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
  __resetAvailabilityCacheForTests();
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

// Caché de disponibilidad (PASO 06B) ---------------------------------------
//
// cp04GetCachedAvailability/cp04SetCachedAvailability se prueban de forma
// aislada y determinista con un `now` inyectado (mismo patrón que
// cp04CheckCrearReservaRateLimit): sin sleeps reales, sin depender del
// reloj de verdad.

test("Caché de disponibilidad: primer acceso a cp04FetchOcupadas consulta la fuente (fetch real, no caché)", async () => {
  __resetAvailabilityCacheForTests();
  let fetchCalls = 0;

  await withFakeFetch(
    async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify({ records: [{ fields: { clave_slot: "2026-09-01|Pista 1|10:00" } }] }), { status: 200 });
    },
    async () => {
      const result = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-09-01");
      assert.equal(result.ok, true);
      assert.equal(fetchCalls, 1, "el primer acceso debe llamar a fetch exactamente una vez");
    }
  );
});

test("Caché de disponibilidad: segundo acceso a la misma fecha dentro del TTL usa la caché, no vuelve a llamar a fetch", async () => {
  __resetAvailabilityCacheForTests();
  let fetchCalls = 0;

  await withFakeFetch(
    async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify({ records: [{ fields: { clave_slot: "2026-09-02|Pista 1|10:00" } }] }), { status: 200 });
    },
    async () => {
      const first = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-09-02");
      const second = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-09-02");

      assert.equal(fetchCalls, 1, "la segunda llamada debe servirse desde caché, sin tocar fetch de nuevo");
      assert.deepEqual(second, first, "el resultado cacheado debe ser idéntico al original");
    }
  );
});

test("Caché de disponibilidad: cp04GetCachedAvailability/cp04SetCachedAvailability respetan el TTL exacto con timestamps inyectados", () => {
  __resetAvailabilityCacheForTests();
  const start = 1_000_000;
  const okResult = { ok: true, records: [], ocupadas: [] };

  cp04SetCachedAvailability("2026-09-03", okResult, start);

  // Justo antes de expirar: sigue en caché.
  const beforeExpiry = cp04GetCachedAvailability("2026-09-03", start + CP04_AVAILABILITY_CACHE_TTL_MS - 1);
  assert.deepEqual(beforeExpiry, okResult);

  // En el instante exacto del TTL (o después): ya ha expirado.
  const atExpiry = cp04GetCachedAvailability("2026-09-03", start + CP04_AVAILABILITY_CACHE_TTL_MS);
  assert.equal(atExpiry, null, "el TTL debe expirar la entrada, no servirla indefinidamente");
});

test("Caché de disponibilidad: tras expirar el TTL, cp04FetchOcupadas vuelve a llamar a fetch", async () => {
  __resetAvailabilityCacheForTests();
  let fetchCalls = 0;
  const start = 2_000_000;

  await withFakeFetch(
    async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    },
    async () => {
      // Simula la primera consulta cacheándola manualmente con un `now` de partida.
      cp04SetCachedAvailability("2026-09-04", { ok: true, records: [], ocupadas: [] }, start);
      assert.equal(fetchCalls, 0);

      // Dentro del TTL: cp04GetCachedAvailability sí la sirve (no pasa por fetch).
      assert.notEqual(cp04GetCachedAvailability("2026-09-04", start + 1000), null);

      // Fuera del TTL: la entrada ya no está — una llamada real a
      // cp04FetchOcupadas en ese momento tendría que ir a la fuente.
      assert.equal(cp04GetCachedAvailability("2026-09-04", start + CP04_AVAILABILITY_CACHE_TTL_MS + 1), null);

      const result = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-09-04");
      assert.equal(result.ok, true);
      assert.equal(fetchCalls, 1, "tras expirar el TTL, cp04FetchOcupadas debe volver a consultar la fuente");
    }
  );
});

test("Caché de disponibilidad: un error (incluido 429) nunca se cachea como disponibilidad válida", async () => {
  __resetAvailabilityCacheForTests();
  let fetchCalls = 0;

  await withFakeFetch(
    async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify({ error: "RATE_LIMITED" }), { status: 429 });
    },
    async () => {
      const first = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-09-05");
      assert.equal(first.ok, false);
      assert.equal(first.status, 429);

      const second = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-09-05");
      assert.equal(second.ok, false);
      assert.equal(fetchCalls, 2, "un error no debe quedar cacheado: la segunda llamada debe reintentar la fuente");
    }
  );

  // También a nivel unitario: cp04SetCachedAvailability debe rechazar un resultado no-ok.
  cp04SetCachedAvailability("2026-09-05", { ok: false, reason: "airtable_error", status: 429 });
  assert.equal(cp04GetCachedAvailability("2026-09-05"), null, "un resultado ok:false nunca debe quedar en caché");
});

test("Caché de disponibilidad: cp04InvalidateAvailabilityCache vacía toda la caché (usado tras crear/cancelar/reprogramar)", () => {
  __resetAvailabilityCacheForTests();
  const now = 3_000_000;
  cp04SetCachedAvailability("2026-09-06", { ok: true, records: [], ocupadas: [] }, now);
  cp04SetCachedAvailability("2026-09-07", { ok: true, records: [], ocupadas: [] }, now);

  assert.notEqual(cp04GetCachedAvailability("2026-09-06", now), null);
  assert.notEqual(cp04GetCachedAvailability("2026-09-07", now), null);

  cp04InvalidateAvailabilityCache();

  assert.equal(cp04GetCachedAvailability("2026-09-06", now), null);
  assert.equal(cp04GetCachedAvailability("2026-09-07", now), null);
});

test("Integración: crear_reserva con éxito invalida la caché de disponibilidad (la siguiente consulta vuelve a la fuente)", async () => {
  __resetAvailabilityCacheForTests();
  __resetCrearReservaRateLimitForTests();

  // Precondición: la fecha de la reserva ya está en caché (como si alguien
  // hubiera consultado /api/disponibilidad justo antes).
  cp04SetCachedAvailability("2026-09-08", { ok: true, records: [], ocupadas: [] });
  assert.notEqual(cp04GetCachedAvailability("2026-09-08"), null);

  // handleReservas también pasa por cp04CheckIdempotency (usa caches.default,
  // la Cache API de Workers) — se simula igual que en los tests de
  // idempotencia de más abajo, si no, revienta en este entorno Node.
  await withFakeCaches(async () => {
    await withFakeFetch(
      async (url) => {
        const target = String(url?.url || url);
        // Revalidación de disponibilidad dentro de handleReservas: éxito, sin ocupadas.
        if (target.includes("api.airtable.com")) {
          return new Response(JSON.stringify({ records: [] }), { status: 200 });
        }
        // Reenvío a Make: no configurado en ENV_BASE, no debería llegar aquí.
        throw new Error("no debería reenviarse a Make sin MAKE_RESERVAS_WEBHOOK configurado");
      },
      async () => {
        const request = new Request("https://worker.test/api/reservas", {
          method: "POST",
          headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
          body: JSON.stringify({
            accion: "crear_reserva",
            jugador: { nombre: "QA Cache", apellidos: "Test", email: "qa-cache@example.test", telefono: "600000000" },
            reserva: { fecha: "2026-09-08", pista: "Pista 1", hora: "08:00", hora_fin: "09:00", modalidad: "libre", nivel: "intermedio", duracion_minutos: 60, precio_total: 20 },
            clave_reserva: "QA_CACHE_TEST_INVALIDATION_12345",
            origen: "test",
            club: "Club Pádel 04",
          }),
        });

        const env = { ...ENV_BASE, ...FAKE_AIRTABLE_ENV };
        const response = await worker.fetch(request, env);
        assert.equal(response.status, 200);
      }
    );
  });

  assert.equal(
    cp04GetCachedAvailability("2026-09-08"),
    null,
    "tras crear_reserva, la caché de esa fecha debe haberse invalidado"
  );

  __resetCrearReservaRateLimitForTests();
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
  __resetAvailabilityCacheForTests();
  const response = await worker.fetch(disponibilidadRequest("2026-08-03"), ENV_BASE);
  const body = await response.json();
  assert.equal(response.status, 500);
  assert.equal(body.configured.token, false);
});

test("Integración /api/disponibilidad: error de Airtable -> 500 genérico, sin reenviar detalles internos (Lote 2)", async () => {
  __resetAvailabilityCacheForTests();
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
  __resetAvailabilityCacheForTests();
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

// Modo degradado Airtable 429 (PASO 06C) ------------------------------------

test("cp04IsAirtableRateLimited: detecta un 429 directo por status, sin necesitar texto", () => {
  assert.equal(cp04IsAirtableRateLimited(429, ""), true);
  assert.equal(cp04IsAirtableRateLimited(429, undefined), true);
});

test("cp04IsAirtableRateLimited: detecta el texto PUBLIC_API_BILLING_LIMIT_EXCEEDED aunque el status no sea exactamente 429", () => {
  const texto = "API billing plan limit exceeded. You've reached the maximum number of requests allowed for this month. PUBLIC_API_BILLING_LIMIT_EXCEEDED";
  assert.equal(cp04IsAirtableRateLimited(422, texto), true);
  assert.equal(cp04IsAirtableRateLimited(null, texto), true);
});

test("cp04IsAirtableRateLimited: detecta RateLimitError (el nombre de error que reporta Make, ver Paso 05D) en el texto", () => {
  const texto = JSON.stringify({ error: { name: "RateLimitError", message: "[429] " } });
  assert.equal(cp04IsAirtableRateLimited(200, texto), true, "Make puede envolver el 429 real de Airtable bajo su propio status de aceptación del webhook");
});

test("cp04IsAirtableRateLimited: un error genérico o 'no configurado' NO se confunde con un bloqueo de cuota", () => {
  assert.equal(cp04IsAirtableRateLimited(422, "INVALID_FILTER_BY_FORMULA"), false);
  assert.equal(cp04IsAirtableRateLimited(500, ""), false);
  assert.equal(cp04IsAirtableRateLimited(null, "not_configured"), false);
});

test("cp04BuildAirtableDegradedResponse: forma exacta pedida por la misión, sin filtrar el detalle técnico al cliente", () => {
  const originalError = console.error;
  const logged = [];
  console.error = (...args) => logged.push(args);

  let response;
  try {
    response = cp04BuildAirtableDegradedResponse({ origen: "test", status: 429, secretoInterno: "no-debe-salir-al-cliente" });
  } finally {
    console.error = originalError;
  }

  assert.deepEqual(response, {
    ok: false,
    code: "AIRTABLE_RATE_LIMIT",
    retryable: true,
    reserva_confirmada: false,
    message: "El sistema de reservas está temporalmente saturado. Inténtalo de nuevo más tarde o contacta con recepción.",
  });

  // El detalle técnico se loguea server-side (para diagnóstico), pero
  // nunca forma parte de la respuesta JSON que ve el cliente.
  assert.ok(logged.length >= 1, "debe loguear el detalle técnico server-side");
  assert.equal(JSON.stringify(response).includes("secretoInterno"), false, "el detalle técnico no debe filtrarse en la respuesta al cliente");
});

test("Integración /api/disponibilidad: Airtable responde 429 -> 503 en modo degradado, no el 500 genérico", async () => {
  __resetAvailabilityCacheForTests();
  await withFakeFetch(
    async () => new Response(JSON.stringify({ error: { type: "PUBLIC_API_BILLING_LIMIT_EXCEEDED" } }), { status: 429 }),
    async () => {
      const env = { ...ENV_BASE, ...FAKE_AIRTABLE_ENV };
      const response = await worker.fetch(disponibilidadRequest("2026-09-09"), env);
      const body = await response.json();

      assert.equal(response.status, 503);
      assert.equal(body.ok, false);
      assert.equal(body.code, "AIRTABLE_RATE_LIMIT");
      assert.equal(body.retryable, true);
      assert.equal(body.reserva_confirmada, false);
      assert.match(body.message, /temporalmente saturado/);
    }
  );
});

test("Integración POST /api/reservas: revalidación con Airtable en 429 -> 503 degradado, NUNCA 'forwarded' (no hay confirmación falsa)", async () => {
  __resetAvailabilityCacheForTests();
  __resetCrearReservaRateLimitForTests();

  await withFakeCaches(async () => {
    await withFakeFetch(
      async (url) => {
        const target = String(url?.url || url);
        if (target.includes("api.airtable.com")) {
          return new Response(JSON.stringify({ error: "API billing plan limit exceeded" }), { status: 429 });
        }
        throw new Error("no debería llegar a reenviarse a Make si la revalidación detecta el bloqueo de cuota");
      },
      async () => {
        const request = new Request("https://worker.test/api/reservas", {
          method: "POST",
          headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
          body: JSON.stringify({
            accion: "crear_reserva",
            jugador: { nombre: "QA Degradado", apellidos: "Test", email: "qa-degradado@example.test", telefono: "600000000" },
            reserva: { fecha: "2026-09-09", pista: "Pista 1", hora: "08:00", hora_fin: "09:00", modalidad: "libre", nivel: "intermedio", duracion_minutos: 60, precio_total: 20 },
            clave_reserva: "QA_CACHE_TEST_DEGRADADO_67890",
            origen: "test",
            club: "Club Pádel 04",
          }),
        });

        const env = { ...ENV_BASE, ...FAKE_AIRTABLE_ENV };
        const response = await worker.fetch(request, env);
        const body = await response.json();

        assert.equal(response.status, 503);
        assert.equal(body.code, "AIRTABLE_RATE_LIMIT");
        assert.equal(body.reserva_confirmada, false);
        // Nunca debe aparecer la forma de éxito de una reserva normal.
        assert.notEqual(body.status, "forwarded");
        assert.equal(body.make, undefined, "no debe reenviarse a Make: el fallo se detecta antes, en la revalidación");
      }
    );
  });

  __resetCrearReservaRateLimitForTests();
});

test("Integración POST /api/reservas: Make reporta RateLimitError de forma síncrona en el cuerpo -> 503 degradado (defensa adicional, ver nota en forwardToMake)", async () => {
  __resetAvailabilityCacheForTests();
  __resetCrearReservaRateLimitForTests();

  await withFakeCaches(async () => {
    await withFakeFetch(
      async (url) => {
        const target = String(url?.url || url);
        if (target.includes("api.airtable.com")) {
          // Revalidación de disponibilidad: sin conflicto, deja pasar hacia Make.
          return new Response(JSON.stringify({ records: [] }), { status: 200 });
        }
        if (target.includes("make.com") || target === "https://hooks.example.test/make-reservas") {
          return new Response(JSON.stringify({ error: { name: "RateLimitError", message: "[429] " } }), { status: 200 });
        }
        throw new Error(`fetch inesperado a ${target}`);
      },
      async () => {
        const request = new Request("https://worker.test/api/reservas", {
          method: "POST",
          headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
          body: JSON.stringify({
            accion: "crear_reserva",
            jugador: { nombre: "QA Make", apellidos: "Degradado", email: "qa-make-degradado@example.test", telefono: "600000000" },
            reserva: { fecha: "2026-09-10", pista: "Pista 2", hora: "09:00", hora_fin: "10:00", modalidad: "libre", nivel: "intermedio", duracion_minutos: 60, precio_total: 20 },
            clave_reserva: "QA_CACHE_TEST_MAKE_RATELIMIT_1",
            origen: "test",
            club: "Club Pádel 04",
          }),
        });

        const env = { ...ENV_BASE, ...FAKE_AIRTABLE_ENV, MAKE_RESERVAS_WEBHOOK: "https://hooks.example.test/make-reservas" };
        const response = await worker.fetch(request, env);
        const body = await response.json();

        assert.equal(response.status, 503);
        assert.equal(body.code, "AIRTABLE_RATE_LIMIT");
        assert.equal(body.reserva_confirmada, false);
        assert.notEqual(body.status, "forwarded");
      }
    );
  });

  __resetCrearReservaRateLimitForTests();
});
