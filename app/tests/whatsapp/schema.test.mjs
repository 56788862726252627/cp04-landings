import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateAgainstSchema } from "../../scripts/make-qa/schema-validator.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");
const FIXTURES = path.join(APP_ROOT, "fixtures/whatsapp");
const MESSAGE_SCHEMA = JSON.parse(readFileSync(path.join(APP_ROOT, "schemas/whatsapp/template-message-request.schema.json"), "utf8"));
const CONSENT_SCHEMA = JSON.parse(readFileSync(path.join(APP_ROOT, "schemas/whatsapp/consent-event.schema.json"), "utf8"));

function load(relPath) {
  const { _why, ...fixture } = JSON.parse(readFileSync(path.join(FIXTURES, relPath), "utf8"));
  return fixture;
}

const VALID_TEMPLATE_FIXTURES = [
  "templates/01-booking-confirmed.json",
  "templates/02-booking-cancelled.json",
  "templates/03-booking-rescheduled.json",
  "templates/04-reminder-24h.json",
  "templates/05-reminder-2h.json",
  "templates/06-tournament-update.json",
  "templates/07-waitlist-slot-available.json",
  "templates/08-incident-notice.json",
  "templates/09-faq-response.json",
  "templates/10-opt-out-ack.json",
];

for (const relPath of VALID_TEMPLATE_FIXTURES) {
  test(`${relPath} cumple el contrato de envoltorio de mensaje de plantilla`, () => {
    const result = validateAgainstSchema(MESSAGE_SCHEMA, load(relPath));
    assert.equal(result.valid, true, JSON.stringify(result.errors));
  });
}

test("negative/missing-variable.json cumple el schema de envoltorio (el fallo es de negocio, no de forma)", () => {
  const result = validateAgainstSchema(MESSAGE_SCHEMA, load("negative/missing-variable.json"));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("negative/wrong-locale.json VIOLA el schema (language fuera de enum)", () => {
  const result = validateAgainstSchema(MESSAGE_SCHEMA, load("negative/wrong-locale.json"));
  assert.equal(result.valid, false);
});

test("negative/unsupported-template.json VIOLA el schema (template_name fuera de enum)", () => {
  const result = validateAgainstSchema(MESSAGE_SCHEMA, load("negative/unsupported-template.json"));
  assert.equal(result.valid, false);
});

test("negative/malformed-payload-schema-violation.json VIOLA el schema (variables debería ser objeto, falta idempotency_key)", () => {
  const result = validateAgainstSchema(MESSAGE_SCHEMA, load("negative/malformed-payload-schema-violation.json"));
  assert.equal(result.valid, false);
});

test("negative/malformed-payload.raw.txt no es JSON parseable", () => {
  const raw = readFileSync(path.join(FIXTURES, "negative/malformed-payload.raw.txt"), "utf8");
  assert.throws(() => JSON.parse(raw));
});

test("consent/opt-in.json cumple el contrato de evento de consentimiento", () => {
  const result = validateAgainstSchema(CONSENT_SCHEMA, load("consent/opt-in.json"));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("consent/opt-out.json cumple el contrato de evento de consentimiento", () => {
  const result = validateAgainstSchema(CONSENT_SCHEMA, load("consent/opt-out.json"));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("consent/resubscribe.json cumple el contrato de evento de consentimiento", () => {
  const result = validateAgainstSchema(CONSENT_SCHEMA, load("consent/resubscribe.json"));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("un evento opt_in con phone fuera de formato E.164 viola el schema", () => {
  const tampered = { ...load("consent/opt-in.json"), phone: "600000020" };
  const result = validateAgainstSchema(CONSENT_SCHEMA, tampered);
  assert.equal(result.valid, false);
});
