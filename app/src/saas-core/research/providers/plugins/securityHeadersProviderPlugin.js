// Paso 14 · Fase 3 — Stub preparado para un futuro analizador real de
// cabeceras de seguridad HTTP (CSP, HSTS, X-Frame-Options, etc.).
// Distinto de la detección de contenido mixto ya hecha en local_html.
import { defineStubProvider, defineProviderCapabilities } from "../core/providerTypes.js";

export const PROVIDER = defineStubProvider({
  id: "securityHeadersProvider",
  label: "Cabeceras de seguridad HTTP observables",
  capabilities: defineProviderCapabilities({ dimensions: ["observableSecurity"], categories: ["observableSecurity", "technicalQuality"] }),
  priority: 40,
  docsNote: "Analizaría CSP/HSTS/X-Frame-Options/Referrer-Policy sobre una respuesta HTTP real (reutilizaría publicWebsiteFetcher para obtenerla).",
});
