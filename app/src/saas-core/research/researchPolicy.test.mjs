import { test } from "node:test";
import assert from "node:assert/strict";

import { evaluatePolicy, FORBIDDEN_ACTIONS, RESEARCH_POLICY_VERSION } from "./researchPolicy.js";
import { buildResearchRequest } from "./researchRequestSchema.js";

test("evaluatePolicy en modo offline (por defecto) rechaza ejecutar cualquier URL, aunque sea segura", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, inputs: { urls: ["https://ejemplo-negocio.invalid/"] } });
  const policy = evaluatePolicy(request);
  assert.equal(policy.mode, "offline");
  const decision = policy.decisions.find((d) => d.input === "https://ejemplo-negocio.invalid/");
  assert.equal(decision.allowed, false);
  assert.match(decision.reason, /offline/);
});

test("evaluatePolicy rechaza URLs privadas/SSRF incluso en modo online", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, mode: "online", inputs: { urls: ["http://169.254.169.254/latest/meta-data/"] } });
  const policy = evaluatePolicy(request);
  assert.equal(policy.allowed, false);
  assert.equal(policy.violations.length, 1);
});

test("evaluatePolicy permite (a nivel de política) una URL pública en modo online cuando pasa allowlist/denylist/SSRF", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, mode: "online", inputs: { urls: ["https://ejemplo-negocio.invalid/"] } });
  const policy = evaluatePolicy(request);
  const decision = policy.decisions.find((d) => d.input === "https://ejemplo-negocio.invalid/");
  assert.equal(decision.allowed, true);
});

test("evaluatePolicy respeta una allowlist explícita de dominios", () => {
  const request = buildResearchRequest({
    business: { name: "X", sector: "dental" },
    mode: "online",
    inputs: { urls: ["https://otro-dominio.invalid/"] },
    sourcePolicy: { allowDomains: ["permitido.invalid"] },
  });
  const policy = evaluatePolicy(request);
  assert.equal(policy.violations.length, 1);
  assert.equal(policy.violations[0].reason, "not_in_allowlist");
});

test("evaluatePolicy respeta una denylist explícita de dominios", () => {
  const request = buildResearchRequest({
    business: { name: "X", sector: "dental" },
    mode: "online",
    inputs: { urls: ["https://bloqueado.invalid/pagina"] },
    sourcePolicy: { denyDomains: ["bloqueado.invalid"] },
  });
  const policy = evaluatePolicy(request);
  assert.equal(policy.violations.length, 1);
  assert.equal(policy.violations[0].reason, "denylist");
});

test("evaluatePolicy bloquea patrones de perfil individual (ej. facebook profile.php)", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, mode: "online", inputs: { urls: ["https://facebook.com/juan.perez/profile.php?id=1234"] } });
  const policy = evaluatePolicy(request);
  assert.equal(policy.allowed, false);
});

test("evaluatePolicy marca violación cuando el número de fuentes supera maxSources", () => {
  const urls = Array.from({ length: 5 }, (_, i) => `https://ejemplo${i}.invalid/`);
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, inputs: { urls }, limits: { maxSources: 3 } });
  const policy = evaluatePolicy(request);
  assert.ok(policy.violations.some((v) => v.input === "$.inputs"));
});

test("FORBIDDEN_ACTIONS incluye las acciones prohibidas explícitas del enunciado", () => {
  for (const action of ["authentication", "captcha_bypass", "robots_txt_bypass", "paywall_bypass", "mass_extraction", "facial_recognition", "account_access", "message_sending", "real_credentials"]) {
    assert.ok(FORBIDDEN_ACTIONS.includes(action), `falta acción prohibida: ${action}`);
  }
});

test("evaluatePolicy es determinista y expone la versión de política", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" } });
  const a = evaluatePolicy(request);
  const b = evaluatePolicy(request);
  assert.deepEqual(a, b);
  assert.equal(a.policyVersion, RESEARCH_POLICY_VERSION);
});
