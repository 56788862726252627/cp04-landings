import { test } from "node:test";
import assert from "node:assert/strict";

import { OPERATIONAL_STATES, READINESS_CLASSIFICATIONS, computeOperationalStates, classifyReadiness } from "./operationalState.js";

function integration(overrides) {
  return { id: "x", label: "X", status: "NOT_CONFIGURED", blockedBy: null, credentialsNeeded: [], ...overrides };
}

test("expone exactamente los 8 estados y las 3 clasificaciones del enunciado", () => {
  assert.deepEqual([...OPERATIONAL_STATES], ["generated", "validated", "dryRunReady", "integrationReady", "productionReady", "blocked", "degraded", "manualActionRequired"]);
  assert.deepEqual([...READINESS_CLASSIFICATIONS], ["A", "B", "C"]);
});

test("sin ninguna integración declarada y sin riesgos: generado no implica producción, pero sí dry-run limpio", () => {
  const states = computeOperationalStates({ risks: [], manualSteps: [], declaredIntegrationIds: [], integrationsById: {} });
  assert.equal(states.generated, true);
  assert.equal(states.validated, true);
  assert.equal(states.dryRunReady, true);
  assert.equal(states.integrationReady, true); // vacuamente cierto: nada declarado que bloquee
  assert.equal(states.productionReady, true); // sin integraciones que declarar, nada impide considerarlo listo
  assert.equal(states.blocked, false);
  assert.equal(states.degraded, false);
  assert.equal(states.manualActionRequired, false);
});

test("una integración declarada NOT_CONFIGURED impide integrationReady y productionReady, y exige acción manual", () => {
  const integrationsById = { stripe: integration({ id: "stripe", label: "Stripe", status: "NOT_CONFIGURED", credentialsNeeded: ["STRIPE_SECRET_KEY"] }) };
  const states = computeOperationalStates({ declaredIntegrationIds: ["stripe"], integrationsById });
  assert.equal(states.integrationReady, false);
  assert.equal(states.productionReady, false);
  assert.equal(states.manualActionRequired, true);
  assert.equal(states.dryRunReady, true); // NOT_CONFIGURED no es ERROR: el modo demo sigue funcionando
  assert.ok(states.active.includes("manualActionRequired"));
  assert.ok(!states.active.includes("integrationReady"));
});

test("una integración con blockedBy activa 'blocked' aunque su estado no sea ERROR", () => {
  const integrationsById = { airtable: integration({ id: "airtable", label: "Airtable", status: "DEGRADED", blockedBy: "cuota agotada" }) };
  const states = computeOperationalStates({ declaredIntegrationIds: ["airtable"], integrationsById });
  assert.equal(states.blocked, true);
  assert.equal(states.degraded, true);
  assert.deepEqual(states.reasons.blockedBy, [{ id: "airtable", label: "Airtable", blockedBy: "cuota agotada" }]);
});

test("una integración en ERROR (no declarada) impide dryRunReady globalmente", () => {
  const integrationsById = { stripe: integration({ id: "stripe", status: "ERROR" }) };
  const states = computeOperationalStates({ declaredIntegrationIds: [], integrationsById });
  assert.equal(states.dryRunReady, false);
});

test("riesgos del report.json marcan 'degraded' y rompen 'validated'", () => {
  const states = computeOperationalStates({ risks: ["Contraste WCAG AA insuficiente"], integrationsById: {} });
  assert.equal(states.validated, false);
  assert.equal(states.degraded, true);
  assert.deepEqual(states.reasons.degradedBy, [{ source: "risk", detail: "Contraste WCAG AA insuficiente" }]);
});

test("manualSteps del report.json activan manualActionRequired sin necesidad de integraciones", () => {
  const states = computeOperationalStates({ manualSteps: ["Comprar dominio"], integrationsById: {} });
  assert.equal(states.manualActionRequired, true);
  assert.deepEqual(states.reasons.manualActionsPending, ["Comprar dominio"]);
});

test("todas las integraciones declaradas en producción real: productionReady = true", () => {
  const integrationsById = {
    stripe: integration({ id: "stripe", label: "Stripe", status: "READY_FOR_PRODUCTION" }),
    whatsapp: integration({ id: "whatsapp", label: "WhatsApp", status: "PRODUCTION" }),
  };
  const states = computeOperationalStates({ declaredIntegrationIds: ["stripe", "whatsapp"], integrationsById });
  assert.equal(states.integrationReady, true);
  assert.equal(states.productionReady, true);
  assert.equal(states.manualActionRequired, false);
});

// --- classifyReadiness ---

test("classifyReadiness scope='dryRun': negocio limpio sin bloqueos ni riesgos es A", () => {
  const states = computeOperationalStates({});
  const result = classifyReadiness(states, { scope: "dryRun" });
  assert.equal(result.classification, "A");
  assert.deepEqual(result.missing, []);
});

test("classifyReadiness scope='dryRun': acción manual pendiente es B, no C (el demo sigue usable)", () => {
  const states = computeOperationalStates({ manualSteps: ["Comprar dominio"] });
  const result = classifyReadiness(states, { scope: "dryRun" });
  assert.equal(result.classification, "B");
  assert.ok(result.missing.some((m) => m.includes("Comprar dominio")));
});

test("classifyReadiness scope='dryRun': un riesgo estructural (sin bloqueo) es B, no C — el demo sigue siendo usable", () => {
  const states = computeOperationalStates({ risks: ["Contraste WCAG AA insuficiente"] });
  const result = classifyReadiness(states, { scope: "dryRun" });
  assert.equal(result.classification, "B");
  assert.ok(result.missing.some((m) => m.includes("Contraste")));
});

test("classifyReadiness scope='dryRun': un bloqueo real es C con causa explícita", () => {
  const integrationsById = { airtable: integration({ id: "airtable", label: "Airtable", status: "DEGRADED", blockedBy: "cuota agotada" }) };
  const states = computeOperationalStates({ declaredIntegrationIds: ["airtable"], integrationsById });
  const result = classifyReadiness(states, { scope: "dryRun" });
  assert.equal(result.classification, "C");
  assert.ok(result.missing.some((m) => m.includes("cuota agotada")));
});

test("classifyReadiness scope='production': integración declarada sin credenciales es C, nunca A", () => {
  const integrationsById = { stripe: integration({ id: "stripe", label: "Stripe", status: "NOT_CONFIGURED" }) };
  const states = computeOperationalStates({ declaredIntegrationIds: ["stripe"], integrationsById });
  const result = classifyReadiness(states, { scope: "production" });
  assert.equal(result.classification, "C");
});

test("classifyReadiness scope='production': integraciones en SANDBOX (no producción real) es B, no A", () => {
  const integrationsById = { stripe: integration({ id: "stripe", label: "Stripe", status: "SANDBOX" }) };
  const states = computeOperationalStates({ declaredIntegrationIds: ["stripe"], integrationsById });
  const result = classifyReadiness(states, { scope: "production" });
  assert.equal(result.classification, "B");
});

test("classifyReadiness scope='production': todo en producción real y sin pasos manuales es A", () => {
  const integrationsById = { stripe: integration({ id: "stripe", label: "Stripe", status: "PRODUCTION" }) };
  const states = computeOperationalStates({ declaredIntegrationIds: ["stripe"], integrationsById });
  const result = classifyReadiness(states, { scope: "production" });
  assert.equal(result.classification, "A");
});

test("classifyReadiness rechaza un scope desconocido en vez de asumir uno por defecto silenciosamente", () => {
  const states = computeOperationalStates({});
  assert.throws(() => classifyReadiness(states, { scope: "staging" }), /scope desconocido/);
});
