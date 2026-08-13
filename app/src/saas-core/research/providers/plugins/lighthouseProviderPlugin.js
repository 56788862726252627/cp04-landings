// Paso 14 · Fase 3 — Stub preparado para un futuro proveedor Lighthouse/PageSpeed real.
// Hoy la dimensión "performance" ya se cubre offline con MOCK_PERFORMANCE_ADAPTER
// (Paso 12, sourceAdapters.js) — este stub es el candidato a proveedor REAL futuro,
// mismo patrón que publicWebsiteFetcherPlugin.js cuando se implemente.
import { defineStubProvider, defineProviderCapabilities } from "../core/providerTypes.js";

export const PROVIDER = defineStubProvider({
  id: "lighthouseProvider",
  label: "Lighthouse / PageSpeed Insights",
  capabilities: defineProviderCapabilities({ dimensions: ["performance"], categories: ["technicalQuality"] }),
  priority: 40,
  credentialsNeeded: ["PAGESPEED_API_KEY"],
  docsNote: "Ver factory/extensionPoints.js: lighthouseProvider (Paso 10/12) para el contrato original.",
});
