// Paso 10 · Fase 11 — Lógica compartida del CLI de la One Prompt Factory.
//
// Reutiliza `parseCliArgs` del CLI de Paso 09 (no lo duplica) y añade solo
// lo que ese CLI no cubre: resolución de blueprint (archivo/ejemplo/negocio
// existente), listado/diff/doctor. Ninguna función hace I/O de red.

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import { parseCliArgs } from "../../tenant-cli/lib/tenantProvisioning.mjs";
import { validateBusinessBlueprint } from "../../src/saas-core/factory/businessBlueprintSchema.js";
import { MINIMAL_BUSINESS_BLUEPRINT, FULL_BUSINESS_BLUEPRINT } from "../../src/saas-core/factory/businessBlueprintExamples.js";
import { blueprintToTenantConfig, buildNavigationPreview } from "../../src/saas-core/factory/blueprintToTenant.js";
import { resolveBrandTokens } from "../../src/saas-core/factory/brandingEngine.js";
import { buildLandingConfig } from "../../src/saas-core/factory/landingGenerator.js";
import { buildTerminology } from "../../src/saas-core/terminology/terminology.js";
import { runFactoryPipeline, DEFAULT_BUSINESSES_DIR, FACTORY_MANIFEST_FILENAME, BusinessFactoryError } from "../../src/saas-core/factory/orchestrator.js";
import { EXTENSION_POINTS } from "../../src/saas-core/factory/extensionPoints.js";
import { SECTOR_TEMPLATE_IDS } from "../../src/saas-core/templates/templates.js";
import { SECTOR_PRESET_IDS } from "../../src/saas-core/templates/presets.js";

export { parseCliArgs, DEFAULT_BUSINESSES_DIR, BusinessFactoryError };

export class BusinessCliError extends Error {}

const EXAMPLES_BY_NAME = Object.freeze({ minimal: MINIMAL_BUSINESS_BLUEPRINT, full: FULL_BUSINESS_BLUEPRINT });

/**
 * Resuelve un Business Blueprint a partir de argumentos de CLI:
 * --blueprint=<ruta.json> | --example=minimal|full | --business=<businessId>
 * (carga business.blueprint.json de una generación previa).
 */
export async function resolveBlueprintFromArgs(args, { baseDir = DEFAULT_BUSINESSES_DIR } = {}) {
  if (args.blueprint) {
    const raw = await readFile(String(args.blueprint), "utf8").catch((err) => {
      throw new BusinessCliError(`No se pudo leer --blueprint="${args.blueprint}": ${err.message}`);
    });
    try {
      return JSON.parse(raw);
    } catch (err) {
      throw new BusinessCliError(`--blueprint="${args.blueprint}" no es JSON válido: ${err.message}`);
    }
  }
  if (args.example) {
    const example = EXAMPLES_BY_NAME[String(args.example)];
    if (!example) throw new BusinessCliError(`--example desconocido: "${args.example}". Usa "minimal" o "full".`);
    return { ...example };
  }
  if (args.business) {
    const blueprintPath = path.join(baseDir, String(args.business), "business.blueprint.json");
    const raw = await readFile(blueprintPath, "utf8").catch(() => {
      throw new BusinessCliError(`No existe un negocio generado "${args.business}" en ${baseDir} (falta business.blueprint.json).`);
    });
    return JSON.parse(raw);
  }
  throw new BusinessCliError("Debes indicar --blueprint=<ruta.json>, --example=minimal|full o --business=<businessId>.");
}

/** Validación "profunda": esquema + resolución de plantilla/sector + branding, sin escribir nada. */
export function validateBusinessDeep(blueprint) {
  const schemaResult = validateBusinessBlueprint(blueprint);
  const warnings = [];
  if (!schemaResult.valid) return { valid: false, errors: schemaResult.errors, warnings };

  try {
    const { tenantConfig } = blueprintToTenantConfig(blueprint);
    const brandTokens = resolveBrandTokens(blueprint.branding);
    if (!brandTokens.contrast.allPassAA) {
      warnings.push(`Contraste de branding insuficiente (WCAG AA): ${brandTokens.contrast.failing.map((f) => f.pair).join(", ")}`);
    }
    return { valid: true, errors: [], warnings, tenantConfig };
  } catch (err) {
    return { valid: false, errors: [{ path: "$", message: err.message }], warnings };
  }
}

export async function listGeneratedBusinesses({ baseDir = DEFAULT_BUSINESSES_DIR } = {}) {
  let dirNames = [];
  try {
    dirNames = await readdir(baseDir);
  } catch {
    return [];
  }
  const entries = [];
  for (const dirName of dirNames.sort()) {
    const blueprintPath = path.join(baseDir, dirName, "business.blueprint.json");
    try {
      const raw = await readFile(blueprintPath, "utf8");
      const blueprint = JSON.parse(raw);
      const manifestRaw = await readFile(path.join(baseDir, dirName, FACTORY_MANIFEST_FILENAME), "utf8").catch(() => null);
      const manifest = manifestRaw ? JSON.parse(manifestRaw) : null;
      entries.push({
        businessId: blueprint.businessId,
        commercialName: blueprint.commercialName,
        sector: blueprint.sector,
        plan: blueprint.plan,
        lastRunAt: manifest?.lastRunAt || null,
      });
    } catch {
      // directorio sin business.blueprint.json válido: se omite, no rompe el listado
    }
  }
  return entries;
}

export function listCatalog() {
  return { templates: SECTOR_TEMPLATE_IDS, presets: SECTOR_PRESET_IDS };
}

/** business:preview — resuelve todo lo derivable de un blueprint sin escribir nada a disco. */
export function buildPreview(blueprint) {
  const { tenantConfig, base, sourceKind } = blueprintToTenantConfig(blueprint);
  const navigationByRole = buildNavigationPreview(tenantConfig);
  const brandTokens = resolveBrandTokens(blueprint.branding);
  const { dictionary: terminology } = buildTerminology(base.terminologyOverrides || {});
  const landingConfig = buildLandingConfig(blueprint, terminology);
  return { tenantConfig, base, sourceKind, navigationByRole, brandTokens, landingConfig };
}

/** business:doctor — comprobaciones de salud sin I/O de red. */
export async function runDoctorChecks({ baseDir = DEFAULT_BUSINESSES_DIR } = {}) {
  const checks = [];

  checks.push({ id: "extension_points_loaded", ok: EXTENSION_POINTS.length > 0, detail: `${EXTENSION_POINTS.length} puntos de extensión registrados` });
  checks.push({ id: "all_extension_points_not_implemented", ok: EXTENSION_POINTS.every((p) => p.status === "not_implemented"), detail: "ninguna integración real activa (esperado en este paso)" });

  const businessesDirExists = await stat(baseDir).then((s) => s.isDirectory()).catch(() => false);
  checks.push({ id: "businesses_dir_readable", ok: true, detail: businessesDirExists ? `existe: ${baseDir}` : `aún no existe (se creará en el primer business:create): ${baseDir}` });

  const businesses = await listGeneratedBusinesses({ baseDir });
  checks.push({ id: "generated_businesses_count", ok: true, detail: `${businesses.length} negocio(s) generado(s)` });

  let allValid = true;
  const invalidDetails = [];
  for (const entry of businesses) {
    const blueprintPath = path.join(baseDir, entry.businessId, "business.blueprint.json");
    const raw = await readFile(blueprintPath, "utf8").catch(() => null);
    if (!raw) continue;
    const blueprint = JSON.parse(raw);
    const { valid, errors } = validateBusinessBlueprint(blueprint);
    if (!valid) {
      allValid = false;
      invalidDetails.push(`${entry.businessId}: ${errors.length} error(es)`);
    }
  }
  checks.push({ id: "generated_businesses_still_valid", ok: allValid, detail: allValid ? "todos los blueprints generados siguen siendo válidos" : invalidDetails.join("; ") });

  let playwrightAvailable = false;
  try {
    await import("playwright");
    playwrightAvailable = true;
  } catch {
    playwrightAvailable = false;
  }
  checks.push({ id: "mockup_capture_tool_available", ok: true, detail: playwrightAvailable ? "playwright disponible: captura real posible" : "playwright NO instalado: solo manifest de mockups (esperado en este paso)" });

  const overallOk = checks.every((c) => c.ok);
  return { ok: overallOk, checks };
}

/** business:diff — compara un blueprint (nuevo o el ya almacenado) contra lo que hay en disco, sin escribir nada (dry-run). */
export async function diffBusiness({ blueprint, baseDir = DEFAULT_BUSINESSES_DIR }) {
  const result = await runFactoryPipeline({ blueprint, outputBaseDir: baseDir, dryRun: true, verbose: false });
  return {
    businessId: result.businessId,
    wouldCreate: result.filesCreated,
    wouldUpdate: result.filesUpdated,
    unchanged: result.filesPreserved,
    collisions: result.collisions,
    idempotentIfApplied: result.idempotent,
  };
}

export { runFactoryPipeline };
