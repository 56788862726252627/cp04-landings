import test from "node:test";
import assert from "node:assert/strict";
import { evaluateWhatsappReady } from "../../../scripts/release/gates/whatsapp-ready.mjs";

test("optional WhatsApp: messaging.enabled=false -> NOT_APPLICABLE, nunca BLOCK (regla exacta de la misión)", () => {
  const result = evaluateWhatsappReady({ env: {}, messagingEnabled: false, evidenceRef: "x" });
  assert.equal(result.status, "NOT_APPLICABLE");
});

test("WhatsApp requerido: messaging.enabled=true sin variables -> BLOCKED", () => {
  const result = evaluateWhatsappReady({ env: {}, messagingEnabled: true, evidenceRef: "x" });
  assert.equal(result.status, "BLOCKED");
});

test("WhatsApp requerido: messaging.enabled=true con variables presentes -> PASS", () => {
  const env = { WHATSAPP_CLOUD_API_TOKEN: "token-x", WHATSAPP_PHONE_NUMBER_ID: "123456" };
  const result = evaluateWhatsappReady({ env, messagingEnabled: true, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});
