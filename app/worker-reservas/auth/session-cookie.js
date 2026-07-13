// Club Pádel 04 · Session Cookie Helper
//
// Cierra la dependencia de backend documentada en `AUTH_CONTRACT_CP04.md`
// ("Usar cookies HttpOnly/Secure/SameSite") y en
// `audit/tenant-storage-isolation/LOTE_A_AUTH_SESSION_ISOLATION_PREPARATION.md`
// (Lote A7, "0% implementado en Worker"). No es un segundo sistema de auth:
// es el transporte del MISMO token que hoy ya viaja en el body JSON de
// `/api/auth/login|refresh|me|logout`, verificado por el MISMO
// `verifySupabaseIdentity`/`authenticateRequest` de `authorization.js`.
//
// Decisiones de contrato (documentadas, no asumidas):
// - SameSite=None + Secure: el frontend (Pages, p.ej. club-padel-04.pages.dev)
//   y este Worker (workers.dev o dominio propio del Worker) son dos orígenes
//   registrables distintos -> la relación es cross-site. SameSite=Strict/Lax
//   NO se enviaría en el fetch del frontend al Worker. Secure es obligatorio
//   junto con SameSite=None (lo exige el propio estándar de cookies).
// - Sin atributo Domain: cookie "host-only", limitada exactamente al host
//   del Worker que la emite. No se hardcodea ningún dominio de producción;
//   si el Worker se sirve desde otro host (preview, staging), la cookie se
//   ata a ESE host automáticamente.
// - Sin protección CSRF por SameSite (None no la da). Mitigación: mismo
//   allowlist ya usado para CORS (`ALLOWED_ORIGIN`), aplicado también como
//   gate de origen en peticiones mutantes autenticadas por cookie
//   (ver `resolveSessionToken`). Esto es una mitigación por Origin-check,
//   no un token CSRF de doble envío — se documenta como tal, no se afirma
//   una protección que no existe.

export const ACCESS_COOKIE_NAME = "cp04_at";
export const REFRESH_COOKIE_NAME = "cp04_rt";

// Path=/api para el access token (lo necesita cualquier ruta de negocio
// protegida por requireAuth/requireRoles). Path=/api/auth para el refresh
// token: reduce su superficie de exposición a solo los endpoints de auth
// que realmente lo consumen (login/refresh/logout), en vez de viajar en
// CADA petición a /api/* como haría con Path=/api.
const ACCESS_COOKIE_PATH = "/api";
const REFRESH_COOKIE_PATH = "/api/auth";

// Fallback cuando Supabase no informa expires_in (no debería ocurrir en un
// login/refresh exitoso real, pero un valor no numérico no debe tumbar la
// respuesta). 3600s = 1h, mismo orden de magnitud que el default de
// Supabase GoTrue documentado públicamente.
const DEFAULT_ACCESS_MAX_AGE_SECONDS = 3600;

// Vida de la COOKIE de refresh en el navegador (no la vida del token en
// Supabase, que la decide el proveedor). Es una política de producto
// pendiente de confirmación explícita — se documenta así en el informe,
// no se presenta como un hecho de seguridad verificado.
export const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días

function serializeCookie(name, value, { maxAgeSeconds, path }) {
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    `Max-Age=${maxAgeSeconds}`,
    "HttpOnly",
    "Secure",
    "SameSite=None",
  ];
  return attrs.join("; ");
}

export function buildAccessCookie(value, { maxAgeSeconds } = {}) {
  const ttl = Number.isFinite(maxAgeSeconds) && maxAgeSeconds > 0 ? maxAgeSeconds : DEFAULT_ACCESS_MAX_AGE_SECONDS;
  return serializeCookie(ACCESS_COOKIE_NAME, value, { maxAgeSeconds: ttl, path: ACCESS_COOKIE_PATH });
}

export function buildRefreshCookie(value, { maxAgeSeconds } = {}) {
  const ttl = Number.isFinite(maxAgeSeconds) && maxAgeSeconds > 0 ? maxAgeSeconds : REFRESH_COOKIE_MAX_AGE_SECONDS;
  return serializeCookie(REFRESH_COOKIE_NAME, value, { maxAgeSeconds: ttl, path: REFRESH_COOKIE_PATH });
}

// Max-Age=0 con el MISMO Path que la cookie original: un navegador solo
// sobreescribe/borra una cookie si Name+Path (+Domain) coinciden exactamente
// con los de la cookie ya guardada.
export function buildExpiredAccessCookie() {
  return serializeCookie(ACCESS_COOKIE_NAME, "", { maxAgeSeconds: 0, path: ACCESS_COOKIE_PATH });
}

export function buildExpiredRefreshCookie() {
  return serializeCookie(REFRESH_COOKIE_NAME, "", { maxAgeSeconds: 0, path: REFRESH_COOKIE_PATH });
}

export function parseCookies(request) {
  const raw = request?.headers?.get?.("Cookie") || "";
  const out = {};
  for (const part of raw.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (!key) continue;
    const value = part.slice(idx + 1).trim();
    try {
      out[key] = decodeURIComponent(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
}

export function readCookie(request, name) {
  return parseCookies(request)[name] ?? null;
}

// Mismo allowlist que ya usa corsHeaders() en index.js — se centraliza aquí
// para que el gate CSRF de abajo y el CORS de index.js compartan una única
// fuente de verdad (ALLOWED_ORIGIN), sin duplicar el parseo de la lista.
export function isOriginAllowed(request, env) {
  const origin = request?.headers?.get?.("Origin") || "";
  if (!origin) return false;
  const allowedOrigins = String(env?.ALLOWED_ORIGIN || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return allowedOrigins.includes(origin);
}

function isMutatingMethod(request) {
  const method = String(request?.method || "GET").toUpperCase();
  return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
}

// Resuelve el access token a partir de, en este orden:
//   1. Cabecera Authorization: Bearer (compatibilidad con el frontend/tests
//      actuales, y con cualquier llamada servidor-a-servidor).
//   2. Cookie HttpOnly `cp04_at` (ciclo de sesión seguro, Lote A7).
// Si el origen viene SOLO de cookie y el método es mutante (POST/PUT/DELETE/
// PATCH), exige que el Origin esté en el allowlist de ALLOWED_ORIGIN — misma
// mitigación que corsHeaders(), pero aplicada como requisito de auth, no solo
// de CORS (un atacante cross-site no tiene forma de fijar el Origin real).
export function resolveSessionToken(request, env, { parseAuthorizationHeader }) {
  const headerToken = parseAuthorizationHeader(request);
  if (headerToken) {
    return { token: headerToken, source: "header", csrfRejected: false };
  }

  const cookieToken = readCookie(request, ACCESS_COOKIE_NAME);
  if (!cookieToken) {
    return { token: null, source: null, csrfRejected: false };
  }

  if (isMutatingMethod(request) && !isOriginAllowed(request, env)) {
    return { token: null, source: "cookie", csrfRejected: true };
  }

  return { token: cookieToken, source: "cookie", csrfRejected: false };
}

// Mismo criterio que resolveSessionToken pero para el refresh token: el
// body JSON sigue siendo válido (compatibilidad legacy explícita, ver
// informe de migración), con fallback a la cookie `cp04_rt`. /api/auth/refresh
// es siempre POST, así que el gate de Origin se evalúa siempre que la fuente
// sea la cookie.
export function resolveRefreshToken(request, env, bodyRefreshToken) {
  if (bodyRefreshToken) {
    return { token: bodyRefreshToken, source: "body", csrfRejected: false };
  }

  const cookieToken = readCookie(request, REFRESH_COOKIE_NAME);
  if (!cookieToken) {
    return { token: null, source: null, csrfRejected: false };
  }

  if (!isOriginAllowed(request, env)) {
    return { token: null, source: "cookie", csrfRejected: true };
  }

  return { token: cookieToken, source: "cookie", csrfRejected: false };
}
