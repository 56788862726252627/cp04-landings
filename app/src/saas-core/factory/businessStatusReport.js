// Prompt Agencia IA 4/7 — Informe de preparación por negocio generado.
//
// Reutiliza (no duplica):
//   - `computeIntegrationReadiness` (commercial/integrationReadiness.js, Paso 20)
//     para el estado real de las 11 integraciones ya modeladas.
//   - `computeOperationalStates`/`classifyReadiness` (./operationalState.js,
//     este mismo prompt) para el modelo de 8 estados + clasificación A/B/C.
//   - el `report.json` ya generado por el orquestador (Paso 10) para
//     módulos/riesgos/pasos manuales/siguiente paso — no se recalculan aquí.
//
// Este módulo es de solo lectura y puro: no llama a `computeIntegrationReadiness`
// por sí mismo (el caller decide qué `env` usar, normalmente `process.env`,
// nunca hardcoded) y no escribe nada en disco. El propio `report.json`
// determinista del Paso 10 NO se modifica — este informe es un artefacto
// derivado y explícitamente dinámico (ver docs/paso-22-.../README.md,
// sección "Reproducibilidad").

import { INTEGRATION_IDS } from "../commercial/integrationReadiness.js";
import { computeOperationalStates, classifyReadiness } from "./operationalState.js";

/** Providers declarados en `tenantConfig.integrations` (Paso 10) → id de `INTEGRATION_IDS` (Paso 20). */
const TENANT_PROVIDER_TO_INTEGRATION_ID = Object.freeze({
  dataRepository: "airtable",
  automation: "make",
  payments: "stripe",
  messaging: "whatsapp",
  email: "gmail",
});

/** Providers de `tenantConfig.integrations` que hoy NO tienen id equivalente en `computeIntegrationReadiness` (Paso 20). Gap conocido: no se inventa un id nuevo sin confirmación explícita (ver README del prompt). */
export const TENANT_PROVIDERS_WITHOUT_READINESS_COVERAGE = Object.freeze(["calendar", "fileStorage", "analytics"]);

const ADAPTER_AVAILABILITY = Object.freeze({
  airtable: { available: true, module: "src/saas-core/commercial/airtableAdapter.js" },
  stripe: { available: true, module: "src/saas-core/commercial/stripeAdapter.js" },
  whatsapp: { available: true, module: "src/saas-core/commercial/whatsappAdapter.js" },
  googleDrive: { available: true, module: "src/saas-core/deliverables/driveRealAdapter.js" },
  make: { available: false, module: null },
  gmail: { available: false, module: null },
  domain: { available: false, module: null },
  ssl: { available: false, module: null },
  hosting: { available: false, module: null },
  backups: { available: false, module: null },
  monitoring: { available: false, module: null },
});

const TESTS_AVAILABILITY = Object.freeze({
  airtable: { available: true, ref: "src/saas-core/commercial/airtableAdapter.test.mjs" },
  stripe: { available: true, ref: "src/saas-core/commercial/stripeAdapter.test.mjs" },
  whatsapp: { available: true, ref: "src/saas-core/commercial/whatsappAdapter.test.mjs" },
  googleDrive: { available: true, ref: "src/saas-core/deliverables/driveRealAdapter.test.mjs" },
  make: { available: false, ref: null },
  gmail: { available: false, ref: null },
  domain: { available: false, ref: null },
  ssl: { available: false, ref: null },
  hosting: { available: false, ref: null },
  backups: { available: false, ref: null },
  monitoring: { available: false, ref: null },
});

// "webhooks/API" (enunciado, sección 2) no es un id propio en `INTEGRATION_IDS`
// — se cubre de forma distribuida en los proveedores que ya declaran un
// webhook real en sus `requirements` (Stripe/WhatsApp). Se documenta aquí
// como equivalencia explícita en vez de crear un id nuevo (que rompería
// `INTEGRATION_IDS`, congelado y usado por 24 escenarios E2E comerciales).
const WEBHOOK_COVERAGE_BY_ID = Object.freeze({
  stripe: true,
  whatsapp: true,
});

function deriveMode(status) {
  if (status === "NOT_CONFIGURED" || status === "READY_FOR_CREDENTIALS") return "not_configured";
  if (status === "MOCK") return "mock";
  if (status === "SANDBOX" || status === "TESTING") return "dry_run";
  if (status === "READY_FOR_PRODUCTION" || status === "PRODUCTION") return "production";
  return "degraded_or_error"; // DEGRADED | ERROR
}

/**
 * Providers de `tenantConfig.integrations` (Paso 10) que sí tienen id
 * equivalente en `INTEGRATION_IDS` (Paso 20), traducidos.
 */
export function resolveDeclaredIntegrationIdsFromTenantConfig(tenantConfig) {
  const providers = Object.keys(tenantConfig?.integrations || {});
  const ids = providers.map((p) => TENANT_PROVIDER_TO_INTEGRATION_ID[p]).filter(Boolean);
  return [...new Set(ids)];
}

/**
 * ids relevantes para el cálculo de estado operativo según el alcance:
 * - "dryRun": solo lo que el propio negocio declara usar (un demo no necesita dominio/hosting/SSL).
 * - "production": las 11 integraciones — producción real exige TODO, no solo lo declarado (honestidad
 *   sobre preparación real, coherente con el resto de auditorías de este proyecto).
 */
export function resolveRelevantIntegrationIds({ tenantConfig, scope = "dryRun" }) {
  if (scope === "production") return [...INTEGRATION_IDS];
  return resolveDeclaredIntegrationIdsFromTenantConfig(tenantConfig);
}

// ids cuyo `status` (Paso 20) depende realmente de la presencia de
// credenciales en `env`. El resto (make/domain/ssl/hosting/backups/
// monitoring) tiene un `status` que NO depende de credenciales (make
// depende del nº de flujos validados; los 5 de infraestructura están
// fijos en NOT_CONFIGURED por diseño, ver integrationReadiness.js) —
// para esos, afirmar "credenciales ausentes" sería una inferencia falsa.
const CREDENTIAL_GATED_IDS = Object.freeze(["airtable", "stripe", "whatsapp", "gmail", "googleDrive"]);

/** Construye la fila de matriz para una integración (sección 2 del enunciado: estado/modo/credenciales/adaptador/pruebas/última validación/dependencia manual/bloqueo/recomendación). */
function buildMatrixRow(entry, { relevant }) {
  const adapter = ADAPTER_AVAILABILITY[entry.id] || { available: false, module: null };
  const tests = TESTS_AVAILABILITY[entry.id] || { available: false, ref: null };
  const credentialsPresent = CREDENTIAL_GATED_IDS.includes(entry.id) ? entry.status !== "NOT_CONFIGURED" : null; // null = no aplica (no inferible desde `status`)
  return Object.freeze({
    id: entry.id,
    label: entry.label,
    relevantToThisScope: relevant,
    status: entry.status,
    mode: deriveMode(entry.status),
    credentialsPresent, // nunca se expone el VALOR de ninguna credencial, solo si hay alguna presente (o null si no aplica)
    credentialsNeeded: [...entry.credentialsNeeded],
    adapterAvailable: adapter.available,
    adapterModule: adapter.module,
    testsAvailable: tests.available,
    testsRef: tests.ref,
    lastValidatedIso: entry.lastCheckedIso, // Paso 20: siempre null — nunca se ha ejecutado una comprobación real
    manualDependencyPending: entry.credentialsNeeded.length > 0 && credentialsPresent === false,
    blockedBy: entry.blockedBy,
    webhookCovered: WEBHOOK_COVERAGE_BY_ID[entry.id] ?? null,
    nextSteps: [...entry.nextSteps],
  });
}

/** Construye la matriz completa (siempre las 11 integraciones — la sección 2 exige "al menos" esa lista como suelo, no como filtro). */
export function buildIntegrationMatrix(integrationsReadiness, { relevantIds = [] } = {}) {
  const relevantSet = new Set(relevantIds);
  return INTEGRATION_IDS.map((id) => buildMatrixRow(integrationsReadiness.integrations[id], { relevant: relevantSet.has(id) }));
}

/**
 * Informe de preparación de un negocio generado (sección 4 del enunciado).
 * No hace I/O: recibe ya cargados `report` (report.json de Paso 10),
 * `tenantConfig` (tenant.config.json) y `integrationsReadiness`
 * (`computeIntegrationReadiness(env)`, calculado por el caller).
 */
export function buildBusinessStatusReport({ report, tenantConfig, integrationsReadiness, scope = "dryRun" }) {
  const relevantIds = resolveRelevantIntegrationIds({ tenantConfig, scope });
  const matrix = buildIntegrationMatrix(integrationsReadiness, { relevantIds });

  const states = computeOperationalStates({
    risks: report.risks || [],
    manualSteps: report.manualSteps || [],
    declaredIntegrationIds: relevantIds,
    integrationsById: integrationsReadiness.integrations,
  });
  const classification = classifyReadiness(states, { scope });

  const coverageGaps = Object.keys(tenantConfig?.integrations || {})
    .filter((p) => TENANT_PROVIDERS_WITHOUT_READINESS_COVERAGE.includes(p))
    .map((p) => `El negocio declara el proveedor "${p}" pero no existe id equivalente en computeIntegrationReadiness (Paso 20) — gap conocido, sin inventar uno nuevo.`);

  return Object.freeze({
    businessId: report.businessId,
    sector: report.blueprint.sector,
    slug: tenantConfig.slug,
    commercialName: report.blueprint.commercialName,
    scope,
    modules: [...(tenantConfig.modulesEnabled || [])],
    roles: [...(tenantConfig.roles || [])],
    integrations: matrix,
    integrationCoverageGaps: coverageGaps,
    testsSummary: {
      generation: {
        blueprintSchemaValid: true, // precondición: report.json solo existe si el blueprint pasó validateBusinessBlueprint
        demoDataReferentialIntegrityChecked: true, // idem: runFactoryPipeline lanza si falla
        idempotentLastRun: Boolean(report.idempotent),
      },
      adapters: Object.fromEntries(matrix.filter((m) => m.relevantToThisScope).map((m) => [m.id, { testsAvailable: m.testsAvailable, ref: m.testsRef }])),
      note: "Ninguna prueba se ejecuta como parte de esta consulta (solo lectura, sin llamadas de red). Usa `npm test` para el estado vivo de la suite completa.",
    },
    operationalStates: states,
    risks: [...(report.risks || [])],
    manualActions: [...(report.manualSteps || [])],
    nextStep: report.nextStep,
    classification: classification.classification,
    classificationMissing: classification.missing,
    classificationNextStep: classification.nextStep,
    queriedAt: new Date().toISOString(), // dinámico a propósito: NO se escribe en report.json (ver sección "Reproducibilidad")
  });
}

function manualActionLine(text) {
  return `- ⚠️ ACCIÓN MANUAL: ${text}`;
}

export function renderBusinessStatusMarkdown(status) {
  const lines = [
    `# Estado operativo — ${status.commercialName}`,
    "",
    `Business ID: \`${status.businessId}\` · Slug: \`${status.slug}\` · Sector: \`${status.sector}\` · Alcance evaluado: \`${status.scope}\``,
    "",
    `## Clasificación final: ${status.classification}`,
    ...(status.classificationMissing.length > 0 ? status.classificationMissing.map((m) => `- ${m}`) : ["- (nada pendiente para este alcance)"]),
    `- Siguiente paso: ${status.classificationNextStep}`,
    "",
    "## Estados operativos activos",
    ...status.operationalStates.active.map((s) => `- ${s}`),
    "",
    "## Módulos y roles",
    `- Módulos (${status.modules.length}): ${status.modules.join(", ") || "(ninguno)"}`,
    `- Roles (${status.roles.length}): ${status.roles.join(", ") || "(ninguno)"}`,
    "",
    "## Matriz de integraciones",
    "| Integración | Relevante | Estado | Modo | Credenciales | Adaptador | Pruebas | Bloqueo |",
    "|---|---|---|---|---|---|---|---|",
    ...status.integrations.map((i) => `| ${i.label} | ${i.relevantToThisScope ? "sí" : "no"} | ${i.status} | ${i.mode} | ${i.credentialsPresent === null ? "n/a" : i.credentialsPresent ? "presentes" : "ausentes"} | ${i.adapterAvailable ? "sí" : "no"} | ${i.testsAvailable ? "sí" : "no"} | ${i.blockedBy ?? "—"} |`),
    "",
    ...(status.integrationCoverageGaps.length > 0 ? ["### Gaps de cobertura conocidos", ...status.integrationCoverageGaps.map((g) => `- ${g}`), ""] : []),
    "## Riesgos",
    ...(status.risks.length > 0 ? status.risks.map((r) => `- ${r}`) : ["- (ninguno)"]),
    "",
    "## Acciones manuales",
    ...(status.manualActions.length > 0 ? status.manualActions.map(manualActionLine) : ["- (ninguna declarada)"]),
    "",
    `## Siguiente paso recomendado (informe de generación)`,
    `- ${status.nextStep}`,
    "",
    `_Consultado: ${status.queriedAt} (dinámico — no forma parte del report.json determinista)_`,
  ];
  return lines.join("\n") + "\n";
}

export function renderBusinessStatusJson(status) {
  return JSON.stringify(status, null, 2) + "\n";
}
