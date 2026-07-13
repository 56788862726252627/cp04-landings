import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRequestLogEvent,
  buildAndSanitizeLogEvent,
  withRequestLogging,
} from "../../../scripts/observability/request-logger.mjs";
import {
  REQUEST_ID_HEADER,
  CORRELATION_ID_HEADER,
  isValidRequestId,
  generateCorrelationId,
  buildOutgoingHeaders,
} from "../../../scripts/observability/header-contract.mjs";

function makeWrapped(handler, overrides = {}) {
  const events = [];
  const wrapped = withRequestLogging(handler, {
    service: "worker",
    eventType: "test_event",
    onLogEvent: (event) => events.push(event),
    ...overrides,
  });
  return { wrapped, events };
}

test("withRequestLogging: request_id AUSENTE en la petición -> se genera uno válido y aparece en el log-event de salida", async () => {
  const { wrapped, events } = makeWrapped(async () => ({ status: 200 }));
  await wrapped({ headers: {} });
  assert.equal(events.length, 1);
  assert.equal(isValidRequestId(events[0].request_id), true);
});

test("withRequestLogging: request_id VÁLIDO ya presente en la petición -> se HEREDA sin cambios en el log-event", async () => {
  const { wrapped, events } = makeWrapped(async () => ({ status: 200 }));
  await wrapped({ headers: { [REQUEST_ID_HEADER]: "req_ya-existe-heredado1" } });
  assert.equal(events[0].request_id, "req_ya-existe-heredado1");
});

test("withRequestLogging: request_id con formato INVÁLIDO en la petición -> se descarta y se GENERA uno nuevo válido, distinto del recibido", async () => {
  const { wrapped, events } = makeWrapped(async () => ({ status: 200 }));
  await wrapped({ headers: { [REQUEST_ID_HEADER]: "formato-malo" } });
  assert.equal(isValidRequestId(events[0].request_id), true);
  assert.notEqual(events[0].request_id, "formato-malo");
});

test("reintentos: correlation_id se PRESERVA entre reintentos aunque cada intento genere su propio request_id nuevo", async () => {
  const correlationId = generateCorrelationId();
  const { wrapped, events } = makeWrapped(async () => ({ status: 503 }));

  // Intento 1: el cliente ya trae el correlation_id del flujo de negocio, sin
  // reenviar request_id (cada intento es una petición HTTP nueva).
  await wrapped({ headers: { [CORRELATION_ID_HEADER]: correlationId } });
  // Intento 2 (retry tras el 503): mismo correlation_id, sin request_id propio.
  await wrapped({ headers: { [CORRELATION_ID_HEADER]: correlationId } });

  assert.equal(events.length, 2);
  assert.equal(events[0].correlation_id, correlationId);
  assert.equal(events[1].correlation_id, correlationId);
  assert.notEqual(events[0].request_id, events[1].request_id);
});

test("reintentos: si el cliente SÍ reenvía el mismo request_id (idempotency retry), el wrapper lo respeta tal cual en ambos intentos", async () => {
  const { wrapped, events } = makeWrapped(async () => ({ status: 200 }));
  const headers = { [REQUEST_ID_HEADER]: "req_reintento-idempotente1" };
  await wrapped({ headers });
  await wrapped({ headers });
  assert.equal(events[0].request_id, "req_reintento-idempotente1");
  assert.equal(events[1].request_id, "req_reintento-idempotente1");
});

test("propagación entre hops: buildOutgoingHeaders(eventoSalida) reintroducido como cabecera de entrada preserva el correlation_id en el siguiente hop", async () => {
  const correlationId = generateCorrelationId();
  const { wrapped, events } = makeWrapped(async () => ({ status: 200 }));

  await wrapped({ headers: { [CORRELATION_ID_HEADER]: correlationId } });
  const outgoing = buildOutgoingHeaders({ requestId: events[0].request_id, correlationId: events[0].correlation_id });

  await wrapped({ headers: outgoing });
  assert.equal(events[1].correlation_id, correlationId);
});

test("withRequestLogging: nunca altera la respuesta del handler (mismo status, misma referencia de objeto)", async () => {
  const response = { status: 201, body: "ok" };
  const { wrapped } = makeWrapped(async () => response);
  const result = await wrapped({ headers: {} });
  assert.equal(result, response);
});

test("withRequestLogging: si el handler lanza, el wrapper RELANZA el mismo error y aun así emite el log-event de fallo", async () => {
  const boom = new Error("fallo simulado del handler");
  const { wrapped, events } = makeWrapped(async () => {
    throw boom;
  });
  await assert.rejects(() => wrapped({ headers: {} }), boom);
  assert.equal(events.length, 1);
  assert.equal(events[0].status, "failure");
});

test("buildAndSanitizeLogEvent: un secreto (authorization) embebido en metadata se ELIMINA antes de que el evento salga del wrapper", () => {
  const raw = buildRequestLogEvent({
    requestId: "req_secreto-en-metadata1",
    correlationId: null,
    service: "worker",
    eventType: "test_event",
    message: "prueba",
    status: "failure",
    durationMs: 10,
    metadata: { authorization: "Bearer secreto-real-no-debe-salir", accion: "cancelar" },
  });
  const { event, validation } = buildAndSanitizeLogEvent(raw);
  assert.equal(Object.prototype.hasOwnProperty.call(event.metadata, "authorization"), false);
  assert.equal(event.metadata.accion, "cancelar");
  assert.equal(validation.valid, true, JSON.stringify(validation.errors));
});

test("buildAndSanitizeLogEvent: un token embebido como valor de texto libre en metadata se enmascara, no se deja pasar en claro", () => {
  const raw = buildRequestLogEvent({
    requestId: "req_token-en-texto-libre1",
    correlationId: null,
    service: "worker",
    eventType: "test_event",
    message: "token=Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
    status: "failure",
    durationMs: 10,
  });
  const { event } = buildAndSanitizeLogEvent(raw);
  assert.equal(event.message.includes("[REDACTED]"), true);
  assert.equal(event.message.includes("eyJhbGciOiJIUzI1NiJ9"), false);
});

test("buildAndSanitizeLogEvent: un email (PII) embebido en metadata se enmascara con [PII_REDACTED], nunca se elimina la clave completa", () => {
  const raw = buildRequestLogEvent({
    requestId: "req_email-en-metadata0001",
    correlationId: null,
    service: "worker",
    eventType: "test_event",
    message: "prueba",
    status: "failure",
    durationMs: 10,
    metadata: { contacto: "jugador@example.com" },
  });
  const { event, validation } = buildAndSanitizeLogEvent(raw);
  assert.equal(event.metadata.contacto.includes("[PII_REDACTED]"), true);
  assert.equal(event.metadata.contacto.includes("jugador@example.com"), false);
  assert.equal(validation.valid, true, JSON.stringify(validation.errors));
});
