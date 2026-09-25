// Paso 14 · Fase 3 — Stub preparado para un futuro detector de tecnologías
// real (tipo Wappalyzer). Hoy cubierto offline por MOCK_TECHNOLOGY_DETECTOR_ADAPTER.
import { defineStubProvider, defineProviderCapabilities } from "../core/providerTypes.js";

export const PROVIDER = defineStubProvider({
  id: "technologyProvider",
  label: "Detección de tecnologías (tipo Wappalyzer)",
  capabilities: defineProviderCapabilities({ dimensions: ["observableIntegrations", "digitalMaturitySignal", "observableAutomation"], categories: ["digitalMaturity"] }),
  priority: 45,
  limitations: ["Solo detección pasiva de cabeceras/HTML público, sin intentos activos de explotación, cuando se implemente."],
  docsNote: "Ver factory/extensionPoints.js: technologyFingerprintProvider.",
});
