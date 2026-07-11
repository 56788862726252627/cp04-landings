import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateAirtableStable } from "../../../scripts/release/gates/airtable-stable.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const realDependencyStatus = JSON.parse(readFileSync(path.resolve(__dirname, "../../../fixtures/make-qa/dependency-status.json"), "utf8"));

test("Airtable unstable: cuota exhausted -> BLOCKED (workflows afectados bloqueados)", () => {
  const status = { ...realDependencyStatus, checks: { ...realDependencyStatus.checks, AIRTABLE_MONTHLY_QUOTA: { status: "exhausted", note: "confirmado agotado" } } };
  const result = evaluateAirtableStable({ dependencyStatus: status, evidenceRef: "x" });
  assert.equal(result.status, "BLOCKED");
});

test("airtable-stable: dependency-status.json real de hoy (quota unknown, rate-limit degraded) -> WARN", () => {
  const result = evaluateAirtableStable({ dependencyStatus: realDependencyStatus, evidenceRef: "fixtures/make-qa/dependency-status.json" });
  assert.equal(result.status, "WARN");
});

test("airtable-stable: todo healthy -> PASS", () => {
  const status = { ...realDependencyStatus, checks: { AIRTABLE_MONTHLY_QUOTA: { status: "available" }, AIRTABLE_RATE_LIMIT_PER_MINUTE: { status: "healthy" } } };
  const result = evaluateAirtableStable({ dependencyStatus: status, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("airtable-stable: sin datos -> UNKNOWN", () => {
  const result = evaluateAirtableStable({ dependencyStatus: { checks: {} }, evidenceRef: "x" });
  assert.equal(result.status, "UNKNOWN");
});
