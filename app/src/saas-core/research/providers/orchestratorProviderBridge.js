// Paso 15 · Fase 2 — OrchestratorProviderBridge.
//
// Único punto de contacto entre `auditOrchestrator.js` y el sistema
// multiproveedor de Paso 14 (`core/providerRegistry.js` +
// `core/providerPipeline.js`). Sustituye, SOLO cuando se pide
// explícitamente `pipeline: "multiprovider"`, la parte de `collectEvidence`
// que resolvía URLs vía `providers/publicWebsiteFetcher.js` directamente
// (Paso 13). El modo "legacy" (por defecto) sigue sin pasar por aquí en
// absoluto — ver auditOrchestrator.js.
//
// Garantías que este puente NO relaja frente al modo legacy:
//  - Sin `allowNetwork: true` Y un modo compatible (public-web/hybrid), el
//    proveedor real `publicWebsiteFetcher` se DESACTIVA en el registro
//    ANTES de resolver la cadena de fallback — nunca se invoca "por si
//    acaso" y se descarta el resultado después.
//  - Un proveedor stub (`status: "not_implemented"`) nunca aporta Evidence
//    real (ver evidenceAggregator.js) — como mucho aparece en el resumen.
//  - Un healthCheck() no saludable, o un circuit breaker abierto, excluye
//    ese proveedor de la cadena para ESTA ejecución (degradación
//    controlada: el resto de la cadena sigue intentándolo).

import path from "node:path";

import { createProviderRegistry, discoverAndRegisterPlugins } from "./core/providerRegistry.js";
import { runProviderPipeline } from "./core/providerPipeline.js";
import { defineProviderExecutionPolicy, applyExecutionPolicyToRegistry } from "./providerExecutionPolicy.js";
import { createProviderCircuitBreaker } from "./providerCircuitBreaker.js";
import { aggregateProviderResults, sanitizeErrorMessage } from "./evidenceAggregator.js";
import { getProviderSectorProfile, mergePolicyOptionsWithProfile } from "./providerSectorProfiles.js";

export const DEFAULT_PLUGINS_DIR = path.resolve("src", "saas-core", "research", "providers", "plugins");
export const REAL_PROVIDER_ID = "publicWebsiteFetcher";
// Paso 16 — segundo proveedor real: analiza (nunca descarga) las páginas
// que REAL_PROVIDER_ID ya recopiló en ESTA misma ejecución.
export const SEO_PROVIDER_ID = "seoProvider";

function emptyRunSummary({ execution, profileId, pluginLoadErrors }) {
  return { pipeline: "multiprovider", executionMode: execution, profileId, usedProviderId: null, providers: [], pluginLoadErrors, seo: null };
}

/**
 * Cadena de proveedores a intentar para esta ejecución: TODOS los
 * habilitados (tras política/salud/circuit breaker), por prioridad.
 *
 * Nota de diseño: `registry.resolveFallbackChain(dimension)` (Paso 14)
 * compara UNA dimensión a la vez, pensado para cuando cada proveedor
 * recibe un `collect()` con input específico de esa dimensión. Este
 * puente hace UNA sola llamada de recolección compartida (`{urls,
 * limits}`) para todos los proveedores por igual — filtrar por dimensión
 * aquí excluiría erróneamente proveedores recomendados por el perfil
 * cuya `capabilities.dimensions` no coincide literalmente con la lista de
 * `relevantDimensions` del perfil (p. ej. schemaProvider en el perfil
 * "hotel"). "Recomendado" en un perfil se traduce en PRIORIDAD más alta
 * (ver `providerSectorProfiles.js` → `providerPriorities`), no en ser el
 * único proveedor intentado — "excluido" sigue siendo el único mecanismo
 * de bloqueo duro.
 */
function resolveEligibleProviderChain(registry) {
  return registry.list({ onlyEnabled: true });
}

/**
 * @param {string[]} urls
 * @param {object} options
 * @param {boolean} options.allowNetwork - bandera de tiempo de ejecución (nunca inferida de un modo persistido)
 * @param {boolean} options.modeAllowsNetwork - si `request.mode` es public-web/hybrid
 * @param {object} options.networkLimits - se pasa tal cual al proveedor real
 * @param {object} options.policyOptions - input de defineProviderExecutionPolicy (sin `allowNetwork`, se añade aquí)
 * @param {string|null} options.profileId - id de providerSectorProfiles.js
 * @param {Function} options.evidenceForUnavailableUrl - inyectada desde auditOrchestrator.js (evita import circular)
 * @param {ReturnType<typeof createProviderRegistry>|null} options.registry - opcional, para tests o reutilización entre auditorías (circuit breaker acumulativo)
 * @param {ReturnType<typeof createProviderCircuitBreaker>|null} options.circuitBreaker
 * @param {string} options.pluginsDir
 */
export async function collectEvidenceViaProviders(
  urls,
  { allowNetwork = false, modeAllowsNetwork = false, networkLimits = {}, policyOptions = {}, profileId = null, evidenceForUnavailableUrl, registry: providedRegistry = null, circuitBreaker: providedBreaker = null, pluginsDir = DEFAULT_PLUGINS_DIR } = {}
) {
  if (typeof evidenceForUnavailableUrl !== "function") {
    throw new Error("collectEvidenceViaProviders requiere evidenceForUnavailableUrl (inyectada desde auditOrchestrator.js)");
  }

  const profile = getProviderSectorProfile(profileId);
  const mergedPolicyOptions = mergePolicyOptionsWithProfile({ ...policyOptions, allowNetwork }, profile);
  const policy = defineProviderExecutionPolicy({ ...mergedPolicyOptions, pipeline: "multiprovider" });

  const registry = providedRegistry ?? createProviderRegistry();
  const pluginLoadErrors = [];
  if (!providedRegistry) {
    const { errors } = await discoverAndRegisterPlugins(registry, pluginsDir);
    pluginLoadErrors.push(...errors);
  }

  applyExecutionPolicyToRegistry(registry, policy);

  // Health gate — Fase 3: un proveedor que se declara no-sano no se intenta.
  const healthResults = await registry.healthCheckAll();
  for (const h of healthResults) {
    if (!h.healthy && registry.isEnabled(h.id)) registry.setEnabled(h.id, false);
  }

  // Circuit breaker — Fase 3: un proveedor ya bloqueado (fallos consecutivos
  // en ejecuciones previas del MISMO breaker) tampoco se intenta.
  const circuitBreaker = providedBreaker ?? createProviderCircuitBreaker();
  for (const p of registry.list()) {
    if (registry.isEnabled(p.id) && circuitBreaker.isBlocked(p.id)) registry.setEnabled(p.id, false);
  }

  const limitations = [...pluginLoadErrors.map((e) => `Plugin de proveedor no cargado ("${e.file}"): ${e.reason}`)];

  if (urls.length === 0) {
    return { evidence: [], provenanceIndex: {}, limitations, networkUsed: false, consultedUrls: [], providerRunSummary: emptyRunSummary({ execution: policy.execution, profileId: profile.id, pluginLoadErrors }) };
  }

  const networkEnabled = policy.allowNetwork && modeAllowsNetwork;
  // Defensa en profundidad idéntica a Paso 13: sin las dos condiciones a la
  // vez, el proveedor real se desactiva ANTES de resolver la cadena — no
  // "se ejecuta y se ignora el resultado".
  if (!networkEnabled && registry.isEnabled(REAL_PROVIDER_ID)) registry.setEnabled(REAL_PROVIDER_ID, false);

  const chain = resolveEligibleProviderChain(registry);

  const runResult = await runProviderPipeline(chain, { urls, limits: networkLimits }, {
    mode: policy.execution,
    globalTimeoutMs: policy.globalTimeoutMs ?? undefined,
    individualTimeoutMs: policy.individualTimeoutMs ?? undefined,
    maxConcurrency: policy.maxConcurrency ?? undefined,
  });

  for (const r of runResult.results) circuitBreaker.recordResult(r.providerId, r.status);

  const providerRunEntries = runResult.results.map((r) => {
    const providerDef = registry.get(r.providerId);
    const justTrippedBreaker = (r.status === "failed" || r.status === "timeout") && circuitBreaker.isBlocked(r.providerId);
    return { providerId: r.providerId, priority: providerDef?.priority ?? null, result: r, blocked: justTrippedBreaker };
  });

  const realProviderResultFromChain = runResult.results.find((r) => r.providerId === REAL_PROVIDER_ID);

  // Paso 16 — "publicWebsiteFetcher recopile → seoProvider analice": paso
  // explícito, SEPARADO de la cadena genérica de arriba (que llama a todo
  // el mundo con el mismo `{urls, limits}` — seoProvider necesita
  // `{pages}`, no urls). Solo se ejecuta si:
  //  (a) seoProvider sigue habilitado tras política/salud/circuit breaker, y
  //  (b) publicWebsiteFetcher produjo páginas reales EN ESTA MISMA ejecución.
  // Sin (b), seoProvider ni se invoca (nada que analizar, nunca inventa).
  const seoProviderDef = registry.get(SEO_PROVIDER_ID);
  const fetchedPages = realProviderResultFromChain?.metadata?.pages ?? [];
  let seoInsights = null;
  if (seoProviderDef && registry.isEnabled(SEO_PROVIDER_ID) && fetchedPages.length > 0) {
    // Reutiliza runProviderPipeline (Paso 14) como mini-pipeline de UN
    // proveedor, en vez de llamar a collect() a pelo: hereda timeout
    // individual/global y el mismo mapeo de errores/cancelación que la
    // cadena principal, sin duplicar esa lógica aquí.
    const seoRunResult = await runProviderPipeline([seoProviderDef], { pages: fetchedPages, profileId: profile.id, sourceProviderId: REAL_PROVIDER_ID }, {
      mode: "fallback",
      individualTimeoutMs: policy.individualTimeoutMs ?? undefined,
      globalTimeoutMs: policy.globalTimeoutMs ?? undefined,
    });
    const seoResult = seoRunResult.results[0];
    circuitBreaker.recordResult(SEO_PROVIDER_ID, seoResult.status);
    const seoEntry = { providerId: SEO_PROVIDER_ID, priority: seoProviderDef.priority, result: seoResult, blocked: false };
    const existingIndex = providerRunEntries.findIndex((e) => e.providerId === SEO_PROVIDER_ID);
    if (existingIndex >= 0) providerRunEntries[existingIndex] = seoEntry;
    else providerRunEntries.push(seoEntry);
    if (seoResult.status === "success") {
      seoInsights = { scoreBreakdown: seoResult.metadata.scoreBreakdown, recommendations: seoResult.metadata.recommendations };
    }
  }

  const { evidence, provenanceIndex, providerSummaries } = aggregateProviderResults(providerRunEntries);

  const realProviderResult = realProviderResultFromChain;
  const realAttempted = Boolean(realProviderResult);
  const realSucceeded = realAttempted && (realProviderResult.status === "success" || realProviderResult.status === "partial");
  const networkUsed = networkEnabled && urls.length > 0 && realAttempted;

  if (realProviderResult) {
    for (const err of realProviderResult.errors ?? []) limitations.push(`URL real no disponible: ${sanitizeErrorMessage(err.message)}`);
  }

  if (!realSucceeded) {
    const reason = !networkEnabled
      ? modeAllowsNetwork && !policy.allowNetwork
        ? "el request pide un modo con red (public-web/hybrid), pero falta --allow-network en esta ejecución: se trata como offline por seguridad."
        : undefined
      : !realAttempted
        ? `pipeline multiproveedor: "${REAL_PROVIDER_ID}" quedó excluido de la cadena para esta ejecución (política/circuit breaker/salud) — ver providerRunSummary.`
        : `pipeline multiproveedor: "${REAL_PROVIDER_ID}" no produjo evidencia disponible en esta ejecución — ver providerRunSummary.`;
    for (const url of urls) evidence.push(evidenceForUnavailableUrl(url, reason));
  }

  const providerRunSummary = {
    pipeline: "multiprovider",
    executionMode: policy.execution,
    profileId: profile.id,
    usedProviderId: runResult.usedProviderId ?? null,
    providers: providerSummaries,
    pluginLoadErrors,
    seo: seoInsights, // Paso 16 — null si seoProvider no se ejecutó o no produjo resultado; ver seoScoring.js/seoRecommendations.js
  };

  return { evidence, provenanceIndex, limitations, networkUsed, consultedUrls: networkUsed ? [...urls] : [], providerRunSummary };
}
