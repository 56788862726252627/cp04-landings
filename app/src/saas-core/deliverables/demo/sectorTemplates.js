// App 3 · Prompt 4/6 — SectorTemplates.
//
// Catálogo de branding/contenido por defecto para los 6 sectores
// mínimos pedidos por el enunciado. Separa CONTENIDO (este archivo) de
// PRESENTACIÓN (los motores en binary/*Engine.js, que no saben nada de
// sectores) — añadir un sector nuevo no toca ningún motor; añadir un
// motor nuevo no toca ningún sector.

const REQUIRED_PROJECT_FIELDS = Object.freeze(["projectId", "displayName", "sector", "client"]);

const DEFAULT_ROADMAP = Object.freeze([
  { phase: "Fase 1 · Configuración", weeks: "1-2", detail: "Alta del proyecto, branding, datos iniciales." },
  { phase: "Fase 2 · Integración", weeks: "3-4", detail: "Conexión de módulos y validación con el equipo." },
  { phase: "Fase 3 · Lanzamiento", weeks: "5", detail: "Formación, puesta en marcha y seguimiento inicial." },
]);

export const CP04_SECTOR_TEMPLATES = Object.freeze({
  "club-deportivo": Object.freeze({
    id: "club-deportivo", label: "Club deportivo",
    defaultModules: Object.freeze(["Reservas online", "Recordatorios automáticos", "Panel de socios", "Torneos y ranking"]),
    defaultRisks: Object.freeze(["Adopción por socios de mayor edad", "Migración de datos de reservas históricas"]),
    defaultCta: "Agendar una demo de 20 minutos con el equipo del club",
  }),
  "clinica-dental": Object.freeze({
    id: "clinica-dental", label: "Clínica dental",
    defaultModules: Object.freeze(["Reservas online", "Recordatorios automáticos", "Panel de pacientes", "Historial clínico básico"]),
    defaultRisks: Object.freeze(["Cumplimiento de protección de datos sanitarios", "Migración del histórico de citas"]),
    defaultCta: "Agendar una demo de 20 minutos con el equipo clínico",
  }),
  fisioterapia: Object.freeze({
    id: "fisioterapia", label: "Fisioterapia",
    defaultModules: Object.freeze(["Reservas online", "Recordatorios automáticos", "Panel de pacientes", "Seguimiento de sesiones"]),
    defaultRisks: Object.freeze(["Estacionalidad de la demanda", "Migración del histórico de sesiones"]),
    defaultCta: "Agendar una demo de 20 minutos",
  }),
  abogados: Object.freeze({
    id: "abogados", label: "Despacho de abogados",
    defaultModules: Object.freeze(["Agenda de citas", "Gestión documental básica", "Panel de casos", "Recordatorios a clientes"]),
    defaultRisks: Object.freeze(["Confidencialidad de expedientes", "Adopción por perfiles no técnicos"]),
    defaultCta: "Agendar una reunión de 20 minutos",
  }),
  peluqueria: Object.freeze({
    id: "peluqueria", label: "Peluquería / estética",
    defaultModules: Object.freeze(["Reservas online", "Recordatorios automáticos", "Panel de clientes", "Catálogo de servicios"]),
    defaultRisks: Object.freeze(["Estacionalidad de la demanda", "Rotación de personal"]),
    defaultCta: "Agendar una demo de 20 minutos",
  }),
  veterinaria: Object.freeze({
    id: "veterinaria", label: "Clínica veterinaria",
    defaultModules: Object.freeze(["Reservas online", "Recordatorios automáticos", "Panel de pacientes (mascotas)", "Historial clínico básico"]),
    defaultRisks: Object.freeze(["Cumplimiento de protección de datos", "Urgencias fuera de horario"]),
    defaultCta: "Agendar una demo de 20 minutos",
  }),
});

export const CP04_SECTOR_IDS = Object.freeze(Object.keys(CP04_SECTOR_TEMPLATES));

export function cp04GetSectorTemplate(sectorId) {
  return CP04_SECTOR_TEMPLATES[String(sectorId || "")] || null;
}

/** @param {{projectId?:string, displayName?:string, sector?:string, client?:string}} project */
export function cp04ValidateProjectBrief(project) {
  const errors = [];
  if (!project || typeof project !== "object") return { valid: false, errors: ["falta el objeto del proyecto"] };
  for (const field of REQUIRED_PROJECT_FIELDS) {
    if (!project[field]) errors.push(`falta el campo obligatorio "${field}"`);
  }
  if (project.sector && !cp04GetSectorTemplate(project.sector)) {
    errors.push(`sector desconocido: "${project.sector}" (sectores válidos: ${CP04_SECTOR_IDS.join(", ")})`);
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Construye el "brief" completo de un proyecto: combina lo que el
 * caller aporta con los defaults seguros del sector (nunca datos reales
 * sensibles — solo texto comercial genérico). Falla con un mensaje
 * claro si falta algo obligatorio, nunca produce un brief a medias.
 * @param {{projectId:string, displayName:string, sector:string, client:string, language?:string, contact?:object, modules?:string[], price?:string, scope?:string, dates?:object, risks?:string[], roadmap?:object[], cta?:string, branding?:object}} input
 * @returns {{valid:boolean, errors?:string[], brief?:object}}
 */
export function cp04BuildProjectBrief(input) {
  const validation = cp04ValidateProjectBrief(input);
  if (!validation.valid) return { valid: false, errors: validation.errors };
  const template = cp04GetSectorTemplate(input.sector);

  const brief = Object.freeze({
    projectId: input.projectId,
    displayName: input.displayName,
    client: input.client,
    sector: input.sector,
    sectorLabel: template.label,
    language: input.language || "es",
    contact: input.contact || { email: `contacto@${input.projectId}.example` },
    modules: input.modules && input.modules.length > 0 ? input.modules : template.defaultModules,
    price: input.price || "A definir en reunión comercial",
    scope: input.scope || `Automatización digital y presencia online para ${input.displayName}`,
    dates: input.dates || { kickoff: "A definir", delivery: "A definir" },
    risks: input.risks && input.risks.length > 0 ? input.risks : template.defaultRisks,
    roadmap: input.roadmap && input.roadmap.length > 0 ? input.roadmap : DEFAULT_ROADMAP,
    cta: input.cta || template.defaultCta,
    branding: input.branding || { projectName: input.displayName, accentColor: "#0ea5e9" },
  });
  return { valid: true, brief };
}
