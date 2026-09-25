import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runFactoryPipeline } from "./orchestrator.js";
import { BUSINESS_BLUEPRINT_SCHEMA_VERSION } from "./businessBlueprintSchema.js";
import { computeIntegrationReadiness, INTEGRATION_IDS } from "../commercial/integrationReadiness.js";
import {
  buildIntegrationMatrix,
  buildBusinessStatusReport,
  renderBusinessStatusMarkdown,
  renderBusinessStatusJson,
  resolveDeclaredIntegrationIdsFromTenantConfig,
  resolveRelevantIntegrationIds,
  TENANT_PROVIDERS_WITHOUT_READINESS_COVERAGE,
} from "./businessStatusReport.js";

function sectorBlueprint({ businessId, sector }) {
  return {
    schemaVersion: BUSINESS_BLUEPRINT_SCHEMA_VERSION,
    businessId,
    tenantId: businessId,
    commercialName: `Demo ${businessId}`,
    sector,
    country: "ES",
    timezone: "Europe/Madrid",
    locale: "es-ES",
    currencies: ["EUR"],
    plan: "starter",
  };
}

async function withTempBusiness(blueprint, fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "business-status-report-test-"));
  try {
    const runResult = await runFactoryPipeline({ blueprint, outputBaseDir: dir });
    await fn(runResult);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// --- buildIntegrationMatrix ---

test("buildIntegrationMatrix devuelve siempre las 11 integraciones del Paso 20, marcando cuáles son relevantes", () => {
  const readiness = computeIntegrationReadiness({});
  const matrix = buildIntegrationMatrix(readiness, { relevantIds: ["stripe", "airtable"] });
  assert.equal(matrix.length, INTEGRATION_IDS.length);
  const stripeRow = matrix.find((m) => m.id === "stripe");
  assert.equal(stripeRow.relevantToThisScope, true);
  const domainRow = matrix.find((m) => m.id === "domain");
  assert.equal(domainRow.relevantToThisScope, false);
});

test("buildIntegrationMatrix nunca expone valores de credenciales, solo booleanos", () => {
  const readiness = computeIntegrationReadiness({ STRIPE_SECRET_KEY: "sk_test_super_secreto_123" });
  const matrix = buildIntegrationMatrix(readiness, { relevantIds: ["stripe"] });
  const json = JSON.stringify(matrix);
  assert.ok(!json.includes("sk_test_super_secreto_123"));
  const stripeRow = matrix.find((m) => m.id === "stripe");
  assert.equal(stripeRow.credentialsPresent, true);
});

test("buildIntegrationMatrix marca webhookCovered solo en stripe/whatsapp (equivalencia documentada de 'webhooks/API')", () => {
  const readiness = computeIntegrationReadiness({});
  const matrix = buildIntegrationMatrix(readiness, { relevantIds: [] });
  assert.equal(matrix.find((m) => m.id === "stripe").webhookCovered, true);
  assert.equal(matrix.find((m) => m.id === "whatsapp").webhookCovered, true);
  assert.equal(matrix.find((m) => m.id === "domain").webhookCovered, null);
});

// --- resolveRelevantIntegrationIds ---

test("scope dryRun solo cuenta lo declarado por el propio tenantConfig", () => {
  const tenantConfig = { integrations: { payments: {}, messaging: {} } };
  const ids = resolveRelevantIntegrationIds({ tenantConfig, scope: "dryRun" });
  assert.deepEqual(ids.sort(), ["stripe", "whatsapp"]);
});

test("scope production exige las 11 integraciones, no solo lo declarado", () => {
  const tenantConfig = { integrations: { payments: {} } };
  const ids = resolveRelevantIntegrationIds({ tenantConfig, scope: "production" });
  assert.deepEqual(ids.sort(), [...INTEGRATION_IDS].sort());
});

test("resolveDeclaredIntegrationIdsFromTenantConfig ignora providers sin id equivalente en Paso 20 (calendar/fileStorage/analytics)", () => {
  const tenantConfig = { integrations: { calendar: {}, fileStorage: {}, analytics: {}, payments: {} } };
  const ids = resolveDeclaredIntegrationIdsFromTenantConfig(tenantConfig);
  assert.deepEqual(ids, ["stripe"]);
});

// --- buildBusinessStatusReport: compatibilidad con los 3 sectores ya validados ---

for (const { sector, businessId } of [
  { sector: "padel", businessId: "club-padel-status-test" },
  { sector: "dental", businessId: "clinica-dental-status-test" },
  { sector: "veterinary", businessId: "veterinaria-status-test" },
]) {
  test(`buildBusinessStatusReport funciona para el sector "${sector}" (club de pádel/clínica dental/veterinaria)`, async () => {
    await withTempBusiness(sectorBlueprint({ businessId, sector }), async (runResult) => {
      const integrationsReadiness = computeIntegrationReadiness({});
      const status = buildBusinessStatusReport({ report: runResult, tenantConfig: runResult.tenantConfig, integrationsReadiness, scope: "dryRun" });
      assert.equal(status.businessId, businessId);
      assert.equal(status.sector, sector);
      assert.ok(["A", "B", "C"].includes(status.classification));
      assert.equal(status.integrations.length, INTEGRATION_IDS.length);
      assert.ok(Array.isArray(status.modules) && status.modules.length > 0);
      assert.ok(Array.isArray(status.roles) && status.roles.length > 0);
    });
  });
}

test("con env vacío (sin credenciales) el scope dryRun no es A: el negocio declara 'automation' (Make), y Make declara SIEMPRE un blockedBy hacia Airtable (Paso 20) — se propaga como 'blocked' (C), no solo 'manualActionRequired' (B)", async () => {
  await withTempBusiness(sectorBlueprint({ businessId: "negocio-sin-credenciales", sector: "padel" }), async (runResult) => {
    const integrationsReadiness = computeIntegrationReadiness({});
    const status = buildBusinessStatusReport({ report: runResult, tenantConfig: runResult.tenantConfig, integrationsReadiness, scope: "dryRun" });
    assert.equal(status.classification, "C");
    assert.ok(status.classificationMissing.some((m) => m.includes("Bloqueo")));
  });
});

test("scope production sobre el mismo negocio sin ninguna credencial real es C (bloqueado), nunca A", async () => {
  await withTempBusiness(sectorBlueprint({ businessId: "negocio-produccion-test", sector: "dental" }), async (runResult) => {
    const integrationsReadiness = computeIntegrationReadiness({});
    const status = buildBusinessStatusReport({ report: runResult, tenantConfig: runResult.tenantConfig, integrationsReadiness, scope: "production" });
    assert.equal(status.classification, "C");
  });
});

test("declara acciones manuales verdaderas y las etiqueta con ⚠️ ACCIÓN MANUAL en el Markdown", async () => {
  await withTempBusiness(sectorBlueprint({ businessId: "negocio-manual-test", sector: "veterinary" }), async (runResult) => {
    const reportWithManualStep = { ...runResult, manualSteps: ["Comprar dominio propio"] };
    const integrationsReadiness = computeIntegrationReadiness({});
    const status = buildBusinessStatusReport({ report: reportWithManualStep, tenantConfig: runResult.tenantConfig, integrationsReadiness, scope: "dryRun" });
    const markdown = renderBusinessStatusMarkdown(status);
    assert.match(markdown, /⚠️ ACCIÓN MANUAL: Comprar dominio propio/);
  });
});

test("no etiqueta ⚠️ ACCIÓN MANUAL cuando no hay ninguna acción manual real declarada", async () => {
  await withTempBusiness(sectorBlueprint({ businessId: "negocio-sin-manual-test", sector: "padel" }), async (runResult) => {
    const integrationsReadiness = computeIntegrationReadiness({});
    const status = buildBusinessStatusReport({ report: runResult, tenantConfig: runResult.tenantConfig, integrationsReadiness, scope: "dryRun" });
    const markdown = renderBusinessStatusMarkdown(status);
    assert.ok(!markdown.includes("⚠️ ACCIÓN MANUAL"));
  });
});

test("integrationCoverageGaps documenta providers sin id equivalente en vez de ignorarlos en silencio", async () => {
  await withTempBusiness(sectorBlueprint({ businessId: "negocio-calendar-test", sector: "dental" }), async (runResult) => {
    // "dental" preset recomienda calendar (ver templates/presets.js) -> gap conocido esperado
    const declaresCalendar = Object.keys(runResult.tenantConfig.integrations).includes("calendar");
    const integrationsReadiness = computeIntegrationReadiness({});
    const status = buildBusinessStatusReport({ report: runResult, tenantConfig: runResult.tenantConfig, integrationsReadiness, scope: "dryRun" });
    if (declaresCalendar) {
      assert.ok(status.integrationCoverageGaps.some((g) => g.includes("calendar")));
    } else {
      assert.deepEqual(status.integrationCoverageGaps, []);
    }
  });
});

test("renderBusinessStatusJson produce JSON parseable y consistente con el objeto original", async () => {
  await withTempBusiness(sectorBlueprint({ businessId: "negocio-json-test", sector: "padel" }), async (runResult) => {
    const integrationsReadiness = computeIntegrationReadiness({});
    const status = buildBusinessStatusReport({ report: runResult, tenantConfig: runResult.tenantConfig, integrationsReadiness, scope: "dryRun" });
    const parsed = JSON.parse(renderBusinessStatusJson(status));
    assert.equal(parsed.businessId, status.businessId);
    assert.equal(parsed.classification, status.classification);
  });
});

test("dos consultas seguidas del MISMO negocio pueden diferir solo en 'queriedAt' — el resto es determinista para el mismo env/scope", async () => {
  await withTempBusiness(sectorBlueprint({ businessId: "negocio-repetible-test", sector: "veterinary" }), async (runResult) => {
    const integrationsReadiness = computeIntegrationReadiness({});
    const first = buildBusinessStatusReport({ report: runResult, tenantConfig: runResult.tenantConfig, integrationsReadiness, scope: "dryRun" });
    const second = buildBusinessStatusReport({ report: runResult, tenantConfig: runResult.tenantConfig, integrationsReadiness, scope: "dryRun" });
    const stripField = ({ queriedAt, ...rest }) => rest;
    assert.deepEqual(stripField(first), stripField(second));
  });
});

test("negocio completamente preparado en dry-run (sin integraciones declaradas que mapeen a Paso 20, branding válido -> sin riesgos) clasifica A", async () => {
  const blueprint = {
    ...sectorBlueprint({ businessId: "negocio-completo-dryrun", sector: "padel" }),
    branding: { colors: { primary: "#1c6fd6", accent: "#2fd6b0", bg: "#ffffff", surface: "#f4f8fb", text: "#0c1420" } },
    integrations: { calendar: { status: "not_configured", envVars: [] } },
  };
  await withTempBusiness(blueprint, async (runResult) => {
    // Sin providers mapeables (solo "calendar", gap conocido) -> declaredIntegrationIds = [] -> nada que bloquee el dry-run.
    assert.deepEqual(resolveDeclaredIntegrationIdsFromTenantConfig(runResult.tenantConfig), []);
    assert.deepEqual(runResult.risks, []);
    const integrationsReadiness = computeIntegrationReadiness({});
    const status = buildBusinessStatusReport({ report: runResult, tenantConfig: runResult.tenantConfig, integrationsReadiness, scope: "dryRun" });
    assert.equal(status.classification, "A");
    assert.deepEqual(status.classificationMissing, []);
  });
});

test("negocio parcialmente configurado (Stripe en SANDBOX ya operativo, pero con un riesgo estructural pendiente) clasifica B en dry-run, nunca A ni C", async () => {
  const blueprint = { ...sectorBlueprint({ businessId: "negocio-parcial-test", sector: "padel" }), integrations: { payments: { status: "not_configured", envVars: [] } } };
  await withTempBusiness(blueprint, async (runResult) => {
    // Sin `branding` explícito -> fallback de colores produce un riesgo real de contraste (degradado, no bloqueo).
    assert.ok(runResult.risks.length > 0);
    const integrationsReadiness = computeIntegrationReadiness({ STRIPE_SECRET_KEY: "sk_test_mock_123" });
    assert.equal(integrationsReadiness.integrations.stripe.status, "SANDBOX"); // configurado en modo test, sin bloqueo
    assert.equal(integrationsReadiness.integrations.stripe.blockedBy, null);
    const status = buildBusinessStatusReport({ report: runResult, tenantConfig: runResult.tenantConfig, integrationsReadiness, scope: "dryRun" });
    assert.equal(status.classification, "B");
  });
});

test("TENANT_PROVIDERS_WITHOUT_READINESS_COVERAGE documenta exactamente el gap conocido (calendar/fileStorage/analytics)", () => {
  assert.deepEqual([...TENANT_PROVIDERS_WITHOUT_READINESS_COVERAGE].sort(), ["analytics", "calendar", "fileStorage"]);
});
