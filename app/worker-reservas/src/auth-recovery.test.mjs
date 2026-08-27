import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";

// Flujo #10 "🔑 Email Recuperación de Contraseña SaaS":
// Tests del Worker para los endpoints /api/auth/forgot-password y
// /api/auth/change-password con mocks de red.
// Ningún test hace peticiones reales a Supabase.

async function withFakeFetch(impl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

const SUPABASE_ENV = {
  SUPABASE_URL: "https://fake.supabase.test",
  SUPABASE_ANON_KEY: "fake-anon-key",
  APP_PUBLIC_URL: "https://club-padel-04.pages.dev",
};

const ALLOWED_ORIGIN = "http://localhost:5173";
const BASE_ENV = { ALLOWED_ORIGIN, CP04_ENFORCE_ROLE_GATES: "true" };

function makeRequest(path, body, { headers = {}, method = "POST" } = {}) {
  return new Request(`https://worker.test${path}`, {
    method,
    headers: { Origin: ALLOWED_ORIGIN, "Content-Type": "application/json", ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function supabaseRecoverOk() {
  return { ok: true, status: 200, text: async () => JSON.stringify({}) };
}

function supabaseUserUpdateOk() {
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ id: "user-1", email: "test@example.com" }),
  };
}

function supabaseUserUpdateError(code = "INVALID_TOKEN", status = 401) {
  return {
    ok: false,
    status,
    text: async () => JSON.stringify({ code, message: "Token inválido o expirado." }),
  };
}

// ─── POST /api/auth/forgot-password ─────────────────────────────────────────

test("forgot-password: sin Supabase configurado → auth_ready:false, respuesta 200 honesta", async () => {
  const req = makeRequest("/api/auth/forgot-password", { email: "alguien@example.com" });
  const res = await worker.fetch(req, BASE_ENV);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.auth_ready, false);
  assert.equal(data.mode, "backend_stub");
});

test("forgot-password: con Supabase configurado → llama /auth/v1/recover y responde 200 neutro", async () => {
  let supabaseCallUrl;
  let supabaseBody;

  await withFakeFetch(
    async (url, init) => {
      supabaseCallUrl = url;
      supabaseBody = JSON.parse(init.body);
      return supabaseRecoverOk();
    },
    async () => {
      const req = makeRequest("/api/auth/forgot-password", { email: "jugador@example.com" });
      const res = await worker.fetch(req, { ...BASE_ENV, ...SUPABASE_ENV });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.auth_ready, true);
      assert.equal(data.provider, "supabase");
      assert.ok(data.message, "Debe incluir mensaje de respuesta");
    }
  );

  assert.ok(supabaseCallUrl.includes("/auth/v1/recover"), "Debe llamar a Supabase /auth/v1/recover");
  assert.equal(supabaseBody.email, "jugador@example.com");
  assert.ok(supabaseBody.redirect_to.includes("club-padel-04.pages.dev"), "redirect_to debe apuntar a la app");
});

test("forgot-password: anti-enumeración — mismo 200 para email que no existe (error de Supabase no filtrado)", async () => {
  await withFakeFetch(
    async () => ({ ok: false, status: 400, text: async () => JSON.stringify({ code: "email_not_found" }) }),
    async () => {
      const req = makeRequest("/api/auth/forgot-password", { email: "noexiste@example.com" });
      const res = await worker.fetch(req, { ...BASE_ENV, ...SUPABASE_ENV });
      const data = await res.json();

      // Anti-enumeración: la respuesta SIEMPRE es 200, nunca revela si el email existe
      assert.equal(res.status, 200);
      assert.equal(data.ok, true);
      assert.ok(!data.error || !String(data.error).toLowerCase().includes("email"), "No debe filtrar error de email específico");
    }
  );
});

test("forgot-password: body vacío (sin email) → responde 200 sin llamar a Supabase", async () => {
  let fetchCalled = false;
  await withFakeFetch(
    async () => { fetchCalled = true; return supabaseRecoverOk(); },
    async () => {
      const req = makeRequest("/api/auth/forgot-password", {});
      const res = await worker.fetch(req, { ...BASE_ENV, ...SUPABASE_ENV });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.ok, true);
      assert.equal(fetchCalled, false, "Sin email, no debe llamarse a Supabase");
    }
  );
});

test("forgot-password: preflight OPTIONS → 204 sin exigir auth", async () => {
  const req = new Request("https://worker.test/api/auth/forgot-password", {
    method: "OPTIONS",
    headers: { Origin: ALLOWED_ORIGIN },
  });
  const res = await worker.fetch(req, BASE_ENV);
  assert.equal(res.status, 204);
});

// ─── POST /api/auth/change-password ─────────────────────────────────────────

test("change-password: sin Supabase → 501 auth_ready:false", async () => {
  const req = makeRequest("/api/auth/change-password", { newPassword: "NuevaPass1" }, {
    headers: { Authorization: "Bearer fake-token-123" },
  });
  const res = await worker.fetch(req, BASE_ENV);
  const data = await res.json();

  // Sin Supabase: respuesta de "no configurado"
  assert.ok([501, 503].includes(res.status) || data.auth_ready === false, "Debe indicar que auth no está configurado");
  assert.equal(data.ok, false);
});

test("change-password: sin Bearer → 400 VALIDATION_ERROR", async () => {
  await withFakeFetch(
    async () => supabaseUserUpdateOk(),
    async () => {
      const req = makeRequest("/api/auth/change-password", { newPassword: "NuevaPass1" });
      const res = await worker.fetch(req, { ...BASE_ENV, ...SUPABASE_ENV });
      const data = await res.json();

      assert.equal(res.status, 400);
      assert.equal(data.ok, false);
      assert.equal(data.error, "VALIDATION_ERROR");
    }
  );
});

test("change-password: Bearer vacío → 400 VALIDATION_ERROR (nunca 'Bearer ')", async () => {
  await withFakeFetch(
    async () => supabaseUserUpdateOk(),
    async () => {
      const req = makeRequest("/api/auth/change-password", { newPassword: "NuevaPass1" }, {
        headers: { Authorization: "Bearer " },
      });
      const res = await worker.fetch(req, { ...BASE_ENV, ...SUPABASE_ENV });
      const data = await res.json();

      assert.equal(res.status, 400);
      assert.equal(data.ok, false);
    }
  );
});

test("change-password: sin password → 400 VALIDATION_ERROR", async () => {
  await withFakeFetch(
    async () => supabaseUserUpdateOk(),
    async () => {
      const req = makeRequest("/api/auth/change-password", {}, {
        headers: { Authorization: "Bearer real-token-abc" },
      });
      const res = await worker.fetch(req, { ...BASE_ENV, ...SUPABASE_ENV });
      const data = await res.json();

      assert.equal(res.status, 400);
      assert.equal(data.ok, false);
      assert.equal(data.error, "VALIDATION_ERROR");
    }
  );
});

test("change-password: token + password → llama PUT /auth/v1/user de Supabase con el Bearer correcto", async () => {
  let capturedAuthHeader;
  let capturedBody;

  await withFakeFetch(
    async (url, init) => {
      capturedAuthHeader = init.headers.Authorization;
      capturedBody = JSON.parse(init.body);
      return supabaseUserUpdateOk();
    },
    async () => {
      const req = makeRequest("/api/auth/change-password", { newPassword: "NuevaPass1" }, {
        headers: { Authorization: "Bearer recovery-token-xyz" },
      });
      const res = await worker.fetch(req, { ...BASE_ENV, ...SUPABASE_ENV });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.ok, true);
    }
  );

  assert.equal(capturedAuthHeader, "Bearer recovery-token-xyz", "El Bearer original debe llegar a Supabase sin modificarse");
  assert.equal(capturedBody.password, "NuevaPass1");
});

test("change-password: Supabase responde 401 → el Worker retorna error sin filtrar token", async () => {
  await withFakeFetch(
    async () => supabaseUserUpdateError("INVALID_TOKEN", 401),
    async () => {
      const req = makeRequest("/api/auth/change-password", { newPassword: "NuevaPass1" }, {
        headers: { Authorization: "Bearer expired-token" },
      });
      const res = await worker.fetch(req, { ...BASE_ENV, ...SUPABASE_ENV });
      const data = await res.json();

      assert.ok(!res.ok || data.ok === false, "Debe propagarse el error de Supabase");
      // Seguridad: el token no debe aparecer en la respuesta
      const body = JSON.stringify(data);
      assert.ok(!body.includes("expired-token"), "El token no debe filtrarse en la respuesta de error");
    }
  );
});

test("change-password: preflight OPTIONS → 204 sin exigir auth", async () => {
  const req = new Request("https://worker.test/api/auth/change-password", {
    method: "OPTIONS",
    headers: { Origin: ALLOWED_ORIGIN },
  });
  const res = await worker.fetch(req, BASE_ENV);
  assert.equal(res.status, 204);
});
