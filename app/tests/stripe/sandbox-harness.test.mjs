// FASE 7 (cierre técnico 2026-07-10) — cobertura de
// scripts/stripe/sandbox-harness.mjs (runSandboxHarnessForFixture), el CLI
// sin red que ejercita fixtures reales de fixtures/stripe/ end-to-end
// contra el harness completo (FASE 1). Cero llamadas de red en todo el test.
import test from "node:test";
import assert from "node:assert/strict";
import { runSandboxHarnessForFixture } from "../../scripts/stripe/sandbox-harness.mjs";

const ALL_FIXTURES_WITH_EXPECTATION = [
  ["01-checkout-session-completed.json", "PROCESSED"],
  ["02-checkout-session-expired.json", "PROCESSED"],
  ["03-payment-intent-succeeded.json", "PROCESSED"],
  ["04-payment-intent-payment-failed.json", "PROCESSED"],
  ["05-charge-refunded.json", "PROCESSED"],
  ["06-duplicate-of-checkout-completed.json", "DUPLICATE"],
  ["07-replay-old-timestamp.json", "INVALID_SIGNATURE"],
  ["08-missing-metadata.json", "MISSING_METADATA"],
  ["09-wrong-tenant.json", "WRONG_TENANT"],
  ["10-wrong-user.json", "WRONG_TENANT"],
  ["11-invalid-signature-source-event.json", "INVALID_SIGNATURE"],
  ["12-malformed-payload.raw.txt", "PERMANENT_FAILURE"],
  ["13-missing-tenant-in-metadata.json", "WRONG_TENANT"],
  ["14-cross-tenant-metadata-mismatch.json", "WRONG_TENANT"],
  ["15-unknown-event-type.json", "PROCESSED"],
];

for (const [fixtureFileName, expected] of ALL_FIXTURES_WITH_EXPECTATION) {
  test(`sandbox harness: ${fixtureFileName} clasifica ${expected}`, async () => {
    const outcome = await runSandboxHarnessForFixture(fixtureFileName);
    assert.equal(outcome.result.classification, expected, JSON.stringify(outcome.result));
  });
}

test("sandbox harness: acepta nombre corto (prefijo) además del nombre completo del fixture", async () => {
  const outcome = await runSandboxHarnessForFixture("01");
  assert.equal(outcome.fixtureFileName, "01-checkout-session-completed.json");
  assert.equal(outcome.result.classification, "PROCESSED");
});

test("sandbox harness: fixture desconocido rechaza con error explícito (pista de --list en el mensaje)", async () => {
  await assert.rejects(() => runSandboxHarnessForFixture("no-existe-este-fixture"), /no reconocida/);
});

test("sandbox harness: 15-unknown-event-type.json no ejecuta ningún side-effect (tipo no soportado, acuse sin negocio)", async () => {
  const outcome = await runSandboxHarnessForFixture("15-unknown-event-type.json");
  assert.equal(outcome.sideEffectCalls.length, 0);
});

test("sandbox harness: simulateFailureFor permite ejercitar RETRYABLE_FAILURE sobre un fixture PROCESSED por defecto", async () => {
  const outcome = await runSandboxHarnessForFixture("03-payment-intent-succeeded.json", { simulateFailureFor: { markBookingPaid: "retryable" } });
  assert.equal(outcome.result.classification, "RETRYABLE_FAILURE");
});

test("sandbox harness: el resultado nunca expone rawBody ni signatureHeader (invariante de sanitización del propio CLI)", async () => {
  const outcome = await runSandboxHarnessForFixture("01");
  assert.equal("rawBody" in outcome.result, false);
  assert.equal("signatureHeader" in outcome.result, false);
});
