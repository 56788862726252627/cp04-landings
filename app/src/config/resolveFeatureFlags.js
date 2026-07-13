// Cascada de feature flags: GLOBAL_DEFAULT (core.featureDefaults) <
// VERTICAL_DEFAULT (vertical.featureOverrides) < CLIENT_OVERRIDE
// (client.features) — el nivel más específico gana. Después aplica
// degradación por dependencias (core.featureDependencies) hasta alcanzar un
// punto fijo, mismo principio fail-closed que cp04NormalizeRole en
// src/utils/rbac.js: una feature ON cuya dependencia resuelve a OFF se
// degrada a OFF, nunca al revés.
// Ver docs/agencia-ia/FEATURE_FLAG_RESOLUTION_ENGINE.md.

/**
 * @param {object} core Documento core-config ya validado (loadCoreConfig()).
 * @param {object} [vertical] Documento vertical-config ya validado.
 * @param {object} [client] Documento client-config ya validado.
 * @returns {{ features: Record<string, boolean>, degraded: Array<{feature: string, missingDependencies: string[]}> }}
 */
export function resolveFeatureFlags(core, vertical, client) {
  if (!core?.featureDefaults) {
    throw new Error("resolveFeatureFlags requiere core.featureDefaults (core-config inválido o ausente)");
  }
  const keys = Object.keys(core.featureDefaults);
  const features = {};

  for (const key of keys) {
    let value = core.featureDefaults[key]; // GLOBAL_DEFAULT
    if (vertical?.featureOverrides && Object.prototype.hasOwnProperty.call(vertical.featureOverrides, key)) {
      value = vertical.featureOverrides[key]; // VERTICAL_DEFAULT
    }
    if (client?.features && Object.prototype.hasOwnProperty.call(client.features, key)) {
      value = client.features[key]; // CLIENT_OVERRIDE
    }
    features[key] = value;
  }

  const degraded = [];
  const dependencies = core.featureDependencies ?? {};
  let changed = true;
  while (changed) {
    changed = false;
    for (const [feature, deps] of Object.entries(dependencies)) {
      if (!features[feature]) continue;
      const missing = deps.filter((dep) => !features[dep]);
      if (missing.length > 0) {
        features[feature] = false;
        changed = true;
        degraded.push({ feature, missingDependencies: missing });
      }
    }
  }

  return { features, degraded };
}
