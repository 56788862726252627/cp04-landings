import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";

// Verificación local (2026-08-05) del flujo de recuperación de contraseña
// pendiente en App.jsx/index.js/wrangler.toml (fix/make-50-counter-20260801):
// /api/auth/change-password, la traducción de mensajes de Supabase
// (CP04_SUPABASE_MSG_MAP/cp04TranslateSupabaseMsg) y email_redirect_to en
// /api/auth/register. Ningún test de este archivo hace una petición de red
// real: globalThis.fetch se sustituye por un stub local cuando hace falta
// simular la respuesta de Supabase, restaurado siempre en el `finally`.
// Ningún token/credencial es real.

async function withFakeFetch(fakeFetchImpl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetchImpl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

const SUPABASE_ENV = {
  SUPABASE_URL: "https://fake-project.supabase.test",
  SUPABASE_ANON_KEY: "fake-anon-key-e2e-test",
  APP_PUBLIC_URL: "https://club-padel-04.pages.dev",
};

function authRequest(path, body, { headers = {} } = {}) {
  return new Request(`https://worker.test${path}`, {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function fakeSupabaseResponse(status, data) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

// --- /api/auth/change-password ---

test("change-password: sin SUPABASE_URL/ANON_KEY -> 501 backend_stub honesto, sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch sin Supabase configurado");
    },
    async () => {
      const response = await worker.fetch(
        authRequest("/api/auth/change-password", { newPassword: "nuevaClave123" }, { headers: { Authorization: "Bearer fake-token" } }),
        {}
      );
      const data = await response.json();
      assert.equal(response.status, 501);
      assert.equal(data.ok, false);
      assert.equal(data.mode, "backend_stub");
      assert.equal(data.error, "AUTH_BACKEND_NOT_CONFIGURED");
    }
  );
});

test("change-password: sin token Bearer -> 400 VALIDATION_ERROR, sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch sin token");
    },
    async () => {
      const response = await worker.fetch(
        authRequest("/api/auth/change-password", { newPassword: "nuevaClave123" }),
        SUPABASE_ENV
      );
      const data = await response.json();
      assert.equal(response.status, 400);
      assert.equal(data.ok, false);
      assert.equal(data.error, "VALIDATION_ERROR");
    }
  );
});

test("change-password: sin newPassword -> 400 VALIDATION_ERROR, sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch sin newPassword");
    },
    async () => {
      const response = await worker.fetch(
        authRequest("/api/auth/change-password", {}, { headers: { Authorization: "Bearer fake-token" } }),
        SUPABASE_ENV
      );
      const data = await response.json();
      assert.equal(response.status, 400);
      assert.equal(data.ok, false);
      assert.equal(data.error, "VALIDATION_ERROR");
    }
  );
});

test("change-password: token expirado/invalido -> Supabase 401 traducido al español", async () => {
  await withFakeFetch(
    async (url) => {
      assert.match(String(url), /\/auth\/v1\/user$/);
      return fakeSupabaseResponse(401, { msg: "Token has expired or is invalid" });
    },
    async () => {
      const response = await worker.fetch(
        authRequest("/api/auth/change-password", { newPassword: "nuevaClave123" }, { headers: { Authorization: "Bearer fake-token" } }),
        SUPABASE_ENV
      );
      const data = await response.json();
      assert.equal(response.status, 401);
      assert.equal(data.ok, false);
      assert.equal(data.message, "El enlace ha caducado o no es válido. Solicita uno nuevo.");
    }
  );
});

test("change-password: contraseña demasiado corta -> mensaje de Supabase traducido", async () => {
  await withFakeFetch(
    async () => fakeSupabaseResponse(422, { msg: "Password should be at least 6 characters" }),
    async () => {
      const response = await worker.fetch(
        authRequest("/api/auth/change-password", { newPassword: "123" }, { headers: { Authorization: "Bearer fake-token" } }),
        SUPABASE_ENV
      );
      const data = await response.json();
      assert.equal(response.status, 422);
      assert.equal(data.message, "La contraseña debe tener al menos 6 caracteres.");
    }
  );
});

test("change-password: éxito -> ok:true y contraseña actualizada", async () => {
  await withFakeFetch(
    async (url, options) => {
      const parsedBody = JSON.parse(options.body);
      assert.equal(parsedBody.password, "nuevaClave123");
      assert.equal(options.headers.Authorization, "Bearer fake-token");
      return fakeSupabaseResponse(200, { id: "fake-user-id", email: "socio@example.test" });
    },
    async () => {
      const response = await worker.fetch(
        authRequest("/api/auth/change-password", { newPassword: "nuevaClave123" }, { headers: { Authorization: "Bearer fake-token" } }),
        SUPABASE_ENV
      );
      const data = await response.json();
      assert.equal(response.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.message, "Contraseña actualizada.");
    }
  );
});

// --- cp04TranslateSupabaseMsg vía /api/auth/login (misma función compartida) ---

test("login: credenciales inválidas -> mensaje de Supabase traducido al español", async () => {
  await withFakeFetch(
    async () => fakeSupabaseResponse(400, { error_description: "Invalid login credentials" }),
    async () => {
      const response = await worker.fetch(
        authRequest("/api/auth/login", { email: "socio@example.test", password: "loquesea" }),
        SUPABASE_ENV
      );
      const data = await response.json();
      assert.equal(response.status, 400);
      // El traductor solo actúa sobre msg/message; error_description no se
      // traduce (mismo comportamiento previo, no regresión):
      // documentamos el mensaje resultante tal cual lo produce el código.
      assert.equal(data.message, "Login no válido.");
    }
  );
});

// MEJORA 2026-08-08 (diagnóstico E2E Alta de jugador, mejora AUTH PRE-E2E):
// verifySupabaseIdentity ya tenía este test (auth/authorization.test.mjs) para
// el gate de rutas mutables, pero /api/auth/login usa una función de mapeo
// distinta (cp04MapSupabaseUserToCp04) para construir la respuesta de login.
// Cierra el mismo principio ("solo app_metadata.role es de confianza") en el
// tramo que faltaba cubrir.
test("login: rol solo en user_metadata (no en app_metadata) -> se ignora, degrada a PLAYER", async () => {
  await withFakeFetch(
    async () =>
      fakeSupabaseResponse(200, {
        access_token: "fake-access-token-e2e-test",
        refresh_token: "fake-refresh-token-e2e-test",
        expires_in: 3600,
        token_type: "bearer",
        user: {
          id: "user-1",
          email: "staff@example.test",
          user_metadata: { role: "STAFF" }, // editable por el propio usuario: no es de confianza
          app_metadata: {}, // nunca asignado por un service_role en este caso
        },
      }),
    async () => {
      const response = await worker.fetch(
        authRequest("/api/auth/login", { email: "staff@example.test", password: "loquesea" }),
        SUPABASE_ENV
      );
      const data = await response.json();
      assert.equal(response.status, 200);
      assert.equal(data.role, "PLAYER");
      assert.equal(data.user.role, "PLAYER");
    }
  );
});

test("register: mensaje 'ya registrado' -> traducido al español", async () => {
  await withFakeFetch(
    async () => fakeSupabaseResponse(400, { msg: "User already registered" }),
    async () => {
      const response = await worker.fetch(
        authRequest("/api/auth/register", {
          email: "socio@example.test",
          password: "nuevaClave123",
          nombre: "Test",
          telefono: "600000000",
        }),
        SUPABASE_ENV
      );
      const data = await response.json();
      assert.equal(response.status, 400);
      assert.equal(data.message, "Este correo ya está registrado. Prueba a iniciar sesión.");
    }
  );
});

// --- email_redirect_to en /api/auth/register ---

test("register: incluye email_redirect_to apuntando a APP_PUBLIC_URL", async () => {
  await withFakeFetch(
    async (url, options) => {
      const parsedBody = JSON.parse(options.body);
      assert.equal(parsedBody.email_redirect_to, "https://club-padel-04.pages.dev/");
      return fakeSupabaseResponse(200, { user: { id: "fake-user-id", email: "socio@example.test", app_metadata: {}, user_metadata: {} } });
    },
    async () => {
      const response = await worker.fetch(
        authRequest("/api/auth/register", {
          email: "socio@example.test",
          password: "nuevaClave123",
          nombre: "Test",
          telefono: "600000000",
        }),
        SUPABASE_ENV
      );
      const data = await response.json();
      assert.equal(response.status, 200);
      assert.equal(data.ok, true);
    }
  );
});

// --- mensaje no reconocido: passthrough sin traducir (no regresión) ---

test("change-password: mensaje de Supabase no mapeado se devuelve sin modificar", async () => {
  await withFakeFetch(
    async () => fakeSupabaseResponse(500, { msg: "Something totally unexpected happened" }),
    async () => {
      const response = await worker.fetch(
        authRequest("/api/auth/change-password", { newPassword: "nuevaClave123" }, { headers: { Authorization: "Bearer fake-token" } }),
        SUPABASE_ENV
      );
      const data = await response.json();
      assert.equal(response.status, 500);
      assert.equal(data.message, "Something totally unexpected happened");
    }
  );
});
