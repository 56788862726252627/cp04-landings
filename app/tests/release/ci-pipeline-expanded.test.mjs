import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  EXPANDED_PIPELINE_STEPS,
  runFrontendReadinessStep,
  runPwaReadinessStep,
  runTenantValidationStep,
  runReleaseManifestValidationStep,
  runExpandedReleaseGateStep,
  buildArtifactSummaryFinal,
  runExpandedPipeline,
} from "../../scripts/release/ci/pipeline.mjs";
import { repoPath } from "../../src/config/paths.js";

const validRegistry = JSON.parse(readFileSync(repoPath("config", "tenant-registry.example.valid.json"), "utf8"));
const validManifest = JSON.parse(readFileSync(repoPath("fixtures", "release", "release-manifest.example.valid-staging.json"), "utf8"));
const invalidManifest = JSON.parse(readFileSync(repoPath("fixtures", "release", "release-manifest.example.invalid-production-no-approval.json"), "utf8"));

function fakeRunCommand() {
  return { code: 0, stdout: "ℹ tests 0\nℹ pass 0\nℹ fail 0\n", stderr: "" };
}

test("EXPANDED_PIPELINE_STEPS: 10 originales + 6 nuevos = 16", () => {
  assert.equal(EXPANDED_PIPELINE_STEPS.length, 16);
});

test("frontend_readiness: sin buildStepResult -> WARN (UNVERIFIED del gate se mapea a WARN de paso)", () => {
  const result = runFrontendReadinessStep({});
  assert.equal(result.step, "frontend_readiness");
  assert.equal(result.status, "WARN");
});

test("frontend_readiness: build real OK -> PASS", () => {
  const result = runFrontendReadinessStep({ buildStepResult: { step: "build", status: "PASS", summary: "vite build OK" } });
  assert.equal(result.status, "PASS");
});

test("frontend_readiness: build real falló -> FAIL", () => {
  const result = runFrontendReadinessStep({ buildStepResult: { step: "build", status: "FAIL", summary: "error" } });
  assert.equal(result.status, "FAIL");
});

test("pwa_readiness: manifest y service worker reales del repo -> PASS", () => {
  const result = runPwaReadinessStep({});
  assert.equal(result.step, "pwa_readiness");
  assert.equal(result.status, "PASS");
});

test("pwa_readiness: manifestPath inexistente -> FAIL (crítico)", () => {
  const result = runPwaReadinessStep({ manifestPath: "/no/existe/nunca/manifest.webmanifest" });
  assert.equal(result.status, "FAIL");
});

test("tenant_validation: LOCAL -> PASS (NOT_REQUIRED se mapea a PASS de paso)", () => {
  const result = runTenantValidationStep({ environment: "LOCAL" });
  assert.equal(result.step, "tenant_validation");
  assert.equal(result.status, "PASS");
});

test("tenant_validation: STAGING con registro real válido -> PASS", () => {
  const result = runTenantValidationStep({ environment: "STAGING", tenantRegistry: validRegistry });
  assert.equal(result.status, "PASS");
});

test("tenant_validation: STAGING sin registro -> WARN (UNVERIFIED)", () => {
  const result = runTenantValidationStep({ environment: "STAGING" });
  assert.equal(result.status, "WARN");
});

test("release_manifest_validation: manifest válido -> PASS", () => {
  const result = runReleaseManifestValidationStep({ manifest: validManifest });
  assert.equal(result.step, "release_manifest_validation");
  assert.equal(result.status, "PASS");
});

test("release_manifest_validation: manifest de producción sin approved_by -> FAIL", () => {
  const result = runReleaseManifestValidationStep({ manifest: invalidManifest });
  assert.equal(result.status, "FAIL");
});

test("release_manifest_validation: sin manifest -> WARN (UNVERIFIED)", () => {
  const result = runReleaseManifestValidationStep({});
  assert.equal(result.status, "WARN");
});

test("expanded_release_gate: 16 gates en verde -> PASS", () => {
  const PASS = { status: "PASS", reasons: ["ok"] };
  const gates = {
    configValid: PASS, brandingValid: PASS, integrationsValid: PASS, securityValid: PASS, qaValid: PASS,
    backupReady: PASS, observabilityReady: PASS, goLiveApproved: PASS,
    stripeReady: { status: "NOT_APPLICABLE" }, whatsappReady: { status: "NOT_APPLICABLE" },
    airtableStable: PASS, makeQaThreshold: PASS,
    tenantValid: { status: "PASS", reason: "ok" }, frontendBuildValid: { status: "PASS", reason: "ok" },
    pwaValid: { status: "PASS", critical: false, reason: "ok" }, releaseManifestValid: { status: "PASS", reason: "ok" },
  };
  const result = runExpandedReleaseGateStep({ environment: "STAGING", gates });
  assert.equal(result.step, "expanded_release_gate");
  assert.equal(result.status, "PASS");
});

test("expanded_release_gate: TENANT_VALID=FAIL bloquea -> FAIL de paso", () => {
  const result = runExpandedReleaseGateStep({ environment: "STAGING", gates: { tenantValid: { status: "FAIL", reason: "duplicado" } } });
  assert.equal(result.status, "FAIL");
});

test("buildArtifactSummaryFinal: overall=FAIL si algún paso de los 16 falló", () => {
  const summary = buildArtifactSummaryFinal([{ step: "a", status: "PASS" }, { step: "b", status: "FAIL" }]);
  assert.equal(summary.overall, "FAIL");
});

test("runExpandedPipeline: reutiliza runPipeline() por dentro (comandos fake, nunca toca red/npm real) y produce 16 pasos", () => {
  const summary = runExpandedPipeline({ runCommand: fakeRunCommand, environment: "TEST", write: false });
  assert.equal(summary.steps.length, 16);
  assert.deepEqual(summary.steps.map((s) => s.step), EXPANDED_PIPELINE_STEPS);
});

test("runExpandedPipeline: última entrada es artifact_summary_final", () => {
  const summary = runExpandedPipeline({ runCommand: fakeRunCommand, environment: "TEST", write: false });
  assert.equal(summary.steps.at(-1).step, "artifact_summary_final");
});
