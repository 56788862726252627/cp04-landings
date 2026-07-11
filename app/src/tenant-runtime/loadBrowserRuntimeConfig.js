// Club Pádel 04 · Loader de configuración runtime SEGURO PARA NAVEGADOR.
//
// Por qué existe en vez de reusar src/config/loadCoreConfig.js (y los otros
// 3 loaders "loadX"): esos 4 archivos + src/config/paths.js importan
// "node:fs"/"node:url"/"node:path" de nivel superior — Vite externaliza esos
// módulos para el bundle de navegador (no hay filesystem en el navegador),
// así que cualquier código que dependa de ellos rompería en runtime real
// aunque el build no falle. Mismo problema, y misma solución, que
// worker-reservas/src/observability-runtime.js con "node:crypto" en el
// Worker: en vez de importar los módulos con el import problemático,
// se importan los documentos JSON de config/ como datos estáticos (Vite
// soporta `import x from "*.json"` de forma nativa, resuelto en build time,
// cero I/O en runtime) y se reutilizan directamente los validadores/loaders
// PUROS que sí son browser-safe (schemaValidator.mjs vía validateAgainstSchema,
// mergeConfigLayers, validateResolvedConfig — confirmado sin imports de node:*).
//
// Fuente de los 4 documentos: los mismos ficheros *.example.valid.json que
// ya usan los tests — su contenido, pese al nombre "example", ES la
// configuración real de Club Pádel 04 (tenantId "cp04", slug
// "club-padel-04", pistas/horario idénticos a los que ya usaba App.jsx
// antes de esta extracción — ver src/data/clientConfig.default.js) más 3
// tenants fixture (staging/disabled/maintenance) que existen solo para
// poder probar esos 3 estados sin inventar clientes reales.

// Atributo `with { type: "json" }` (estándar ES2025 / Node >=22): necesario
// para que este módulo pueda importarse tal cual tanto bajo Vite (bundle de
// navegador) como bajo `node --test` (tests de este mismo archivo) sin dos
// implementaciones distintas.
import coreConfig from "../../config/core-config.default.json" with { type: "json" };
import coreSchema from "../../config/core-config.schema.json" with { type: "json" };
import verticalConfig from "../../config/vertical-config.padel.json" with { type: "json" };
import verticalSchema from "../../config/vertical-config.schema.json" with { type: "json" };
import clientConfig from "../../config/client-config.example.valid.json" with { type: "json" };
import clientSchema from "../../config/client-config.schema.json" with { type: "json" };
import tenantRegistry from "../../config/tenant-registry.example.valid.json" with { type: "json" };
import tenantRegistrySchema from "../../config/tenant-registry.schema.json" with { type: "json" };

import { validateAgainstSchema } from "../config/schemaValidator.js";
import { mergeConfigLayers } from "../config/mergeConfigLayers.js";
import { validateResolvedConfig } from "../config/validateResolvedConfig.js";

function assertValid(schema, doc, label) {
  const result = validateAgainstSchema(schema, doc);
  if (!result.valid) {
    throw new Error(`${label} inválido: ${JSON.stringify(result.errors)}`);
  }
  return doc;
}

/**
 * @returns {{resolvedConfig: object, validation: {valid: boolean, errors: Array}, registry: object}}
 */
export function loadBrowserRuntimeConfig() {
  const core = assertValid(coreSchema, coreConfig, "core-config");
  const vertical = assertValid(verticalSchema, verticalConfig, "vertical-config");
  const client = assertValid(clientSchema, clientConfig, "client-config");
  const registry = assertValid(tenantRegistrySchema, tenantRegistry, "tenant-registry");

  const resolvedConfig = mergeConfigLayers({ core, vertical, client });
  const validation = validateResolvedConfig(resolvedConfig, { core, registry });

  return { resolvedConfig, validation, registry };
}
