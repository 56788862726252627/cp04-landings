import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluateReleaseManifestValid } from "../../../scripts/release/gates/release-manifest-valid.mjs";
import { repoPath } from "../../../src/config/paths.js";

const validStaging = JSON.parse(readFileSync(repoPath("fixtures", "release", "release-manifest.example.valid-staging.json"), "utf8"));
const validProduction = JSON.parse(readFileSync(repoPath("fixtures", "release", "release-manifest.example.valid-production.json"), "utf8"));
const invalidNoApproval = JSON.parse(readFileSync(repoPath("fixtures", "release", "release-manifest.example.invalid-production-no-approval.json"), "utf8"));

test("RELEASE_MANIFEST_VALID: sin manifest -> UNVERIFIED, nunca PASS implícito", () => {
  const result = evaluateReleaseManifestValid({ manifest: null, evidenceRef: "x" });
  assert.equal(result.status, "UNVERIFIED");
});

test("RELEASE_MANIFEST_VALID: manifest válido de staging -> PASS", () => {
  const result = evaluateReleaseManifestValid({ manifest: validStaging, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("RELEASE_MANIFEST_VALID: manifest válido de production (con approved_by) -> PASS", () => {
  const result = evaluateReleaseManifestValid({ manifest: validProduction, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("RELEASE_MANIFEST_VALID: production sin approved_by -> FAIL (regla allOf if/then del schema)", () => {
  const result = evaluateReleaseManifestValid({ manifest: invalidNoApproval, evidenceRef: "x" });
  assert.equal(result.status, "FAIL");
});

test("RELEASE_MANIFEST_VALID: cada resultado lleva evidence/reason/timestamp/evaluator/remediation_hint", () => {
  const result = evaluateReleaseManifestValid({ manifest: validStaging, evidenceRef: "ref" });
  assert.equal(result.gate, "RELEASE_MANIFEST_VALID");
  assert.ok("evidence" in result);
  assert.ok("reason" in result);
  assert.ok("timestamp" in result);
  assert.ok(result.evaluator.includes("release-manifest-valid.mjs"));
  assert.ok("remediation_hint" in result);
});
