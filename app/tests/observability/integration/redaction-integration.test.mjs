import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { redactEvent } from "../../../scripts/observability/redactor.mjs";
import { validateLogEvent } from "../../../scripts/observability/validate-log-event.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../../fixtures/observability/integration/worker-log-with-secret.json"), "utf8")
);

test("integración: un log-event crudo con Authorization embebida en metadata queda sin esa clave tras redactEvent()", () => {
  const { redacted } = redactEvent(FIXTURE.raw_event);
  assert.equal(Object.prototype.hasOwnProperty.call(redacted.metadata, "authorization"), false);
});

test("integración: el JWT embebido en 'message' se enmascara, nunca se elimina el campo completo (message no es una clave prohibida)", () => {
  const { redacted } = redactEvent(FIXTURE.raw_event);
  assert.equal(redacted.message.includes("[REDACTED]"), true);
  assert.equal(redacted.message.includes("eyJhbGciOiJIUzI1NiJ9"), false);
});

test("integración: el evento crudo SIN redactar fallaría la validación (contiene secreto)", () => {
  const result = validateLogEvent(FIXTURE.raw_event);
  assert.equal(result.valid, false);
});

test("integración: el mismo evento, tras redactEvent(), PASA validateLogEvent() — pipeline REDACT->VALIDATE cierra el círculo", () => {
  const { redacted } = redactEvent(FIXTURE.raw_event);
  const result = validateLogEvent(redacted);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("integración: redactEvent() nunca muta el objeto original — el fixture crudo sigue teniendo la clave 'authorization' tras la llamada", () => {
  redactEvent(FIXTURE.raw_event);
  assert.equal(Object.prototype.hasOwnProperty.call(FIXTURE.raw_event.metadata, "authorization"), true);
});
