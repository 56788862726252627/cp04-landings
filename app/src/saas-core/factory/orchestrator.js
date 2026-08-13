// Paso 10 · Fase 3 — Orquestador de generación (One Prompt Factory).
//
// Pipeline determinista e idempotente:
//   Business Blueprint → validación → tenant → terminología → branding →
//   módulos → navegación → roles y permisos → datos demo → landing →
//   configuración PWA → documentación → informe → validaciones finales.
//
// Todo el trabajo se escribe DENTRO de un directorio propio por negocio
// (`businesses/<businessId>/`), nunca en `tenants/demo/` (espacio de
// Paso 09) ni en ningún archivo del núcleo. Antes de escribir NADA se
// calcula el plan completo (create/update/preserve/collision); si hay una
// colisión y no se pasa `force`, no se escribe ni un solo archivo.

import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

import { validateBusinessBlueprint } from "./businessBlueprintSchema.js";
import { blueprintToTenantConfig, buildNavigationPreview } from "./blueprintToTenant.js";
import { resolveBrandTokens, tokensToCssVariables, buildPendingAssetsManifest } from "./brandingEngine.js";
import { buildLandingConfig, renderLandingHtml } from "./landingGenerator.js";
import { generateDemoDataset, checkDatasetReferentialIntegrity } from "./demoDataGenerator.js";
import { buildMockupManifest } from "./mockupManifest.js";
import { buildReadme, buildQuickGuide, buildOnboarding, buildTechnicalChecklist, buildCommercialChecklist } from "./docsGenerator.js";
import { buildReportData, renderReportMarkdown, renderReportJson } from "./reportGenerator.js";
import { findLeakedSportsTerms } from "../terminology/terminology.js";
import { getModuleMeta } from "../modules/moduleRegistry.js";

export const DEFAULT_BUSINESSES_DIR = path.join("src", "saas-core", "businesses");
export const FACTORY_MANIFEST_FILENAME = ".factory-manifest.json";

export class BusinessFactoryError extends Error {}
export class BlueprintValidationError extends BusinessFactoryError {
  constructor(errors) {
    super(`Business Blueprint inválido:\n${errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n")}`);
    this.errors = errors;
  }
}
export class CollisionError extends BusinessFactoryError {
  constructor(collisions) {
    super(`Colisión de archivos: ${collisions.length} archivo(s) existen y no fueron generados por esta fábrica (o fueron editados a mano). Usa --force para sobrescribir explícitamente.\n${collisions.map((c) => `  - ${c.path}: ${c.reason}`).join("\n")}`);
    this.collisions = collisions;
  }
}

function sha256(content) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

function buildEnvExample(tenantConfig) {
  const lines = ["# Generado por la One Prompt Factory — SOLO nombres de variables, sin valores.", "# No commitear un archivo .env real con valores."];
  for (const [provider, entry] of Object.entries(tenantConfig.integrations)) {
    lines.push(`# ${provider} (status: ${entry.status})`);
    for (const envVar of entry.envVars) lines.push(`${envVar}=`);
  }
  return lines.join("\n") + "\n";
}

function buildPwaConfig({ blueprint, tenantConfig, brandTokens, pendingAssets }) {
  return {
    businessId: blueprint.businessId,
    name: tenantConfig.displayName,
    shortName: blueprint.pwa?.shortName || tenantConfig.displayName.slice(0, 20),
    themeColor: blueprint.pwa?.themeColor || brandTokens.colors.primary,
    backgroundColor: blueprint.pwa?.backgroundColor || brandTokens.colors.bg,
    display: blueprint.pwa?.display || "standalone",
    orientation: blueprint.pwa?.orientation || "portrait",
    startUrl: blueprint.pwa?.startUrl || "/",
    icons: pendingAssets.assets.filter((a) => a.id.startsWith("icon_")).map((a) => ({ src: `icons/${a.label}`, sizes: `${a.sizePx}x${a.sizePx}`, status: a.status })),
    note: "Configuración PWA declarativa. Los binarios de icono no existen todavía (ver branding/pending-assets.json).",
  };
}

function computeReuseMetrics(tenantConfig) {
  const total = tenantConfig.modulesEnabled.length;
  const reused = tenantConfig.modulesEnabled.filter((id) => getModuleMeta(id) !== null).length;
  const percent = total === 0 ? 100 : Math.round((reused / total) * 100);
  return { reusedModulesRatio: `${reused}/${total} (${percent}%)`, coreFilesModified: 0 };
}

function computeRisks({ blueprint, brandTokens, terminology }) {
  const risks = [];
  if (blueprint.privacy?.regulatedSector) {
    risks.push(`Sector "${blueprint.sector}" requiere revisión normativa antes de producción (ver checklist técnico).`);
  }
  if (!brandTokens.contrast.allPassAA) {
    risks.push(`Contraste de branding insuficiente (WCAG AA) en: ${brandTokens.contrast.failing.map((f) => f.pair).join(", ")}.`);
  }
  const leaked = findLeakedSportsTerms(blueprint.sector, terminology);
  if (leaked.length > 0) {
    risks.push(`Terminología filtra vocabulario de pádel en un sector no deportivo: ${leaked.join(", ")}.`);
  }
  return risks;
}

const STATIC_LIMITATIONS = Object.freeze([
  "Ningún proveedor externo real está conectado (Airtable/Make/Stripe/WhatsApp/Gmail/Calendar): todo son adaptadores mock.",
  "No hay integración en vivo con App.jsx: el tenant generado es configuración validada, no una aplicación desplegada.",
  "Los binarios de branding/PWA (favicon, iconos, manifest real) no se generan en este paso: solo el contrato y el manifest declarativo.",
  "Los mockups no se capturan realmente (requeriría Playwright u otra herramienta, no incluida como dependencia).",
  "Los datos demo son sintéticos y no deben usarse como base de un cliente real sin sustitución explícita.",
]);

/**
 * Calcula el plan completo de archivos (create/update/preserve/collision)
 * SIN escribir nada. `existingManifest` es el `.factory-manifest.json`
 * previo si existe (o null si es la primera generación).
 */
async function planFiles({ outputDir, fileContents, existingManifest, force }) {
  const toCreate = [];
  const toUpdate = [];
  const toPreserveUnchanged = [];
  const collisions = [];

  for (const [relPath, content] of Object.entries(fileContents)) {
    const absPath = path.join(outputDir, relPath);
    const newHash = sha256(content);
    const exists = await stat(absPath).then(() => true).catch(() => false);
    const trackedHash = existingManifest?.files?.[relPath]?.hash;

    if (!exists) {
      toCreate.push(relPath);
      continue;
    }
    if (trackedHash === undefined) {
      if (force) toUpdate.push(relPath);
      else collisions.push({ path: relPath, reason: "el archivo existe pero no fue generado por esta fábrica (no está en el manifest)" });
      continue;
    }
    const onDiskContent = await readFile(absPath, "utf8").catch(() => null);
    const onDiskHash = onDiskContent === null ? null : sha256(onDiskContent);
    if (onDiskHash !== trackedHash) {
      if (force) toUpdate.push(relPath);
      else collisions.push({ path: relPath, reason: "el archivo fue generado antes por la fábrica pero se detectó una edición manual posterior" });
      continue;
    }
    if (onDiskHash === newHash) {
      toPreserveUnchanged.push(relPath);
    } else {
      toUpdate.push(relPath);
    }
  }

  return { toCreate, toUpdate, toPreserveUnchanged, collisions };
}

/**
 * Ejecuta el pipeline completo de la fábrica para un Business Blueprint.
 * @param {{blueprint: object, outputBaseDir?: string, dryRun?: boolean, force?: boolean, verbose?: boolean}} params
 */
export async function runFactoryPipeline({ blueprint, outputBaseDir = DEFAULT_BUSINESSES_DIR, dryRun = false, force = false, verbose = false }) {
  const startedAt = Date.now();
  const log = (...args) => { if (verbose) console.log("[factory]", ...args); };

  log("stage: validación");
  const { valid, errors } = validateBusinessBlueprint(blueprint);
  if (!valid) throw new BlueprintValidationError(errors);

  log("stage: tenant");
  const { tenantConfig, base, terminology } = blueprintToTenantConfig(blueprint);

  log("stage: terminología (verificación anti-fuga)");
  // findLeakedSportsTerms ya se usa en computeRisks más abajo.

  log("stage: branding");
  const brandTokens = resolveBrandTokens(blueprint.branding);
  const pendingAssets = buildPendingAssetsManifest({ businessId: blueprint.businessId });

  log("stage: módulos");
  const modulesDiscarded = Array.isArray(blueprint.modules) && blueprint.modules.length > 0
    ? base.modules.filter((m) => !blueprint.modules.includes(m))
    : [];

  log("stage: navegación");
  const navigationByRole = buildNavigationPreview(tenantConfig);

  log("stage: roles y permisos (ya resueltos por blueprintToTenantConfig)");

  log("stage: datos demo");
  const demoDataset = generateDemoDataset({
    sector: blueprint.sector,
    terminology,
    commonServices: (blueprint.services || []).map((s) => s.name).length > 0 ? blueprint.services.map((s) => s.name) : base.commonServices,
    seed: blueprint.demoData?.seed ?? blueprint.businessId,
    sizes: blueprint.demoData?.sizes || {},
  });
  const integrityCheck = checkDatasetReferentialIntegrity(demoDataset);
  if (!integrityCheck.consistent) {
    throw new BusinessFactoryError(`El dataset demo generado no es referencialmente consistente (bug del generador): ${integrityCheck.problems.join("; ")}`);
  }

  log("stage: landing");
  const landingConfig = buildLandingConfig(blueprint, terminology);
  const landingHtml = renderLandingHtml(landingConfig, brandTokens);

  log("stage: configuración PWA");
  const pwaConfig = buildPwaConfig({ blueprint, tenantConfig, brandTokens, pendingAssets });

  log("stage: mockups (manifest, sin captura real)");
  const mockupManifest = buildMockupManifest({ businessId: blueprint.businessId });

  log("stage: documentación");
  const docs = {
    readme: buildReadme({ blueprint, tenantConfig, navigationByRole }),
    quickGuide: buildQuickGuide({ blueprint }),
    onboarding: buildOnboarding({ blueprint }),
    technicalChecklist: buildTechnicalChecklist({ blueprint, tenantConfig, base }),
    commercialChecklist: buildCommercialChecklist({ blueprint }),
  };

  const outputDir = path.join(outputBaseDir, blueprint.businessId);
  const manifestPath = path.join(outputDir, FACTORY_MANIFEST_FILENAME);
  const existingManifest = await readFile(manifestPath, "utf8").then(JSON.parse).catch(() => null);

  const fileContents = {
    "business.blueprint.json": JSON.stringify(blueprint, null, 2) + "\n",
    "tenant.config.json": JSON.stringify(tenantConfig, null, 2) + "\n",
    "env.example": buildEnvExample(tenantConfig),
    "branding/tokens.json": JSON.stringify(brandTokens, null, 2) + "\n",
    "branding/tokens.css": tokensToCssVariables(brandTokens),
    "branding/pending-assets.json": JSON.stringify(pendingAssets, null, 2) + "\n",
    "landing/landing.config.json": JSON.stringify(landingConfig, null, 2) + "\n",
    "landing/index.html": landingHtml,
    "pwa/pwa.config.json": JSON.stringify(pwaConfig, null, 2) + "\n",
    "demo-data/dataset.json": JSON.stringify(demoDataset, null, 2) + "\n",
    "mockups/manifest.json": JSON.stringify(mockupManifest, null, 2) + "\n",
    "docs/README.md": docs.readme,
    "docs/guia-rapida.md": docs.quickGuide,
    "docs/onboarding.md": docs.onboarding,
    "docs/checklist-tecnico.md": docs.technicalChecklist,
    "docs/checklist-comercial.md": docs.commercialChecklist,
  };

  // Verificaciones finales antes de escribir nada: ningún contenido
  // generado debe parecer un secreto (defensa en profundidad, además del
  // rechazo ya hecho en validateBusinessBlueprint sobre la entrada).
  const SECRET_LOOKALIKE = /(sk_live|sk_test|whsec_|AIza|xox[baprs]-)/;
  for (const [relPath, content] of Object.entries(fileContents)) {
    if (SECRET_LOOKALIKE.test(content)) {
      throw new BusinessFactoryError(`Contenido generado para "${relPath}" parece contener un secreto; abortado antes de escribir nada.`);
    }
  }

  const plan = await planFiles({ outputDir, fileContents, existingManifest, force });

  // report.md/report.json se generan con contenido que cambia siempre
  // (timestamp/duración) — no participan en la comprobación de idempotencia
  // de arriba, pero SÍ deben respetar la regla de no pisar un archivo
  // manual: si ya existen y no están en el manifest previo, es una colisión.
  const reportCollisions = [];
  for (const reportFile of ["report.md", "report.json"]) {
    const absPath = path.join(outputDir, reportFile);
    const exists = await stat(absPath).then(() => true).catch(() => false);
    const tracked = existingManifest?.files?.[reportFile] !== undefined;
    if (exists && !tracked && !force) {
      reportCollisions.push({ path: reportFile, reason: "el archivo existe pero no fue generado por esta fábrica (no está en el manifest)" });
    }
  }

  const allCollisions = [...plan.collisions, ...reportCollisions];
  if (allCollisions.length > 0 && !force) {
    throw new CollisionError(allCollisions);
  }

  if (!dryRun) {
    for (const relPath of [...plan.toCreate, ...plan.toUpdate]) {
      const absPath = path.join(outputDir, relPath);
      await mkdir(path.dirname(absPath), { recursive: true });
      await writeFile(absPath, fileContents[relPath], "utf8");
    }
  }

  const durationMs = Date.now() - startedAt;
  const reuse = computeReuseMetrics(tenantConfig);
  const risks = computeRisks({ blueprint, brandTokens, terminology });
  const demoDataSummary = {
    customers: demoDataset.customers.length,
    professionals: demoDataset.professionals.length,
    appointments: demoDataset.appointments.length,
    incidents: demoDataset.incidents.length,
  };

  const runResult = {
    businessId: blueprint.businessId,
    blueprint,
    tenantConfig,
    outputDir,
    dryRun,
    force,
    filesCreated: plan.toCreate,
    filesUpdated: plan.toUpdate,
    filesPreserved: plan.toPreserveUnchanged,
    collisions: allCollisions,
    modulesDiscarded,
    demoDataSummary,
    reuse,
    manualSteps: blueprint.manualSteps || [],
    risks,
    limitations: [...STATIC_LIMITATIONS],
    durationMs,
    compatibility: mockupManifest.compatibilityNotes,
    idempotent: plan.toCreate.length === 0 && plan.toUpdate.length === 0,
    nextStep: risks.length > 0
      ? "Resolver los riesgos listados (revisión normativa/contraste/terminología) antes de conectar cualquier proveedor real."
      : "Conectar un proveedor real (empezando por Airtable/Make) detrás de los adaptadores existentes y validar con un cliente piloto real.",
    generatedAt: new Date().toISOString(),
    landingConfig,
    navigationByRole,
    demoDataset,
    mockupManifest,
    brandTokens,
    pendingAssets,
    pwaConfig,
  };

  const reportData = buildReportData(runResult);
  runResult.reportMarkdown = renderReportMarkdown(reportData);
  runResult.reportJson = renderReportJson(reportData);

  if (!dryRun) {
    await writeFile(path.join(outputDir, "report.md"), runResult.reportMarkdown, "utf8");
    await writeFile(path.join(outputDir, "report.json"), runResult.reportJson, "utf8");

    const allFileContents = { ...fileContents, "report.md": runResult.reportMarkdown, "report.json": runResult.reportJson };
    const newManifest = {
      businessId: blueprint.businessId,
      schemaVersion: 1,
      lastRunAt: runResult.generatedAt,
      files: Object.fromEntries(Object.keys(allFileContents).map((relPath) => [relPath, { hash: sha256(allFileContents[relPath]), generatedBy: "one-prompt-factory" }])),
    };
    await mkdir(outputDir, { recursive: true });
    await writeFile(manifestPath, JSON.stringify(newManifest, null, 2) + "\n", "utf8");
  }

  log("stage: validaciones finales — OK");
  return runResult;
}
