import test from "node:test";
import assert from "node:assert/strict";
import { evaluateStripeReady } from "../../../scripts/release/gates/stripe-ready.mjs";

test("optional Stripe: payments.enabled=false -> NOT_APPLICABLE, nunca BLOCK (regla exacta de la misión)", () => {
  const result = evaluateStripeReady({ env: {}, paymentsEnabled: false, environment: "PRODUCTION", evidenceRef: "x" });
  assert.equal(result.status, "NOT_APPLICABLE");
});

test("mandatory Stripe: payments.enabled=true y sin ninguna variable -> BLOCKED", () => {
  const result = evaluateStripeReady({ env: {}, paymentsEnabled: true, environment: "STAGING", evidenceRef: "x" });
  assert.equal(result.status, "BLOCKED");
});

test("mandatory Stripe: payments.enabled=true con claves sk_test_/pk_test_/whsec_ válidas en STAGING -> PASS", () => {
  const env = {
    STRIPE_SECRET_KEY: `sk_test_${"a".repeat(20)}`,
    STRIPE_WEBHOOK_SECRET: `whsec_${"b".repeat(16)}`,
    STRIPE_PUBLISHABLE_KEY: `pk_test_${"c".repeat(20)}`,
  };
  const result = evaluateStripeReady({ env, paymentsEnabled: true, environment: "STAGING", evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("mandatory Stripe: claves sk_test_ (SANDBOX_READY) en PRODUCTION no bastan -> BLOCKED, exige LIVE", () => {
  const env = {
    STRIPE_SECRET_KEY: `sk_test_${"a".repeat(20)}`,
    STRIPE_WEBHOOK_SECRET: `whsec_${"b".repeat(16)}`,
    STRIPE_PUBLISHABLE_KEY: `pk_test_${"c".repeat(20)}`,
  };
  const result = evaluateStripeReady({ env, paymentsEnabled: true, environment: "PRODUCTION", evidenceRef: "x" });
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.reasons[0].includes("SANDBOX_READY"));
});

test("mandatory Stripe: clave live_ detectada en modo test -> BLOCKED (INVALID_CONFIG)", () => {
  const env = {
    STRIPE_SECRET_KEY: `sk_live_${"a".repeat(20)}`,
    STRIPE_WEBHOOK_SECRET: `whsec_${"b".repeat(16)}`,
    STRIPE_PUBLISHABLE_KEY: `pk_test_${"c".repeat(20)}`,
  };
  const result = evaluateStripeReady({ env, paymentsEnabled: true, environment: "STAGING", evidenceRef: "x" });
  assert.equal(result.status, "BLOCKED");
});
