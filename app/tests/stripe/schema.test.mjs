import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateAgainstSchema } from "../../scripts/make-qa/schema-validator.mjs";
import { MockStripeCheckoutStore } from "../../worker-reservas/payments/stripe-adapter.mock.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");
const FIXTURES = path.join(APP_ROOT, "fixtures/stripe");
const EVENT_SCHEMA = JSON.parse(readFileSync(path.join(APP_ROOT, "schemas/stripe/stripe-webhook-event.schema.json"), "utf8"));
const SESSION_SCHEMA = JSON.parse(readFileSync(path.join(APP_ROOT, "schemas/stripe/checkout-session.schema.json"), "utf8"));

function load(name) {
  // eslint-disable-next-line no-unused-vars
  const { _why, ...fixture } = JSON.parse(readFileSync(path.join(FIXTURES, name), "utf8"));
  return fixture;
}

for (const name of ["01-checkout-session-completed.json", "02-checkout-session-expired.json", "03-payment-intent-succeeded.json", "04-payment-intent-payment-failed.json", "05-charge-refunded.json", "06-duplicate-of-checkout-completed.json", "09-wrong-tenant.json", "10-wrong-user.json", "11-invalid-signature-source-event.json"]) {
  test(`${name} cumple el contrato de evento Stripe multi-tenant`, () => {
    const result = validateAgainstSchema(EVENT_SCHEMA, load(name));
    assert.equal(result.valid, true, JSON.stringify(result.errors));
  });
}

test("08-missing-metadata.json VIOLA el contrato (booking_id y payment_reference obligatorios)", () => {
  const result = validateAgainstSchema(EVENT_SCHEMA, load("08-missing-metadata.json"));
  assert.equal(result.valid, false);
});

test("07-replay-old-timestamp.json: el evento embebido cumple el contrato una vez extraído del envoltorio", () => {
  const fixture = load("07-replay-old-timestamp.json");
  const result = validateAgainstSchema(EVENT_SCHEMA, fixture.event);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("livemode:true siempre viola el contrato — ningún fixture de esta suite puede parecer un evento real", () => {
  const event = load("01-checkout-session-completed.json");
  const tampered = { ...event, livemode: true };
  const result = validateAgainstSchema(EVENT_SCHEMA, tampered);
  assert.equal(result.valid, false);
});

test("tipo de evento fuera del enum soportado viola el contrato", () => {
  const event = load("01-checkout-session-completed.json");
  const tampered = { ...event, type: "customer.subscription.deleted" };
  const result = validateAgainstSchema(EVENT_SCHEMA, tampered);
  assert.equal(result.valid, false);
});

test("MockStripeCheckoutStore#createCheckoutSession produce una sesión que cumple el contrato de schema", () => {
  const store = new MockStripeCheckoutStore();
  const session = store.createCheckoutSession({
    tenantId: "tnt_qacp04_test",
    clientId: "clt_qacp04_test",
    userId: "usr_qacp04_test",
    bookingId: "bkg_qacp04_9001",
    amount: 2500,
    successUrl: "https://club-padel-04.pages.dev/pago/ok",
    cancelUrl: "https://club-padel-04.pages.dev/pago/cancelado",
  });
  const result = validateAgainstSchema(SESSION_SCHEMA, session);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});
