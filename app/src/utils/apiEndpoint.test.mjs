import test from "node:test";
import assert from "node:assert/strict";

import {
  cp04ResolveApiBaseUrl,
  cp04BuildApiUrl,
  cp04DisponibilidadEndpoint,
  cp04ReservasEndpoint,
} from "./apiEndpoint.js";

const PREVIEW_BASE = "https://cp04-reservas-proxy.eduardorodriguezrodriguez24.workers.dev";

// cp04ResolveApiBaseUrl ------------------------------------------------------

test("cp04ResolveApiBaseUrl: sin env, undefined o vacío -> '' (desarrollo local, rutas relativas)", () => {
  assert.equal(cp04ResolveApiBaseUrl(undefined), "");
  assert.equal(cp04ResolveApiBaseUrl({}), "");
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: "" }), "");
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: "   " }), "");
});

test("cp04ResolveApiBaseUrl: valor no-string se ignora (nunca revienta)", () => {
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: null }), "");
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: 123 }), "");
});

test("cp04ResolveApiBaseUrl: preview/producción con base configurada -> la devuelve recortada", () => {
  assert.equal(
    cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: PREVIEW_BASE }),
    PREVIEW_BASE,
  );
  assert.equal(
    cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: `  ${PREVIEW_BASE}  ` }),
    PREVIEW_BASE,
  );
});

test("cp04ResolveApiBaseUrl: quita una o varias barras finales, nunca las de en medio", () => {
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: `${PREVIEW_BASE}/` }), PREVIEW_BASE);
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: `${PREVIEW_BASE}///` }), PREVIEW_BASE);
});

test("cp04ResolveApiBaseUrl: acepta http y https, rechaza cualquier otro esquema (nunca lo propaga)", () => {
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: "http://localhost:8787" }), "http://localhost:8787");
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: "javascript:alert(1)" }), "");
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: "data:text/html,<script>alert(1)</script>" }), "");
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: "ftp://example.com" }), "");
});

test("cp04ResolveApiBaseUrl: rechaza un valor protocolo-relativo o sin esquema (cae a relativo, nunca lo usa tal cual)", () => {
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: "//evil.example.com" }), "");
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: "evil.example.com" }), "");
});

test("cp04ResolveApiBaseUrl: DEV:true fuerza rutas relativas aunque VITE_CP04_PUBLIC_BOOKING_ENDPOINT esté configurado", () => {
  // Bug P0 2026-08-27: .env (cargado en todos los modos) tiene la variable
  // configurada. En desarrollo el navegador haría peticiones cross-origin al
  // Worker → CORS falla → fetch() lanza → mensaje incorrecto "No se pudo
  // contactar". La guardia DEV:true garantiza que en dev siempre va al proxy
  // de Vite (rutas relativas) independientemente del valor de la variable.
  assert.equal(cp04ResolveApiBaseUrl({ DEV: true, VITE_CP04_PUBLIC_BOOKING_ENDPOINT: PREVIEW_BASE }), "");
  assert.equal(cp04ResolveApiBaseUrl({ DEV: true, VITE_CP04_PUBLIC_BOOKING_ENDPOINT: "http://localhost:8787" }), "");
  assert.equal(cp04ResolveApiBaseUrl({ DEV: true, VITE_CP04_PUBLIC_BOOKING_ENDPOINT: "" }), "");
});

test("cp04ResolveApiBaseUrl: DEV:false o DEV ausente no activa la guardia de dev — se comporta como siempre", () => {
  assert.equal(cp04ResolveApiBaseUrl({ DEV: false, VITE_CP04_PUBLIC_BOOKING_ENDPOINT: PREVIEW_BASE }), PREVIEW_BASE);
  assert.equal(cp04ResolveApiBaseUrl({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: PREVIEW_BASE }), PREVIEW_BASE);
});

// cp04BuildApiUrl -------------------------------------------------------------

test("cp04BuildApiUrl: sin base -> ruta relativa tal cual (desarrollo, proxy de Vite)", () => {
  assert.equal(cp04BuildApiUrl("/api/disponibilidad", {}), "/api/disponibilidad");
  assert.equal(cp04BuildApiUrl("/api/reservas", undefined), "/api/reservas");
});

test("cp04BuildApiUrl: con base -> URL absoluta, una sola barra de unión", () => {
  const env = { VITE_CP04_PUBLIC_BOOKING_ENDPOINT: PREVIEW_BASE };
  assert.equal(cp04BuildApiUrl("/api/disponibilidad", env), `${PREVIEW_BASE}/api/disponibilidad`);
  assert.equal(cp04BuildApiUrl("/api/reservas", env), `${PREVIEW_BASE}/api/reservas`);
});

test("cp04BuildApiUrl: nunca duplica /api ni genera dobles barras, con o sin barra final en la base", () => {
  const conBarra = { VITE_CP04_PUBLIC_BOOKING_ENDPOINT: `${PREVIEW_BASE}/` };
  const sinBarra = { VITE_CP04_PUBLIC_BOOKING_ENDPOINT: PREVIEW_BASE };
  assert.equal(cp04BuildApiUrl("/api/disponibilidad", conBarra), `${PREVIEW_BASE}/api/disponibilidad`);
  assert.equal(cp04BuildApiUrl("/api/disponibilidad", sinBarra), `${PREVIEW_BASE}/api/disponibilidad`);
  assert.doesNotMatch(cp04BuildApiUrl("/api/disponibilidad", conBarra), /\/\/api/);
});

test("cp04BuildApiUrl: normaliza un path sin barra inicial igual que uno con ella", () => {
  assert.equal(cp04BuildApiUrl("api/disponibilidad", {}), "/api/disponibilidad");
  assert.equal(
    cp04BuildApiUrl("api/reservas", { VITE_CP04_PUBLIC_BOOKING_ENDPOINT: PREVIEW_BASE }),
    `${PREVIEW_BASE}/api/reservas`,
  );
});

// cp04DisponibilidadEndpoint / cp04ReservasEndpoint --------------------------

test("cp04DisponibilidadEndpoint: desarrollo -> relativo; preview/producción -> absoluto contra el Worker", () => {
  assert.equal(cp04DisponibilidadEndpoint({}), "/api/disponibilidad");
  assert.equal(
    cp04DisponibilidadEndpoint({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: PREVIEW_BASE }),
    `${PREVIEW_BASE}/api/disponibilidad`,
  );
});

test("cp04ReservasEndpoint: desarrollo -> relativo; preview/producción -> absoluto contra el Worker", () => {
  assert.equal(cp04ReservasEndpoint({}), "/api/reservas");
  assert.equal(
    cp04ReservasEndpoint({ VITE_CP04_PUBLIC_BOOKING_ENDPOINT: PREVIEW_BASE }),
    `${PREVIEW_BASE}/api/reservas`,
  );
});

test("cp04DisponibilidadEndpoint y cp04ReservasEndpoint comparten la misma base, nunca divergen", () => {
  const env = { VITE_CP04_PUBLIC_BOOKING_ENDPOINT: `${PREVIEW_BASE}/` };
  const disponibilidad = cp04DisponibilidadEndpoint(env);
  const reservas = cp04ReservasEndpoint(env);
  assert.ok(disponibilidad.startsWith(PREVIEW_BASE));
  assert.ok(reservas.startsWith(PREVIEW_BASE));
  assert.notEqual(disponibilidad, reservas);
});
