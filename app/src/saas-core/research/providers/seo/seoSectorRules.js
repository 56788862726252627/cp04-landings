// Paso 16 · Fase 6 — Reglas SEO por perfil sectorial. Puro dato, aparte
// del núcleo del analizador (seoAnalyzer.js no conoce sectores): cada
// perfil solo añade `expectedSchemaTypes` (para "adecuación preliminar al
// perfil sectorial" del enunciado, Fase 3.F), palabras clave de contenido
// relevante (Fase 3.G) y un umbral de contenido escaso propio. Reutiliza
// los ids de `providerSectorProfiles.js` (Paso 15) — no inventa una
// taxonomía de sectores nueva.

function buildSeoRule({ profileId, expectedSchemaTypes, relevantContentKeywords, thinContentWordThreshold = 150, requiresNAP = true, notes = [] }) {
  return Object.freeze({
    profileId,
    expectedSchemaTypes: Object.freeze([...expectedSchemaTypes]),
    relevantContentKeywords: Object.freeze([...relevantContentKeywords]),
    thinContentWordThreshold,
    requiresNAP,
    notes: Object.freeze([...notes]),
  });
}

export const SEO_SECTOR_RULES = Object.freeze({
  "club-deportivo": buildSeoRule({
    profileId: "club-deportivo",
    expectedSchemaTypes: ["SportsActivityLocation", "LocalBusiness"],
    relevantContentKeywords: ["pista", "reserva", "horario", "instalaciones", "eventos", "torneo"],
    notes: ["Reservas/eventos/instalaciones se tratan como contenido de alta relevancia."],
  }),
  clinica: buildSeoRule({
    profileId: "clinica",
    expectedSchemaTypes: ["MedicalBusiness", "LocalBusiness"],
    relevantContentKeywords: ["servicios", "cita", "horario", "ubicación", "consentimiento"],
    notes: ["Sector regulado: la presencia de avisos de consentimiento se trata como señal de contenido relevante, no como validación legal."],
  }),
  dentista: buildSeoRule({
    profileId: "dentista",
    expectedSchemaTypes: ["Dentist", "MedicalBusiness", "LocalBusiness"],
    relevantContentKeywords: ["servicios", "cita", "colegiado", "horario", "ubicación"],
  }),
  veterinario: buildSeoRule({
    profileId: "veterinario",
    expectedSchemaTypes: ["VeterinaryCare", "LocalBusiness"],
    relevantContentKeywords: ["servicios", "urgencias", "cita", "horario", "ubicación"],
  }),
  abogado: buildSeoRule({
    profileId: "abogado",
    expectedSchemaTypes: ["LegalService", "Attorney", "LocalBusiness"],
    relevantContentKeywords: ["áreas de práctica", "consulta", "colegiado", "contacto"],
    requiresNAP: false,
  }),
  restaurante: buildSeoRule({
    profileId: "restaurante",
    expectedSchemaTypes: ["Restaurant", "LocalBusiness", "Menu"],
    relevantContentKeywords: ["menú", "reserva", "horario", "carta", "ubicación"],
  }),
  hotel: buildSeoRule({
    profileId: "hotel",
    expectedSchemaTypes: ["Hotel", "LodgingBusiness"],
    relevantContentKeywords: ["habitaciones", "reserva", "ubicación", "servicios", "check-in"],
  }),
  inmobiliaria: buildSeoRule({
    profileId: "inmobiliaria",
    expectedSchemaTypes: ["RealEstateAgent", "LocalBusiness"],
    relevantContentKeywords: ["propiedad", "ubicación", "precio", "contacto"],
    requiresNAP: false,
    thinContentWordThreshold: 200,
  }),
  peluqueria: buildSeoRule({
    profileId: "peluqueria",
    expectedSchemaTypes: ["HairSalon", "LocalBusiness"],
    relevantContentKeywords: ["servicios", "cita", "horario", "ubicación"],
  }),
  "centro-estetica": buildSeoRule({
    profileId: "centro-estetica",
    expectedSchemaTypes: ["BeautySalon", "LocalBusiness"],
    relevantContentKeywords: ["servicios", "cita", "horario", "ubicación", "licencia"],
  }),
  generic: buildSeoRule({
    profileId: "generic",
    expectedSchemaTypes: ["LocalBusiness", "Organization"],
    relevantContentKeywords: ["servicios", "contacto", "horario", "ubicación"],
  }),
});

export function getSeoSectorRule(profileId) {
  return SEO_SECTOR_RULES[profileId] ?? SEO_SECTOR_RULES.generic;
}
