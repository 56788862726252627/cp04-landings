// Paso 12 · Fase 16 — Orquestador de auditoría (Public Research & Digital
// Audit Engine). Pipeline determinista e idempotente, mismo patrón que
// factory/orchestrator.js (Paso 10): calcula el plan completo de
// escritura ANTES de tocar disco; si hay colisión sin --force, no escribe
// nada. Todo se escribe DENTRO de `research/audits/<auditId>/`, nunca en
// `saas-core/businesses/` (territorio de Paso 10) ni en el núcleo.
//
// Paso 13 añade el proveedor real `publicWebsiteFetcher` (ver
// providers/publicWebsiteFetcher.js), gateado por la bandera de tiempo de
// ejecución `allowNetwork` (nunca por defecto, nunca persistida).

import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

import { slugify } from "../../../tenant-cli/lib/tenantProvisioning.mjs";
import { assertValidResearchRequest } from "./researchRequestSchema.js";
import { evaluatePolicy } from "./researchPolicy.js";
import { buildResearchPlan } from "./researchPlanEngine.js";
import { getSectorAuditPreset, GENERIC_AUDIT_PRESET, mergeAuditPreset } from "./sectorAuditPresets.js";
import { SOURCE_ADAPTERS } from "./sourceAdapters.js";
import { collectFromPublicWebsite } from "./providers/publicWebsiteFetcher.js";
import { collectEvidenceViaProviders } from "./providers/orchestratorProviderBridge.js";
import { buildEvidenceConflictReport, buildProviderScoreBreakdown } from "./providers/evidenceAggregator.js";
import { getProviderSectorProfile, getEffectiveAuditPresetForProfile } from "./providers/providerSectorProfiles.js";
import { createEvidence } from "./evidenceSchema.js";
import { deduplicateEvidence } from "./evidenceDeduper.js";
import { evaluateAllDimensions } from "./dimensionRegistry.js";
import { computeAllScores } from "./scoringEngine.js";
import { buildRecommendations, buildBacklog, buildImpactEffortMatrix } from "./recommendationEngine.js";
import { recommendAutomationsFromFindings } from "./researchAutomationCatalog.js";
import { compareCompetitors } from "./competitorComparison.js";
import { buildReportData, renderExecutiveReportMarkdown, renderTechnicalReportMarkdown, renderCommercialReportMarkdown, renderOpportunitiesSummaryMarkdown, renderBacklogMarkdown, renderImpactEffortMatrixMarkdown, renderAutomationMapMarkdown, renderRiskReportMarkdown, renderEvidenceAppendixMarkdown, renderAuditReportJson, renderProviderRunSummaryMarkdown } from "./auditReportGenerator.js";
import { getDemoFixture, getCompetitorFixture } from "./fixtures/demoFixtures.js";

export const DEFAULT_AUDITS_DIR = path.join("src", "saas-core", "research", "audits");
export const RESEARCH_MANIFEST_FILENAME = ".research-manifest.json";

export class ResearchAuditError extends Error {}
export class RequestValidationError extends ResearchAuditError {}
export class PolicyViolationError extends ResearchAuditError {
  constructor(violations) {
    super(`El Research Request viola la política de investigación:\n${violations.map((v) => `  - ${v.input}: ${v.reason}`).join("\n")}`);
    this.violations = violations;
  }
}
export class AuditCollisionError extends ResearchAuditError {
  constructor(collisions) {
    super(`Colisión de archivos: ${collisions.length} archivo(s) existen y no fueron generados por esta auditoría. Usa --force para sobrescribir.\n${collisions.map((c) => `  - ${c.path}: ${c.reason}`).join("\n")}`);
    this.collisions = collisions;
  }
}
/** Análogo, para investigación, de una "ambigüedad crítica bloqueante": contradicciones sin resolver. Nunca escribe nada. */
export class StrictModeBlockedError extends ResearchAuditError {
  constructor(contradictions) {
    super(`--strict: ${contradictions.length} dimensión(es) con contradicciones sin resolver; no se escribió ningún archivo.\n${contradictions.map((c) => `  - ${c.dimensionId}: ${c.reason}`).join("\n")}`);
    this.contradictions = contradictions;
  }
}

function sha256(content) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

function classifyLocalFileAdapterId(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".json")) return "local_json";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "local_markdown";
  return "local_html";
}

// Paso 15 — exportada para que orchestratorProviderBridge.js (modo
// multiprovider) produzca la MISMA evidencia "unavailable" que el modo
// legacy cuando ningún proveedor real responde, sin duplicar el mensaje.
export function evidenceForUnavailableUrl(url, customReason) {
  const reason = customReason ?? `"${url}" no se consultó: el modo actual es offline o falta --allow-network. Desde Paso 13 existe un proveedor real (publicWebsiteFetcher); pasa --mode=public-web --allow-network para usarlo, o --fixtures para evidencia offline.`;
  return createEvidence({
    sourceId: url,
    sourceType: "local_html",
    title: "URL no consultada (red deshabilitada)",
    excerpt: reason,
    normalizedContent: url,
    classification: "unavailable",
    relatedDimension: "digitalMaturitySignal",
    signal: { strength: 0, polarity: "neutral" },
    confidence: 0,
    provenance: "network_disabled",
    limitations: ["Ninguna conexión de red real se realizó para esta URL en esta ejecución."],
  });
}

/** Recolecta evidencia para una fixture nombrada, tolerando adaptadores individuales fallidos (fail-soft). */
async function collectFromFixture(fixtureId, limitations) {
  const fixture = getDemoFixture(fixtureId);
  if (!fixture) {
    limitations.push(`Fixture desconocida: "${fixtureId}" (ver fixtures/demoFixtures.js).`);
    return [];
  }
  const collected = [];
  const tasks = [];
  if (fixture.htmlText) tasks.push(SOURCE_ADAPTERS.fixture_website.collect({ sourceId: fixtureId, htmlText: fixture.htmlText }));
  if (fixture.directory) tasks.push(SOURCE_ADAPTERS.mock_directory.collect({ sourceId: fixtureId, ...fixture.directory }));
  if (fixture.mapsListing) tasks.push(SOURCE_ADAPTERS.mock_maps_listing.collect({ sourceId: fixtureId, ...fixture.mapsListing }));
  if (fixture.socialPresence) tasks.push(SOURCE_ADAPTERS.mock_social_presence.collect({ sourceId: fixtureId, ...fixture.socialPresence }));
  if (fixture.reviewSummary) tasks.push(SOURCE_ADAPTERS.mock_review_summary.collect({ sourceId: fixtureId, ...fixture.reviewSummary }));
  if (fixture.performance) tasks.push(SOURCE_ADAPTERS.mock_performance.collect({ sourceId: fixtureId, ...fixture.performance }));
  if (fixture.accessibility) tasks.push(SOURCE_ADAPTERS.mock_accessibility.collect({ sourceId: fixtureId, ...fixture.accessibility }));
  if (fixture.seo) tasks.push(SOURCE_ADAPTERS.mock_seo.collect({ sourceId: fixtureId, ...fixture.seo }));
  if (fixture.technologyDetector) tasks.push(SOURCE_ADAPTERS.mock_technology_detector.collect({ sourceId: fixtureId, ...fixture.technologyDetector }));

  for (const task of tasks) {
    try {
      collected.push(...(await task));
    } catch (err) {
      limitations.push(`Un adaptador falló para la fixture "${fixtureId}": ${err.message} (se continúa con el resto).`);
    }
  }
  if (fixture.contradictoryJsonEvidence) {
    for (const entry of fixture.contradictoryJsonEvidence) {
      collected.push(
        createEvidence({
          sourceId: `${fixtureId}-reclamaciones`,
          sourceType: "local_json",
          title: entry.title,
          excerpt: entry.excerpt,
          normalizedContent: entry.excerpt,
          classification: entry.classification ?? "contradictory",
          relatedDimension: entry.relatedDimension,
          signal: { strength: entry.strength ?? 0.8, polarity: entry.polarity },
          confidence: entry.confidence ?? 0.6,
          provenance: `local_json:${fixtureId}-reclamaciones`,
        })
      );
    }
  }
  return collected;
}

export const NETWORK_CAPABLE_MODES = Object.freeze(["public-web", "hybrid"]);

/**
 * Exportado para el CLI (research:collect): solo la etapa de recolección,
 * sin analizar ni persistir.
 *
 * `allowNetwork` (Paso 13) es una bandera de TIEMPO DE EJECUCIÓN, nunca
 * parte del Research Request persistido: aunque un research-request.json
 * guardado tenga `mode: "public-web"`, releerlo y volver a ejecutar la
 * auditoría SIN pasar `allowNetwork: true` de nuevo produce evidencia
 * "unavailable" exactamente igual que en Paso 12 — nunca dispara red por
 * sí solo. Esto es intencional (defensa en profundidad ante un archivo
 * reproducido/compartido).
 *
 * Paso 15 — `pipeline: "multiprovider"` (opt-in, por defecto sigue siendo
 * "legacy") delega la resolución de URLs en `orchestratorProviderBridge.js`
 * en vez de llamar directamente a `collectFromPublicWebsite`. Con
 * `pipeline: "legacy"` (o sin indicarlo) el código de esta función es
 * BYTE A BYTE el mismo camino que en Paso 13/14 — cero riesgo de regresión
 * para quien no pida explícitamente el modo nuevo.
 */
export async function collectEvidence(request, { localFilesBaseDir, allowNetwork = false, networkLimits = {}, pipeline = "legacy", providerPolicyOptions = {}, profileId = null, providerRegistry = null, providerCircuitBreaker = null } = {}) {
  const evidence = [];
  const limitations = [];

  const urls = request.inputs?.urls ?? [];
  const modeAllowsNetwork = NETWORK_CAPABLE_MODES.includes(request.mode);
  const networkEnabled = allowNetwork && modeAllowsNetwork;

  let providerRunSummary = null;
  let provenanceIndex = {};
  let networkUsed = false;
  let consultedUrls = [];

  if (pipeline === "multiprovider") {
    const bridgeResult = await collectEvidenceViaProviders(urls, {
      allowNetwork,
      modeAllowsNetwork,
      networkLimits,
      policyOptions: providerPolicyOptions,
      profileId,
      evidenceForUnavailableUrl,
      registry: providerRegistry,
      circuitBreaker: providerCircuitBreaker,
    });
    evidence.push(...bridgeResult.evidence);
    limitations.push(...bridgeResult.limitations);
    providerRunSummary = bridgeResult.providerRunSummary;
    provenanceIndex = bridgeResult.provenanceIndex;
    networkUsed = bridgeResult.networkUsed;
    consultedUrls = bridgeResult.consultedUrls;
  } else if (urls.length > 0 && networkEnabled) {
    const { evidence: realEvidence, pageResults } = await collectFromPublicWebsite(urls, networkLimits);
    evidence.push(...realEvidence);
    for (const result of pageResults) {
      if (result.status !== "available") limitations.push(`URL real no disponible (${result.errorCode}): ${result.url} — ${result.reason}`);
    }
    networkUsed = networkEnabled && urls.length > 0;
    consultedUrls = networkEnabled ? urls : [];
  } else {
    const reasonWhenModeReadyButFlagMissing = "el request pide un modo con red (public-web/hybrid), pero falta --allow-network en esta ejecución: se trata como offline por seguridad.";
    for (const url of urls) {
      evidence.push(evidenceForUnavailableUrl(url, modeAllowsNetwork && !allowNetwork ? reasonWhenModeReadyButFlagMissing : undefined));
    }
  }

  for (const filePath of request.inputs?.localFiles ?? []) {
    if (!localFilesBaseDir) {
      limitations.push(`No se indicó localFilesBaseDir: se omite "${filePath}".`);
      continue;
    }
    const adapterId = classifyLocalFileAdapterId(filePath);
    try {
      evidence.push(...(await SOURCE_ADAPTERS[adapterId].collect({ sourceId: filePath, filePath, baseDir: localFilesBaseDir })));
    } catch (err) {
      limitations.push(`No se pudo leer "${filePath}": ${err.message}.`);
    }
  }

  for (const fixtureId of request.inputs?.fixtures ?? []) {
    evidence.push(...(await collectFromFixture(fixtureId, limitations)));
  }

  const competitorBundles = [];
  for (const competitorId of request.inputs?.competitors ?? []) {
    const fixture = getCompetitorFixture(competitorId);
    if (!fixture) {
      limitations.push(`Fixture de competidor desconocida: "${competitorId}".`);
      continue;
    }
    try {
      const competitorEvidence = await SOURCE_ADAPTERS.mock_competitor.collect({ sourceId: competitorId, htmlText: fixture.htmlText });
      competitorBundles.push({ competitorId, evidence: competitorEvidence });
    } catch (err) {
      limitations.push(`No se pudo procesar el competidor "${competitorId}": ${err.message}.`);
    }
  }

  return { evidence, competitorBundles, limitations, networkUsed, consultedUrls, providerRunSummary, provenanceIndex };
}

/**
 * Exportado para el CLI (research:analyze): etapas "analyze_dimensions" →
 * "map_automations" a partir de evidencia YA recolectada (p.ej. desde
 * evidence.json de un research:collect previo), sin volver a recolectar.
 */
export function analyzeEvidence(evidence, sectorPresetId, { competitorBundles = [], presetOverrides = null } = {}) {
  const basePreset = getSectorAuditPreset(sectorPresetId) ?? GENERIC_AUDIT_PRESET;
  // Paso 15 · Fase 6 — un ProviderSectorProfile (providerSectorProfiles.js)
  // puede aportar pesos propios por encima del preset de Paso 12, vía
  // mergeAuditPreset (sectorAuditPresets.js). Sin presetOverrides, el
  // comportamiento es IDÉNTICO al de Paso 12/13/14 (compatibilidad legacy).
  const preset = presetOverrides ? mergeAuditPreset(basePreset, presetOverrides) : basePreset;
  const dimensionResults = evaluateAllDimensions(evidence);
  const scores = computeAllScores(dimensionResults, preset);
  const recommendations = buildRecommendations(dimensionResults, { priorityDimensionIds: preset.priorityDimensions, mustNotAutoInfer: preset.mustNotAutoInfer });
  const backlog = buildBacklog(recommendations);
  const impactEffortMatrix = buildImpactEffortMatrix(recommendations);
  const automations = recommendAutomationsFromFindings(dimensionResults);
  const competitorComparison = compareCompetitors({ subjectScores: scores, subjectEvidence: evidence }, competitorBundles, preset);
  return { sectorPresetId: preset.presetId, dimensionResults, scores, recommendations, backlog, impactEffortMatrix, automations, competitorComparison, prudentNote: preset.prudentNote };
}

/**
 * Ejecuta el pipeline completo de investigación/auditoría sobre un
 * Research Request ya construido (buildResearchRequest). No escribe a
 * disco si `dryRun` es true.
 */
export async function runResearchAudit(
  request,
  {
    localFilesBaseDir,
    dryRun = false,
    force = false,
    strict = false,
    allowNetwork = false,
    networkLimits = {},
    outputBaseDir = DEFAULT_AUDITS_DIR,
    pipeline = "legacy",
    providerPolicyOptions = {},
    profileId = null,
    providerRegistry = null,
    providerCircuitBreaker = null,
  } = {}
) {
  const startedAt = Date.now();

  try {
    assertValidResearchRequest(request);
  } catch (err) {
    throw new RequestValidationError(err.message);
  }

  const policy = evaluatePolicy(request);
  if (!policy.allowed) throw new PolicyViolationError(policy.violations);

  const plan = buildResearchPlan(request);

  // --dry-run NUNCA realiza peticiones de red reales, aunque se pida
  // --allow-network: solo muestra el plan (Fase 4 del enunciado de Paso 13).
  const networkAllowedThisRun = allowNetwork && !dryRun;
  const { evidence: rawEvidence, competitorBundles, limitations: collectionLimitations, networkUsed, consultedUrls, providerRunSummary, provenanceIndex } = await collectEvidence(request, {
    localFilesBaseDir,
    allowNetwork: networkAllowedThisRun,
    networkLimits,
    pipeline,
    providerPolicyOptions,
    profileId,
    providerRegistry,
    providerCircuitBreaker,
  });
  const evidence = deduplicateEvidence(rawEvidence);

  // Paso 15 · Fase 6 — con pipeline multiproveedor, el perfil sectorial
  // resuelto (explícito por --profile, o el genérico si no se indicó)
  // aporta pesos propios por encima del preset de Paso 12. En modo legacy
  // no se resuelve ningún perfil: comportamiento idéntico a Paso 12/13/14.
  const resolvedProfile = pipeline === "multiprovider" ? getProviderSectorProfile(profileId) : null;
  const presetOverrides = resolvedProfile ? getEffectiveAuditPresetForProfile(resolvedProfile) : null;

  const { sectorPresetId, dimensionResults, scores, recommendations, backlog, impactEffortMatrix, automations, competitorComparison, prudentNote } = analyzeEvidence(evidence, request.business?.sector, { competitorBundles, presetOverrides });

  if (strict) {
    const unresolvedContradictions = Object.values(dimensionResults).flatMap((d) => d.contradictions);
    if (unresolvedContradictions.length > 0) throw new StrictModeBlockedError(unresolvedContradictions);
  }

  // Fase 4/5 — conflictos con atribución de proveedor y desglose de
  // evidencia por proveedor: solo tienen sentido (provenanceIndex no
  // vacío) en modo multiproveedor; en legacy quedan como arrays vacíos.
  const evidenceConflicts = buildEvidenceConflictReport(dimensionResults, provenanceIndex);
  const providerScoreBreakdown = buildProviderScoreBreakdown(dimensionResults, provenanceIndex);

  const missingDimensions = Object.values(dimensionResults).filter((d) => d.status === "unknown").length;
  const limitations = [
    ...collectionLimitations,
    ...(missingDimensions > 0 ? [`${missingDimensions}/45 dimensiones quedan como "unknown" por falta de evidencia (no se infiere sin datos).`] : []),
    networkUsed
      ? `Se realizaron llamadas de red REALES a ${consultedUrls.length} URL(es) pública(s) mediante el proveedor publicWebsiteFetcher (--allow-network, pipeline="${pipeline}").`
      : "Ninguna llamada de red real se realizó durante esta auditoría (modo offline / fixtures locales únicamente).",
    ...(evidenceConflicts.length > 0 ? [`${evidenceConflicts.length} dimensión(es) con evidencia contradictoria entre fuentes/proveedores — ver evidenceConflicts.`] : []),
  ];

  const auditId = slugify(request.business?.name || request.requestId);
  const generatedAt = new Date().toISOString();
  const durationMs = Date.now() - startedAt;

  const auditResult = {
    requestId: request.requestId,
    auditId,
    sectorPresetId,
    businessName: request.business?.name,
    plan,
    scores,
    dimensionResults,
    recommendations,
    backlog,
    impactEffortMatrix,
    automations,
    competitorComparison,
    evidence,
    limitations,
    prudentNote,
    networkUsed,
    consultedUrls,
    pipeline,
    profileId: resolvedProfile?.id ?? null,
    providerRunSummary,
    evidenceConflicts,
    providerScoreBreakdown,
    durationMs,
    generatedAt,
  };

  const reportData = buildReportData(auditResult);
  // generatedAt/durationMs no son deterministas (relojes, timing): se
  // excluyen del contenido usado para el hash de audit.json (quedan solo
  // en el valor devuelto en memoria y en manifest.lastRunAt), para que una
  // segunda ejecución idéntica produzca 0 archivos actualizados.
  const deterministicReportData = { ...reportData };
  delete deterministicReportData.generatedAt;
  delete deterministicReportData.durationMs;
  // Paso 15 — providerRunSummary.providers[].durationMs es timing real (no
  // determinista); se excluye del contenido usado para el hash, igual que
  // generatedAt/durationMs de nivel superior, para que una segunda
  // ejecución idéntica en modo multiproveedor siga produciendo 0 archivos
  // actualizados (idempotencia, ver docs/paso-15.../09-...md).
  if (deterministicReportData.providerRunSummary) {
    deterministicReportData.providerRunSummary = {
      ...deterministicReportData.providerRunSummary,
      providers: deterministicReportData.providerRunSummary.providers.map((p) => ({ providerId: p.providerId, priority: p.priority, providerResultStatus: p.providerResultStatus, orchestratorStatus: p.orchestratorStatus, evidenceContributed: p.evidenceContributed, errors: p.errors, limitations: p.limitations })),
    };
  }

  const filesToWrite = {
    "research-request.json": JSON.stringify(request, null, 2) + "\n",
    "research-plan.json": JSON.stringify(plan, null, 2) + "\n",
    "audit.json": renderAuditReportJson(deterministicReportData),
    "evidence.json": JSON.stringify(evidence, null, 2) + "\n",
    [path.join("reports", "executive.md")]: renderExecutiveReportMarkdown(deterministicReportData),
    [path.join("reports", "technical.md")]: renderTechnicalReportMarkdown(deterministicReportData),
    [path.join("reports", "commercial.md")]: renderCommercialReportMarkdown(deterministicReportData),
    [path.join("reports", "opportunities-summary.md")]: renderOpportunitiesSummaryMarkdown(deterministicReportData),
    [path.join("reports", "backlog.md")]: renderBacklogMarkdown(deterministicReportData),
    [path.join("reports", "impact-effort-matrix.md")]: renderImpactEffortMatrixMarkdown(deterministicReportData),
    [path.join("reports", "automation-map.md")]: renderAutomationMapMarkdown(deterministicReportData),
    [path.join("reports", "risk-report.md")]: renderRiskReportMarkdown(deterministicReportData),
    [path.join("reports", "evidence-appendix.md")]: renderEvidenceAppendixMarkdown(deterministicReportData),
    // Solo se escribe en modo multiproveedor: en legacy providerRunSummary
    // es null y este archivo NO se genera — el set de archivos de una
    // auditoría legacy queda idéntico al de Paso 12/13/14 (requisito 7).
    ...(deterministicReportData.providerRunSummary ? { [path.join("reports", "providers.md")]: renderProviderRunSummaryMarkdown(deterministicReportData) } : {}),
  };

  const filesCreated = [];
  const filesUpdated = [];
  const filesPreserved = [];
  const collisions = [];

  if (dryRun) {
    return { ...auditResult, dryRun: true, filesCreated: Object.keys(filesToWrite), filesUpdated: [], filesPreserved: [], collisions: [] };
  }

  return { ...auditResult, dryRun: false, ...(await persistAuditFiles(auditId, filesToWrite, { filesCreated, filesUpdated, filesPreserved, collisions }, outputBaseDir, force)) };
}

async function persistAuditFiles(auditId, filesToWrite, buckets, outputBaseDir, force = false) {
  const baseDir = path.join(outputBaseDir, auditId);
  await mkdir(baseDir, { recursive: true });

  const manifestPath = path.join(baseDir, RESEARCH_MANIFEST_FILENAME);
  let previousManifest;
  try {
    previousManifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    previousManifest = { files: {} };
  }

  const newManifestFiles = {};
  for (const [relativePath, content] of Object.entries(filesToWrite)) {
    const fullPath = path.join(baseDir, relativePath);
    const hash = sha256(content);
    const previousEntry = previousManifest.files?.[relativePath];

    let existsOnDisk;
    try {
      await stat(fullPath);
      existsOnDisk = true;
    } catch {
      existsOnDisk = false;
    }

    if (existsOnDisk && !previousEntry && !force) {
      buckets.collisions.push({ path: relativePath, reason: "el archivo existe pero no fue generado por esta auditoría (o fue editado a mano)" });
      continue;
    }

    if (previousEntry && previousEntry.hash === hash) {
      buckets.filesPreserved.push(relativePath);
      newManifestFiles[relativePath] = previousEntry;
      continue;
    }

    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, "utf8");
    newManifestFiles[relativePath] = { hash, generatedBy: "public-research-audit-engine" };
    if (previousEntry) buckets.filesUpdated.push(relativePath);
    else buckets.filesCreated.push(relativePath);
  }

  if (buckets.collisions.length > 0) throw new AuditCollisionError(buckets.collisions);

  await writeFile(manifestPath, JSON.stringify({ auditId, lastRunAt: new Date().toISOString(), files: newManifestFiles }, null, 2) + "\n", "utf8");

  return { filesCreated: buckets.filesCreated, filesUpdated: buckets.filesUpdated, filesPreserved: buckets.filesPreserved, collisions: [] };
}
