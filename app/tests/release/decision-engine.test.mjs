import test from "node:test";
import assert from "node:assert/strict";
import { decideRelease } from "../../scripts/release/decision-engine.mjs";

const PASS = { status: "PASS", reasons: ["ok"] };
const NOT_APPLICABLE = { status: "NOT_APPLICABLE", reasons: ["na"] };

function allGreenGates(overrides = {}) {
  return {
    configValid: PASS,
    brandingValid: PASS,
    integrationsValid: PASS,
    securityValid: PASS,
    qaValid: PASS,
    backupReady: PASS,
    observabilityReady: PASS,
    goLiveApproved: PASS,
    stripeReady: NOT_APPLICABLE,
    whatsappReady: NOT_APPLICABLE,
    airtableStable: PASS,
    makeQaThreshold: PASS,
    ...overrides,
  };
}

test("staging promotion: todos los gates en PASS/NOT_APPLICABLE en STAGING -> ALLOW", () => {
  const decision = decideRelease({ environment: "STAGING", gates: allGreenGates() });
  assert.equal(decision.verdict, "ALLOW");
});

test("staging promotion: backup no confirmado en STAGING no bloquea (solo WARN) -> sigue ALLOW o WARN, nunca BLOCK", () => {
  const decision = decideRelease({ environment: "STAGING", gates: allGreenGates({ backupReady: { status: "UNKNOWN", reasons: ["sin datos"] } }) });
  assert.notEqual(decision.verdict, "BLOCK");
});

test("production denial: SECURITY_VALID=FAIL bloquea PRODUCTION sin importar el resto de gates", () => {
  const decision = decideRelease({ environment: "PRODUCTION", gates: allGreenGates({ securityValid: { status: "FAIL", reasons: ["P0 abierto"] } }) });
  assert.equal(decision.verdict, "BLOCK");
  assert.ok(decision.findings.some((f) => f.gate === "SECURITY_VALID"));
});

test("production denial: BACKUP_READY no PASS bloquea PRODUCTION ('backup unavailable => BLOCK production')", () => {
  const decision = decideRelease({ environment: "PRODUCTION", gates: allGreenGates({ backupReady: { status: "BLOCKED", reasons: ["gaps P0"] } }) });
  assert.equal(decision.verdict, "BLOCK");
  assert.ok(decision.findings.some((f) => f.gate === "BACKUP_READY"));
});

test("production denial: STRIPE_READY=BLOCKED (payments habilitado sin credenciales) bloquea PRODUCTION", () => {
  const decision = decideRelease({ environment: "PRODUCTION", gates: allGreenGates({ stripeReady: { status: "BLOCKED", reasons: ["sin config"] }, goLiveApproved: PASS }) });
  assert.equal(decision.verdict, "BLOCK");
});

test("production denial: AIRTABLE_STABLE=BLOCKED (cuota agotada) bloquea PRODUCTION", () => {
  const decision = decideRelease({ environment: "PRODUCTION", gates: allGreenGates({ airtableStable: { status: "BLOCKED", reasons: ["quota exhausted"] } }) });
  assert.equal(decision.verdict, "BLOCK");
});

test("human approval: PRODUCTION con todo en verde pero sin GO_LIVE_APPROVED -> HUMAN_APPROVAL_REQUIRED, no BLOCK ni ALLOW", () => {
  const decision = decideRelease({ environment: "PRODUCTION", gates: allGreenGates({ goLiveApproved: { status: "PENDING", reasons: ["sin aprobar"] } }) });
  assert.equal(decision.verdict, "HUMAN_APPROVAL_REQUIRED");
});

test("human approval: STAGING nunca exige GO_LIVE_APPROVED (gate exclusivo de PRODUCTION)", () => {
  const decision = decideRelease({ environment: "STAGING", gates: allGreenGates({ goLiveApproved: { status: "PENDING", reasons: ["sin aprobar"] } }) });
  assert.equal(decision.verdict, "ALLOW");
});

test("production denial: BLOCK tiene prioridad sobre HUMAN_APPROVAL_REQUIRED cuando ambos aplican", () => {
  const decision = decideRelease({
    environment: "PRODUCTION",
    gates: allGreenGates({ securityValid: { status: "FAIL", reasons: ["P0"] }, goLiveApproved: { status: "PENDING", reasons: ["sin aprobar"] } }),
  });
  assert.equal(decision.verdict, "BLOCK");
});

test("gate evaluation: WARN se propaga cuando no hay ningún BLOCK/HUMAN_APPROVAL_REQUIRED", () => {
  const decision = decideRelease({ environment: "STAGING", gates: allGreenGates({ makeQaThreshold: { status: "WARN", reasons: ["cerca del umbral"] } }) });
  assert.equal(decision.verdict, "WARN");
});

// --- T13 (ampliación de alcance): 4 gates nuevos, aditivo ---

test("ampliación T13: los 12 tests originales siguen sin ver los 4 gates nuevos (allGreenGates no los incluye) -> comportamiento idéntico a antes de T13", () => {
  const decision = decideRelease({ environment: "PRODUCTION", gates: allGreenGates({ goLiveApproved: PASS }) });
  assert.equal(decision.verdict, "ALLOW");
});

test("ampliación T13: TENANT_VALID=FAIL bloquea en cualquier entorno", () => {
  const decision = decideRelease({ environment: "STAGING", gates: allGreenGates({ tenantValid: { status: "FAIL", reason: "tenantId duplicado" } }) });
  assert.equal(decision.verdict, "BLOCK");
  assert.ok(decision.findings.some((f) => f.gate === "TENANT_VALID"));
});

test("ampliación T13: TENANT_VALID=PASS no introduce ningún finding -> ALLOW", () => {
  const decision = decideRelease({ environment: "STAGING", gates: allGreenGates({ tenantValid: { status: "PASS", reason: "ok" } }) });
  assert.equal(decision.verdict, "ALLOW");
});

test("ampliación T13: FRONTEND_BUILD_VALID=FAIL bloquea PRODUCTION", () => {
  const decision = decideRelease({
    environment: "PRODUCTION",
    gates: allGreenGates({ goLiveApproved: PASS, frontendBuildValid: { status: "FAIL", reason: "vite build falló" } }),
  });
  assert.equal(decision.verdict, "BLOCK");
  assert.ok(decision.findings.some((f) => f.gate === "FRONTEND_BUILD_VALID"));
});

test("ampliación T13: RELEASE_MANIFEST_VALID=FAIL bloquea en cualquier entorno", () => {
  const decision = decideRelease({ environment: "STAGING", gates: allGreenGates({ releaseManifestValid: { status: "FAIL", reason: "schema inválido" } }) });
  assert.equal(decision.verdict, "BLOCK");
  assert.ok(decision.findings.some((f) => f.gate === "RELEASE_MANIFEST_VALID"));
});

test("ampliación T13: PWA_VALID critical=true FAIL bloquea PRODUCTION", () => {
  const decision = decideRelease({
    environment: "PRODUCTION",
    gates: allGreenGates({ goLiveApproved: PASS, pwaValid: { status: "FAIL", critical: true, reason: "manifest ausente" } }),
  });
  assert.equal(decision.verdict, "BLOCK");
  assert.ok(decision.findings.some((f) => f.gate === "PWA_VALID"));
});

test("ampliación T13: PWA_VALID critical=true FAIL en STAGING no bloquea (solo WARN, PRODUCTION-only)", () => {
  const decision = decideRelease({ environment: "STAGING", gates: allGreenGates({ pwaValid: { status: "FAIL", critical: true, reason: "manifest ausente" } }) });
  assert.notEqual(decision.verdict, "BLOCK");
});

test("ampliación T13: PWA_VALID critical=false FAIL nunca bloquea, ni en PRODUCTION (solo WARN)", () => {
  const decision = decideRelease({
    environment: "PRODUCTION",
    gates: allGreenGates({ goLiveApproved: PASS, pwaValid: { status: "FAIL", critical: false, reason: "heurística sin confirmar" } }),
  });
  assert.notEqual(decision.verdict, "BLOCK");
});

test("ampliación T13: UNVERIFIED de un gate nuevo bloquea en entorno con datos reales (mismo principio SIN_DATOS que el resto del sistema)", () => {
  const decision = decideRelease({
    environment: "PRODUCTION",
    gates: allGreenGates({ goLiveApproved: PASS, tenantValid: { status: "UNVERIFIED", reason: "sin registro cargado" } }),
  });
  assert.equal(decision.verdict, "BLOCK");
});

test("ampliación T13: UNVERIFIED de un gate nuevo en STAGING no bloquea (solo WARN)", () => {
  const decision = decideRelease({ environment: "STAGING", gates: allGreenGates({ tenantValid: { status: "UNVERIFIED", reason: "sin registro cargado" } }) });
  assert.notEqual(decision.verdict, "BLOCK");
  assert.equal(decision.verdict, "WARN");
});

test("ampliación T13: NOT_REQUIRED de un gate nuevo nunca genera finding -> ALLOW", () => {
  const decision = decideRelease({ environment: "LOCAL", gates: allGreenGates({ tenantValid: { status: "NOT_REQUIRED", reason: "LOCAL" } }) });
  assert.equal(decision.verdict, "ALLOW");
});
