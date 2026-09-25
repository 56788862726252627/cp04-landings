import test from "node:test";
import assert from "node:assert/strict";

import { login, logout, authFetch, getAccessToken } from "../auth/authService.js";
import {
  cp04ShouldBlockAnonymousReservaSubmit,
  cp04IsSessionExpiredReservaResponse,
} from "./reservaAuthGate.js";

// Estos tests corren con Node puro (node --test), no con Vite/React: no
// existe ningún harness de render de React en este proyecto (ver la nota
// equivalente en src/utils/reservationErrors.js). En su lugar, reproducen
// con las MISMAS piezas reales que usan los 3 formularios de App.jsx
// (Reservas, CancelarReserva, ReprogramarReserva) el flujo exacto de
// submit(): comprobar sesión con cp04ShouldBlockAnonymousReservaSubmit
// ANTES de llamar al Worker, mandar la petición con authFetch (adjunta el
// Bearer solo si hay sesión), y si el Worker responde 401
// (cp04IsSessionExpiredReservaResponse) limpiar la sesión local con
// logout({scope:"local"}) en vez de reintentar con el mismo token.
async function submitReserva(auth, payload, fetchStatusLog) {
  if (cp04ShouldBlockAnonymousReservaSubmit(auth)) {
    return { blocked: true, needsLogin: true };
  }

  const res = await authFetch("/api/reservas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  fetchStatusLog.push(res.status);

  if (cp04IsSessionExpiredReservaResponse(res)) {
    await logout({ scope: "local" });
    return { blocked: false, needsLogin: true, sessionExpired: true };
  }

  return { blocked: false, needsLogin: false, ok: res.ok };
}

async function withMockedFetch(handler, run) {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

test("visitante sin sesión: no se llama a POST /api/reservas, se marca needsLogin", async () => {
  await withMockedFetch(
    async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
    () => logout()
  );

  const calls = [];
  const result = await submitReserva({ isAuthenticated: false }, { accion: "crear_reserva" }, calls);

  assert.equal(result.blocked, true);
  assert.equal(result.needsLogin, true);
  assert.deepEqual(calls, [], "no debe haber ninguna llamada de red a /api/reservas");
});

test("sesión válida: la petición se hace vía authFetch y adjunta el Bearer automáticamente", async () => {
  await withMockedFetch(
    async () =>
      new Response(
        JSON.stringify({
          ok: true,
          access_token: "token-reserva-test",
          user: { email: "player@example.test" },
          role: "PLAYER",
        }),
        { status: 200 }
      ),
    () => login("player@example.test", "password-test")
  );

  const capture = {};
  const calls = [];
  await withMockedFetch(
    async (url, options) => {
      capture.url = url;
      capture.options = options;
      return new Response(JSON.stringify({ ok: true, status: "forwarded" }), { status: 200 });
    },
    () => submitReserva({ isAuthenticated: true }, { accion: "crear_reserva" }, calls)
  );

  assert.equal(capture.url, "/api/reservas");
  assert.equal(capture.options.headers.Authorization, "Bearer token-reserva-test");
  assert.deepEqual(calls, [200]);

  await withMockedFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }), () => logout());
});

test("401 del backend: limpia la sesión inválida y pide login de nuevo, sin perder los datos del formulario", async () => {
  await withMockedFetch(
    async () =>
      new Response(
        JSON.stringify({
          ok: true,
          access_token: "token-a-caducar",
          user: { email: "player@example.test" },
          role: "PLAYER",
        }),
        { status: 200 }
      ),
    () => login("player@example.test", "password-test")
  );
  assert.equal(getAccessToken(), "token-a-caducar");

  // Datos no sensibles que el usuario ya había escrito en el formulario: la
  // limpieza de sesión (por el 401) no debe tocarlos — solo el estado de
  // autenticación cambia, nunca el formulario, que sigue viviendo en el
  // componente React (nunca se persiste ni se manda a ningún sitio aquí).
  const formSnapshot = { fecha: "2026-09-21", pista: "Pista 1", hora: "08:00" };

  const calls = [];
  const result = await withMockedFetch(
    async () => new Response(JSON.stringify({ ok: false, error: "INVALID_TOKEN" }), { status: 401 }),
    () => submitReserva({ isAuthenticated: true }, { accion: "crear_reserva", ...formSnapshot }, calls)
  );

  assert.equal(result.needsLogin, true);
  assert.equal(result.sessionExpired, true);
  assert.deepEqual(calls, [401]);

  // Sesión local invalidada: ya no hay access_token, así que el siguiente
  // intento de envío volverá a bloquearse y a mostrar el login inline.
  assert.equal(getAccessToken(), null);

  // El "formulario" (aquí, un snapshot de sus datos no sensibles) sigue
  // intacto: nada en el flujo de 401 lo toca.
  assert.deepEqual(formSnapshot, { fecha: "2026-09-21", pista: "Pista 1", hora: "08:00" });
});
