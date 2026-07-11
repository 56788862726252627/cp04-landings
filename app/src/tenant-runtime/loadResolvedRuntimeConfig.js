// Composición de todo el pipeline de carga ya existente
// (loadCoreConfig → loadVerticalConfig → loadClientConfig →
// mergeConfigLayers → validateResolvedConfig) en una sola llamada de
// runtime. No reimplementa ninguna capa: solo las encadena en el orden
// correcto y devuelve tanto el resolvedConfig como el resultado de
// validación cruzada, para que quien integre el runtime no tenga que
// conocer el orden interno de 5 pasos.
import { loadCoreConfig } from "../config/loadCoreConfig.js";
import { loadVerticalConfig } from "../config/loadVerticalConfig.js";
import { loadClientConfig } from "../config/loadClientConfig.js";
import { mergeConfigLayers } from "../config/mergeConfigLayers.js";
import { validateResolvedConfig } from "../config/validateResolvedConfig.js";

/**
 * @param {object} params
 * @param {string|object} [params.coreSource] Por defecto config/core-config.default.json.
 * @param {string|object} [params.verticalSource] Por defecto config/vertical-config.padel.json.
 * @param {string|object} params.clientSource Requerido — sin cliente por defecto (mismo principio que loadClientConfig).
 * @param {object} [params.registry] tenant-registry ya cargado, para los checks cross-tenant de validateResolvedConfig.
 * @returns {{resolvedConfig: object, validation: {valid: boolean, errors: Array}, layers: {core: object, vertical: object, client: object}}}
 */
export function loadResolvedRuntimeConfig({ coreSource, verticalSource, clientSource, registry } = {}) {
  if (clientSource === undefined) {
    throw new Error("loadResolvedRuntimeConfig requiere clientSource (ruta u objeto client-config) — no hay cliente por defecto");
  }

  const core = coreSource === undefined ? loadCoreConfig() : loadCoreConfig(coreSource);
  const vertical = verticalSource === undefined ? loadVerticalConfig() : loadVerticalConfig(verticalSource);
  const client = loadClientConfig(clientSource);

  const resolvedConfig = mergeConfigLayers({ core, vertical, client });
  const validation = validateResolvedConfig(resolvedConfig, { core, registry });

  return { resolvedConfig, validation, layers: { core, vertical, client } };
}
