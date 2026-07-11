import test from "node:test";
import assert from "node:assert/strict";
import {
  runInstallStep,
  runLintStep,
  runBuildStep,
  runSchemaValidationStep,
  runManifestValidationStep,
  runDependencyReadinessStep,
  runReleaseGateStep,
  buildArtifactSummary,
  runPipeline,
} from "../../scripts/release/ci/pipeline.mjs";

// Fake runCommand: NUNCA ejecuta npm/node real — evita tocar red/disco/recursión
// dentro de la propia suite de tests (ver audit/release-engineering/06_CI_PIPELINE.md).
function fakeRunCommand(code, { stdout = "", stderr = "" } = {}) {
  return () => ({ code, stdout, stderr });
}

test("install (dry-run): node_modules presente en este repo -> PASS", () => {
  const result = runInstallStep({ execute: false });
  assert.equal(result.status, "PASS");
});

test("install (execute con comando fake exitoso) -> PASS", () => {
  const result = runInstallStep({ execute: true, runCommand: fakeRunCommand(0) });
  assert.equal(result.status, "PASS");
});

test("install (execute con comando fake fallido) -> FAIL", () => {
  const result = runInstallStep({ execute: true, runCommand: fakeRunCommand(1, { stderr: "network error" }) });
  assert.equal(result.status, "FAIL");
});

test("lint: comando fake con código 0 -> PASS", () => {
  const result = runLintStep({ runCommand: fakeRunCommand(0) });
  assert.equal(result.status, "PASS");
});

test("lint: comando fake con código distinto de 0 -> FAIL", () => {
  const result = runLintStep({ runCommand: fakeRunCommand(1, { stdout: "3 errors" }) });
  assert.equal(result.status, "FAIL");
});

test("build (dry-run por defecto) -> WARN, nunca PASS silencioso sin haber construido de verdad", () => {
  const result = runBuildStep({ execute: false });
  assert.equal(result.status, "WARN");
});

test("build (execute) con comando fake exitoso -> PASS", () => {
  const result = runBuildStep({ execute: true, runCommand: fakeRunCommand(0) });
  assert.equal(result.status, "PASS");
});

test("schema_validation: pares schema/ejemplo reales del repo -> PASS", () => {
  const result = runSchemaValidationStep();
  assert.equal(result.status, "PASS", result.summary);
});

test("manifest_validation: sin manifest -> WARN, no FAIL (nada que validar todavía)", () => {
  const result = runManifestValidationStep({ manifest: null });
  assert.equal(result.status, "WARN");
});

test("manifest_validation: manifest inválido -> FAIL", () => {
  const result = runManifestValidationStep({ manifest: { schema_version: "1.0.0" } });
  assert.equal(result.status, "FAIL");
});

test("dependency_readiness: agrega el peor estado entre los 4 gates de dependencias", () => {
  const result = runDependencyReadinessStep({
    gates: {
      stripeReady: { status: "NOT_APPLICABLE" },
      whatsappReady: { status: "NOT_APPLICABLE" },
      airtableStable: { status: "BLOCKED" },
      makeQaThreshold: { status: "PASS" },
    },
  });
  assert.equal(result.status, "FAIL");
});

test("release_gate: veredicto ALLOW del decision engine se traduce a step PASS", () => {
  const passGate = { status: "PASS", reasons: [] };
  const naGate = { status: "NOT_APPLICABLE", reasons: [] };
  const gates = {
    configValid: passGate, brandingValid: passGate, integrationsValid: passGate, securityValid: passGate,
    qaValid: passGate, backupReady: passGate, observabilityReady: passGate, goLiveApproved: passGate,
    stripeReady: naGate, whatsappReady: naGate, airtableStable: passGate, makeQaThreshold: passGate,
  };
  const result = runReleaseGateStep({ environment: "STAGING", gates });
  assert.equal(result.status, "PASS");
  assert.equal(result.details.verdict, "ALLOW");
});

test("artifact_summary: overall=FAIL si algún paso falló, aunque el resto pase", () => {
  const summary = buildArtifactSummary([{ step: "a", status: "PASS" }, { step: "b", status: "FAIL" }, { step: "c", status: "WARN" }]);
  assert.equal(summary.overall, "FAIL");
});

test("artifact_summary: overall=WARN si no hay FAIL pero sí WARN", () => {
  const summary = buildArtifactSummary([{ step: "a", status: "PASS" }, { step: "b", status: "WARN" }]);
  assert.equal(summary.overall, "WARN");
});

test("artifact_summary: overall=PASS si todos los pasos están en PASS", () => {
  const summary = buildArtifactSummary([{ step: "a", status: "PASS" }, { step: "b", status: "PASS" }]);
  assert.equal(summary.overall, "PASS");
});

test("runPipeline: orquesta los 10 pasos con comandos fake, nunca toca red/npm real", () => {
  const fakeRun = () => ({ code: 0, stdout: "ℹ tests 5\nℹ pass 5\nℹ fail 0\n", stderr: "" });
  const summary = runPipeline({ runCommand: fakeRun, environment: "TEST", gates: {} });
  assert.equal(summary.steps.length, 10);
  assert.deepEqual(
    summary.steps.map((s) => s.step),
    ["install", "lint", "unit_tests", "integration_tests", "build", "schema_validation", "manifest_validation", "dependency_readiness", "release_gate", "artifact_summary"]
  );
});
