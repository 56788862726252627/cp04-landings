import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluateConfigValid } from "../../../scripts/release/gates/config-valid.mjs";
import { evaluateBrandingValid } from "../../../scripts/release/gates/branding-valid.mjs";
import { evaluateIntegrationsValid } from "../../../scripts/release/gates/integrations-valid.mjs";
import { evaluateQaValid } from "../../../scripts/release/gates/qa-valid.mjs";
import { evaluateGoLiveApproved } from "../../../scripts/release/gates/go-live-approved.mjs";
import { evaluateObservabilityReady, checkObservabilityModulesPresent, REQUIRED_OBSERVABILITY_MODULES } from "../../../scripts/release/gates/observability-ready.mjs";
import { repoPath } from "../../../src/config/paths.js";

const clientConfigSchema = JSON.parse(readFileSync(repoPath("config", "client-config.schema.json"), "utf8"));
const validClientConfig = JSON.parse(readFileSync(repoPath("config", "client-config.example.valid.json"), "utf8"));
const invalidClientConfig = JSON.parse(readFileSync(repoPath("config", "client-config.example.invalid.json"), "utf8"));

test("gate evaluation — CONFIG_VALID: client-config válido -> PASS", () => {
  const result = evaluateConfigValid({ clientConfig: validClientConfig, clientConfigSchema, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("gate evaluation — CONFIG_VALID: client-config inválido -> FAIL", () => {
  const result = evaluateConfigValid({ clientConfig: invalidClientConfig, clientConfigSchema, evidenceRef: "x" });
  assert.equal(result.status, "FAIL");
});

test("gate evaluation — BRANDING_VALID: checklist con ítems sin marcar -> WARN", () => {
  const md = "# Branding\n- [x] Logo\n- [ ] Paleta de color\n";
  const result = evaluateBrandingValid({ brandingMarkdown: md, evidenceRef: "x" });
  assert.equal(result.status, "WARN");
});

test("gate evaluation — BRANDING_VALID: checklist completo -> PASS", () => {
  const md = "# Branding\n- [x] Logo\n- [x] Paleta de color\n";
  const result = evaluateBrandingValid({ brandingMarkdown: md, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("gate evaluation — BRANDING_VALID: BRANDING.md ausente -> BLOCKED", () => {
  const result = evaluateBrandingValid({ brandingMarkdown: null, evidenceRef: "clients/x/BRANDING.md" });
  assert.equal(result.status, "BLOCKED");
});

test("gate evaluation — INTEGRATIONS_VALID: payments.enabled=true viola la regla de plataforma -> FAIL", () => {
  const result = evaluateIntegrationsValid({ clientConfigIntegrations: { payments: { enabled: true }, messaging: { enabled: false } }, dependencyStatus: {}, evidenceRef: "x" });
  assert.equal(result.status, "FAIL");
});

test("gate evaluation — INTEGRATIONS_VALID: automation.enabled=true con token Make inválido conocido -> BLOCKED", () => {
  const dependencyStatus = { checks: { MAKE_API_TOKEN_MAPA_FLUJOS: { status: "invalid", note: "token expirado" } } };
  const result = evaluateIntegrationsValid({
    clientConfigIntegrations: { payments: { enabled: false }, messaging: { enabled: false }, automation: { enabled: true } },
    dependencyStatus,
    evidenceRef: "x",
  });
  assert.equal(result.status, "BLOCKED");
});

test("gate evaluation — QA_VALID: ítem sin resolver -> FAIL (más estricto que BRANDING_VALID)", () => {
  const md = "# QA\n- [x] Login\n- [ ] Reservas\n";
  const result = evaluateQaValid({ qaChecklistMarkdown: md, evidenceRef: "x" });
  assert.equal(result.status, "FAIL");
});

test("gate evaluation — QA_VALID: checklist completo sin menciones pendientes -> PASS", () => {
  const md = "# QA\n- [x] Login\n- [x] Reservas\n";
  const result = evaluateQaValid({ qaChecklistMarkdown: md, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("human approval: GO_LIVE_APPROVED sin approved_by -> PENDING, nunca PASS inferido", () => {
  const result = evaluateGoLiveApproved({ approvedBy: null, evidenceRef: "x" });
  assert.equal(result.status, "PENDING");
});

test("human approval: GO_LIVE_APPROVED con approved_by completo -> PASS", () => {
  const result = evaluateGoLiveApproved({ approvedBy: { name: "Eduardo", role: "direccion", approved_at: "2026-07-09T10:00:00.000Z" }, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("human approval: approved_by incompleto (falta role) -> BLOCKED, no se acepta aprobación parcial", () => {
  const result = evaluateGoLiveApproved({ approvedBy: { name: "Eduardo", approved_at: "2026-07-09T10:00:00.000Z" }, evidenceRef: "x" });
  assert.equal(result.status, "BLOCKED");
});

test("gate evaluation — OBSERVABILITY_READY: módulos reales presentes en este worktree", () => {
  const check = checkObservabilityModulesPresent(repoPath());
  assert.equal(check.present, true, JSON.stringify(check.missing));
  assert.equal(REQUIRED_OBSERVABILITY_MODULES.length > 0, true);
});

test("gate evaluation — OBSERVABILITY_READY: tests en verde -> PASS", () => {
  const result = evaluateObservabilityReady({ modulesCheck: { present: true, missing: [] }, testsSummary: { pass: 228, fail: 0, total: 228 }, evidenceRef: "x" });
  assert.equal(result.status, "PASS");
});

test("gate evaluation — OBSERVABILITY_READY: sin testsSummary todavía -> PENDING", () => {
  const result = evaluateObservabilityReady({ modulesCheck: { present: true, missing: [] }, testsSummary: null, evidenceRef: "x" });
  assert.equal(result.status, "PENDING");
});
