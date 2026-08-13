// Paso 15 · Fase 6 — Perfiles multisector para el sistema multiproveedor.
//
// Puro dato de configuración, aparte del núcleo: `providerRegistry.js` y
// `providerPipeline.js` NO conocen ningún sector. Un perfil solo dice, para
// un sector dado, qué proveedores ya existentes tienen sentido, en qué
// orden, con qué exclusiones/consentimiento, y qué pesos de puntuación
// aplicar (reutilizando el mismo mecanismo de `sectorAuditPresets.js` de
// Paso 12 vía `auditPresetId`, sin duplicar su lógica).
//
// Los 10 perfiles mínimos pedidos en el enunciado del Paso 15 se mapean,
// donde existe un preset de auditoría equivalente de Paso 12
// (`sectorAuditPresets.js`, 10 sectores de Paso 11), a ese preset; "hotel"
// no tiene equivalente 1:1 y usa el preset genérico como base.

import { getSectorAuditPreset, GENERIC_AUDIT_PRESET, mergeAuditPreset } from "../sectorAuditPresets.js";

const PROVIDER_IDS = Object.freeze([
  "publicWebsiteFetcher",
  "lighthouseProvider",
  "performanceProvider",
  "speedProvider",
  "seoProvider",
  "schemaProvider",
  "accessibilityProvider",
  "socialProvider",
  "technologyProvider",
  "securityHeadersProvider",
  "dnsProvider",
  "whoisProvider",
  "aiContentProvider",
]);

function buildProfile({
  id,
  label,
  auditPresetId = null,
  recommendedProviders,
  relevantDimensions,
  dimensionWeights = {},
  categoryWeights = {},
  rules = [],
  warnings = [],
  recommendations = [],
  optionalFields = [],
  consentRequired = false,
  consentNote = null,
  exclusions = [],
}) {
  for (const id of recommendedProviders) {
    if (!PROVIDER_IDS.includes(id)) throw new Error(`ProviderSectorProfile "${id}": recomienda un proveedor desconocido "${id}"`);
  }
  for (const id of exclusions) {
    if (!PROVIDER_IDS.includes(id)) throw new Error(`ProviderSectorProfile: excluye un proveedor desconocido "${id}"`);
  }
  const overlap = recommendedProviders.filter((p) => exclusions.includes(p));
  if (overlap.length > 0) throw new Error(`ProviderSectorProfile "${id}": ${overlap.join(", ")} está a la vez recomendado y excluido`);

  return Object.freeze({
    id,
    label,
    auditPresetId,
    recommendedProviders: Object.freeze([...recommendedProviders]),
    // prioridad implícita por posición en la lista, explícita y reutilizable por ProviderExecutionPolicy.providerPriorityOverrides
    providerPriorities: Object.freeze(Object.fromEntries(recommendedProviders.map((pid, i) => [pid, 10 + i * 5]))),
    relevantDimensions: Object.freeze([...relevantDimensions]),
    dimensionWeights: Object.freeze({ ...dimensionWeights }),
    categoryWeights: Object.freeze({ ...categoryWeights }),
    rules: Object.freeze([...rules]),
    warnings: Object.freeze([...warnings]),
    recommendations: Object.freeze([...recommendations]),
    optionalFields: Object.freeze([...optionalFields]),
    consentRequired: Boolean(consentRequired),
    consentNote,
    exclusions: Object.freeze([...exclusions]),
  });
}

export const PROVIDER_SECTOR_PROFILES = Object.freeze({
  "club-deportivo": buildProfile({
    id: "club-deportivo",
    label: "Club deportivo (pádel, tenis, pádel-fitness)",
    auditPresetId: "padel-sports",
    recommendedProviders: ["publicWebsiteFetcher", "seoProvider", "socialProvider", "performanceProvider", "accessibilityProvider"],
    relevantDimensions: ["bookingCapability", "mobileExperience", "conversion", "socialMediaPresence"],
    categoryWeights: { conversion: 1.4, digitalMaturity: 1.2 },
    rules: ["La reserva de pista online se trata como señal prioritaria de conversión."],
    warnings: ["Sin disponibilidad de pistas visible en la web, la reputación social no compensa la fricción de reserva."],
    recommendations: ["Automatizar confirmación/recordatorio de reserva de pista.", "Mostrar disponibilidad de pistas en tiempo real."],
    optionalFields: ["numero_pistas", "deportes_ofrecidos"],
    consentRequired: true,
    consentNote: "socialProvider requiere SOCIAL_PROVIDER_API_KEY: no se activa sin consentimiento explícito del negocio auditado.",
  }),
  clinica: buildProfile({
    id: "clinica",
    label: "Clínica (fisioterapia y asimilables no odontológicos/veterinarios)",
    auditPresetId: "physiotherapy",
    recommendedProviders: ["publicWebsiteFetcher", "whoisProvider", "securityHeadersProvider", "socialProvider", "seoProvider"],
    relevantDimensions: ["publicReputation", "bookingCapability", "conversion", "trustSignals"],
    categoryWeights: { reputation: 1.3, conversion: 1.2 },
    rules: ["Sector regulado: ninguna recomendación se presenta como diagnóstico o idoneidad de tratamiento."],
    warnings: ["Buena reputación con fricción alta en el proceso de reserva es un patrón de riesgo conocido en este sector."],
    recommendations: ["Simplificar el flujo de reserva.", "Explotar reseñas positivas existentes en la landing."],
    optionalFields: ["numero_colegiado", "seguro_responsabilidad_civil"],
    consentRequired: true,
    consentNote: "Datos de salud adyacentes: cualquier evidencia pública debe evitar inferir información clínica de pacientes.",
    exclusions: ["aiContentProvider"],
  }),
  dentista: buildProfile({
    id: "dentista",
    label: "Clínica dental",
    auditPresetId: "dental",
    recommendedProviders: ["publicWebsiteFetcher", "whoisProvider", "securityHeadersProvider", "socialProvider", "seoProvider"],
    relevantDimensions: ["trustSignals", "visibleCompliance", "bookingCapability", "publicReputation"],
    categoryWeights: { trust: 1.5, reputation: 1.3 },
    rules: ["Sector regulado: ninguna recomendación se presenta como idoneidad de un tratamiento dental concreto."],
    warnings: ["Ausencia de información de colegiación/seguro de responsabilidad civil visible es un riesgo de confianza, no solo de SEO."],
    recommendations: ["Reserva de primera cita online.", "Recordatorios de revisión periódica."],
    optionalFields: ["numero_colegiado", "seguro_responsabilidad_civil"],
    consentRequired: true,
    consentNote: "Sector sanitario regulado: requiere consentimiento explícito del negocio antes de cualquier auditoría pública.",
    exclusions: ["aiContentProvider"],
  }),
  veterinario: buildProfile({
    id: "veterinario",
    label: "Clínica veterinaria",
    auditPresetId: "veterinary",
    recommendedProviders: ["publicWebsiteFetcher", "whoisProvider", "socialProvider", "seoProvider"],
    relevantDimensions: ["trustSignals", "bookingCapability", "contactInfo", "publicReputation"],
    categoryWeights: { trust: 1.3 },
    rules: ["Sector regulado: ninguna recomendación se presenta como diagnóstico veterinario concreto."],
    warnings: ["Falta de vía de contacto para urgencias visible es un riesgo específico de este sector."],
    recommendations: ["Recordatorios de vacunación/revisión.", "Reserva online de citas."],
    optionalFields: ["licencia_sanitaria", "especies_atendidas"],
    consentRequired: true,
    consentNote: "Sector sanitario regulado: requiere consentimiento explícito del negocio antes de cualquier auditoría pública.",
    exclusions: ["aiContentProvider"],
  }),
  abogado: buildProfile({
    id: "abogado",
    label: "Despacho de abogados",
    auditPresetId: "law",
    recommendedProviders: ["publicWebsiteFetcher", "securityHeadersProvider", "whoisProvider", "schemaProvider", "seoProvider"],
    relevantDimensions: ["serviceClarity", "trustSignals", "visibleCompliance", "contactInfo"],
    categoryWeights: { trust: 1.5, content: 1.2 },
    rules: ["Sector regulado: ninguna recomendación se presenta como estrategia jurídica o probabilidad de éxito de un caso."],
    warnings: ["Servicios descritos de forma ambigua o genérica reducen la conversión más que la falta de SEO."],
    recommendations: ["Página por área de práctica con propuesta de valor específica.", "Formulario de consulta inicial con seguimiento comercial."],
    optionalFields: ["numero_colegiado", "areas_practica"],
    consentRequired: true,
    consentNote: "Sector regulado (deontología profesional): requiere consentimiento explícito antes de cualquier auditoría pública.",
    exclusions: ["aiContentProvider", "socialProvider"],
  }),
  restaurante: buildProfile({
    id: "restaurante",
    label: "Restaurante",
    auditPresetId: "restaurant",
    recommendedProviders: ["publicWebsiteFetcher", "seoProvider", "socialProvider", "performanceProvider", "schemaProvider"],
    relevantDimensions: ["bookingCapability", "mobileExperience", "seoLocal", "socialMediaPresence"],
    categoryWeights: { conversion: 1.3, localPresence: 1.3 },
    rules: ["schemaProvider prioriza datos estructurados de menú/horario cuando exista implementación real."],
    warnings: ["Sin reserva de mesa online ni menú accesible desde móvil, el resto de señales positivas pierden peso comercial."],
    recommendations: ["Reserva de mesa online.", "Publicar menú actualizado y accesible desde móvil."],
    optionalFields: ["menu_url", "aforo"],
    consentRequired: true,
    consentNote: "socialProvider requiere SOCIAL_PROVIDER_API_KEY: no se activa sin consentimiento explícito del negocio auditado.",
  }),
  hotel: buildProfile({
    id: "hotel",
    label: "Hotel / alojamiento",
    auditPresetId: null, // sin preset 1:1 en sectorAuditPresets.js; usa GENERIC_AUDIT_PRESET como base
    recommendedProviders: ["publicWebsiteFetcher", "seoProvider", "performanceProvider", "socialProvider", "schemaProvider"],
    relevantDimensions: ["bookingCapability", "mobileExperience", "seoLocal", "socialMediaPresence"],
    dimensionWeights: { bookingCapability: 1.5, mobileExperience: 1.3 },
    categoryWeights: { conversion: 1.3, localPresence: 1.2 },
    rules: ["Motor de reservas propio o integración con OTA se trata como señal de conversión de máxima prioridad."],
    warnings: ["Depender solo de OTAs externas (sin reserva directa) es un riesgo de margen comercial, no solo técnico."],
    recommendations: ["Motor de reservas directo con disponibilidad en tiempo real.", "Galería visual y reseñas destacadas en la portada."],
    optionalFields: ["estrellas", "numero_habitaciones"],
    consentRequired: true,
    consentNote: "socialProvider requiere SOCIAL_PROVIDER_API_KEY: no se activa sin consentimiento explícito del negocio auditado.",
  }),
  inmobiliaria: buildProfile({
    id: "inmobiliaria",
    label: "Inmobiliaria",
    auditPresetId: "real-estate",
    recommendedProviders: ["publicWebsiteFetcher", "seoProvider", "schemaProvider", "technologyProvider", "socialProvider"],
    relevantDimensions: ["contentQuality", "seoLocal", "leadCapture", "trustSignals"],
    categoryWeights: { content: 1.3, localPresence: 1.2 },
    rules: ["Ninguna recomendación incluye valoración de una propiedad concreta."],
    warnings: ["Fichas de propiedad con contenido insuficiente reducen la conversión de leads más que el posicionamiento SEO."],
    recommendations: ["Formulario de contacto por propiedad con seguimiento automático.", "Contenido enriquecido por zona."],
    optionalFields: ["numero_registro_agente", "zonas_cobertura"],
    consentRequired: true,
    consentNote: "socialProvider requiere SOCIAL_PROVIDER_API_KEY: no se activa sin consentimiento explícito del negocio auditado.",
  }),
  peluqueria: buildProfile({
    id: "peluqueria",
    label: "Peluquería / barbería",
    auditPresetId: "hair-beauty",
    recommendedProviders: ["publicWebsiteFetcher", "socialProvider", "aiContentProvider", "accessibilityProvider"],
    relevantDimensions: ["branding", "visualConsistency", "bookingCapability", "socialMediaPresence"],
    categoryWeights: { branding: 1.5 },
    rules: ["Branding inconsistente entre canales (colores/tono distintos) se trata como riesgo de primer orden."],
    warnings: ["La reserva online sin coherencia visual con las redes sociales reduce la conversión percibida."],
    recommendations: ["Reserva online de citas.", "Galería visual coherente con la marca en todos los canales."],
    optionalFields: ["servicios_ofrecidos"],
    consentRequired: true,
    consentNote: "socialProvider (redes) y aiContentProvider (análisis de contenido) requieren consentimiento explícito del negocio.",
  }),
  "centro-estetica": buildProfile({
    id: "centro-estetica",
    label: "Centro de estética",
    auditPresetId: "hair-beauty",
    recommendedProviders: ["publicWebsiteFetcher", "socialProvider", "aiContentProvider", "schemaProvider"],
    relevantDimensions: ["branding", "visualConsistency", "trustSignals", "socialMediaPresence"],
    categoryWeights: { branding: 1.4, trust: 1.2 },
    rules: ["Ninguna recomendación incluye idoneidad de un tratamiento estético concreto."],
    warnings: ["Tratamientos con posible componente sanitario sin licencia visible es un riesgo de confianza."],
    recommendations: ["Reserva online de citas.", "Mostrar licencia/certificaciones cuando el tratamiento lo requiera."],
    optionalFields: ["licencia_sanitaria_estetica", "servicios_ofrecidos"],
    consentRequired: true,
    consentNote: "socialProvider (redes) y aiContentProvider (análisis de contenido) requieren consentimiento explícito del negocio.",
    exclusions: [],
  }),
});

export const PROVIDER_SECTOR_PROFILE_IDS = Object.freeze(Object.keys(PROVIDER_SECTOR_PROFILES));

export const GENERIC_PROVIDER_SECTOR_PROFILE = Object.freeze(
  buildProfile({
    id: "generic",
    label: "Perfil genérico (sector no reconocido)",
    auditPresetId: "generic-local-service",
    recommendedProviders: ["publicWebsiteFetcher", "seoProvider", "socialProvider"],
    relevantDimensions: ["trustSignals", "mobileExperience", "contactInfo", "conversion"],
    rules: ["Sin perfil sectorial específico: se aplican pesos neutros (preset genérico de Paso 12)."],
    consentRequired: true,
    consentNote: "socialProvider requiere SOCIAL_PROVIDER_API_KEY: no se activa sin consentimiento explícito del negocio auditado.",
  })
);

/** Busca un perfil por id exacto, o cae al genérico. Nunca lanza. */
export function getProviderSectorProfile(profileId) {
  if (!profileId) return GENERIC_PROVIDER_SECTOR_PROFILE;
  return PROVIDER_SECTOR_PROFILES[profileId] ?? GENERIC_PROVIDER_SECTOR_PROFILE;
}

/**
 * Combina las opciones de política (ver providerExecutionPolicy.js) YA
 * indicadas explícitamente (p. ej. por CLI) con las recomendaciones de un
 * perfil sectorial. Las exclusiones se acumulan (nunca se pierde una
 * exclusión explícita del perfil); las prioridades explícitas del
 * llamador SIEMPRE ganan sobre las del perfil.
 * @param {object} policyOptions - input de defineProviderExecutionPolicy
 * @param {object} profile - de getProviderSectorProfile()
 */
export function mergePolicyOptionsWithProfile(policyOptions = {}, profile) {
  return {
    ...policyOptions,
    excludeProviders: [...new Set([...(policyOptions.excludeProviders ?? []), ...profile.exclusions])],
    providerPriorityOverrides: { ...profile.providerPriorities, ...(policyOptions.providerPriorityOverrides ?? {}) },
    profileId: policyOptions.profileId ?? profile.id,
  };
}

/**
 * Resuelve el preset de puntuación efectivo para un perfil: parte del
 * preset de auditoría de Paso 12 que declare (`auditPresetId`), o del
 * preset genérico si no hay equivalente 1:1 (caso "hotel"), y le aplica
 * los pesos propios del perfil por encima (ver `mergeAuditPreset`).
 */
export function getEffectiveAuditPresetForProfile(profile) {
  const basePreset = getSectorAuditPreset(profile.auditPresetId) ?? GENERIC_AUDIT_PRESET;
  return mergeAuditPreset(basePreset, { dimensionWeights: profile.dimensionWeights, categoryWeights: profile.categoryWeights, priorityDimensions: profile.relevantDimensions, mustNotAutoInfer: [] });
}
