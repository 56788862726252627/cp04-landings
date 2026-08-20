import test from "node:test";
import assert from "node:assert/strict";

import worker, { QR_REASON_CODES } from "./index.js";

// Tests de handleQrGenerate y handleQrValidate (worker-reservas/src/index.js).
// Ningún test hace una petición de red real. Cuando hace falta simular Make,
// se sustituye temporalmente globalThis.fetch por un stub, restaurado en finally.

async function withFakeFetch(impl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

// Airtable configurado por defecto: desde el fix de defensa en profundidad,
// handleQrGenerate necesita consultar la reserva real ANTES de llamar a
// Make (falla cerrado si no puede). Los tests que quieran ejercitar
// "Airtable no configurado" lo desactivan explícitamente vía env.
function makeQrGenerateRequest(body = {}, { headers = {}, env = {} } = {}) {
  return [
    new Request("https://worker.test/api/qr/generate", {
      method: "POST",
      headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
    { MAKE_QR_ACCESO_WEBHOOK: "https://hook.make.test/qr-generate", ...AIRTABLE_ENV, ...env },
  ];
}

function makeQrValidateRequest(body = {}, { headers = {}, env = {} } = {}) {
  return [
    new Request("https://worker.test/api/qr/validate", {
      method: "POST",
      headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
    { MAKE_CONTROL_QR_WEBHOOK: "https://hook.make.test/qr-validate", ...env },
  ];
}

// Entorno con Airtable configurado (además del webhook de Make), para poder
// ejercitar cp04LookupReservaParaQr (defensa en profundidad pista real vs
// pista solicitada). Usa el mismo AIRTABLE_TABLE_ID que el resto del Worker.
const AIRTABLE_ENV = {
  AIRTABLE_TOKEN: "test-token",
  AIRTABLE_BASE_ID: "appTestBase",
  AIRTABLE_TABLE_ID: "tblTestReservas",
};

// Fetch stub que enruta según la URL: peticiones a api.airtable.com van a
// `airtableImpl`, peticiones a /auth/v1/user (verificación Supabase) van a
// `supabaseImpl`, cualquier otra (el webhook de Make) va a `makeImpl`.
// `calls` acumula `{ target }` por cada invocación, para poder comprobar
// cuántas veces (y en qué orden) se llamó a cada sistema.
function routedFetch({ airtableImpl, makeImpl, supabaseImpl, calls }) {
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

function airtableReservaRecord({
  claveReserva,
  pista,
  estado = "confirmada",
  nombre,
  email,
  fecha,
  horaInicio,
  horaFin,
  recordId = "recTestReserva001",
} = {}) {
  return {
    ok: true,
    json: async () => ({
      records: [
        {
          id: recordId,
          fields: {
            clave_reserva: claveReserva,
            Pista: pista,
            estado_reserva: estado,
            ...(nombre !== undefined ? { Nombre: nombre } : {}),
            ...(email !== undefined ? { Email: email } : {}),
            ...(fecha !== undefined ? { fecha_reserva: fecha } : {}),
            ...(horaInicio !== undefined ? { hora_inicio: horaInicio } : {}),
            ...(horaFin !== undefined ? { hora_fin: horaFin } : {}),
          },
        },
      ],
    }),
  };
}

const AIRTABLE_RECORD_NOT_FOUND = { ok: true, json: async () => ({ records: [] }) };

// Entorno Supabase falso, para ejercitar el gate de rol/propiedad de
// /api/qr/generate a través de worker.fetch(). Ningún test hace una llamada
// real: la petición a `${SUPABASE_URL}/auth/v1/user` la intercepta el fetch
// stub de cada test vía `supabaseImpl`.
const SUPABASE_ENV = {
  SUPABASE_URL: "https://fake.supabase.test",
  SUPABASE_ANON_KEY: "fake-anon-key",
};

function supabaseUser({ id = "user-qa-1", email, role }) {
  return { ok: true, json: async () => ({ id, email, app_metadata: { role } }) };
}

function bearerAuthHeader(token = "fake-jwt-token") {
  return { Authorization: `Bearer ${token}` };
}

const VALID_GENERATE_BODY = {
  clave_reserva: "CP04-TEST-2026-07-20-PISTA2-09",
  player_id:     "player-qa@test.example",
  club_id:       "club-padel-04",
  pista:         "Pista 2",
  fecha:         "2026-07-20",
  hora_inicio:   "09:00",
  hora_fin:      "10:30",
  record_id:     "rec_TEST_AIRTABLE_ID_QA",
  nombre:        "Jugador QA Test",
  email:         "jugador-qa@test.example",
};

// Reserva real en Airtable que coincide exactamente con VALID_GENERATE_BODY
// — el caso feliz. Los tests de defensa en profundidad sobreescriben campos
// concretos (email de otro dueño, pista distinta, estado no confirmada...)
// para comprobar que el Worker usa SIEMPRE la reserva real, nunca el body.
function validGenerateAirtableRecord(overrides = {}) {
  return airtableReservaRecord({
    claveReserva: VALID_GENERATE_BODY.clave_reserva,
    pista:        VALID_GENERATE_BODY.pista,
    estado:       "confirmada",
    nombre:       VALID_GENERATE_BODY.nombre,
    email:        VALID_GENERATE_BODY.email,
    fecha:        VALID_GENERATE_BODY.fecha,
    horaInicio:   VALID_GENERATE_BODY.hora_inicio,
    horaFin:      VALID_GENERATE_BODY.hora_fin,
    recordId:     "recTestReserva001",
    ...overrides,
  });
}

const VALID_VALIDATE_BODY = {
  clave_reserva: "CP04-TEST-2026-07-20-PISTA2-09",
  pista:         "Pista 2",
  club_id:       "cp04-antequera",
  staff_id:      "staff-qa@test.example",
};

// ─── GENERACIÓN QR ────────────────────────────────────────────────────────────

test("qr/generate: sin webhook configurado → 503 sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => { throw new Error("no debería llamar a fetch"); },
    async () => {
      const [req] = makeQrGenerateRequest(VALID_GENERATE_BODY, { env: {} });
      const res = await worker.fetch(req, {});
      const data = await res.json();
      assert.equal(res.status, 503);
      assert.equal(data.ok, false);
      assert.match(data.error, /webhook not configured/i);
    }
  );
});

test("qr/generate: método no POST → 405", async () => {
  const req = new Request("https://worker.test/api/qr/generate", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(req, { MAKE_QR_ACCESO_WEBHOOK: "https://hook.test/qr" });
  assert.equal(res.status, 405);
});

test("qr/generate: OPTIONS → 204 (CORS preflight)", async () => {
  const req = new Request("https://worker.test/api/qr/generate", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(req, { MAKE_QR_ACCESO_WEBHOOK: "https://hook.test/qr" });
  assert.equal(res.status, 204);
});

test("qr/generate: clave_reserva faltante → 400 con campo de error", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, clave_reserva: "" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.clave_reserva);
    }
  );
});

test("qr/generate: pista inválida → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, pista: "PistaX" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.pista);
    }
  );
});

test("qr/generate: fecha inválida → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, fecha: "20-07-2026" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.fecha);
    }
  );
});

test("qr/generate: player_id faltante → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, player_id: "" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.player_id);
    }
  );
});

test("qr/generate: hora_fin faltante → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, hora_fin: "" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.hora_fin);
    }
  );
});

test("qr/generate: record_id faltante → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, record_id: "" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.record_id);
    }
  );
});

test("qr/generate: nombre faltante → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, nombre: "" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.nombre);
    }
  );
});

test("qr/generate: email faltante → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, email: "" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.email);
    }
  );
});

test("qr/generate: payload enviado a Make cumple contrato Make escenario 6244975", async () => {
  let capturedBody = null;
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord(),
      makeImpl: async (url, opts) => {
        capturedBody = JSON.parse(opts.body);
        return { ok: true, text: async () => "generacion_ok" };
      },
      calls,
    }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      assert.equal(res.status, 200);
      assert.ok(capturedBody, "debe haber capturado el payload enviado a Make");
      // Campos del contrato Make
      assert.equal(capturedBody.event,           "reserva_confirmada");
      assert.equal(capturedBody.club_id,         "club-padel-04");
      assert.equal(capturedBody.record_id,       "recTestReserva001", "record_id debe ser el de Airtable, no el del body");
      assert.equal(capturedBody.nombre,          VALID_GENERATE_BODY.nombre);
      assert.equal(capturedBody.email,           VALID_GENERATE_BODY.email);
      assert.equal(capturedBody.clave_reserva,   VALID_GENERATE_BODY.clave_reserva);
      assert.equal(capturedBody.fecha_reserva,   VALID_GENERATE_BODY.fecha);
      assert.equal(capturedBody.hora_inicio,     VALID_GENERATE_BODY.hora_inicio);
      assert.equal(capturedBody.hora_fin,        VALID_GENERATE_BODY.hora_fin);
      assert.equal(capturedBody.pista,           VALID_GENERATE_BODY.pista);
      assert.equal(capturedBody.source,          "app_cp04");
      assert.equal(capturedBody.test_mode,       false);
      assert.ok(capturedBody.idempotency_key,    "debe tener idempotency_key");
      // Campos que NO deben ir a Make
      assert.equal(capturedBody.player_id,       undefined, "player_id no debe ir a Make");
      assert.equal(capturedBody.accion,          undefined, "accion (legado) no debe ir a Make");
      assert.equal(capturedBody.origen,          undefined, "origen (legado) no debe ir a Make");
      // Airtable se consultó ANTES que Make
      assert.deepEqual(calls.map((c) => c.target), ["airtable", "make"]);
    }
  );
});

test("qr/generate: idempotency_key es determinista (misma clave_reserva = mismo key)", async () => {
  const captured = [];
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord(),
      makeImpl: async (url, opts) => {
        captured.push(JSON.parse(opts.body).idempotency_key);
        return { ok: true, text: async () => "ok" };
      },
      calls: [],
    }),
    async () => {
      const [req1, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const [req2]      = makeQrGenerateRequest(VALID_GENERATE_BODY);
      await worker.fetch(req1, env);
      await worker.fetch(req2, env);
      assert.equal(captured.length, 2);
      assert.equal(captured[0], captured[1], "idempotency_key debe ser idéntico para la misma clave_reserva");
      assert.ok(captured[0].includes(VALID_GENERATE_BODY.clave_reserva), "key debe incluir la clave_reserva");
    }
  );
});

test("qr/generate: Make responde ok → 200 con valid_from/valid_until/issued_at", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord(),
      makeImpl: async () => ({ ok: true, text: async () => "generacion_ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.clave_reserva, VALID_GENERATE_BODY.clave_reserva);
      assert.equal(data.pista, VALID_GENERATE_BODY.pista);
      assert.ok(data.valid_from, "debe tener valid_from");
      assert.ok(data.valid_until, "debe tener valid_until");
      assert.ok(data.issued_at, "debe tener issued_at");
      assert.ok(new Date(data.valid_until) > new Date(data.valid_from), "valid_until > valid_from");
    }
  );
});

test("qr/generate: valid_from es antes de hora_inicio (ventana de anticipación)", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord(),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      const fechaBase = new Date("2026-07-20T09:00:00Z");
      const validFrom = new Date(data.valid_from);
      assert.ok(validFrom < fechaBase, "valid_from debe ser antes de la hora de inicio");
    }
  );
});

test("qr/generate: Make responde error → 502", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord(),
      makeImpl: async () => ({ ok: false, status: 503, text: async () => "error" }),
      calls: [],
    }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 502);
      assert.equal(data.ok, false);
    }
  );
});

test("qr/generate: fallo de red hacia Make → 502 NETWORK_ERROR, nunca cuelga", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord(),
      makeImpl: async () => { throw new Error("network down"); },
      calls: [],
    }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 502);
      assert.equal(data.ok, false);
      assert.equal(data.code, "NETWORK_ERROR");
    }
  );
});

test("qr/generate: doble petición con mismo body → ambas 200 (idempotente desde app)", async () => {
  let makeCallCount = 0;
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord(),
      makeImpl: async () => { makeCallCount++; return { ok: true, text: async () => "ok" }; },
      calls: [],
    }),
    async () => {
      const [req1, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const [req2] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res1 = await worker.fetch(req1, env);
      const res2 = await worker.fetch(req2, env);
      assert.equal(res1.status, 200);
      assert.equal(res2.status, 200);
      assert.equal(makeCallCount, 2); // Make se llama 2x — idempotencia en Make side
    }
  );
});

test("qr/generate: no expone player_id en respuesta (privacidad mínima)", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord(),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.player_id, undefined, "player_id no debe estar en la respuesta pública");
    }
  );
});

// ─── DEFENSA EN PROFUNDIDAD: LA RESERVA REAL DE AIRTABLE MANDA, NUNCA EL BODY ─
// Causa raíz encontrada en la auditoría de cierre (2026-08-20): el escenario
// Make 6244975 (verificado por blueprint real) NO valida la reserva contra
// Airtable — solo comprueba event/club_id/record_id "exist" y envía el email
// con el QR a `{{1.email}}` tal cual llega. Sin este bloque, cualquier
// PLAYER autenticado podría generarse (y recibirse por email) un QR de
// acceso válido para una `clave_reserva` ajena, con pista/horario/email
// inventados. El Worker ahora es la única fuente de verdad antes de generar
// y enviar nada.

test("C) clave_reserva inexistente en Airtable → 404, Make nunca se llama", async () => {
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => AIRTABLE_RECORD_NOT_FOUND,
      makeImpl: async () => { throw new Error("no debería llamar a Make: la reserva no existe"); },
      calls,
    }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 404);
      assert.equal(data.ok, false);
      assert.equal(data.code, "RESERVATION_NOT_FOUND");
      assert.deepEqual(calls.map((c) => c.target), ["airtable"]);
    }
  );
});

test("D) reserva encontrada pero NO confirmada (pendiente/cancelada) → 409, Make nunca se llama, no genera QR", async () => {
  for (const estado of ["pendiente", "cancelada", "reprogramada", "no_show"]) {
    const calls = [];
    await withFakeFetch(
      routedFetch({
        airtableImpl: async () => validGenerateAirtableRecord({ estado }),
        makeImpl: async () => { throw new Error(`no debería llamar a Make: estado=${estado}`); },
        calls,
      }),
      async () => {
        const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
        const res = await worker.fetch(req, env);
        const data = await res.json();
        assert.equal(res.status, 409, `estado=${estado}`);
        assert.equal(data.ok, false, `estado=${estado}`);
        assert.equal(data.code, "RESERVATION_NOT_CONFIRMED", `estado=${estado}`);
        assert.deepEqual(calls.map((c) => c.target), ["airtable"], `estado=${estado}`);
      }
    );
  }
});

test("E) club_id del body es ignorado: siempre se envía club-padel-04 a Make (cross-tenant seguro por diseño)", async () => {
  let capturedBody = null;
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord(),
      makeImpl: async (url, opts) => {
        capturedBody = JSON.parse(opts.body);
        return { ok: true, text: async () => "ok" };
      },
      calls: [],
    }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, club_id: "otro-club-cualquiera" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      assert.equal(res.status, 200);
      assert.equal(capturedBody.club_id, "club-padel-04");
    }
  );
});

test("F) pista del body incoherente con la reserva real → 409 MISMATCHED_COURT, Make nunca se llama", async () => {
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord({ pista: "Pista 3" }),
      makeImpl: async () => { throw new Error("no debería llamar a Make: pista incoherente"); },
      calls,
    }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY); // body pide Pista 2, real es Pista 3
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 409);
      assert.equal(data.ok, false);
      assert.equal(data.code, "MISMATCHED_COURT");
      assert.deepEqual(calls.map((c) => c.target), ["airtable"]);
    }
  );
});

test("K) el email de destino SIEMPRE es el de la reserva real, nunca el que mande el cliente (anti-secuestro de QR ajeno)", async () => {
  let capturedBody = null;
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord({
        email: "dueno-real-de-la-reserva@test.example",
        nombre: "Dueño Real",
      }),
      makeImpl: async (url, opts) => {
        capturedBody = JSON.parse(opts.body);
        return { ok: true, text: async () => "ok" };
      },
      calls: [],
    }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, email: "atacante@evil.example", nombre: "Atacante" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      assert.equal(res.status, 200);
      assert.equal(capturedBody.email, "dueno-real-de-la-reserva@test.example");
      assert.equal(capturedBody.nombre, "Dueño Real");
      assert.notEqual(capturedBody.email, "atacante@evil.example");
    }
  );
});

test("Airtable no configurado → 503 RESERVATION_CHECK_FAILED, falla cerrado (a diferencia de qr/validate)", async () => {
  await withFakeFetch(
    async () => { throw new Error("no debería llamar a fetch: sin Airtable no se puede verificar la reserva"); },
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY, {
        env: { AIRTABLE_TOKEN: undefined, AIRTABLE_BASE_ID: undefined, AIRTABLE_TABLE_ID: undefined },
      });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 503);
      assert.equal(data.ok, false);
      assert.equal(data.code, "RESERVATION_CHECK_FAILED");
    }
  );
});

test("error de red al consultar Airtable → 503 RESERVATION_CHECK_FAILED, Make nunca se llama", async () => {
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => { throw new Error("network down"); },
      makeImpl: async () => { throw new Error("no debería llamar a Make: Airtable no verificó la reserva"); },
      calls,
    }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 503);
      assert.equal(data.code, "RESERVATION_CHECK_FAILED");
      assert.deepEqual(calls.map((c) => c.target), ["airtable"]);
    }
  );
});

// ─── ROL / PROPIEDAD (PLAYER solo su propia reserva; STAFF+ sin restricción) ──

test("H1) con CP04_ENFORCE_ROLE_GATES=true y sin token → 401 antes de llegar al handler (Make nunca se llama)", async () => {
  await withFakeFetch(
    async () => { throw new Error("no debería llamarse a fetch: el gate de rol debe bloquear antes"); },
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY, {
        env: { CP04_ENFORCE_ROLE_GATES: "true" },
      });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 401);
      assert.equal(data.ok, false);
    }
  );
});

test("H2) PLAYER autenticado con el email de la reserva real → 200 (genera su propio QR)", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord(), // email real = VALID_GENERATE_BODY.email
      supabaseImpl: async () => supabaseUser({ email: VALID_GENERATE_BODY.email, role: "PLAYER" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY, {
        headers: bearerAuthHeader(),
        env: { ...SUPABASE_ENV, CP04_ENFORCE_ROLE_GATES: "true" },
      });
      const res = await worker.fetch(req, env);
      assert.equal(res.status, 200);
    }
  );
});

test("H3) PLAYER autenticado con OTRO email → 403 FORBIDDEN, Make nunca se llama (no puede robar el QR de otro jugador)", async () => {
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord(), // email real = VALID_GENERATE_BODY.email
      supabaseImpl: async () => supabaseUser({ email: "otro-jugador@test.example", role: "PLAYER" }),
      makeImpl: async () => { throw new Error("no debería llamar a Make: PLAYER intenta robar el QR de otro"); },
      calls,
    }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY, {
        headers: bearerAuthHeader(),
        env: { ...SUPABASE_ENV, CP04_ENFORCE_ROLE_GATES: "true" },
      });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 403);
      assert.equal(data.ok, false);
      assert.equal(data.error, "FORBIDDEN");
      assert.deepEqual(calls.map((c) => c.target), ["supabase", "airtable"]);
    }
  );
});

test("H4) STAFF autenticado puede generar el QR de un jugador aunque el email no coincida (soporte/recepción)", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => validGenerateAirtableRecord(),
      supabaseImpl: async () => supabaseUser({ email: "recepcion@club-padel-04.example", role: "STAFF" }),
      makeImpl: async () => ({ ok: true, text: async () => "ok" }),
      calls: [],
    }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY, {
        headers: bearerAuthHeader(),
        env: { ...SUPABASE_ENV, CP04_ENFORCE_ROLE_GATES: "true" },
      });
      const res = await worker.fetch(req, env);
      assert.equal(res.status, 200);
    }
  );
});

test("OPTIONS siempre responde 204, incluso con el gate de rol activo", async () => {
  const request = new Request("https://worker.test/api/qr/generate", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(request, {
    MAKE_QR_ACCESO_WEBHOOK: "https://hook.test/qr",
    CP04_ENFORCE_ROLE_GATES: "true",
  });
  assert.equal(res.status, 204);
});

// ─── VALIDACIÓN / CONTROL QR ─────────────────────────────────────────────────

test("qr/validate: sin webhook configurado → 503 sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => { throw new Error("no debería llamar a fetch"); },
    async () => {
      const [req] = makeQrValidateRequest(VALID_VALIDATE_BODY, { env: {} });
      const res = await worker.fetch(req, {});
      const data = await res.json();
      assert.equal(res.status, 503);
      assert.equal(data.ok, false);
      assert.match(data.error, /webhook not configured/i);
    }
  );
});

test("qr/validate: método GET → 405", async () => {
  const req = new Request("https://worker.test/api/qr/validate", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(req, { MAKE_CONTROL_QR_WEBHOOK: "https://hook.test/qr-val" });
  assert.equal(res.status, 405);
});

test("qr/validate: OPTIONS → 204", async () => {
  const req = new Request("https://worker.test/api/qr/validate", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(req, { MAKE_CONTROL_QR_WEBHOOK: "https://hook.test/qr-val" });
  assert.equal(res.status, 204);
});

test("qr/validate: clave_reserva vacía → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ACCESO_OK" }),
    async () => {
      const [req, env] = makeQrValidateRequest({ ...VALID_VALIDATE_BODY, clave_reserva: "" });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.clave_reserva);
    }
  );
});

test("qr/validate: pista inválida → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ACCESO_OK" }),
    async () => {
      const [req, env] = makeQrValidateRequest({ ...VALID_VALIDATE_BODY, pista: "PistaZ" });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.pista);
    }
  );
});

test("qr/validate: staff_id faltante → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ACCESO_OK" }),
    async () => {
      const [req, env] = makeQrValidateRequest({ ...VALID_VALIDATE_BODY, staff_id: "" });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.staff_id);
    }
  );
});

test("qr/validate: Make responde ACCESO_OK → decision ALLOW, reason VALID", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ACCESO_OK" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.VALID);
    }
  );
});

test("qr/validate: Make responde QR_CADUCADO → decision DENY, reason EXPIRED", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "QR_CADUCADO" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.equal(data.reason, QR_REASON_CODES.EXPIRED);
    }
  );
});

test("qr/validate: Make responde DENEGADO_INVALIDO → decision DENY, reason CANCELLED", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "DENEGADO_INVALIDO" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.equal(data.reason, QR_REASON_CODES.CANCELLED);
    }
  );
});

test("qr/validate: Make responde error HTTP → 502", async () => {
  await withFakeFetch(
    async () => ({ ok: false, status: 500, text: async () => "error interno" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 502);
      assert.equal(data.ok, false);
    }
  );
});

test("qr/validate: Make responde texto desconocido → decision DENY, reason INVALID_STATE", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "RESPUESTA_NO_ESPERADA_XYZ" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.equal(data.reason, QR_REASON_CODES.INVALID_STATE);
    }
  );
});

// ─── RESPUESTAS JSON DE MAKE (decision/reason) ───────────────────────────────
// Regresión del bug: {"ok":true,...} NUNCA debe interpretarse como VALID solo
// porque el texto contiene "ok". Deben priorizarse los campos decision/reason.

test('qr/validate: Make responde {"ok":true,"decision":"ALLOW","reason":"ACCESO_OK"} → decision ALLOW, reason VALID', async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "ALLOW", reason: "ACCESO_OK" }) }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.VALID);
    }
  );
});

test('qr/validate: Make responde {"ok":true,"decision":"DENY","reason":"TOO_EARLY"} → decision DENY, reason TOO_EARLY (nunca ALLOW)', async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "DENY", reason: "TOO_EARLY" }) }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.notEqual(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.TOO_EARLY);
    }
  );
});

test('qr/validate: Make responde {"ok":true,"decision":"DENY","reason":"EXPIRED"} → decision DENY, reason EXPIRED (nunca ALLOW)', async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "DENY", reason: "EXPIRED" }) }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.notEqual(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.EXPIRED);
    }
  );
});

test('qr/validate: Make responde {"ok":true,"decision":"DENY","reason":"ALREADY_USED"} → decision DENY, reason ALREADY_USED (nunca ALLOW)', async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "DENY", reason: "ALREADY_USED" }) }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.notEqual(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.ALREADY_USED);
    }
  );
});

test('qr/validate: Make responde {"ok":true,"decision":"DENY","reason":"INVALID"} → decision DENY, reason INVALID_STATE (nunca ALLOW)', async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "DENY", reason: "INVALID" }) }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.notEqual(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.INVALID_STATE);
    }
  );
});

test('qr/validate: Make responde {"ok":true} sin decision/reason → decision DENY (la presencia de "ok" no implica acceso)', async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => JSON.stringify({ ok: true }) }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.equal(data.reason, QR_REASON_CODES.INVALID_STATE);
    }
  );
});

test("qr/validate: doble scan → ambas peticiones llegan a Make (Make gestiona ALREADY_USED)", async () => {
  let callCount = 0;
  await withFakeFetch(
    async () => {
      callCount++;
      const text = callCount === 1 ? "ACCESO_OK" : "ya_usado";
      return { ok: true, text: async () => text };
    },
    async () => {
      const [req1, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const [req2] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res1 = await worker.fetch(req1, env);
      const res2 = await worker.fetch(req2, env);
      const data1 = await res1.json();
      const data2 = await res2.json();
      assert.equal(data1.decision, "ALLOW");
      assert.equal(data2.decision, "DENY");
      assert.equal(data2.reason, QR_REASON_CODES.ALREADY_USED);
    }
  );
});

test("qr/validate: cross-club — club_id vacío → 400 (validación local, antes de Make)", async () => {
  await withFakeFetch(
    async () => { throw new Error("no debe llamar a Make"); },
    async () => {
      const [req, env] = makeQrValidateRequest({ ...VALID_VALIDATE_BODY, club_id: "" });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.club_id);
    }
  );
});

test("qr/validate: no expone staff_id en respuesta (privacidad)", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ACCESO_OK" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.staff_id, undefined, "staff_id no debe estar en respuesta pública");
    }
  );
});

// ─── DEFENSA EN PROFUNDIDAD: PISTA REAL (AIRTABLE) VS PISTA SOLICITADA ───────
// Regresión del bug real E2E (2026-08-20): una reserva CONFIRMADA en Pista 2
// fue validada con éxito (ALLOW) enviando "Pista 1", consumiendo el QR antes
// de que pudiera usarse en su pista real. La fuente de verdad es la reserva
// persistida en Airtable — el Worker ahora la consulta directamente (además
// de Make) antes de decidir.

test("A) reserva Pista 2 + request Pista 1 → DENY WRONG_COURT, Make nunca se llama (no consume el QR)", async () => {
  const calls = [];
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableReservaRecord({
        claveReserva: "CP04-QR-E2E-20260820-PISTA-FRESH-003",
        pista: "Pista 2",
      }),
      makeImpl: async () => { throw new Error("no debería llamar a Make: la pista no coincide"); },
      calls,
    }),
    async () => {
      const [req, env] = makeQrValidateRequest({
        ...VALID_VALIDATE_BODY,
        clave_reserva: "CP04-QR-E2E-20260820-PISTA-FRESH-003",
        pista: "Pista 1",
      }, { env: AIRTABLE_ENV });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.equal(data.reason, QR_REASON_CODES.WRONG_COURT);
      assert.equal(calls.filter((c) => c.target === "make").length, 0, "Make no debe recibir la petición");
    }
  );
});

test("B) tras el rechazo por pista incorrecta, reserva Pista 2 + request Pista 2 → ALLOW (el QR sigue disponible en su pista real)", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableReservaRecord({
        claveReserva: "CP04-QR-E2E-20260820-PISTA-FRESH-003",
        pista: "Pista 2",
      }),
      makeImpl: async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "ALLOW", reason: "ACCESO_OK" }) }),
      calls: [],
    }),
    async () => {
      const [req, env] = makeQrValidateRequest({
        ...VALID_VALIDATE_BODY,
        clave_reserva: "CP04-QR-E2E-20260820-PISTA-FRESH-003",
        pista: "Pista 2",
      }, { env: AIRTABLE_ENV });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.VALID);
    }
  );
});

test("C) repetir el request correcto (Pista 2 de nuevo) → ALREADY_USED", async () => {
  let makeCallCount = 0;
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableReservaRecord({
        claveReserva: "CP04-QR-E2E-20260820-PISTA-FRESH-003",
        pista: "Pista 2",
      }),
      makeImpl: async () => {
        makeCallCount++;
        const text = makeCallCount === 1
          ? JSON.stringify({ ok: true, decision: "ALLOW", reason: "ACCESO_OK" })
          : JSON.stringify({ ok: true, decision: "DENY", reason: "ALREADY_USED" });
        return { ok: true, text: async () => text };
      },
      calls: [],
    }),
    async () => {
      const body = {
        ...VALID_VALIDATE_BODY,
        clave_reserva: "CP04-QR-E2E-20260820-PISTA-FRESH-003",
        pista: "Pista 2",
      };
      const [req1, env] = makeQrValidateRequest(body, { env: AIRTABLE_ENV });
      const [req2] = makeQrValidateRequest(body, { env: AIRTABLE_ENV });
      const data1 = await (await worker.fetch(req1, env)).json();
      const data2 = await (await worker.fetch(req2, env)).json();
      assert.equal(data1.decision, "ALLOW");
      assert.equal(data2.decision, "DENY");
      assert.equal(data2.reason, QR_REASON_CODES.ALREADY_USED);
    }
  );
});

test("D) tenant (club_id) incorrecto sigue en DENY (el nuevo gate de pista no interfiere con WRONG_CLUB)", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableReservaRecord({
        claveReserva: "CP04-QR-E2E-20260820-PISTA-FRESH-003",
        pista: "Pista 2",
      }),
      makeImpl: async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "DENY", reason: "WRONG_CLUB" }) }),
      calls: [],
    }),
    async () => {
      const [req, env] = makeQrValidateRequest({
        ...VALID_VALIDATE_BODY,
        clave_reserva: "CP04-QR-E2E-20260820-PISTA-FRESH-003",
        pista: "Pista 2",
        club_id: "otro-club-distinto",
      }, { env: AIRTABLE_ENV });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.decision, "DENY");
      assert.equal(data.reason, QR_REASON_CODES.WRONG_CLUB);
    }
  );
});

test("E) una pista inválida no consume el QR: tras el DENY por pista incorrecta, el mismo QR sigue ALLOW en su pista real", async () => {
  const calls = [];
  const claveReserva = "CP04-QR-E2E-20260820-PISTA-FRESH-003";
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => airtableReservaRecord({ claveReserva, pista: "Pista 2" }),
      makeImpl: async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "ALLOW", reason: "ACCESO_OK" }) }),
      calls,
    }),
    async () => {
      const [reqMismatch, env] = makeQrValidateRequest(
        { ...VALID_VALIDATE_BODY, clave_reserva: claveReserva, pista: "Pista 1" },
        { env: AIRTABLE_ENV }
      );
      const mismatchData = await (await worker.fetch(reqMismatch, env)).json();
      assert.equal(mismatchData.decision, "DENY");
      assert.equal(mismatchData.reason, QR_REASON_CODES.WRONG_COURT);

      const [reqCorrect] = makeQrValidateRequest(
        { ...VALID_VALIDATE_BODY, clave_reserva: claveReserva, pista: "Pista 2" },
        { env: AIRTABLE_ENV }
      );
      const correctData = await (await worker.fetch(reqCorrect, env)).json();
      assert.equal(correctData.decision, "ALLOW");
      assert.equal(correctData.reason, QR_REASON_CODES.VALID);

      assert.equal(calls.filter((c) => c.target === "make").length, 1, "Make solo debe recibir la petición con la pista correcta");
    }
  );
});

test("qr/validate: Airtable no configurado → cae al flujo existente (confía en Make, comportamiento sin cambios)", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ACCESO_OK" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.VALID);
    }
  );
});

test("qr/validate: Airtable configurado pero sin reserva encontrada → cae al flujo existente (Make decide, p.ej. UNKNOWN_QR)", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => ({ ok: true, json: async () => ({ records: [] }) }),
      makeImpl: async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "DENY", reason: "UNKNOWN_QR" }) }),
      calls: [],
    }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY, { env: AIRTABLE_ENV });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.decision, "DENY");
      assert.equal(data.reason, QR_REASON_CODES.UNKNOWN_QR);
    }
  );
});

test("qr/validate: error de red al consultar Airtable → cae al flujo existente (no bloquea la validación)", async () => {
  await withFakeFetch(
    routedFetch({
      airtableImpl: async () => { throw new Error("network down"); },
      makeImpl: async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "ALLOW", reason: "ACCESO_OK" }) }),
      calls: [],
    }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY, { env: AIRTABLE_ENV });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.VALID);
    }
  );
});

// ─── REASON CODES ────────────────────────────────────────────────────────────

test("QR_REASON_CODES exportado contiene todos los reason codes canónicos", () => {
  const expected = [
    "VALID", "TOO_EARLY", "EXPIRED", "CANCELLED", "COURT_CLOSED",
    "WRONG_CLUB", "WRONG_COURT", "UNKNOWN_QR", "ALREADY_USED",
    "INVALID_STATE", "UNAUTHORIZED",
  ];
  for (const code of expected) {
    assert.ok(QR_REASON_CODES[code], `falta reason code: ${code}`);
    assert.equal(QR_REASON_CODES[code], code);
  }
});

// ─── REGRESIÓN: RUTAS EXISTENTES INTACTAS ────────────────────────────────────

test("regresión: /api/pistas/cierre-temporal sigue respondiendo (no afectado por QR)", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const req = new Request("https://worker.test/api/pistas/cierre-temporal", {
        method: "POST",
        headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await worker.fetch(req, {});
      // Sin webhook → 503, no 404 (la ruta existe)
      assert.notEqual(res.status, 404);
    }
  );
});

test("regresión: /api/jugadores/alta sigue respondiendo (no afectado por QR)", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const req = new Request("https://worker.test/api/jugadores/alta", {
        method: "POST",
        headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await worker.fetch(req, {});
      assert.notEqual(res.status, 404);
    }
  );
});
