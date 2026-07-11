// Carga y valida la capa CORE (config/core-config.default.json contra
// config/core-config.schema.json). Acepta también un objeto ya parseado
// (inyección de dependencia) para poder testear sin tocar disco, mismo
// patrón usado en la fase de resiliencia de este proyecto.
import { readFileSync } from "node:fs";
import { repoPath } from "./paths.js";
import { validateAgainstSchema } from "./schemaValidator.js";

const DEFAULT_SCHEMA_PATH = repoPath("config", "core-config.schema.json");
const DEFAULT_CONFIG_PATH = repoPath("config", "core-config.default.json");

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

/**
 * @param {string|object} [source] Ruta a un core-config.json, o el objeto
 *   ya parseado. Por defecto lee config/core-config.default.json.
 * @param {object} [schema] Schema a validar contra (por defecto el real).
 */
export function loadCoreConfig(source = DEFAULT_CONFIG_PATH, schema = readJson(DEFAULT_SCHEMA_PATH)) {
  const doc = typeof source === "string" ? readJson(source) : source;
  const result = validateAgainstSchema(schema, doc);
  if (!result.valid) {
    throw new Error(`core-config inválido: ${JSON.stringify(result.errors)}`);
  }
  return doc;
}
