import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  REQUEST_ID_HEADER,
  CORRELATION_ID_HEADER,
  isValidRequestId,
  isValidCorrelationId,
  resolveRequestId,
  resolveCorrelationId,
  resolveOrStartCorrelationId,
  buildOutgoingHeaders,
} from "../../../scripts/observability/header-contract.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "../../../fixtures/observability/integration");

function loadFixture(name) {
  return JSON.parse(readFileSync(path.join(FIXTURES_DIR, name), "utf8"));
}

test("contrato: X-CP04-Request-Id y X-CP04-Correlation-Id ya válidos se RESPETAN, nunca se regeneran", () => {
  const fixture = loadFixture("worker-request-with-ids.json");
  const requestId = resolveRequestId(fixture.headers);
  const correlationId = resolveCorrelationId(fixture.headers);
  assert.equal(requestId, fixture.headers[REQUEST_ID_HEADER]);
  assert.equal(correlationId, fixture.headers[CORRELATION_ID_HEADER]);
});

test("contrato: sin cabeceras, request_id SIEMPRE se genera (nunca null) y correlation_id se queda en null", () => {
  const fixture = loadFixture("worker-request-without-ids.json");
  const requestId = resolveRequestId(fixture.headers);
  const correlationId = resolveCorrelationId(fixture.headers);
  assert.equal(isValidRequestId(requestId), true);
  assert.equal(correlationId, null);
});

test("contrato: cabeceras con formato inválido se tratan como ausentes, nunca se aceptan tal cual", () => {
  const fixture = loadFixture("worker-request-invalid-ids.json");
  const requestId = resolveRequestId(fixture.headers);
  const correlationId = resolveCorrelationId(fixture.headers);
  assert.notEqual(requestId, fixture.headers[REQUEST_ID_HEADER]);
  assert.equal(isValidRequestId(requestId), true);
  assert.equal(correlationId, null);
});

test("resolveOrStartCorrelationId genera uno nuevo solo cuando no hay ninguno válido — punto de entrada de flujo de negocio", () => {
  const withId = resolveOrStartCorrelationId({ [CORRELATION_ID_HEADER]: "corr_ya-existe-valido1" });
  assert.equal(withId, "corr_ya-existe-valido1");

  const withoutId = resolveOrStartCorrelationId({});
  assert.equal(isValidCorrelationId(withoutId), true);
});

test("buildOutgoingHeaders siempre incluye request_id y solo incluye correlation_id si no es null", () => {
  const withCorr = buildOutgoingHeaders({ requestId: "req_x", correlationId: "corr_y" });
  assert.deepEqual(withCorr, { [REQUEST_ID_HEADER]: "req_x", [CORRELATION_ID_HEADER]: "corr_y" });

  const withoutCorr = buildOutgoingHeaders({ requestId: "req_x", correlationId: null });
  assert.deepEqual(withoutCorr, { [REQUEST_ID_HEADER]: "req_x" });
});

test("readHeader interno soporta tanto objeto plano como un objeto con .get() (compatible con fetch Headers real)", () => {
  const fakeHeaders = { get: (name) => (name === REQUEST_ID_HEADER ? "req_desde-getter-0001" : null) };
  assert.equal(resolveRequestId(fakeHeaders), "req_desde-getter-0001");
});

test("isValidRequestId/isValidCorrelationId rechazan formatos que no cumplen el patrón del contrato ya cerrado en log-event.schema.json", () => {
  assert.equal(isValidRequestId("req_corto"), false);
  assert.equal(isValidRequestId("sin-prefijo-12345678"), false);
  assert.equal(isValidCorrelationId("corr_corto"), false);
});
