import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "../auth/session-cookie.js";

// Lote A7 — ciclo de sesión seguro (LOGIN -> SESSION -> REFRESH ->
// VALIDATION -> LOGOUT) con cookies HttpOnly. Cubre la matriz de 24 casos
// de la Fase 9 del encargo. Mismo patrón que auth-role-mapping.test.mjs:
// env con credenciales FALSAS (nunca reales) + stub de globalThis.fetch
// interceptando las llamadas salientes a Supabase.

const ALLOWED_ORIGIN = "https://club-padel-04.pages.dev";
const ATTACKER_ORIGIN = "https://atacante.example";

const ENV = {
  SUPABASE_URL: "https://example-project.supabase.co",
  SUPABASE_ANON_KEY: "anon-key-not-real",
  ALLOWED_ORIGIN: `${ALLOWED_ORIGIN},http://localhost:5173`,
};

const STUB_ENV = { ALLOWED_ORIGIN: ENV.ALLOWED_ORIGIN }; // sin Supabase -> backend_stub / demo

function withFetch(stub, fn) {
  const original = globalThis.fetch;
  globalThis.fetch = stub;
  return fn().finally(() => {
    globalThis.fetch = original;
  });
}

function supabaseUser({ role = "PLAYER", email = "cuenta@clubpadel04.test", id = "user-1" } = {}) {
  return { id, email, app_metadata: { role }, user_metadata: {} };
}

function stubFor({ loginUser, meUser, refreshOk = true, meOk = true, loginOk = true } = {}) {
  return async (url, options = {}) => {
    const u = String(url);
    if (u.includes("/auth/v1/token?grant_type=password")) {
      if (!loginOk) {
        return new Response(JSON.stringify({ error: "invalid_grant", error_description: "Invalid login credentials" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({
          access_token: `at-${loginUser?.id || "1"}`,
          refresh_token: `rt-${loginUser?.id || "1"}`,
          expires_in: 3600,
          token_type: "bearer",
          user: loginUser,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    if (u.includes("/auth/v1/token?grant_type=refresh_token")) {
      if (!refreshOk) {
        return new Response(JSON.stringify({ error: "invalid_grant", error_description: "Refresh Token Not Found" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const body = options.body ? JSON.parse(options.body) : {};
      return new Response(
        JSON.stringify({
          access_token: `at-rotated-${body.refresh_token}`,
          refresh_token: `rt-rotated-${body.refresh_token}`,
          expires_in: 3600,
          token_type: "bearer",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    if (u.includes("/auth/v1/user") && (!options.method || options.method === "GET")) {
      if (!meOk) {
        return new Response(JSON.stringify({ error: "invalid_token", error_description: "Token expired" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(meUser), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (u.includes("/auth/v1/logout")) {
      return new Response(null, { status: 204 });
    }
    throw new Error("fetch inesperado en stub: " + u);
  };
}

function cookieAttr(setCookie, name) {
  const match = setCookie.match(new RegExp(`${name}=([^;]*)`));
  return match ? match[1] : null;
}

async function doLogin({ user, origin = ALLOWED_ORIGIN, loginOk = true } = {}) {
  return withFetch(stubFor({ loginUser: user, loginOk }), async () => {
    const request = new Request("https://worker.test/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({ email: user?.email || "x@x.test", password: "irrelevante-en-el-stub" }),
    });
    const response = await worker.fetch(request, ENV);
    const body = await response.json();
    return { response, body };
  });
}

// --- 1-2. Login ---

test("1. login válido: 200, ok:true, token/cookies emitidos", async () => {
  const { response, body } = await doLogin({ user: supabaseUser({ role: "PLAYER" }) });
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.role, "PLAYER");
});

test("2. login inválido: credenciales rechazadas por Supabase, sin cookies, error propagado", async () => {
  const { response, body } = await doLogin({ user: supabaseUser(), loginOk: false });
  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.equal(response.headers.getSetCookie().length, 0);
});

// --- 3-7. Contrato de cookie desde una respuesta real del Worker ---

test("3. cookie creada: login emite Set-Cookie para cp04_at y cp04_rt", async () => {
  const { response } = await doLogin({ user: supabaseUser({ id: "u3" }) });
  const cookies = response.headers.getSetCookie();
  assert.equal(cookies.length, 2);
  assert.ok(cookies.some((c) => c.startsWith(`${ACCESS_COOKIE_NAME}=`)));
  assert.ok(cookies.some((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`)));
});

test("4. HttpOnly: ambas cookies de sesión son HttpOnly", async () => {
  const { response } = await doLogin({ user: supabaseUser({ id: "u4" }) });
  for (const cookie of response.headers.getSetCookie()) {
    assert.match(cookie, /HttpOnly/);
  }
});

test("5. Secure: ambas cookies llevan Secure (siempre, no solo detrás de un flag de 'producción' que este Worker no puede verificar de forma fiable — ver informe)", async () => {
  const { response } = await doLogin({ user: supabaseUser({ id: "u5" }) });
  for (const cookie of response.headers.getSetCookie()) {
    assert.match(cookie, /Secure/);
  }
});

test("6. SameSite=None: frontend (Pages) y Worker son orígenes cross-site, Strict/Lax no se enviarían", async () => {
  const { response } = await doLogin({ user: supabaseUser({ id: "u6" }) });
  for (const cookie of response.headers.getSetCookie()) {
    assert.match(cookie, /SameSite=None/);
  }
});

test("7. Path: cp04_at -> /api (todas las rutas), cp04_rt -> /api/auth (solo auth)", async () => {
  const { response } = await doLogin({ user: supabaseUser({ id: "u7" }) });
  const cookies = response.headers.getSetCookie();
  const at = cookies.find((c) => c.startsWith(`${ACCESS_COOKIE_NAME}=`));
  const rt = cookies.find((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`));
  assert.match(at, /Path=\/api(?!\/)/);
  assert.match(rt, /Path=\/api\/auth/);
});

// --- 8-11. Session check (/api/auth/me) ---

async function meWithCookie(cookieHeader, { meOk = true, meUser = supabaseUser() } = {}) {
  return withFetch(stubFor({ meOk, meUser }), async () => meWithCookieNoStub(cookieHeader));
}

// Variante sin instalar su propio stub de fetch — para pruebas (p.ej. #16,
// replay) que necesitan contar invocaciones con UN único stub compartido
// entre varias llamadas a /api/auth/me.
function meWithCookieNoStub(cookieHeader) {
  const request = new Request("https://worker.test/api/auth/me", {
    method: "GET",
    headers: cookieHeader ? { Cookie: cookieHeader, Origin: ALLOWED_ORIGIN } : { Origin: ALLOWED_ORIGIN },
  });
  return worker.fetch(request, ENV);
}

test("8. sesión válida: GET /api/auth/me con cookie cp04_at válida -> 200 con el usuario", async () => {
  const response = await meWithCookie(`${ACCESS_COOKIE_NAME}=un-token-cualquiera`, { meUser: supabaseUser({ role: "ADMIN" }) });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.role, "ADMIN");
});

test("9. sesión ausente: GET /api/auth/me sin cookie ni Authorization -> 401", async () => {
  const response = await meWithCookie(null);
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.error, "MISSING_BEARER_TOKEN");
});

test("10. sesión inválida: cookie presente pero Supabase la rechaza -> error propagado, no 200 silencioso", async () => {
  const response = await meWithCookie(`${ACCESS_COOKIE_NAME}=token-basura`, { meOk: false });
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.ok, false);
});

test("11. sesión expirada: mismo camino que sesión inválida (Supabase decide expiración, el Worker jamás la infiere localmente) -> rechazada", async () => {
  const response = await meWithCookie(`${ACCESS_COOKIE_NAME}=token-expirado`, { meOk: false });
  assert.equal(response.status, 401);
});

// --- 12-14. Refresh ---

async function refreshWithCookie({ cookieHeader, origin = ALLOWED_ORIGIN, refreshOk = true, body = {} } = {}) {
  return withFetch(stubFor({ refreshOk }), async () => {
    const headers = { "Content-Type": "application/json" };
    if (cookieHeader) headers.Cookie = cookieHeader;
    if (origin) headers.Origin = origin;
    const request = new Request("https://worker.test/api/auth/refresh", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    return worker.fetch(request, ENV);
  });
}

test("12. refresh válido (por cookie cp04_rt): 200, rota AMBAS cookies con nuevos valores", async () => {
  const response = await refreshWithCookie({ cookieHeader: `${REFRESH_COOKIE_NAME}=refresh-viejo` });
  assert.equal(response.status, 200);
  const cookies = response.headers.getSetCookie();
  const at = cookies.find((c) => c.startsWith(`${ACCESS_COOKIE_NAME}=`));
  const rt = cookies.find((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`));
  assert.ok(cookieAttr(at, ACCESS_COOKIE_NAME).includes("refresh-viejo"));
  assert.ok(cookieAttr(rt, REFRESH_COOKIE_NAME).includes("refresh-viejo"));
});

test("13. refresh inválido: Supabase rechaza el refresh_token -> error propagado, sin cookies nuevas", async () => {
  const response = await refreshWithCookie({ cookieHeader: `${REFRESH_COOKIE_NAME}=refresh-invalido`, refreshOk: false });
  assert.notEqual(response.status, 200);
  assert.equal(response.headers.getSetCookie().length, 0);
});

test("14. refresh expirado: mismo camino que refresh inválido (Supabase es la única fuente de expiración de refresh_token)", async () => {
  const response = await refreshWithCookie({ cookieHeader: `${REFRESH_COOKIE_NAME}=refresh-expirado`, refreshOk: false });
  assert.notEqual(response.status, 200);
});

// --- 15. Logout ---

test("15. logout invalida sesión: expira cp04_at Y cp04_rt (Max-Age=0), pase lo que pase con Supabase", async () => {
  const response = await withFetch(stubFor({}), async () => {
    const request = new Request("https://worker.test/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `${ACCESS_COOKIE_NAME}=sesion-activa`, Origin: ALLOWED_ORIGIN },
      body: JSON.stringify({}),
    });
    return worker.fetch(request, ENV);
  });
  const cookies = response.headers.getSetCookie();
  assert.equal(cookies.length, 2);
  for (const cookie of cookies) {
    assert.match(cookie, /Max-Age=0/);
  }
});

test("15b. logout sin sesión (backend_stub, sin Supabase configurado) también expira cookies (no deja sesión fantasma)", async () => {
  const request = new Request("https://worker.test/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ALLOWED_ORIGIN },
    body: "{}",
  });
  const response = await worker.fetch(request, STUB_ENV);
  const cookies = response.headers.getSetCookie();
  assert.equal(cookies.length, 2);
  for (const cookie of cookies) assert.match(cookie, /Max-Age=0/);
});

// --- 16-17. Replay / refresh reuse ---
// El Worker no implementa detección local de reuso: cada llamada a /me o
// /refresh se reenvía siempre a Supabase (nunca se cachea ni se decide
// localmente) — la protección real de "un refresh_token usado no sirve dos
// veces" vive en Supabase, fuera de este repo. Se documenta como tal (no se
// afirma una protección que no existe) y se prueba lo que SÍ es
// responsabilidad del Worker: no cachear ni saltarse la verificación.

test("16. replay: dos GET /api/auth/me consecutivos con el mismo token SIEMPRE re-verifican contra Supabase (no hay caché local que un replay pudiera explotar)", async () => {
  let calls = 0;
  const countingStub = async (url, options) => {
    calls += 1;
    return stubFor({ meUser: supabaseUser() })(url, options);
  };

  const { response1, response2 } = await withFetch(countingStub, async () => {
    const r1 = await meWithCookieNoStub(`${ACCESS_COOKIE_NAME}=mismo-token`);
    const r2 = await meWithCookieNoStub(`${ACCESS_COOKIE_NAME}=mismo-token`);
    return { response1: r1, response2: r2 };
  });

  assert.equal(response1.status, 200);
  assert.equal(response2.status, 200);
  assert.equal(calls, 2, "cada petición debe re-verificar, cero memoización local del resultado");
});

test("17. refresh reuse: NO implementado localmente (depende de Supabase) — documentado, no afirmado como protegido", (t) => {
  t.skip(
    "El Worker reenvía cada refresh_token recibido a Supabase sin ningún registro local de tokens ya usados. " +
      "Si Supabase soporta rotación con detección de reuso (configuración de proyecto, fuera de este repo), la " +
      "protección real ocurre ahí. No se simula aquí una capacidad de Supabase que este repo no controla ni puede " +
      "verificar sin credenciales reales — ver informe, Fase 4."
  );
});

// --- 18. Tenant isolation ---

test("18. tenant isolation: N/A hoy — el Worker es mono-tenant (un origen/despliegue por club, ver authorization.js). Documentado, no simulado.", (t) => {
  t.skip(
    "authorization.js (comentario junto a authorizeScope) y la auditoría previa (audit/tenant-storage-isolation/) ya " +
      "confirman que este Worker sirve un único tenant real hoy. clubId/organizationId viajan en el contrato de " +
      "authenticateRequest() y authorizeScope() ya está probado en authorization.test.mjs (STAFF de un club no accede " +
      "a recursos de otro club) — no se duplica aquí. Cuando exista un segundo tenant real servido por ESTE MISMO " +
      "Worker, este test debe activarse con dos usuarios de clubId distinto."
  );
});

// --- 19. User isolation ---

test("19. user isolation: dos logins distintos en la misma isolate producen cookies/tokens propios, sin mezclar identidad", async () => {
  const { body: bodyA } = await doLogin({ user: supabaseUser({ id: "user-A", email: "a@clubpadel04.test", role: "PLAYER" }) });
  const { body: bodyB } = await doLogin({ user: supabaseUser({ id: "user-B", email: "b@clubpadel04.test", role: "STAFF" }) });

  assert.equal(bodyA.user.email, "a@clubpadel04.test");
  assert.equal(bodyB.user.email, "b@clubpadel04.test");
  assert.notEqual(bodyA.access_token, bodyB.access_token);
  // El Worker no mantiene ningún estado en memoria entre requests que pudiera
  // hacer que el login de B contaminara la respuesta ya enviada a A.
  assert.equal(bodyA.role, "PLAYER");
  assert.equal(bodyB.role, "STAFF");
});

// --- 20. Role isolation ---

test("20. role isolation: cookie de sesión PLAYER no autoriza una ruta SUPPORT-only (/api/support/make/scenarios)", async () => {
  const response = await withFetch(stubFor({ meUser: supabaseUser({ role: "PLAYER" }) }), async () => {
    // requireRoles -> authenticateRequest -> verifySupabaseIdentity hace su
    // propia llamada a /auth/v1/user (no pasa por handleAuthRoute), mismo stub sirve para ambas.
    const request = new Request("https://worker.test/api/support/make/scenarios", {
      method: "GET",
      headers: { Cookie: `${ACCESS_COOKIE_NAME}=token-player`, Origin: ALLOWED_ORIGIN },
    });
    return worker.fetch(request, ENV);
  });
  assert.equal(response.status, 403);
});

test("20b. role isolation: cookie de sesión SUPPORT SÍ autoriza /api/support/make/scenarios (mismo mecanismo, cookie en vez de header)", async () => {
  const response = await withFetch(stubFor({ meUser: supabaseUser({ role: "SUPPORT" }) }), async () => {
    const request = new Request("https://worker.test/api/support/make/scenarios", {
      method: "GET",
      headers: { Cookie: `${ACCESS_COOKIE_NAME}=token-support`, Origin: ALLOWED_ORIGIN },
    });
    return worker.fetch(request, ENV);
  });
  // 200 (si Make no está configurado, 503) o 429 según rate limit — lo único
  // que este test verifica es que NO se queda en 401/403 (la puerta de rol pasa).
  assert.notEqual(response.status, 401);
  assert.notEqual(response.status, 403);
});

// --- 21-23. CORS / Origin / CSRF ---

test("21. CORS credentials: Access-Control-Allow-Credentials:true solo cuando el origen está permitido", async () => {
  const { response } = await doLogin({ user: supabaseUser({ id: "u21" }), origin: ALLOWED_ORIGIN });
  assert.equal(response.headers.get("Access-Control-Allow-Credentials"), "true");
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), ALLOWED_ORIGIN);
});

test("22. Origin inválido: sin CORS headers y sin Allow-Credentials para un origen fuera del allowlist", async () => {
  const { response } = await doLogin({ user: supabaseUser({ id: "u22" }), origin: ATTACKER_ORIGIN });
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
  assert.equal(response.headers.get("Access-Control-Allow-Credentials"), null);
});

test("23. CSRF: POST /api/auth/refresh solo-cookie desde origen no permitido -> 403 CSRF_ORIGIN_MISMATCH, sin llamar a Supabase", async () => {
  const response = await withFetch(
    async (url) => {
      throw new Error("no debía llamarse a Supabase: request rechazada antes por CSRF — " + url);
    },
    () => refreshWithCookie({ cookieHeader: `${REFRESH_COOKIE_NAME}=refresh-robado`, origin: ATTACKER_ORIGIN })
  );
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.equal(body.error, "CSRF_ORIGIN_MISMATCH");
});

test("23b. CSRF: Authorization Bearer explícito NUNCA está sujeto al gate de Origin (no es CSRF-vulnerable, solo se gatea la cookie)", async () => {
  const response = await withFetch(stubFor({ meUser: supabaseUser() }), async () => {
    const request = new Request("https://worker.test/api/auth/me", {
      method: "GET",
      headers: { Authorization: "Bearer token-de-header" }, // sin Origin en absoluto
    });
    return worker.fetch(request, ENV);
  });
  assert.equal(response.status, 200);
});

// --- 24. Cuentas demo ---

test("24. cuentas demo: sin Supabase configurado, /api/auth/login responde backend_stub 501 y NUNCA emite cookies", async () => {
  const request = new Request("https://worker.test/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ALLOWED_ORIGIN },
    body: JSON.stringify({ email: "demo@clubpadel04.local", password: "x" }),
  });
  const response = await worker.fetch(request, STUB_ENV);
  const body = await response.json();
  assert.equal(response.status, 501);
  assert.equal(body.mode, "backend_stub");
  assert.equal(response.headers.getSetCookie().length, 0);
});

test("24b. cuentas demo: /api/auth/me sin Supabase configurado sigue devolviendo el stub PLAYER de siempre (comportamiento sin cambios)", async () => {
  const request = new Request("https://worker.test/api/auth/me", { method: "GET", headers: { Origin: ALLOWED_ORIGIN } });
  const response = await worker.fetch(request, STUB_ENV);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.mode, "backend_stub");
  assert.equal(body.user.role, "PLAYER");
  assert.equal(response.headers.getSetCookie().length, 0);
});
