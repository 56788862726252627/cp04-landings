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
