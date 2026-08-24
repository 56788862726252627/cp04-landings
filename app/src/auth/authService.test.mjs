import test from "node:test";
import assert from "node:assert/strict";

import { cp04BuildAuthEndpoints } from "./authService.js";

// Bloqueo P0 2026-08-25: las 7 rutas de AUTH_ENDPOINTS eran relativas
// hardcodeadas sin ningún mecanismo de URL base configurable — en preview/
// producción de Cloudflare Pages nunca llegaban al Worker real. Se
// construyen ahora con la misma base centralizada que ya usan
// disponibilidad/reservas (src/utils/apiEndpoint.js, ya testeado por
// separado); estos tests cubren específicamente que las 7 rutas de auth
// se resuelven igual de bien en los tres entornos.

const PREVIEW_BASE = "https://cp04-reservas-proxy.eduardorodriguezrodriguez24.workers.dev";

const RUTAS_ESPERADAS = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  logout: "/api/auth/logout",
  refresh: "/api/auth/refresh",
  me: "/api/auth/me",
  forgotPassword: "/api/auth/forgot-password",
  changePassword: "/api/auth/change-password",
};

test("cp04BuildAuthEndpoints: desarrollo (sin base) -> las 7 rutas relativas, proxy de Vite", () => {
  const endpoints = cp04BuildAuthEndpoints({});
  for (const [clave, ruta] of Object.entries(RUTAS_ESPERADAS)) {
    assert.equal(endpoints[clave], ruta, `endpoint "${clave}" no coincide en desarrollo`);
  }
});

test("cp04BuildAuthEndpoints: env undefined (mismo caso que Node sin Vite) -> igual que desarrollo", () => {
  const endpoints = cp04BuildAuthEndpoints(undefined);
  for (const [clave, ruta] of Object.entries(RUTAS_ESPERADAS)) {
    assert.equal(endpoints[clave], ruta);
  }
});

test("cp04BuildAuthEndpoints: preview/producción (base configurada) -> las 7 rutas absolutas contra el Worker", () => {
  const endpoints = cp04BuildAuthEndpoints({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: PREVIEW_BASE });
  for (const [clave, ruta] of Object.entries(RUTAS_ESPERADAS)) {
    assert.equal(endpoints[clave], `${PREVIEW_BASE}${ruta}`, `endpoint "${clave}" no coincide en preview/producción`);
  }
});

test("cp04BuildAuthEndpoints: barra final en la base -> nunca doble barra en ninguna de las 7 rutas", () => {
  const endpoints = cp04BuildAuthEndpoints({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: `${PREVIEW_BASE}/` });
  for (const [clave, ruta] of Object.entries(RUTAS_ESPERADAS)) {
    assert.equal(endpoints[clave], `${PREVIEW_BASE}${ruta}`);
    assert.doesNotMatch(endpoints[clave], /\/\/api/);
  }
});

test("cp04BuildAuthEndpoints: base ausente vs presente nunca mezcla rutas relativas y absolutas", () => {
  const dev = cp04BuildAuthEndpoints({});
  const prod = cp04BuildAuthEndpoints({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: PREVIEW_BASE });
  for (const clave of Object.keys(RUTAS_ESPERADAS)) {
    assert.ok(dev[clave].startsWith("/"));
    assert.ok(prod[clave].startsWith(PREVIEW_BASE));
  }
});

test("cp04BuildAuthEndpoints: esquema inseguro en la base -> cae a rutas relativas, nunca lo propaga", () => {
  const endpoints = cp04BuildAuthEndpoints({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: "javascript:alert(1)" });
  for (const [clave, ruta] of Object.entries(RUTAS_ESPERADAS)) {
    assert.equal(endpoints[clave], ruta);
  }
});

test("cp04BuildAuthEndpoints: login y me comparten la misma base que reservas/disponibilidad (misma fuente de verdad)", async () => {
  const { cp04ReservasEndpoint, cp04DisponibilidadEndpoint } = await import("../utils/apiEndpoint.js");
  const env = { VITE_CP04_PUBLIC_BOOKING_ENDPOINT: PREVIEW_BASE };
  const auth = cp04BuildAuthEndpoints(env);
  assert.ok(auth.login.startsWith(PREVIEW_BASE));
  assert.equal(cp04ReservasEndpoint(env).split("/api/")[0], auth.login.split("/api/")[0]);
  assert.equal(cp04DisponibilidadEndpoint(env).split("/api/")[0], auth.me.split("/api/")[0]);
});
