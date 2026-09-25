/**
 * Diagnostic Engine
 * Analyzes a business onboarding to produce a structured diagnostic.
 * Deterministic. No LLM.
 */

export const DIAGNOSTIC_ENGINE_VERSION = '1.0.0';

/**
 * @param {Object} onboarding - validated onboarding (from validateOnboarding)
 * @returns {Object} DiagnosticResult
 */
export function diagnoseBusiness(onboarding = {}) {
  const data = onboarding.data ?? onboarding;

  const problems           = [];
  const opportunities      = [];
  const quickWins          = [];
  const mediumTerm         = [];
  const deferredItems      = [];
  const risks              = [];
  const unknowns           = [];
  const automationOpps     = [];
  const aiOpportunities    = [];
  const integrationOpps    = [];

  // --- Current situation ---
  const currentSituation = {
    sector:           data.sector ?? data._inferredSector ?? 'unknown',
    teamSize:         data.teamSize ?? 'unknown',
    locationsCount:   data.locationsCount ?? 1,
    hasWebsite:       !!data.website,
    hasCurrentCRM:    !!data.currentCRM && data.currentCRM !== 'none',
    hasAutomations:   (data.currentAutomations ?? []).length > 0,
    hasAI:            (data.currentAI ?? []).length > 0,
    tools:            data.currentTools ?? [],
    channels:         data.requiredChannels ?? [],
  };

  // --- Pain points ---
  const mainProblems = Array.isArray(data.mainProblems)
    ? data.mainProblems
    : data.mainProblems ? [data.mainProblems] : [];

  const painPoints = [...mainProblems];

  // Infer additional pain points from context
  if (!currentSituation.hasCurrentCRM) {
    painPoints.push('Sin CRM: gestión de clientes manual o en hojas de cálculo');
    problems.push({ id: 'no_crm', severity: 'HIGH', description: 'Sin CRM estructurado', impact: 'Pérdida de información, seguimiento manual' });
  }
  if (!currentSituation.hasAutomations) {
    painPoints.push('Sin automatizaciones: procesos repetitivos manuales');
    problems.push({ id: 'no_automation', severity: 'MEDIUM', description: 'Procesos manuales repetitivos', impact: 'Tiempo perdido, errores humanos' });
  }
  if (!currentSituation.hasWebsite) {
    painPoints.push('Sin presencia web profesional');
    problems.push({ id: 'no_website', severity: 'MEDIUM', description: 'Sin presencia digital', impact: 'Pérdida de clientes potenciales online' });
  }
  if (currentSituation.locationsCount > 1 && !currentSituation.hasCurrentCRM) {
    problems.push({ id: 'multi_location_no_system', severity: 'HIGH', description: 'Múltiples sedes sin sistema centralizado', impact: 'Datos fragmentados, coordinación difícil' });
  }

  // --- Manual work identification ---
  const manualWork = [];
  if (!currentSituation.hasAutomations) {
    manualWork.push('Confirmaciones de cita/reserva manuales');
    manualWork.push('Recordatorios enviados manualmente');
  }
  if (!currentSituation.hasCurrentCRM) {
    manualWork.push('Registro de clientes en Excel o papel');
    manualWork.push('Historial de cliente sin centralizar');
  }

  // --- Automation opportunities ---
  automationOpps.push('Confirmación automática de citas por email');
  automationOpps.push('Recordatorio 24h antes de la cita');
  if (data.requiredChannels?.includes('whatsapp')) {
    automationOpps.push('Notificaciones por WhatsApp Business');
  }
  if ((data.services ?? []).length > 3) {
    automationOpps.push('Workflow de bienvenida a nuevos clientes');
  }

  // --- AI opportunities ---
  if ((data.services ?? []).length > 2) {
    aiOpportunities.push('Asistente FAQ para preguntas frecuentes sobre servicios');
  }
  aiOpportunities.push('Asistente de reservas en lenguaje natural');
  if (data.legalConstraints?.healthData) {
    aiOpportunities.push('Resumen de historial clínico (requiere revisión humana)');
  }

  // --- Integration opportunities ---
  if (data.integrationNeeds) {
    integrationOpps.push(...(Array.isArray(data.integrationNeeds) ? data.integrationNeeds : [data.integrationNeeds]));
  }
  integrationOpps.push('Google Calendar sync');

  // --- Data fragmentation ---
  const dataFragmentation = [];
  if (currentSituation.tools.length > 2) {
    dataFragmentation.push(`Datos dispersos en ${currentSituation.tools.length} herramientas`);
  }

  // --- Customer experience gaps ---
  const customerExperienceGaps = [];
  if (!currentSituation.hasWebsite) {
    customerExperienceGaps.push('Sin landing page profesional');
  }
  customerExperienceGaps.push('Sin sistema de reservas online 24/7');

  // --- Opportunities ---
  opportunities.push({ id: 'digital_presence', type: 'STRATEGIC', description: 'Landing page + reservas online → captación pasiva', priority: 'HIGH' });
  opportunities.push({ id: 'automation_savings', type: 'EFFICIENCY', description: 'Automatizar confirmaciones → -2h/semana trabajo manual', priority: 'HIGH' });
  if (aiOpportunities.length > 0) {
    opportunities.push({ id: 'ai_assistant', type: 'GROWTH', description: 'Asistente IA → respuesta 24/7 sin coste por interacción', priority: 'MEDIUM' });
  }

  // --- Quick wins ---
  quickWins.push({ action: 'Landing page con formulario de reserva', effort: 'LOW', impact: 'HIGH' });
  quickWins.push({ action: 'Confirmación automática de cita', effort: 'LOW', impact: 'HIGH' });

  // --- Medium term ---
  mediumTerm.push({ action: 'Panel de administración completo', effort: 'MEDIUM', impact: 'HIGH' });
  mediumTerm.push({ action: 'Historial de cliente centralizado', effort: 'MEDIUM', impact: 'HIGH' });
  if (aiOpportunities.length > 0) {
    mediumTerm.push({ action: 'Chatbot IA para FAQ y reservas', effort: 'MEDIUM', impact: 'MEDIUM' });
  }

  // --- Deferred ---
  if (currentSituation.locationsCount > 1) {
    deferredItems.push({ action: 'Multi-sede avanzado', reason: 'Complejidad alta, implementar en fase 2' });
  }

  // --- Risks ---
  if (data.legalConstraints?.healthData) {
    risks.push({ id: 'health_data_compliance', severity: 'HIGH', description: 'Datos de salud requieren GDPR compliance reforzado' });
  }
  if (data.legalConstraints?.minorsPolicy) {
    risks.push({ id: 'minors_policy', severity: 'MEDIUM', description: 'Política de menores requiere revisión legal' });
  }
  if (!data.decisionMaker) {
    risks.push({ id: 'no_decision_maker', severity: 'MEDIUM', description: 'Sin decision maker identificado — aprobación bloqueada' });
  }

  // --- Unknowns ---
  if (!data.dataSources) unknowns.push('Fuentes de datos actuales no especificadas');
  if (!data.budgetRange) unknowns.push('Presupuesto no confirmado');

  const priorities = [
    'Presencia digital profesional (landing + booking)',
    'Automatización de recordatorios y confirmaciones',
    'Centralización de datos de clientes',
  ];

  return {
    currentSituation,
    painPoints,
    manualWork,
    duplicatedWork:         manualWork.filter(w => w.includes('manual')),
    bottlenecks:            problems.filter(p => p.severity === 'HIGH'),
    customerExperienceGaps,
    dataFragmentation,
    automationOpportunities: automationOpps,
    aiOpportunities,
    integrationOpportunities: integrationOpps,
    securityRisks:          [],
    privacyRisks:           risks.filter(r => r.description.toLowerCase().includes('gdpr') || r.description.toLowerCase().includes('dato')),
    commercialOpportunities: opportunities,

    diagnosticSummary: `Negocio en sector ${currentSituation.sector} con ${problems.length} problemas identificados, ${opportunities.length} oportunidades de mejora y ${risks.length} riesgos a gestionar.`,
    problems,
    opportunities,
    priorities,
    quickWins,
    mediumTerm,
    deferredItems,
    risks,
    unknowns,
    version: DIAGNOSTIC_ENGINE_VERSION,
  };
}
