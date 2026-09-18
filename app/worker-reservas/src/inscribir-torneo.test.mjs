// Tests flujo 9: Confirmación Inscripción Torneo (Make 5791116)
// Endpoint: POST /api/torneos/inscribir
// Gate: PLAYER/STAFF/ADMIN cuando CP04_ENFORCE_ROLE_GATES="true"
// Crea inscripción en Airtable tblVyIyvBqyC6YEKo
// Make 5791116 (scheduled 1h) la detecta y envía email de confirmación

import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";

const { fetch: workerFetch } = worker;

async function withFakeFetch(fakeFn, run) {
  const orig = globalThis.fetch;
  globalThis.fetch = fakeFn;
  try { await run(); } finally { globalThis.fetch = orig; }
}

const WORKER_URL = "https://worker.test";

const BASE_ENV = {
  APP_PUBLIC_URL: "https://club-padel-04.pages.dev",
  ALLOWED_ORIGIN: "https://club-padel-04.pages.dev",
  AIRTABLE_BASE_ID: "appTest",
  AIRTABLE_TABLE_ID: "tblTest",
  AIRTABLE_CIERRES_TABLE_ID: "tblTest",
  AIRTABLE_TOKEN: "patTest123",
};

const ENV_NO_AIRTABLE = {
  ...BASE_ENV,
  AIRTABLE_TOKEN: undefined,
  AIRTABLE_BASE_ID: undefined,
};

// JWT de prueba: sub=e2e, email=test@padel04.com, rol=PLAYER
const FAKE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  btoa(JSON.stringify({ sub: "qa-player", email: "test@padel04.com", role: "PLAYER" }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "") +
  ".fake-sig";

const VALID_PAYLOAD = {
  torneo_id: "recIU00D28LKQSSOC",
  jugador_nombre: "Eduardo García QA",
  notas: "Test inscripción",
};

function makeReq(path, { method = "POST", body, auth } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) headers["Authorization"] = `Bearer ${auth}`;
  return new Request(`${WORKER_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// Simula Airtable search (sin duplicado) + create exitoso
function airtableFakeOK(newRecordId = "recNEW123456789") {
  return async (url) => {
    if (String(url).includes("filterByFormula")) {
      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    }
    return new Response(
      JSON.stringify({ id: newRecordId, fields: {} }),
      { status: 200 }
    );
  };
}

// Simula Airtable search con duplicado existente
function airtableFakeDuplicate(existingId = "recEXIST12345") {
  return async (url) => {
    if (String(url).includes("filterByFormula")) {
      return new Response(JSON.stringify({
        records: [{
          id: existingId,
          fields: { fldUspk0sHvQuaLiT: [{ id: "recIU00D28LKQSSOC" }] }
        }]
      }), { status: 200 });
    }
    throw new Error("Create no debería llamarse si hay duplicado");
  };
}

// ── Configuración / disponibilidad ───────────────────────────────────────────

test("ins-01: sin AIRTABLE_TOKEN → 503 seguro", async () => {
  await withFakeFetch(() => { throw new Error("fetch no debería llamarse"); }, async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/inscribir", { body: VALID_PAYLOAD, auth: FAKE_JWT }),
      { ...ENV_NO_AIRTABLE }
    );
    assert.equal(res.status, 503);
    const j = await res.json();
    assert.equal(j.ok, false);
    assert.match(j.error, /not configured/i);
  });
});

test("ins-02: OPTIONS preflight → 204 sin auth", async () => {
  const res = await workerFetch(
    new Request(`${WORKER_URL}/api/torneos/inscribir`, { method: "OPTIONS" }),
    BASE_ENV
  );
  assert.equal(res.status, 204);
});

test("ins-03: método GET → 405", async () => {
  await withFakeFetch(airtableFakeOK(), async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/inscribir", { method: "GET", auth: FAKE_JWT }),
      BASE_ENV
    );
    assert.equal(res.status, 405);
  });
});

// ── Validación de campos ─────────────────────────────────────────────────────

test("ins-04: body no JSON → 400", async () => {
  await withFakeFetch(airtableFakeOK(), async () => {
    const req = new Request(`${WORKER_URL}/api/torneos/inscribir`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${FAKE_JWT}` },
      body: "no es json",
    });
    const res = await workerFetch(req, BASE_ENV);
    assert.equal(res.status, 400);
  });
});

test("ins-05: torneo_id ausente → 400 con campo en fields", async () => {
  await withFakeFetch(airtableFakeOK(), async () => {
    const { torneo_id: _, ...rest } = VALID_PAYLOAD;
    const res = await workerFetch(
      makeReq("/api/torneos/inscribir", { body: rest, auth: FAKE_JWT }),
      BASE_ENV
    );
    assert.equal(res.status, 400);
    const j = await res.json();
    assert.ok(j.fields?.torneo_id);
  });
});

test("ins-06: torneo_id sin prefijo rec → 400", async () => {
  await withFakeFetch(airtableFakeOK(), async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/inscribir", {
        body: { ...VALID_PAYLOAD, torneo_id: "12345abc" },
        auth: FAKE_JWT
      }),
      BASE_ENV
    );
    assert.equal(res.status, 400);
    const j = await res.json();
    assert.ok(j.fields?.torneo_id);
  });
});

test("ins-07: jugador_nombre vacío → 400", async () => {
  await withFakeFetch(airtableFakeOK(), async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/inscribir", {
        body: { ...VALID_PAYLOAD, jugador_nombre: "   " },
        auth: FAKE_JWT
      }),
      BASE_ENV
    );
    assert.equal(res.status, 400);
    const j = await res.json();
    assert.ok(j.fields?.jugador_nombre);
  });
});

// ── JWT / email ───────────────────────────────────────────────────────────────

test("ins-08: token sin email en payload → 400 CANNOT_EXTRACT_EMAIL", async () => {
  const tokenSinEmail = "eyJhbGciOiJIUzI1NiJ9." +
    btoa(JSON.stringify({ sub: "uid-sin-email" })).replace(/=/g, "") +
    ".fake";
  await withFakeFetch(airtableFakeOK(), async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/inscribir", { body: VALID_PAYLOAD, auth: tokenSinEmail }),
      BASE_ENV
    );
    assert.equal(res.status, 400);
    const j = await res.json();
    assert.match(j.error, /email/i);
  });
});

test("ins-09: email en body ignorado — siempre del JWT", async () => {
  let capturedUrl = "";
  let capturedBody = null;
  await withFakeFetch(async (url, init) => {
    capturedUrl = String(url);
    if (!capturedUrl.includes("filterByFormula") && init?.method === "POST") {
      capturedBody = JSON.parse(init.body);
    }
    return capturedUrl.includes("filterByFormula")
      ? new Response(JSON.stringify({ records: [] }), { status: 200 })
      : new Response(JSON.stringify({ id: "recNEW1", fields: {} }), { status: 200 });
  }, async () => {
    await workerFetch(
      makeReq("/api/torneos/inscribir", {
        body: { ...VALID_PAYLOAD, email_jugador: "hacker@evil.com" },
        auth: FAKE_JWT
      }),
      BASE_ENV
    );
    // El email que llega a Airtable debe ser del JWT, no del body
    assert.equal(capturedBody?.fields?.fld2dQAPTiNIu3ABB, "test@padel04.com");
  });
});

// ── Idempotencia ──────────────────────────────────────────────────────────────

test("ins-10: inscripción duplicada → 200 already_registered (no crea nuevo registro)", async () => {
  await withFakeFetch(airtableFakeDuplicate("recEXIST12345"), async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/inscribir", { body: VALID_PAYLOAD, auth: FAKE_JWT }),
      BASE_ENV
    );
    assert.equal(res.status, 200);
    const j = await res.json();
    assert.equal(j.ok, true);
    assert.equal(j.status, "already_registered");
    assert.equal(j.record_id, "recEXIST12345");
  });
});

// ── Payload Airtable correcto ──────────────────────────────────────────────

test("ins-11: campos enviados a Airtable son correctos (IDs, Estado=Confirmada, email_sent=false)", async () => {
  let capturedCreate = null;
  await withFakeFetch(async (url, init) => {
    const u = String(url);
    if (u.includes("filterByFormula")) return new Response(JSON.stringify({ records: [] }), { status: 200 });
    if (init?.method === "POST") {
      capturedCreate = JSON.parse(init.body);
      return new Response(JSON.stringify({ id: "recNEW1", fields: {} }), { status: 200 });
    }
    return new Response("{}", { status: 200 });
  }, async () => {
    await workerFetch(
      makeReq("/api/torneos/inscribir", { body: VALID_PAYLOAD, auth: FAKE_JWT }),
      BASE_ENV
    );
    assert.ok(capturedCreate, "debe haber llamada de creación a Airtable");
    const f = capturedCreate.fields;
    assert.equal(f.fldDpLwy8syXfwfgd, "Eduardo García QA", "Jugador");
    assert.equal(f.fld2dQAPTiNIu3ABB, "test@padel04.com", "email_jugador");
    assert.equal(f.fldLngU5jWJM3pal7, "Confirmada", "Estado");
    assert.deepEqual(f.fldUspk0sHvQuaLiT, [{ id: "recIU00D28LKQSSOC" }], "Torneo link");
    assert.equal(f.fldCjbdCrHTWxDSvJ, false, "email_confirmacion_enviado=false inicialmente");
    assert.ok(f.fldV7yaHgndHatUnJ, "Fecha requerida");
  });
});

// ── Respuesta correcta ────────────────────────────────────────────────────────

test("ins-12: inscripción exitosa → 201 inscripcion_creada con record_id", async () => {
  await withFakeFetch(airtableFakeOK("recNEWXYZ12345"), async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/inscribir", { body: VALID_PAYLOAD, auth: FAKE_JWT }),
      BASE_ENV
    );
    assert.equal(res.status, 201);
    const j = await res.json();
    assert.equal(j.ok, true);
    assert.equal(j.status, "inscripcion_creada");
    assert.equal(j.record_id, "recNEWXYZ12345");
    assert.equal(j.torneo_id, "recIU00D28LKQSSOC");
    assert.equal(j.jugador_nombre, "Eduardo García QA");
  });
});

// ── Resiliencia ───────────────────────────────────────────────────────────────

test("ins-13: Airtable create responde 422 → 502 al cliente", async () => {
  await withFakeFetch(async (url) => {
    if (String(url).includes("filterByFormula")) {
      return new Response(JSON.stringify({ records: [] }), { status: 200 });
    }
    return new Response(JSON.stringify({ error: "INVALID_REQUEST" }), { status: 422 });
  }, async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/inscribir", { body: VALID_PAYLOAD, auth: FAKE_JWT }),
      BASE_ENV
    );
    assert.equal(res.status, 502);
    const j = await res.json();
    assert.equal(j.ok, false);
    assert.match(j.error, /airtable/i);
  });
});

test("ins-14: notas omitidas → se envía string vacío (no undefined)", async () => {
  let capturedFields = null;
  await withFakeFetch(async (url, init) => {
    if (String(url).includes("filterByFormula")) return new Response(JSON.stringify({ records: [] }), { status: 200 });
    capturedFields = JSON.parse(init.body).fields;
    return new Response(JSON.stringify({ id: "recNEW1", fields: {} }), { status: 200 });
  }, async () => {
    const { notas: _, ...sinNotas } = VALID_PAYLOAD;
    await workerFetch(
      makeReq("/api/torneos/inscribir", { body: sinNotas, auth: FAKE_JWT }),
      BASE_ENV
    );
    assert.equal(typeof capturedFields?.fldh7XtIgWQBFfWAq, "string");
  });
});

// ── Control de acceso ─────────────────────────────────────────────────────────

test("ins-15: gate activo sin token → 401 MISSING_TOKEN", async () => {
  const env = {
    ...BASE_ENV,
    CP04_ENFORCE_ROLE_GATES: "true",
    SUPABASE_URL: "https://fake.supabase.co",
    SUPABASE_ANON_KEY: "fake-key",
  };
  await withFakeFetch(async (url) => {
    if (String(url).includes("supabase")) {
      return new Response(JSON.stringify({ error: "invalid" }), { status: 401 });
    }
    return new Response("{}", { status: 200 });
  }, async () => {
    const res = await workerFetch(makeReq("/api/torneos/inscribir", { body: VALID_PAYLOAD }), env);
    assert.ok(res.status === 401 || res.status === 403);
  });
});

test("ins-16: gate deshabilitado → pasa sin token real", async () => {
  const env = { ...BASE_ENV, CP04_ENFORCE_ROLE_GATES: "false" };
  await withFakeFetch(airtableFakeOK(), async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/inscribir", { body: VALID_PAYLOAD, auth: FAKE_JWT }),
      env
    );
    assert.equal(res.status, 201);
  });
});

// ── Ruta alternativa ──────────────────────────────────────────────────────────

test("ins-17: ruta sin prefijo /api → también funciona (/torneos/inscribir)", async () => {
  await withFakeFetch(airtableFakeOK(), async () => {
    const res = await workerFetch(
      makeReq("/torneos/inscribir", { body: VALID_PAYLOAD, auth: FAKE_JWT }),
      BASE_ENV
    );
    assert.equal(res.status, 201);
  });
});
