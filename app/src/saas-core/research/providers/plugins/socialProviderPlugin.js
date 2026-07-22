// Paso 14 · Fase 3 — Stub preparado para un futuro proveedor de perfiles
// sociales públicos real. Hoy cubierto offline por MOCK_SOCIAL_PRESENCE_ADAPTER.
import { defineStubProvider, defineProviderCapabilities } from "../core/providerTypes.js";

export const PROVIDER = defineStubProvider({
  id: "socialProvider",
  label: "Perfiles sociales públicos",
  capabilities: defineProviderCapabilities({ dimensions: ["socialMediaPresence", "publicReputation"], categories: ["reputation", "localPresence"] }),
  priority: 40,
  credentialsNeeded: ["SOCIAL_PROVIDER_API_KEY"],
  limitations: ["Solo páginas/perfiles de negocio públicos, nunca perfiles individuales, cuando se implemente."],
  docsNote: "Ver factory/extensionPoints.js: socialProfileProvider.",
});
