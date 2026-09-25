import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";

// FLUJO 12 (2026-09-08): tests de handleReto04Completar (POST /api/retos/completar).
// Seguridad P0: los puntos los calcula el Worker (RETO_CATALOG), no el cliente.
// El email se extrae del JWT; el cliente no puede inyectarlo ni los puntos.

async function withFakeFetch(fakeFetchImpl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetchImpl;
  try { await run(); } finally { globalThis.fetch = original; }
}

// Fake fetch con routing por URL para tests con Airtable + Make simultáneos
function makeMultiFetch(handlers) {
  return async (url, init) => {
    const urlStr = typeof url === "string" ? url : (url?.url ?? String(url));
    for (const [pattern, handler] of handlers) {
      if (urlStr.includes(pattern)) return handler(urlStr, init);
    }
    throw new Error(`No handler registered for URL: ${urlStr}`);
  };
}

const ENV_AIRTABLE = {
  AIRTABLE_TOKEN: "fake-airtable-token",
  AIRTABLE_BASE_ID: "appyWvzZJLzy0E6aX",
};

// Airtable record stub — jugador ACTIVO con historial dado
function airtableSearchResponse(recordId, historialRetos) {
  const fields = {};
  if (historialRetos !== undefined) fields.historial_retos = historialRetos;
  return new Response(
    JSON.stringify({ records: [{ id: recordId, fields }] }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

// Airtable sin resultados (jugador no encontrado) — factory para evitar body reutilizado
const airtableEmpty = () => new Response(
  JSON.stringify({ records: [] }),
  { status: 200, headers: { "Content-Type": "application/json" } }
);

const makeOK = () => new Response("Accepted", { status: 200 });
const airtablePatchOK = () => new Response("{}", { status: 200 });

// JWT mínimo con email embedido — header.payload.signature (signature falsa para tests)
function makeToken(email) {
  const payload = btoa(JSON.stringify({ email, sub: email, role: "PLAYER" }))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.fakesig`;
}

function retoRequest(body, { email = "jugador@test.com", headers = {} } = {}) {
  const token = email ? makeToken(email) : null;
  return new Request("https://worker.test/api/retos/completar", {
    method: "POST",
    headers: {
      Origin: "http://localhost:5173",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const ENV_WEBHOOK = { MAKE_RETO04_WEBHOOK: "https://hook.example.test/fake-reto04" };

// ──────────────────────────── 1. SIN WEBHOOK ────────────────────────────

test("reto04: sin MAKE_RETO04_WEBHOOK → 503 seguro, fetch no llamado", async () => {
  await withFakeFetch(
    async () => { throw new Error("fetch no debería llamarse sin webhook"); },
    async () => {
      const res = await worker.fetch(retoRequest({ codigo_reto: "RETO-GEN" }), {});
      const data = await res.json();
      assert.equal(res.status, 503);
      assert.equal(data.ok, false);
      assert.equal(data.error, "Reto webhook not configured");
    }
  );
});

// ──────────────────────────── 2. MÉTODO INCORRECTO ────────────────────────────

test("reto04: GET → 405", async () => {
  const req = new Request("https://worker.test/api/retos/completar", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(req, ENV_WEBHOOK);
  assert.equal(res.status, 405);
});

test("reto04: OPTIONS → 204 (CORS preflight)", async () => {
  const req = new Request("https://worker.test/api/retos/completar", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(req, ENV_WEBHOOK);
  assert.equal(res.status, 204);
});

// ──────────────────────────── 3. JSON INVÁLIDO ────────────────────────────

test("reto04: JSON inválido → 400", async () => {
  const req = new Request("https://worker.test/api/retos/completar", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: "{ no es json",
  });
  const res = await worker.fetch(req, ENV_WEBHOOK);
  assert.equal(res.status, 400);
});

// ──────────────────────────── 4. VALIDACIÓN codigo_reto ────────────────────────────

test("reto04: sin codigo_reto → 400 con campo marcado", async () => {
  const res = await worker.fetch(retoRequest({}), ENV_WEBHOOK);
  const data = await res.json();
  assert.equal(res.status, 400);
  assert.ok(data.fields?.codigo_reto);
});

test("reto04: codigo_reto desconocido → 400 RETO_UNKNOWN", async () => {
  const res = await worker.fetch(retoRequest({ codigo_reto: "RETO-INVENTADO" }), ENV_WEBHOOK);
  const data = await res.json();
  assert.equal(res.status, 400);
  assert.equal(data.error, "RETO_UNKNOWN");
});

// ──────────────────────────── 5. SEGURIDAD: puntos server-side ────────────────────────────

test("reto04: P0 — puntos enviados a Make son los del catálogo, nunca los del cliente", async () => {
  let capturedBody = null;
  await withFakeFetch(
    async (url, init) => { capturedBody = JSON.parse(init.body); return new Response("Accepted", { status: 200 }); },
    async () => {
      // El cliente podría intentar enviar puntos=9999, pero el body solo acepta codigo_reto
      // El Worker calcula puntos desde RETO_CATALOG["RETO-GEN"] = 5
      await worker.fetch(retoRequest({ codigo_reto: "RETO-GEN", puntos: 9999 }), ENV_WEBHOOK);
      assert.equal(capturedBody.puntos, 5, "puntos deben ser 5 (catálogo), no 9999 (cliente)");
    }
  );
});

test("reto04: RETO-TORNEO → Make recibe puntos=15 (catálogo)", async () => {
  let capturedBody = null;
  await withFakeFetch(
    async (url, init) => { capturedBody = JSON.parse(init.body); return new Response("Accepted", { status: 200 }); },
    async () => {
      await worker.fetch(retoRequest({ codigo_reto: "RETO-TORNEO" }), ENV_WEBHOOK);
      assert.equal(capturedBody.puntos, 15);
      assert.equal(capturedBody.codigo_reto, "RETO-TORNEO");
    }
  );
});

// ──────────────────────────── 6. SEGURIDAD: email del JWT, no del body ────────────────────────────

test("reto04: email de Make viene del JWT, no del body", async () => {
  let capturedBody = null;
  await withFakeFetch(
    async (url, init) => { capturedBody = JSON.parse(init.body); return new Response("Accepted", { status: 200 }); },
    async () => {
      // El cliente envía email_jugador=otro@hack.com en el body — debe ignorarse
      await worker.fetch(
        retoRequest({ codigo_reto: "RETO-GEN", email_jugador: "otro@hack.com" }, { email: "real@club.com" }),
        ENV_WEBHOOK
      );
      assert.equal(capturedBody.email, "real@club.com");
    }
  );
});

// ──────────────────────────── 7. SIN TOKEN → 400 ────────────────────────────

test("reto04: sin Authorization header → 400 Cannot extract email", async () => {
  await withFakeFetch(
    async () => { throw new Error("Make no debería llamarse sin email"); },
    async () => {
      const req = new Request("https://worker.test/api/retos/completar", {
        method: "POST",
        headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
        body: JSON.stringify({ codigo_reto: "RETO-GEN" }),
      });
      const res = await worker.fetch(req, ENV_WEBHOOK);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.error.includes("email"));
    }
  );
});

// ──────────────────────────── 8. HAPPY PATH ────────────────────────────

test("reto04: happy path → 200 ok:true status:forwarded", async () => {
  await withFakeFetch(
    async () => new Response("Accepted", { status: 200 }),
    async () => {
      const res = await worker.fetch(retoRequest({ codigo_reto: "RETO-RACHA-7" }), ENV_WEBHOOK);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.status, "forwarded");
      assert.ok(data.message.includes("RETO-RACHA-7"));
    }
  );
});

// ──────────────────────────── 9. MAKE ERROR → 502 ────────────────────────────

test("reto04: Make responde 500 → 502, ok:false", async () => {
  await withFakeFetch(
    async () => new Response("Internal Server Error", { status: 500 }),
    async () => {
      const res = await worker.fetch(retoRequest({ codigo_reto: "RETO-GEN" }), ENV_WEBHOOK);
      const data = await res.json();
      assert.equal(res.status, 502);
      assert.equal(data.ok, false);
    }
  );
});

// ──────────────────────────── 10. GATE DE ROL ────────────────────────────

test("reto04: CP04_ENFORCE_ROLE_GATES=true, sin token → 401 MISSING_TOKEN", async () => {
  await withFakeFetch(
    async () => { throw new Error("gate debe bloquear antes de Make"); },
    async () => {
      const req = new Request("https://worker.test/api/retos/completar", {
        method: "POST",
        headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
        body: JSON.stringify({ codigo_reto: "RETO-GEN" }),
      });
      const res = await worker.fetch(req, { ...ENV_WEBHOOK, CP04_ENFORCE_ROLE_GATES: "true" });
      const data = await res.json();
      assert.equal(res.status, 401);
      assert.equal(data.error, "MISSING_TOKEN");
    }
  );
});

test("reto04: OPTIONS pasa con gate activo → 204", async () => {
  const req = new Request("https://worker.test/api/retos/completar", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(req, { ...ENV_WEBHOOK, CP04_ENFORCE_ROLE_GATES: "true" });
  assert.equal(res.status, 204);
});

// ──────────────────────── 11. IDEMPOTENCIA PERSISTENTE (Airtable historial_retos) ──────────────────────────

const ENV_WITH_AIRTABLE = { ...ENV_WEBHOOK, ...ENV_AIRTABLE };

test("idem-01: primer reto (historial vacío) → forwarded, PATCH Airtable llamado", async () => {
  const airtablePatchCalls = [];
  await withFakeFetch(
    makeMultiFetch([
      ["airtable.com", (url, init) => {
        if (init?.method === "PATCH") { airtablePatchCalls.push(JSON.parse(init.body)); return airtablePatchOK(); }
        return airtableSearchResponse("rec123", ""); // historial vacío
      }],
      ["example.test", async () => makeOK()],
    ]),
    async () => {
      const res = await worker.fetch(retoRequest({ codigo_reto: "RETO-GEN" }), ENV_WITH_AIRTABLE);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.status, "forwarded");
      assert.equal(airtablePatchCalls.length, 1, "debe hacer PATCH a Airtable");
      assert.ok(airtablePatchCalls[0].fields.historial_retos.includes("RETO-GEN"));
    }
  );
});

test("idem-02: reto ya en historial → 200 already_processed, Make NO llamado", async () => {
  let makeCalled = false;
  await withFakeFetch(
    makeMultiFetch([
      ["airtable.com", (url) => {
        if (url.includes("filterByFormula")) return airtableSearchResponse("rec123", "RETO-GEN");
        return airtablePatchOK();
      }],
      ["example.test", async () => { makeCalled = true; return makeOK(); }],
    ]),
    async () => {
      const res = await worker.fetch(retoRequest({ codigo_reto: "RETO-GEN" }), ENV_WITH_AIRTABLE);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.status, "already_processed");
      assert.equal(data.idempotent, true);
      assert.equal(makeCalled, false, "Make no debe llamarse para reto ya procesado");
    }
  );
});

test("idem-03: reto distinto en historial → sí forwarded (no bloquea otros retos)", async () => {
  let makeBody = null;
  await withFakeFetch(
    makeMultiFetch([
      ["airtable.com", (url, init) => {
        if (init?.method === "PATCH") return airtablePatchOK();
        return airtableSearchResponse("rec123", "RETO-TORNEO"); // tiene TORNEO pero no GEN
      }],
      ["example.test", async (url, init) => { makeBody = JSON.parse(init.body); return makeOK(); }],
    ]),
    async () => {
      const res = await worker.fetch(retoRequest({ codigo_reto: "RETO-GEN" }), ENV_WITH_AIRTABLE);
      const data = await res.json();
      assert.equal(data.status, "forwarded");
      assert.equal(makeBody?.codigo_reto, "RETO-GEN");
    }
  );
});

test("idem-04: historial con múltiples retos, reto ya dentro → already_processed", async () => {
  await withFakeFetch(
    makeMultiFetch([
      ["airtable.com", () => airtableSearchResponse("rec123", "RETO-GEN,RETO-TORNEO,RETO-PERFIL")],
    ]),
    async () => {
      const res = await worker.fetch(retoRequest({ codigo_reto: "RETO-TORNEO" }), ENV_WITH_AIRTABLE);
      const data = await res.json();
      assert.equal(data.status, "already_processed");
    }
  );
});

test("idem-05: historial con múltiples retos, nuevo reto → forwarded, historial extendido", async () => {
  let patchBody = null;
  await withFakeFetch(
    makeMultiFetch([
      ["airtable.com", (url, init) => {
        if (init?.method === "PATCH") { patchBody = JSON.parse(init.body); return airtablePatchOK(); }
        return airtableSearchResponse("rec123", "RETO-GEN,RETO-TORNEO");
      }],
      ["example.test", async () => makeOK()],
    ]),
    async () => {
      const res = await worker.fetch(retoRequest({ codigo_reto: "RETO-RACHA-7" }), ENV_WITH_AIRTABLE);
      const data = await res.json();
      assert.equal(data.status, "forwarded");
      assert.ok(patchBody.fields.historial_retos.includes("RETO-RACHA-7"));
      assert.ok(patchBody.fields.historial_retos.includes("RETO-GEN"));
    }
  );
});

test("idem-06: usuario distinto puede procesar su propio reto aunque otro ya lo tenga", async () => {
  await withFakeFetch(
    makeMultiFetch([
      ["airtable.com", (url, init) => {
        if (init?.method === "PATCH") return airtablePatchOK();
        return airtableSearchResponse("rec999", ""); // usuario diferente, historial vacío
      }],
      ["example.test", async () => makeOK()],
    ]),
    async () => {
      const res = await worker.fetch(
        retoRequest({ codigo_reto: "RETO-GEN" }, { email: "otro@club.com" }),
        ENV_WITH_AIRTABLE
      );
      const data = await res.json();
      assert.equal(data.status, "forwarded");
    }
  );
});

test("idem-07: Airtable falla (fail-open) → Make llamado igualmente (no bloquea servicio)", async () => {
  let makeCalled = false;
  await withFakeFetch(
    makeMultiFetch([
      ["airtable.com", async () => { throw new Error("Airtable timeout"); }],
      ["example.test", async () => { makeCalled = true; return makeOK(); }],
    ]),
    async () => {
      const res = await worker.fetch(retoRequest({ codigo_reto: "RETO-GEN" }), ENV_WITH_AIRTABLE);
      const data = await res.json();
      assert.equal(data.ok, true, "fail-open: servicio no se bloquea si Airtable no responde");
      assert.equal(makeCalled, true);
    }
  );
});

test("idem-08: jugador no encontrado en Airtable → reto forwarded igualmente", async () => {
  let makeCalled = false;
  await withFakeFetch(
    makeMultiFetch([
      ["airtable.com", async () => airtableEmpty()],
      ["example.test", async () => { makeCalled = true; return makeOK(); }],
    ]),
    async () => {
      const res = await worker.fetch(retoRequest({ codigo_reto: "RETO-GEN" }), ENV_WITH_AIRTABLE);
      const data = await res.json();
      assert.equal(data.status, "forwarded");
      assert.equal(makeCalled, true);
    }
  );
});

// ──────────────────────────── 12. REGRESIONES ────────────────────────────

test("regresión: /api/torneos/resultado sigue sin MAKE_RESULTADOS_TORNEO_WEBHOOK → 503", async () => {
  const req = new Request("https://worker.test/api/torneos/resultado", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: JSON.stringify({ id_partido: "P-001", juegos_local: 6, juegos_visitante: 4 }),
  });
  const res = await worker.fetch(req, {});
  const data = await res.json();
  assert.equal(res.status, 503);
  assert.equal(data.error, "Torneo results webhook not configured");
});

test("regresión: /api/jugadores/alta sin webhook → 503 (handler no afectado)", async () => {
  const req = new Request("https://worker.test/api/jugadores/alta", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: JSON.stringify({ nombre:"QA", apellidos:"Reto", email:"qa@test.com", telefono:"600000000", fecha_nacimiento:"2000-01-01", nivel:"Iniciación", genero:"Otro", acepta_condiciones:true }),
  });
  const res = await worker.fetch(req, {});
  const data = await res.json();
  assert.equal(res.status, 503);
  assert.equal(data.error, "Alta webhook not configured");
});
