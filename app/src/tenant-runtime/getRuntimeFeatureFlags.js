// Accesor de runtime sobre la cascada de feature flags ya implementada en
// src/config/resolveFeatureFlags.js (GLOBAL_DEFAULT < VERTICAL_DEFAULT <
// CLIENT_OVERRIDE + degradación por dependencias hasta punto fijo). No
// reimplementa la cascada — mergeConfigLayers ya la ejecutó al construir
// resolvedConfig; aquí solo se expone en la forma que consumirá el runtime
// (Provider/hooks), y se reexpone resolveFeatureFlags para poder probar
// cascadas hipotéticas (Fase 4: dependencias de "foundations" de
// integración que hoy no son features reales — ver el test de este módulo).
import { resolveFeatureFlags } from "../config/resolveFeatureFlags.js";

/**
 * @param {object} resolvedConfig Salida de mergeConfigLayers()/loadResolvedRuntimeConfig().
 * @returns {{features: Record<string, boolean>, degraded: Array<{feature: string, missingDependencies: string[]}>}}
 */
export function getRuntimeFeatureFlags(resolvedConfig) {
  if (!resolvedConfig?.features) {
    throw new Error("getRuntimeFeatureFlags requiere un resolvedConfig ya resuelto (usar loadResolvedRuntimeConfig primero)");
  }
  return { features: resolvedConfig.features, degraded: resolvedConfig.featuresDegraded ?? [] };
}

/**
 * Reexporta resolveFeatureFlags para poder ejecutar la cascada sobre
 * catálogos de features hipotéticos (p.ej. "foundations" de integración
 * futuras) sin tocar config/core-config.default.json real. Misma función,
 * mismo comportamiento — no es una reimplementación paralela.
 */
export function resolveRuntimeFeatureCascade(core, vertical, client) {
  return resolveFeatureFlags(core, vertical, client);
}
