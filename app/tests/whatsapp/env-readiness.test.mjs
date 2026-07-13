import test from "node:test";
import assert from "node:assert/strict";
import { classifyWhatsappEnvReadiness } from "../../scripts/whatsapp/env-readiness.mjs";

const PREPROD_ENV = Object.freeze({
  WHATSAPP_ACCESS_TOKEN: `EAA${"A".repeat(50)}`,
  WHATSAPP_PHONE_NUMBER_ID: "109362958123456",
  WHATSAPP_BUSINESS_ACCOUNT_ID: "102938475612345",
  WHATSAPP_VERIFY_TOKEN: "a_shared_secret_chosen_by_the_team",
});

test("NOT_CONFIGURED cuando ninguna variable está presente", () => {
  const result = classifyWhatsappEnvReadiness({});
  assert.equal(result.status, "NOT_CONFIGURED");
  for (const check of Object.values(result.checks)) {
    assert.equal(check.present, false);
  }
});

test("NOT_CONFIGURED con valores vacíos o solo espacios", () => {
  const result = classifyWhatsappEnvReadiness({
    WHATSAPP_ACCESS_TOKEN: "",
    WHATSAPP_PHONE_NUMBER_ID: "   ",
    WHATSAPP_BUSINESS_ACCOUNT_ID: undefined,
    WHATSAPP_VERIFY_TOKEN: undefined,
  });
  assert.equal(result.status, "NOT_CONFIGURED");
});

test("PARTIAL_CONFIG cuando falta alguna variable pero las presentes son válidas", () => {
  const result = classifyWhatsappEnvReadiness({
    WHATSAPP_ACCESS_TOKEN: PREPROD_ENV.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: PREPROD_ENV.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_BUSINESS_ACCOUNT_ID: PREPROD_ENV.WHATSAPP_BUSINESS_ACCOUNT_ID,
  });
  assert.equal(result.status, "PARTIAL_CONFIG");
  assert.equal(result.checks.WHATSAPP_VERIFY_TOKEN.present, false);
});

test("PREPROD_READY cuando las 4 variables están presentes y con formato válido", () => {
  const result = classifyWhatsappEnvReadiness(PREPROD_ENV);
  assert.equal(result.status, "PREPROD_READY");
  for (const check of Object.values(result.checks)) {
    assert.equal(check.present, true);
    assert.equal(check.formatValid, true);
  }
});

test("INVALID_CONFIG cuando WHATSAPP_ACCESS_TOKEN no tiene el prefijo EAA esperado", () => {
  const result = classifyWhatsappEnvReadiness({ ...PREPROD_ENV, WHATSAPP_ACCESS_TOKEN: "not-a-meta-token-at-all-".repeat(3) });
  assert.equal(result.status, "INVALID_CONFIG");
  assert.equal(result.checks.WHATSAPP_ACCESS_TOKEN.reason, "expected_meta_access_token_format_EAA_prefix");
});

test("INVALID_CONFIG cuando WHATSAPP_PHONE_NUMBER_ID no es numérico", () => {
  const result = classifyWhatsappEnvReadiness({ ...PREPROD_ENV, WHATSAPP_PHONE_NUMBER_ID: "not-a-graph-api-id" });
  assert.equal(result.status, "INVALID_CONFIG");
  assert.equal(result.checks.WHATSAPP_PHONE_NUMBER_ID.reason, "expected_numeric_graph_api_id");
});

test("INVALID_CONFIG cuando WHATSAPP_BUSINESS_ACCOUNT_ID no es numérico", () => {
  const result = classifyWhatsappEnvReadiness({ ...PREPROD_ENV, WHATSAPP_BUSINESS_ACCOUNT_ID: "waba-not-numeric" });
  assert.equal(result.status, "INVALID_CONFIG");
  assert.equal(result.checks.WHATSAPP_BUSINESS_ACCOUNT_ID.reason, "expected_numeric_graph_api_id");
});

test("INVALID_CONFIG cuando WHATSAPP_VERIFY_TOKEN parece un access token de Meta (posible intercambio de valores)", () => {
  const result = classifyWhatsappEnvReadiness({ ...PREPROD_ENV, WHATSAPP_VERIFY_TOKEN: PREPROD_ENV.WHATSAPP_ACCESS_TOKEN });
  assert.equal(result.status, "INVALID_CONFIG");
  assert.equal(result.checks.WHATSAPP_VERIFY_TOKEN.reason, "looks_like_access_token_check_for_swapped_values");
});

test("INVALID_CONFIG cuando WHATSAPP_VERIFY_TOKEN contiene espacios", () => {
  const result = classifyWhatsappEnvReadiness({ ...PREPROD_ENV, WHATSAPP_VERIFY_TOKEN: "token con espacios raros" });
  assert.equal(result.status, "INVALID_CONFIG");
  assert.equal(result.checks.WHATSAPP_VERIFY_TOKEN.reason, "verify_token_should_not_contain_whitespace");
});

test("INVALID_CONFIG cuando un valor es sospechosamente corto", () => {
  const result = classifyWhatsappEnvReadiness({ ...PREPROD_ENV, WHATSAPP_VERIFY_TOKEN: "short" });
  assert.equal(result.status, "INVALID_CONFIG");
  assert.equal(result.checks.WHATSAPP_VERIFY_TOKEN.reason, "shorter_than_expected");
});

test("nunca expone el valor completo del secreto en el resultado", () => {
  const result = classifyWhatsappEnvReadiness(PREPROD_ENV);
  const serialized = JSON.stringify(result);
  for (const value of Object.values(PREPROD_ENV)) {
    assert.equal(serialized.includes(value), false, `el resultado no debe contener el valor completo de ${value}`);
  }
});
