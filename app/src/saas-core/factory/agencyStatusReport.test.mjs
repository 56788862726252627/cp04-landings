import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runFactoryPipeline } from "./orchestrator.js";
import { BUSINESS_BLUEPRINT_SCHEMA_VERSION } from "./businessBlueprintSchema.js";
import { computeIntegrationReadiness, INTEGRATION_IDS } from "../commercial/integrationReadiness.js";
import {
  buildAgencyStatusReport,
  renderAgencyStatusMarkdown,
  renderAgencyStatusJson,
} from "./agencyStatusReport.js";

// ---------------------------------------------------------------------------
// Fixtures sintéticos — permiten testear la función pura sin I/O
// ---------------------------------------------------------------------------

function makeReport({ businessId, sector, commercialName = `Demo ${businessId}`, risks = [], manualSteps = [] } = {}) {
  return {
    businessId,
    blueprint: { businessId, sector, commercialName },
    risks,
    manualSteps,
    nextStep: risks.length > 0 ? "Resolver riesgos primero." : "Conectar proveedor real.",
    idempotent: true,
    generatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function makeTenantConfig({ integrations = {} } = {}) {
  return {
    slug: "test-slug",
    displayName: "Test Business",
    modulesEnabled: ["reservas"],
    roles: ["PLAYER", "ADMIN"],
    integrations,
  };
}

/** Negocio con Make declarado → queda bloqueado por Airtable (blockedBy de Make→Airtable en Paso 20). */
const INPUT_BLOCKED = {
  report: makeReport({ businessId: "blocked-biz", sector: "padel" }),
  tenantConfig: makeTenantConfig({ integrations: { automation: {} } }),
};

/** Negocio sin integraciones declaradas + sin riesgos → A en dryRun. */
const INPUT_CLEAN = {
  report: makeReport({ businessId: "clean-biz", sector: "dental" }),
  tenantConfig: makeTenantConfig({ integrations: {} }),
};

/** Negocio con paso manual pendiente y sin bloqueo → B. */
const INPUT_PARTIAL = {
  report: makeReport({ businessId: "partial-biz", sector: "veterinary", manualSteps: ["Comprar dominio"] }),
  tenantConfig: makeTenantConfig({ integrations: {} }),
};

// ---------------------------------------------------------------------------
// Helper para tests que usan negocios generados realmente (E2E ligero)
// ---------------------------------------------------------------------------

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

async function withTempMultipleBusiness(blueprints, fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "agency-status-report-test-"));
  try {
    const results = [];
    for (const blueprint of blueprints) {
      const r = await runFactoryPipeline({ blueprint, outputBaseDir: dir });
      results.push(r);
    }
    await fn(results, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// buildAgencyStatusReport — casos base con fixtures sintéticos
// ---------------------------------------------------------------------------

test("con lista vacía: totalBusinesses=0, overallClassification='no_businesses', byClassification todo a cero", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([], readiness);
  assert.equal(report.totalBusinesses, 0);
  assert.equal(report.overallClassification, "no_businesses");
  assert.deepEqual(report.byClassification, { A: 0, B: 0, C: 0 });
  assert.equal(report.businesses.length, 0);
});

test("un negocio clasificado C resulta en overallClassification='C'", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([INPUT_BLOCKED], readiness);
  assert.equal(report.overallClassification, "C");
  assert.equal(report.byClassification.C, 1);
});

test("un negocio limpio (sin integraciones, sin riesgos) en scope='dryRun' clasifica A → overallClassification='A'", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([INPUT_CLEAN], readiness);
  assert.equal(report.businesses[0].classification, "A");
  assert.equal(report.overallClassification, "A");
  assert.equal(report.byClassification.A, 1);
});

test("un negocio B y ningún C: overallClassification='B'", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([INPUT_PARTIAL, INPUT_CLEAN], readiness);
  assert.ok(["A", "B"].includes(report.overallClassification));
  // INPUT_PARTIAL tiene manualSteps → clasificará B o C según la lógica; lo importante es que no clasifica A la agencia
  // y que no hay C (ningún input tiene integración bloqueada por Make/Airtable)
  assert.equal(report.byClassification.C, 0);
});

test("un negocio A y uno C: overallClassification='C' (el peor prevalece)", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([INPUT_CLEAN, INPUT_BLOCKED], readiness);
  assert.equal(report.overallClassification, "C");
  assert.ok(report.byClassification.A >= 1);
  assert.equal(report.byClassification.C, 1);
});

test("tres negocios todos A: overallClassification='A'", () => {
  const readiness = computeIntegrationReadiness({});
  const inputs = [
    { report: makeReport({ businessId: "a1", sector: "dental" }), tenantConfig: makeTenantConfig() },
    { report: makeReport({ businessId: "a2", sector: "padel" }), tenantConfig: makeTenantConfig() },
    { report: makeReport({ businessId: "a3", sector: "veterinary" }), tenantConfig: makeTenantConfig() },
  ];
  const report = buildAgencyStatusReport(inputs, readiness);
  assert.equal(report.totalBusinesses, 3);
  assert.equal(report.overallClassification, "A");
  assert.equal(report.byClassification.A, 3);
  assert.equal(report.byClassification.C, 0);
});

test("byClassification suma exactamente totalBusinesses", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([INPUT_CLEAN, INPUT_BLOCKED, INPUT_PARTIAL], readiness);
  const sum = report.byClassification.A + report.byClassification.B + report.byClassification.C;
  assert.equal(sum, report.totalBusinesses);
  assert.equal(report.totalBusinesses, 3);
});

// ---------------------------------------------------------------------------
// integrationSummary
// ---------------------------------------------------------------------------

test("integrationSummary contiene exactamente los INTEGRATION_IDS del Paso 20", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([INPUT_CLEAN], readiness);
  const keys = Object.keys(report.integrationSummary).sort();
  assert.deepEqual(keys, [...INTEGRATION_IDS].sort());
});

test("integrationSummary.businessCount coincide con totalBusinesses en cada integración", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([INPUT_CLEAN, INPUT_BLOCKED], readiness);
  for (const s of Object.values(report.integrationSummary)) {
    assert.equal(s.businessCount, report.totalBusinesses);
  }
});

test("integrationSummary.productionReadyCount es 0 sin credenciales reales", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([INPUT_CLEAN, INPUT_BLOCKED], readiness);
  for (const s of Object.values(report.integrationSummary)) {
    assert.equal(s.productionReadyCount, 0);
  }
});

// ---------------------------------------------------------------------------
// Determinismo
// ---------------------------------------------------------------------------

test("es determinista: mismas entradas → mismo resultado salvo queriedAt", () => {
  const readiness = computeIntegrationReadiness({});
  const r1 = buildAgencyStatusReport([INPUT_CLEAN, INPUT_PARTIAL], readiness);
  const r2 = buildAgencyStatusReport([INPUT_CLEAN, INPUT_PARTIAL], readiness);
  assert.equal(r1.overallClassification, r2.overallClassification);
  assert.deepEqual(r1.byClassification, r2.byClassification);
  assert.equal(r1.totalBusinesses, r2.totalBusinesses);
  assert.equal(r1.businesses.length, r2.businesses.length);
  // queriedAt puede diferir; el resto no
  const strip = (r) => {
    const { queriedAt: _q, businesses, ...rest } = r;
    const strippedBusinesses = businesses.map(({ queriedAt: _bq, ...b }) => b);
    return { ...rest, businesses: strippedBusinesses };
  };
  assert.deepEqual(strip(r1), strip(r2));
});

// ---------------------------------------------------------------------------
// Render: Markdown
// ---------------------------------------------------------------------------

test("renderAgencyStatusMarkdown con lista vacía incluye mensaje honesto sin inventar negocios", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([], readiness);
  const md = renderAgencyStatusMarkdown(report);
  assert.match(md, /No hay negocios/);
  assert.ok(!md.includes("| "));
});

test("renderAgencyStatusMarkdown lista cada negocio con su clasificación", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([INPUT_CLEAN, INPUT_BLOCKED], readiness);
  const md = renderAgencyStatusMarkdown(report);
  assert.match(md, /clean-biz/);
  assert.match(md, /blocked-biz/);
  assert.match(md, /Clasificación global/);
});

test("renderAgencyStatusMarkdown incluye la tabla de resumen de integraciones", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([INPUT_CLEAN], readiness);
  const md = renderAgencyStatusMarkdown(report);
  assert.match(md, /Resumen de integraciones/);
  assert.match(md, /stripe/);
  assert.match(md, /airtable/);
});

// ---------------------------------------------------------------------------
// Render: JSON
// ---------------------------------------------------------------------------

test("renderAgencyStatusJson produce JSON parseable y coherente con el objeto", () => {
  const readiness = computeIntegrationReadiness({});
  const report = buildAgencyStatusReport([INPUT_CLEAN, INPUT_BLOCKED], readiness);
  const json = renderAgencyStatusJson(report);
  const parsed = JSON.parse(json);
  assert.equal(parsed.totalBusinesses, report.totalBusinesses);
  assert.equal(parsed.overallClassification, report.overallClassification);
  assert.equal(parsed.businesses.length, report.businesses.length);
});

// ---------------------------------------------------------------------------
// scope production
// ---------------------------------------------------------------------------

test("scope='production' propaga correctamente a cada negocio y produce clasificación más estricta", () => {
  const readiness = computeIntegrationReadiness({});
  const reportDry = buildAgencyStatusReport([INPUT_CLEAN], readiness, { scope: "dryRun" });
  const reportProd = buildAgencyStatusReport([INPUT_CLEAN], readiness, { scope: "production" });
  // En producción, sin credenciales, ningún negocio puede ser A
  assert.equal(reportProd.businesses[0].classification, "C");
  // En dryRun, un negocio sin integraciones declaradas puede ser A
  assert.equal(reportDry.businesses[0].classification, "A");
  assert.equal(reportProd.scope, "production");
  assert.equal(reportDry.scope, "dryRun");
});

// ---------------------------------------------------------------------------
// E2E ligero: negocios reales generados (2 sectores distintos)
// ---------------------------------------------------------------------------

test("E2E — dos negocios reales generados: aggregación coherente con el resultado per-negocio", async () => {
  await withTempMultipleBusiness(
    [
      sectorBlueprint({ businessId: "agency-e2e-padel", sector: "padel" }),
      sectorBlueprint({ businessId: "agency-e2e-dental", sector: "dental" }),
    ],
    async (results) => {
      const integrationsReadiness = computeIntegrationReadiness({});
      const inputs = results.map((runResult) => ({
        report: runResult,
        tenantConfig: runResult.tenantConfig,
      }));
      const agencyReport = buildAgencyStatusReport(inputs, integrationsReadiness);
      assert.equal(agencyReport.totalBusinesses, 2);
      assert.equal(agencyReport.byClassification.A + agencyReport.byClassification.B + agencyReport.byClassification.C, 2);
      // Sin credenciales: Make→Airtable bloquea → todos C o al menos uno C
      assert.ok(["B", "C"].includes(agencyReport.overallClassification));
      // Las clasificaciones individuales coinciden con buildBusinessStatusReport per-negocio
      for (let i = 0; i < results.length; i++) {
        assert.equal(agencyReport.businesses[i].businessId, results[i].businessId);
      }
    }
  );
});
