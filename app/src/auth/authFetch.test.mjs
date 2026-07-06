import test from "node:test";
import assert from "node:assert/strict";

import { authFetch, login, logout } from "./authService.js";

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
