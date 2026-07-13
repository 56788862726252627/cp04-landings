import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateLogEvent } from "../../scripts/observability/validate-log-event.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "fixtures");

function loadFixture(name) {
  return JSON.parse(readFileSync(path.join(FIXTURES_DIR, name), "utf8"));
}

const VALID_FIXTURES = [
  "01-valid-request.json",
  "02-auth-401.json",
  "03-authz-403.json",
  "04-airtable-429.json",
  "05-airtable-monthly-quota.json",
  "06-make-scenario-failed.json",
  "07-worker-500.json",
  "08-email-failure.json",
  "09-timeout.json",
];

test("los 9 fixtures válidos pasan el contrato completo", () => {
  for (const name of VALID_FIXTURES) {
    const event = loadFixture(name);
    const result = validateLogEvent(event);
    assert.equal(result.valid, true, `${name} debería ser válido pero falló: ${JSON.stringify(result.errors)}`);
  }
});

test("el fixture 10 (fuga de secreto) falla la validación", () => {
  const event = loadFixture("10-invalid-secret-leak.json");
  const result = validateLogEvent(event);
  assert.equal(result.valid, false);
});

test("el fixture 10 falla específicamente por el escaneo de secretos, no por el esquema", () => {
  const event = loadFixture("10-invalid-secret-leak.json");
  const result = validateLogEvent(event);
  assert.ok(
    result.errors.some((e) => e.message.includes("nombre de campo prohibido") || e.message.includes("forma de secreto")),
    "se esperaba al menos un hallazgo de patrón prohibido"
  );
});

test("no quedan fixtures sin cubrir en el directorio (regla de mantenimiento)", () => {
  const filesOnDisk = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith(".json"));
  const covered = new Set([...VALID_FIXTURES, "10-invalid-secret-leak.json"]);
  for (const f of filesOnDisk) {
    assert.ok(covered.has(f), `fixture nuevo "${f}" no está declarado en ningún test — añadirlo a VALID_FIXTURES o a un caso inválido explícito`);
  }
});

// --- Casos inválidos sintéticos (mutaciones de un fixture válido), pedidos explícitamente por la misión ---

test("campo obligatorio ausente (request_id) hace fallar la validación", () => {
  const event = loadFixture("01-valid-request.json");
  delete event.request_id;
  const result = validateLogEvent(event);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.request_id"));
});

test("severity/level inválida (fuera del enum) hace fallar la validación", () => {
  const event = loadFixture("01-valid-request.json");
  event.level = "urgentísimo"; // no está en el enum debug|info|warn|error|critical
  const result = validateLogEvent(event);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.level"));
});

test("formato de timestamp inválido hace fallar la validación", () => {
  const event = loadFixture("01-valid-request.json");
  event.timestamp = "08/07/2026 10:15"; // no es ISO 8601 UTC
  const result = validateLogEvent(event);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.timestamp"));
});

test("error_code ausente con level=error viola la regla de negocio (no solo el esquema)", () => {
  const event = loadFixture("07-worker-500.json");
  event.error_code = null;
  const result = validateLogEvent(event);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.error_code" && e.message.includes("obligatorio")));
});

test("error_code que no existe en la taxonomía se rechaza aunque el formato sea válido", () => {
  const event = loadFixture("07-worker-500.json");
  event.error_code = "WORKER_5XX.CODIGO_INVENTADO";
  const result = validateLogEvent(event);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.message.includes("no existe en")));
});

test("metadata que supera el tamaño máximo se rechaza", () => {
  const event = loadFixture("01-valid-request.json");
  event.metadata = { blob: "x".repeat(5000) };
  const result = validateLogEvent(event);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.metadata"));
});

test("un token con forma de JWT dentro de un campo de nombre inocente también se detecta", () => {
  const event = loadFixture("01-valid-request.json");
  event.metadata = { nota_interna: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" };
  const result = validateLogEvent(event);
  assert.equal(result.valid, false, "un valor con forma de JWT debe fallar aunque la clave no se llame 'token'");
});
