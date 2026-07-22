// Paso 14 · Fase 3 — Stub preparado para un futuro crawler SEO real.
// Hoy cubierto offline por MOCK_SEO_ADAPTER (Paso 12).
import { defineStubProvider, defineProviderCapabilities } from "../core/providerTypes.js";

export const PROVIDER = defineStubProvider({
  id: "seoProvider",
  label: "SEO técnico y de contenidos",
  capabilities: defineProviderCapabilities({ dimensions: ["seoTechnical", "seoContent", "seoLocal"], categories: ["seo"] }),
  priority: 40,
  limitations: ["Debe respetar robots.txt y límites de profundidad/tamaño cuando se implemente."],
  docsNote: "Ver factory/extensionPoints.js: seoProvider.",
});
