import test from "node:test";
import assert from "node:assert/strict";

import {
  REQUEST_ID_HEADER,
  CORRELATION_ID_HEADER,
  resolveRequestId,
  resolveCorrelationId,
  attachCorrelationHeaders,
  buildRequestLogEvent,
  logStructuredEvent,
  dependencyStatusFromConfig,
} from "./observability-runtime.js";

const REQUEST_ID_PATTERN = /^req_[A-Za-z0-9-]{8,}$/;
const CORRELATION_ID_PATTERN = /^corr_[A-Za-z0-9-]{8,}$/;

function withCapturedConsoleLog(fn) {
  const original = console.log;
  const lines = [];
  console.log = (line) => lines.push(line);
  try {
    return { result: fn(), lines };
  } finally {
    console.log = original;
  }
}

test("resolveRequestId: genera un request_id nuevo cuando no llega ninguna cabecera", () => {
  const requestId = resolveRequestId(new Headers());
  assert.match(requestId, REQUEST_ID_PATTERN);
});

test("resolveRequestId: preserva el valor entrante si es válido", () => {
  const incoming = "req_abcdefgh-1234";
  const headers = new Headers({ [REQUEST_ID_HEADER]: incoming });
  assert.equal(resolveRequestId(headers), incoming);
});

test("resolveRequestId: genera uno nuevo (no preserva) si el valor entrante no cumple el patrón", () => {
  const headers = new Headers({ [REQUEST_ID_HEADER]: "not-a-valid-id" });
  const requestId = resolveRequestId(headers);
  assert.match(requestId, REQUEST_ID_PATTERN);
  assert.notEqual(requestId, "not-a-valid-id");
});

test("resolveCorrelationId: null explícito cuando no llega ninguna cabecera (nunca se inventa)", () => {
  assert.equal(resolveCorrelationId(new Headers()), null);
});

test("resolveCorrelationId: preserva el valor entrante si es válido", () => {
  const incoming = "corr_abcdefgh-1234";
  const headers = new Headers({ [CORRELATION_ID_HEADER]: incoming });
  assert.equal(resolveCorrelationId(headers), incoming);
});

test("resolveCorrelationId: null si el valor entrante no cumple el patrón", () => {
  const headers = new Headers({ [CORRELATION_ID_HEADER]: "no-valido" });
  assert.equal(resolveCorrelationId(headers), null);
});

test("sin colisión: dos IDs generados consecutivamente son distintos", () => {
  const a = resolveRequestId(new Headers());
  const b = resolveRequestId(new Headers());
  assert.notEqual(a, b);
});

test("attachCorrelationHeaders: añade X-CP04-Request-Id siempre, sin alterar status/body", async () => {
  const original = new Response(JSON.stringify({ ok: true }), { status: 201 });
  const withHeaders = attachCorrelationHeaders(original, { requestId: "req_abcdefgh-1234", correlationId: null });
  assert.equal(withHeaders.status, 201);
  assert.equal(withHeaders.headers.get(REQUEST_ID_HEADER), "req_abcdefgh-1234");
  assert.equal(withHeaders.headers.has(CORRELATION_ID_HEADER), false);
  assert.deepEqual(await withHeaders.json(), { ok: true });
});

test("attachCorrelationHeaders: añade X-CP04-Correlation-Id solo si hay correlationId", () => {
  const withCorr = attachCorrelationHeaders(new Response(null, { status: 200 }), {
    requestId: "req_abcdefgh-1234",
    correlationId: "corr_abcdefgh-1234",
  });
  assert.equal(withCorr.headers.get(CORRELATION_ID_HEADER), "corr_abcdefgh-1234");
});

test("logStructuredEvent: redacta claves prohibidas (Authorization/token) antes de emitir", () => {
  const event = buildRequestLogEvent({
    requestId: "req_abcdefgh-1234",
    correlationId: null,
    eventType: "http_request",
    message: "prueba",
    status: "success",
    durationMs: 5,
    metadata: { authorization: "Bearer sk_live_abc123", nested: { token: "secreto" } },
  });

  const { lines } = withCapturedConsoleLog(() => logStructuredEvent(event));
  assert.equal(lines.length, 1);
  const emitted = JSON.parse(lines[0]);
  assert.equal("authorization" in emitted.metadata, false);
  assert.equal("token" in emitted.metadata.nested, false);
});

test("logStructuredEvent: nunca lanza aunque el evento sea inválido", () => {
  assert.doesNotThrow(() => logStructuredEvent(undefined));
});

test("dependencyStatusFromConfig: configurado -> status UNKNOWN, retryable true (no se ha hecho ping en vivo todavía)", () => {
  const dep = dependencyStatusFromConfig({ name: "airtable", configured: true });
  assert.equal(dep.status, "UNKNOWN");
  assert.equal(dep.retryable, true);
});

test("dependencyStatusFromConfig: no configurado -> status UNKNOWN, retryable false (falta configuración, ningún reintento lo arregla)", () => {
  const dep = dependencyStatusFromConfig({ name: "make", configured: false });
  assert.equal(dep.status, "UNKNOWN");
  assert.equal(dep.retryable, false);
});
