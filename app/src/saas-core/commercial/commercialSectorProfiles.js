// Paso 20 · Fase 3/4 — perfiles sectoriales para el motor ROI y el panel
// comercial. Puro dato, aparte del núcleo (roiEngine.js/commercialPanel.js
// no conocen sectores) — mismo patrón que providerSectorProfiles.js
// (Paso 15) / seoSectorRules.js / a11ySectorRules.js / perfSectorRules.js
// (Pasos 16-18). Reutiliza los mismos 10 ids de perfil + "generic".

export const COMMERCIAL_SECTOR_IDS = Object.freeze(["club-deportivo", "clinica", "dentista", "veterinario", "abogado", "restaurante", "hotel", "inmobiliaria", "peluqueria", "centro-estetica"]);

function buildProfile({ profileId, label, defaultAssumptions, priorityModules, priorityNotes }) {
  return Object.freeze({ profileId, label, defaultAssumptions: Object.freeze({ ...defaultAssumptions }), priorityModules: Object.freeze([...priorityModules]), priorityNotes: Object.freeze([...priorityNotes]) });
}

// `defaultAssumptions` son SUPUESTOS de partida (nunca datos reales del
// cliente) usados por roiEngine.js SOLO cuando el input no aporta un
// valor explícito — cada uno queda marcado como "assumed" (no
// "provided") en la salida del motor, nunca se presenta como un dato
// medido.
export const COMMERCIAL_SECTOR_PROFILES = Object.freeze({
  "club-deportivo": buildProfile({
    profileId: "club-deportivo",
    label: "Club deportivo",
    defaultAssumptions: { averageTicket: 35, monthlyBookings: 250, noShowRate: 0.12, adminHoursPerWeek: 8, hourlyCost: 15 },
    priorityModules: ["reservas online", "recordatorios automáticos", "gestión de listas de espera", "pagos online"],
    priorityNotes: ["Los no-shows en reservas de pista son el mayor foco de ahorro potencial.", "La automatización de recordatorios reduce horas administrativas de forma directa."],
  }),
  clinica: buildProfile({
    profileId: "clinica",
    label: "Clínica",
    defaultAssumptions: { averageTicket: 60, monthlyBookings: 180, noShowRate: 0.15, adminHoursPerWeek: 10, hourlyCost: 18 },
    priorityModules: ["agenda de citas", "recordatorios de cita", "formularios de admisión", "facturación"],
    priorityNotes: ["Los no-shows en citas médicas tienen un coste de oportunidad alto por franja horaria limitada."],
  }),
  dentista: buildProfile({
    profileId: "dentista",
    label: "Dentista",
    defaultAssumptions: { averageTicket: 90, monthlyBookings: 120, noShowRate: 0.14, adminHoursPerWeek: 8, hourlyCost: 18 },
    priorityModules: ["agenda de citas", "recordatorios de cita", "presupuestos", "facturación"],
    priorityNotes: ["Mismo criterio que clínica: ticket medio más alto, franja horaria muy valiosa."],
  }),
  veterinario: buildProfile({
    profileId: "veterinario",
    label: "Veterinario",
    defaultAssumptions: { averageTicket: 45, monthlyBookings: 150, noShowRate: 0.10, adminHoursPerWeek: 7, hourlyCost: 15 },
    priorityModules: ["agenda de citas", "recordatorios", "historial de mascota", "urgencias"],
    priorityNotes: ["Atención de urgencia inmediata: prioriza mensajería rápida sobre automatización compleja."],
  }),
  abogado: buildProfile({
    profileId: "abogado",
    label: "Despacho de abogados",
    defaultAssumptions: { averageTicket: 250, monthlyBookings: 30, noShowRate: 0.08, adminHoursPerWeek: 6, hourlyCost: 25 },
    priorityModules: ["agenda de consultas", "gestión documental", "facturación", "seguimiento de casos"],
    priorityNotes: ["Volumen bajo, ticket alto: el foco de ROI está en horas administrativas ahorradas, no en volumen de reservas."],
  }),
  restaurante: buildProfile({
    profileId: "restaurante",
    label: "Restaurante",
    defaultAssumptions: { averageTicket: 28, monthlyBookings: 400, noShowRate: 0.18, adminHoursPerWeek: 6, hourlyCost: 14 },
    priorityModules: ["reservas de mesa", "recordatorios", "menú digital", "pedidos"],
    priorityNotes: ["Alto volumen y alta tasa de no-shows: mayor potencial de ahorro económico directo por confirmación automática."],
  }),
  hotel: buildProfile({
    profileId: "hotel",
    label: "Hotel",
    defaultAssumptions: { averageTicket: 110, monthlyBookings: 200, noShowRate: 0.09, adminHoursPerWeek: 12, hourlyCost: 16 },
    priorityModules: ["motor de reservas", "check-in online", "recordatorios", "gestión de habitaciones"],
    priorityNotes: ["Ticket medio alto: pequeñas mejoras de conversión tienen impacto económico proporcionalmente mayor."],
  }),
  inmobiliaria: buildProfile({
    profileId: "inmobiliaria",
    label: "Inmobiliaria",
    defaultAssumptions: { averageTicket: 1800, monthlyBookings: 20, noShowRate: 0.20, adminHoursPerWeek: 10, hourlyCost: 20 },
    priorityModules: ["agenda de visitas", "recordatorios", "gestión de leads", "fichas de propiedad"],
    priorityNotes: ["Ticket muy alto y volumen bajo: el ROI depende sobre todo de no perder leads/visitas por descoordinación."],
  }),
  peluqueria: buildProfile({
    profileId: "peluqueria",
    label: "Peluquería",
    defaultAssumptions: { averageTicket: 25, monthlyBookings: 300, noShowRate: 0.16, adminHoursPerWeek: 5, hourlyCost: 13 },
    priorityModules: ["reserva online", "recordatorios", "programa de fidelización", "pagos online"],
    priorityNotes: ["Alto volumen, ticket bajo: el ahorro de horas administrativas suele pesar más que el ahorro por no-shows."],
  }),
  "centro-estetica": buildProfile({
    profileId: "centro-estetica",
    label: "Centro de estética",
    defaultAssumptions: { averageTicket: 55, monthlyBookings: 220, noShowRate: 0.17, adminHoursPerWeek: 6, hourlyCost: 14 },
    priorityModules: ["reserva online", "recordatorios", "paquetes de tratamientos", "pagos online"],
    priorityNotes: ["Tasa de no-shows alta habitual en el sector: primer foco de ahorro."],
  }),
});

export const GENERIC_COMMERCIAL_SECTOR_PROFILE = buildProfile({
  profileId: "generic",
  label: "Genérico",
  defaultAssumptions: { averageTicket: 40, monthlyBookings: 150, noShowRate: 0.12, adminHoursPerWeek: 8, hourlyCost: 15 },
  priorityModules: ["reservas/citas online", "recordatorios automáticos", "pagos online"],
  priorityNotes: ["Sin perfil sectorial específico: supuestos neutros de partida, siempre sustituibles por datos reales del negocio."],
});

export function getCommercialSectorProfile(profileId) {
  if (!profileId) return GENERIC_COMMERCIAL_SECTOR_PROFILE;
  return COMMERCIAL_SECTOR_PROFILES[profileId] ?? GENERIC_COMMERCIAL_SECTOR_PROFILE;
}
