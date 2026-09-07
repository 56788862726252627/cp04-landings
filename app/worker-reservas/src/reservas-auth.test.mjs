import test from "node:test";
import assert from "node:assert/strict";

import worker, {
  __resetCrearReservaRateLimitForTests,
  __resetIdempotencyStoreForTests,
  __resetAvailabilityCacheForTests,
} from "./index.js";

// Tests del gate de autenticación real (Supabase) para las acciones mutables
// de /api/reservas (crear_reserva, cancelar_reserva, reprogramar_reserva).
// Ningún test hace una petición de red real: fetch se sustituye por un stub
// enrutado según la URL (api.airtable.com / auth/v1/user / webhook de Make),
// siempre restaurado en `finally`. Ningún token/URL/email es real.

async function withFakeFetch(impl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

function resetAll() {
  __resetCrearReservaRateLimitForTests();
  __resetIdempotencyStoreForTests();
  __resetAvailabilityCacheForTests();
}

const SUPABASE_ENV = {
  SUPABASE_URL: "https://fake.supabase.test",
  SUPABASE_ANON_KEY: "fake-anon-key",
};

const AIRTABLE_ENV = {
  AIRTABLE_TOKEN: "test-token",
  AIRTABLE_BASE_ID: "appTestBase",
  AIRTABLE_TABLE_ID: "tblTestReservas",
};

const MAKE_URL = "https://hook.make.test/reservas";

function envFor(extra = {}) {
  return {
    ALLOWED_ORIGIN: "http://localhost:5173",
    CP04_ENFORCE_ROLE_GATES: "true",
    MAKE_RESERVAS_WEBHOOK: MAKE_URL,
    ...SUPABASE_ENV,
    ...AIRTABLE_ENV,
    ...extra,
  };
}

function supabaseUser({ id = "user-qa-1", email, role }) {
  return { ok: true, json: async () => ({ id, email, app_metadata: { role } }) };
}

function bearerAuthHeader(token = "fake-jwt-token") {
  return { Authorization: `Bearer ${token}` };
}

function airtableLookupRecord({ claveReserva, email, estado = "confirmada", pista = "Pista 1", recordId = "recTestAuth001" }) {
  return {
    ok: true,
    json: async () => ({
      records: [
        { id: recordId, fields: { clave_reserva: claveReserva, Email: email, estado_reserva: estado, Pista: pista } },
      ],
    }),
  };
}

const AIRTABLE_LOOKUP_NOT_FOUND = { ok: true, json: async () => ({ records: [] }) };
const AIRTABLE_DISPONIBILIDAD_SIN_OCUPADAS = { ok: true, json: async () => ({ records: [] }) };

// Enruta el fetch stub: peticiones a api.airtable.com con maxRecords=1 son la
// comprobación de propiedad (cp04LookupReservaParaQr, reutilizada por
// cancelar/reprogramar); el resto de peticiones a api.airtable.com son la
// revalidación de disponibilidad (cp04FetchOcupadas, crear/reprogramar);
// /auth/v1/user es Supabase; cualquier otra URL es el webhook de Make.
function routedFetch({ airtableLookupImpl, airtableDisponibilidadImpl, makeImpl, supabaseImpl, calls = [] } = {}) {
  return async (input, init) => {
    const url = typeof input === "string" ? input : input?.url;

    if (url.includes("api.airtable.com")) {
      if (url.includes("maxRecords=1")) {
        calls.push({ target: "airtable_lookup", url });
        if (!airtableLookupImpl) throw new Error("airtableLookupImpl no configurado para este test");
        return airtableLookupImpl(url, init);
      }
      calls.push({ target: "airtable_disponibilidad", url });
      return (airtableDisponibilidadImpl || (async () => AIRTABLE_DISPONIBILIDAD_SIN_OCUPADAS))(url, init);
    }

    if (url.includes("/auth/v1/user")) {
      calls.push({ target: "supabase", url });
      if (!supabaseImpl) throw new Error("supabaseImpl no configurado para este test");
      return supabaseImpl(url, init);
    }

    calls.push({ target: "make", url });
    return (makeImpl || (async () => new Response(JSON.stringify({ ok: true }), { status: 200 })))(url, init);
  };
}

function reservaRequest(body, headers = {}) {
  return new Request("https://worker.test/api/reservas", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function crearReservaBody(overrides = {}) {
  return {
    accion: "crear_reserva",
    jugador: { nombre: "QA Auth", apellidos: "Test", email: "player@example.test", telefono: "600000002" },
    reserva: {
      fecha: "2026-09-21",
      pista: "Pista 1",
      hora: "08:00",
      hora_fin: "09:00",
      modalidad: "libre",
      nivel: "intermedio",
      duracion_minutos: 60,
      precio_total: 20,
    },
    origen: "test",
    club: "Club Pádel 04",
    ...overrides,
  };
}

function cancelarBody(overrides = {}) {
  return {
    accion: "cancelar_reserva",
    clave_reserva: "QA_AUTH_CANCEL_001",
    jugador: { nombre: "", email: "", telefono: "" },
    club: "Club Pádel 04",
    origen: "test",
    ...overrides,
  };
}

function reprogramarBody(overrides = {}) {
  return {
    accion: "reprogramar_reserva",
    clave_reserva: "QA_AUTH_REPROG_001",
    nueva_fecha_reserva: "2026-09-21",
    nueva_hora_inicio: "10:00",
    nueva_hora_fin: "11:00",
    nueva_pista: "Pista 2",
    pista_nueva: "Pista 2",
    club: "Club Pádel 04",
    origen: "test",
    ...overrides,
  };
}

// ─── crear_reserva ──────────────────────────────────────────────────────

test("crear_reserva: sin token con el gate activo -> 401, ni Airtable ni Make se llaman", async () => {
  resetAll();
  await withFakeFetch(
    routedFetch({
      supabaseImpl: async () => { throw new Error("no debería llamarse a Supabase sin token"); },
      makeImpl: async () => { throw new Error("no debería llamarse a Make: el gate debe bloquear antes"); },
    }),
    async () => {
      const res = await worker.fetch(reservaRequest(crearReservaBody()), envFor());
      const data = await res.json();
      assert.equal(res.status, 401);
      assert.equal(data.ok, false);
    }
  );
});

test("crear_reserva: PLAYER autenticado con su propio email -> 200, se reenvía a Make", async () => {
  resetAll();
  const calls = [];
  await withFakeFetch(
    routedFetch({
      supabaseImpl: async () => supabaseUser({ email: "player@example.test", role: "PLAYER" }),
      calls,
    }),
    async () => {
      const res = await worker.fetch(reservaRequest(crearReservaBody(), bearerAuthHeader()), envFor());
      assert.equal(res.status, 200);
      assert.ok(calls.some((c) => c.target === "make"), "debe reenviar a Make");
    }
  );
});

test("crear_reserva: PLAYER autenticado con email en otra capitalización -> 200 (comparación insensible a mayúsculas)", async () => {
  resetAll();
  await withFakeFetch(
    routedFetch({
      supabaseImpl: async () => supabaseUser({ email: "PLAYER@EXAMPLE.TEST", role: "PLAYER" }),
    }),
    async () => {
      const res = await worker.fetch(reservaRequest(crearReservaBody(), bearerAuthHeader()), envFor());
      assert.equal(res.status, 200);
    }
  );
});

test("crear_reserva: PLAYER autenticado con email DISTINTO al del jugador del body -> 403 FORBIDDEN, Make nunca se llama", async () => {
  resetAll();
  const calls = [];
  await withFakeFetch(
    routedFetch({
      supabaseImpl: async () => supabaseUser({ email: "otro-jugador@example.test", role: "PLAYER" }),
      makeImpl: async () => { throw new Error("no debería llamar a Make: PLAYER intenta reservar en nombre de otro"); },
      calls,
    }),
    async () => {
      const res = await worker.fetch(reservaRequest(crearReservaBody(), bearerAuthHeader()), envFor());
      const data = await res.json();
      assert.equal(res.status, 403);
      assert.equal(data.error, "FORBIDDEN");
      assert.deepEqual(calls.map((c) => c.target), ["supabase"]);
    }
  );
});

test("crear_reserva: STAFF autenticado puede crear en nombre de un jugador aunque el email no coincida (recepción) -> 200", async () => {
  resetAll();
  await withFakeFetch(
    routedFetch({
      supabaseImpl: async () => supabaseUser({ email: "recepcion@club-padel-04.example", role: "STAFF" }),
    }),
    async () => {
      const res = await worker.fetch(reservaRequest(crearReservaBody(), bearerAuthHeader()), envFor());
      assert.equal(res.status, 200);
    }
  );
});

test("crear_reserva: dos solicitudes idénticas autenticadas como el mismo PLAYER -> la segunda es 409 IDEMPOTENT_DUPLICATE, sin segundo reenvío a Make", async () => {
  resetAll();
  const calls = [];
  const body = crearReservaBody({ reserva: { ...crearReservaBody().reserva, fecha: "2026-09-22" } });

  await withFakeFetch(
    routedFetch({ supabaseImpl: async () => supabaseUser({ email: "player@example.test", role: "PLAYER" }), calls }),
    async () => {
      const first = await worker.fetch(reservaRequest(body, bearerAuthHeader()), envFor());
      assert.equal(first.status, 200);

      const second = await worker.fetch(reservaRequest(body, bearerAuthHeader()), envFor());
      const secondJson = await second.json();
      assert.equal(second.status, 409);
      assert.equal(secondJson.code, "IDEMPOTENT_DUPLICATE");
    }
  );

  assert.equal(calls.filter((c) => c.target === "make").length, 1, "Make solo debe llamarse una vez");
  resetAll();
});

// ─── cancelar_reserva ───────────────────────────────────────────────────

test("cancelar_reserva: PLAYER cancela su propia reserva (email coincide con la reserva real en Airtable) -> 200", async () => {
  resetAll();
  await withFakeFetch(
    routedFetch({
      airtableLookupImpl: async () => airtableLookupRecord({ claveReserva: "QA_AUTH_CANCEL_001", email: "player@example.test" }),
      supabaseImpl: async () => supabaseUser({ email: "player@example.test", role: "PLAYER" }),
    }),
    async () => {
      const res = await worker.fetch(reservaRequest(cancelarBody(), bearerAuthHeader()), envFor());
      assert.equal(res.status, 200);
    }
  );
  resetAll();
});

test("cancelar_reserva: PLAYER intenta cancelar una reserva AJENA -> 403 FORBIDDEN, Make nunca se llama", async () => {
  resetAll();
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableLookupImpl: async () => airtableLookupRecord({ claveReserva: "QA_AUTH_CANCEL_002", email: "dueno-real@example.test" }),
      supabaseImpl: async () => supabaseUser({ email: "player@example.test", role: "PLAYER" }),
      makeImpl: async () => { throw new Error("no debería llamar a Make: PLAYER intenta cancelar una reserva ajena"); },
      calls,
    }),
    async () => {
      const res = await worker.fetch(
        reservaRequest(cancelarBody({ clave_reserva: "QA_AUTH_CANCEL_002" }), bearerAuthHeader()),
        envFor()
      );
      const data = await res.json();
      assert.equal(res.status, 403);
      assert.equal(data.error, "FORBIDDEN");
      assert.deepEqual(calls.map((c) => c.target), ["supabase", "airtable_lookup"]);
    }
  );
  resetAll();
});

test("cancelar_reserva: clave_reserva inexistente en Airtable -> 404 RESERVATION_NOT_FOUND", async () => {
  resetAll();
  await withFakeFetch(
    routedFetch({
      airtableLookupImpl: async () => AIRTABLE_LOOKUP_NOT_FOUND,
      supabaseImpl: async () => supabaseUser({ email: "player@example.test", role: "PLAYER" }),
    }),
    async () => {
      const res = await worker.fetch(
        reservaRequest(cancelarBody({ clave_reserva: "QA_AUTH_CANCEL_404NOTFOUND" }), bearerAuthHeader()),
        envFor()
      );
      const data = await res.json();
      assert.equal(res.status, 404);
      assert.equal(data.error, "RESERVATION_NOT_FOUND");
    }
  );
  resetAll();
});

test("cancelar_reserva: no se puede verificar la reserva en Airtable (caído/no configurado) -> 503, falla cerrado (no se reenvía a Make)", async () => {
  resetAll();
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableLookupImpl: async () => ({ ok: false, status: 500, json: async () => ({ error: "boom" }) }),
      supabaseImpl: async () => supabaseUser({ email: "player@example.test", role: "PLAYER" }),
      makeImpl: async () => { throw new Error("no debería llamar a Make si no se pudo verificar la propiedad"); },
      calls,
    }),
    async () => {
      const res = await worker.fetch(
        reservaRequest(cancelarBody({ clave_reserva: "QA_AUTH_CANCEL_503" }), bearerAuthHeader()),
        envFor()
      );
      const data = await res.json();
      assert.equal(res.status, 503);
      assert.equal(data.error, "RESERVATION_CHECK_FAILED");
    }
  );
  resetAll();
});

for (const role of ["STAFF", "ADMIN", "SUPPORT"]) {
  test(`cancelar_reserva: ${role} autenticado puede cancelar una reserva ajena sin restricción de propiedad -> 200`, async () => {
    resetAll();
    const calls = [];
    await withFakeFetch(
      routedFetch({
        airtableLookupImpl: async () => { throw new Error(`no debería consultar propiedad para ${role}`); },
        supabaseImpl: async () => supabaseUser({ email: "staff@club-padel-04.example", role }),
        calls,
      }),
      async () => {
        const res = await worker.fetch(
          reservaRequest(cancelarBody({ clave_reserva: `QA_AUTH_CANCEL_${role}` }), bearerAuthHeader()),
          envFor()
        );
        assert.equal(res.status, 200);
        assert.ok(!calls.some((c) => c.target === "airtable_lookup"), "no debe comprobar propiedad para roles administrativos");
      }
    );
    resetAll();
  });
}

// ─── reprogramar_reserva ────────────────────────────────────────────────

test("reprogramar_reserva: PLAYER reprograma su propia reserva -> 200", async () => {
  resetAll();
  await withFakeFetch(
    routedFetch({
      airtableLookupImpl: async () => airtableLookupRecord({ claveReserva: "QA_AUTH_REPROG_001", email: "player@example.test" }),
      supabaseImpl: async () => supabaseUser({ email: "player@example.test", role: "PLAYER" }),
    }),
    async () => {
      const res = await worker.fetch(reservaRequest(reprogramarBody(), bearerAuthHeader()), envFor());
      assert.equal(res.status, 200);
    }
  );
  resetAll();
});

test("reprogramar_reserva: PLAYER intenta reprogramar una reserva AJENA -> 403 FORBIDDEN, Make nunca se llama", async () => {
  resetAll();
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableLookupImpl: async () => airtableLookupRecord({ claveReserva: "QA_AUTH_REPROG_002", email: "dueno-real@example.test" }),
      supabaseImpl: async () => supabaseUser({ email: "player@example.test", role: "PLAYER" }),
      makeImpl: async () => { throw new Error("no debería llamar a Make: PLAYER intenta reprogramar una reserva ajena"); },
      calls,
    }),
    async () => {
      const res = await worker.fetch(
        reservaRequest(reprogramarBody({ clave_reserva: "QA_AUTH_REPROG_002" }), bearerAuthHeader()),
        envFor()
      );
      const data = await res.json();
      assert.equal(res.status, 403);
      assert.equal(data.error, "FORBIDDEN");
    }
  );
  resetAll();
});

test("reprogramar_reserva: STAFF autenticado puede reprogramar una reserva ajena -> 200", async () => {
  resetAll();
  await withFakeFetch(
    routedFetch({
      airtableLookupImpl: async () => { throw new Error("no debería consultar propiedad para STAFF"); },
      supabaseImpl: async () => supabaseUser({ email: "staff@club-padel-04.example", role: "STAFF" }),
    }),
    async () => {
      const res = await worker.fetch(
        reservaRequest(reprogramarBody({ clave_reserva: "QA_AUTH_REPROG_STAFF" }), bearerAuthHeader()),
        envFor()
      );
      assert.equal(res.status, 200);
    }
  );
  resetAll();
});

// ─── Regresiones: idempotencia/disponibilidad/Make siguen intactas con el gate activo ──

test("Regresión: cancelar_reserva duplicado idéntico (mismo PLAYER dueño) -> IDEMPOTENT_DUPLICATE, no un segundo reenvío a Make", async () => {
  resetAll();
  const calls = [];
  const body = cancelarBody({ clave_reserva: "QA_AUTH_CANCEL_IDEM_001" });

  await withFakeFetch(
    routedFetch({
      airtableLookupImpl: async () => airtableLookupRecord({ claveReserva: "QA_AUTH_CANCEL_IDEM_001", email: "player@example.test" }),
      supabaseImpl: async () => supabaseUser({ email: "player@example.test", role: "PLAYER" }),
      calls,
    }),
    async () => {
      const first = await worker.fetch(reservaRequest(body, bearerAuthHeader()), envFor());
      assert.equal(first.status, 200);

      const second = await worker.fetch(reservaRequest(body, bearerAuthHeader()), envFor());
      const secondJson = await second.json();
      assert.equal(second.status, 409);
      assert.equal(secondJson.code, "IDEMPOTENT_DUPLICATE");
    }
  );

  assert.equal(calls.filter((c) => c.target === "make").length, 1);
  resetAll();
});

test("Regresión: crear_reserva de PLAYER contra un slot ya ocupado -> 409 SLOT_ALREADY_BOOKED (revalidación de disponibilidad sigue activa con el gate)", async () => {
  resetAll();
  const body = crearReservaBody({ reserva: { ...crearReservaBody().reserva, fecha: "2026-09-23", pista: "Pista 3", hora: "09:00" } });

  await withFakeFetch(
    routedFetch({
      supabaseImpl: async () => supabaseUser({ email: "player@example.test", role: "PLAYER" }),
      airtableDisponibilidadImpl: async () => ({
        ok: true,
        json: async () => ({
          records: [{ fields: { clave_slot: "2026-09-23|Pista 3|09:00", estado_reserva: "confirmada" } }],
        }),
      }),
      makeImpl: async () => { throw new Error("no debería llamar a Make: el slot ya está ocupado"); },
    }),
    async () => {
      const res = await worker.fetch(reservaRequest(body, bearerAuthHeader()), envFor());
      const data = await res.json();
      assert.equal(res.status, 409);
      assert.equal(data.error, "SLOT_ALREADY_BOOKED");
    }
  );
  resetAll();
});

test("Regresión: Make rechaza el reenvío (502) para un PLAYER autenticado creando su propia reserva -> 502, mensaje sin detalle interno", async () => {
  resetAll();
  const body = crearReservaBody({ reserva: { ...crearReservaBody().reserva, fecha: "2026-09-24" } });

  await withFakeFetch(
    routedFetch({
      supabaseImpl: async () => supabaseUser({ email: "player@example.test", role: "PLAYER" }),
      makeImpl: async () => new Response("Internal error detail that must never leak", { status: 500 }),
    }),
    async () => {
      const res = await worker.fetch(reservaRequest(body, bearerAuthHeader()), envFor());
      const data = await res.json();
      assert.equal(res.status, 502);
      assert.equal(JSON.stringify(data).includes("Internal error detail"), false);
    }
  );
  resetAll();
});

test("OPTIONS /api/reservas siempre responde 204, incluso con el gate de rol activo", async () => {
  const request = new Request("https://worker.test/api/reservas", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(request, envFor());
  assert.equal(res.status, 204);
});
