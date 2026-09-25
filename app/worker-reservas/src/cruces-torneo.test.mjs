// Tests flujo 13: Cruces de Torneo (Make 4919937)
// Endpoint: POST /api/torneos/cruce
// Secret: MAKE_CRUCES_TORNEO_WEBHOOK
// Gate: STAFF/ADMIN cuando CP04_ENFORCE_ROLE_GATES="true"
// P0 security: resultado_equipo1/equipo2 calculados server-side — cliente no fija scores

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
};

const ENV_WITH_HOOK = {
  ...BASE_ENV,
  MAKE_CRUCES_TORNEO_WEBHOOK: "https://hook.test/cruce",
};

const VALID_PAYLOAD = {
  partido_id: "match-ronda1-001",
  equipo1: "García / Martínez",
  equipo2: "Ruiz / López",
  ganador: "equipo1",
};

function makeReq(path, { method = "POST", body } = {}) {
  return new Request(`${WORKER_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function makeOK() {
  return new Response("Accepted", { status: 200 });
}

// ── Configuración / disponibilidad ───────────────────────────────────────────

test("cruce-01: sin MAKE_CRUCES_TORNEO_WEBHOOK → 503 seguro", async () => {
  await withFakeFetch(() => { throw new Error("fetch no debería llamarse"); }, async () => {
    const res = await workerFetch(makeReq("/api/torneos/cruce", { body: VALID_PAYLOAD }), BASE_ENV);
    assert.equal(res.status, 503);
    const j = await res.json();
    assert.equal(j.ok, false);
    assert.match(j.error, /not configured/i);
  });
});

test("cruce-02: OPTIONS preflight → 204 sin auth ni webhook", async () => {
  const res = await workerFetch(
    new Request(`${WORKER_URL}/api/torneos/cruce`, { method: "OPTIONS" }),
    BASE_ENV
  );
  assert.equal(res.status, 204);
});

test("cruce-03: método GET → 405", async () => {
  await withFakeFetch(() => makeOK(), async () => {
    const res = await workerFetch(makeReq("/api/torneos/cruce", { method: "GET" }), ENV_WITH_HOOK);
    assert.equal(res.status, 405);
  });
});

// ── Validación de campos ─────────────────────────────────────────────────────

test("cruce-04: body no JSON → 400", async () => {
  await withFakeFetch(() => makeOK(), async () => {
    const req = new Request(`${WORKER_URL}/api/torneos/cruce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "no es json",
    });
    const res = await workerFetch(req, ENV_WITH_HOOK);
    assert.equal(res.status, 400);
    const j = await res.json();
    assert.equal(j.ok, false);
  });
});

test("cruce-05: partido_id vacío → 400 con campo en fields", async () => {
  await withFakeFetch(() => makeOK(), async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/cruce", { body: { ...VALID_PAYLOAD, partido_id: "" } }),
      ENV_WITH_HOOK
    );
    assert.equal(res.status, 400);
    const j = await res.json();
    assert.ok(j.fields?.partido_id);
  });
});

test("cruce-06: equipo1 con solo espacios → 400", async () => {
  await withFakeFetch(() => makeOK(), async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/cruce", { body: { ...VALID_PAYLOAD, equipo1: "   " } }),
      ENV_WITH_HOOK
    );
    assert.equal(res.status, 400);
    const j = await res.json();
    assert.ok(j.fields?.equipo1);
  });
});

test("cruce-07: equipo2 ausente → 400", async () => {
  await withFakeFetch(() => makeOK(), async () => {
    const { equipo2: _, ...rest } = VALID_PAYLOAD;
    const res = await workerFetch(makeReq("/api/torneos/cruce", { body: rest }), ENV_WITH_HOOK);
    assert.equal(res.status, 400);
    const j = await res.json();
    assert.ok(j.fields?.equipo2);
  });
});

test("cruce-08: ganador='equipo3' → 400 (solo equipo1 o equipo2)", async () => {
  await withFakeFetch(() => makeOK(), async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/cruce", { body: { ...VALID_PAYLOAD, ganador: "equipo3" } }),
      ENV_WITH_HOOK
    );
    assert.equal(res.status, 400);
    const j = await res.json();
    assert.ok(j.fields?.ganador);
  });
});

test("cruce-08b: ganador ausente → 400", async () => {
  await withFakeFetch(() => makeOK(), async () => {
    const { ganador: _, ...rest } = VALID_PAYLOAD;
    const res = await workerFetch(makeReq("/api/torneos/cruce", { body: rest }), ENV_WITH_HOOK);
    assert.equal(res.status, 400);
    const j = await res.json();
    assert.ok(j.fields?.ganador);
  });
});

// ── P0 security: resultado calculado server-side ─────────────────────────────

test("cruce-09: ganador='equipo1' → resultado_equipo1=1, resultado_equipo2=0 en Make", async () => {
  let captured;
  await withFakeFetch(async (url, init) => {
    captured = JSON.parse(init.body);
    return makeOK();
  }, async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/cruce", { body: { ...VALID_PAYLOAD, ganador: "equipo1" } }),
      ENV_WITH_HOOK
    );
    assert.equal(res.status, 200);
    assert.equal(captured.resultado_equipo1, 1);
    assert.equal(captured.resultado_equipo2, 0);
  });
});

test("cruce-10: ganador='equipo2' → resultado_equipo1=0, resultado_equipo2=1 en Make", async () => {
  let captured;
  await withFakeFetch(async (url, init) => {
    captured = JSON.parse(init.body);
    return makeOK();
  }, async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/cruce", { body: { ...VALID_PAYLOAD, ganador: "equipo2" } }),
      ENV_WITH_HOOK
    );
    assert.equal(res.status, 200);
    assert.equal(captured.resultado_equipo1, 0);
    assert.equal(captured.resultado_equipo2, 1);
  });
});

test("cruce-11: resultado_equipo1/2 en body ignorados (server-side sobrescribe)", async () => {
  let captured;
  await withFakeFetch(async (url, init) => {
    captured = JSON.parse(init.body);
    return makeOK();
  }, async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/cruce", {
        body: {
          ...VALID_PAYLOAD,
          ganador: "equipo1",
          resultado_equipo1: 999,
          resultado_equipo2: -500,
        },
      }),
      ENV_WITH_HOOK
    );
    assert.equal(res.status, 200);
    assert.equal(captured.resultado_equipo1, 1, "debe ser 1, no 999");
    assert.equal(captured.resultado_equipo2, 0, "debe ser 0, no -500");
    assert.equal(captured.resultado_equipo1, 1);
  });
});

// ── payload Make correcto ─────────────────────────────────────────────────────

test("cruce-12: payload Make contiene partido_id, resultado_equipo1, resultado_equipo2 (sin extras)", async () => {
  let captured;
  await withFakeFetch(async (url, init) => {
    captured = JSON.parse(init.body);
    return makeOK();
  }, async () => {
    await workerFetch(makeReq("/api/torneos/cruce", { body: VALID_PAYLOAD }), ENV_WITH_HOOK);
    // Solo estos 3 campos se envían a Make (equipo1/equipo2/ganador son del Worker, no de Make)
    assert.ok("partido_id" in captured);
    assert.ok("resultado_equipo1" in captured);
    assert.ok("resultado_equipo2" in captured);
    assert.equal(captured.partido_id, VALID_PAYLOAD.partido_id);
  });
});

// ── Resiliencia ──────────────────────────────────────────────────────────────

test("cruce-13: Make responde 500 → 502 al cliente", async () => {
  await withFakeFetch(async () => new Response("error", { status: 500 }), async () => {
    const res = await workerFetch(makeReq("/api/torneos/cruce", { body: VALID_PAYLOAD }), ENV_WITH_HOOK);
    assert.equal(res.status, 502);
    const j = await res.json();
    assert.equal(j.ok, false);
    assert.match(j.error, /Make request failed/i);
  });
});

test("cruce-14: partido_id con espacios → trim antes de enviar a Make", async () => {
  let captured;
  await withFakeFetch(async (url, init) => {
    captured = JSON.parse(init.body);
    return makeOK();
  }, async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/cruce", { body: { ...VALID_PAYLOAD, partido_id: "  match-001  " } }),
      ENV_WITH_HOOK
    );
    assert.equal(res.status, 200);
    assert.equal(captured.partido_id, "match-001");
  });
});

test("cruce-15: Make 'Accepted' → 200 ok forwarded con message", async () => {
  await withFakeFetch(async () => makeOK(), async () => {
    const res = await workerFetch(makeReq("/api/torneos/cruce", { body: VALID_PAYLOAD }), ENV_WITH_HOOK);
    assert.equal(res.status, 200);
    const j = await res.json();
    assert.equal(j.ok, true);
    assert.equal(j.status, "forwarded");
    assert.ok(j.message.includes("Cruce"));
    assert.ok(j.message.includes("registrado"));
    assert.ok(j.message.includes("García / Martínez"), "debe incluir nombre del ganador");
  });
});

// ── Control de acceso ─────────────────────────────────────────────────────────

test("cruce-16: gate activo sin token → 401 MISSING_TOKEN", async () => {
  const env = {
    ...ENV_WITH_HOOK,
    CP04_ENFORCE_ROLE_GATES: "true",
    SUPABASE_URL: "https://fake.supabase.co",
    SUPABASE_ANON_KEY: "fake-key",
  };
  await withFakeFetch(async (url) => {
    if (String(url).includes("supabase")) {
      return new Response(JSON.stringify({ error: "invalid_token" }), { status: 401 });
    }
    throw new Error("Make no debería ser llamado");
  }, async () => {
    const res = await workerFetch(makeReq("/api/torneos/cruce", { body: VALID_PAYLOAD }), env);
    assert.ok(res.status === 401 || res.status === 403);
  });
});

test("cruce-17: gate deshabilitado → pasa sin token", async () => {
  const env = { ...ENV_WITH_HOOK, CP04_ENFORCE_ROLE_GATES: "false" };
  await withFakeFetch(async () => makeOK(), async () => {
    const res = await workerFetch(makeReq("/api/torneos/cruce", { body: VALID_PAYLOAD }), env);
    assert.equal(res.status, 200);
  });
});

// ── Ruta alternativa ──────────────────────────────────────────────────────────

test("cruce-18: ruta sin prefijo /api → también funciona (/torneos/cruce)", async () => {
  await withFakeFetch(async () => makeOK(), async () => {
    const res = await workerFetch(makeReq("/torneos/cruce", { body: VALID_PAYLOAD }), ENV_WITH_HOOK);
    assert.equal(res.status, 200);
  });
});

test("cruce-19: partido_id numérico '17' → Make recibe número entero 17 (no string)", async () => {
  let captured;
  await withFakeFetch(async (url, init) => {
    captured = JSON.parse(init.body);
    return makeOK();
  }, async () => {
    const res = await workerFetch(
      makeReq("/api/torneos/cruce", { body: { ...VALID_PAYLOAD, partido_id: "17" } }),
      ENV_WITH_HOOK
    );
    assert.equal(res.status, 200);
    assert.equal(captured.partido_id, 17);
    assert.equal(typeof captured.partido_id, "number", "debe ser number, no string");
  });
});
