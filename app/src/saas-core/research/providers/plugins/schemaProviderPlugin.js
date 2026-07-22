// Paso 14 · Fase 3 — Stub preparado para un futuro validador de datos
// estructurados (schema.org/JSON-LD) real, más profundo que la detección
// binaria de JSON-LD ya hecha por local_html (Paso 12, htmlSignals.js).
import { defineStubProvider, defineProviderCapabilities } from "../core/providerTypes.js";

export const PROVIDER = defineStubProvider({
  id: "schemaProvider",
  label: "Datos estructurados (schema.org / JSON-LD)",
  capabilities: defineProviderCapabilities({ dimensions: ["seoTechnical", "publicDataConsistency"], categories: ["seo"] }),
  priority: 45,
  docsNote: "Validaría tipos schema.org concretos (LocalBusiness, Product, FAQPage...), no solo presencia/ausencia de JSON-LD.",
});
