// Paso 14 · Fase 3 — Stub preparado para un futuro proveedor de velocidad
// de red "de campo" (Core Web Vitals reales de usuarios, tipo CrUX),
// distinto de las mediciones "de laboratorio" de lighthouseProvider.
import { defineStubProvider, defineProviderCapabilities } from "../core/providerTypes.js";

export const PROVIDER = defineStubProvider({
  id: "speedProvider",
  label: "Velocidad de campo (Core Web Vitals reales, tipo CrUX)",
  capabilities: defineProviderCapabilities({ dimensions: ["performance"], categories: ["technicalQuality"] }),
  priority: 46,
  credentialsNeeded: ["CRUX_API_KEY"],
  docsNote: "Datos de campo (usuarios reales) complementan, no sustituyen, las métricas de laboratorio de lighthouseProvider.",
});
