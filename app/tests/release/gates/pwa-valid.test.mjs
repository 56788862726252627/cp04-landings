import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { evaluatePwaValid, checkServiceWorkerLocal } from "../../../scripts/release/gates/pwa-valid.mjs";
import { checkManifestPwaLocal } from "../../../scripts/release/smoke-tests.mjs";
import { repoPath } from "../../../src/config/paths.js";

const REAL_MANIFEST_PASS = checkManifestPwaLocal({ manifestPath: repoPath("public", "manifest.webmanifest") });
const REAL_SW_CHECK = checkServiceWorkerLocal({ serviceWorkerPath: repoPath("public", "sw.js") });

test("PWA_VALID: sin manifestCheckResult/serviceWorkerCheckResult -> UNVERIFIED", () => {
  const result = evaluatePwaValid({});
  assert.equal(result.status, "UNVERIFIED");
});

test("PWA_VALID: manifest inválido -> FAIL crítico (bloquea producción)", () => {
  const result = evaluatePwaValid({
    manifestCheckResult: { check: "manifest_pwa", status: "FAIL", summary: "campos ausentes" },
    serviceWorkerCheckResult: REAL_SW_CHECK,
    evidenceRef: "x",
  });
  assert.equal(result.status, "FAIL");
  assert.equal(result.critical, true);
});

test("PWA_VALID: service worker ausente -> FAIL crítico", () => {
  const result = evaluatePwaValid({
    manifestCheckResult: REAL_MANIFEST_PASS,
    serviceWorkerCheckResult: { present: false, hasFetchHandler: false, excludesApiRoutes: false, reason: "ENOENT" },
    evidenceRef: "x",
  });
  assert.equal(result.status, "FAIL");
  assert.equal(result.critical, true);
});

test("PWA_VALID: service worker sin listener fetch -> FAIL crítico", () => {
  const result = evaluatePwaValid({
    manifestCheckResult: REAL_MANIFEST_PASS,
    serviceWorkerCheckResult: { present: true, hasFetchHandler: false, excludesApiRoutes: false, reason: null },
    evidenceRef: "x",
  });
  assert.equal(result.status, "FAIL");
  assert.equal(result.critical, true);
});

test("PWA_VALID: service worker sin guarda anti-caché /api/ detectada -> WARN, no crítico", () => {
  const result = evaluatePwaValid({
    manifestCheckResult: REAL_MANIFEST_PASS,
    serviceWorkerCheckResult: { present: true, hasFetchHandler: true, excludesApiRoutes: false, reason: null },
    evidenceRef: "x",
  });
  assert.equal(result.status, "WARN");
  assert.equal(result.critical, false);
});

test("PWA_VALID: manifest + service worker reales del repo -> PASS", () => {
  const result = evaluatePwaValid({ manifestCheckResult: REAL_MANIFEST_PASS, serviceWorkerCheckResult: REAL_SW_CHECK, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
  assert.equal(result.critical, false);
});

test("checkServiceWorkerLocal: sw.js real del repo tiene fetch handler y excluye /api/*", () => {
  assert.equal(REAL_SW_CHECK.present, true);
  assert.equal(REAL_SW_CHECK.hasFetchHandler, true);
  assert.equal(REAL_SW_CHECK.excludesApiRoutes, true);
});

test("checkServiceWorkerLocal: fichero ausente -> present:false, nunca lanza", () => {
  const result = checkServiceWorkerLocal({ serviceWorkerPath: "/no/existe/nunca/sw.js" });
  assert.equal(result.present, false);
});

test("checkServiceWorkerLocal: fichero sintético sin fetch handler ni guarda /api/", () => {
  const tmp = mkdtempSync(path.join(tmpdir(), "cp04-pwa-valid-"));
  try {
    const swPath = path.join(tmp, "sw.js");
    writeFileSync(swPath, "self.addEventListener('install', () => {});\n");
    const result = checkServiceWorkerLocal({ serviceWorkerPath: swPath });
    assert.equal(result.present, true);
    assert.equal(result.hasFetchHandler, false);
    assert.equal(result.excludesApiRoutes, false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("PWA_VALID: cada resultado lleva evidence/reason/timestamp/evaluator/remediation_hint", () => {
  const result = evaluatePwaValid({ manifestCheckResult: REAL_MANIFEST_PASS, serviceWorkerCheckResult: REAL_SW_CHECK, evidenceRef: "ref" });
  assert.equal(result.gate, "PWA_VALID");
  assert.ok("evidence" in result);
  assert.ok("reason" in result);
  assert.ok("timestamp" in result);
  assert.ok(result.evaluator.includes("pwa-valid.mjs"));
  assert.ok("remediation_hint" in result);
});
