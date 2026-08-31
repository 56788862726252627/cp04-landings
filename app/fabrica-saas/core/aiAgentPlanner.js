/**
 * AI Agent Planner — Phase 10
 * Declares AI agents for the business. No real API connections.
 * Uses AI Router for tier selection. All agents are sandboxed by policy.
 */

export const AI_AGENT_PLANNER_VERSION = '1.0.0';

const MODEL_TIERS = Object.freeze({
  T0: { id: 'T0', label: 'Registry Lookup', aiCallNeeded: false, cost: 'zero' },
  T1: { id: 'T1', label: 'Haiku Fast',      model: 'claude-haiku-4-5', cost: 'micro' },
  T2: { id: 'T2', label: 'Sonnet Standard', model: 'claude-sonnet-4-6', cost: 'low' },
  T3: { id: 'T3', label: 'Sonnet Extended', model: 'claude-sonnet-4-6', cost: 'medium' },
  T4: { id: 'T4', label: 'Opus Advanced',   model: 'claude-opus-4-8',   cost: 'high' },
});

const RISK_TIERS = Object.freeze({
  low:    { humanEscalation: false, maxTurns: 20, timeoutMs: 30000 },
  medium: { humanEscalation: true,  maxTurns: 10, timeoutMs: 20000 },
  high:   { humanEscalation: true,  maxTurns: 5,  timeoutMs: 10000 },
});

// ─── Sector AI Profiles ───────────────────────────────────────────────────────

const SECTOR_AI_PROFILES = Object.freeze({
  dental: {
    agents: ['appointment-assistant', 'faq-responder'],
    forbiddenActions: ['diagnose', 'prescribe', 'medical-advice', 'guarantee-results'],
    riskTier: 'medium',
    healthcareMode: true,
  },
  salud: {
    agents: ['appointment-assistant', 'faq-responder'],
    forbiddenActions: ['diagnose', 'prescribe', 'medical-advice', 'emergency-response'],
    riskTier: 'high',
    healthcareMode: true,
  },
  fisio: {
    agents: ['appointment-assistant', 'exercise-guide', 'faq-responder'],
    forbiddenActions: ['diagnose', 'prescribe', 'medical-advice'],
    riskTier: 'medium',
    healthcareMode: true,
  },
  estetica: {
    agents: ['appointment-assistant', 'service-recommender'],
    forbiddenActions: ['medical-advice', 'diagnose'],
    riskTier: 'low',
    healthcareMode: false,
  },
  tech: {
    agents: ['support-assistant', 'onboarding-guide', 'faq-responder'],
    forbiddenActions: ['execute-code', 'modify-system'],
    riskTier: 'low',
    healthcareMode: false,
  },
  educacion: {
    agents: ['learning-assistant', 'faq-responder'],
    forbiddenActions: ['complete-assignments', 'impersonate-teacher'],
    riskTier: 'low',
    healthcareMode: false,
  },
  legal: {
    agents: ['faq-responder', 'intake-assistant'],
    forbiddenActions: ['legal-advice', 'case-prediction', 'represent-client'],
    riskTier: 'high',
    healthcareMode: false,
  },
  veterinary: {
    agents: ['appointment-assistant', 'pet-care-guide', 'vaccination-reminder', 'faq-responder'],
    forbiddenActions: ['diagnose', 'prescribe-medication', 'emergency-response', 'medical-advice'],
    riskTier: 'medium',
    healthcareMode: true,
  },
  default: {
    agents: ['appointment-assistant', 'faq-responder'],
    forbiddenActions: ['medical-advice', 'legal-advice', 'financial-advice'],
    riskTier: 'low',
    healthcareMode: false,
  },
});

// ─── Agent Templates ──────────────────────────────────────────────────────────

const AGENT_TEMPLATES = Object.freeze({
  'appointment-assistant': {
    purpose: 'Help users book, modify, or cancel appointments',
    allowedTools: ['check_availability', 'create_booking_intent', 'read_services', 'read_schedule'],
    modelTier: 'T1',
    memoryPolicy: 'session_only',
    privacyPolicy: 'no_personal_data_stored',
    fallback: 'Disculpa, no puedo gestionar esta solicitud. Por favor llama o escribe al centro.',
  },
  'faq-responder': {
    purpose: 'Answer common questions about services, pricing, and policies',
    allowedTools: ['read_faq', 'read_services', 'read_schedule'],
    modelTier: 'T0',
    memoryPolicy: 'none',
    privacyPolicy: 'stateless',
    fallback: 'Para más información, contacta directamente con el equipo.',
  },
  'pet-care-guide': {
    purpose: 'Provide general pet care information and guidance (not medical diagnosis)',
    allowedTools: ['read_pet_care_db', 'read_faq'],
    modelTier: 'T1',
    memoryPolicy: 'session_only',
    privacyPolicy: 'no_personal_data_stored',
    fallback: 'Para consultas médicas de tu mascota, contacta con el veterinario.',
  },
  'vaccination-reminder': {
    purpose: 'Remind owners of upcoming vaccinations based on pet records',
    allowedTools: ['read_vaccination_schedule', 'read_pet_records'],
    modelTier: 'T0',
    memoryPolicy: 'session_only',
    privacyPolicy: 'read_only',
    fallback: 'Consulta con el veterinario para el calendario de vacunas.',
  },
  'service-recommender': {
    purpose: 'Recommend appropriate services based on client needs',
    allowedTools: ['read_services', 'read_catalog'],
    modelTier: 'T1',
    memoryPolicy: 'session_only',
    privacyPolicy: 'no_personal_data_stored',
    fallback: 'El equipo puede asesorarte personalmente sobre los mejores servicios.',
  },
  'exercise-guide': {
    purpose: 'Provide general exercise information (not physiotherapy prescription)',
    allowedTools: ['read_exercise_library'],
    modelTier: 'T0',
    memoryPolicy: 'none',
    privacyPolicy: 'stateless',
    fallback: 'Tu fisioterapeuta es la mejor guía para un plan personalizado.',
  },
  'support-assistant': {
    purpose: 'Help users with technical support and onboarding',
    allowedTools: ['read_docs', 'read_faq', 'create_ticket'],
    modelTier: 'T1',
    memoryPolicy: 'session_only',
    privacyPolicy: 'no_personal_data_stored',
    fallback: 'El equipo de soporte responderá en breve.',
  },
  'learning-assistant': {
    purpose: 'Help students with course navigation and study guidance',
    allowedTools: ['read_courses', 'read_materials'],
    modelTier: 'T1',
    memoryPolicy: 'session_only',
    privacyPolicy: 'no_personal_data_stored',
    fallback: 'El tutor puede resolver cualquier duda directamente.',
  },
  'intake-assistant': {
    purpose: 'Gather initial information from potential clients (no legal advice)',
    allowedTools: ['create_intake_form', 'read_services'],
    modelTier: 'T1',
    memoryPolicy: 'session_only',
    privacyPolicy: 'gdpr_compliant',
    fallback: 'Un abogado del equipo te contactará pronto.',
  },
  'onboarding-guide': {
    purpose: 'Guide new users through product setup and first use',
    allowedTools: ['read_docs', 'read_onboarding_flow'],
    modelTier: 'T0',
    memoryPolicy: 'none',
    privacyPolicy: 'stateless',
    fallback: 'El equipo de onboarding te ayudará a comenzar.',
  },
});

/**
 * Plan AI agents for a business.
 * @param {Object} brief   - validated brief
 * @param {Object} profile - business profile
 * @returns {Object} aiAgentPlan
 */
export function planAIAgents(brief = {}, profile = {}) {
  const sector   = brief.sector ?? profile.sector ?? 'default';
  const aiNeeds  = brief.aiNeeds ?? [];
  const sectorProfile = SECTOR_AI_PROFILES[sector] ?? SECTOR_AI_PROFILES.default;

  // Determine which agents to plan
  const agentIds = aiNeeds.length > 0
    ? [...new Set([...sectorProfile.agents, ...aiNeeds])]
    : sectorProfile.agents;

  const riskConfig = RISK_TIERS[sectorProfile.riskTier] ?? RISK_TIERS.low;

  const agents = agentIds.map(agentId => {
    const template = AGENT_TEMPLATES[agentId] ?? {
      purpose: `${agentId} agent`,
      allowedTools: [],
      modelTier: 'T1',
      memoryPolicy: 'session_only',
      privacyPolicy: 'no_personal_data_stored',
      fallback: 'Por favor contacta con el equipo directamente.',
    };

    return {
      id:               agentId,
      purpose:          template.purpose,
      allowedTools:     template.allowedTools,
      forbiddenActions: sectorProfile.forbiddenActions,
      modelTier:        MODEL_TIERS[template.modelTier],
      riskTier:         sectorProfile.riskTier,
      humanEscalation:  riskConfig.humanEscalation,
      maxTurns:         riskConfig.maxTurns,
      memoryPolicy:     template.memoryPolicy,
      privacyPolicy:    template.privacyPolicy,
      fallbackMessage:  template.fallback,
      healthcareMode:   sectorProfile.healthcareMode,
      productionStatus: 'DEMO_STUB',
      realApiConnected: false,
    };
  });

  return {
    totalAgents:    agents.length,
    agents,
    sectorRiskTier: sectorProfile.riskTier,
    healthcareMode: sectorProfile.healthcareMode,
    globalForbiddenActions: [...sectorProfile.forbiddenActions],
    productionStatus: 'DEMO_ONLY — no real API connected',
    plannerVersion: AI_AGENT_PLANNER_VERSION,
  };
}
