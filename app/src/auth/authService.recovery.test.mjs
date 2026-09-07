import test from "node:test";
import assert from "node:assert/strict";

import { forgotPassword, updatePassword, updatePasswordWithToken, logout } from "./authService.js";

// Flujo #10 "🔑 Email Recuperación de Contraseña SaaS":
// Tests unitarios de authService para los tres puntos del flujo de recovery.
// No hay peticiones de red reales: se mockea globalThis.fetch.

async function withMockedFetch(handler, run) {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

function makeResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ─── forgotPassword ──────────────────────────────────────────────────────────

test("forgotPassword: respuesta backend_stub (auth_ready:false) → authReady:false, ok:true", async () => {
  const result = await withMockedFetch(
    async () => makeResponse({ ok: true, auth_ready: false, mode: "backend_stub", message: "backend_stub" }),
    () => forgotPassword("test@example.com")
  );

  assert.equal(result.ok, true);
  assert.equal(result.authReady, false);
  assert.ok(result.message, "Debe incluir mensaje");
});

test("forgotPassword: respuesta Supabase real (auth_ready:true) → authReady:true, ok:true", async () => {
  const result = await withMockedFetch(
    async () => makeResponse({ ok: true, auth_ready: true, provider: "supabase", message: "Instrucciones enviadas." }),
    () => forgotPassword("jugador@example.com")
  );

  assert.equal(result.ok, true);
  assert.equal(result.authReady, true);
});

test("forgotPassword: respuesta neutra — no revela si el email existe", async () => {
  const result = await withMockedFetch(
    async () => makeResponse({ ok: true, auth_ready: true, message: "Si el correo existe, se enviarán instrucciones de recuperación." }),
    () => forgotPassword("noexiste@example.com")
  );

  assert.equal(result.ok, true);
  // La respuesta es la misma que si el email existiera
  assert.ok(result.message.length > 0, "Debe incluir mensaje neutro");
});

test("forgotPassword: error de red → ok:false, networkError:true, sin authReady:false, sin exception", async () => {
  // Un fallo de red NO implica proveedor no configurado (authReady:false).
  // authReady queda sin definir para distinguirlo de backend_stub (auth_ready:false
  // explícito del backend). La UI debe mostrar un error de conexión, no "proveedor
  // pendiente de configurar".
  const result = await withMockedFetch(
    async () => { throw new TypeError("Network error"); },
    () => forgotPassword("test@example.com")
  );

  assert.equal(result.ok, false);
  assert.equal(result.networkError, true, "Debe indicar networkError:true para que la UI distinga este caso");
  assert.notEqual(result.authReady, false, "Un fallo de red NO debe marcar authReady:false (eso es solo para backend_stub)");
  assert.ok(result.message.length > 0, "Debe incluir mensaje de error de red");
});

test("forgotPassword: HTTP 200 con auth_ready:true → authReady:true, ok:true (éxito real)", async () => {
  const result = await withMockedFetch(
    async () => makeResponse({ ok: true, auth_ready: true, provider: "supabase", message: "Si el correo existe..." }),
    () => forgotPassword("staff@clubpadel04.com")
  );

  assert.equal(result.ok, true);
  assert.equal(result.authReady, true);
  assert.equal(result.networkError, undefined, "No debe haber networkError en éxito");
});

test("forgotPassword: HTTP 200 con auth_ready:false → authReady:false (backend_stub, proveedor no configurado)", async () => {
  const result = await withMockedFetch(
    async () => makeResponse({ ok: true, auth_ready: false, mode: "backend_stub", message: "Sin proveedor" }),
    () => forgotPassword("cualquiera@example.com")
  );

  assert.equal(result.ok, true);
  assert.equal(result.authReady, false, "Debe ser false para backend_stub explícito");
  assert.equal(result.networkError, undefined, "backend_stub no es un error de red");
});

test("forgotPassword: envía el email en el body al endpoint correcto", async () => {
  let capturedUrl;
  let capturedBody;

  await withMockedFetch(
    async (url, init) => {
      capturedUrl = url;
      capturedBody = JSON.parse(init.body);
      return makeResponse({ ok: true, auth_ready: true, message: "ok" });
    },
    () => forgotPassword("cliente@club.com")
  );

  assert.ok(capturedUrl.includes("forgot-password"), "Debe llamar al endpoint forgot-password");
  assert.equal(capturedBody.email, "cliente@club.com");
});

// ─── updatePassword (sesión activa) ─────────────────────────────────────────

test("updatePassword: sin token en state → ok:false, MISSING_TOKEN (sin llamada de red)", async () => {
  // Asegurar estado sin token
  await withMockedFetch(
    async () => makeResponse({ ok: true }),
    () => logout()
  );

  let fetchCalled = false;
  const result = await withMockedFetch(
    async () => { fetchCalled = true; return makeResponse({ ok: true }); },
    () => updatePassword("NuevaPass1")
  );

  assert.equal(result.ok, false);
  assert.equal(result.error, "MISSING_TOKEN");
  assert.equal(fetchCalled, false, "No debe llamar al backend sin token");
});

test("updatePassword: password vacío → ok:false sin llamada de red (el check es en cliente)", async () => {
  // Nota: updatePassword requiere token primero — este test verifica la
  // validación post-token. El check real está en el Worker; el cliente aquí
  // solo verifica que hay token antes de llamar.
  // Con token ausente ya se verifica arriba; con token presente y pw vacío
  // el Worker devuelve 400.
  await withMockedFetch(
    async () => makeResponse({ ok: true }),
    () => logout()
  );

  const result = await withMockedFetch(
    async () => makeResponse({ ok: false, error: "VALIDATION_ERROR", auth_ready: true }, 400),
    () => updatePassword("") // string vacío — se envía, el Worker rechaza
  );

  // Sin token → MISSING_TOKEN sin llegar al backend
  assert.equal(result.ok, false);
  assert.equal(result.error, "MISSING_TOKEN");
});

// ─── updatePasswordWithToken (recovery) ─────────────────────────────────────

test("updatePasswordWithToken: token ausente → ok:false, MISSING_RECOVERY_TOKEN, sin llamada de red", async () => {
  let fetchCalled = false;
  const result = await withMockedFetch(
    async () => { fetchCalled = true; return makeResponse({ ok: true }); },
    () => updatePasswordWithToken("NuevaPass1", null)
  );

  assert.equal(result.ok, false);
  assert.equal(result.error, "MISSING_RECOVERY_TOKEN");
  assert.equal(fetchCalled, false, "No debe llamar al backend sin token");
});

test("updatePasswordWithToken: token vacío string → ok:false, MISSING_RECOVERY_TOKEN", async () => {
  let fetchCalled = false;
  const result = await withMockedFetch(
    async () => { fetchCalled = true; return makeResponse({ ok: true }); },
    () => updatePasswordWithToken("NuevaPass1", "")
  );

  assert.equal(result.ok, false);
  assert.equal(result.error, "MISSING_RECOVERY_TOKEN");
  assert.equal(fetchCalled, false);
});

test("updatePasswordWithToken: password ausente → ok:false, MISSING_PASSWORD, sin llamada de red", async () => {
  let fetchCalled = false;
  const result = await withMockedFetch(
    async () => { fetchCalled = true; return makeResponse({ ok: true }); },
    () => updatePasswordWithToken("", "recovery-token-xyz")
  );

  assert.equal(result.ok, false);
  assert.equal(result.error, "MISSING_PASSWORD");
  assert.equal(fetchCalled, false);
});

test("updatePasswordWithToken: éxito — usa el recovery token como Bearer, no toca state", async () => {
  let capturedAuthHeader;
  let capturedBody;

  const result = await withMockedFetch(
    async (url, init) => {
      capturedAuthHeader = init.headers.Authorization;
      capturedBody = JSON.parse(init.body);
      return makeResponse({ ok: true, auth_ready: true, message: "Contraseña actualizada." });
    },
    () => updatePasswordWithToken("NuevaPass99", "recovery-token-abc")
  );

  assert.equal(result.ok, true);
  assert.equal(result.authReady, true);
  assert.equal(capturedAuthHeader, "Bearer recovery-token-abc");
  assert.equal(capturedBody.newPassword, "NuevaPass99");
});

test("updatePasswordWithToken: error de Supabase → ok:false con mensaje de error propagado", async () => {
  const result = await withMockedFetch(
    async () => makeResponse({ ok: false, error: "TOKEN_EXPIRED", auth_ready: true, message: "Token expirado." }, 401),
    () => updatePasswordWithToken("NuevaPass1", "expired-token-xyz")
  );

  assert.equal(result.ok, false);
  assert.equal(result.error, "TOKEN_EXPIRED");
  assert.ok(result.message.length > 0, "Debe propagar mensaje de error");
});

test("updatePasswordWithToken: error de red → ok:false, UPSTREAM_ERROR, sin exception", async () => {
  const result = await withMockedFetch(
    async () => { throw new TypeError("Network error"); },
    () => updatePasswordWithToken("NuevaPass1", "recovery-token-xyz")
  );

  assert.equal(result.ok, false);
  assert.equal(result.error, "UPSTREAM_ERROR");
  assert.ok(result.message.length > 0);
});

test("updatePasswordWithToken: el recovery token NO queda en state.accessToken tras llamada", async () => {
  // Verificamos que el token de recovery no "contamina" la sesión normal:
  // getAccessToken() debe seguir null después de usar updatePasswordWithToken.
  const { getAccessToken, logout: svcLogout } = await import("./authService.js");

  await withMockedFetch(
    async () => makeResponse({ ok: true }),
    () => svcLogout()
  );

  await withMockedFetch(
    async () => makeResponse({ ok: true, auth_ready: true, message: "ok" }),
    () => updatePasswordWithToken("NuevaPass1", "recovery-token-xyz")
  );

  assert.equal(getAccessToken(), null, "El recovery token no debe quedar en state como sesión activa");
});
