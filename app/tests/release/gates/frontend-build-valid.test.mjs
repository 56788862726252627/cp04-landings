import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { evaluateFrontendBuildValid, measureDistBundleSize, DEFAULT_CHUNK_SIZE_WARN_BYTES } from "../../../scripts/release/gates/frontend-build-valid.mjs";

test("FRONTEND_BUILD_VALID: sin buildStepResult -> UNVERIFIED", () => {
  const result = evaluateFrontendBuildValid({});
  assert.equal(result.status, "UNVERIFIED");
});

test("FRONTEND_BUILD_VALID: buildStepResult en WARN (dry-run) -> UNVERIFIED, nunca PASS implícito", () => {
  const result = evaluateFrontendBuildValid({ buildStepResult: { step: "build", status: "WARN", summary: "dry-run" } });
  assert.equal(result.status, "UNVERIFIED");
});

test("FRONTEND_BUILD_VALID: build real falló -> FAIL", () => {
  const result = evaluateFrontendBuildValid({ buildStepResult: { step: "build", status: "FAIL", summary: "vite build: error de sintaxis" } });
  assert.equal(result.status, "FAIL");
});

test("FRONTEND_BUILD_VALID: build real OK sin bundleSizeReport -> PASS", () => {
  const result = evaluateFrontendBuildValid({ buildStepResult: { step: "build", status: "PASS", summary: "vite build OK" } });
  assert.equal(result.status, "PASS");
});

test("FRONTEND_BUILD_VALID: build OK con chunk por encima del umbral -> WARN, no FAIL", () => {
  const result = evaluateFrontendBuildValid({
    buildStepResult: { step: "build", status: "PASS", summary: "vite build OK" },
    bundleSizeReport: { chunks: [{ file: "index-abc.js", bytes: DEFAULT_CHUNK_SIZE_WARN_BYTES + 1024 }] },
  });
  assert.equal(result.status, "WARN");
});

test("FRONTEND_BUILD_VALID: build OK con todos los chunks bajo el umbral -> PASS", () => {
  const result = evaluateFrontendBuildValid({
    buildStepResult: { step: "build", status: "PASS", summary: "vite build OK" },
    bundleSizeReport: { chunks: [{ file: "index-abc.js", bytes: 1024 }] },
  });
  assert.equal(result.status, "PASS");
});

test("measureDistBundleSize: sin dist/assets -> chunks vacío, nunca lanza", () => {
  const report = measureDistBundleSize({ distDir: "/no/existe/nunca/dist" });
  assert.deepEqual(report.chunks, []);
});

test("measureDistBundleSize: mide bytes reales de un dist/assets sintético", () => {
  const tmp = mkdtempSync(path.join(tmpdir(), "cp04-frontend-build-valid-"));
  try {
    mkdirSync(path.join(tmp, "assets"));
    writeFileSync(path.join(tmp, "assets", "index-xyz.js"), "a".repeat(2048));
    writeFileSync(path.join(tmp, "assets", "index-xyz.css"), "body{}");
    const report = measureDistBundleSize({ distDir: tmp });
    assert.equal(report.chunks.length, 1);
    assert.equal(report.chunks[0].bytes, 2048);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("FRONTEND_BUILD_VALID: cada resultado lleva evidence/reason/timestamp/evaluator/remediation_hint", () => {
  const result = evaluateFrontendBuildValid({ buildStepResult: { step: "build", status: "PASS", summary: "ok" }, evidenceRef: "ref" });
  assert.equal(result.gate, "FRONTEND_BUILD_VALID");
  assert.ok("evidence" in result);
  assert.ok("reason" in result);
  assert.ok("timestamp" in result);
  assert.ok(result.evaluator.includes("frontend-build-valid.mjs"));
  assert.ok("remediation_hint" in result);
});
