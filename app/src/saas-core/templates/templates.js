// Paso 09 · Fase 4 — Plantillas sectoriales base.
//
// Cada plantilla es solo CONFIGURACIÓN (módulos + terminología + roles +
// recomendaciones) — ningún componente de UI se duplica por plantilla. Los
// permisos por rol se derivan automáticamente de `modules` vía
// `deriveGenericRolePermissions` (una sola fuente de verdad de jerarquía de
// roles en moduleRegistry.js), así que una plantilla nunca puede quedar
// desincronizada de la matriz de roles genérica.

import { GENERIC_ROLES, deriveGenericRolePermissions } from "../modules/moduleRegistry.js";
import { BASE_TERMINOLOGY } from "../terminology/terminology.js";

function defineTemplate({
  templateId,
  name,
  businessType,
  sector,
  description,
  modules,
  terminologyOverrides = {},
  commonServices,
  optionalFields,
  recommendedAutomationCapabilities,
  recommendedIntegrations,
  dashboards,
  demoData,
  launchChecklist,
}) {
  return Object.freeze({
    templateId,
    name,
    businessType,
    sector,
    description,
    modules: Object.freeze([...modules]),
    roles: GENERIC_ROLES,
    permissions: Object.freeze(deriveGenericRolePermissions(modules)),
    terminologyOverrides: Object.freeze(terminologyOverrides),
    commonServices: Object.freeze([...commonServices]),
    optionalFields: Object.freeze([...optionalFields]),
    recommendedAutomationCapabilities: Object.freeze([...recommendedAutomationCapabilities]),
    recommendedIntegrations: Object.freeze([...recommendedIntegrations]),
    dashboards: Object.freeze([...dashboards]),
    demoData: Object.freeze({ ...demoData }),
    launchChecklist: Object.freeze([...launchChecklist]),
  });
}

const CORE_BASE_MODULES = ["inicio", "citas", "clientes", "pagos", "automatizaciones", "soporte", "informes", "configuracion"];

export const SECTOR_TEMPLATES = Object.freeze({
  "padel-club": defineTemplate({
    templateId: "padel-club",
    name: "Club de pádel",
    businessType: "padel-club",
    sector: "padel",
    description: "Réplica del vertical original de Club Pádel 04: reservas de pista, jugadores, torneos y ranking.",
    modules: [...CORE_BASE_MODULES, "agenda", "profesionales", "recursos", "servicios", "torneos", "ranking"],
    terminologyOverrides: {}, // ya es la terminología base (pádel)
    commonServices: ["Alquiler de pista individual", "Clase con entrenador", "Torneo social mensual"],
    optionalFields: ["nivel_juego", "mano_dominante", "pareja_habitual"],
    recommendedAutomationCapabilities: ["alta_cliente", "confirmacion", "cancelacion", "recordatorio", "pago", "fidelizacion"],
    recommendedIntegrations: ["automation", "dataRepository", "payments", "messaging"],
    dashboards: ["Ocupación de pistas", "Ranking de jugadores", "Ingresos por reservas"],
    demoData: { enabled: true, sampleCustomers: 12, sampleStaff: 3, sampleResources: 4 },
    launchChecklist: [
      "Cargar catálogo de pistas como recursos",
      "Definir horario del club",
      "Configurar entrenadores como profesionales",
      "Revisar reglas del ranking",
    ],
  }),

  "sports-club": defineTemplate({
    templateId: "sports-club",
    name: "Club deportivo",
    businessType: "sports-club",
    sector: "sports",
    description: "Club deportivo genérico (multi-disciplina): instalaciones reservables, monitores, actividades.",
    modules: [...CORE_BASE_MODULES, "agenda", "profesionales", "recursos", "servicios", "torneos", "ranking"],
    terminologyOverrides: {
      resource: { singular: "instalación", plural: "instalaciones", short: "Instalación" },
      staff: { singular: "monitor", plural: "monitores", short: "Monitor" },
      event: { singular: "actividad", plural: "actividades", short: "Actividad" },
      organization: { singular: "club", plural: "clubes", short: "Club" },
    },
    commonServices: ["Reserva de instalación", "Clase dirigida", "Actividad grupal"],
    optionalFields: ["disciplina", "nivel", "equipo"],
    recommendedAutomationCapabilities: ["alta_cliente", "confirmacion", "cancelacion", "recordatorio", "pago", "fidelizacion"],
    recommendedIntegrations: ["automation", "dataRepository", "payments", "messaging"],
    dashboards: ["Ocupación de instalaciones", "Clasificación por disciplina", "Ingresos"],
    demoData: { enabled: true, sampleCustomers: 10, sampleStaff: 3, sampleResources: 5 },
    launchChecklist: [
      "Cargar instalaciones disponibles",
      "Definir disciplinas ofrecidas",
      "Configurar monitores",
      "Revisar horario del club",
    ],
  }),

  "healthcare-clinic": defineTemplate({
    templateId: "healthcare-clinic",
    name: "Clínica de salud",
    businessType: "healthcare-clinic",
    sector: "generic-local-service",
    description: "Base para clínicas y consultas: pacientes, profesionales sanitarios, consultas como recurso reservable.",
    modules: [...CORE_BASE_MODULES, "agenda", "profesionales", "recursos", "servicios", "documentos", "formularios"],
    terminologyOverrides: {
      customer: { singular: "paciente", plural: "pacientes", short: "Paciente" },
      resource: { singular: "consulta", plural: "consultas", short: "Consulta" },
      appointment: { singular: "cita", plural: "citas", short: "Cita" },
      staff: { singular: "profesional sanitario", plural: "profesionales sanitarios", short: "Profesional" },
      event: { singular: "campaña de salud", plural: "campañas de salud", short: "Campaña" },
      progress: { singular: "seguimiento", plural: "seguimientos", short: "Seguimiento" },
      organization: { singular: "clínica", plural: "clínicas", short: "Clínica" },
    },
    commonServices: ["Primera visita", "Revisión", "Sesión de tratamiento"],
    optionalFields: ["motivo_consulta", "profesional_habitual"],
    recommendedAutomationCapabilities: ["alta_cliente", "confirmacion", "cancelacion", "recordatorio", "encuesta", "documento", "pago"],
    recommendedIntegrations: ["automation", "dataRepository", "payments", "messaging", "calendar"],
    dashboards: ["Ocupación de consultas", "Citas por profesional", "Facturación"],
    demoData: { enabled: true, sampleCustomers: 15, sampleStaff: 4, sampleResources: 3 },
    launchChecklist: [
      "Cargar consultas/salas como recursos",
      "Configurar profesionales sanitarios y sus horarios",
      "Definir formularios de admisión (sin datos clínicos reales)",
      "Revisar aviso de revisión normativa sanitaria (ver seguridad y privacidad)",
    ],
  }),

  "professional-services": defineTemplate({
    templateId: "professional-services",
    name: "Servicios profesionales",
    businessType: "professional-services",
    sector: "generic-local-service",
    description: "Base para despachos y consultorías: clientes, especialistas, despachos como recurso, documentos.",
    modules: [...CORE_BASE_MODULES, "agenda", "profesionales", "documentos", "formularios", "campanas"],
    terminologyOverrides: {
      customer: { singular: "cliente", plural: "clientes", short: "Cliente" },
      resource: { singular: "despacho", plural: "despachos", short: "Despacho" },
      appointment: { singular: "cita", plural: "citas", short: "Cita" },
      staff: { singular: "especialista", plural: "especialistas", short: "Especialista" },
      event: { singular: "caso", plural: "casos", short: "Caso" },
      progress: { singular: "progreso del caso", plural: "progresos de caso", short: "Progreso" },
      organization: { singular: "despacho", plural: "despachos", short: "Despacho" },
    },
    commonServices: ["Consulta inicial", "Sesión de asesoría", "Revisión de expediente"],
    optionalFields: ["area_practica", "expediente_referencia"],
    recommendedAutomationCapabilities: ["alta_cliente", "confirmacion", "recordatorio", "documento", "pago", "seguimiento"],
    recommendedIntegrations: ["automation", "dataRepository", "payments", "email", "calendar"],
    dashboards: ["Casos activos", "Citas por especialista", "Facturación"],
    demoData: { enabled: true, sampleCustomers: 8, sampleStaff: 3, sampleResources: 2 },
    launchChecklist: [
      "Cargar despachos/salas como recursos",
      "Configurar especialistas y áreas de práctica",
      "Definir plantillas de documentos (sin contenido legal real)",
      "Revisar aviso de revisión normativa (ver seguridad y privacidad)",
    ],
  }),

  "beauty-salon": defineTemplate({
    templateId: "beauty-salon",
    name: "Centro de estética / peluquería",
    businessType: "beauty-salon",
    sector: "beauty",
    description: "Base para salones de belleza: clientes, estilistas, cabinas como recurso, catálogo de servicios.",
    modules: [...CORE_BASE_MODULES, "agenda", "profesionales", "recursos", "servicios", "campanas"],
    terminologyOverrides: {
      customer: { singular: "cliente", plural: "clientes", short: "Cliente" },
      resource: { singular: "cabina", plural: "cabinas", short: "Cabina" },
      appointment: { singular: "cita", plural: "citas", short: "Cita" },
      staff: { singular: "estilista", plural: "estilistas", short: "Estilista" },
      event: { singular: "campaña", plural: "campañas", short: "Campaña" },
      progress: { singular: "historial de visitas", plural: "historiales de visitas", short: "Historial" },
      organization: { singular: "salón", plural: "salones", short: "Salón" },
    },
    commonServices: ["Corte y peinado", "Coloración", "Tratamiento facial"],
    optionalFields: ["estilista_habitual", "preferencias_producto"],
    recommendedAutomationCapabilities: ["alta_cliente", "confirmacion", "cancelacion", "recordatorio", "campana", "fidelizacion", "pago"],
    recommendedIntegrations: ["automation", "dataRepository", "payments", "messaging"],
    dashboards: ["Ocupación de cabinas", "Ventas por estilista", "Campañas activas"],
    demoData: { enabled: true, sampleCustomers: 20, sampleStaff: 4, sampleResources: 5 },
    launchChecklist: [
      "Cargar cabinas/puestos como recursos",
      "Configurar estilistas y su disponibilidad",
      "Definir catálogo de servicios y precios",
      "Configurar campaña de bienvenida",
    ],
  }),

  "veterinary-clinic": defineTemplate({
    templateId: "veterinary-clinic",
    name: "Clínica veterinaria",
    businessType: "veterinary-clinic",
    sector: "veterinary",
    description: "Base para clínicas veterinarias: propietarios, veterinarios, salas como recurso, historiales.",
    modules: [...CORE_BASE_MODULES, "agenda", "profesionales", "recursos", "servicios", "documentos"],
    terminologyOverrides: {
      customer: { singular: "propietario", plural: "propietarios", short: "Propietario" },
      resource: { singular: "sala de consulta", plural: "salas de consulta", short: "Sala" },
      appointment: { singular: "cita", plural: "citas", short: "Cita" },
      staff: { singular: "veterinario", plural: "veterinarios", short: "Veterinario" },
      event: { singular: "campaña sanitaria", plural: "campañas sanitarias", short: "Campaña" },
      progress: { singular: "historial clínico", plural: "historiales clínicos", short: "Historial" },
      organization: { singular: "clínica veterinaria", plural: "clínicas veterinarias", short: "Clínica" },
    },
    commonServices: ["Consulta general", "Vacunación", "Revisión periódica"],
    optionalFields: ["especie", "raza", "nombre_mascota"],
    recommendedAutomationCapabilities: ["alta_cliente", "confirmacion", "recordatorio", "encuesta", "documento", "pago"],
    recommendedIntegrations: ["automation", "dataRepository", "payments", "messaging", "calendar"],
    dashboards: ["Ocupación de salas", "Citas por veterinario", "Recordatorios de vacunación"],
    demoData: { enabled: true, sampleCustomers: 14, sampleStaff: 3, sampleResources: 3 },
    launchChecklist: [
      "Cargar salas de consulta como recursos",
      "Configurar veterinarios y turnos",
      "Definir campos de mascota (especie/raza, sin datos clínicos reales)",
      "Revisar aviso de revisión normativa veterinaria (ver seguridad y privacidad)",
    ],
  }),

  "local-service": defineTemplate({
    templateId: "local-service",
    name: "Negocio local de servicios",
    businessType: "local-service",
    sector: "generic-local-service",
    description: "Plantilla genérica para cualquier negocio local basado en citas, profesionales y servicios sin encajar en las otras 6.",
    modules: [...CORE_BASE_MODULES, "agenda", "profesionales", "servicios", "campanas"],
    terminologyOverrides: {
      customer: { singular: "cliente", plural: "clientes", short: "Cliente" },
      resource: { singular: "recurso", plural: "recursos", short: "Recurso" },
      appointment: { singular: "cita", plural: "citas", short: "Cita" },
      staff: { singular: "profesional", plural: "profesionales", short: "Profesional" },
      event: { singular: "actividad", plural: "actividades", short: "Actividad" },
      progress: { singular: "seguimiento", plural: "seguimientos", short: "Seguimiento" },
      organization: { singular: "negocio", plural: "negocios", short: "Negocio" },
    },
    commonServices: ["Cita estándar", "Servicio a domicilio"],
    optionalFields: ["notas_cliente"],
    recommendedAutomationCapabilities: ["alta_cliente", "confirmacion", "cancelacion", "recordatorio", "pago", "campana"],
    recommendedIntegrations: ["automation", "dataRepository", "payments", "messaging"],
    dashboards: ["Citas por profesional", "Ingresos"],
    demoData: { enabled: true, sampleCustomers: 10, sampleStaff: 2, sampleResources: 2 },
    launchChecklist: [
      "Definir catálogo de servicios",
      "Configurar profesionales",
      "Revisar terminología por defecto y ajustarla al negocio real",
    ],
  }),
});

export const SECTOR_TEMPLATE_IDS = Object.freeze(Object.keys(SECTOR_TEMPLATES));

export function getTemplate(templateId) {
  return SECTOR_TEMPLATES[templateId] || null;
}

export { BASE_TERMINOLOGY };
