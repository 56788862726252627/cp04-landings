import { test } from "node:test";
import assert from "node:assert/strict";

import { computeIntegrationReadiness, INTEGRATION_IDS, INTEGRATION_STATUSES } from "./integrationReadiness.js";

test("computeIntegrationReadiness cubre exactamente las 10 integraciones pedidas", () => {
  const result = computeIntegrationReadiness({});
  assert.deepEqual(Object.keys(result.integrations).sort(), [...INTEGRATION_IDS].sort());
});

test("sin ninguna variable de entorno: todo NOT_CONFIGURED salvo make (MOCK) y ninguna comprobación real ejecutada", () => {
  const result = computeIntegrationReadiness({});
  assert.equal(result.integrations.stripe.status, "NOT_CONFIGURED");
  assert.equal(result.integrations.whatsapp.status, "NOT_CONFIGURED");
  assert.equal(result.integrations.airtable.status, "NOT_CONFIGURED");
  assert.equal(result.integrations.domain.status, "NOT_CONFIGURED");
  for (const integration of Object.values(result.integrations)) assert.equal(integration.lastCheckedIso, null);
});

test("cada estado devuelto pertenece al vocabulario de 9 estados del enunciado", () => {
  const result = computeIntegrationReadiness({ STRIPE_SECRET_KEY: "sk_test_x", WHATSAPP_ACCESS_TOKEN: "t", WHATSAPP_PHONE_NUMBER_ID: "1" }, { airtableKnownDegraded: true, makeValidatedFlowCount: 12 });
  for (const integration of Object.values(result.integrations)) assert.ok(INTEGRATION_STATUSES.includes(integration.status), `${integration.id}: ${integration.status}`);
});

test("Stripe configurado en modo test -> SANDBOX; en modo live -> READY_FOR_PRODUCTION", () => {
  const test1 = computeIntegrationReadiness({ STRIPE_SECRET_KEY: "sk_test_x" });
  assert.equal(test1.integrations.stripe.status, "SANDBOX");
  const test2 = computeIntegrationReadiness({ STRIPE_SECRET_KEY: "sk_live_x" });
  assert.equal(test2.integrations.stripe.status, "READY_FOR_PRODUCTION");
});

test("WhatsApp configurado -> SANDBOX; cada integración expone credencialesNeeded y nextSteps no vacíos cuando corresponde", () => {
  const result = computeIntegrationReadiness({ WHATSAPP_ACCESS_TOKEN: "t", WHATSAPP_PHONE_NUMBER_ID: "1" });
  assert.equal(result.integrations.whatsapp.status, "SANDBOX");
  assert.ok(result.integrations.whatsapp.credentialsNeeded.length > 0);
  assert.ok(result.integrations.stripe.nextSteps.length > 0);
});

test("Airtable marcado como degradado externamente (cuota agotada) se refleja como DEGRADED con blockedBy explícito", () => {
  const result = computeIntegrationReadiness({}, { airtableKnownDegraded: true });
  assert.equal(result.integrations.airtable.status, "DEGRADED");
  assert.match(result.integrations.airtable.blockedBy, /cuota/i);
});

test("Make refleja el nº de flujos validados: 0 -> MOCK, parcial -> TESTING, 50 -> READY_FOR_PRODUCTION", () => {
  assert.equal(computeIntegrationReadiness({}, {}).integrations.make.status, "MOCK");
  assert.equal(computeIntegrationReadiness({}, { makeValidatedFlowCount: 10 }).integrations.make.status, "TESTING");
  assert.equal(computeIntegrationReadiness({}, { makeValidatedFlowCount: 50 }).integrations.make.status, "READY_FOR_PRODUCTION");
});

test("dominio/ssl/hosting/backups/monitoring dependen en cadena y quedan NOT_CONFIGURED por defecto con blockedBy encadenado", () => {
  const result = computeIntegrationReadiness({});
  assert.equal(result.integrations.domain.status, "NOT_CONFIGURED");
  assert.match(result.integrations.ssl.blockedBy, /domain/);
  assert.match(result.integrations.hosting.blockedBy, /domain/);
  assert.match(result.integrations.backups.blockedBy, /hosting/);
  assert.match(result.integrations.monitoring.blockedBy, /hosting/);
});

test("overallBlocked es true si al menos una integración tiene blockedBy, y summary cuenta correctamente por estado", () => {
  const result = computeIntegrationReadiness({});
  assert.equal(result.overallBlocked, true);
  const total = Object.values(result.summary).reduce((a, b) => a + b, 0);
  assert.equal(total, INTEGRATION_IDS.length);
});

test("es determinista: mismos env/contexto -> mismo resultado", () => {
  const env = { STRIPE_SECRET_KEY: "sk_test_x" };
  assert.deepEqual(computeIntegrationReadiness(env), computeIntegrationReadiness(env));
});
