// Paso 13 · Fase 6 — Tests de integración REAL (opcionales, manuales).
//
// Este archivo NO termina en ".test.mjs" a propósito: el glob de
// `npm test` (`find src tenant-cli factory-cli research-cli -name
// '*.test.mjs'`) nunca lo recoge, así que NUNCA se ejecuta en CI ni por
// defecto. Requiere conexión real a Internet Y la variable de entorno
// ALLOW_REAL_NETWORK_TESTS=1 — sin ella, cada test se salta
// explícitamente (no falla, no se ejecuta).
//
// Objetivo de reproducibilidad honesta: FRENTE a `example.com` (dominio
// reservado por IANA/RFC 2606 explícitamente para documentación y
// pruebas — no es un negocio ni un competidor real), no un negocio real
// ni de terceros.
//
// Ejecutar manualmente:
//   ALLOW_REAL_NETWORK_TESTS=1 node --test src/saas-core/research/providers/publicWebsiteFetcher.realnetwork.manual.mjs

import { test } from "node:test";
import assert from "node:assert/strict";

import { fetchPublicWebsite, collectFromPublicWebsite } from "./publicWebsiteFetcher.js";

const REAL_NETWORK_ENABLED = process.env.ALLOW_REAL_NETWORK_TESTS === "1";
const TEST_URL = "https://example.com/";

test("fetchPublicWebsite obtiene example.com de verdad (red real)", { skip: !REAL_NETWORK_ENABLED && "requiere ALLOW_REAL_NETWORK_TESTS=1 y red real" }, async () => {
  const result = await fetchPublicWebsite(TEST_URL, { respectRobots: true, maxPages: 1 });
  assert.equal(result.status, "available");
  assert.equal(result.httpStatus, 200);
  assert.match(result.body, /example/i);
  assert.ok(result.contentHash);
});

test("fetchPublicWebsite bloquea SSRF de verdad incluso con red real habilitada (localhost)", { skip: !REAL_NETWORK_ENABLED && "requiere ALLOW_REAL_NETWORK_TESTS=1" }, async () => {
  const result = await fetchPublicWebsite("http://localhost/", {});
  assert.equal(result.status, "error");
  assert.equal(result.errorCode, "SSRF_BLOCKED");
});

test("collectFromPublicWebsite produce evidencia real determinista en su evidenceId entre dos llamadas reales consecutivas", { skip: !REAL_NETWORK_ENABLED && "requiere ALLOW_REAL_NETWORK_TESTS=1 y red real" }, async () => {
  const first = await collectFromPublicWebsite([TEST_URL], { maxPages: 1 });
  const second = await collectFromPublicWebsite([TEST_URL], { maxPages: 1 });
  const firstIds = first.evidence.map((e) => e.evidenceId).sort();
  const secondIds = second.evidence.map((e) => e.evidenceId).sort();
  assert.deepEqual(firstIds, secondIds, "el mismo contenido real debe producir los mismos evidenceId (sin timestamps en el hash)");
});

test("fetchPublicWebsite maneja un 404 real de forma controlada (sin lanzar)", { skip: !REAL_NETWORK_ENABLED && "requiere ALLOW_REAL_NETWORK_TESTS=1 y red real" }, async () => {
  const result = await fetchPublicWebsite("https://example.com/ruta-inexistente-para-pruebas-reales-12345", {});
  assert.equal(result.status, "error");
  assert.equal(result.errorCode, "HTTP_4XX");
});
