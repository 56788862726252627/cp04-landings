import test from "node:test";
import assert from "node:assert/strict";
import { SERVICES, SERVICE_CRITICALITY, isCritical, deriveOverallStatus, deriveAlertRecommendation } from "../../scripts/observability/service-model.mjs";

test("modela exactamente los 8 servicios pedidos por la misión", () => {
  assert.deepEqual(
    [...SERVICES].sort(),
    ["airtable", "cloudflare", "gmail", "make", "stripe", "supabase-auth", "whatsapp", "worker"].sort()
  );
});

test("stripe y whatsapp son 'future', nunca 'critical' (sin integración real hoy)", () => {
  assert.equal(SERVICE_CRITICALITY.stripe, "future");
  assert.equal(SERVICE_CRITICALITY.whatsapp, "future");
  assert.equal(isCritical("stripe"), false);
  assert.equal(isCritical("whatsapp"), false);
});

test("worker, supabase-auth, airtable, make, cloudflare son críticos; gmail no", () => {
  for (const s of ["worker", "supabase-auth", "airtable", "make", "cloudflare"]) {
    assert.equal(isCritical(s), true, `${s} debería ser crítico`);
  }
  assert.equal(isCritical("gmail"), false);
});

// --- deriveOverallStatus (estados válidos e inválidos combinados) ---

test("sin checks fallidos ni dependencias degradadas -> HEALTHY", () => {
  const status = deriveOverallStatus({
    checks: [{ name: "process_alive", passed: true, message: null }],
    dependencies: [{ name: "airtable", status: "HEALTHY" }],
  });
  assert.equal(status, "HEALTHY");
});

test("un check propio fallido -> UNHEALTHY, sin importar las dependencias", () => {
  const status = deriveOverallStatus({
    checks: [{ name: "process_alive", passed: false, message: "caído" }],
    dependencies: [{ name: "airtable", status: "HEALTHY" }],
  });
  assert.equal(status, "UNHEALTHY");
});

test("dependencia crítica caída (UNHEALTHY) -> UNHEALTHY", () => {
  const status = deriveOverallStatus({
    checks: [{ name: "process_alive", passed: true, message: null }],
    dependencies: [{ name: "make", status: "UNHEALTHY" }],
  });
  assert.equal(status, "UNHEALTHY");
});

test("dependencia NO crítica caída (UNHEALTHY) -> DEGRADED, no UNHEALTHY", () => {
  const status = deriveOverallStatus({
    checks: [{ name: "process_alive", passed: true, message: null }],
    dependencies: [{ name: "gmail", status: "UNHEALTHY" }],
  });
  assert.equal(status, "DEGRADED");
});

test("dependencia degradada -> DEGRADED", () => {
  const status = deriveOverallStatus({
    checks: [{ name: "process_alive", passed: true, message: null }],
    dependencies: [{ name: "airtable", status: "DEGRADED" }],
  });
  assert.equal(status, "DEGRADED");
});

test("dependencia UNKNOWN nunca se infiere como HEALTHY -> DEGRADED", () => {
  const status = deriveOverallStatus({
    checks: [{ name: "process_alive", passed: true, message: null }],
    dependencies: [{ name: "cloudflare", status: "UNKNOWN" }],
  });
  assert.equal(status, "DEGRADED");
});

// --- deriveAlertRecommendation ---

test("HEALTHY sin burn rate ni presupuesto -> None", () => {
  assert.equal(deriveAlertRecommendation({ overallStatus: "HEALTHY", dependencies: [] }), "None");
});

test("UNHEALTHY siempre -> P0", () => {
  assert.equal(deriveAlertRecommendation({ overallStatus: "UNHEALTHY", dependencies: [] }), "P0");
});

test("DEGRADED con dependencia crítica implicada -> P1", () => {
  const alert = deriveAlertRecommendation({
    overallStatus: "DEGRADED",
    dependencies: [{ name: "airtable", status: "DEGRADED" }],
  });
  assert.equal(alert, "P1");
});

test("DEGRADED solo con dependencia no crítica -> P2", () => {
  const alert = deriveAlertRecommendation({
    overallStatus: "DEGRADED",
    dependencies: [{ name: "gmail", status: "DEGRADED" }],
  });
  assert.equal(alert, "P2");
});

test("presupuesto de error agotado (budgetRemainingRatio<=0) fuerza P0 aunque el estado sea HEALTHY", () => {
  const alert = deriveAlertRecommendation({
    overallStatus: "HEALTHY",
    dependencies: [],
    burnRate: 15.8,
    budgetRemainingRatio: -14.8,
  });
  assert.equal(alert, "P0");
});

test("burn rate > 1 sin estado degradado/unhealthy todavía sube al menos a P1", () => {
  const alert = deriveAlertRecommendation({
    overallStatus: "HEALTHY",
    dependencies: [],
    burnRate: 1.4,
    budgetRemainingRatio: 0.3,
  });
  assert.equal(alert, "P1");
});

test("DEGRADED con dependencia crítica Y burn rate>1 escala a P0, no se queda en P1", () => {
  const alert = deriveAlertRecommendation({
    overallStatus: "DEGRADED",
    dependencies: [{ name: "airtable", status: "DEGRADED" }],
    burnRate: 2.5,
  });
  assert.equal(alert, "P0");
});
