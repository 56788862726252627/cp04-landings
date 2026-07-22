// Paso 14 · Fase 4 — Pipeline configurable de ejecución de proveedores.
// Paso 15 · Fase 3 — añade `maxConcurrency` opcional al modo "parallel"
// (límite de concurrencia real, ver `runWithConcurrencyLimit`); por
// defecto sigue siendo `null` (sin límite, Promise.all — comportamiento
// idéntico a Paso 14, sin cambios de comportamiento por defecto).
//
// Orquesta la llamada a `collect()` de uno o varios ResearchProvider ya
// resueltos (normalmente vía `registry.resolveFallbackChain(dimension)`),
// con modo secuencial o paralelo, fallback automático por prioridad,
// timeout global y por proveedor, y cancelación segura vía AbortSignal.
// No sabe nada de Evidence/Dimensiones concretas: es agnóstico, reutiliza
// el ProviderResult definido en providerTypes.js.

import { defineProviderResult } from "./providerTypes.js";

export const EXECUTION_MODES = Object.freeze(["sequential", "parallel", "fallback"]);

function withTimeout(promise, timeoutMs, onTimeoutSignal) {
  if (!timeoutMs) return promise;
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      onTimeoutSignal?.();
      reject(new Error(`timeout tras ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function runOneProvider(provider, input, { individualTimeoutMs, externalSignal }) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener("abort", onExternalAbort);

  if (externalSignal?.aborted) {
    externalSignal.removeEventListener("abort", onExternalAbort);
    return defineProviderResult({ providerId: provider.id, status: "cancelled", durationMs: 0 });
  }

  try {
    const result = await withTimeout(provider.collect(input, { signal: controller.signal }), individualTimeoutMs, () => controller.abort());
    return { ...result, durationMs: Date.now() - startedAt };
  } catch (err) {
    const status = controller.signal.aborted && !externalSignal?.aborted ? "timeout" : externalSignal?.aborted ? "cancelled" : "failed";
    return defineProviderResult({ providerId: provider.id, status, errors: [{ message: err.message }], durationMs: Date.now() - startedAt });
  } finally {
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }
}

/**
 * Ejecuta `tasks` (funciones que devuelven Promise) con como mucho
 * `limit` en vuelo simultáneamente, preservando el orden de `results`
 * (cada tarea escribe en su propio índice, no en orden de finalización).
 */
async function runWithConcurrencyLimit(tasks, limit) {
  const results = new Array(tasks.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < tasks.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await tasks[currentIndex]();
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Ejecuta una cadena de proveedores (ya ordenada por prioridad, ver
 * ProviderRegistry.resolveFallbackChain) según `mode`.
 * @param {object[]} providers - cadena ya resuelta (orden = prioridad)
 * @param {unknown} input - se pasa tal cual a cada `collect(input, options)`
 * @param {{mode?: string, globalTimeoutMs?: number, individualTimeoutMs?: number, externalSignal?: AbortSignal, maxConcurrency?: number|null}} options
 * @returns {Promise<{mode: string, results: object[], usedProviderId: string|null, cancelled: boolean}>}
 */
export async function runProviderPipeline(providers, input, { mode = "fallback", globalTimeoutMs, individualTimeoutMs, externalSignal, maxConcurrency = null } = {}) {
  if (!EXECUTION_MODES.includes(mode)) throw new Error(`runProviderPipeline: mode desconocido "${mode}" (usa: ${EXECUTION_MODES.join(", ")})`);
  if (maxConcurrency !== null && (!Number.isInteger(maxConcurrency) || maxConcurrency < 1)) {
    throw new Error("runProviderPipeline: maxConcurrency debe ser null o un entero >= 1");
  }

  const globalController = new AbortController();
  const combinedSignal = globalController.signal;
  const onExternalAbort = () => globalController.abort();
  externalSignal?.addEventListener("abort", onExternalAbort);

  const globalTimer = globalTimeoutMs ? setTimeout(() => globalController.abort(), globalTimeoutMs) : null;

  try {
    if (mode === "parallel") {
      const runners = providers.map((p) => () => runOneProvider(p, input, { individualTimeoutMs, externalSignal: combinedSignal }));
      const results = maxConcurrency ? await runWithConcurrencyLimit(runners, maxConcurrency) : await Promise.all(runners.map((run) => run()));
      return { mode, results, usedProviderId: null, cancelled: combinedSignal.aborted };
    }

    // "sequential" y "fallback" comparten el mismo bucle: la diferencia es
    // que "fallback" se detiene en el primer éxito, mientras "sequential"
    // ejecuta todos (útil para recolectar de varios proveedores a la vez,
    // p.ej. cuando varias fuentes cubren la misma dimensión y se quieren
    // todas, no solo la primera que funcione).
    const results = [];
    for (const provider of providers) {
      if (combinedSignal.aborted) {
        results.push(defineProviderResult({ providerId: provider.id, status: "cancelled" }));
        continue;
      }
      const result = await runOneProvider(provider, input, { individualTimeoutMs, externalSignal: combinedSignal });
      results.push(result);
      if (mode === "fallback" && (result.status === "success" || result.status === "partial")) {
        return { mode, results, usedProviderId: provider.id, cancelled: combinedSignal.aborted };
      }
    }
    return { mode, results, usedProviderId: mode === "fallback" ? null : undefined, cancelled: combinedSignal.aborted };
  } finally {
    if (globalTimer) clearTimeout(globalTimer);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }
}
