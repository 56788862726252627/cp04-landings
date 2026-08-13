import test from "node:test";
import assert from "node:assert/strict";

import worker, {
  cp04CierreBloqueaSlot,
  cp04AddMinutesToHora,
  cp04ClaveSlotsBloqueadosPorCierres,
  cp04FetchCierresActivos,
  cp04FetchOcupadas,
  __resetAvailabilityCacheForTests,
  __resetCrearReservaRateLimitForTests,
} from "./index.js";

// FASE 2 (2026-08-12, "bloqueo real de disponibilidad"): tests del
// algoritmo de solapamiento cierre<->reserva, de su integración en
// cp04FetchOcupadas, y de que /api/disponibilidad y /api/reservas
// (creación y reprogramación) quedan protegidos server-side sin ningún
// cambio en sus propios consumidores (mismo array `ocupadas` de siempre).
// Ninguna petición de red real: fetch se sustituye siempre por un stub
// local, restaurado en el `finally`.

async function withFakeFetch(fakeFetchImpl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetchImpl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

function makeFakeCaches() {
  const store = new Set();
  return {
    default: {
      async match(request) { return store.has(request.url) ? new Response("1") : undefined; },
      async put(request) { store.add(request.url); },
    },
  };
}

async function withFakeCaches(run) {
  const original = globalThis.caches;
  globalThis.caches = makeFakeCaches();
  try {
    await run();
  } finally {
    if (original === undefined) delete globalThis.caches;
    else globalThis.caches = original;
  }
}

const FAKE_RESERVAS_ENV = {
  AIRTABLE_TOKEN: "fake-token-not-real",
  AIRTABLE_BASE_ID: "appFAKEBASE00000",
  AIRTABLE_TABLE_ID: "tblFAKETABLE00000",
};
const FAKE_CIERRES_ENV = {
  AIRTABLE_CIERRES_TABLE_ID: "tblzlOcjO5vFiXdbB",
};
const FULL_ENV = { ...FAKE_RESERVAS_ENV, ...FAKE_CIERRES_ENV, ALLOWED_ORIGIN: "http://localhost:5173" };

// --- cp04AddMinutesToHora --------------------------------------------------

test("cp04AddMinutesToHora: suma simple dentro de la misma hora/día", () => {
  assert.equal(cp04AddMinutesToHora("09:00", 60), "10:00");
  assert.equal(cp04AddMinutesToHora("09:00", 90), "10:30");
  assert.equal(cp04AddMinutesToHora("22:00", 120), "00:00");
});

// --- cp04CierreBloqueaSlot: los 8 casos exigidos (1-8) --------------------

const CIERRE_BASE = {
  pista: "Pista 1",
  fecha_inicio: "2026-08-20",
  hora_inicio: "10:00",
  fecha_fin: "2026-08-20",
  hora_fin: "14:00",
};

test("1) reserva empieza dentro del cierre -> BLOQUEADA", () => {
  const bloquea = cp04CierreBloqueaSlot(CIERRE_BASE, {
    pista: "Pista 1", fecha: "2026-08-20", horaInicio: "11:00", horaFin: "13:00",
  });
  assert.equal(bloquea, true);
});

test("2) reserva termina dentro del cierre -> BLOQUEADA", () => {
  const bloquea = cp04CierreBloqueaSlot(CIERRE_BASE, {
    pista: "Pista 1", fecha: "2026-08-20", horaInicio: "09:00", horaFin: "11:00",
  });
  assert.equal(bloquea, true);
});

test("3) reserva engloba completamente el cierre -> BLOQUEADA", () => {
  const bloquea = cp04CierreBloqueaSlot(CIERRE_BASE, {
    pista: "Pista 1", fecha: "2026-08-20", horaInicio: "08:00", horaFin: "18:00",
  });
  assert.equal(bloquea, true);
});

test("4) reserva totalmente dentro del cierre -> BLOQUEADA", () => {
  const bloquea = cp04CierreBloqueaSlot(CIERRE_BASE, {
    pista: "Pista 1", fecha: "2026-08-20", horaInicio: "11:00", horaFin: "12:00",
  });
  assert.equal(bloquea, true);
});

test("5) reserva termina exactamente cuando empieza el cierre -> PERMITIDA (adyacente, sin solape)", () => {
  const bloquea = cp04CierreBloqueaSlot(CIERRE_BASE, {
    pista: "Pista 1", fecha: "2026-08-20", horaInicio: "08:00", horaFin: "10:00",
  });
  assert.equal(bloquea, false);
});

test("6) reserva empieza exactamente cuando termina el cierre -> PERMITIDA (adyacente, sin solape)", () => {
  const bloquea = cp04CierreBloqueaSlot(CIERRE_BASE, {
    pista: "Pista 1", fecha: "2026-08-20", horaInicio: "14:00", horaFin: "16:00",
  });
  assert.equal(bloquea, false);
});

test("7) pista diferente -> PERMITIDA", () => {
  const bloquea = cp04CierreBloqueaSlot(CIERRE_BASE, {
    pista: "Pista 2", fecha: "2026-08-20", horaInicio: "11:00", horaFin: "12:00",
  });
  assert.equal(bloquea, false);
});

test("8) cierre pista='todas' bloquea las 4 pistas", () => {
  const cierreTodas = { ...CIERRE_BASE, pista: "todas" };
  for (const pista of ["Pista 1", "Pista 2", "Pista 3", "Pista 4"]) {
    const bloquea = cp04CierreBloqueaSlot(cierreTodas, {
      pista, fecha: "2026-08-20", horaInicio: "11:00", horaFin: "12:00",
    });
    assert.equal(bloquea, true, `${pista} debería quedar bloqueada por un cierre 'todas'`);
  }
});

test("cierre multi-día: una reserva en el día intermedio también queda bloqueada", () => {
  const cierreMultidia = { pista: "Pista 1", fecha_inicio: "2026-08-20", hora_inicio: "09:00", fecha_fin: "2026-08-22", hora_fin: "18:00" };
  const bloquea = cp04CierreBloqueaSlot(cierreMultidia, {
    pista: "Pista 1", fecha: "2026-08-21", horaInicio: "10:00", horaFin: "11:00",
  });
  assert.equal(bloquea, true);
});

// --- 9/10/11: exclusión por estado/expiración/bloquear_reservas ----------
// La exclusión de CANCELADO/FINALIZADO/bloquear_reservas=false ocurre en la
// FÓRMULA enviada a Airtable (filtrado server-side, no en JS) -- la forma
// honesta de comprobarlo es verificar que la fórmula construida realmente
// contiene esas condiciones, ya que un cierre CANCELADO/FINALIZADO ni
// siquiera llega a `cierres` si Airtable filtra correctamente.

test("9/10/11) cp04FetchCierresActivos construye la fórmula con estado=ACTIVO, bloquear_reservas=TRUE y ventana de fecha (excluye CANCELADO/FINALIZADO/bloquear_reservas=false por construcción)", async () => {
  let capturedUrl = null;
  await withFakeFetch(
    async (url) => {
      capturedUrl = String(url?.url || url);
      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    },
    async () => {
      await cp04FetchCierresActivos({ ...FAKE_RESERVAS_ENV, ...FAKE_CIERRES_ENV }, "2026-08-20");
    }
  );
  const decoded = decodeURIComponent(capturedUrl);
  assert.match(decoded, /\{estado\}='ACTIVO'/);
  assert.match(decoded, /\{bloquear_reservas\}=TRUE\(\)/);
  assert.match(decoded, /\{fecha_inicio\}<=DATETIME_PARSE\('2026-08-20','YYYY-MM-DD'\)/);
  assert.match(decoded, /\{fecha_fin\}>=DATETIME_PARSE\('2026-08-20','YYYY-MM-DD'\)/);
});

test("11) bloquear_reservas=false en un registro que igualmente llegara al cliente no se usaría para bloquear nada más allá de lo que la fórmula ya filtra (defensa en profundidad de cp04ClaveSlotsBloqueadosPorCierres)", () => {
  // Aunque la fórmula ya excluye esto en Airtable real, cp04ClaveSlotsBloqueadosPorCierres
  // no vuelve a comprobar bloquear_reservas (no lo recibe, no lo necesita: la
  // fórmula es la única fuente de verdad) -- este test documenta esa frontera
  // de responsabilidad explícitamente, sin fingir una comprobación duplicada.
  const bloqueadas = cp04ClaveSlotsBloqueadosPorCierres([CIERRE_BASE], "2026-08-20");
  assert.ok(bloqueadas.includes("2026-08-20|Pista 1|10:00"));
});

// --- 12: GET /api/disponibilidad refleja el cierre ------------------------

test("12) GET /api/disponibilidad incluye los slots bloqueados por un cierre activo, fusionados con las reservas reales", async () => {
  __resetAvailabilityCacheForTests();
  await withFakeFetch(
    async (url) => {
      const target = String(url?.url || url);
      if (target.includes(FAKE_CIERRES_ENV.AIRTABLE_CIERRES_TABLE_ID)) {
        return new Response(
          JSON.stringify({ records: [{ fields: { pista: "Pista 1", fecha_inicio: "2026-08-20", hora_inicio: "10:00", fecha_fin: "2026-08-20", hora_fin: "14:00" } }] }),
          { status: 200 }
        );
      }
      // Tabla de reservas: una reserva real ya existente, ajena al cierre.
      return new Response(
        JSON.stringify({ records: [{ fields: { clave_slot: "2026-08-20|Pista 3|18:00" } }] }),
        { status: 200 }
      );
    },
    async () => {
      const request = new Request("https://worker.test/api/disponibilidad?fecha=2026-08-20", {
        method: "GET",
        headers: { Origin: "http://localhost:5173" },
      });
      const response = await worker.fetch(request, FULL_ENV);
      const data = await response.json();

      assert.equal(response.status, 200);
      assert.ok(data.ocupadas.includes("2026-08-20|Pista 1|10:00"), "slot bloqueado por el cierre debe aparecer");
      assert.ok(data.ocupadas.includes("2026-08-20|Pista 3|18:00"), "reserva real ajena al cierre se mantiene");
    }
  );
  __resetAvailabilityCacheForTests();
});

// --- 13/14: creación y reprogramación rechazadas sobre un cierre ----------

function fakeAirtableAndCierreFetch({ cierreRecords = [] } = {}) {
  return async (url) => {
    const target = String(url?.url || url);
    if (target.includes(FAKE_CIERRES_ENV.AIRTABLE_CIERRES_TABLE_ID)) {
      return new Response(JSON.stringify({ records: cierreRecords }), { status: 200 });
    }
    if (target.includes("api.airtable.com")) {
      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    }
    throw new Error("no debería reenviarse a Make: la revalidación debe rechazar antes");
  };
}

test("13) creación de reserva sobre un cierre activo -> RECHAZADA (409, nunca llega a Make)", async () => {
  __resetAvailabilityCacheForTests();
  __resetCrearReservaRateLimitForTests();
  await withFakeCaches(async () => {
    await withFakeFetch(
      fakeAirtableAndCierreFetch({
        cierreRecords: [{ fields: { pista: "Pista 1", fecha_inicio: "2026-08-20", hora_inicio: "09:00", fecha_fin: "2026-08-20", hora_fin: "23:00" } }],
      }),
      async () => {
        const request = new Request("https://worker.test/api/reservas", {
          method: "POST",
          headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
          body: JSON.stringify({
            accion: "crear_reserva",
            jugador: { nombre: "QA Cierre", apellidos: "Test", email: "qa-cierre@example.test", telefono: "600000000" },
            reserva: { fecha: "2026-08-20", pista: "Pista 1", hora: "10:00", hora_fin: "11:00", modalidad: "libre", nivel: "intermedio", duracion_minutos: 60, precio_total: 20 },
            clave_reserva: "QA_CIERRE_TEST_CREAR_001",
            origen: "test",
            club: "Club Pádel 04",
          }),
        });
        const response = await worker.fetch(request, FULL_ENV);
        const data = await response.json();
        assert.equal(response.status, 409);
        assert.equal(data.error, "SLOT_ALREADY_BOOKED");
      }
    );
  });
  __resetCrearReservaRateLimitForTests();
});

test("14) reprogramación de reserva hacia un cierre activo -> RECHAZADA (409, misma revalidación que creación)", async () => {
  __resetAvailabilityCacheForTests();
  await withFakeCaches(async () => {
    await withFakeFetch(
      fakeAirtableAndCierreFetch({
        cierreRecords: [{ fields: { pista: "Pista 2", fecha_inicio: "2026-08-21", hora_inicio: "08:00", fecha_fin: "2026-08-21", hora_fin: "23:00" } }],
      }),
      async () => {
        const request = new Request("https://worker.test/api/reservas", {
          method: "POST",
          headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
          body: JSON.stringify({
            accion: "reprogramar_reserva",
            clave_reserva: "QA_CIERRE_TEST_REPROGRAMAR_001",
            nueva_fecha_reserva: "2026-08-21",
            nueva_pista: "Pista 2",
            nueva_hora_inicio: "09:00",
            nueva_hora_fin: "10:00",
            origen: "test",
          }),
        });
        const response = await worker.fetch(request, FULL_ENV);
        const data = await response.json();
        assert.equal(response.status, 409);
        assert.equal(data.error, "SLOT_ALREADY_BOOKED");
      }
    );
  });
});

// --- 15: reservas fuera del cierre, sin regresión -------------------------

test("15) creación de reserva en una franja fuera del cierre -> PERMITIDA (sin regresión)", async () => {
  __resetAvailabilityCacheForTests();
  __resetCrearReservaRateLimitForTests();
  await withFakeCaches(async () => {
    await withFakeFetch(
      fakeAirtableAndCierreFetch({
        cierreRecords: [{ fields: { pista: "Pista 1", fecha_inicio: "2026-08-20", hora_inicio: "09:00", fecha_fin: "2026-08-20", hora_fin: "11:00" } }],
      }),
      async () => {
        const request = new Request("https://worker.test/api/reservas", {
          method: "POST",
          headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
          body: JSON.stringify({
            accion: "crear_reserva",
            jugador: { nombre: "QA Fuera", apellidos: "Cierre", email: "qa-fuera@example.test", telefono: "600000000" },
            reserva: { fecha: "2026-08-20", pista: "Pista 1", hora: "18:00", hora_fin: "19:00", modalidad: "libre", nivel: "intermedio", duracion_minutos: 60, precio_total: 20 },
            clave_reserva: "QA_FUERA_CIERRE_TEST_001",
            origen: "test",
            club: "Club Pádel 04",
          }),
        });
        const response = await worker.fetch(request, FULL_ENV);
        // Sin MAKE_RESERVAS_WEBHOOK configurado en FULL_ENV, no puede llegar
        // a 200 real -- lo que importa aquí es que NO sea 409 por cierre.
        assert.notEqual(response.status, 409);
      }
    );
  });
  __resetCrearReservaRateLimitForTests();
});

// --- 16/17: Alta y Baja de Jugador sin regresión --------------------------

test("16) regresión: /api/jugadores/alta sigue respondiendo 503 seguro tras Fase 2 (disponibilidad)", async () => {
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

test("17) regresión: /api/jugadores/baja sigue respondiendo 503 seguro tras Fase 2 (disponibilidad)", async () => {
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

// --- Fail-open: si CIERRES_TEMPORALES no está configurado, no rompe disponibilidad ---

test("cp04FetchOcupadas: sin AIRTABLE_CIERRES_TABLE_ID configurado, degrada a 'sin cierres' sin romper la disponibilidad de reservas", async () => {
  __resetAvailabilityCacheForTests();
  await withFakeFetch(
    async (url) => {
      const target = String(url?.url || url);
      if (target.includes(FAKE_CIERRES_ENV.AIRTABLE_CIERRES_TABLE_ID)) {
        throw new Error("no debería llamarse a Airtable de cierres si no está configurado");
      }
      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    },
    async () => {
      const result = await cp04FetchOcupadas(FAKE_RESERVAS_ENV, "2026-08-20");
      assert.equal(result.ok, true);
      assert.deepEqual(result.ocupadas, []);
    }
  );
  __resetAvailabilityCacheForTests();
});
