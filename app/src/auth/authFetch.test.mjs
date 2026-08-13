import test from "node:test";
import assert from "node:assert/strict";

import { authFetch, login, logout, getAccessToken } from "./authService.js";

// Estos tests corren con Node puro (node --test src/auth/*.test.mjs), no con
// Vite: se mockea fetch global y se usa login()/logout() (ya expuestos por
// authService) para poblar/limpiar el token en memoria, en vez de acceder a
// estado interno no exportado.

async function withMockedFetch(handler, run) {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

test("authFetch: sin sesión no añade Authorization (comportamiento igual que demo)", async () => {
  // Aseguramos estado sin token: logout con fetch mockeado a algo trivial.
  await withMockedFetch(
    async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
    () => logout()
  );

  const capture = {};
  await withMockedFetch(
    async (url, options) => {
      capture.url = url;
      capture.options = options;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    },
    () => authFetch("/api/reservas?email=x@example.com", { method: "GET" })
  );

  assert.equal(capture.url, "/api/reservas?email=x@example.com");
  assert.equal("Authorization" in capture.options.headers, false);
});

test("authFetch: con sesión real adjunta Authorization: Bearer <token>", async () => {
  await withMockedFetch(
    async () =>
      new Response(
        JSON.stringify({
          ok: true,
          access_token: "token-de-prueba-no-real",
          user: { email: "staff@example.com", role: "STAFF" },
          role: "STAFF",
        }),
        { status: 200 }
      ),
    () => login("staff@example.com", "password-de-prueba")
  );

  const capture = {};
  await withMockedFetch(
    async (url, options) => {
      capture.url = url;
      capture.options = options;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    },
    () => authFetch("/api/jugadores/alta", { method: "POST", headers: { "Content-Type": "application/json" } })
  );

  assert.equal(capture.options.headers.Authorization, "Bearer token-de-prueba-no-real");

  // Limpieza: cerrar sesión para no contaminar otros tests del archivo.
  await withMockedFetch(
    async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
    () => logout()
  );
});

test("authFetch: preserva las cabeceras existentes (Content-Type no se pierde)", async () => {
  await withMockedFetch(
    async () =>
      new Response(
        JSON.stringify({ ok: true, access_token: "token-b", user: { email: "a@example.com" }, role: "PLAYER" }),
        { status: 200 }
      ),
    () => login("a@example.com", "x")
  );

  const capture = {};
  await withMockedFetch(
    async (url, options) => {
      capture.options = options;
      return new Response("{}", { status: 200 });
    },
    () =>
      authFetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      })
  );

  assert.equal(capture.options.headers["Content-Type"], "application/json");
  assert.equal(capture.options.headers.Accept, "application/json");
  assert.equal(capture.options.headers.Authorization, "Bearer token-b");
  assert.equal(capture.options.method, "POST");

  await withMockedFetch(
    async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
    () => logout()
  );
});

test("authFetch: nunca envía 'Bearer' vacío cuando no hay token", async () => {
  await withMockedFetch(
    async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
    () => logout()
  );

  const capture = {};
  await withMockedFetch(
    async (url, options) => {
      capture.options = options;
      return new Response("{}", { status: 200 });
    },
    () => authFetch("/api/disponibilidad?fecha=2026-07-13")
  );

  assert.equal(capture.options.headers?.Authorization, undefined);
});

test("authFetch: no intercepta la respuesta, un 401 se devuelve tal cual (manejo sigue en el call site)", async () => {
  await withMockedFetch(
    async () => new Response(JSON.stringify({ ok: false, error: "MISSING_TOKEN" }), { status: 401 }),
    async () => {
      const response = await authFetch("/api/reservas?email=x@example.com");
      assert.equal(response.status, 401);
      const body = await response.json();
      assert.equal(body.error, "MISSING_TOKEN");
    }
  );
});

// MEJORA 2026-08-08 (diagnóstico E2E Alta de jugador: sesión STAFF real
// autenticada pero el Worker rechazaba la petición antes de llegar a Make
// — causa más probable: access_token caducado sin refresco automático).
// Los tests de abajo cubren el refresco proactivo (antes de expirar) y el
// reintento reactivo único ante un 401, sin duplicar los tests de arriba.

function routedFetch(routes) {
  return async (url, options) => {
    const key = String(url);
    const route = routes.find(r => key.includes(r.match));
    if (!route) throw new Error(`Sin ruta mockeada para ${key}`);
    return route.handler(url, options);
  };
}

test("authFetch: access_token a punto de caducar -> refresca proactivamente ANTES de enviar la petición", async () => {
  await withMockedFetch(
    routedFetch([
      {
        match: "/api/auth/login",
        handler: async () =>
          new Response(
            JSON.stringify({
              ok: true,
              access_token: "token-viejo-a-punto-de-caducar",
              refresh_token: "refresh-valido",
              user: { email: "staff@example.test", role: "STAFF" },
              role: "STAFF",
              expires_in: 10, // 10s < margen de seguridad de 30s: se considera "a punto de caducar" de inmediato
            }),
            { status: 200 }
          ),
      },
    ]),
    () => login("staff@example.test", "password-de-prueba")
  );

  let refreshCalls = 0;
  const capture = {};

  await withMockedFetch(
    routedFetch([
      {
        match: "/api/auth/refresh",
        handler: async () => {
          refreshCalls += 1;
          return new Response(
            JSON.stringify({ ok: true, access_token: "token-refrescado", refresh_token: "refresh-valido-2", expires_in: 3600 }),
            { status: 200 }
          );
        },
      },
      {
        match: "/api/jugadores/alta",
        handler: async (url, options) => {
          capture.headers = options.headers;
          return new Response(JSON.stringify({ ok: true, status: "CREATED" }), { status: 201 });
        },
      },
    ]),
    () => authFetch("/api/jugadores/alta", { method: "POST", headers: { "Content-Type": "application/json" } })
  );

  assert.equal(refreshCalls, 1);
  assert.equal(capture.headers.Authorization, "Bearer token-refrescado");

  await withMockedFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }), () => logout());
});

test("authFetch: el refresco proactivo falla -> limpia la sesión (fail-closed) y la petición sale sin Authorization, sin colgarse", async () => {
  await withMockedFetch(
    routedFetch([
      {
        match: "/api/auth/login",
        handler: async () =>
          new Response(
            JSON.stringify({
              ok: true,
              access_token: "token-a-punto-de-caducar",
              refresh_token: "refresh-que-va-a-fallar",
              user: { email: "staff@example.test", role: "STAFF" },
              role: "STAFF",
              expires_in: 5,
            }),
            { status: 200 }
          ),
      },
    ]),
    () => login("staff@example.test", "password-de-prueba")
  );

  let targetCalls = 0;
  const capture = {};

  const response = await withMockedFetch(
    routedFetch([
      {
        match: "/api/auth/refresh",
        handler: async () =>
          new Response(JSON.stringify({ ok: false, error: "REFRESH_FAILED" }), { status: 401 }),
      },
      {
        match: "/api/jugadores/alta",
        handler: async (url, options) => {
          targetCalls += 1;
          capture.headers = options.headers;
          return new Response(JSON.stringify({ ok: false, error: "MISSING_TOKEN" }), { status: 401 });
        },
      },
    ]),
    () => authFetch("/api/jugadores/alta", { method: "POST", headers: { "Content-Type": "application/json" } })
  );

  assert.equal(response.status, 401);
  assert.equal(targetCalls, 1, "sin refresh_token tras el fallo, no debe reintentarse (nunca bucle)");
  assert.equal("Authorization" in capture.headers, false);
  assert.equal(getAccessToken(), null, "la sesión inválida debe quedar limpia, no 'zombie'");
});

test("authFetch: 401 con refresh_token disponible -> refresca UNA vez y reintenta la MISMA petición UNA vez", async () => {
  await withMockedFetch(
    routedFetch([
      {
        match: "/api/auth/login",
        handler: async () =>
          new Response(
            JSON.stringify({
              ok: true,
              access_token: "token-que-el-worker-va-a-rechazar",
              refresh_token: "refresh-valido",
              user: { email: "staff@example.test", role: "STAFF" },
              role: "STAFF",
              expires_in: 3600, // no está "a punto de caducar": no hay refresco proactivo aquí
            }),
            { status: 200 }
          ),
      },
    ]),
    () => login("staff@example.test", "password-de-prueba")
  );

  let refreshCalls = 0;
  let targetCalls = 0;
  const capturedAuthByCall = [];

  const response = await withMockedFetch(
    routedFetch([
      {
        match: "/api/auth/refresh",
        handler: async () => {
          refreshCalls += 1;
          return new Response(
            JSON.stringify({ ok: true, access_token: "token-tras-401", refresh_token: "refresh-valido-2", expires_in: 3600 }),
            { status: 200 }
          );
        },
      },
      {
        match: "/api/jugadores/alta",
        handler: async (url, options) => {
          targetCalls += 1;
          capturedAuthByCall.push(options.headers.Authorization);
          if (targetCalls === 1) {
            return new Response(JSON.stringify({ ok: false, error: "INVALID_TOKEN" }), { status: 401 });
          }
          return new Response(JSON.stringify({ ok: true, status: "CREATED" }), { status: 201 });
        },
      },
    ]),
    () => authFetch("/api/jugadores/alta", { method: "POST", headers: { "Content-Type": "application/json" } })
  );

  assert.equal(refreshCalls, 1);
  assert.equal(targetCalls, 2, "debe reintentar exactamente una vez tras el 401");
  assert.equal(capturedAuthByCall[0], "Bearer token-que-el-worker-va-a-rechazar");
  assert.equal(capturedAuthByCall[1], "Bearer token-tras-401");
  assert.equal(response.status, 201);

  await withMockedFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }), () => logout());
});

test("authFetch: si el reintento tras 401 también devuelve 401, no hay un tercer intento (nunca bucle infinito)", async () => {
  await withMockedFetch(
    routedFetch([
      {
        match: "/api/auth/login",
        handler: async () =>
          new Response(
            JSON.stringify({
              ok: true,
              access_token: "token-siempre-rechazado",
              refresh_token: "refresh-valido",
              user: { email: "staff@example.test", role: "STAFF" },
              role: "STAFF",
              expires_in: 3600,
            }),
            { status: 200 }
          ),
      },
    ]),
    () => login("staff@example.test", "password-de-prueba")
  );

  let refreshCalls = 0;
  let targetCalls = 0;

  const response = await withMockedFetch(
    routedFetch([
      {
        match: "/api/auth/refresh",
        handler: async () => {
          refreshCalls += 1;
          return new Response(
            JSON.stringify({ ok: true, access_token: "token-tras-401-tambien-rechazado", refresh_token: "refresh-valido-2", expires_in: 3600 }),
            { status: 200 }
          );
        },
      },
      {
        match: "/api/jugadores/alta",
        handler: async () => {
          targetCalls += 1;
          return new Response(JSON.stringify({ ok: false, error: "INVALID_TOKEN" }), { status: 401 });
        },
      },
    ]),
    () => authFetch("/api/jugadores/alta", { method: "POST", headers: { "Content-Type": "application/json" } })
  );

  assert.equal(refreshCalls, 1, "solo un intento de refresco, nunca en bucle");
  assert.equal(targetCalls, 2, "petición original + UN reintento, nunca un tercer intento");
  assert.equal(response.status, 401);

  await withMockedFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }), () => logout());
});
