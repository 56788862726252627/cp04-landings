import { test } from "node:test";
import assert from "node:assert/strict";

import { validateCheckoutSessionParams, validateRefundParams, validateWhatsAppTemplateParams, validateWhatsAppTextParams } from "./commercialSchemas.js";
import { sampleCheckoutSessionParams, sampleRefundParams, sampleWhatsAppTemplateParams, sampleWhatsAppTextParams } from "./commercialFixtures.js";

test("validateCheckoutSessionParams acepta unos params válidos", () => {
  assert.deepEqual(validateCheckoutSessionParams(sampleCheckoutSessionParams()), { valid: true, errors: [] });
});

test("validateCheckoutSessionParams rechaza amountMinorUnits no entero/negativo, currency desconocida, URLs no https", () => {
  const { valid, errors } = validateCheckoutSessionParams(sampleCheckoutSessionParams({ amountMinorUnits: -1, currency: "xyz", successUrl: "http://inseguro", cancelUrl: "no-es-url" }));
  assert.equal(valid, false);
  assert.equal(errors.length, 4);
});

test("validateCheckoutSessionParams rechaza params no-objeto sin lanzar", () => {
  assert.equal(validateCheckoutSessionParams(null).valid, false);
  assert.equal(validateCheckoutSessionParams("x").valid, false);
});

test("validateRefundParams acepta un paymentIntentId válido, con y sin amountMinorUnits", () => {
  assert.equal(validateRefundParams(sampleRefundParams()).valid, true);
  assert.equal(validateRefundParams({ paymentIntentId: "pi_x" }).valid, true);
});

test("validateRefundParams rechaza un id sin prefijo pi_ y un amount inválido", () => {
  assert.equal(validateRefundParams({ paymentIntentId: "ch_x" }).valid, false);
  assert.equal(validateRefundParams({ paymentIntentId: "pi_x", amountMinorUnits: -5 }).valid, false);
});

test("validateWhatsAppTemplateParams acepta unos params válidos", () => {
  assert.deepEqual(validateWhatsAppTemplateParams(sampleWhatsAppTemplateParams()), { valid: true, errors: [] });
});

test("validateWhatsAppTemplateParams rechaza un teléfono no E.164 y un languageCode inválido", () => {
  const { valid, errors } = validateWhatsAppTemplateParams(sampleWhatsAppTemplateParams({ toPhoneE164: "600000001", languageCode: "spanish" }));
  assert.equal(valid, false);
  assert.equal(errors.length, 2);
});

test("validateWhatsAppTextParams acepta unos params válidos y rechaza cuerpo vacío o demasiado largo", () => {
  assert.equal(validateWhatsAppTextParams(sampleWhatsAppTextParams()).valid, true);
  assert.equal(validateWhatsAppTextParams(sampleWhatsAppTextParams({ body: "" })).valid, false);
  assert.equal(validateWhatsAppTextParams(sampleWhatsAppTextParams({ body: "x".repeat(4097) })).valid, false);
});
