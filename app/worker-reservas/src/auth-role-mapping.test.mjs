import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";

// Cobertura añadida tras el diagnóstico P0 "SUPPORT se muestra como PLAYER"
// (2026-07-09). authorization.test.mjs ya probaba que verifySupabaseIdentity
// (usada por requireRoles, gate de rutas mutables) nunca confía en
// user_metadata.role. Pero /api/auth/login y /api/auth/me (index.js) usan un
// mapeo Supabase->Cp04 completamente separado (cp04MapSupabaseUserToCp04,
// cp04SafeAuthUser) que no tenía NINGÚN test propio: si alguien rompiera ese
// mapeo (p.ej. leyendo user_metadata.role por error, o quitando el fallback
// seguro), nada lo habría detectado. Este archivo cierra ese hueco.

const ENV = {
  SUPABASE_URL: "https://example-project.supabase.co",
  SUPABASE_ANON_KEY: "anon-key-not-real",
  ALLOWED_ORIGIN: "http://localhost:5173",
};

function withFetch(stub, fn) {
  const original = globalThis.fetch;
  globalThis.fetch = stub;
  return fn().finally(() => {
    globalThis.fetch = original;
  });
}

function supabaseUser({ appMetaRole, userMetaRole } = {}) {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    email: "cuenta@clubpadel04.test",
    app_metadata: appMetaRole !== undefined ? { role: appMetaRole } : {},
    user_metadata: userMetaRole !== undefined ? { role: userMetaRole } : {},
  };
}

function loginFetchStub(user) {
  return async (url) => {
    const u = String(url);
    if (u.includes("/auth/v1/token?grant_type=password")) {
      return new Response(
        JSON.stringify({ access_token: "tok", refresh_token: "r", expires_in: 3600, token_type: "bearer", user }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    throw new Error("fetch inesperado en stub de login: " + u);
  };
}

function meFetchStub(user) {
  return async (url) => {
    const u = String(url);
    if (u.includes("/auth/v1/user")) {
      return new Response(JSON.stringify(user), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    throw new Error("fetch inesperado en stub de /me: " + u);
  };
}

async function loginRole(user) {
  return withFetch(loginFetchStub(user), async () => {
    const request = new Request("https://worker.test/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
      body: JSON.stringify({ email: user.email, password: "irrelevante-en-el-stub" }),
    });
    const body = await (await worker.fetch(request, ENV)).json();
    return body;
  });
}

for (const role of ["PLAYER", "STAFF", "ADMIN", "SUPPORT"]) {
  test(`POST /api/auth/login: app_metadata.role=${role} se propaga sin degradar`, async () => {
    const body = await loginRole(supabaseUser({ appMetaRole: role }));
    assert.equal(body.ok, true);
    assert.equal(body.role, role);
    assert.equal(body.user.role, role);
  });
}

test("POST /api/auth/login: rol presente SOLO en user_metadata (no en app_metadata) degrada a PLAYER, nunca lo adopta", async () => {
  // Este es exactamente el patrón que reproduce el síntoma "SUPPORT ->
  // PLAYER": si el rol se escribió en el editor equivocado de Supabase
  // Studio (user_metadata, editable por el propio usuario) en lugar de
  // app_metadata (solo service_role), el backend debe fail-closed a PLAYER,
  // no confiar en el dato no verificado ni devolver un error confuso.
  const body = await loginRole(supabaseUser({ appMetaRole: undefined, userMetaRole: "SUPPORT" }));
  assert.equal(body.ok, true);
  assert.equal(body.role, "PLAYER");
  assert.equal(body.user.role, "PLAYER");
});

test("POST /api/auth/login: rol desconocido/con typo en app_metadata degrada a PLAYER", async () => {
  const body = await loginRole(supabaseUser({ appMetaRole: "SUPPRT" }));
  assert.equal(body.role, "PLAYER");
});

for (const role of ["PLAYER", "STAFF", "ADMIN", "SUPPORT"]) {
  test(`GET /api/auth/me: app_metadata.role=${role} se propaga sin degradar`, async () => {
    const body = await withFetch(meFetchStub(supabaseUser({ appMetaRole: role })), async () => {
      const request = new Request("https://worker.test/api/auth/me", {
        method: "GET",
        headers: { Authorization: "Bearer tok", Origin: "http://localhost:5173" },
      });
      return (await worker.fetch(request, ENV)).json();
    });
    assert.equal(body.ok, true);
    assert.equal(body.role, role);
    assert.equal(body.user.role, role);
  });
}

test("GET /api/auth/me: rol solo en user_metadata degrada a PLAYER, nunca lo adopta", async () => {
  const body = await withFetch(
    meFetchStub(supabaseUser({ appMetaRole: undefined, userMetaRole: "SUPPORT" })),
    async () => {
      const request = new Request("https://worker.test/api/auth/me", {
        method: "GET",
        headers: { Authorization: "Bearer tok", Origin: "http://localhost:5173" },
      });
      return (await worker.fetch(request, ENV)).json();
    }
  );
  assert.equal(body.role, "PLAYER");
});

test("GET /api/auth/me: sin Authorization deniega 401 MISSING_BEARER_TOKEN sin llamar a Supabase", async () => {
  const body = await withFetch(
    async (url) => {
      throw new Error("no debía llamarse a Supabase sin token: " + url);
    },
    async () => {
      const request = new Request("https://worker.test/api/auth/me", {
        method: "GET",
        headers: { Origin: "http://localhost:5173" },
      });
      const response = await worker.fetch(request, ENV);
      assert.equal(response.status, 401);
      return response.json();
    }
  );
  assert.equal(body.error, "MISSING_BEARER_TOKEN");
});

test("GET /api/auth/me: Supabase rechaza el token (401) se traslada como sesión inválida", async () => {
  const body = await withFetch(
    async () => new Response(JSON.stringify({ error: "invalid_token" }), { status: 401, headers: { "Content-Type": "application/json" } }),
    async () => {
      const request = new Request("https://worker.test/api/auth/me", {
        method: "GET",
        headers: { Authorization: "Bearer no-valido", Origin: "http://localhost:5173" },
      });
      const response = await worker.fetch(request, ENV);
      assert.equal(response.status, 401);
      return response.json();
    }
  );
  assert.equal(body.ok, false);
});
