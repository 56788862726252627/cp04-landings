// Paso 14 · Fase 1/3 — Plugin (abstracción) del proveedor real de Paso 13.
//
// NO modifica `publicWebsiteFetcher.js`: solo lo envuelve para que
// encaje en la interfaz unificada `ResearchProvider` del registro
// multiproveedor. Sigue siendo el ÚNICO proveedor "real" (status="real");
// requiere `allowNetwork:true` exactamente igual que en Paso 13 — este
// wrapper no cambia esa regla de seguridad, solo la forma del contrato.

import { defineResearchProvider, defineProviderCapabilities, defineProviderResult, defineProviderHealth } from "../core/providerTypes.js";
import { PUBLIC_WEBSITE_FETCHER_PROVIDER, DEFAULT_FETCHER_LIMITS } from "../publicWebsiteFetcher.js";

export const PROVIDER = defineResearchProvider({
  id: PUBLIC_WEBSITE_FETCHER_PROVIDER.id,
  version: PUBLIC_WEBSITE_FETCHER_PROVIDER.version,
  status: "real",
  priority: 10, // mayor precedencia que los stubs (prioridad por defecto 50)
  capabilities: defineProviderCapabilities({ dimensions: ["*"] }),
  limitations: ["Requiere allowNetwork:true en tiempo de ejecución (auditOrchestrator.js); nunca se invoca por defecto."],
  async collect(input = {}) {
    const startedAt = Date.now();
    const urls = Array.isArray(input) ? input : input.urls ?? [];
    if (urls.length === 0) return defineProviderResult({ providerId: PUBLIC_WEBSITE_FETCHER_PROVIDER.id, status: "skipped", durationMs: 0, metadata: { reason: "sin URLs declaradas" } });

    const limits = input.limits ?? DEFAULT_FETCHER_LIMITS;
    const { evidence, pageResults, consultedUrls } = await PUBLIC_WEBSITE_FETCHER_PROVIDER.collect(urls, limits);
    const anyAvailable = pageResults.some((r) => r.status === "available");
    const allAvailable = pageResults.every((r) => r.status === "available");
    // Paso 16 — "documento web normalizado" para analizadores posteriores
    // en la MISMA ejecución del puente (p. ej. seoProvider): un
    // subconjunto saneado de las páginas YA descargadas, nunca una
    // segunda descarga. Nunca incluye cookies/cabeceras de autenticación
    // (performPinnedRequest tampoco las envía ni las recibe de vuelta).
    const pages = pageResults
      .filter((r) => r.status === "available")
      .map((r) => ({ url: r.url, httpStatus: r.httpStatus, contentType: r.contentType, body: r.body, headers: r.headers, robotsTxt: r.robotsTxt, redirectChain: r.redirectChain, byteSize: r.byteSize, httpVersion: r.httpVersion, timing: r.timing }));
    return defineProviderResult({
      providerId: PUBLIC_WEBSITE_FETCHER_PROVIDER.id,
      status: allAvailable ? "success" : anyAvailable ? "partial" : "failed",
      evidence,
      errors: pageResults.filter((r) => r.status !== "available").map((r) => ({ message: `${r.url}: ${r.errorCode} — ${r.reason}` })),
      durationMs: Date.now() - startedAt,
      metadata: { consultedUrls, pages },
    });
  },
  async healthCheck() {
    const health = await PUBLIC_WEBSITE_FETCHER_PROVIDER.healthCheck();
    return defineProviderHealth({ healthy: health.healthy, mode: health.mode, message: health.message });
  },
});
