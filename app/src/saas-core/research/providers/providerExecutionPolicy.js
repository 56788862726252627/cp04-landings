// Paso 15 · Fase 2/3 — ProviderExecutionPolicy: config normalizada y
// validada que decide CÓMO se ejecuta el pipeline multiproveedor dentro
// de una auditoría (modo, proveedores incluidos/excluidos, prioridades,
// timeouts, concurrencia, perfil sectorial). Puro dato + validación: no
// ejecuta nada, no conoce Evidence ni auditOrchestrator.js.

import { EXECUTION_MODES } from "./core/providerPipeline.js";

export const PIPELINE_MODES = Object.freeze(["legacy", "multiprovider"]);

/**
 * @param {object} input
 * @returns {object} ProviderExecutionPolicy congelada
 */
export function defineProviderExecutionPolicy({
  pipeline = "legacy",
  execution = "fallback",
  includeProviders = null, // null = todos los descubiertos; array = allowlist explícita
  excludeProviders = [],
  providerPriorityOverrides = {},
  maxConcurrency = null, // null = sin límite (Promise.all, comportamiento Paso 14)
  globalTimeoutMs = null,
  individualTimeoutMs = null,
  strict = false,
  allowNetwork = false,
  profileId = null,
} = {}) {
  if (!PIPELINE_MODES.includes(pipeline)) {
    throw new Error(`ProviderExecutionPolicy: pipeline desconocido "${pipeline}" (usa: ${PIPELINE_MODES.join(", ")})`);
  }
  if (!EXECUTION_MODES.includes(execution)) {
    throw new Error(`ProviderExecutionPolicy: execution desconocido "${execution}" (usa: ${EXECUTION_MODES.join(", ")})`);
  }
  if (includeProviders !== null && !Array.isArray(includeProviders)) {
    throw new Error("ProviderExecutionPolicy: includeProviders debe ser null o un array de ids");
  }
  if (maxConcurrency !== null && (!Number.isInteger(maxConcurrency) || maxConcurrency < 1)) {
    throw new Error("ProviderExecutionPolicy: maxConcurrency debe ser null o un entero >= 1");
  }

  return Object.freeze({
    pipeline,
    execution,
    includeProviders: includeProviders === null ? null : Object.freeze([...includeProviders]),
    excludeProviders: Object.freeze([...excludeProviders]),
    providerPriorityOverrides: Object.freeze({ ...providerPriorityOverrides }),
    maxConcurrency,
    globalTimeoutMs,
    individualTimeoutMs,
    strict: Boolean(strict),
    allowNetwork: Boolean(allowNetwork),
    profileId,
  });
}

/**
 * Aplica una ProviderExecutionPolicy ya construida a un ProviderRegistry:
 * activa/desactiva por allowlist/denylist y aplica prioridades explícitas.
 * No ejecuta nada — solo prepara el registro para `resolveFallbackChain`.
 * @param {ReturnType<import("./core/providerRegistry.js").createProviderRegistry>} registry
 * @param {object} policy
 */
export function applyExecutionPolicyToRegistry(registry, policy) {
  for (const provider of registry.list()) {
    const includedByAllowlist = policy.includeProviders === null || policy.includeProviders.includes(provider.id);
    const excludedByDenylist = policy.excludeProviders.includes(provider.id);
    registry.setEnabled(provider.id, includedByAllowlist && !excludedByDenylist && provider.enabled);
    if (policy.providerPriorityOverrides[provider.id] !== undefined) {
      registry.setPriority(provider.id, policy.providerPriorityOverrides[provider.id]);
    }
  }
}
