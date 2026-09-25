// Paso 14 · Fase 3 — Stub preparado para un futuro proveedor WHOIS real
// (antigüedad de dominio como señal de confianza).
import { defineStubProvider, defineProviderCapabilities } from "../core/providerTypes.js";

export const PROVIDER = defineStubProvider({
  id: "whoisProvider",
  label: "Antigüedad y registro de dominio (WHOIS)",
  capabilities: defineProviderCapabilities({ dimensions: ["trustSignals", "publicDataConsistency"], categories: ["trust"] }),
  priority: 48,
  limitations: ["Solo datos WHOIS públicos, respetando límites de tasa del registrador, cuando se implemente."],
  docsNote: "La antigüedad de un dominio es una señal débil de confianza, nunca concluyente por sí sola.",
});
