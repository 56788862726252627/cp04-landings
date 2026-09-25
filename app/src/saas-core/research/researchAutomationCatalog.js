// Paso 12 · Fase 13 — Automatizaciones recomendadas por la investigación.
//
// Reutiliza el catálogo de 13 automatizaciones de Paso 11
// (nl-builder/automationCatalog.js) en vez de duplicarlo, y SOLO añade las
// 6 automatizaciones del enunciado de Paso 12 que no existían todavía
// (ticket de soporte, reporting, sincronización, consentimiento,
// campañas, contenido). `recommendAutomationsFromFindings` mapea
// hallazgos de dimensión -> automatización candidata sin crear ningún
// escenario real de Make ni conectar ninguna API.

import { AUTOMATION_CATALOG } from "../nl-builder/automationCatalog.js";

export const RESEARCH_AUTOMATION_ADDITIONS = Object.freeze([
  {
    id: "ticket_soporte_incidencia",
    capability: "soporte",
    label: "Apertura de ticket de soporte ante incidencia detectada",
    trigger: "incidencia_reportada",
    conditions: ["cliente reporta un problema por cualquier canal"],
    actions: ["crear ticket", "asignar prioridad", "notificar al responsable"],
    dataNeeded: ["descripción de la incidencia", "canal de origen"],
    errorHandling: "si falla la creación automática, notificar manualmente al responsable de soporte",
    idempotency: "clave idempotente = hash(cliente+descripción+día); evita tickets duplicados por reintentos",
    logs: ["ticket_id", "canal", "prioridad"],
    priority: "alta",
    qualitativeROI: "reduce incidencias perdidas y tiempo de primera respuesta",
    recommendedImplementation: "worker",
    futureIntegration: "helpdesk",
    testData: { ticketId: "demo-ticket-001" },
    requiredModules: ["soporte"],
  },
  {
    id: "reporting_periodico_kpis",
    capability: "reporting",
    label: "Envío periódico de reporting de KPIs",
    trigger: "cron_semanal",
    conditions: ["existen datos suficientes del periodo"],
    actions: ["calcular KPIs", "generar informe", "enviar a responsables"],
    dataNeeded: ["periodo", "lista de destinatarios"],
    errorHandling: "si el cálculo falla, reintentar una vez y avisar si persiste",
    idempotency: "clave idempotente = periodo; no reenvía el mismo informe dos veces",
    logs: ["periodo", "destinatarios", "resultado"],
    priority: "media",
    qualitativeROI: "visibilidad continua sin trabajo manual de recopilación",
    recommendedImplementation: "backend",
    futureIntegration: "email",
    testData: { periodo: "2026-W01" },
    requiredModules: ["informes"],
  },
  {
    id: "sincronizacion_datos_externos",
    capability: "sincronizacion",
    label: "Sincronización periódica de datos con sistema externo",
    trigger: "cron_diario",
    conditions: ["existe una integración de datos configurada"],
    actions: ["leer cambios desde el origen", "aplicar cambios en destino", "registrar resultado"],
    dataNeeded: ["origen", "destino", "marca de tiempo del último sync"],
    errorHandling: "si falla, reintentar con backoff y alertar tras 3 fallos consecutivos",
    idempotency: "clave idempotente = id de registro + versión; evita duplicar sincronizaciones",
    logs: ["origen", "destino", "registros_sincronizados", "resultado"],
    priority: "media",
    qualitativeROI: "evita discrepancias manuales entre sistemas",
    recommendedImplementation: "worker",
    futureIntegration: "dataRepository",
    testData: { origen: "demo-origen", destino: "demo-destino" },
    requiredModules: ["configuracion"],
  },
  {
    id: "registro_consentimiento",
    capability: "consentimiento",
    label: "Registro y expiración de consentimiento de datos",
    trigger: "consentimiento_otorgado",
    conditions: ["el cliente acepta un consentimiento explícito (ej. marketing, datos de salud)"],
    actions: ["registrar consentimiento con fecha", "programar expiración/revisión", "bloquear acciones sin consentimiento vigente"],
    dataNeeded: ["tipo de consentimiento", "fecha", "canal"],
    errorHandling: "ante fallo de registro, bloquear la acción dependiente por seguridad (fail-closed)",
    idempotency: "clave idempotente = cliente+tipo de consentimiento; la última fecha prevalece",
    logs: ["cliente_id", "tipo", "fecha", "resultado"],
    priority: "alta",
    qualitativeROI: "reduce riesgo de cumplimiento normativo",
    recommendedImplementation: "backend",
    futureIntegration: "none",
    testData: { clienteId: "demo-cliente-001", tipo: "marketing" },
    requiredModules: ["consentimientos"],
  },
  {
    id: "campana_estacional",
    capability: "campanas",
    label: "Lanzamiento de campaña estacional segmentada",
    trigger: "fecha_programada",
    conditions: ["existe un segmento de clientes objetivo definido"],
    actions: ["seleccionar segmento", "enviar comunicación", "registrar resultado de la campaña"],
    dataNeeded: ["segmento", "plantilla de mensaje", "fecha de envío"],
    errorHandling: "si el envío falla para un subconjunto, reintentar solo esos destinatarios",
    idempotency: "clave idempotente = campaña+cliente; no reenvía la misma campaña dos veces al mismo cliente",
    logs: ["campana_id", "segmento", "enviados", "fallidos"],
    priority: "baja",
    qualitativeROI: "capta demanda estacional sin trabajo manual de segmentación",
    recommendedImplementation: "Make",
    futureIntegration: "messaging",
    testData: { campanaId: "demo-campana-verano" },
    requiredModules: ["campañas"],
  },
  {
    id: "actualizacion_contenido_programada",
    capability: "contenido",
    label: "Recordatorio de actualización de contenido desactualizado",
    trigger: "cron_mensual",
    conditions: ["contenido publicado supera la antigüedad configurada"],
    actions: ["detectar contenido antiguo", "notificar al responsable de contenido"],
    dataNeeded: ["fecha de última actualización por página", "umbral de antigüedad"],
    errorHandling: "si no se puede determinar la fecha, marcar para revisión manual en vez de omitir",
    idempotency: "clave idempotente = página+mes; un solo recordatorio por página y mes",
    logs: ["pagina", "antiguedad_dias", "resultado"],
    priority: "baja",
    qualitativeROI: "mantiene el contenido percibido como actualizado (señal de madurez digital)",
    recommendedImplementation: "proceso manual",
    futureIntegration: "none",
    testData: { pagina: "/servicios" },
    requiredModules: ["contenidos"],
  },
]);

/** Catálogo combinado: los 13 de Paso 11 + los 6 nuevos de Paso 12, sin duplicar ids. */
export const COMBINED_AUTOMATION_CATALOG = Object.freeze([...AUTOMATION_CATALOG, ...RESEARCH_AUTOMATION_ADDITIONS]);

// Qué dimensión de investigación, si sale mal, sugiere qué automatización(es) del catálogo combinado.
const AUTOMATION_TRIGGERS_BY_DIMENSION = Object.freeze({
  bookingCapability: ["confirmacion_reserva", "recordatorio_24h"],
  contactInfo: ["alta_cliente_bienvenida"],
  publicReputation: ["solicitud_resena"],
  reputationalRisk: ["ticket_soporte_incidencia"],
  customerSupport: ["ticket_soporte_incidencia"],
  salesFollowUp: ["seguimiento_comercial_lead"],
  retention: ["reactivacion_cliente_inactivo"],
  contentFreshness: ["actualizacion_contenido_programada"],
  visiblePrivacy: ["registro_consentimiento"],
  visibleCompliance: ["registro_consentimiento"],
  observableIntegrations: ["sincronizacion_datos_externos"],
  digitalMaturitySignal: ["reporting_periodico_kpis"],
});

/**
 * A partir de resultados de dimensión (score bajo = oportunidad),
 * recomienda automatizaciones concretas del catálogo combinado, sin
 * duplicados semánticos (un id de automatización aparece una sola vez
 * aunque varias dimensiones lo sugieran).
 */
export function recommendAutomationsFromFindings(dimensionResults) {
  const suggestedIds = new Set();
  for (const [dimensionId, result] of Object.entries(dimensionResults)) {
    if (result.score === null || result.score >= 70) continue;
    for (const automationId of AUTOMATION_TRIGGERS_BY_DIMENSION[dimensionId] ?? []) suggestedIds.add(automationId);
  }
  return [...suggestedIds]
    .map((id) => COMBINED_AUTOMATION_CATALOG.find((a) => a.id === id))
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));
}
