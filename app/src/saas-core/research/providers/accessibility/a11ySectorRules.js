// Paso 17 · Fase 6 — Reglas de accesibilidad por perfil sectorial. Puro
// dato, aparte del núcleo (a11yAnalyzer.js no conoce sectores). Cada
// perfil solo declara `categoryWeights` (pondera los 9 grupos del
// desglose de scoring, ver a11yScoring.js) y `priorityNotes` (texto
// informativo, sin lógica). Reutiliza los mismos ids de perfil que
// providerSectorProfiles.js (Paso 15) / seoSectorRules.js (Paso 16).

export const A11Y_SCORE_GROUPS = Object.freeze(["structure", "images", "forms", "navigation", "aria", "tables", "keyboard", "contrast", "content"]);

function buildRule({ profileId, categoryWeights = {}, priorityNotes = [] }) {
  for (const key of Object.keys(categoryWeights)) {
    if (!A11Y_SCORE_GROUPS.includes(key)) throw new Error(`a11ySectorRules("${profileId}"): grupo desconocido "${key}"`);
  }
  return Object.freeze({ profileId, categoryWeights: Object.freeze({ ...categoryWeights }), priorityNotes: Object.freeze([...priorityNotes]) });
}

export const A11Y_SECTOR_RULES = Object.freeze({
  "club-deportivo": buildRule({
    profileId: "club-deportivo",
    categoryWeights: { forms: 1.4, navigation: 1.2 },
    priorityNotes: ["El formulario de reserva de pista es el punto de fricción más crítico: prioriza forms/navigation."],
  }),
  clinica: buildRule({
    profileId: "clinica",
    categoryWeights: { content: 1.4, forms: 1.3, contrast: 1.2 },
    priorityNotes: ["Información sanitaria sensible: claridad de contenido y formularios de cita tienen prioridad alta.", "Contraste priorizado por el perfil demográfico habitual (pacientes de mayor edad)."],
  }),
  dentista: buildRule({
    profileId: "dentista",
    categoryWeights: { content: 1.3, forms: 1.3 },
    priorityNotes: ["Mismo criterio que clínica: información sanitaria + formulario de cita."],
  }),
  veterinario: buildRule({
    profileId: "veterinario",
    categoryWeights: { forms: 1.3, navigation: 1.2 },
    priorityNotes: ["Contacto rápido para urgencias: navigation (botones de llamada/contacto) prioritario."],
  }),
  abogado: buildRule({
    profileId: "abogado",
    categoryWeights: { content: 1.5, structure: 1.2 },
    priorityNotes: ["Contenido legal: claridad estructural y de contenido por encima de formularios/multimedia."],
  }),
  restaurante: buildRule({
    profileId: "restaurante",
    categoryWeights: { content: 1.4, images: 1.2 },
    priorityNotes: ["Menús y cartas: contenido (a menudo en imagen/PDF) y alternativas textuales de imágenes prioritarias."],
  }),
  hotel: buildRule({
    profileId: "hotel",
    categoryWeights: { forms: 1.4, images: 1.2 },
    priorityNotes: ["Motor de reservas (formularios) y galería de habitaciones (imágenes) son el núcleo de conversión."],
  }),
  inmobiliaria: buildRule({
    profileId: "inmobiliaria",
    categoryWeights: { content: 1.3, images: 1.3 },
    priorityNotes: ["Fichas de inmuebles: contenido + imágenes (alt descriptivo de cada propiedad) prioritarios."],
  }),
  peluqueria: buildRule({
    profileId: "peluqueria",
    categoryWeights: { navigation: 1.3, forms: 1.2 },
    priorityNotes: ["Botones de llamada/reserva rápida: navigation prioritario."],
  }),
  "centro-estetica": buildRule({
    profileId: "centro-estetica",
    categoryWeights: { navigation: 1.3, content: 1.2 },
    priorityNotes: ["Acceso a servicios y botones de contacto/reserva prioritarios."],
  }),
  generic: buildRule({
    profileId: "generic",
    categoryWeights: {},
    priorityNotes: ["Sin perfil sectorial específico: pesos neutros en los 9 grupos."],
  }),
});

export function getA11ySectorRule(profileId) {
  return A11Y_SECTOR_RULES[profileId] ?? A11Y_SECTOR_RULES.generic;
}
