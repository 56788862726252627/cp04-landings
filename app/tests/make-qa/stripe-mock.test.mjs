import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { signStripeEvent, verifyStripeSignature, StripeEventDedupStore, decideStripeEventHandling } from "../../scripts/make-qa/stripe-mock.mjs";
import { validateAgainstSchema } from "../../scripts/make-qa/schema-validator.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");
const STRIPE_FIXTURES = path.join(APP_ROOT, "fixtures/make-qa/stripe");
const SCHEMA = JSON.parse(readFileSync(path.join(APP_ROOT, "schemas/make-qa/stripe-webhook-event.schema.json"), "utf8"));
const TEST_SECRET = "whsec_test_qacp04_never_real";

function load(name) {
  return JSON.parse(readFileSync(path.join(STRIPE_FIXTURES, name), "utf8"));
}

test("success-checkout-completed.json cumple el contrato de evento Stripe (mock)", () => {
  const event = load("success-checkout-completed.json");
  const result = validateAgainstSchema(SCHEMA, event);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("failed-payment-invoice.json cumple el contrato", () => {
  const result = validateAgainstSchema(SCHEMA, load("failed-payment-invoice.json"));
  assert.equal(result.valid, true);
});

test("missing-metadata.json VIOLA el contrato (metadata.email obligatorio)", () => {
  const result = validateAgainstSchema(SCHEMA, load("missing-metadata.json"));
  assert.equal(result.valid, false);
});

test("livemode:true siempre viola el contrato — ningún fixture de esta suite puede parecer un evento real", () => {
  const event = load("success-checkout-completed.json");
  const tampered = { ...event, livemode: true };
  const result = validateAgainstSchema(SCHEMA, tampered);
  assert.equal(result.valid, false);
});

test("firma válida generada con el secreto correcto se verifica OK", () => {
  const event = load("success-checkout-completed.json");
  const { header, rawBody } = signStripeEvent(event, TEST_SECRET);
  const result = verifyStripeSignature(rawBody, header, TEST_SECRET);
  assert.equal(result.valid, true);
});

test("firma con secreto incorrecto es rechazada (signature_mismatch)", () => {
  const event = load("success-checkout-completed.json");
  const { header, rawBody } = signStripeEvent(event, TEST_SECRET);
  const result = verifyStripeSignature(rawBody, header, "whsec_test_wrong_secret");
  assert.equal(result.valid, false);
  assert.equal(result.reason, "signature_mismatch");
});

test("body alterado tras firmar invalida la firma (protección de integridad)", () => {
  const event = load("success-checkout-completed.json");
  const { header, rawBody } = signStripeEvent(event, TEST_SECRET);
  const tamperedBody = rawBody.replace("qa_cp04_stripe_nomatch@invalid.test", "socio.real@gmail.com");
  const result = verifyStripeSignature(tamperedBody, header, TEST_SECRET);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "signature_mismatch");
});

test("cabecera de firma malformada es rechazada sin lanzar excepción", () => {
  const result = verifyStripeSignature("{}", "esto-no-es-una-firma-valida", TEST_SECRET);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "malformed_signature_header");
});

test("replay: firma válida pero timestamp fuera de tolerancia se rechaza (replay attack)", () => {
  const fixture = load("replay-old-timestamp.json");
  const oldTimestamp = Math.floor(Date.now() / 1000) + fixture.replay_timestamp_offset_seconds - 3600; // muy fuera de los 300s de tolerancia
  const { header, rawBody } = signStripeEvent(fixture.event, TEST_SECRET, oldTimestamp);
  const result = verifyStripeSignature(rawBody, header, TEST_SECRET);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "timestamp_outside_tolerance_possible_replay");
});

test("dedup: el segundo evento con el mismo id se marca como duplicado, nunca se reprocesa", () => {
  const store = new StripeEventDedupStore();
  const original = load("success-checkout-completed.json");
  const duplicate = load("duplicate-of-success.json");
  assert.equal(original.id, duplicate.id, "precondición del fixture: mismo event.id");

  const firstDecision = decideStripeEventHandling(original, store);
  assert.equal(firstDecision.action, "process");

  const secondDecision = decideStripeEventHandling(duplicate, store);
  assert.equal(secondDecision.action, "skip_duplicate");
  assert.equal(store.processedCount, 1);
});

test("evento sin metadata.email se rechaza explícitamente, nunca se procesa 'por si acaso'", () => {
  const store = new StripeEventDedupStore();
  const decision = decideStripeEventHandling(load("missing-metadata.json"), store);
  assert.equal(decision.action, "reject_missing_metadata");
  assert.equal(store.processedCount, 0);
});

test("failed-payment-invoice.json se procesa igual que un success (Dunning) si pasa dedup+metadata", () => {
  const store = new StripeEventDedupStore();
  const decision = decideStripeEventHandling(load("failed-payment-invoice.json"), store);
  assert.equal(decision.action, "process");
});
