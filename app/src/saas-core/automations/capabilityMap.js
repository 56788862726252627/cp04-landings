// Paso 09 · Fase 11 — Capa de capacidades de automatización reutilizable.
//
// La matriz de 50 flujos de Club Pádel 04 (src/data/makeInventory.js) se
// importa SOLO para verificar que sigue intacta (ver capabilityMap.test.mjs)
// — este módulo nunca la modifica ni la copia. Las plantillas sectoriales
// (Fase 4) recomiendan CAPACIDADES genéricas por finalidad de negocio, no
// escenarios de Make concretos: convertir una capacidad en un escenario
// real de Make/Airtable/Stripe/WhatsApp es trabajo de implementación
// posterior, fuera de alcance de este paso.

export const GENERIC_AUTOMATION_CAPABILITIES = Object.freeze([
  "alta_cliente",
  "baja_cliente",
  "confirmacion",
  "cancelacion",
  "recordatorio",
  "seguimiento",
  "pago",
  "impago",
  "encuesta",
  "recuperacion",
  "campana",
  "documento",
  "alerta",
  "backup",
  "auditoria",
  "soporte",
  "fidelizacion",
]);

// Qué proveedor de la capa de adaptadores (Fase 8) implementa típicamente
// cada capacidad. Es una recomendación, no una conexión real.
export const CAPABILITY_PROVIDER_HINT = Object.freeze({
  alta_cliente: "dataRepository",
  baja_cliente: "dataRepository",
  confirmacion: "messaging",
  cancelacion: "messaging",
  recordatorio: "messaging",
  seguimiento: "automation",
  pago: "payments",
  impago: "payments",
  encuesta: "messaging",
  recuperacion: "messaging",
  campana: "email",
  documento: "fileStorage",
  alerta: "messaging",
  backup: "fileStorage",
  auditoria: "dataRepository",
  soporte: "messaging",
  fidelizacion: "email",
});

function isKnownCapability(capability) {
  return GENERIC_AUTOMATION_CAPABILITIES.includes(capability);
}

/**
 * Valida (sin lanzar) una lista de capacidades recomendadas por una
 * plantilla. Devuelve las que NO pertenecen al catálogo genérico.
 */
export function findUnknownCapabilities(capabilities) {
  return (capabilities || []).filter((c) => !isKnownCapability(c));
}

/**
 * Ninguna capacidad se marca como "conectada": esto es solo una
 * recomendación de diseño. El estado real de conexión vive en
 * `tenant.integrations[provider].status` (Fase 3/8), nunca aquí.
 */
export function describeCapability(capability) {
  if (!isKnownCapability(capability)) return null;
  return {
    id: capability,
    recommendedProvider: CAPABILITY_PROVIDER_HINT[capability] || null,
    connected: false,
  };
}
