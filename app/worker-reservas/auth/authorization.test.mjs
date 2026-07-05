import test from "node:test";
import assert from "node:assert/strict";

import {
  CP04_AUTH_ROLES,
  parseAuthorizationHeader,
  resolveRole,
  authorizeRole,
  authorizeScope,
  decodeJwtPayload,
  verifySupabaseIdentity,
  authenticateRequest,
  requireAuth,
  requireRoles,
} from "./authorization.js";

import worker from "../src/index.js";

const SUPABASE_ENV = {
  SUPABASE_URL: "https://example-project.supabase.co",
  SUPABASE_ANON_KEY: "anon-key-not-real",
};

function fakeRequest({ method = "GET", headers = {}, url = "https://worker.test/api/reservas" } = {}) {
  return new Request(url, { method, headers });
}

function verifierFor(result) {
  return async () => result;
}

// --- 2. Esquema de Authorization inválido / ausente ---

test("parseAuthorizationHeader: sin cabecera Authorization devuelve null", () => {
  assert.equal(parseAuthorizationHeader(fakeRequest({ headers: {} })), null);
});

test("parseAuthorizationHeader: esquema distinto de Bearer (p.ej. Basic) se rechaza", () => {
  assert.equal(
    parseAuthorizationHeader(fakeRequest({ headers: { Authorization: "Basic dXNlcjpwYXNz" } })),
    null
  );
});

test("parseAuthorizationHeader: Bearer bien formado se extrae", () => {
  assert.equal(
    parseAuthorizationHeader(fakeRequest({ headers: { Authorization: "Bearer abc.def.ghi" } })),
    "abc.def.ghi"
  );
});

// --- 4. Rol desconocido ---

test("resolveRole: rol desconocido, vacío o ausente nunca resuelve a un rol válido", () => {
  assert.equal(resolveRole("SUPERADMIN"), null);
  assert.equal(resolveRole(""), null);
  assert.equal(resolveRole(undefined), null);
  assert.equal(resolveRole("player"), "PLAYER"); // normaliza mayúsculas, pero solo si es un rol real
});

test("authorizeRole: rol desconocido nunca autoriza, ni con listas de permitidos amplias", () => {
  assert.equal(authorizeRole("SUPERADMIN", CP04_AUTH_ROLES), false);
  assert.equal(authorizeRole("PLAYER", []), false);
});

test("verifySupabaseIdentity: solo confía en app_metadata.role, nunca en user_metadata.role (rol desconocido = sin rol)", async () => {
  const fakeFetch = async () =>
    new Response(
      JSON.stringify({
        id: "u1",
        email: "user@demo.local",
        user_metadata: { role: "ADMIN" }, // editable por el propio usuario: no es de confianza
        app_metadata: {}, // nunca asignado por un service_role en este caso
      }),
      { status: 200 }
    );

  const result = await verifySupabaseIdentity("token-real", SUPABASE_ENV, fakeFetch);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "ROLE_NOT_ASSIGNED");
});

test("verifySupabaseIdentity: sin SUPABASE_URL/ANON_KEY falla cerrado y nunca finge identidad demo", async () => {
  const result = await verifySupabaseIdentity("cualquier-token", {});
  assert.equal(result.ok, false);
  assert.equal(result.reason, "PROVIDER_NOT_CONFIGURED");
});

// --- 1. Sin Authorization ---

test("requireAuth: sin Authorization deniega 401 MISSING_TOKEN", async () => {
  const gate = await requireAuth(fakeRequest({ headers: {} }), SUPABASE_ENV);
  assert.equal(gate.ok, false);
  assert.equal(gate.status, 401);
  assert.equal(gate.body.error, "MISSING_TOKEN");
});

// --- 2. Esquema inválido (vía requireAuth) ---

test("requireAuth: esquema Authorization inválido deniega 401 igual que ausencia total", async () => {
  const gate = await requireAuth(
    fakeRequest({ headers: { Authorization: "Token abc" } }),
    SUPABASE_ENV
  );
  assert.equal(gate.ok, false);
  assert.equal(gate.status, 401);
  assert.equal(gate.body.error, "MISSING_TOKEN");
});

// --- 3. Token inválido ---

test("requireAuth: token inválido (el verificador lo rechaza) deniega 401 INVALID_TOKEN", async () => {
  const gate = await requireAuth(
    fakeRequest({ headers: { Authorization: "Bearer token-malo" } }),
    SUPABASE_ENV,
    { verify: verifierFor({ ok: false, reason: "INVALID_TOKEN" }) }
  );
  assert.equal(gate.ok, false);
  assert.equal(gate.status, 401);
  assert.equal(gate.body.error, "INVALID_TOKEN");
});

// --- 5. PLAYER -> ruta STAFF ---

test("requireRoles: PLAYER intentando una ruta STAFF/ADMIN/SUPPORT es denegado (403)", async () => {
  const gate = await requireRoles(
    fakeRequest({ headers: { Authorization: "Bearer token-player" } }),
    SUPABASE_ENV,
    ["STAFF", "ADMIN", "SUPPORT"],
    { verify: verifierFor({ ok: true, userId: "1", email: "jugador@demo.local", role: "PLAYER" }) }
  );
  assert.equal(gate.ok, false);
  assert.equal(gate.status, 403);
  assert.equal(gate.body.error, "INSUFFICIENT_ROLE");
});

// --- 6. STAFF -> ruta ADMIN ---

test("requireRoles: STAFF intentando una ruta exclusiva de ADMIN es denegado (403)", async () => {
  const gate = await requireRoles(
    fakeRequest({ headers: { Authorization: "Bearer token-staff" } }),
    SUPABASE_ENV,
    ["ADMIN"],
    { verify: verifierFor({ ok: true, userId: "2", email: "staff@demo.local", role: "STAFF" }) }
  );
  assert.equal(gate.ok, false);
  assert.equal(gate.status, 403);
});

// --- 7. ADMIN -> ruta exclusiva de SUPPORT ---

test("requireRoles: ADMIN intentando una ruta exclusiva de SUPPORT es denegado si no corresponde", async () => {
  const gate = await requireRoles(
    fakeRequest({ headers: { Authorization: "Bearer token-admin" } }),
    SUPABASE_ENV,
    ["SUPPORT"],
    { verify: verifierFor({ ok: true, user: { id: "3", email: "admin@demo.local" }, role: "ADMIN" }) }
  );
  assert.equal(gate.ok, false);
  assert.equal(gate.status, 403);
});

// --- 8. Acceso autorizado correcto ---

test("requireRoles: STAFF accediendo a una ruta STAFF/ADMIN/SUPPORT es autorizado", async () => {
  const gate = await requireRoles(
    fakeRequest({ headers: { Authorization: "Bearer token-staff-ok" } }),
    SUPABASE_ENV,
    ["STAFF", "ADMIN", "SUPPORT"],
    { verify: verifierFor({ ok: true, user: { id: "4", email: "staff@demo.local" }, role: "STAFF" }) }
  );
  assert.equal(gate.ok, true);
  assert.equal(gate.auth.role, "STAFF");
});

// --- Contrato extendido: userId/email/role/clubId/organizationId/sessionId/tokenExpiresAt ---

function makeJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sin-firma`;
}

test("decodeJwtPayload: extrae claims de un JWT bien formado sin verificar firma", () => {
  const token = makeJwt({ sub: "user-1", exp: 1999999999, session_id: "sess-abc" });
  const claims = decodeJwtPayload(token);
  assert.equal(claims.sub, "user-1");
  assert.equal(claims.exp, 1999999999);
  assert.equal(claims.session_id, "sess-abc");
});

test("decodeJwtPayload: token corrupto o no-JWT devuelve null en vez de lanzar", () => {
  assert.equal(decodeJwtPayload("no-es-un-jwt"), null);
  assert.equal(decodeJwtPayload(""), null);
  assert.equal(decodeJwtPayload(undefined), null);
});

test("authenticateRequest: expone el contrato completo (userId, email, role, clubId, organizationId, sessionId, tokenExpiresAt)", async () => {
  const result = await authenticateRequest(
    fakeRequest({ headers: { Authorization: "Bearer token-completo" } }),
    SUPABASE_ENV,
    {
      verify: verifierFor({
        ok: true,
        userId: "u-9",
        email: "admin@demo.local",
        role: "ADMIN",
        clubId: "club-1",
        organizationId: "org-1",
        sessionId: "sess-9",
        tokenExpiresAt: 1999999999,
      }),
    }
  );

  assert.equal(result.authenticated, true);
  assert.equal(result.userId, "u-9");
  assert.equal(result.email, "admin@demo.local");
  assert.equal(result.role, "ADMIN");
  assert.equal(result.clubId, "club-1");
  assert.equal(result.organizationId, "org-1");
  assert.equal(result.sessionId, "sess-9");
  assert.equal(result.tokenExpiresAt, 1999999999);
});

test("authorizeScope: SUPPORT conserva acceso técnico transversal", () => {
  assert.equal(authorizeScope({ role: "SUPPORT", clubId: null }, { clubId: "club-1" }), true);
});

test("authorizeScope: STAFF sin club_id asignado NO accede a un recurso con club_id (fail-closed, no fail-open)", () => {
  assert.equal(authorizeScope({ role: "STAFF", clubId: null }, { clubId: "club-1" }), false);
});

test("authorizeScope: STAFF de un club no accede a recursos de otro club", () => {
  assert.equal(authorizeScope({ role: "STAFF", clubId: "club-1" }, { clubId: "club-2" }), false);
});

test("authorizeScope: STAFF de un club SÍ accede a recursos de su propio club", () => {
  assert.equal(authorizeScope({ role: "STAFF", clubId: "club-1" }, { clubId: "club-1" }), true);
});

// --- 9. Ruta pública correcta (integración con el Worker real) ---

test("Integración: GET /api/disponibilidad sigue siendo pública, no exige Authorization", async () => {
  const env = { ALLOWED_ORIGIN: "http://localhost:5173" };
  const request = new Request(
    "https://worker.test/api/disponibilidad?fecha=2026-07-06",
    { method: "GET", headers: { Origin: "http://localhost:5173" } }
  );

  const response = await worker.fetch(request, env);
  const body = await response.json();

  assert.notEqual(response.status, 401);
  assert.notEqual(response.status, 403);
  assert.notEqual(body.error, "MISSING_TOKEN");
});

// --- 10. Preflight OPTIONS/CORS sin romperse ---

test("Integración: preflight OPTIONS a /api/reservas responde 204 con CORS y sin exigir auth", async () => {
  const env = { ALLOWED_ORIGIN: "http://localhost:5173" };
  const request = new Request("https://worker.test/api/reservas", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });

  const response = await worker.fetch(request, env);

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "http://localhost:5173");
  assert.equal(response.headers.get("Access-Control-Allow-Headers"), "Content-Type, Authorization");
});

// --- Extra: confirma que el nuevo gate del listado por email queda activo ---

test("Integración: GET /api/reservas (listado por email) sin Authorization se deniega en 401", async () => {
  const env = { ALLOWED_ORIGIN: "http://localhost:5173" };
  const request = new Request(
    "https://worker.test/api/reservas?email=jugador@demo.local",
    { method: "GET", headers: { Origin: "http://localhost:5173" } }
  );

  const response = await worker.fetch(request, env);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error, "MISSING_TOKEN");
});

// --- Nuevos endpoints de esta fase: fail-closed sin Supabase configurado ---

test("Integración: POST /api/auth/refresh sin Supabase configurado falla cerrado (no finge sesión)", async () => {
  const env = { ALLOWED_ORIGIN: "http://localhost:5173" };
  const request = new Request("https://worker.test/api/auth/refresh", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: "cualquier-cosa" }),
  });

  const response = await worker.fetch(request, env);
  const body = await response.json();

  assert.equal(body.ok, false);
  assert.equal(body.auth_ready, false);
  assert.equal(body.error, "AUTH_BACKEND_NOT_CONFIGURED");
});

test("Integración: POST /api/auth/logout con scope=global no revienta sin token (sesión local ya está cerrada)", async () => {
  const env = { ALLOWED_ORIGIN: "http://localhost:5173" };
  const request = new Request("https://worker.test/api/auth/logout", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: JSON.stringify({ scope: "global" }),
  });

  const response = await worker.fetch(request, env);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
});
