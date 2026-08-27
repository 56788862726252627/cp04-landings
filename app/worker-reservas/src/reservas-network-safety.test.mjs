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
  __resetAvailabilityInFlightForTests,
  CP04_AVAILABILITY_CACHE_TTL_MS,
  cp04ResolveRetryBackoffMs,
  CP04_AIRTABLE_RETRY_DEFAULT_BACKOFF_MS,
  CP04_AIRTABLE_RETRY_MAX_BACKOFF_MS,
  cp04IsAirtableRateLimited,
  cp04BuildAirtableDegradedResponse,
  cp04BuildIdempotencyKey,
  cp04IsIdempotentDuplicate,
  cp04MarkIdempotentSuccess,
  cp04BuildIdempotentDuplicateResponse,
  __resetIdempotencyStoreForTests,
  CP04_IDEMPOTENCY_TTL_MS,
  cp04GetRequestId,
  cp04HashIdempotencyKey,
  cp04LogTechnicalEvent,
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

// Single-flight + reintento con backoff (reparación definitiva rate limit,
// 2026-08-25) --------------------------------------------------------------

test("Single-flight: N llamadas concurrentes a cp04FetchOcupadas para la misma fecha comparten una sola consulta real", async () => {
  __resetAvailabilityCacheForTests();
  __resetAvailabilityInFlightForTests();
  let fetchCalls = 0;
  let resolveFetch;
  const gate = new Promise((resolve) => { resolveFetch = resolve; });

  await withFakeFetch(
    async () => {
      fetchCalls += 1;
      await gate; // las 5 llamadas concurrentes deben quedar esperando esta misma promesa sin disparar un segundo fetch
      return new Response(JSON.stringify({ records: [{ fields: { clave_slot: "2026-10-01|Pista 1|10:00" } }] }), { status: 200 });
    },
    async () => {
      const calls = Array.from({ length: 5 }, () => cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-10-01"));
      // Deja que las 5 lleguen a `await fetch(...)` antes de destrabar la respuesta.
      await new Promise((resolve) => setTimeout(resolve, 0));
      resolveFetch();
      const results = await Promise.all(calls);

      assert.equal(fetchCalls, 1, "5 solicitudes concurrentes para la misma fecha deben compartir una sola llamada real a Airtable");
      for (const result of results) {
        assert.deepEqual(result, results[0], "todas las llamadas concurrentes deben recibir el mismo resultado");
      }
    }
  );
});

test("Single-flight: fechas distintas SÍ disparan consultas independientes en paralelo", async () => {
  __resetAvailabilityCacheForTests();
  __resetAvailabilityInFlightForTests();
  const fetchedDates = [];

  await withFakeFetch(
    async (url) => {
      const formula = new URL(url).searchParams.get("filterByFormula");
      fetchedDates.push(formula.includes("2026-10-02") ? "2026-10-02" : "2026-10-03");
      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    },
    async () => {
      await Promise.all([
        cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-10-02"),
        cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-10-03"),
      ]);
      assert.equal(fetchedDates.length, 2, "fechas distintas no deben coalescerse entre sí");
    }
  );
});

test("Single-flight: tras resolverse (éxito o error), la siguiente llamada ya no comparte la promesa anterior", async () => {
  __resetAvailabilityCacheForTests();
  __resetAvailabilityInFlightForTests();
  let fetchCalls = 0;

  await withFakeFetch(
    async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    },
    async () => {
      await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-10-04");
      __resetAvailabilityCacheForTests(); // fuerza a que la 2ª llamada no se sirva desde la caché de 30s
      await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-10-04");
      assert.equal(fetchCalls, 2, "una vez resuelta la promesa en curso, se elimina del mapa de in-flight y la siguiente llamada consulta de nuevo");
    }
  );
});

test("Reintento con backoff: un 429 sin Retry-After se reintenta una vez con el backoff por defecto, nunca en bucle", async () => {
  __resetAvailabilityCacheForTests();
  __resetAvailabilityInFlightForTests();
  let fetchCalls = 0;
  const sleeps = [];

  await withFakeFetch(
    async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify({ error: "RATE_LIMITED" }), { status: 429 });
    },
    async () => {
      const result = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-10-05", {
        sleep: async (ms) => { sleeps.push(ms); },
      });

      assert.equal(fetchCalls, 2, "debe intentarlo exactamente 2 veces: el original + 1 reintento, nunca más");
      assert.deepEqual(sleeps, [CP04_AIRTABLE_RETRY_DEFAULT_BACKOFF_MS], "sin Retry-After, debe esperar el backoff fijo por defecto exactamente una vez");
      assert.equal(result.ok, false);
      assert.equal(result.status, 429);
    }
  );
});

test("Reintento con backoff: un 429 con Retry-After respeta ese valor (acotado al máximo permitido)", async () => {
  __resetAvailabilityCacheForTests();
  __resetAvailabilityInFlightForTests();
  const sleeps = [];

  await withFakeFetch(
    async () => new Response(JSON.stringify({ error: "RATE_LIMITED" }), { status: 429, headers: { "Retry-After": "1" } }),
    async () => {
      await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-10-06", {
        sleep: async (ms) => { sleeps.push(ms); },
      });
      assert.deepEqual(sleeps, [1000], "Retry-After: 1 (segundo) debe traducirse a 1000ms de espera");
    }
  );
});

test("Reintento con backoff: un Retry-After mayor que el máximo permitido se acota, no se espera en bloque el valor completo", async () => {
  __resetAvailabilityCacheForTests();
  __resetAvailabilityInFlightForTests();
  const sleeps = [];

  await withFakeFetch(
    async () => new Response(JSON.stringify({ error: "RATE_LIMITED" }), { status: 429, headers: { "Retry-After": "120" } }),
    async () => {
      await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-10-07", {
        sleep: async (ms) => { sleeps.push(ms); },
      });
      assert.deepEqual(sleeps, [CP04_AIRTABLE_RETRY_MAX_BACKOFF_MS], "un Retry-After de 120s debe acotarse al máximo, nunca esperarse tal cual");
    }
  );
});

test("Reintento con backoff: si el reintento sí tiene éxito, el resultado final es ok:true y sí se cachea", async () => {
  __resetAvailabilityCacheForTests();
  __resetAvailabilityInFlightForTests();
  let fetchCalls = 0;

  await withFakeFetch(
    async () => {
      fetchCalls += 1;
      if (fetchCalls === 1) {
        return new Response(JSON.stringify({ error: "RATE_LIMITED" }), { status: 429 });
      }
      return new Response(JSON.stringify({ records: [{ fields: { clave_slot: "2026-10-08|Pista 1|10:00" } }] }), { status: 200 });
    },
    async () => {
      const result = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-10-08", { sleep: async () => {} });
      assert.equal(fetchCalls, 2);
      assert.equal(result.ok, true);
      assert.deepEqual(result.ocupadas, ["2026-10-08|Pista 1|10:00"]);

      // Ya cacheado: una tercera llamada no debe volver a tocar fetch.
      await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-10-08", { sleep: async () => {} });
      assert.equal(fetchCalls, 2, "el resultado exitoso del reintento debe quedar cacheado igual que un éxito directo");
    }
  );
});

test("Reintento con backoff: un fallo de red en el reintento -> ok:false, reason network_error (nunca lanza)", async () => {
  __resetAvailabilityCacheForTests();
  __resetAvailabilityInFlightForTests();
  let fetchCalls = 0;

  await withFakeFetch(
    async () => {
      fetchCalls += 1;
      if (fetchCalls === 1) {
        return new Response(JSON.stringify({ error: "RATE_LIMITED" }), { status: 429 });
      }
      throw new TypeError("network down mid-retry");
    },
    async () => {
      const result = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-10-09", { sleep: async () => {} });
      assert.deepEqual(result, { ok: false, reason: "network_error" });
    }
  );
});

test("cp04ResolveRetryBackoffMs: valores no numéricos, ausentes o <= 0 caen al backoff por defecto", () => {
  assert.equal(cp04ResolveRetryBackoffMs(null), CP04_AIRTABLE_RETRY_DEFAULT_BACKOFF_MS);
  assert.equal(cp04ResolveRetryBackoffMs(undefined), CP04_AIRTABLE_RETRY_DEFAULT_BACKOFF_MS);
  assert.equal(cp04ResolveRetryBackoffMs("0"), CP04_AIRTABLE_RETRY_DEFAULT_BACKOFF_MS);
  assert.equal(cp04ResolveRetryBackoffMs("-5"), CP04_AIRTABLE_RETRY_DEFAULT_BACKOFF_MS);
  assert.equal(cp04ResolveRetryBackoffMs("no-numero"), CP04_AIRTABLE_RETRY_DEFAULT_BACKOFF_MS);
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
  const noSleep = { sleep: async () => {} };

  await withFakeFetch(
    async () => {
      fetchCalls += 1;
      return new Response(JSON.stringify({ error: "RATE_LIMITED" }), { status: 429 });
    },
    async () => {
      // Cada llamada a cp04FetchOcupadas hace 2 intentos de fetch (el
      // reintento acotado ante un 429 real, ver CP04_AIRTABLE_RETRY_*):
      // 2 llamadas x 2 intentos = 4.
      const first = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-09-05", noSleep);
      assert.equal(first.ok, false);
      assert.equal(first.status, 429);

      const second = await cp04FetchOcupadas(FAKE_AIRTABLE_ENV, "2026-09-05", noSleep);
      assert.equal(second.ok, false);
      assert.equal(fetchCalls, 4, "un error no debe quedar cacheado: la segunda llamada debe reintentar la fuente (2 intentos cada una)");
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

// Idempotencia de reservas (PASO 06D) ---------------------------------------

const MAKE_URL = "https://hooks.example.test/make-reservas";

function crearReservaBody(overrides = {}) {
  return {
    accion: "crear_reserva",
    jugador: { nombre: "QA Idem", apellidos: "Test", email: "qa-idem@example.test", telefono: "600000001" },
    reserva: { fecha: "2026-09-11", pista: "Pista 1", hora: "08:00", hora_fin: "09:00", modalidad: "libre", nivel: "intermedio", duracion_minutos: 60, precio_total: 20 },
    origen: "test",
    club: "Club Pádel 04",
    ...overrides,
  };
}

function reservaRequest(body) {
  return new Request("https://worker.test/api/reservas", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Dispatcher de fetch que distingue Airtable (revalidación de disponibilidad,
// siempre "sin ocupadas" salvo que se indique lo contrario) de Make (siempre
// 200 salvo que se indique lo contrario), contando llamadas a cada uno por
// separado — así se puede comprobar de forma directa cuántas veces se llegó
// realmente a reenviar a Make.
function makeCountingFetch({ airtableStatus = 200, airtableBody = { records: [] }, makeStatus = 200, makeBody = { ok: true } } = {}) {
  const calls = { airtable: 0, make: 0, other: 0 };
  const fetchImpl = async (url) => {
    const target = String(url?.url || url);
    if (target.includes("api.airtable.com")) {
      calls.airtable += 1;
      return new Response(JSON.stringify(airtableBody), { status: airtableStatus });
    }
    if (target === MAKE_URL) {
      calls.make += 1;
      return new Response(JSON.stringify(makeBody), { status: makeStatus });
    }
    calls.other += 1;
    throw new Error(`fetch inesperado a ${target}`);
  };
  return { calls, fetchImpl };
}

async function runReservaFlow(body, opts) {
  const { calls, fetchImpl } = makeCountingFetch(opts);
  let response;
  await withFakeCaches(async () => {
    await withFakeFetch(fetchImpl, async () => {
      const env = { ...ENV_BASE, ...FAKE_AIRTABLE_ENV, MAKE_RESERVAS_WEBHOOK: MAKE_URL };
      response = await worker.fetch(reservaRequest(body), env);
    });
  });
  const json = await response.json();
  return { response, json, calls };
}

test("Idempotencia: dos crear_reserva idénticas (sin clave_reserva, se deriva) -> la segunda no llega a forwardToMake", async () => {
  __resetAvailabilityCacheForTests();
  __resetCrearReservaRateLimitForTests();
  __resetIdempotencyStoreForTests();

  const body = crearReservaBody({ clave_reserva: undefined });

  const first = await runReservaFlow(body);
  assert.equal(first.response.status, 200);
  assert.equal(first.calls.make, 1);

  const second = await runReservaFlow(body);
  assert.equal(second.response.status, 409);
  assert.equal(second.json.code, "IDEMPOTENT_DUPLICATE");
  assert.equal(second.json.duplicated, true);
  assert.equal(second.json.reserva_confirmada, false);
  assert.equal(second.calls.make, 0, "la segunda solicitud no debe reenviarse a Make en absoluto");

  __resetCrearReservaRateLimitForTests();
  __resetIdempotencyStoreForTests();
});

test("Idempotencia: dos crear_reserva con distinta hora sí se procesan las dos (claves distintas)", async () => {
  __resetAvailabilityCacheForTests();
  __resetCrearReservaRateLimitForTests();
  __resetIdempotencyStoreForTests();

  const a = crearReservaBody({ reserva: { ...crearReservaBody().reserva, hora: "08:00", hora_fin: "09:00" } });
  const b = crearReservaBody({ reserva: { ...crearReservaBody().reserva, hora: "09:00", hora_fin: "10:00" } });

  const first = await runReservaFlow(a);
  const second = await runReservaFlow(b);

  assert.equal(first.response.status, 200);
  assert.equal(second.response.status, 200);
  assert.equal(second.json.code, undefined, "no debe marcarse como duplicado");

  __resetCrearReservaRateLimitForTests();
  __resetIdempotencyStoreForTests();
});

test("Idempotencia: dos crear_reserva con distinta pista sí se procesan las dos (claves distintas)", async () => {
  __resetAvailabilityCacheForTests();
  __resetCrearReservaRateLimitForTests();
  __resetIdempotencyStoreForTests();

  const a = crearReservaBody({ reserva: { ...crearReservaBody().reserva, pista: "Pista 1" } });
  const b = crearReservaBody({ reserva: { ...crearReservaBody().reserva, pista: "Pista 2" } });

  const first = await runReservaFlow(a);
  const second = await runReservaFlow(b);

  assert.equal(first.response.status, 200);
  assert.equal(second.response.status, 200);

  __resetCrearReservaRateLimitForTests();
  __resetIdempotencyStoreForTests();
});

test("Idempotencia: clave_reserva explícita se respeta y prevalece sobre fecha/hora/pista distintas", async () => {
  __resetAvailabilityCacheForTests();
  __resetCrearReservaRateLimitForTests();
  __resetIdempotencyStoreForTests();

  const a = crearReservaBody({
    clave_reserva: "QA_CP04_TEST_CLAVE_EXPLICITA_01",
    reserva: { ...crearReservaBody().reserva, hora: "08:00", hora_fin: "09:00", pista: "Pista 1" },
  });
  // Mismos datos de la reserva salvo hora/pista (distintos), pero la MISMA
  // clave_reserva explícita: debe tratarse igualmente como duplicado,
  // porque la clave explícita manda sobre los campos derivados.
  const b = crearReservaBody({
    clave_reserva: "QA_CP04_TEST_CLAVE_EXPLICITA_01",
    reserva: { ...crearReservaBody().reserva, hora: "10:00", hora_fin: "11:00", pista: "Pista 2" },
  });

  const first = await runReservaFlow(a);
  assert.equal(first.response.status, 200);

  const second = await runReservaFlow(b);
  assert.equal(second.response.status, 409);
  assert.equal(second.json.code, "IDEMPOTENT_DUPLICATE");

  __resetCrearReservaRateLimitForTests();
  __resetIdempotencyStoreForTests();
});

test("cp04BuildIdempotencyKey: clave_reserva ausente se deriva de acción+email+fecha+pista+hora+telefono", () => {
  const conClave = cp04BuildIdempotencyKey({
    accion: "crear_reserva",
    clave_reserva: "QA_EXPLICITA",
    reserva: { fecha: "2026-09-11", pista: "Pista 1", hora: "08:00" },
    jugador: { email: "qa-idem@example.test", telefono: "600000001" },
  });
  const sinClave = cp04BuildIdempotencyKey({
    accion: "crear_reserva",
    reserva: { fecha: "2026-09-11", pista: "Pista 1", hora: "08:00" },
    jugador: { email: "qa-idem@example.test", telefono: "600000001" },
  });

  assert.equal(conClave, "crear|clave|QA_EXPLICITA");
  assert.equal(sinClave, "crear|qa-idem@example.test|2026-09-11|Pista 1|08:00|600000001");
  assert.notEqual(conClave, sinClave);
});

test("Idempotencia: un error de Airtable 429 en la revalidación NO se guarda como éxito — la repetición inmediata sí se procesa", async () => {
  __resetAvailabilityCacheForTests();
  __resetCrearReservaRateLimitForTests();
  __resetIdempotencyStoreForTests();

  const body = crearReservaBody({ clave_reserva: undefined, reserva: { ...crearReservaBody().reserva, fecha: "2026-09-12" } });

  const first = await runReservaFlow(body, { airtableStatus: 429, airtableBody: { error: "PUBLIC_API_BILLING_LIMIT_EXCEEDED" } });
  assert.equal(first.response.status, 503);
  assert.equal(first.json.code, "AIRTABLE_RATE_LIMIT");
  assert.equal(first.calls.make, 0, "no debe llegar a Make si la revalidación ya detectó el bloqueo de cuota");

  // Repetición inmediata, exactamente la misma solicitud: como la primera
  // NO terminó en éxito, no debe tratarse como IDEMPOTENT_DUPLICATE — debe
  // volver a intentarse de verdad (esta vez Airtable responde bien).
  const second = await runReservaFlow(body, { airtableStatus: 200 });
  assert.notEqual(second.json.code, "IDEMPOTENT_DUPLICATE");
  assert.equal(second.response.status, 200);
  assert.equal(second.calls.make, 1, "la repetición legítima tras un fallo sí debe llegar a Make");

  __resetCrearReservaRateLimitForTests();
  __resetIdempotencyStoreForTests();
});

test("Idempotencia: cancelar_reserva usa su propio espacio de claves (prefijo 'cancelar|'), independiente de crear_reserva", async () => {
  __resetAvailabilityCacheForTests();
  __resetIdempotencyStoreForTests();

  const cancelarBody = {
    accion: "cancelar_reserva",
    clave_reserva: "QA_CP04_TEST_CANCELAR_IDEM_01",
    jugador: { nombre: "", email: "", telefono: "" },
    club: "Club Pádel 04",
    origen: "test",
  };

  const first = await runReservaFlow(cancelarBody);
  assert.equal(first.response.status, 200);
  assert.equal(first.calls.make, 1);

  const second = await runReservaFlow(cancelarBody);
  assert.equal(second.response.status, 409);
  assert.equal(second.json.code, "IDEMPOTENT_DUPLICATE");
  assert.equal(second.calls.make, 0);

  // La misma clave_reserva, pero para crear_reserva, vive en un espacio de
  // claves distinto (prefijo "crear|clave|..." vs "cancelar|...") — no debe
  // verse afectada por el bloqueo de la cancelación.
  const key = cp04BuildIdempotencyKey({ accion: "crear_reserva", clave_reserva: "QA_CP04_TEST_CANCELAR_IDEM_01" });
  assert.equal(cp04IsIdempotentDuplicate(key), false);

  __resetIdempotencyStoreForTests();
});

test("Idempotencia: reprogramar_reserva usa su propio espacio de claves (prefijo 'reprogramar|')", async () => {
  __resetAvailabilityCacheForTests();
  __resetIdempotencyStoreForTests();

  const reprogramarBody = {
    accion: "reprogramar_reserva",
    clave_reserva: "QA_CP04_TEST_REPROG_IDEM_01",
    nueva_fecha_reserva: "2026-09-14",
    nueva_hora_inicio: "08:00",
    nueva_hora_fin: "09:00",
    nueva_pista: "Pista 1",
    pista_nueva: "Pista 1",
    club: "Club Pádel 04",
    origen: "test",
  };

  const first = await runReservaFlow(reprogramarBody);
  assert.equal(first.response.status, 200);
  assert.equal(first.calls.make, 1);

  const second = await runReservaFlow(reprogramarBody);
  assert.equal(second.response.status, 409);
  assert.equal(second.json.code, "IDEMPOTENT_DUPLICATE");
  assert.equal(second.calls.make, 0);

  __resetIdempotencyStoreForTests();
});

test("Idempotencia: cp04IsIdempotentDuplicate/cp04MarkIdempotentSuccess respetan el TTL exacto con timestamps inyectados", () => {
  __resetIdempotencyStoreForTests();
  const start = 5_000_000;
  const key = "crear|qa@example.test|2026-09-14|Pista 1|08:00|600000001";

  cp04MarkIdempotentSuccess(key, start);

  assert.equal(cp04IsIdempotentDuplicate(key, start), true, "justo tras marcar, debe detectarse como duplicado");
  assert.equal(
    cp04IsIdempotentDuplicate(key, start + CP04_IDEMPOTENCY_TTL_MS - 1),
    true,
    "un instante antes de expirar, sigue bloqueando"
  );
  assert.equal(
    cp04IsIdempotentDuplicate(key, start + CP04_IDEMPOTENCY_TTL_MS),
    false,
    "en el instante exacto del TTL (o después), ya no debe bloquear — permite una nueva llamada"
  );

  __resetIdempotencyStoreForTests();
});

test("cp04BuildIdempotentDuplicateResponse: forma exacta, reserva_confirmada siempre false", () => {
  const response = cp04BuildIdempotentDuplicateResponse();
  assert.deepEqual(response, {
    ok: false,
    code: "IDEMPOTENT_DUPLICATE",
    duplicated: true,
    retryable: false,
    reserva_confirmada: false,
    message: "Ya hemos recibido esta solicitud hace unos instantes. Si no ves la confirmación, contacta con recepción antes de volver a intentarlo.",
  });
});

// Observabilidad y logging técnico coherente (PASO 06E) ---------------------
//
// Estos tests comprueban el CONTRATO del log (forma del evento, canal,
// qué nunca aparece en claro), no la implementación interna — están
// pensados para seguir siendo válidos aunque cambie el formato exacto del
// mensaje de consola, mientras se respete cp04LogTechnicalEvent.

function withFakeConsoleError(run) {
  const original = console.error;
  const logged = [];
  console.error = (...args) => logged.push(args);
  try {
    return { result: run(), logged };
  } finally {
    console.error = original;
  }
}

async function withFakeConsoleErrorAsync(run) {
  const original = console.error;
  const logged = [];
  console.error = (...args) => logged.push(args);
  try {
    const result = await run();
    return { result, logged };
  } finally {
    console.error = original;
  }
}

function loggedEventsFrom(logged) {
  return logged
    .filter(([tag]) => tag === "CP04_EVENT")
    .map(([, jsonStr]) => JSON.parse(jsonStr));
}

test("cp04LogTechnicalEvent: forma exacta del evento, con defaults null para campos ausentes", () => {
  const { result, logged } = withFakeConsoleError(() =>
    cp04LogTechnicalEvent({ event: "test_event", code: "TEST_CODE" })
  );

  assert.equal(result.event, "test_event");
  assert.equal(result.action, null);
  assert.equal(result.code, "TEST_CODE");
  assert.equal(result.requestId, null);
  assert.equal(result.idempotencyKeyHash, null);
  assert.equal(result.retryable, null);
  assert.equal(result.reserva_confirmada, null);
  assert.equal(result.origen, null);
  assert.equal(typeof result.timestamp, "string");
  assert.ok(!Object.prototype.hasOwnProperty.call(result, "detail"), "sin detail explícito, no debe añadir la clave");

  assert.equal(logged.length, 1);
  assert.equal(logged[0][0], "CP04_EVENT");
  assert.deepEqual(JSON.parse(logged[0][1]), result);
});

test("cp04GetRequestId: usa cf-ray si está presente en la petición", () => {
  const request = new Request("https://worker.test/api/reservas", {
    headers: { "cf-ray": "abc123-MAD" },
  });
  assert.equal(cp04GetRequestId(request), "abc123-MAD");
});

test("cp04GetRequestId: sin cf-ray (tests, wrangler dev local) devuelve un valor fijo legible, nunca null/undefined", () => {
  const request = new Request("https://worker.test/api/reservas");
  assert.equal(cp04GetRequestId(request), "sin-cf-ray");
});

test("cp04HashIdempotencyKey: determinista (misma clave -> mismo hash) y sin clave -> null", () => {
  const key = "crear|qa@example.test|2026-09-11|Pista 1|08:00|600000001";
  const hashA = cp04HashIdempotencyKey(key);
  const hashB = cp04HashIdempotencyKey(key);
  assert.equal(hashA, hashB);
  assert.equal(typeof hashA, "string");
  assert.equal(cp04HashIdempotencyKey(null), null);
  assert.equal(cp04HashIdempotencyKey(""), null);
});

test("cp04HashIdempotencyKey: claves distintas producen hashes distintos y nunca contienen el email/telefono originales", () => {
  const keyA = "crear|qa-uno@example.test|2026-09-11|Pista 1|08:00|600000001";
  const keyB = "crear|qa-dos@example.test|2026-09-11|Pista 1|08:00|600000002";
  const hashA = cp04HashIdempotencyKey(keyA);
  const hashB = cp04HashIdempotencyKey(keyB);
  assert.notEqual(hashA, hashB);
  assert.equal(hashA.includes("qa-uno"), false);
  assert.equal(hashA.includes("600000001"), false);
});

test("Idempotencia: la solicitud duplicada loguea un evento idempotent_duplicate con la clave hasheada, nunca en claro", async () => {
  __resetAvailabilityCacheForTests();
  __resetIdempotencyStoreForTests();

  const body = crearReservaBody({
    jugador: { nombre: "QA Log", apellidos: "Test", email: "qa-log-idem@example.test", telefono: "611222333" },
  });

  const first = await runReservaFlow(body);
  assert.equal(first.response.status, 200);

  const { result: second, logged } = await withFakeConsoleErrorAsync(() => runReservaFlow(body));
  assert.equal(second.response.status, 409);
  assert.equal(second.json.code, "IDEMPOTENT_DUPLICATE");

  const events = loggedEventsFrom(logged);
  const dupEvent = events.find((e) => e.event === "idempotent_duplicate");
  assert.ok(dupEvent, "debe loguear un evento idempotent_duplicate");
  assert.equal(dupEvent.code, "IDEMPOTENT_DUPLICATE");
  assert.equal(dupEvent.action, "crear_reserva");
  assert.equal(dupEvent.retryable, false);
  assert.equal(dupEvent.reserva_confirmada, false);
  assert.equal(dupEvent.origen, "idempotencia");
  assert.equal(typeof dupEvent.idempotencyKeyHash, "string");

  const rawLog = JSON.stringify(logged);
  assert.equal(rawLog.includes("qa-log-idem@example.test"), false, "el email completo no debe aparecer en ningún log");
  assert.equal(rawLog.includes("611222333"), false, "el teléfono completo no debe aparecer en ningún log");

  __resetIdempotencyStoreForTests();
});

test("Airtable 429 en /api/disponibilidad loguea un evento airtable_rate_limit con code y origen correctos", async () => {
  __resetAvailabilityCacheForTests();
  let captured = null;
  const { logged } = await withFakeConsoleErrorAsync(() =>
    withFakeFetch(
      async () => new Response(JSON.stringify({ error: { type: "PUBLIC_API_BILLING_LIMIT_EXCEEDED" } }), { status: 429 }),
      async () => {
        const env = { ...ENV_BASE, ...FAKE_AIRTABLE_ENV };
        const response = await worker.fetch(disponibilidadRequest("2026-09-16"), env);
        captured = { status: response.status, body: await response.json() };
      }
    )
  );

  assert.equal(captured.status, 503);
  assert.equal(captured.body.code, "AIRTABLE_RATE_LIMIT");

  const events = loggedEventsFrom(logged);
  const rateLimitEvent = events.find((e) => e.event === "airtable_rate_limit");
  assert.ok(rateLimitEvent, "debe loguear un evento airtable_rate_limit");
  assert.equal(rateLimitEvent.code, "AIRTABLE_RATE_LIMIT");
  assert.equal(rateLimitEvent.origen, "disponibilidad");
  assert.equal(rateLimitEvent.retryable, true);
  assert.equal(rateLimitEvent.reserva_confirmada, false);

  // El evento genérico de error (previo a saber que es 429) también debe
  // haberse logueado, con su propio código — ver nota junto a
  // CP04_DISPONIBILIDAD_AIRTABLE_ERROR en index.js.
  const genericEvent = events.find((e) => e.event === "airtable_error");
  assert.ok(genericEvent, "también debe loguear el evento genérico previo a la clasificación de 429");
});

test("Rate limit de crear_reserva: la respuesta al cliente no cambia y se loguea un evento rate_limited (mismo criterio que idempotencia)", async () => {
  __resetAvailabilityCacheForTests();
  __resetIdempotencyStoreForTests();
  __resetCrearReservaRateLimitForTests();

  for (let i = 0; i < 30; i += 1) {
    cp04CheckCrearReservaRateLimit();
  }

  const body = crearReservaBody({
    jugador: { nombre: "QA Rate", apellidos: "Test", email: "qa-rate@example.test", telefono: "622333444" },
  });

  const { result, logged } = await withFakeConsoleErrorAsync(() => runReservaFlow(body));

  assert.equal(result.response.status, 429);
  assert.deepEqual(result.json, {
    ok: false,
    error: "RATE_LIMITED",
    message: "Demasiadas solicitudes de alta de reserva en poco tiempo. Inténtalo de nuevo en un minuto.",
  });
  assert.equal(result.calls.make, 0, "un rate limit no debe llegar a reenviar nada a Make");

  const events = loggedEventsFrom(logged);
  const rateLimitedEvent = events.find((e) => e.event === "rate_limited");
  assert.ok(rateLimitedEvent, "debe loguear un evento rate_limited");
  assert.equal(rateLimitedEvent.code, "RATE_LIMITED");
  assert.equal(rateLimitedEvent.action, "crear_reserva");
  assert.equal(rateLimitedEvent.origen, "rate_limiter_crear_reserva");
  assert.equal(rateLimitedEvent.retryable, true);
  assert.equal(rateLimitedEvent.reserva_confirmada, false);

  const rawLog = JSON.stringify(logged);
  assert.equal(rawLog.includes("qa-rate@example.test"), false);
  assert.equal(rawLog.includes("622333444"), false);

  __resetCrearReservaRateLimitForTests();
});

test("Make rechaza el reenvío (502): ahora sí queda un rastro server-side (evento make_rejected)", async () => {
  __resetAvailabilityCacheForTests();
  __resetIdempotencyStoreForTests();

  const body = crearReservaBody({
    jugador: { nombre: "QA MakeReject", apellidos: "Test", email: "qa-makereject@example.test", telefono: "633444555" },
  });

  const { result, logged } = await withFakeConsoleErrorAsync(() =>
    runReservaFlow(body, { makeStatus: 500, makeBody: { ok: false } })
  );

  assert.equal(result.response.status, 502);

  const events = loggedEventsFrom(logged);
  const rejectedEvent = events.find((e) => e.event === "make_rejected");
  assert.ok(rejectedEvent, "debe loguear un evento make_rejected");
  assert.equal(rejectedEvent.code, "MAKE_REJECTED");
  assert.equal(rejectedEvent.action, "crear_reserva");
  assert.equal(rejectedEvent.reserva_confirmada, false);

  __resetIdempotencyStoreForTests();
});
