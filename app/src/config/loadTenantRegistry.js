// Carga y valida el registro de tenants (config/tenant-registry.schema.json).
// Nota: el schema valida FORMA (tipos/enums/campos requeridos), no reglas de
// negocio entre items (tenantId/domain duplicados) — eso vive en
// src/config/validateResolvedConfig.js#checkTenantRegistryDuplicates, misma
// separación ya usada por el resto de loaders de este proyecto.
import { readFileSync } from "node:fs";
import { repoPath } from "./paths.js";
import { validateAgainstSchema } from "./schemaValidator.js";

const DEFAULT_SCHEMA_PATH = repoPath("config", "tenant-registry.schema.json");

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

/**
 * @param {string|object} source Ruta a un tenant-registry.json, o el objeto
 *   ya parseado. No hay registro por defecto (mismo principio que
 *   loadClientConfig: no fabricar datos, quien llama decide qué registro usar).
 * @param {object} [schema] Schema a validar contra (por defecto el real).
 */
export function loadTenantRegistry(source, schema = readJson(DEFAULT_SCHEMA_PATH)) {
  if (source === undefined) {
    throw new Error("loadTenantRegistry requiere una ruta o un objeto tenant-registry — no hay registro por defecto");
  }
  const doc = typeof source === "string" ? readJson(source) : source;
  const result = validateAgainstSchema(schema, doc);
  if (!result.valid) {
    throw new Error(`tenant-registry inválido: ${JSON.stringify(result.errors)}`);
  }
  return doc;
}
