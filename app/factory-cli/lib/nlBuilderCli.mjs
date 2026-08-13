// Paso 11 · Lógica compartida del CLI del Natural Language Business Builder.
//
// Reutiliza `parseCliArgs` de Paso 09/10 (no lo duplica). Nunca escribe
// fuera de una ruta explícita del usuario (--output/--output-dir) o del
// directorio controlado por defecto (nl-builder/requests/<businessId>/,
// distinto de saas-core/businesses/, que sigue siendo territorio exclusivo
// del orquestador de Paso 10).

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { parseCliArgs } from "../../tenant-cli/lib/tenantProvisioning.mjs";
import { interpretBusinessDescription } from "../../src/saas-core/nl-builder/intentExtractor.js";
import { composeBlueprintFromIntent } from "../../src/saas-core/nl-builder/blueprintComposer.js";
import { validateBusinessIntent } from "../../src/saas-core/nl-builder/businessIntentSchema.js";
import { serializeAsJson, serializeIntentAsSummary, serializeIntentAsMarkdown, renderExplanation, structuralDiff, serializeDiffAsMarkdown } from "../../src/saas-core/nl-builder/outputSerializer.js";
import { DEMO_REQUESTS } from "../../src/saas-core/nl-builder/demoRequests.js";

export { parseCliArgs, interpretBusinessDescription, composeBlueprintFromIntent, validateBusinessIntent };

export const DEFAULT_NL_REQUESTS_DIR = path.join("src", "saas-core", "nl-builder", "requests");

export class NlBuilderCliError extends Error {}

/** Resuelve el texto de entrada desde --prompt=<texto> o --prompt-file=<ruta>. */
export async function resolvePromptFromArgs(args) {
  if (typeof args.prompt === "string") return args.prompt;
  if (typeof args["prompt-file"] === "string") {
    const raw = await readFile(args["prompt-file"], "utf8").catch((err) => {
      throw new NlBuilderCliError(`No se pudo leer --prompt-file="${args["prompt-file"]}": ${err.message}`);
    });
    return raw;
  }
  if (typeof args.demo === "string") {
    const demo = DEMO_REQUESTS.find((d) => d.id === args.demo);
    if (!demo) throw new NlBuilderCliError(`--demo desconocido: "${args.demo}". Ids válidos: ${DEMO_REQUESTS.map((d) => d.id).join(", ")}`);
    return demo.prompt;
  }
  throw new NlBuilderCliError('Debes indicar --prompt="<texto>", --prompt-file=<ruta> o --demo=<id>.');
}

export function resolveSeedFromArgs(args) {
  return typeof args.seed === "string" ? args.seed : "default-seed";
}

/** Carga --answers=<ruta.json> como mapa {field: valor}. Ausente = sin respuestas (no interactivo por defecto). */
export async function resolveAnswersFromArgs(args) {
  if (!args.answers) return {};
  const raw = await readFile(String(args.answers), "utf8").catch((err) => {
    throw new NlBuilderCliError(`No se pudo leer --answers="${args.answers}": ${err.message}`);
  });
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("debe ser un objeto {campo: valor}");
    return parsed;
  } catch (err) {
    throw new NlBuilderCliError(`--answers="${args.answers}" no es un JSON válido: ${err.message}`);
  }
}

export async function loadIntentFromFile(filePath) {
  const raw = await readFile(String(filePath), "utf8").catch((err) => {
    throw new NlBuilderCliError(`No se pudo leer --intent="${filePath}": ${err.message}`);
  });
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new NlBuilderCliError(`--intent="${filePath}" no es un JSON válido: ${err.message}`);
  }
  const { valid, errors } = validateBusinessIntent(parsed);
  if (!valid) {
    throw new NlBuilderCliError(`--intent="${filePath}" no es un Business Intent válido:\n${errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n")}`);
  }
  return parsed;
}

const FORMAT_RENDERERS = Object.freeze({
  json: (intent) => serializeAsJson(intent),
  markdown: (intent) => serializeIntentAsMarkdown(intent),
  summary: (intent) => serializeIntentAsSummary(intent),
});

export function renderIntentInFormat(intent, format = "json") {
  const renderer = FORMAT_RENDERERS[format];
  if (!renderer) throw new NlBuilderCliError(`--format desconocido: "${format}". Usa uno de: ${Object.keys(FORMAT_RENDERERS).join(", ")}`);
  return renderer(intent);
}

/** Escribe un archivo de texto SOLO en una ruta explícita (--output) dada por el usuario, nunca de forma implícita. */
export async function writeOutputIfRequested(args, content) {
  if (!args.output) return null;
  const outPath = String(args.output);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, content, "utf8");
  return outPath;
}

/** Directorio de artefactos de análisis (intent/blueprint/report) para un negocio, dentro del área controlada de Paso 11. */
export function resolveRequestDir(businessId, { baseDir = DEFAULT_NL_REQUESTS_DIR } = {}) {
  return path.join(baseDir, businessId);
}

export async function writeRequestArtifacts({ businessId, intent, blueprint, baseDir = DEFAULT_NL_REQUESTS_DIR }) {
  const dir = resolveRequestDir(businessId, { baseDir });
  await mkdir(dir, { recursive: true });
  const files = {};
  files.intentPath = path.join(dir, "intent.json");
  await writeFile(files.intentPath, serializeAsJson(intent), "utf8");
  if (blueprint) {
    files.blueprintPath = path.join(dir, "business.blueprint.json");
    await writeFile(files.blueprintPath, serializeAsJson(blueprint), "utf8");
  }
  return { dir, ...files };
}

export function hasBlockingAmbiguities(intent) {
  return intent.ambiguities.some((a) => a.blocking === true);
}

export { renderExplanation, structuralDiff, serializeDiffAsMarkdown, serializeAsJson };
