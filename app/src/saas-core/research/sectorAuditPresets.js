// Paso 12 · Fase 10 — Presets sectoriales para auditoría.
//
// Reutiliza los 10 sectores YA definidos en Paso 11
// (nl-builder/sectorLexicon.js: SECTOR_PRESET_IDS) — no inventa una nueva
// taxonomía de sectores. Cada preset aquí SOLO añade configuración de
// auditoría (pesos, dimensiones prioritarias, exclusiones, notas
// prudentes): nunca lógica de negocio de un sector dentro del motor
// genérico (scoringEngine.js/dimensionRegistry.js siguen siendo 100%
// agnósticos de sector).

import { SECTOR_PRESET_IDS } from "../nl-builder/sectorLexicon.js";

const REGULATED_SECTORS = Object.freeze(["dental", "physiotherapy", "veterinary", "law"]);

function buildPreset({ presetId, priorityDimensions, categoryWeights = {}, mustNotAutoInfer = [], risksToWatch = [], opportunitiesTemplate = [] }) {
  const regulated = REGULATED_SECTORS.includes(presetId);
  return Object.freeze({
    presetId,
    priorityDimensions: Object.freeze(priorityDimensions),
    dimensionWeights: Object.freeze(Object.fromEntries(priorityDimensions.map((id) => [id, 1.5]))),
    categoryWeights: Object.freeze(categoryWeights),
    mustNotAutoInfer: Object.freeze([...mustNotAutoInfer, ...(regulated ? ["diagnóstico médico/legal/veterinario definitivo", "recomendación de tratamiento o estrategia jurídica concreta"] : [])]),
    risksToWatch: Object.freeze(risksToWatch),
    opportunitiesTemplate: Object.freeze(opportunitiesTemplate),
    prudentNote: regulated ? "Este sector está regulado: toda recomendación debe presentarse como sujeta a revisión profesional/colegial, nunca como asesoramiento definitivo." : null,
  });
}

export const SECTOR_AUDIT_PRESETS = Object.freeze({
  "padel-sports": buildPreset({
    presetId: "padel-sports",
    priorityDimensions: ["bookingCapability", "mobileExperience", "conversion", "socialMediaPresence"],
    categoryWeights: { conversion: 1.4, digitalMaturity: 1.2 },
    risksToWatch: ["reserva de pista sin confirmación automática", "falta de disponibilidad en tiempo real visible"],
    opportunitiesTemplate: ["automatizar confirmación/recordatorio de reserva de pista", "mostrar disponibilidad de pistas en la web"],
  }),
  dental: buildPreset({
    presetId: "dental",
    priorityDimensions: ["trustSignals", "visibleCompliance", "bookingCapability", "publicReputation"],
    categoryWeights: { trust: 1.5, reputation: 1.3 },
    mustNotAutoInfer: ["idoneidad de un tratamiento dental concreto"],
    risksToWatch: ["ausencia de información de colegiación/seguro de responsabilidad civil visible"],
    opportunitiesTemplate: ["reserva de primera cita online", "recordatorios de revisión periódica"],
  }),
  physiotherapy: buildPreset({
    presetId: "physiotherapy",
    priorityDimensions: ["publicReputation", "bookingCapability", "conversion", "trustSignals"],
    categoryWeights: { reputation: 1.3, conversion: 1.2 },
    mustNotAutoInfer: ["idoneidad de un tratamiento fisioterapéutico concreto"],
    risksToWatch: ["buena reputación pero fricción alta en el proceso de reserva"],
    opportunitiesTemplate: ["simplificar el flujo de reserva", "explotar reseñas positivas existentes en la landing"],
  }),
  veterinary: buildPreset({
    presetId: "veterinary",
    priorityDimensions: ["trustSignals", "bookingCapability", "contactInfo", "publicReputation"],
    categoryWeights: { trust: 1.3 },
    mustNotAutoInfer: ["diagnóstico veterinario concreto"],
    risksToWatch: ["falta de vía de contacto para urgencias visible"],
    opportunitiesTemplate: ["recordatorios de vacunación/revisión", "reserva online de citas"],
  }),
  "hair-beauty": buildPreset({
    presetId: "hair-beauty",
    priorityDimensions: ["branding", "visualConsistency", "bookingCapability", "socialMediaPresence"],
    categoryWeights: { branding: 1.5 },
    risksToWatch: ["branding inconsistente entre canales (colores/tono distintos)"],
    opportunitiesTemplate: ["reserva online de citas", "galería visual coherente con la marca"],
  }),
  law: buildPreset({
    presetId: "law",
    priorityDimensions: ["serviceClarity", "trustSignals", "visibleCompliance", "contactInfo"],
    categoryWeights: { trust: 1.5, content: 1.2 },
    mustNotAutoInfer: ["estrategia jurídica concreta", "probabilidad de éxito de un caso"],
    risksToWatch: ["servicios descritos de forma ambigua o genérica"],
    opportunitiesTemplate: ["página por área de práctica con propuesta de valor específica", "formulario de consulta inicial con seguimiento comercial"],
  }),
  restaurant: buildPreset({
    presetId: "restaurant",
    priorityDimensions: ["bookingCapability", "mobileExperience", "seoLocal", "socialMediaPresence"],
    categoryWeights: { conversion: 1.3, localPresence: 1.3 },
    risksToWatch: ["sin reserva de mesa online", "menú no accesible desde móvil"],
    opportunitiesTemplate: ["reserva de mesa online", "publicar menú actualizado y accesible"],
  }),
  education: buildPreset({
    presetId: "education",
    priorityDimensions: ["serviceClarity", "leadCapture", "conversion", "contentQuality"],
    categoryWeights: { conversion: 1.2, content: 1.2 },
    risksToWatch: ["propuesta de valor poco diferenciada frente a otras academias"],
    opportunitiesTemplate: ["formulario de solicitud de información con seguimiento automático", "contenido de muestra (clase gratuita, testimonios)"],
  }),
  automotive: buildPreset({
    presetId: "automotive",
    priorityDimensions: ["trustSignals", "contactInfo", "seoLocal", "directoryPresence"],
    categoryWeights: { localPresence: 1.3, trust: 1.2 },
    risksToWatch: ["falta de presencia en directorios locales relevantes"],
    opportunitiesTemplate: ["cita previa online para revisión/reparación", "presencia reforzada en directorios y mapas"],
  }),
  "real-estate": buildPreset({
    presetId: "real-estate",
    priorityDimensions: ["contentQuality", "seoLocal", "leadCapture", "trustSignals"],
    categoryWeights: { content: 1.3, localPresence: 1.2 },
    mustNotAutoInfer: ["valoración de una propiedad concreta"],
    risksToWatch: ["fichas de propiedad con contenido insuficiente"],
    opportunitiesTemplate: ["formulario de contacto por propiedad con seguimiento automático", "contenido enriquecido por zona"],
  }),
});

export const GENERIC_AUDIT_PRESET = Object.freeze(
  buildPreset({
    presetId: "generic-local-service",
    priorityDimensions: ["trustSignals", "mobileExperience", "contactInfo", "conversion"],
  })
);

export function getSectorAuditPreset(presetId) {
  return SECTOR_AUDIT_PRESETS[presetId] ?? (presetId === "generic-local-service" ? GENERIC_AUDIT_PRESET : null);
}

/**
 * Paso 15 · Fase 6 — Fusiona un preset base con overrides (p. ej. de un
 * ProviderSectorProfile de `providers/providerSectorProfiles.js`), sin
 * mutar ninguno de los dos. Los pesos del override GANAN sobre los del
 * preset base; el resto de campos (mustNotAutoInfer, prudentNote,
 * risksToWatch, opportunitiesTemplate) se acumulan, nunca se pierden.
 * Sigue sin codificar lógica de sector aquí — solo combina datos.
 * @param {object} basePreset
 * @param {{dimensionWeights?: object, categoryWeights?: object, priorityDimensions?: string[], mustNotAutoInfer?: string[]}} overrides
 */
export function mergeAuditPreset(basePreset, overrides = {}) {
  return Object.freeze({
    ...basePreset,
    priorityDimensions: Object.freeze([...new Set([...basePreset.priorityDimensions, ...(overrides.priorityDimensions ?? [])])]),
    dimensionWeights: Object.freeze({ ...basePreset.dimensionWeights, ...(overrides.dimensionWeights ?? {}) }),
    categoryWeights: Object.freeze({ ...basePreset.categoryWeights, ...(overrides.categoryWeights ?? {}) }),
    mustNotAutoInfer: Object.freeze([...new Set([...basePreset.mustNotAutoInfer, ...(overrides.mustNotAutoInfer ?? [])])]),
  });
}

/** Verifica 1:1 con los sectores conocidos de Paso 11 (sin inventar nuevos sectores). */
export const AUDIT_SECTOR_IDS = Object.freeze([...SECTOR_PRESET_IDS]);
