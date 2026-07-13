import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildReleaseManifest, validateReleaseManifest, pickGateStatus, UNKNOWN_GATE_STATUS, generateReleaseId, generateBuildId } from "../../scripts/release/manifest.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "../../fixtures/release");

function loadFixture(name) {
  return JSON.parse(readFileSync(path.join(FIXTURES_DIR, name), "utf8"));
}

test("manifest schema: fixture STAGING válida pasa validateReleaseManifest", () => {
  const result = validateReleaseManifest(loadFixture("release-manifest.example.valid-staging.json"));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("manifest schema: fixture PRODUCTION válida (con approved_by) pasa validateReleaseManifest", () => {
  const result = validateReleaseManifest(loadFixture("release-manifest.example.valid-production.json"));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("manifest schema: PRODUCTION sin approved_by falla por la regla if/then (GO_LIVE_APPROVED nunca implícito)", () => {
  const result = validateReleaseManifest(loadFixture("release-manifest.example.invalid-production-no-approval.json"));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.approved_by"));
});

test("manifest schema: additionalProperties:false rechaza un campo desconocido", () => {
  const doc = { ...loadFixture("release-manifest.example.valid-staging.json"), campo_inventado: true };
  const result = validateReleaseManifest(doc);
  assert.equal(result.valid, false);
});

test("buildReleaseManifest: campos de gate omitidos caen en UNKNOWN_GATE_STATUS, nunca en PASS por defecto", () => {
  const manifest = buildReleaseManifest({
    releaseId: "rel_test-defaults-0001",
    commitSha: "1234567",
    buildId: "build_test-0001",
    tenantId: "cp04",
    environment: "TEST",
  });
  assert.deepEqual(manifest.security_status, UNKNOWN_GATE_STATUS);
  assert.deepEqual(manifest.dependency_status.stripe, UNKNOWN_GATE_STATUS);
  assert.equal(manifest.approved_by, null);
});

test("buildReleaseManifest: manifest ensamblado con todos los campos pasa su propia validación", () => {
  const manifest = buildReleaseManifest({
    releaseId: generateReleaseId("abcdef01"),
    commitSha: "1234567",
    buildId: generateBuildId("abcdef01"),
    tenantId: "cp04",
    environment: "STAGING",
    securityStatus: { status: "PASS", evidence_ref: "x", checked_at: "2026-07-09T00:00:00.000Z" },
  });
  const result = validateReleaseManifest(manifest);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("pickGateStatus: descarta 'reasons'/'detail' de un resultado de evaluador antes de meterlo en el manifest", () => {
  const evaluatorResult = { status: "WARN", evidence_ref: "audit/x.md", checked_at: "2026-07-09T00:00:00.000Z", reasons: ["motivo 1", "motivo 2"] };
  const picked = pickGateStatus(evaluatorResult);
  assert.deepEqual(picked, { status: "WARN", evidence_ref: "audit/x.md", checked_at: "2026-07-09T00:00:00.000Z" });
  assert.equal("reasons" in picked, false);
});

test("pickGateStatus: sin resultado de evaluador devuelve UNKNOWN_GATE_STATUS", () => {
  assert.deepEqual(pickGateStatus(null), UNKNOWN_GATE_STATUS);
  assert.deepEqual(pickGateStatus(undefined), UNKNOWN_GATE_STATUS);
});

test("generateReleaseId/generateBuildId: producen valores que pasan el patrón del schema", () => {
  const manifest = buildReleaseManifest({
    releaseId: generateReleaseId(),
    commitSha: "abcdef1",
    buildId: generateBuildId(),
    tenantId: "cp04",
    environment: "LOCAL",
  });
  assert.match(manifest.release_id, /^rel_[A-Za-z0-9-]{8,}$/);
  assert.match(manifest.build_id, /^build_[A-Za-z0-9-]{6,}$/);
});
