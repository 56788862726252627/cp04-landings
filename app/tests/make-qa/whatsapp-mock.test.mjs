import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isValidE164, validateRecipient, TokenBucket, computeRetryDelayMs, WhatsappDuplicateSendStore, decideWhatsappSend, PROVIDER_FAILURE_CODES } from "../../scripts/make-qa/whatsapp-mock.mjs";
import { validateAgainstSchema } from "../../scripts/make-qa/schema-validator.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");
const WA_FIXTURES = path.join(APP_ROOT, "fixtures/make-qa/whatsapp");
const SCHEMA = JSON.parse(readFileSync(path.join(APP_ROOT, "schemas/make-qa/whatsapp-template-message.schema.json"), "utf8"));

function load(name) {
  return JSON.parse(readFileSync(path.join(WA_FIXTURES, name), "utf8"));
}

test("template-valid.json cumple el schema de plantilla", () => {
  const result = validateAgainstSchema(SCHEMA, load("template-valid.json"));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("template-invalid-recipient.json viola el schema (E.164)", () => {
  const result = validateAgainstSchema(SCHEMA, load("template-invalid-recipient.json"));
  assert.equal(result.valid, false);
});

test("idempotency_key sin prefijo QA_CP04_ viola el schema", () => {
  const msg = { ...load("template-valid.json"), idempotency_key: "REMINDER_20260709A" };
  const result = validateAgainstSchema(SCHEMA, msg);
  assert.equal(result.valid, false);
});

test("isValidE164: acepta formato completo, rechaza sin '+' o con letras", () => {
  assert.equal(isValidE164("+34600000001"), true);
  assert.equal(isValidE164("600000001"), false);
  assert.equal(isValidE164("+34ABC"), false);
});

test("validateRecipient: bloquea un número de la lista de opt-out incluso con formato válido", () => {
  const { opted_out_numbers } = load("opt-out-list.json");
  const result = validateRecipient("+34600000099", opted_out_numbers);
  assert.equal(result.allowed, false);
  assert.match(result.reason, /opt-out/);
});

test("validateRecipient: permite un número válido fuera de la lista de opt-out", () => {
  const { opted_out_numbers } = load("opt-out-list.json");
  const result = validateRecipient("+34600000001", opted_out_numbers);
  assert.equal(result.allowed, true);
});

test("TokenBucket: agota tokens y bloquea hasta que se rellena con el tiempo", () => {
  let now = 1000000;
  const bucket = new TokenBucket(2, 1, now); // capacidad 2, se rellena 1 token/segundo
  assert.equal(bucket.tryConsume(now).allowed, true);
  assert.equal(bucket.tryConsume(now).allowed, true);
  assert.equal(bucket.tryConsume(now).allowed, false, "el tercer intento inmediato debe ser rate_limited");
  now += 1000; // +1s -> +1 token
  assert.equal(bucket.tryConsume(now).allowed, true);
});

test("computeRetryDelayMs: crece exponencialmente y respeta el techo (maxMs), según retry-fixture.json", () => {
  const fixture = load("retry-fixture.json");
  for (const { attempt, expected_min_ms, expected_max_ms } of fixture.attempts) {
    const delay = computeRetryDelayMs(attempt, { baseMs: fixture.base_ms, maxMs: fixture.max_ms, jitterMs: fixture.jitter_ms });
    assert.ok(delay >= expected_min_ms && delay <= expected_max_ms, `attempt ${attempt}: ${delay}ms fuera de [${expected_min_ms},${expected_max_ms}]`);
  }
});

test("PROVIDER_FAILURE_CODES: rate limit es retryable, ventana cerrada NO lo es", () => {
  assert.equal(PROVIDER_FAILURE_CODES.RATE_LIMIT_HIT.retryable, true);
  assert.equal(PROVIDER_FAILURE_CODES.RE_ENGAGEMENT_WINDOW_CLOSED.retryable, false);
});

test("fixtures de fallo de proveedor coinciden en forma con PROVIDER_FAILURE_CODES", () => {
  const rateLimitFixture = load("provider-failure-rate-limit.json");
  assert.equal(rateLimitFixture.error.code, PROVIDER_FAILURE_CODES.RATE_LIMIT_HIT.code);
  const windowClosedFixture = load("provider-failure-window-closed.json");
  assert.equal(windowClosedFixture.error.code, PROVIDER_FAILURE_CODES.RE_ENGAGEMENT_WINDOW_CLOSED.code);
});

test("decideWhatsappSend: destinatario válido y sin duplicado -> send", () => {
  const store = new WhatsappDuplicateSendStore();
  const { opted_out_numbers } = load("opt-out-list.json");
  const decision = decideWhatsappSend(load("template-valid.json"), { optOutList: opted_out_numbers, dedupStore: store });
  assert.equal(decision.action, "send");
});

test("decideWhatsappSend: opt-out bloquea antes de considerar duplicado o rate limit", () => {
  const store = new WhatsappDuplicateSendStore();
  const { opted_out_numbers } = load("opt-out-list.json");
  const decision = decideWhatsappSend(load("recipient-opted-out.json"), { optOutList: opted_out_numbers, dedupStore: store });
  assert.equal(decision.action, "block_recipient");
});

test("decideWhatsappSend: duplicate-send.json (mismo idempotency_key que template-valid.json) -> skip_duplicate", () => {
  const store = new WhatsappDuplicateSendStore();
  const { opted_out_numbers } = load("opt-out-list.json");
  const first = decideWhatsappSend(load("template-valid.json"), { optOutList: opted_out_numbers, dedupStore: store });
  assert.equal(first.action, "send");
  const second = decideWhatsappSend(load("duplicate-send.json"), { optOutList: opted_out_numbers, dedupStore: store });
  assert.equal(second.action, "skip_duplicate");
});

test("decideWhatsappSend: rate limiter agotado bloquea el envío con rate_limited, no lo descarta silenciosamente", () => {
  const store = new WhatsappDuplicateSendStore();
  const { opted_out_numbers } = load("opt-out-list.json");
  const exhaustedBucket = new TokenBucket(0, 0); // 0 tokens, sin relleno
  const decision = decideWhatsappSend(load("template-valid.json"), { optOutList: opted_out_numbers, dedupStore: store, rateLimiter: exhaustedBucket });
  assert.equal(decision.action, "rate_limited");
  assert.equal(store.wasSent(load("template-valid.json").idempotency_key), false, "no debe marcarse como enviado si el rate limiter lo bloqueó");
});
