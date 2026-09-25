// Paso 18 · Fase 6 — Reglas de rendimiento por perfil sectorial. Puro
// dato, aparte del núcleo (perfAnalyzer.js no conoce sectores). Cada
// perfil declara `categoryWeights` (pondera los 11 grupos del desglose
// de scoring, ver perfScoring.js) y `priorityNotes` (texto informativo).
// Reutiliza los mismos ids de perfil que providerSectorProfiles.js
// (Paso 15) / seoSectorRules.js (Paso 16) / a11ySectorRules.js (Paso 17).

export const PERF_SCORE_GROUPS = Object.freeze(["response", "html", "resources", "images", "javascript", "css", "fonts", "caching", "compression", "thirdParty", "mobile"]);

function buildRule({ profileId, categoryWeights = {}, priorityNotes = [] }) {
  for (const key of Object.keys(categoryWeights)) {
    if (!PERF_SCORE_GROUPS.includes(key)) throw new Error(`perfSectorRules("${profileId}"): grupo desconocido "${key}"`);
  }
  return Object.freeze({ profileId, categoryWeights: Object.freeze({ ...categoryWeights }), priorityNotes: Object.freeze([...priorityNotes]) });
}

export const PERF_SECTOR_RULES = Object.freeze({
  "club-deportivo": buildRule({
    profileId: "club-deportivo",
    categoryWeights: { javascript: 1.3, mobile: 1.3 },
    priorityNotes: ["El calendario/formulario de reserva suele depender de JavaScript: bloqueos de renderizado ahí son críticos.", "Mayoría de reservas se hacen desde móvil: carga móvil prioritaria."],
  }),
  clinica: buildRule({
    profileId: "clinica",
    categoryWeights: { html: 1.3, mobile: 1.2 },
    priorityNotes: ["Contenido crítico (horarios, servicios) debe cargar rápido incluso sin JS: peso del HTML prioritario."],
  }),
  dentista: buildRule({
    profileId: "dentista",
    categoryWeights: { html: 1.3, mobile: 1.2 },
    priorityNotes: ["Mismo criterio que clínica: contenido crítico ligero y accesible en móvil."],
  }),
  veterinario: buildRule({
    profileId: "veterinario",
    categoryWeights: { html: 1.2, thirdParty: 1.2 },
    priorityNotes: ["Contacto de urgencia debe ser inmediato: minimizar dependencias de terceros que puedan ralentizar la carga."],
  }),
  abogado: buildRule({
    profileId: "abogado",
    categoryWeights: { html: 1.3, caching: 1.2 },
    priorityNotes: ["Contenido legal mayormente estático: caché bien configurada tiene alto impacto/bajo esfuerzo."],
  }),
  restaurante: buildRule({
    profileId: "restaurante",
    categoryWeights: { images: 1.4, mobile: 1.3 },
    priorityNotes: ["Menús/cartas con fotografía: peso e imágenes sin optimizar son el riesgo principal.", "Consulta mayoritariamente desde móvil (decisión en el momento)."],
  }),
  hotel: buildRule({
    profileId: "hotel",
    categoryWeights: { images: 1.4, javascript: 1.2 },
    priorityNotes: ["Galería de habitaciones: peso de imágenes crítico.", "Motor de reservas con JS: bloqueos de renderizado penalizan la conversión."],
  }),
  inmobiliaria: buildRule({
    profileId: "inmobiliaria",
    categoryWeights: { images: 1.4, resources: 1.2 },
    priorityNotes: ["Fichas de inmuebles con muchas fotos: peso de imágenes y nº total de recursos declarados críticos."],
  }),
  peluqueria: buildRule({
    profileId: "peluqueria",
    categoryWeights: { mobile: 1.3, javascript: 1.2 },
    priorityNotes: ["Reserva rápida desde móvil: carga móvil y JS de terceros (widgets de reserva) prioritarios."],
  }),
  "centro-estetica": buildRule({
    profileId: "centro-estetica",
    categoryWeights: { mobile: 1.3, images: 1.2 },
    priorityNotes: ["Galería de tratamientos + reserva móvil: imágenes y carga móvil prioritarias."],
  }),
  generic: buildRule({
    profileId: "generic",
    categoryWeights: {},
    priorityNotes: ["Sin perfil sectorial específico: pesos neutros en los 11 grupos."],
  }),
});

export function getPerfSectorRule(profileId) {
  return PERF_SECTOR_RULES[profileId] ?? PERF_SECTOR_RULES.generic;
}
