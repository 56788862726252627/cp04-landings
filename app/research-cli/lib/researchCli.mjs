// Paso 12 · Lógica compartida del CLI del Public Research & Digital Audit
// Engine. Reutiliza `parseCliArgs` de Paso 09 (no lo duplica). Nunca
// escribe fuera de una ruta explícita del usuario (--output) o del
// directorio controlado por defecto (research/audits/<auditId>/, propio
// de este paso, distinto de saas-core/businesses/ y de
// nl-builder/requests/).

import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

import { parseCliArgs } from "../../tenant-cli/lib/tenantProvisioning.mjs";
import { buildResearchRequest, validateResearchRequest, RESEARCH_MODES } from "../../src/saas-core/research/researchRequestSchema.js";
import { DEMO_FIXTURE_IDS, DEMO_FIXTURES } from "../../src/saas-core/research/fixtures/demoFixtures.js";
import { SOURCE_ADAPTER_IDS } from "../../src/saas-core/research/sourceAdapters.js";
import { DIMENSION_IDS } from "../../src/saas-core/research/dimensionRegistry.js";
import { AUDIT_SECTOR_IDS, SECTOR_AUDIT_PRESETS } from "../../src/saas-core/research/sectorAuditPresets.js";
import { EXTENSION_POINTS } from "../../src/saas-core/factory/extensionPoints.js";
import { evaluatePolicy } from "../../src/saas-core/research/researchPolicy.js";
import { DEFAULT_AUDITS_DIR } from "../../src/saas-core/research/auditOrchestrator.js";
import { PUBLIC_WEBSITE_FETCHER_PROVIDER } from "../../src/saas-core/research/providers/publicWebsiteFetcher.js";
import { createProviderRegistry, discoverAndRegisterPlugins } from "../../src/saas-core/research/providers/core/providerRegistry.js";

export { parseCliArgs };

export class ResearchCliError extends Error {}

function splitList(value) {
  if (value === undefined || value === true) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Paso 13 — proveedores de red disponibles (solo uno por ahora). --provider
// es explícito y validado: nunca un valor arbitrario silencioso.
export const AVAILABLE_NETWORK_PROVIDERS = Object.freeze(["publicWebsiteFetcher"]);

/** --mode explícito (Paso 13) tiene prioridad; si no, --online (Paso 12) o "offline" por defecto. */
function resolveRequestMode(args) {
  if (args.mode) {
    const mode = String(args.mode);
    if (!["offline", "online", "public-web", "hybrid"].includes(mode)) {
      throw new ResearchCliError(`--mode desconocido: "${mode}". Usa uno de: offline, online, public-web, hybrid.`);
    }
    return mode;
  }
  return args.online ? "online" : "offline";
}

/**
 * Resuelve las opciones de red de Paso 13 desde flags CLI. `allowNetwork`
 * es SIEMPRE `false` salvo que el usuario pase `--allow-network`
 * explícitamente en ESTA invocación — nunca se infiere de `--mode`.
 */
export function resolveNetworkOptionsFromArgs(args) {
  if (args.provider && !AVAILABLE_NETWORK_PROVIDERS.includes(String(args.provider))) {
    throw new ResearchCliError(`--provider desconocido: "${args.provider}". Disponibles: ${AVAILABLE_NETWORK_PROVIDERS.join(", ")}.`);
  }
  const networkLimits = {};
  if (args.timeout) networkLimits.timeoutMs = Number(args.timeout);
  if (args["max-bytes"]) networkLimits.maxBytes = Number(args["max-bytes"]);
  if (args["max-pages"]) networkLimits.maxPages = Number(args["max-pages"]);
  if (args["user-agent"]) networkLimits.userAgent = String(args["user-agent"]);
  if (args["respect-robots"] !== undefined) networkLimits.respectRobots = String(args["respect-robots"]) !== "false";
  return { allowNetwork: Boolean(args["allow-network"]), networkLimits };
}

// Paso 15 — pipeline multiproveedor: "legacy" (por defecto, sin cambios de
// comportamiento) o "multiprovider" (opt-in explícito, ver
// orchestratorProviderBridge.js).
const PIPELINE_VALUES = Object.freeze(["legacy", "multiprovider"]);
const EXECUTION_VALUES = Object.freeze(["sequential", "parallel", "fallback"]);

/** "id:50,id2:10" -> {id:50, id2:10}. Lanza ResearchCliError ante formato inválido. */
function parsePriorityMap(value) {
  if (value === undefined || value === true) return {};
  const overrides = {};
  for (const pair of String(value).split(",").map((s) => s.trim()).filter(Boolean)) {
    const [id, priority] = pair.split(":").map((s) => s.trim());
    if (!id || priority === undefined || Number.isNaN(Number(priority))) {
      throw new ResearchCliError(`--provider-priority="${value}" mal formado. Usa id:prioridad separados por comas, p.ej. "seoProvider:5,whoisProvider:60".`);
    }
    overrides[id] = Number(priority);
  }
  return overrides;
}

/**
 * Resuelve las opciones del pipeline multiproveedor (Paso 15) desde flags
 * CLI. `pipeline` es SIEMPRE "legacy" salvo `--pipeline=multiprovider`
 * explícito — mismo principio de seguridad por defecto que `allowNetwork`.
 */
export function resolveProviderExecutionOptionsFromArgs(args) {
  const pipeline = args.pipeline ? String(args.pipeline) : "legacy";
  if (!PIPELINE_VALUES.includes(pipeline)) {
    throw new ResearchCliError(`--pipeline desconocido: "${pipeline}". Usa uno de: ${PIPELINE_VALUES.join(", ")}.`);
  }
  const execution = args.execution ? String(args.execution) : "fallback";
  if (!EXECUTION_VALUES.includes(execution)) {
    throw new ResearchCliError(`--execution desconocido: "${execution}". Usa uno de: ${EXECUTION_VALUES.join(", ")}.`);
  }
  let includeProvidersRaw = splitList(args.providers);
  let excludeProvidersRaw = splitList(args["exclude-providers"]);
  const maxConcurrency = args["max-concurrency"] !== undefined ? Number(args["max-concurrency"]) : null;
  if (maxConcurrency !== null && (!Number.isInteger(maxConcurrency) || maxConcurrency < 1)) {
    throw new ResearchCliError(`--max-concurrency debe ser un entero >= 1 (recibido: "${args["max-concurrency"]}").`);
  }

  // Paso 16/17 — atajos de conveniencia para los proveedores derivados
  // (seoProvider, accessibilityProvider), equivalentes a combinaciones de
  // --providers/--exclude-providers.
  const onlyIds = [];
  if (args["seo-only"]) onlyIds.push("seoProvider");
  if (args["accessibility-only"]) onlyIds.push("accessibilityProvider");
  if (onlyIds.length > 0) {
    includeProvidersRaw = ["publicWebsiteFetcher", ...onlyIds];
  }
  if ((args.seo || args["include-seo"]) && includeProvidersRaw.length > 0 && !includeProvidersRaw.includes("seoProvider")) {
    includeProvidersRaw = [...includeProvidersRaw, "seoProvider"];
  }
  if ((args.accessibility || args["include-accessibility"]) && includeProvidersRaw.length > 0 && !includeProvidersRaw.includes("accessibilityProvider")) {
    includeProvidersRaw = [...includeProvidersRaw, "accessibilityProvider"];
  }
  if (args["exclude-seo"] && !excludeProvidersRaw.includes("seoProvider")) {
    excludeProvidersRaw = [...excludeProvidersRaw, "seoProvider"];
  }
  if (args["exclude-accessibility"] && !excludeProvidersRaw.includes("accessibilityProvider")) {
    excludeProvidersRaw = [...excludeProvidersRaw, "accessibilityProvider"];
  }

  return {
    pipeline,
    profileId: args.profile ? String(args.profile) : null,
    providerPolicyOptions: {
      execution,
      includeProviders: includeProvidersRaw.length > 0 ? includeProvidersRaw : null,
      excludeProviders: excludeProvidersRaw,
      providerPriorityOverrides: parsePriorityMap(args["provider-priority"]),
      maxConcurrency,
      globalTimeoutMs: args["global-timeout"] !== undefined ? Number(args["global-timeout"]) : null,
      individualTimeoutMs: args["provider-timeout"] !== undefined ? Number(args["provider-timeout"]) : null,
    },
    wcagLevel: resolveWcagLevel(args),
  };
}

// Paso 17 — --wcag-level filtra QUÉ criterios mostrar en salidas del CLI
// (research:accessibility/--explain-accessibility-score); nunca cambia
// qué comprobaciones ejecuta a11yAnalyzer.js (todas se ejecutan siempre).
const WCAG_LEVELS = Object.freeze(["A", "AA"]);
function resolveWcagLevel(args) {
  if (args["wcag-level"] === undefined) return null;
  const level = String(args["wcag-level"]).toUpperCase();
  if (!WCAG_LEVELS.includes(level)) throw new ResearchCliError(`--wcag-level desconocido: "${args["wcag-level"]}". Usa uno de: ${WCAG_LEVELS.join(", ")}.`);
  return level;
}

/** Carga un Research Request desde --request=<ruta.json>, validándolo. */
export async function loadResearchRequestFromFile(filePath) {
  const raw = await readFile(String(filePath), "utf8").catch((err) => {
    throw new ResearchCliError(`No se pudo leer --request="${filePath}": ${err.message}`);
  });
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new ResearchCliError(`--request="${filePath}" no es un JSON válido: ${err.message}`);
  }
  const { valid, errors } = validateResearchRequest(parsed);
  if (!valid) throw new ResearchCliError(`--request="${filePath}" no es un Research Request válido:\n${errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n")}`);
  return parsed;
}

/**
 * Construye un Research Request a partir de flags CLI, o lo carga de
 * --request=<ruta.json> si se indica. --fixture/--fixtures acepta ids de
 * fixtures ficticias (ver fixtures/demoFixtures.js) o --demo=<id> como
 * atajo que además rellena el nombre/sector del negocio automáticamente.
 */
export async function resolveResearchRequestFromArgs(args) {
  if (args.request) return loadResearchRequestFromFile(args.request);

  const fixtures = [...splitList(args.fixture), ...splitList(args.fixtures)];
  if (args.demo) {
    if (!DEMO_FIXTURE_IDS.includes(String(args.demo))) {
      throw new ResearchCliError(`--demo desconocido: "${args.demo}". Ids válidos: ${DEMO_FIXTURE_IDS.join(", ")}`);
    }
    fixtures.push(String(args.demo));
  }

  const demoFixture = args.demo ? DEMO_FIXTURES[String(args.demo)] : null;
  const businessName = args["business-name"] || demoFixture?.business?.name;
  const sector = args.sector || demoFixture?.business?.sector;

  if (!businessName || !sector) {
    throw new ResearchCliError('Debes indicar --request=<ruta.json>, o --demo=<id>, o al menos --business-name="..." y --sector=<id>.');
  }

  return buildResearchRequest({
    mode: resolveRequestMode(args),
    language: args.language || (demoFixture?.business?.location?.includes("UK") ? "en" : "es"),
    seed: args.seed,
    business: { name: businessName, sector, location: args.location || demoFixture?.business?.location },
    inputs: {
      urls: splitList(args.url).concat(splitList(args.urls)),
      localFiles: splitList(args["local-file"]).concat(splitList(args["local-files"])),
      fixtures,
      competitors: splitList(args.competitor).concat(splitList(args.competitors)),
    },
    requestedDimensions: args.include ? splitList(args.include) : undefined,
    excludedDimensions: args.exclude ? splitList(args.exclude) : [],
    limits: args["max-sources"] || args["max-depth"] || args.timeout ? { ...(args["max-sources"] ? { maxSources: Number(args["max-sources"]) } : {}), ...(args["max-depth"] ? { maxDepth: Number(args["max-depth"]) } : {}), ...(args.timeout ? { timeoutMs: Number(args.timeout) } : {}) } : undefined,
    sourcePolicy: { ...(args["allow-domain"] ? { allowDomains: splitList(args["allow-domain"]) } : {}), ...(args["deny-domain"] ? { denyDomains: splitList(args["deny-domain"]) } : {}) },
  });
}

export function resolveFormat(args) {
  const format = args.format || "summary";
  if (!["json", "markdown", "summary"].includes(format)) {
    throw new ResearchCliError(`--format desconocido: "${format}". Usa json | markdown | summary.`);
  }
  return format;
}

export async function loadJsonFile(filePath, label) {
  const raw = await readFile(String(filePath), "utf8").catch((err) => {
    throw new ResearchCliError(`No se pudo leer ${label}="${filePath}": ${err.message}`);
  });
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new ResearchCliError(`${label}="${filePath}" no es un JSON válido: ${err.message}`);
  }
}

/** Escribe --output=<ruta> si se indica; si no, imprime a stdout. Nunca sobrescribe silenciosamente rutas fuera de --output explícito. */
export async function writeOutputOrPrint(args, content) {
  if (args.output) {
    await mkdir(path.dirname(path.resolve(String(args.output))), { recursive: true });
    await writeFile(String(args.output), content, "utf8");
    console.log(`Guardado en ${args.output}`);
  } else {
    console.log(content);
  }
}

/** Comprobación de salud del motor de investigación (mismo patrón que business:doctor de Paso 10). */
export async function runResearchDoctorChecks({ auditsDir = DEFAULT_AUDITS_DIR } = {}) {
  const checks = [];

  checks.push({ id: "source_adapters_loaded", ok: SOURCE_ADAPTER_IDS.length === 13, detail: `${SOURCE_ADAPTER_IDS.length}/13 adaptadores offline registrados` });
  checks.push({ id: "dimension_registry_complete", ok: DIMENSION_IDS.length === 45, detail: `${DIMENSION_IDS.length}/45 dimensiones registradas` });
  checks.push({ id: "sector_presets_loaded", ok: AUDIT_SECTOR_IDS.every((id) => Boolean(SECTOR_AUDIT_PRESETS[id])), detail: `${Object.keys(SECTOR_AUDIT_PRESETS).length}/${AUDIT_SECTOR_IDS.length} presets sectoriales de auditoría` });
  checks.push({ id: "demo_fixtures_loadable", ok: DEMO_FIXTURE_IDS.length === 10, detail: `${DEMO_FIXTURE_IDS.length}/10 fixtures de demostración` });

  const researchExtensionPoints = EXTENSION_POINTS.filter((p) => p.category === "research" || ["searchEngineProvider", "openAiCompatibleResearchProvider", "perplexityCompatibleProvider", "localModelResearchProvider"].includes(p.id));
  checks.push({ id: "extension_points_research_contracts", ok: researchExtensionPoints.length >= 13, detail: `${researchExtensionPoints.length} puntos de extensión de investigación registrados (contrato, sin conexión real)` });
  checks.push({ id: "all_extension_points_not_implemented", ok: EXTENSION_POINTS.every((p) => p.status === "not_implemented"), detail: "ninguna integración real activa (esperado en este paso)" });

  const auditsDirExists = await stat(auditsDir).then((s) => s.isDirectory()).catch(() => false);
  checks.push({ id: "audits_dir_readable", ok: true, detail: auditsDirExists ? `existe: ${auditsDir}` : `aún no existe (se creará en el primer research:audit): ${auditsDir}` });

  let auditCount = 0;
  let allRequestsValid = true;
  const invalidDetails = [];
  if (auditsDirExists) {
    const entries = await readdir(auditsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      auditCount++;
      const requestPath = path.join(auditsDir, entry.name, "research-request.json");
      const raw = await readFile(requestPath, "utf8").catch(() => null);
      if (!raw) continue;
      try {
        const { valid, errors } = validateResearchRequest(JSON.parse(raw));
        if (!valid) {
          allRequestsValid = false;
          invalidDetails.push(`${entry.name}: ${errors.length} error(es)`);
        }
      } catch {
        allRequestsValid = false;
        invalidDetails.push(`${entry.name}: research-request.json corrupto`);
      }
    }
  }
  checks.push({ id: "generated_audits_count", ok: true, detail: `${auditCount} auditoría(s) generada(s)` });
  checks.push({ id: "generated_audits_requests_still_valid", ok: allRequestsValid, detail: allRequestsValid ? "todos los research-request.json generados siguen siendo válidos" : invalidDetails.join("; ") });

  const offlinePolicy = evaluatePolicy(buildResearchRequest({ business: { name: "doctor-check", sector: "generic-local-service" } }));
  checks.push({ id: "offline_default_enforced", ok: offlinePolicy.mode === "offline", detail: `modo por defecto: ${offlinePolicy.mode}` });

  const requiredModes = ["offline", "online", "public-web", "hybrid"];
  const modesOk = requiredModes.every((mode) => RESEARCH_MODES.includes(mode));
  checks.push({ id: "network_modes_registered", ok: modesOk, detail: `modos disponibles: ${RESEARCH_MODES.join(", ")}` });

  try {
    const providerHealth = await PUBLIC_WEBSITE_FETCHER_PROVIDER.healthCheck();
    checks.push({ id: "public_website_fetcher_provider_loaded", ok: providerHealth.healthy, detail: providerHealth.message });
  } catch (err) {
    checks.push({ id: "public_website_fetcher_provider_loaded", ok: false, detail: `error al cargar el proveedor: ${err.message}` });
  }

  // Paso 14 — el registro multiproveedor (core/providerRegistry.js) descubre
  // sus plugins automáticamente desde providers/plugins/; este check confirma
  // que los 13 (12 stub + 1 real) cargan sin errores, sin listar el resto de
  // checks existentes (mismo patrón que el check anterior de Paso 13).
  try {
    const registry = createProviderRegistry();
    const pluginsDir = path.resolve("src", "saas-core", "research", "providers", "plugins");
    const { loaded, errors } = await discoverAndRegisterPlugins(registry, pluginsDir);
    const stubCount = registry.list().filter((p) => p.status === "stub").length;
    const realCount = registry.list().filter((p) => p.status === "real").length;
    checks.push({
      id: "multiprovider_registry_loaded",
      ok: errors.length === 0 && loaded.length === 13,
      detail: errors.length === 0 ? `${loaded.length}/13 proveedores registrados (${realCount} real, ${stubCount} stub)` : `${errors.length} plugin(s) con error: ${errors.map((e) => `${e.file} — ${e.reason}`).join("; ")}`,
    });
  } catch (err) {
    checks.push({ id: "multiprovider_registry_loaded", ok: false, detail: `error al descubrir plugins: ${err.message}` });
  }

  let playwrightAvailable = false;
  try {
    await import("playwright");
    playwrightAvailable = true;
  } catch {
    playwrightAvailable = false;
  }
  checks.push({ id: "mockup_capture_tool_available", ok: true, detail: playwrightAvailable ? "playwright disponible: captura real posible" : "playwright NO instalado: sin captura real de mockups (no bloquea este paso)" });

  const ok = checks.every((c) => c.ok);
  return { ok, checks };
}
