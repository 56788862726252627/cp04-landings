// Paso 14 · Fase 3 — Stub preparado para un futuro proveedor de accesibilidad
// real (p.ej. axe-core headless). Hoy cubierto offline por MOCK_ACCESSIBILITY_ADAPTER.
import { defineStubProvider, defineProviderCapabilities } from "../core/providerTypes.js";

export const PROVIDER = defineStubProvider({
  id: "accessibilityProvider",
  label: "Accesibilidad (axe-core u otro)",
  capabilities: defineProviderCapabilities({ dimensions: ["accessibility"], categories: ["accessibility"] }),
  priority: 40,
  limitations: ["Requiere un entorno con navegador headless disponible cuando se implemente."],
  docsNote: "Ver factory/extensionPoints.js: accessibilityProvider.",
});
