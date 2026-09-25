import test from "node:test";
import assert from "node:assert/strict";

import { authFetch, login, logout } from "./authService.js";

// ── Tests de login ────────────────────────────────────────────────────────────
// withMockedFetch se define más abajo en el mismo archivo (ya existía).

function makeResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("login: credenciales inválidas (HTTP 400 + invalid_grant) → mensaje 'Correo electrónico o contraseña incorrectos.'", async () => {
  // Supabase devuelve error "invalid_grant" en /auth/v1/token?grant_type=password
  // cuando el email o la contraseña son incorrectos. El Worker lo pasa como HTTP 400.
  // La UI debe mostrar el mensaje de credenciales, NO "No se pudo contactar".
  const result = await withMockedFetch(
    async () => makeResponse({ ok: false, auth_ready: true, error: "invalid_grant", message: "Login no válido." }, 400),
    () => login("staff@example.com", "password-incorrecta")
  );

  assert.equal(result.ok, false);
  assert.equal(result.message, "Correo electrónico o contraseña incorrectos.");
  assert.notEqual(result.message, "No se pudo contactar con el servidor de autenticación.",
    "Un 400 de credenciales NO debe mostrar el mensaje de error de red");
});

test("login: error de red (catch) → mensaje 'No se pudo contactar', ok:false, UPSTREAM_ERROR", async () => {
  // Solo el catch (fallo real de red/fetch) debe mostrar "No se pudo contactar".
  // Un 4xx de Supabase no debe llegar aquí.
  const result = await withMockedFetch(
    async () => { throw new TypeError("Network failure"); },
    () => login("staff@example.com", "cualquier")
  );

  assert.equal(result.ok, false);
  assert.equal(result.error, "UPSTREAM_ERROR");
  assert.equal(result.message, "No se pudo contactar con el servidor de autenticación.");
});

test("login: INVALID_CREDENTIALS (HTTP 400) → mismo mensaje claro que invalid_grant", async () => {
  const result = await withMockedFetch(
    async () => makeResponse({ ok: false, auth_ready: true, error: "INVALID_CREDENTIALS", message: "Login no válido." }, 400),
    () => login("staff@example.com", "wrong")
  );

  assert.equal(result.ok, false);
  assert.equal(result.message, "Correo electrónico o contraseña incorrectos.");
});

test("login: error de Supabase non-credential (HTTP 500) → propaga mensaje del backend, NO mensaje de credenciales", async () => {
  const result = await withMockedFetch(
    async () => makeResponse({ ok: false, auth_ready: true, error: "SERVER_ERROR", message: "Error interno." }, 500),
    () => login("staff@example.com", "password")
  );

  assert.equal(result.ok, false);
  assert.equal(result.message, "Error interno.", "Debe propagar el mensaje del backend para errores no relacionados con credenciales");
  assert.notEqual(result.message, "Correo electrónico o contraseña incorrectos.");
});

test("login: auth_ready:false (backend_stub, proveedor no configurado) → authReady:false propagado", async () => {
  const result = await withMockedFetch(
    async () => makeResponse({ ok: false, auth_ready: false, error: "AUTH_BACKEND_NOT_CONFIGURED" }, 501),
    () => login("cualquiera@example.com", "any")
  );

  assert.equal(result.ok, false);
  assert.equal(result.authReady, false);
});

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
