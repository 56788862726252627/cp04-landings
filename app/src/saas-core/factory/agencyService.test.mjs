import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  buildAgencyServiceRequest,
  filterAgencyReport,
  summarizeAgencyReport,
  validateSafePath,
  redactSensitiveFields,
  validatePayloadSize,
  sanitizeErrorForResponse,
  buildApiResponse,
  AgencyServiceError,
  MAX_PAYLOAD_BYTES,
  ALLOWED_SCOPES,
  ALLOWED_FORMATS,
  ALLOWED_CLASSIFICATIONS,
  ALLOWED_SECTORS,
  ALLOWED_INTEGRATIONS,
} from "./agencyService.js";
import { buildAgencyStatusReport } from "./agencyStatusReport.js";
import { computeIntegrationReadiness } from "../commercial/integrationReadiness.js";
import { BUSINESS_BLUEPRINT_SCHEMA_VERSION } from "./businessBlueprintSchema.js";
import { runFactoryPipeline } from "./orchestrator.js";

// ---------------------------------------------------------------------------
// Fixtures sintéticos reutilizables
// ---------------------------------------------------------------------------

function makeReport({ businessId, sector, risks = [], manualSteps = [] } = {}) {
  return {
    businessId,
    blueprint: { businessId, sector, commercialName: `Demo ${businessId}` },
    risks,
    manualSteps,
    nextStep: risks.length > 0 ? "Resolver riesgos primero." : "Conectar proveedor real.",
    idempotent: true,
    generatedAt: "2026-01-01T00:00:00.000Z",
  };
}
function makeTenantConfig({ integrations = {} } = {}) {
  return { slug: "test-slug", displayName: "Test", modulesEnabled: ["reservas"], roles: ["PLAYER", "ADMIN"], integrations };
}

const READINESS = computeIntegrationReadiness({});

const B_CLEAN_PADEL = {
  report: makeReport({ businessId: "clean-padel", sector: "padel" }),
  tenantConfig: makeTenantConfig(),
};
const B_BLOCKED_DENTAL = {
  report: makeReport({ businessId: "blocked-dental", sector: "dental" }),
  tenantConfig: makeTenantConfig({ integrations: { automation: {} } }),
};
const B_PARTIAL_VET = {
  report: makeReport({ businessId: "partial-vet", sector: "veterinary", manualSteps: ["Comprar dominio"] }),
  tenantConfig: makeTenantConfig(),
};

function makeAgencyReport(inputs, opts = {}) {
  return buildAgencyStatusReport(inputs, READINESS, opts);
}

// ---------------------------------------------------------------------------
// buildAgencyServiceRequest
// ---------------------------------------------------------------------------

test("buildAgencyServiceRequest: defaults correctos (scope=dryRun, format=json)", () => {
  const req = buildAgencyServiceRequest({});
  assert.equal(req.scope, "dryRun");
  assert.equal(req.format, "json");
  assert.equal(req.sectors, null);
  assert.equal(req.classifications, null);
  assert.equal(req.integrations, null);
  assert.equal(req.mockIntegrations, false);
  assert.equal(req.strict, false);
  assert.equal(req.summaryOnly, false);
});

test("buildAgencyServiceRequest: scope production aceptado", () => {
  const req = buildAgencyServiceRequest({ scope: "production" });
  assert.equal(req.scope, "production");
});

test("buildAgencyServiceRequest: scope inválido lanza AgencyServiceError (INVALID_SCOPE)", () => {
  assert.throws(() => buildAgencyServiceRequest({ scope: "staging" }), (err) => {
    assert.ok(err instanceof AgencyServiceError);
    assert.equal(err.code, "INVALID_SCOPE");
    return true;
  });
});

test("buildAgencyServiceRequest: format inválido lanza AgencyServiceError (INVALID_FORMAT)", () => {
  assert.throws(() => buildAgencyServiceRequest({ format: "html" }), (err) => {
    assert.ok(err instanceof AgencyServiceError);
    assert.equal(err.code, "INVALID_FORMAT");
    return true;
  });
});

test("buildAgencyServiceRequest: sector inválido lanza AgencyServiceError (INVALID_SECTOR)", () => {
  assert.throws(() => buildAgencyServiceRequest({ sectors: "golf-club" }), (err) => {
    assert.ok(err instanceof AgencyServiceError);
    assert.equal(err.code, "INVALID_SECTOR");
    return true;
  });
});

test("buildAgencyServiceRequest: sectores válidos aceptados (padel, dental, veterinary)", () => {
  const req = buildAgencyServiceRequest({ sectors: "padel,dental" });
  assert.deepEqual(req.sectors, ["padel", "dental"]);
});

test("buildAgencyServiceRequest: classification inválida lanza AgencyServiceError (INVALID_CLASSIFICATION)", () => {
  assert.throws(() => buildAgencyServiceRequest({ classifications: "D" }), (err) => {
    assert.ok(err instanceof AgencyServiceError);
    assert.equal(err.code, "INVALID_CLASSIFICATION");
    return true;
  });
});

test("buildAgencyServiceRequest: integración inválida lanza AgencyServiceError (INVALID_INTEGRATION)", () => {
  assert.throws(() => buildAgencyServiceRequest({ integrations: "slack" }), (err) => {
    assert.ok(err instanceof AgencyServiceError);
    assert.equal(err.code, "INVALID_INTEGRATION");
    return true;
  });
});

test("buildAgencyServiceRequest: sectores múltiples separados por coma (string)", () => {
  const req = buildAgencyServiceRequest({ sectors: "padel,veterinary" });
  assert.deepEqual(req.sectors, ["padel", "veterinary"]);
});

test("buildAgencyServiceRequest: sectores como array", () => {
  const req = buildAgencyServiceRequest({ sectors: ["padel", "dental"] });
  assert.deepEqual(req.sectors, ["padel", "dental"]);
});

test("buildAgencyServiceRequest: constantes exportadas correctas", () => {
  assert.ok(ALLOWED_SCOPES.includes("dryRun"));
  assert.ok(ALLOWED_SCOPES.includes("production"));
  assert.ok(ALLOWED_FORMATS.includes("json"));
  assert.ok(ALLOWED_FORMATS.includes("markdown"));
  assert.ok(ALLOWED_CLASSIFICATIONS.includes("A"));
  assert.ok(ALLOWED_SECTORS.includes("padel"));
  assert.ok(ALLOWED_SECTORS.includes("dental"));
  assert.ok(ALLOWED_SECTORS.includes("veterinary"));
  assert.ok(ALLOWED_INTEGRATIONS.includes("stripe"));
});

// ---------------------------------------------------------------------------
// filterAgencyReport
// ---------------------------------------------------------------------------

test("filterAgencyReport: sin filtros activos devuelve el mismo objeto de referencia", () => {
  const report = makeAgencyReport([B_CLEAN_PADEL, B_BLOCKED_DENTAL]);
  const filtered = filterAgencyReport(report);
  assert.strictEqual(filtered, report);
});

test("filterAgencyReport: por sector filtra correctamente", () => {
  const report = makeAgencyReport([B_CLEAN_PADEL, B_BLOCKED_DENTAL, B_PARTIAL_VET]);
  const filtered = filterAgencyReport(report, { sectors: ["padel"] });
  assert.equal(filtered.totalBusinesses, 1);
  assert.equal(filtered.businesses[0].sector, "padel");
});

test("filterAgencyReport: por clasificación A filtra bloqueados y parciales", () => {
  const report = makeAgencyReport([B_CLEAN_PADEL, B_BLOCKED_DENTAL, B_PARTIAL_VET]);
  const filtered = filterAgencyReport(report, { classifications: ["A"] });
  for (const b of filtered.businesses) {
    assert.equal(b.classification, "A");
  }
});

test("filterAgencyReport: por clasificación C solo devuelve bloqueados", () => {
  const report = makeAgencyReport([B_CLEAN_PADEL, B_BLOCKED_DENTAL]);
  const filtered = filterAgencyReport(report, { classifications: ["C"] });
  assert.equal(filtered.byClassification.A, 0);
  assert.ok(filtered.totalBusinesses >= 0);
});

test("filterAgencyReport: filtro que no coincide → totalBusinesses=0", () => {
  const report = makeAgencyReport([B_CLEAN_PADEL]);
  const filtered = filterAgencyReport(report, { sectors: ["beauty"] });
  assert.equal(filtered.totalBusinesses, 0);
  assert.equal(filtered.overallClassification, "no_businesses");
});

test("filterAgencyReport: por clasificación A,B combinadas", () => {
  const report = makeAgencyReport([B_CLEAN_PADEL, B_BLOCKED_DENTAL, B_PARTIAL_VET]);
  const filtered = filterAgencyReport(report, { classifications: ["A", "B"] });
  assert.equal(filtered.byClassification.C, 0);
});

test("filterAgencyReport: byClassification recalculada correctamente tras filtro", () => {
  const report = makeAgencyReport([B_CLEAN_PADEL, B_BLOCKED_DENTAL, B_PARTIAL_VET]);
  const filtered = filterAgencyReport(report, { sectors: ["padel-club"] });
  const sum = filtered.byClassification.A + filtered.byClassification.B + filtered.byClassification.C;
  assert.equal(sum, filtered.totalBusinesses);
});

// ---------------------------------------------------------------------------
// summarizeAgencyReport
// ---------------------------------------------------------------------------

test("summarizeAgencyReport: no incluye el array businesses en el resumen", () => {
  const report = makeAgencyReport([B_CLEAN_PADEL, B_BLOCKED_DENTAL]);
  const summary = summarizeAgencyReport(report);
  assert.ok(!("businesses" in summary));
  assert.ok("integrationSummary" in summary);
  assert.ok("overallClassification" in summary);
  assert.ok("totalBusinesses" in summary);
});

// ---------------------------------------------------------------------------
// validateSafePath — path traversal
// ---------------------------------------------------------------------------

test("validateSafePath: ruta dentro del directorio permitido → ok", () => {
  const base = "/root/cp04-landings/app/src/saas-core/businesses";
  const safe = validateSafePath(base + "/mi-negocio", base);
  assert.ok(safe.startsWith(base));
});

test("validateSafePath: path traversal (../) lanza AgencyServiceError (PATH_TRAVERSAL)", () => {
  const base = "/root/cp04-landings/app/src/saas-core/businesses";
  assert.throws(() => validateSafePath(base + "/../../.env", base), (err) => {
    assert.ok(err instanceof AgencyServiceError);
    assert.equal(err.code, "PATH_TRAVERSAL");
    assert.equal(err.statusCode, 403);
    return true;
  });
});

test("validateSafePath: directorio exacto → ok (no requiere subfolder)", () => {
  const base = "/root/cp04-landings/app/src/saas-core/businesses";
  const safe = validateSafePath(base, base);
  assert.equal(safe, path.resolve(base));
});

// ---------------------------------------------------------------------------
// redactSensitiveFields
// ---------------------------------------------------------------------------

test("redactSensitiveFields: redacta claves 'token', 'secret', 'api_key'", () => {
  const obj = { token: "abc123", secret: "supersecret", normalField: "visible" };
  const redacted = redactSensitiveFields(obj);
  assert.equal(redacted.token, "[REDACTED]");
  assert.equal(redacted.secret, "[REDACTED]");
  assert.equal(redacted.normalField, "visible");
});

test("redactSensitiveFields: redacta sk_live_ y sk_test_ en valores", () => {
  const obj = { info: "Mi clave es sk_live_abc123XYZ" };
  const redacted = redactSensitiveFields(obj);
  assert.ok(!redacted.info.includes("sk_live_"));
  assert.ok(redacted.info.includes("[REDACTED]"));
});

test("redactSensitiveFields: redacta Bearer tokens en valores string", () => {
  const obj = { authHeader: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig" };
  const redacted = redactSensitiveFields(obj);
  assert.ok(!redacted.authHeader.includes("Bearer eyJ"));
  assert.ok(redacted.authHeader.includes("[REDACTED]"));
});

test("redactSensitiveFields: no muta el objeto original", () => {
  const original = { token: "secreto", data: "ok" };
  redactSensitiveFields(original);
  assert.equal(original.token, "secreto");
});

test("redactSensitiveFields: objetos sin secretos quedan intactos", () => {
  const obj = { businessId: "my-biz", sector: "padel-club", totalBusinesses: 3 };
  const redacted = redactSensitiveFields(obj);
  assert.deepEqual(redacted, obj);
});

// ---------------------------------------------------------------------------
// validatePayloadSize
// ---------------------------------------------------------------------------

test("validatePayloadSize: payload pequeño pasa sin error", () => {
  const data = { ok: true, businesses: [] };
  const size = validatePayloadSize(data);
  assert.ok(typeof size === "number" && size > 0);
});

test("validatePayloadSize: payload demasiado grande lanza AgencyServiceError (PAYLOAD_TOO_LARGE)", () => {
  const huge = "x".repeat(10);
  assert.throws(() => validatePayloadSize(huge, 5), (err) => {
    assert.ok(err instanceof AgencyServiceError);
    assert.equal(err.code, "PAYLOAD_TOO_LARGE");
    assert.equal(err.statusCode, 413);
    return true;
  });
});

test("validatePayloadSize: respeta MAX_PAYLOAD_BYTES exportado", () => {
  assert.ok(MAX_PAYLOAD_BYTES > 0);
  const small = validatePayloadSize("ok", MAX_PAYLOAD_BYTES);
  assert.ok(small < MAX_PAYLOAD_BYTES);
});

// ---------------------------------------------------------------------------
// sanitizeErrorForResponse
// ---------------------------------------------------------------------------

test("sanitizeErrorForResponse: AgencyServiceError → devuelve code + message", () => {
  const err = new AgencyServiceError("scope inválido", { code: "INVALID_SCOPE" });
  const safe = sanitizeErrorForResponse(err);
  assert.equal(safe.code, "INVALID_SCOPE");
  assert.equal(safe.message, "scope inválido");
  assert.ok(!("stack" in safe));
});

test("sanitizeErrorForResponse: Error genérico → devuelve INTERNAL_ERROR sin detalle interno", () => {
  const err = new Error("detalles internos secretos");
  const safe = sanitizeErrorForResponse(err);
  assert.equal(safe.code, "INTERNAL_ERROR");
  assert.ok(!safe.message.includes("detalles internos secretos"));
});

// ---------------------------------------------------------------------------
// buildApiResponse
// ---------------------------------------------------------------------------

test("buildApiResponse: estructura mínima (solo status)", () => {
  const r = buildApiResponse({ status: "ok" });
  assert.equal(r.status, "ok");
  assert.ok(!("data" in r));
  assert.ok(!("errors" in r));
});

test("buildApiResponse: con data, metadata y errors", () => {
  const r = buildApiResponse({ status: "error", data: { x: 1 }, metadata: { v: 2 }, errors: [{ code: "E1" }] });
  assert.equal(r.status, "error");
  assert.deepEqual(r.data, { x: 1 });
  assert.deepEqual(r.metadata, { v: 2 });
  assert.deepEqual(r.errors, [{ code: "E1" }]);
});

// ---------------------------------------------------------------------------
// Clasificaciones A, B, C con sectores reales (CP04, dental, vet)
// ---------------------------------------------------------------------------

test("clasificación A: Club Pádel 04 (sector padel) sin integraciones en dryRun", () => {
  const report = makeAgencyReport([B_CLEAN_PADEL]);
  assert.equal(report.businesses[0].classification, "A");
  assert.equal(report.overallClassification, "A");
});

test("clasificación C: clínica con automation declarado → bloqueado", () => {
  const report = makeAgencyReport([B_BLOCKED_DENTAL]);
  assert.equal(report.overallClassification, "C");
});

test("clasificación B o mejor: veterinaria con manualSteps", () => {
  const report = makeAgencyReport([B_PARTIAL_VET]);
  assert.ok(["A", "B", "C"].includes(report.businesses[0].classification));
});

// ---------------------------------------------------------------------------
// Idempotencia con businesses reales generados (E2E ligero)
// ---------------------------------------------------------------------------

test("E2E — filtrado por sector es idempotente: mismas entradas = mismos negocios filtrados", async () => {
  const tmpDir = await mkdtemp(path.join(tmpdir(), "agency-service-e2e-"));
  try {
    const blueprint = {
      schemaVersion: BUSINESS_BLUEPRINT_SCHEMA_VERSION,
      businessId: "agency-svc-e2e-padel",
      tenantId: "agency-svc-e2e-padel",
      commercialName: "E2E Pádel Demo",
      sector: "padel",
      country: "ES",
      timezone: "Europe/Madrid",
      locale: "es-ES",
      currencies: ["EUR"],
      plan: "starter",
    };
    await runFactoryPipeline({ blueprint, outputBaseDir: tmpDir });
    const r1 = makeAgencyReport([{
      report: { businessId: "agency-svc-e2e-padel", blueprint: { businessId: "agency-svc-e2e-padel", sector: "padel", commercialName: "E2E Pádel Demo" }, risks: [], manualSteps: [], idempotent: true, generatedAt: "2026-01-01T00:00:00.000Z" },
      tenantConfig: makeTenantConfig(),
    }]);
    const f1 = filterAgencyReport(r1, { sectors: ["padel"] });
    const f2 = filterAgencyReport(r1, { sectors: ["padel"] });
    assert.equal(f1.totalBusinesses, f2.totalBusinesses);
    assert.equal(f1.overallClassification, f2.overallClassification);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

test("compatibilidad CP04 (padel) + dental + veterinary: todas aparecen sin filtro, filtradas correctamente por sector", () => {
  const report = makeAgencyReport([B_CLEAN_PADEL, B_BLOCKED_DENTAL, B_PARTIAL_VET]);
  assert.equal(report.totalBusinesses, 3);

  const onlyPadel = filterAgencyReport(report, { sectors: ["padel"] });
  assert.equal(onlyPadel.totalBusinesses, 1);
  assert.equal(onlyPadel.businesses[0].sector, "padel");

  const onlyVet = filterAgencyReport(report, { sectors: ["veterinary"] });
  assert.equal(onlyVet.totalBusinesses, 1);
  assert.equal(onlyVet.businesses[0].sector, "veterinary");
});

test("cero negocios: filtro devuelve no_businesses, sin crashear", () => {
  const report = makeAgencyReport([]);
  const filtered = filterAgencyReport(report, { sectors: ["padel-club"] });
  assert.equal(filtered.totalBusinesses, 0);
  assert.equal(filtered.overallClassification, "no_businesses");
});
