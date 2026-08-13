// Paso 14 · Fase 1/2 — ProviderRegistry + carga de plugins.
//
// El registro es la única pieza "núcleo": añadir un proveedor nuevo NO
// requiere tocar este archivo — basta con crear un módulo en
// providers/plugins/ que exporte `PROVIDER` (un ResearchProvider válido,
// ver providerTypes.js) y llamar a `discoverAndRegisterPlugins()`.

import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export class ProviderRegistryError extends Error {}

export function createProviderRegistry() {
  const providers = new Map(); // id -> { provider, enabled }

  function register(provider) {
    if (!provider || typeof provider.id !== "string") {
      throw new ProviderRegistryError("Solo se pueden registrar objetos ResearchProvider válidos (ver defineResearchProvider)");
    }
    if (providers.has(provider.id)) {
      throw new ProviderRegistryError(`Ya existe un proveedor registrado con id "${provider.id}"`);
    }
    providers.set(provider.id, { provider, enabled: provider.enabledByDefault !== false && provider.status !== "disabled" });
  }

  function unregister(id) {
    providers.delete(id);
  }

  function setEnabled(id, enabled) {
    const entry = providers.get(id);
    if (!entry) throw new ProviderRegistryError(`Proveedor desconocido: "${id}"`);
    entry.enabled = Boolean(enabled);
  }

  function setPriority(id, priority) {
    const entry = providers.get(id);
    if (!entry) throw new ProviderRegistryError(`Proveedor desconocido: "${id}"`);
    entry.provider = { ...entry.provider, priority };
  }

  function get(id) {
    return providers.get(id)?.provider ?? null;
  }

  function isEnabled(id) {
    return providers.get(id)?.enabled ?? false;
  }

  /** Lista todos los proveedores (habilitados o no), ordenados por prioridad ascendente (menor número = mayor prioridad, como en Unix nice). */
  function list({ onlyEnabled = false } = {}) {
    return [...providers.values()]
      .filter((entry) => !onlyEnabled || entry.enabled)
      .map((entry) => ({ ...entry.provider, enabled: entry.enabled }))
      .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
  }

  /** Proveedores habilitados que declaran poder cubrir una dimensión (o "*"), ordenados por prioridad — es la base de ProviderFallback. */
  function resolveFallbackChain(dimension) {
    return list({ onlyEnabled: true }).filter((p) => p.capabilities.dimensions.includes("*") || p.capabilities.dimensions.includes(dimension));
  }

  async function healthCheckAll() {
    const results = [];
    for (const { provider, enabled } of providers.values()) {
      try {
        const health = await provider.healthCheck();
        results.push({ id: provider.id, enabled, ...health });
      } catch (err) {
        results.push({ id: provider.id, enabled, healthy: false, mode: provider.status, message: `healthCheck lanzó: ${err.message}` });
      }
    }
    return results;
  }

  function clear() {
    providers.clear();
  }

  return { register, unregister, setEnabled, setPriority, get, isEnabled, list, resolveFallbackChain, healthCheckAll, clear };
}

/**
 * Descubre plugins de forma automática: escanea `pluginsDir` en busca de
 * módulos `.js` (nunca `.test.mjs`) que exporten `PROVIDER`, los importa
 * dinámicamente y los registra. Un plugin corrupto o inválido se omite
 * (se reporta en `errors`), sin romper la carga del resto.
 * @param {ReturnType<typeof createProviderRegistry>} registry
 * @param {string} pluginsDir
 */
export async function discoverAndRegisterPlugins(registry, pluginsDir) {
  const entries = await readdir(pluginsDir, { withFileTypes: true });
  const loaded = [];
  const errors = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js") || entry.name.endsWith(".test.mjs")) continue;
    const fullPath = path.join(pluginsDir, entry.name);
    try {
      const mod = await import(pathToFileURL(fullPath).href);
      if (!mod.PROVIDER) {
        errors.push({ file: entry.name, reason: 'el módulo no exporta "PROVIDER"' });
        continue;
      }
      registry.register(mod.PROVIDER);
      loaded.push(mod.PROVIDER.id);
    } catch (err) {
      errors.push({ file: entry.name, reason: err.message });
    }
  }

  return { loaded, errors };
}
