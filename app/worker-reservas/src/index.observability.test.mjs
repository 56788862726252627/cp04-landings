import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";

const REQUEST_ID_HEADER = "X-CP04-Request-Id";
const CORRELATION_ID_HEADER = "X-CP04-Correlation-Id";
const REQUEST_ID_PATTERN = /^req_[A-Za-z0-9-]{8,}$/;

const ENV = {
  SUPABASE_URL: "https://example-project.supabase.co",
  SUPABASE_ANON_KEY: "anon-key-not-real",
  ALLOWED_ORIGIN: "http://localhost:5173",
  RESERVATIONS_TENANT_ID: "tenant-test",
  RESERVATIONS_CLUB_ID: "club-test",
};

function withFetch(stub, fn) {
  const original = globalThis.fetch;
  globalThis.fetch = stub;
  return fn().finally(() => {
    globalThis.fetch = original;
  });
}

function withCapturedConsoleLog(fn) {
  const original = console.log;
  const lines = [];
  console.log = (line) => lines.push(line);
  return Promise.resolve(fn()).finally(() => {
    console.log = original;
  }).then((result) => ({ result, lines }));
}

function supportUserStub() {
  return async (url) => {
    if (String(url).includes("/auth/v1/user")) {
      return new Response(
        JSON.stringify({
          id: "00000000-0000-0000-0000-000000000002",
          email: "support@clubpadel04.test",
          app_metadata: { role: "SUPPORT" },
          user_metadata: {},
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    throw new Error("fetch inesperado en stub SUPPORT: " + url);
  };
}

test("GET /health/live: 200, sin auth, con X-CP04-Request-Id en la respuesta", async () => {
  const request = new Request("https://worker.test/health/live", { method: "GET" });
  const response = await worker.fetch(request, ENV);
  assert.equal(response.status, 200);
  assert.match(response.headers.get(REQUEST_ID_HEADER), REQUEST_ID_PATTERN);
  const body = await response.json();
  assert.equal(body.status, "alive");
  assert.equal("dependencies" in body, false);
});

test("request_id: generado cuando la petición no trae ninguno", async () => {
  const request = new Request("https://worker.test/health/live", { method: "GET" });
  const response = await worker.fetch(request, ENV);
  assert.match(response.headers.get(REQUEST_ID_HEADER), REQUEST_ID_PATTERN);
});

test("request_id: preservado tal cual cuando la petición trae uno válido", async () => {
  const incoming = "req_test-preserved-123";
  const request = new Request("https://worker.test/health/live", {
    method: "GET",
    headers: { [REQUEST_ID_HEADER]: incoming },
  });
  const response = await worker.fetch(request, ENV);
  assert.equal(response.headers.get(REQUEST_ID_HEADER), incoming);
});

test("request_id: sin colisión entre dos peticiones distintas sin cabecera", async () => {
  const r1 = await worker.fetch(new Request("https://worker.test/health/live"), ENV);
  const r2 = await worker.fetch(new Request("https://worker.test/health/live"), ENV);
  assert.notEqual(r1.headers.get(REQUEST_ID_HEADER), r2.headers.get(REQUEST_ID_HEADER));
});

test("correlation_id: preservado cuando la petición trae uno válido", async () => {
  const incoming = "corr_test-preserved-456";
  const request = new Request("https://worker.test/health/live", {
    method: "GET",
    headers: { [CORRELATION_ID_HEADER]: incoming },
  });
  const response = await worker.fetch(request, ENV);
  assert.equal(response.headers.get(CORRELATION_ID_HEADER), incoming);
});

test("correlation_id: ausente en la respuesta cuando la petición no trae ninguno (nunca se inventa)", async () => {
  const response = await worker.fetch(new Request("https://worker.test/health/live"), ENV);
  assert.equal(response.headers.has(CORRELATION_ID_HEADER), false);
});

test("GET /api/support/health/ready: sin token -> 401, fail-closed, mismo patrón que el resto de Centro Técnico", async () => {
  const request = new Request("https://worker.test/api/support/health/ready", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, ENV);
  assert.equal(response.status, 401);
});

test("GET /api/support/health/ready: rol SUPPORT -> 200, dependencias no configuradas coherentes (UNKNOWN/retryable:false), tenant_id no inventado", async () => {
  const { result: response } = await withCapturedConsoleLog(() =>
    withFetch(supportUserStub(), async () => {
      const request = new Request("https://worker.test/api/support/health/ready", {
        method: "GET",
        headers: { Authorization: "Bearer tok", Origin: "http://localhost:5173" },
      });
      return worker.fetch(request, ENV);
    })
  );

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(["HEALTHY", "DEGRADED", "UNHEALTHY", "UNKNOWN"].includes(body.status), true);
  assert.equal(body.checks[0].name, "process_alive");
  assert.equal(body.checks[0].passed, true);

  const make = body.dependencies.find((d) => d.name === "make");
  assert.equal(make.status, "UNKNOWN");
  assert.equal(make.retryable, false); // ENV no trae MAKE_RESERVAS_WEBHOOK

  const supabaseAuth = body.dependencies.find((d) => d.name === "supabase-auth");
  assert.equal(supabaseAuth.retryable, true); // ENV sí trae SUPABASE_URL/ANON_KEY
});

test("GET /api/support/health/ready: rol distinto de SUPPORT -> 403", async () => {
  const playerStub = async (url) => {
    if (String(url).includes("/auth/v1/user")) {
      return new Response(
        JSON.stringify({ id: "x", email: "p@test.com", app_metadata: { role: "PLAYER" }, user_metadata: {} }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    throw new Error("fetch inesperado: " + url);
  };

  const response = await withFetch(playerStub, async () => {
    const request = new Request("https://worker.test/api/support/health/ready", {
      method: "GET",
      headers: { Authorization: "Bearer tok", Origin: "http://localhost:5173" },
    });
    return worker.fetch(request, ENV);
  });

  assert.equal(response.status, 403);
});

test("propagación a Make: el payload reenviado lleva _cp04_correlation con request_id/correlation_id resueltos", async () => {
  let capturedBody = null;
  const envWithMake = { ...ENV, MAKE_RESERVAS_WEBHOOK: "https://hook.make.test/abc" };

  const makeStub = async (url, init) => {
    if (String(url) === envWithMake.MAKE_RESERVAS_WEBHOOK) {
      capturedBody = JSON.parse(init.body);
      return new Response(
        JSON.stringify({ ok: true, status: "created", reservation_id: "res-observability" }),
        { status: 201 }
      );
    }
    throw new Error("fetch inesperado hacia Make: " + url);
  };

  const incomingCorrelationId = "corr_reserva-flow-789";

  const { result: response } = await withCapturedConsoleLog(() =>
    withFetch(makeStub, async () => {
      const request = new Request("https://worker.test/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
          [CORRELATION_ID_HEADER]: incomingCorrelationId,
        },
        body: JSON.stringify({
          accion: "crear_reserva",
          idempotency_key: "idem_observability-test-123456",
          reserva: { fecha: "2026-07-13", hora: "10:00", duracion_minutos: 60, modalidad: "libre", nivel: "iniciacion", pista: "Pista 1" },
          jugador: { nombre: "Test", apellidos: "Apellido", email: "test@example.com", telefono: "600000000" },
        }),
      });
      return worker.fetch(request, envWithMake);
    })
  );

  assert.equal(response.status, 201);
  assert.ok(capturedBody, "el Worker debía haber llamado a Make");
  assert.equal(capturedBody._cp04_correlation.correlation_id, incomingCorrelationId);
  assert.match(capturedBody._cp04_correlation.request_id, REQUEST_ID_PATTERN);
});
