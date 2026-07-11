import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DELIVERY_STATUS,
  classifyDeliveryStatus,
  normalizeDeliveryStatusEvent,
  extractDeliveryStatusEvents,
  correlateDeliveryEvent,
  DeliveryEventDedupStore,
  deduplicateDeliveryEvent,
} from "../../worker-reservas/messaging/whatsapp-delivery-status.mjs";
import { validateAgainstSchema } from "../../src/config/schemaValidator.js";
import { repoPath } from "../../src/config/paths.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, "../../fixtures/whatsapp/delivery");

function load(name) {
  const { _why, ...fixture } = JSON.parse(readFileSync(path.join(FIXTURES, name), "utf8"));
  return fixture;
}

const deliveryStatusEventSchema = JSON.parse(readFileSync(repoPath("schemas", "whatsapp", "delivery-status-event.schema.json"), "utf8"));

// --- classifyDeliveryStatus --------------------------------------------------

test("classifyDeliveryStatus: mapea los 4 valores reales de Meta", () => {
  assert.equal(classifyDeliveryStatus("sent"), DELIVERY_STATUS.SENT);
  assert.equal(classifyDeliveryStatus("delivered"), DELIVERY_STATUS.DELIVERED);
  assert.equal(classifyDeliveryStatus("read"), DELIVERY_STATUS.READ);
  assert.equal(classifyDeliveryStatus("failed"), DELIVERY_STATUS.FAILED);
});

test("classifyDeliveryStatus: valor no catalogado (p.ej. 'deleted') -> UNKNOWN, nunca lanza", () => {
  assert.equal(classifyDeliveryStatus("deleted"), DELIVERY_STATUS.UNKNOWN);
  assert.equal(classifyDeliveryStatus(undefined), DELIVERY_STATUS.UNKNOWN);
  assert.equal(classifyDeliveryStatus(null), DELIVERY_STATUS.UNKNOWN);
});

// --- event schema + message id correlation + tenant + recipient -----------

test("event schema: sent/delivered/read normalizados validan contra delivery-status-event.schema.json", () => {
  const fixture = load("webhook-sent-delivered-read.json");
  for (const key of ["sent", "delivered", "read"]) {
    const [event] = extractDeliveryStatusEvents(fixture[key]);
    const result = validateAgainstSchema(deliveryStatusEventSchema, event);
    assert.equal(result.valid, true, JSON.stringify(result.errors));
  }
});

test("message id correlation: 3 transiciones del mismo message_id se normalizan con el mismo message_id, distinto status", () => {
  const fixture = load("webhook-sent-delivered-read.json");
  const sent = extractDeliveryStatusEvents(fixture.sent)[0];
  const delivered = extractDeliveryStatusEvents(fixture.delivered)[0];
  const read = extractDeliveryStatusEvents(fixture.read)[0];
  assert.equal(sent.message_id, "wamid.TESTMSG0001");
  assert.equal(delivered.message_id, "wamid.TESTMSG0001");
  assert.equal(read.message_id, "wamid.TESTMSG0001");
  assert.deepEqual([sent.status, delivered.status, read.status], [DELIVERY_STATUS.SENT, DELIVERY_STATUS.DELIVERED, DELIVERY_STATUS.READ]);
});

test("tenant + recipient: correlateDeliveryEvent() añade tenant_id/idempotency_key a partir del índice de envíos ya aceptados", () => {
  const fixture = load("webhook-sent-delivered-read.json");
  const event = extractDeliveryStatusEvents(fixture.delivered)[0];
  const sentMessageIndex = new Map([
    ["wamid.TESTMSG0001", { tenantId: "tnt_qacp04_test", to: "+34600000060", templateName: "booking_confirmed", idempotencyKey: "whatsapp:tnt_qacp04_test:bkg_0060:booking_confirmed" }],
  ]);
  const correlation = correlateDeliveryEvent(event, sentMessageIndex);
  assert.equal(correlation.correlated, true);
  assert.equal(correlation.tenantId, "tnt_qacp04_test");
  assert.equal(correlation.to, "+34600000060");

  const enriched = { ...event, tenant_id: correlation.tenantId, idempotency_key: correlation.idempotencyKey };
  const result = validateAgainstSchema(deliveryStatusEventSchema, enriched);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("correlateDeliveryEvent: message_id desconocido -> correlated:false, reason:'unknown_message_id', nunca lanza", () => {
  const fixture = load("webhook-sent-delivered-read.json");
  const event = extractDeliveryStatusEvents(fixture.sent)[0];
  const correlation = correlateDeliveryEvent(event, new Map());
  assert.equal(correlation.correlated, false);
  assert.equal(correlation.reason, "unknown_message_id");
});

test("correlateDeliveryEvent: evento sin message_id -> correlated:false, reason:'missing_message_id'", () => {
  const correlation = correlateDeliveryEvent({ message_id: null, status: DELIVERY_STATUS.SENT }, new Map());
  assert.equal(correlation.correlated, false);
  assert.equal(correlation.reason, "missing_message_id");
});

test("recipient: recipient_id de Meta (sin '+') se normaliza a E.164 con '+' — válido contra el schema", () => {
  const fixture = load("webhook-sent-delivered-read.json");
  const event = extractDeliveryStatusEvents(fixture.sent)[0];
  assert.equal(event.recipient, "+34600000060");
});

// --- failure normalization ----------------------------------------------------

test("failure normalization: status failed con error 131026 reutiliza classifyProviderError (retryable:false, category:'invalid_recipient')", () => {
  const fixture = load("webhook-failed-invalid-recipient.json");
  const [event] = extractDeliveryStatusEvents(fixture);
  assert.equal(event.status, DELIVERY_STATUS.FAILED);
  assert.equal(event.error_code, 131026);
  assert.equal(event.retryable, false);
  assert.equal(event.category, "invalid_recipient");
  const result = validateAgainstSchema(deliveryStatusEventSchema, event);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("failure normalization: status FAILED sin error_code -> el schema lo rechaza (allOf if/then exige error_code numérico)", () => {
  const malformedFailedEvent = { message_id: "wamid.X", status: "FAILED", timestamp: null, recipient: null, error_code: null, error_message: null, retryable: null, category: null };
  const result = validateAgainstSchema(deliveryStatusEventSchema, malformedFailedEvent);
  assert.equal(result.valid, false);
});

// --- duplicate delivery event ------------------------------------------------

test("duplicate delivery event: mismo (message_id, status) reenviado por Meta -> dedup marca el segundo como visto", () => {
  const fixture = load("webhook-duplicate-delivered.json");
  const store = new DeliveryEventDedupStore();
  const first = extractDeliveryStatusEvents(fixture.first)[0];
  const resent = extractDeliveryStatusEvents(fixture.resent_by_meta)[0];

  assert.equal(deduplicateDeliveryEvent(first, store), false, "primera vez no es duplicado");
  assert.equal(deduplicateDeliveryEvent(resent, store), true, "reenvío exacto de Meta debe detectarse como duplicado");
  assert.equal(store.seenCount, 1);
});

test("duplicate delivery event: sent->delivered->read del MISMO message_id NO se consideran duplicados entre sí (distinto status)", () => {
  const fixture = load("webhook-sent-delivered-read.json");
  const store = new DeliveryEventDedupStore();
  const sent = extractDeliveryStatusEvents(fixture.sent)[0];
  const delivered = extractDeliveryStatusEvents(fixture.delivered)[0];
  const read = extractDeliveryStatusEvents(fixture.read)[0];

  assert.equal(deduplicateDeliveryEvent(sent, store), false);
  assert.equal(deduplicateDeliveryEvent(delivered, store), false);
  assert.equal(deduplicateDeliveryEvent(read, store), false);
  assert.equal(store.seenCount, 3, "3 transiciones legítimas distintas, ninguna es duplicado de otra");
});

// --- robustez: payload malformado / campo no relacionado -------------------

test("extractDeliveryStatusEvents: mensaje entrante (no un status) produce lista vacía, nunca lanza", () => {
  const fixture = load("webhook-malformed-and-unrelated-field.json");
  const events = extractDeliveryStatusEvents(fixture.incoming_message_not_a_status);
  assert.deepEqual(events, []);
});

test("extractDeliveryStatusEvents: status entry corrupto (sin id/recipient_id) se normaliza a nulls, nunca lanza", () => {
  const fixture = load("webhook-malformed-and-unrelated-field.json");
  const [event] = extractDeliveryStatusEvents(fixture.corrupt_status_entry);
  assert.equal(event.message_id, null);
  assert.equal(event.recipient, null);
  assert.equal(event.status, DELIVERY_STATUS.DELIVERED);
});

test("extractDeliveryStatusEvents: payload completamente vacío/inesperado -> lista vacía, nunca lanza", () => {
  assert.deepEqual(extractDeliveryStatusEvents({}), []);
  assert.deepEqual(extractDeliveryStatusEvents(null), []);
  assert.deepEqual(extractDeliveryStatusEvents({ entry: "no-es-un-array" }), []);
});
