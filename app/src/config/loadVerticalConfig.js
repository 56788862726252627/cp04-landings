// Carga y valida la capa VERTICAL. Por defecto lee el único vertical real
// hoy (padel) — ver config/vertical-config.padel.json.
import { readFileSync } from "node:fs";
import { repoPath } from "./paths.js";
import { validateAgainstSchema } from "./schemaValidator.js";

const DEFAULT_SCHEMA_PATH = repoPath("config", "vertical-config.schema.json");
const DEFAULT_CONFIG_PATH = repoPath("config", "vertical-config.padel.json");

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

/**
 * @param {string|object} [source] Ruta a un vertical-config.json, o el
 *   objeto ya parseado. Por defecto lee config/vertical-config.padel.json.
 * @param {object} [schema] Schema a validar contra (por defecto el real).
 */
export function loadVerticalConfig(source = DEFAULT_CONFIG_PATH, schema = readJson(DEFAULT_SCHEMA_PATH)) {
  const doc = typeof source === "string" ? readJson(source) : source;
  const result = validateAgainstSchema(schema, doc);
  if (!result.valid) {
    throw new Error(`vertical-config inválido: ${JSON.stringify(result.errors)}`);
  }
  return doc;
}
