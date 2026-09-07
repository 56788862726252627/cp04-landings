import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";

// Bloqueo P0 2026-08-24 (segunda mitad): amplía la validación de Origin del
// Worker para aceptar subdominios de preview de Cloudflare Pages
// (https://<alias>.club-padel-04.pages.dev) además de la lista explícita ya
// configurada (producción + localhost de desarrollo), sin usar nunca "*" y
// sin abrir la puerta a un dominio parecido/malicioso. Todos los tests usan
// GET /api/disponibilidad (sin `fecha`, 400 antes de tocar Airtable) u
// OPTIONS, para no necesitar ningún stub de Airtable/Supabase — solo importa
// la cabecera Access-Control-Allow-Origin de la respuesta.

const ALLOWED_ORIGIN = [
  "https://club-padel-04.pages.dev",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
].join(",");

const BASE_ENV = { ALLOWED_ORIGIN };

function requestTo(path, { method = "GET", origin } = {}) {
  const headers = {};
  if (origin !== undefined) headers.Origin = origin;
  return new Request(`https://worker.test${path}`, { method, headers });
}

async function corsOriginFor(path, origin, opts = {}) {
  const res = await worker.fetch(requestTo(path, { origin, ...opts }), BASE_ENV);
  return res.headers.get("Access-Control-Allow-Origin");
}

// ── Positivos ────────────────────────────────────────────────────────────

test("CORS: origen de producción explícito -> permitido, se refleja exacto", async () => {
  assert.equal(
    await corsOriginFor("/api/disponibilidad", "https://club-padel-04.pages.dev"),
    "https://club-padel-04.pages.dev",
  );
});

test("CORS: localhost de desarrollo explícito (5173/5174/5175) -> permitido", async () => {
  for (const origin of ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]) {
    assert.equal(await corsOriginFor("/api/disponibilidad", origin), origin);
  }
});

test("CORS: subdominio de preview válido (<alias>.club-padel-04.pages.dev) -> permitido", async () => {
  const origin = "https://qa-api-reservas-e2d60af.club-padel-04.pages.dev";
  assert.equal(await corsOriginFor("/api/disponibilidad", origin), origin);
});

test("CORS: subdominio de preview con hash numérico típico de Cloudflare Pages -> permitido", async () => {
  const origin = "https://af3042e0.club-padel-04.pages.dev";
  assert.equal(await corsOriginFor("/api/disponibilidad", origin), origin);
});

test("CORS: /api/reservas también acepta el subdominio de preview (misma validación centralizada)", async () => {
  const origin = "https://qa-api-reservas-e2d60af.club-padel-04.pages.dev";
  assert.equal(await corsOriginFor("/api/reservas", origin, { method: "OPTIONS" }), origin);
});

// ── Negativos ────────────────────────────────────────────────────────────

test("CORS: dominio con sufijo malicioso (club-padel-04.pages.dev.evil.com) -> rechazado, sin cabecera", async () => {
  assert.equal(
    await corsOriginFor("/api/disponibilidad", "https://club-padel-04.pages.dev.evil.com"),
    null,
  );
});

test("CORS: dominio con prefijo parecido (evilclub-padel-04.pages.dev) -> rechazado", async () => {
  assert.equal(await corsOriginFor("/api/disponibilidad", "https://evilclub-padel-04.pages.dev"), null);
});

test("CORS: subdominio de preview servido por http (no https) -> rechazado", async () => {
  assert.equal(
    await corsOriginFor("/api/disponibilidad", "http://qa-api-reservas-e2d60af.club-padel-04.pages.dev"),
    null,
  );
});

test("CORS: subdominio anidado (a.b.club-padel-04.pages.dev) -> rechazado, un solo label esperado", async () => {
  assert.equal(await corsOriginFor("/api/disponibilidad", "https://a.b.club-padel-04.pages.dev"), null);
});

test("CORS: sin subdominio, o subdominio vacío (https://.club-padel-04.pages.dev) -> rechazado", async () => {
  assert.equal(await corsOriginFor("/api/disponibilidad", "https://.club-padel-04.pages.dev"), null);
});

test("CORS: origen totalmente ajeno -> rechazado", async () => {
  assert.equal(await corsOriginFor("/api/disponibilidad", "https://attacker.example"), null);
});

test("CORS: sin cabecera Origin -> rechazado, sin cabecera de respuesta", async () => {
  assert.equal(await corsOriginFor("/api/disponibilidad", undefined), null);
});

test("CORS: nunca se devuelve '*' como Access-Control-Allow-Origin, ni para orígenes permitidos ni rechazados", async () => {
  const origenes = [
    "https://club-padel-04.pages.dev",
    "https://qa-api-reservas-e2d60af.club-padel-04.pages.dev",
    "https://club-padel-04.pages.dev.evil.com",
    "https://attacker.example",
  ];
  for (const origin of origenes) {
    const value = await corsOriginFor("/api/disponibilidad", origin);
    assert.notEqual(value, "*");
  }
});

// ── OPTIONS (preflight) ──────────────────────────────────────────────────

test("CORS: preflight OPTIONS en /api/disponibilidad desde un preview válido -> 204 con cabeceras completas", async () => {
  const origin = "https://qa-api-reservas-e2d60af.club-padel-04.pages.dev";
  const res = await worker.fetch(requestTo("/api/disponibilidad", { method: "OPTIONS", origin }), BASE_ENV);
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), origin);
  assert.equal(res.headers.get("Access-Control-Allow-Methods"), "GET, POST, OPTIONS");
  assert.equal(res.headers.get("Access-Control-Allow-Headers"), "Content-Type, Authorization");
  assert.equal(res.headers.get("Vary"), "Origin");
});

test("CORS: preflight OPTIONS en /api/reservas desde un origen no permitido -> sin cabecera CORS", async () => {
  const res = await worker.fetch(
    requestTo("/api/reservas", { method: "OPTIONS", origin: "https://attacker.example" }),
    BASE_ENV,
  );
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), null);
});

// ── GET/POST reales con Origin no permitido ─────────────────────────────

test("GET /api/disponibilidad con Origin no permitido: responde igualmente (endpoint público) pero sin cabecera CORS", async () => {
  const res = await worker.fetch(
    requestTo("/api/disponibilidad", { origin: "https://club-padel-04.pages.dev.evil.com" }),
    BASE_ENV,
  );
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), null);
  // Sigue devolviendo JSON del propio Worker (400 por falta de `fecha`), nunca
  // un fallback HTML — el navegador bloqueará leer la respuesta por CORS,
  // pero el Worker no la sirve "en abierto" con un origen falsificado.
  const body = await res.json();
  assert.equal(body.ok, false);
});

test("POST /api/reservas con Origin no permitido: 403 explícito, nunca abierto sin CORS", async () => {
  const res = await worker.fetch(
    new Request("https://worker.test/api/reservas", {
      method: "POST",
      headers: { Origin: "https://attacker.example", "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }),
    BASE_ENV,
  );
  assert.equal(res.status, 403);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), null);
});

test("POST /api/reservas (OPTIONS) con origen de producción explícito -> preflight permitido", async () => {
  const res = await worker.fetch(
    requestTo("/api/reservas", { method: "OPTIONS", origin: "https://club-padel-04.pages.dev" }),
    BASE_ENV,
  );
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), "https://club-padel-04.pages.dev");
});
