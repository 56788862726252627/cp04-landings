// Paso 20 · Fase 9 — utilidades compartidas de la CLI comercial.
// Reutiliza `parseCliArgs` de Paso 09 y `writeOutputOrPrint` de Paso 12
// (no las duplica) — mismo patrón que `research-cli/lib/researchCli.mjs`.

import { readFile } from "node:fs/promises";

import { parseCliArgs } from "../../tenant-cli/lib/tenantProvisioning.mjs";
import { writeOutputOrPrint } from "../../research-cli/lib/researchCli.mjs";
import { COMMERCIAL_SECTOR_IDS } from "../../src/saas-core/commercial/commercialSectorProfiles.js";
import { PREVIEW_VIEWS, PREVIEW_DEVICES } from "../../src/saas-core/commercial/devicePreview.js";
import { ROI_SCENARIOS } from "../../src/saas-core/commercial/roiEngine.js";

export { parseCliArgs, writeOutputOrPrint };

export class CommercialCliError extends Error {}

const FORMATS = Object.freeze(["json", "markdown", "html"]);

export function resolveFormat(args) {
  const format = args.format ? String(args.format) : "markdown";
  if (!FORMATS.includes(format)) throw new CommercialCliError(`--format desconocido: "${args.format}". Usa uno de: ${FORMATS.join(", ")}.`);
  return format;
}

export function resolveDeviceFilter(args) {
  const device = args.device ? String(args.device) : "all";
  if (device !== "all" && !PREVIEW_DEVICES.includes(device)) throw new CommercialCliError(`--device desconocido: "${args.device}". Usa uno de: ${PREVIEW_DEVICES.join(", ")}, all.`);
  return device === "all" ? [...PREVIEW_DEVICES] : [device];
}

export function resolveViewFilter(args) {
  const view = args.view ? String(args.view) : "all";
  if (view !== "all" && !PREVIEW_VIEWS.includes(view)) throw new CommercialCliError(`--view desconocido: "${args.view}". Usa uno de: ${PREVIEW_VIEWS.join(", ")}, all.`);
  return view === "all" ? [...PREVIEW_VIEWS] : [view];
}

export function resolveScenarioFilter(args) {
  const scenario = args.scenario ? String(args.scenario) : "all";
  if (scenario !== "all" && !ROI_SCENARIOS.includes(scenario)) throw new CommercialCliError(`--scenario desconocido: "${args.scenario}". Usa uno de: ${ROI_SCENARIOS.join(", ")}, all.`);
  return scenario;
}

export function resolveProfileId(args) {
  if (!args.profile) return null;
  const profileId = String(args.profile);
  if (profileId !== "generic" && !COMMERCIAL_SECTOR_IDS.includes(profileId)) throw new CommercialCliError(`--profile desconocido: "${profileId}". Usa uno de: ${[...COMMERCIAL_SECTOR_IDS, "generic"].join(", ")}.`);
  return profileId;
}

/**
 * Construye el input de negocio/ROI/scores desde `--input=<ruta.json>`
 * (si se indica) o desde flags sueltos (`--business-name`, `--profile`).
 * Nunca inventa datos: sin `--input` ni flags, el input queda vacío
 * (el motor ROI/CommercialAssessment ya declaran qué falta).
 */
export async function resolveCommercialInputFromArgs(args) {
  let fileInput = {};
  if (args.input) {
    let raw;
    try {
      raw = await readFile(String(args.input), "utf8");
    } catch (err) {
      throw new CommercialCliError(`No se pudo leer --input="${args.input}": ${err.message}`);
    }
    try {
      fileInput = JSON.parse(raw);
    } catch (err) {
      throw new CommercialCliError(`--input="${args.input}" no es JSON válido: ${err.message}`);
    }
  }

  const profileId = resolveProfileId(args) ?? fileInput.profileId ?? null;
  const business = { ...(fileInput.business ?? {}), ...(args["business-name"] ? { name: String(args["business-name"]) } : {}), ...(args.sector ? { sector: String(args.sector) } : {}) };

  return {
    profileId,
    business,
    auditScores: fileInput.auditScores ?? {},
    risks: fileInput.risks ?? [],
    opportunities: fileInput.opportunities ?? [],
    recommendations: fileInput.recommendations ?? [],
    roiInputs: fileInput.roiInputs ?? {},
    externalContext: fileInput.externalContext ?? {},
  };
}

export function resolveMockIntegrationsEnv(args) {
  if (!args["mock-integrations"]) return {};
  // --mock-integrations: simula credenciales de TEST presentes únicamente
  // para que el panel muestre el estado SANDBOX en vez de NOT_CONFIGURED
  // — nunca activa red real (los adaptadores siguen sin fetchImpl real
  // en este camino de CLI).
  return { STRIPE_SECRET_KEY: "sk_test_mock_cli_preview", WHATSAPP_ACCESS_TOKEN: "mock_cli_preview_token", WHATSAPP_PHONE_NUMBER_ID: "000000000" };
}
