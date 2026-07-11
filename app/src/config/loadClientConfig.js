// Carga y valida la capa CLIENT contra config/client-config.schema.json
// (schema real, sin cambios). No asume ningún slug por defecto — a
// diferencia de core/vertical, no hay "un cliente por defecto" razonable
// a nivel de plataforma (mismo principio de no fabricar datos: incluso
// Club Pádel 04 debe pasarse explícitamente por quien llama).
import { readFileSync } from "node:fs";
import { repoPath } from "./paths.js";
import { validateAgainstSchema } from "./schemaValidator.js";

const DEFAULT_SCHEMA_PATH = repoPath("config", "client-config.schema.json");

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

/**
 * @param {string|object} source Ruta a un client-config.json (p.ej.
 *   "clients/<slug>/client-config.json"), o el objeto ya parseado.
 * @param {object} [schema] Schema a validar contra (por defecto el real).
 */
export function loadClientConfig(source, schema = readJson(DEFAULT_SCHEMA_PATH)) {
  if (source === undefined) {
    throw new Error("loadClientConfig requiere una ruta o un objeto client-config — no hay cliente por defecto");
  }
  const doc = typeof source === "string" ? readJson(source) : source;
  const result = validateAgainstSchema(schema, doc);
  if (!result.valid) {
    throw new Error(`client-config inválido: ${JSON.stringify(result.errors)}`);
  }
  return doc;
}
