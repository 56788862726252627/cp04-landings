import test from "node:test";
import assert from "node:assert/strict";

import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  buildAccessCookie,
  buildRefreshCookie,
  buildExpiredAccessCookie,
  buildExpiredRefreshCookie,
  parseCookies,
  readCookie,
  isOriginAllowed,
  resolveSessionToken,
  resolveRefreshToken,
} from "./session-cookie.js";

const ALLOWED_ENV = { ALLOWED_ORIGIN: "https://club-padel-04.pages.dev,http://localhost:5173" };

function fakeRequest({ method = "GET", headers = {}, url = "https://worker.test/api/reservas" } = {}) {
  return new Request(url, { method, headers });
}

// --- Contrato de cookie (Fase 2 del encargo) ---

test("buildAccessCookie: HttpOnly + Secure + SameSite=None + Path=/api", () => {
  const cookie = buildAccessCookie("token-falso-no-real", { maxAgeSeconds: 3600 });
  assert.match(cookie, /^cp04_at=token-falso-no-real/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=None/);
  assert.match(cookie, /Path=\/api(?!\/)/); // /api exacto, no /api/auth
  assert.match(cookie, /Max-Age=3600/);
});

test("buildRefreshCookie: Path=/api/auth (más estrecho que el de access), HttpOnly + Secure + SameSite=None", () => {
  const cookie = buildRefreshCookie("refresh-falso-no-real");
  assert.match(cookie, /^cp04_rt=refresh-falso-no-real/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=None/);
  assert.match(cookie, /Path=\/api\/auth/);
  assert.match(cookie, new RegExp(`Max-Age=${REFRESH_COOKIE_MAX_AGE_SECONDS}`));
});

test("buildAccessCookie: expires_in no numérico cae al default, no rompe la cookie", () => {
  const cookie = buildAccessCookie("t", { maxAgeSeconds: undefined });
  assert.match(cookie, /Max-Age=3600/);
});

test("buildExpiredAccessCookie/buildExpiredRefreshCookie: Max-Age=0 con el MISMO Path que la cookie viva (si no, el navegador no la sobreescribe)", () => {
  const liveAccess = buildAccessCookie("t", { maxAgeSeconds: 100 });
  const expiredAccess = buildExpiredAccessCookie();
  assert.equal(liveAccess.match(/Path=([^;]+)/)[1], expiredAccess.match(/Path=([^;]+)/)[1]);

  const liveRefresh = buildRefreshCookie("r");
  const expiredRefresh = buildExpiredRefreshCookie();
  assert.equal(liveRefresh.match(/Path=([^;]+)/)[1], expiredRefresh.match(/Path=([^;]+)/)[1]);

  assert.match(expiredAccess, /Max-Age=0/);
  assert.match(expiredRefresh, /Max-Age=0/);
});

test("buildAccessCookie: sin atributo Domain (cookie host-only, sin dominio de producción hardcodeado)", () => {
  const cookie = buildAccessCookie("t", { maxAgeSeconds: 10 });
  assert.doesNotMatch(cookie, /Domain=/i);
});

// --- parseCookies / readCookie ---

test("parseCookies: parsea varias cookies separadas por '; '", () => {
  const request = fakeRequest({ headers: { Cookie: `${ACCESS_COOKIE_NAME}=abc; ${REFRESH_COOKIE_NAME}=def` } });
  const parsed = parseCookies(request);
  assert.equal(parsed[ACCESS_COOKIE_NAME], "abc");
  assert.equal(parsed[REFRESH_COOKIE_NAME], "def");
});

test("readCookie: sin cabecera Cookie devuelve null, no lanza", () => {
  assert.equal(readCookie(fakeRequest({ headers: {} }), ACCESS_COOKIE_NAME), null);
});

// --- isOriginAllowed (mismo allowlist que corsHeaders) ---

test("isOriginAllowed: origen en ALLOWED_ORIGIN -> true", () => {
  const request = fakeRequest({ headers: { Origin: "https://club-padel-04.pages.dev" } });
  assert.equal(isOriginAllowed(request, ALLOWED_ENV), true);
});

test("isOriginAllowed: origen fuera de ALLOWED_ORIGIN -> false", () => {
  const request = fakeRequest({ headers: { Origin: "https://atacante.example" } });
  assert.equal(isOriginAllowed(request, ALLOWED_ENV), false);
});

test("isOriginAllowed: sin cabecera Origin -> false (nunca se asume confianza por ausencia)", () => {
  const request = fakeRequest({ headers: {} });
  assert.equal(isOriginAllowed(request, ALLOWED_ENV), false);
});

// --- resolveSessionToken (dual-source + gate CSRF) ---

function withHeaderParser() {
  return {
    parseAuthorizationHeader(request) {
      const raw = request.headers.get("Authorization") || "";
      const match = raw.match(/^Bearer\s+(.+)$/i);
      return match ? match[1].trim() : null;
    },
  };
}

test("resolveSessionToken: prioriza Authorization Bearer sobre la cookie si ambos están presentes", () => {
  const request = fakeRequest({
    headers: { Authorization: "Bearer token-header", Cookie: `${ACCESS_COOKIE_NAME}=token-cookie` },
  });
  const resolved = resolveSessionToken(request, ALLOWED_ENV, withHeaderParser());
  assert.equal(resolved.token, "token-header");
  assert.equal(resolved.source, "header");
  assert.equal(resolved.csrfRejected, false);
});

test("resolveSessionToken: GET solo con cookie, sin Origin -> se acepta (método seguro, sin gate CSRF)", () => {
  const request = fakeRequest({ method: "GET", headers: { Cookie: `${ACCESS_COOKIE_NAME}=token-cookie` } });
  const resolved = resolveSessionToken(request, ALLOWED_ENV, withHeaderParser());
  assert.equal(resolved.token, "token-cookie");
  assert.equal(resolved.source, "cookie");
  assert.equal(resolved.csrfRejected, false);
});

test("resolveSessionToken: POST solo con cookie y Origin permitido -> se acepta", () => {
  const request = fakeRequest({
    method: "POST",
    headers: { Cookie: `${ACCESS_COOKIE_NAME}=token-cookie`, Origin: "https://club-padel-04.pages.dev" },
  });
  const resolved = resolveSessionToken(request, ALLOWED_ENV, withHeaderParser());
  assert.equal(resolved.token, "token-cookie");
  assert.equal(resolved.csrfRejected, false);
});

test("resolveSessionToken: POST solo con cookie y Origin NO permitido -> csrfRejected, sin token", () => {
  const request = fakeRequest({
    method: "POST",
    headers: { Cookie: `${ACCESS_COOKIE_NAME}=token-cookie`, Origin: "https://atacante.example" },
  });
  const resolved = resolveSessionToken(request, ALLOWED_ENV, withHeaderParser());
  assert.equal(resolved.token, null);
  assert.equal(resolved.csrfRejected, true);
});

test("resolveSessionToken: POST solo con cookie y SIN Origin -> csrfRejected (ausencia de Origin no es confianza)", () => {
  const request = fakeRequest({ method: "POST", headers: { Cookie: `${ACCESS_COOKIE_NAME}=token-cookie` } });
  const resolved = resolveSessionToken(request, ALLOWED_ENV, withHeaderParser());
  assert.equal(resolved.csrfRejected, true);
});

test("resolveSessionToken: sin header ni cookie -> null, sin CSRF (no hay nada que rechazar)", () => {
  const request = fakeRequest({ method: "POST", headers: { Origin: "https://atacante.example" } });
  const resolved = resolveSessionToken(request, ALLOWED_ENV, withHeaderParser());
  assert.equal(resolved.token, null);
  assert.equal(resolved.source, null);
  assert.equal(resolved.csrfRejected, false);
});

// --- resolveRefreshToken (dual-source + gate CSRF, siempre POST) ---

test("resolveRefreshToken: prioriza el body sobre la cookie (compatibilidad legacy explícita)", () => {
  const request = fakeRequest({ method: "POST", headers: { Cookie: `${REFRESH_COOKIE_NAME}=token-cookie` } });
  const resolved = resolveRefreshToken(request, ALLOWED_ENV, "token-body");
  assert.equal(resolved.token, "token-body");
  assert.equal(resolved.source, "body");
});

test("resolveRefreshToken: sin body, cookie + Origin permitido -> se acepta desde cookie", () => {
  const request = fakeRequest({
    method: "POST",
    headers: { Cookie: `${REFRESH_COOKIE_NAME}=token-cookie`, Origin: "http://localhost:5173" },
  });
  const resolved = resolveRefreshToken(request, ALLOWED_ENV, null);
  assert.equal(resolved.token, "token-cookie");
  assert.equal(resolved.source, "cookie");
});

test("resolveRefreshToken: sin body, cookie + Origin no permitido -> csrfRejected", () => {
  const request = fakeRequest({
    method: "POST",
    headers: { Cookie: `${REFRESH_COOKIE_NAME}=token-cookie`, Origin: "https://atacante.example" },
  });
  const resolved = resolveRefreshToken(request, ALLOWED_ENV, null);
  assert.equal(resolved.token, null);
  assert.equal(resolved.csrfRejected, true);
});
