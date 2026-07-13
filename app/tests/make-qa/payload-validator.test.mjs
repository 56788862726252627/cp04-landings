import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validatePayloadForTestId } from "../../scripts/make-qa/payload-validator.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");
const PAYLOADS_DIR = path.join(APP_ROOT, "fixtures/make-qa/payloads");
const INVALID_DIR = path.join(APP_ROOT, "fixtures/make-qa/payloads-invalid");

function loadFixture(dir, name) {
  return JSON.parse(readFileSync(path.join(dir, name), "utf8"));
}

test("los 10 fixtures válidos (payloads/) pasan la validación de su propio test_id", () => {
  const files = readdirSync(PAYLOADS_DIR).filter((f) => f.endsWith(".json"));
  assert.equal(files.length, 10, "se esperaban 10 fixtures válidos (QA-A1-001, QA-A2-001, + 8 preparados de Wave 1/2)");
  for (const file of files) {
    const raw = loadFixture(PAYLOADS_DIR, file);
    const result = validatePayloadForTestId(raw.test_id, raw);
    assert.equal(result.valid, true, `${file} (${raw.test_id}): ${JSON.stringify(result.errors)}`);
  }
});

test("QA-A3-001: clave_reserva sin prefijo QA_CP04_ es rechazada", () => {
  const raw = loadFixture(INVALID_DIR, "control-acceso-qr-sin-prefijo.json");
  const result = validatePayloadForTestId("QA-A3-001", raw);
  assert.equal(result.valid, false);
});

test("QA-A3-002: precio_total distinto de 0 es rechazado", () => {
  const raw = loadFixture(INVALID_DIR, "api-reservas-precio-no-cero.json");
  const result = validatePayloadForTestId("QA-A3-002", raw);
  assert.equal(result.valid, false);
});

test("QA-A4-002: email con dominio real (no .test) es rechazado — protección directa contra dar de baja a un socio real", () => {
  const raw = loadFixture(INVALID_DIR, "baja-jugador-dominio-real.json");
  const result = validatePayloadForTestId("QA-A4-002", raw);
  assert.equal(result.valid, false);
});

test("QA-A3-003: email sin alias '+qacp04' es rechazado", () => {
  const raw = loadFixture(INVALID_DIR, "alta-jugador-sin-alias.json");
  const result = validatePayloadForTestId("QA-A3-003", raw);
  assert.equal(result.valid, false);
});

test("QA-A4-003: resultado distinto de 0-0 es rechazado", () => {
  const raw = loadFixture(INVALID_DIR, "cruces-torneo-resultado-no-cero.json");
  const result = validatePayloadForTestId("QA-A4-003", raw);
  assert.equal(result.valid, false);
});

test("QA-A2-001: Mapa de Flujos no admite ningún campo de payload", () => {
  const raw = loadFixture(INVALID_DIR, "mapa-flujos-con-datos.json");
  const result = validatePayloadForTestId("QA-A2-001", raw);
  assert.equal(result.valid, false);
});

test("QA-A4-001: falta el campo obligatorio 'motivo'", () => {
  const raw = loadFixture(INVALID_DIR, "gdpr-campo-faltante.json");
  const result = validatePayloadForTestId("QA-A4-001", raw);
  assert.equal(result.valid, false);
});

test("test_id inexistente devuelve error explícito, no una excepción", () => {
  const result = validatePayloadForTestId("QA-Z9-999", { payload: {} });
  assert.equal(result.valid, false);
  assert.match(result.errors[0].message, /no existe en el manifest/);
});
