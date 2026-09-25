// Paso 14 · Fase 3 — Stub preparado para un futuro analizador de contenido
// asistido por IA (compatible con OpenAI/Perplexity/modelo local, ver
// factory/extensionPoints.js). Nunca sustituye la clasificación
// confirmed/inferred/unknown determinista de Paso 12 — su salida, cuando
// se implemente, deberá validarse estrictamente con fallback automático
// (mismo patrón que aiProviderContract.js de Paso 11).
import { defineStubProvider, defineProviderCapabilities } from "../core/providerTypes.js";

export const PROVIDER = defineStubProvider({
  id: "aiContentProvider",
  label: "Análisis de contenido asistido por IA",
  capabilities: defineProviderCapabilities({ dimensions: ["contentQuality", "valueProposition", "serviceClarity"], categories: ["content"] }),
  priority: 60, // menor precedencia: es el proveedor menos determinista de todos
  credentialsNeeded: ["AI_PROVIDER_API_KEY"],
  limitations: [
    "Nunca debe presentarse como más fiable que la evidencia estructural determinista.",
    "Su salida deberá validarse estrictamente y hacer fallback automático ante timeout/error/JSON inválido, cuando se implemente.",
  ],
  docsNote: "Ver factory/extensionPoints.js: openAiCompatibleResearchProvider / perplexityCompatibleProvider / localModelResearchProvider.",
});
