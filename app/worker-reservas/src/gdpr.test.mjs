import test from "node:test";
import assert from "node:assert/strict";

import worker, { __resetIdempotencyStoreForTests } from "./index.js";

// Flujo #9 "⚖️ Solicitud GDPR Acceso u Olvido de Datos" (Make 6323457):
// tests de handleGdprAcceso/handleGdprOlvido (worker-reservas/src/index.js).
// Ningún test hace una petición de red real: el fetch stub enruta por URL
// a Airtable/Supabase/Make, igual que en qr-acceso.test.mjs.

async function withFakeFetch(impl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

function routedFetch({ airtableImpl, makeImpl, supabaseImpl, calls = [] }) {
  return async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.includes("api.airtable.com")) {
      calls.push({ target: "airtable", url, init });
      return airtableImpl(url, init);
    }
    if (url.includes("/auth/v1/user")) {
      calls.push({ target: "supabase", url, init });
      return supabaseImpl(url, init);
    }
    calls.push({ target: "make", url, init });
    return makeImpl(url, init);
  };
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

function supabaseUser({ id = "user-gdpr-1", email, role }) {
  return { ok: true, json: async () => ({ id, email, app_metadata: { role } }) };
}

function bearerAuthHeader(token = "fake-jwt-token") {
  return { Authorization: `Bearer ${token}` };
}

function airtableRecordsResponse(records) {
  return { ok: true, text: async () => JSON.stringify({ records }) };
}

function reservaAirtableRecord({ claveReserva, pista = "Pista 1", estado = "confirmada", fecha, horaInicio = "09:00", horaFin = "10:30" }) {
  return {
    id: `rec_${claveReserva}`,
    fields: {
      clave_reserva: claveReserva,
      Pista: pista,
      estado_reserva: estado,
      fecha_reserva: fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
    },
  };
}

function gdprRequest(path, body, { headers = {}, env = {} } = {}) {
  return [
    new Request(`https://worker.test${path}`, {
      method: "POST",
      headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
    // ALLOWED_ORIGIN es necesario incluso para acceso/olvido en sí (no lo
    // comprueban ellos mismos) porque la fase de ejecución del olvido
    // reutiliza handleReservas, que SÍ falla cerrado si el Origin no está
    // en la lista permitida.
    { ALLOWED_ORIGIN: "http://localhost:5173", ...SUPABASE_ENV, ...AIRTABLE_ENV, ...env },
  ];
}

// ─── DERECHO DE ACCESO ──────────────────────────────────────────────────────

test("gdpr/acceso: sin autenticación → 401, ni Airtable ni Make se llaman", async () => {
  await withFakeFetch(
    async () => { throw new Error("no debería llamarse a fetch sin sesión"); },
    async () => {
      const [req, env] = gdprRequest("/api/gdpr/acceso", {});
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 401);
      assert.equal(data.ok, false);
    }
  );
});

test("gdpr/acceso: usuario autenticado → recibe sus propios datos (identidad + reservas reales)", async () => {
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([
        reservaAirtableRecord({ claveReserva: "CP04-A1", fecha: "2026-05-01" }),
      ]),
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls,
    }),
    async () => {
      const [req, env] = gdprRequest("/api/gdpr/acceso", {}, { headers: bearerAuthHeader() });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.tipo, "GDPR_ACCESO");
      assert.equal(data.titular.email, "jugador@test.example");
      assert.equal(data.datos.identidad.disponible, true);
      assert.equal(data.datos.identidad.registros[0].email, "jugador@test.example");
      assert.equal(data.datos.reservas.disponible, true);
      assert.equal(data.datos.reservas.registros.length, 1);
      assert.equal(data.datos.reservas.registros[0].clave_reserva, "CP04-A1");
    }
  );
});

test("gdpr/acceso: PLAYER intenta pedir el email de otro socio en el body → se ignora, se usa el propio", async () => {
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableImpl: async (url) => {
        assert.match(url, /jugador%40test\.example|jugador@test\.example|jugador/i);
        return airtableRecordsResponse([]);
      },
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls,
    }),
    async () => {
      const [req, env] = gdprRequest(
        "/api/gdpr/acceso",
        { email: "otro-socio@test.example" },
        { headers: bearerAuthHeader() }
      );
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.titular.email, "jugador@test.example");
      assert.notEqual(data.titular.email, "otro-socio@test.example");
    }
  );
});

test("gdpr/acceso: un rol falso enviado en el body nunca cambia el rol real verificado por Supabase", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([]),
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest(
        "/api/gdpr/acceso",
        { role: "ADMIN", email: "otro-socio@test.example" },
        { headers: bearerAuthHeader() }
      );
      const res = await worker.fetch(req, env);
      const data = await res.json();
      // Con role:"ADMIN" inventado en el body pero rol real PLAYER, el email
      // ajeno se sigue ignorando: la autorización administrativa depende
      // SOLO de auth.role (Supabase), nunca del body.
      assert.equal(data.solicitante.role, "PLAYER");
      assert.equal(data.titular.email, "jugador@test.example");
    }
  );
});

test("gdpr/acceso: userId ajeno en el body nunca se usa — identidad siempre viene de la sesión verificada", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([]),
      supabaseImpl: async () => supabaseUser({ id: "user-real-1", email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest(
        "/api/gdpr/acceso",
        { userId: "user-ajeno-999" },
        { headers: bearerAuthHeader() }
      );
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.datos.identidad.registros[0].user_id, "user-real-1");
    }
  );
});

test("gdpr/acceso: filtro Airtable usa el email del titular — nunca devuelve reservas de terceros", async () => {
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableImpl: async (url) => {
        assert.ok(url.includes("filterByFormula"));
        assert.ok(decodeURIComponent(url).includes('jugador@test.example'));
        return airtableRecordsResponse([reservaAirtableRecord({ claveReserva: "CP04-SOLO-PROPIA", fecha: "2026-05-01" })]);
      },
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls,
    }),
    async () => {
      const [req, env] = gdprRequest("/api/gdpr/acceso", {}, { headers: bearerAuthHeader() });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.datos.reservas.registros.length, 1);
      assert.equal(data.datos.reservas.registros[0].clave_reserva, "CP04-SOLO-PROPIA");
    }
  );
});

test("gdpr/acceso: ADMIN puede consultar los datos de otro socio pasando su email", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([reservaAirtableRecord({ claveReserva: "CP04-B1", fecha: "2026-06-01" })]),
      supabaseImpl: async () => supabaseUser({ email: "soporte@club-padel-04.example", role: "SUPPORT" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest(
        "/api/gdpr/acceso",
        { email: "socio-revisado@test.example" },
        { headers: bearerAuthHeader() }
      );
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.titular.email, "socio-revisado@test.example");
      // Identidad de un tercero no se puede resolver sin tabla JUGADORES:
      // se marca honestamente en vez de inventarse.
      assert.equal(data.datos.identidad.disponible, false);
      assert.equal(data.datos.identidad.motivo, "SIN_FUENTE_PARA_RESOLVER_TERCERO");
    }
  );
});

test("gdpr/acceso: categorías sin tabla configurada (lista_espera, competiciones, logs, perfil) → disponible:false, nunca fabricadas", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([]),
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest("/api/gdpr/acceso", {}, { headers: bearerAuthHeader() });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.datos.lista_espera.disponible, false);
      assert.equal(data.datos.lista_espera.motivo, "NO_CONFIGURADO");
      assert.equal(data.datos.competiciones.disponible, false);
      assert.equal(data.datos.logs_trazabilidad.disponible, false);
      assert.equal(data.datos.perfil.disponible, false);
      assert.equal(data.datos.perfil.motivo, "ALMACENADO_SOLO_EN_CLIENTE");
    }
  );
});

test("gdpr/acceso: respuesta es JSON válido, estable y con las categorías mínimas exigidas", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([]),
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest("/api/gdpr/acceso", {}, { headers: bearerAuthHeader() });
      const res = await worker.fetch(req, env);
      assert.equal(res.headers.get("Content-Type"), "application/json; charset=utf-8");
      const data = await res.json();
      for (const key of ["identidad", "perfil", "reservas", "lista_espera", "competiciones", "logs_trazabilidad"]) {
        assert.ok(Object.prototype.hasOwnProperty.call(data.datos, key), `falta categoría ${key}`);
      }
    }
  );
});

// ─── DERECHO DE OLVIDO ──────────────────────────────────────────────────────

test("gdpr/olvido: sin autenticación → 401", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    async () => { throw new Error("no debería llamarse a fetch sin sesión"); },
    async () => {
      const [req, env] = gdprRequest("/api/gdpr/olvido", { confirmar: true });
      const res = await worker.fetch(req, env);
      assert.equal(res.status, 401);
    }
  );
});

test("gdpr/olvido: falta confirmación explícita → 400 CONFIRMATION_REQUIRED, nunca procesa", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => { throw new Error("no debería consultar Airtable sin confirmar"); },
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => { throw new Error("no debería notificar a Make sin confirmar"); },
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest("/api/gdpr/olvido", {}, { headers: bearerAuthHeader() });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.equal(data.error, "CONFIRMATION_REQUIRED");
    }
  );
});

test("gdpr/olvido: un jugador puede solicitar sobre sí mismo → SOLICITADO o REQUIERE_REVISION_HUMANA, nunca ejecuta nada", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([]),
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest("/api/gdpr/olvido", { confirmar: true }, { headers: bearerAuthHeader() });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.tipo, "GDPR_OLVIDO");
      assert.equal(data.titular.email, "jugador@test.example");
      assert.ok(["SOLICITADO", "REQUIERE_REVISION_HUMANA"].includes(data.estado));
      assert.equal(data.acciones, undefined);
    }
  );
});

test("gdpr/olvido: PLAYER no puede solicitar sobre un tercero — el email del body se ignora", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([]),
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest(
        "/api/gdpr/olvido",
        { confirmar: true, email: "otro-socio@test.example" },
        { headers: bearerAuthHeader() }
      );
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.titular.email, "jugador@test.example");
    }
  );
});

test("gdpr/olvido: BAJA de jugador y GDPR_OLVIDO son operaciones distintas — nunca se llama al webhook de baja", async () => {
  __resetIdempotencyStoreForTests();
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([]),
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async (url) => {
        assert.ok(!url.includes("baja"), "no debe tocar el webhook de baja de jugador");
        return { ok: true, text: async () => "ok" };
      },
      calls,
    }),
    async () => {
      const [req, env] = gdprRequest(
        "/api/gdpr/olvido",
        { confirmar: true },
        { headers: bearerAuthHeader(), env: { MAKE_BAJA_JUGADOR_WEBHOOK: "https://hook.make.test/baja-marca" } }
      );
      const res = await worker.fetch(req, env);
      assert.equal(res.status, 200);
    }
  );
});

test("gdpr/olvido: detecta reservas futuras reales y marca REQUIERE_REVISION_HUMANA", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([
        reservaAirtableRecord({ claveReserva: "CP04-FUTURA-1", fecha: "2099-01-01" }),
      ]),
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest("/api/gdpr/olvido", { confirmar: true }, { headers: bearerAuthHeader() });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.estado, "REQUIERE_REVISION_HUMANA");
      assert.equal(data.dependencias.reservas_futuras.cantidad, 1);
    }
  );
});

test("gdpr/olvido: lista de espera nunca se marca como verificada — no hay tabla configurada para leerla", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([]),
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest("/api/gdpr/olvido", { confirmar: true }, { headers: bearerAuthHeader() });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.dependencias.lista_espera_activa.verificable, false);
      assert.equal(data.dependencias.lista_espera_activa.motivo, "NO_CONFIGURADO");
    }
  );
});

test("gdpr/olvido: STAFF sin permiso administrativo no puede ejecutar (ejecutar:true) → 403", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => { throw new Error("no debería llegar a consultar Airtable"); },
      supabaseImpl: async () => supabaseUser({ email: "staff@club-padel-04.example", role: "STAFF" }),
      makeImpl: async () => { throw new Error("no debería notificar a Make"); },
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest(
        "/api/gdpr/olvido",
        { confirmar: true, ejecutar: true },
        { headers: bearerAuthHeader() }
      );
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 403);
      assert.equal(data.error, "FORBIDDEN");
    }
  );
});

test("gdpr/olvido: ADMIN/SUPPORT puede ejecutar (ejecutar:true) y reutiliza cancelar_reserva + salir de lista de espera", async () => {
  __resetIdempotencyStoreForTests();
  const calls = [];
  await withFakeFetch(
    async (input) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("api.airtable.com")) {
        calls.push({ target: "airtable", url });
        return airtableRecordsResponse([
          reservaAirtableRecord({ claveReserva: "CP04-FUTURA-EXEC-1", fecha: "2099-02-02" }),
        ]);
      }
      if (url.includes("/auth/v1/user")) {
        calls.push({ target: "supabase", url });
        return supabaseUser({ email: "admin@club-padel-04.example", role: "ADMIN" });
      }
      // MAKE_RESERVAS_WEBHOOK: handleReservas se invoca directamente como
      // función (no por fetch); el único fetch real que dispara es este,
      // dentro de forwardToMake, al reenviar cancelar_reserva.
      if (url === "https://hook.make.test/reservas") {
        calls.push({ target: "make_reservas", url });
        return { ok: true, status: 200, text: async () => "ok" };
      }
      // MAKE_LISTA_ESPERA_PISTA_WEBHOOK: idem, disparado dentro de
      // handleListaEspera al reenviar la acción "salir". Debe devolver un
      // JSON interpretable — handleListaEspera falla con 502 si no lo es.
      if (url === "https://hook.make.test/lista-espera") {
        calls.push({ target: "make_lista_espera", url });
        return { ok: true, status: 200, text: async () => JSON.stringify({ ok: true, orden_espera: null }) };
      }
      calls.push({ target: "make_gdpr_o_desconocido", url });
      return { ok: true, text: async () => "ok" };
    },
    async () => {
      const [req, env] = gdprRequest(
        "/api/gdpr/olvido",
        {
          confirmar: true,
          ejecutar: true,
          lista_espera_slots: [{ pista: "Pista 2", fecha: "2026-09-25", hora_inicio: "09:00", hora_fin: "10:30" }],
        },
        {
          headers: bearerAuthHeader(),
          env: { MAKE_RESERVAS_WEBHOOK: "https://hook.make.test/reservas", MAKE_LISTA_ESPERA_PISTA_WEBHOOK: "https://hook.make.test/lista-espera" },
        }
      );
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.estado, "EJECUTADO");
      assert.equal(data.acciones.reservas.length, 1);
      assert.equal(data.acciones.reservas[0].ok, true);
      assert.equal(data.acciones.lista_espera.length, 1);
      assert.equal(data.acciones.lista_espera[0].ok, true);
      assert.ok(calls.some((c) => c.target === "make_reservas"));
      assert.ok(calls.some((c) => c.target === "make_lista_espera"));
    }
  );
});

test("gdpr/olvido: ejecución parcial (una reserva cancela, otra falla) → estado PARCIAL", async () => {
  __resetIdempotencyStoreForTests();
  let reservaIntentos = 0;
  await withFakeFetch(
    async (input) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("api.airtable.com")) {
        return airtableRecordsResponse([
          reservaAirtableRecord({ claveReserva: "CP04-OK-1", fecha: "2099-03-01" }),
          reservaAirtableRecord({ claveReserva: "CP04-FAIL-1", fecha: "2099-03-02" }),
        ]);
      }
      if (url.includes("/auth/v1/user")) {
        return supabaseUser({ email: "admin@club-padel-04.example", role: "ADMIN" });
      }
      if (url === "https://hook.make.test/reservas") {
        reservaIntentos += 1;
        if (reservaIntentos === 1) return { ok: true, status: 200, text: async () => "ok" };
        return { ok: false, status: 502, text: async () => "error" };
      }
      return { ok: true, text: async () => "ok" };
    },
    async () => {
      const [req, env] = gdprRequest(
        "/api/gdpr/olvido",
        { confirmar: true, ejecutar: true },
        { headers: bearerAuthHeader(), env: { MAKE_RESERVAS_WEBHOOK: "https://hook.make.test/reservas" } }
      );
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.estado, "PARCIAL");
      assert.equal(data.acciones.reservas.length, 2);
    }
  );
});

test("gdpr/olvido: doble ejecución para el mismo socio queda bloqueada (idempotencia)", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([]),
      supabaseImpl: async () => supabaseUser({ email: "admin@club-padel-04.example", role: "ADMIN" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req1, env1] = gdprRequest(
        "/api/gdpr/olvido",
        { confirmar: true, ejecutar: true, email: "socio-doble@test.example" },
        { headers: bearerAuthHeader() }
      );
      const res1 = await worker.fetch(req1, env1);
      assert.equal(res1.status, 200);

      const [req2, env2] = gdprRequest(
        "/api/gdpr/olvido",
        { confirmar: true, ejecutar: true, email: "socio-doble@test.example" },
        { headers: bearerAuthHeader() }
      );
      const res2 = await worker.fetch(req2, env2);
      const data2 = await res2.json();
      assert.equal(res2.status, 409);
      assert.equal(data2.code, "IDEMPOTENT_DUPLICATE");
    }
  );
});

test("gdpr/olvido: sin MAKE_GDPR_WEBHOOK configurado, la solicitud se registra igualmente (auditoria.registrado_en_make=false, nunca finge éxito de Make)", async () => {
  __resetIdempotencyStoreForTests();
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([]),
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => { throw new Error("no debería llamar a Make: no hay MAKE_GDPR_WEBHOOK"); },
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest("/api/gdpr/olvido", { confirmar: true }, { headers: bearerAuthHeader() });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.auditoria.registrado_en_make, false);
    }
  );
});

test("gdpr/acceso: el evento enviado a Make incluye id_solicitud UUID generado en servidor — nunca del cliente", async () => {
  let makePayload;
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableRecordsResponse([]),
      supabaseImpl: async () => supabaseUser({ email: "jugador@test.example", role: "PLAYER" }),
      makeImpl: async (url, init) => {
        makePayload = JSON.parse(init.body);
        return { ok: true, text: async () => "ok" };
      },
      calls: [],
    }),
    async () => {
      const [req, env] = gdprRequest(
        "/api/gdpr/acceso",
        { id_solicitud: "cliente-no-debe-controlar-esto" },
        { headers: bearerAuthHeader(), env: { MAKE_GDPR_WEBHOOK: "https://hook.make.test/gdpr" } }
      );
      const res = await worker.fetch(req, env);
      assert.equal(res.status, 200);
      assert.ok(makePayload, "Make debe ser llamado cuando MAKE_GDPR_WEBHOOK está configurado");
      // UUID v4 generado server-side: formato estable, nunca el valor del cliente
      assert.match(
        makePayload.id_solicitud,
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        "id_solicitud debe ser un UUID válido generado en el servidor"
      );
      assert.notEqual(makePayload.id_solicitud, "cliente-no-debe-controlar-esto");
      assert.equal(makePayload.tipo, "GDPR_ACCESO");
    }
  );
});

test("gdpr/olvido: el evento enviado a Make incluye id_solicitud UUID distinto para solicitud y ejecución", async () => {
  __resetIdempotencyStoreForTests();
  const uuidsVistos = [];
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  await withFakeFetch(
    async (input, init) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("api.airtable.com")) return airtableRecordsResponse([]);
      if (url.includes("/auth/v1/user")) return supabaseUser({ email: "admin@club-padel-04.example", role: "ADMIN" });
      if (url.includes("hook.make.test/reservas")) return { ok: true, status: 200, text: async () => "ok" };
      // Make GDPR webhook
      const body = JSON.parse(init?.body ?? "{}");
      uuidsVistos.push(body.id_solicitud);
      return { ok: true, text: async () => "ok" };
    },
    async () => {
      // Fase solicitud
      const [reqS, envS] = gdprRequest(
        "/api/gdpr/olvido",
        { confirmar: true },
        { headers: bearerAuthHeader(), env: { MAKE_GDPR_WEBHOOK: "https://hook.make.test/gdpr", MAKE_RESERVAS_WEBHOOK: "https://hook.make.test/reservas" } }
      );
      const resS = await worker.fetch(reqS, envS);
      assert.equal(resS.status, 200);

      __resetIdempotencyStoreForTests();

      // Fase ejecución
      const [reqE, envE] = gdprRequest(
        "/api/gdpr/olvido",
        { confirmar: true, ejecutar: true },
        { headers: bearerAuthHeader(), env: { MAKE_GDPR_WEBHOOK: "https://hook.make.test/gdpr", MAKE_RESERVAS_WEBHOOK: "https://hook.make.test/reservas" } }
      );
      const resE = await worker.fetch(reqE, envE);
      assert.equal(resE.status, 200);

      assert.equal(uuidsVistos.length, 2, "Make debe recibir exactamente un evento por fase");
      for (const u of uuidsVistos) {
        assert.match(u, UUID_RE, `id_solicitud debe ser UUID: ${u}`);
      }
      assert.notEqual(uuidsVistos[0], uuidsVistos[1], "Solicitud y ejecución generan UUID distintos — Make los enlaza por email_titular");
    }
  );
});

test("OPTIONS en /api/gdpr/acceso y /api/gdpr/olvido → 204, sin exigir sesión", async () => {
  const reqAcceso = new Request("https://worker.test/api/gdpr/acceso", { method: "OPTIONS", headers: { Origin: "http://localhost:5173" } });
  const resAcceso = await worker.fetch(reqAcceso, { ...SUPABASE_ENV });
  assert.equal(resAcceso.status, 204);

  const reqOlvido = new Request("https://worker.test/api/gdpr/olvido", { method: "OPTIONS", headers: { Origin: "http://localhost:5173" } });
  const resOlvido = await worker.fetch(reqOlvido, { ...SUPABASE_ENV });
  assert.equal(resOlvido.status, 204);
});
