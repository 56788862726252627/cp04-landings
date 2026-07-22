// Paso 14 · Fase 3 — Stub preparado para un futuro proveedor de rendimiento
// alternativo (p.ej. WebPageTest), independiente de lighthouseProvider —
// varios proveedores pueden cubrir "performance" a la vez (fallback chain).
import { defineStubProvider, defineProviderCapabilities } from "../core/providerTypes.js";

export const PROVIDER = defineStubProvider({
  id: "performanceProvider",
  label: "Rendimiento web (proveedor alternativo)",
  capabilities: defineProviderCapabilities({ dimensions: ["performance"], categories: ["technicalQuality"] }),
  priority: 45,
  docsNote: "Candidato a proveedor real alternativo/redundante de lighthouseProvider para tolerancia a fallos.",
});
