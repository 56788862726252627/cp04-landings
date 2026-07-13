import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateSecurityValid } from "../../../scripts/release/gates/security-valid.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const realSnapshot = JSON.parse(readFileSync(path.resolve(__dirname, "../../../fixtures/release/security-status.snapshot.json"), "utf8"));

test("blocked security: P0 abierto -> FAIL (nunca WARN), coherente con 'security fail => BLOCK' del decision engine", () => {
  const result = evaluateSecurityValid({ securitySnapshot: realSnapshot, evidenceRef: "fixtures/release/security-status.snapshot.json" });
  assert.equal(result.status, "FAIL");
  assert.ok(result.reasons[0].includes("P0"));
});

test("security-valid: snapshot sin P0/P1 abiertos -> PASS", () => {
  const cleanSnapshot = { ...realSnapshot, open_p0: [], open_p1: [] };
  const result = evaluateSecurityValid({ securitySnapshot: cleanSnapshot, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("security-valid: snapshot con P1 pero sin P0 -> WARN, no FAIL", () => {
  const p1Snapshot = { ...realSnapshot, open_p0: [], open_p1: ["algo menor"] };
  const result = evaluateSecurityValid({ securitySnapshot: p1Snapshot, evidenceRef: "x" });
  assert.equal(result.status, "WARN");
});

test("security-valid: sin snapshot cargado -> UNKNOWN, nunca PASS implícito", () => {
  const result = evaluateSecurityValid({ securitySnapshot: null, evidenceRef: "x" });
  assert.equal(result.status, "UNKNOWN");
});
