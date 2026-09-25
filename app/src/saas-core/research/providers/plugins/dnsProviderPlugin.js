// Paso 14 · Fase 3 — Stub preparado para un futuro proveedor de registros
// DNS reales (MX, SPF, DMARC, CAA) como señal de madurez/seguridad.
import { defineStubProvider, defineProviderCapabilities } from "../core/providerTypes.js";

export const PROVIDER = defineStubProvider({
  id: "dnsProvider",
  label: "Registros DNS públicos (MX, SPF, DMARC, CAA)",
  capabilities: defineProviderCapabilities({ dimensions: ["observableSecurity", "digitalMaturitySignal"], categories: ["observableSecurity", "digitalMaturity"] }),
  priority: 45,
  limitations: ["Solo lectura de registros DNS públicos, nunca modificación, cuando se implemente."],
  docsNote: "Reutilizaría la misma protección SSRF/DNS de urlSafety.js para cualquier resolución.",
});
