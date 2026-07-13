import test from "node:test";
import assert from "node:assert/strict";
import { classifyStripeEnvReadiness } from "../../scripts/stripe/env-readiness.mjs";

const SANDBOX_ENV = Object.freeze({
  STRIPE_SECRET_KEY: "sk_test_STRIPE_TEST_SECRET_PLACEHOLDER",
  STRIPE_WEBHOOK_SECRET: "whsec_STRIPE_WEBHOOK_SECRET_PLACEHOLDER",
  STRIPE_PUBLISHABLE_KEY: "pk_test_STRIPE_TEST_PUBLIC_PLACEHOLDER",
});

test("NOT_CONFIGURED cuando ninguna variable está presente", () => {
  const result = classifyStripeEnvReadiness({});
  assert.equal(result.status, "NOT_CONFIGURED");
  for (const check of Object.values(result.checks)) {
    assert.equal(check.present, false);
  }
});

test("NOT_CONFIGURED con valores vacíos o solo espacios (no cuentan como presentes)", () => {
  const result = classifyStripeEnvReadiness({
    STRIPE_SECRET_KEY: "",
    STRIPE_WEBHOOK_SECRET: "   ",
    STRIPE_PUBLISHABLE_KEY: undefined,
  });
  assert.equal(result.status, "NOT_CONFIGURED");
});

test("PARTIAL_CONFIG cuando falta alguna variable pero las presentes son válidas", () => {
  const result = classifyStripeEnvReadiness({
    STRIPE_SECRET_KEY: SANDBOX_ENV.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: SANDBOX_ENV.STRIPE_WEBHOOK_SECRET,
  });
  assert.equal(result.status, "PARTIAL_CONFIG");
  assert.equal(result.checks.STRIPE_PUBLISHABLE_KEY.present, false);
});

test("SANDBOX_READY cuando las tres variables están presentes y con formato de test mode", () => {
  const result = classifyStripeEnvReadiness(SANDBOX_ENV);
  assert.equal(result.status, "SANDBOX_READY");
  for (const check of Object.values(result.checks)) {
    assert.equal(check.present, true);
    assert.equal(check.formatValid, true);
  }
});

test("INVALID_CONFIG cuando una clave live se detecta (STRIPE_SECRET_KEY)", () => {
  const result = classifyStripeEnvReadiness({
    ...SANDBOX_ENV,
    STRIPE_SECRET_KEY: "sk_live_STRIPE_LIVE_SECRET_PLACEHOLDER",
  });
  assert.equal(result.status, "INVALID_CONFIG");
  assert.equal(result.checks.STRIPE_SECRET_KEY.reason, "live_key_detected_test_mode_required");
});

test("INVALID_CONFIG cuando una clave live se detecta (STRIPE_PUBLISHABLE_KEY)", () => {
  const result = classifyStripeEnvReadiness({
    ...SANDBOX_ENV,
    STRIPE_PUBLISHABLE_KEY: "pk_live_STRIPE_LIVE_PUBLIC_PLACEHOLDER",
  });
  assert.equal(result.status, "INVALID_CONFIG");
  assert.equal(result.checks.STRIPE_PUBLISHABLE_KEY.reason, "live_key_detected_test_mode_required");
});

test("INVALID_CONFIG cuando el prefijo no corresponde a Stripe en absoluto", () => {
  const result = classifyStripeEnvReadiness({
    ...SANDBOX_ENV,
    STRIPE_SECRET_KEY: "not-a-stripe-key-at-all",
  });
  assert.equal(result.status, "INVALID_CONFIG");
  assert.equal(result.checks.STRIPE_SECRET_KEY.formatValid, false);
});

test("INVALID_CONFIG cuando el valor es sospechosamente corto (posible truncado/placeholder)", () => {
  const result = classifyStripeEnvReadiness({
    ...SANDBOX_ENV,
    STRIPE_WEBHOOK_SECRET: "whsec_x",
  });
  assert.equal(result.status, "INVALID_CONFIG");
  assert.equal(result.checks.STRIPE_WEBHOOK_SECRET.reason, "shorter_than_expected");
});

test("nunca expone el valor completo del secreto en el resultado", () => {
  const result = classifyStripeEnvReadiness(SANDBOX_ENV);
  const serialized = JSON.stringify(result);
  for (const value of Object.values(SANDBOX_ENV)) {
    assert.equal(serialized.includes(value), false, `el resultado no debe contener el valor completo de ${value}`);
  }
});
