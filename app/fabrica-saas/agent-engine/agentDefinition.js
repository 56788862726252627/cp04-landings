// Agent Definition Model — ADV-03 Factory Agent Engine V1
// Modelo declarativo base para todos los agentes IA de la fábrica.

export const AGENT_TYPE = Object.freeze({
  CHAT:    'CHAT',
  SALES:   'SALES',
  SUPPORT: 'SUPPORT',
  BOOKING: 'BOOKING',
  LEAD:    'LEAD',
  VOICE:   'VOICE',
});

export const AGENT_STATUS = Object.freeze({
  DRAFT:     'DRAFT',
  ACTIVE:    'ACTIVE',
  PAUSED:    'PAUSED',
  ARCHIVED:  'ARCHIVED',
  TESTING:   'TESTING',
});

export const RISK_LEVEL = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export const CHANNEL = Object.freeze({
  WEB_CHAT:      'WEB_CHAT',
  WHATSAPP:      'WHATSAPP',
  EMAIL:         'EMAIL',
  SOCIAL_DM:     'SOCIAL_DM',
  VOICE:         'VOICE',
  INTERNAL_TOOL: 'INTERNAL_TOOL',
});

const REQUIRED_FIELDS = ['id', 'name', 'type', 'vertical', 'purpose'];

/**
 * Create a validated, frozen AgentDefinition.
 * All optional fields are defaulted to safe values.
 */
export function createAgentDefinition(params = {}) {
  const errors = [];
  for (const f of REQUIRED_FIELDS) {
    if (!params[f]) errors.push(`Missing required field: ${f}`);
  }
  if (params.type && !AGENT_TYPE[params.type]) errors.push(`Unknown agent type: ${params.type}`);
  if (params.status && !AGENT_STATUS[params.status]) errors.push(`Unknown status: ${params.status}`);
  if (params.channel && !CHANNEL[params.channel]) errors.push(`Unknown channel: ${params.channel}`);
  if (errors.length) return { valid: false, errors, definition: null };

  const definition = Object.freeze({
    id:              params.id,
    name:            params.name,
    type:            params.type,
    vertical:        params.vertical,
    clientProfile:   params.clientProfile      ?? null,
    purpose:         params.purpose,
    primaryGoal:     params.primaryGoal        ?? params.purpose,
    secondaryGoals:  Object.freeze(params.secondaryGoals ?? []),

    tone:                params.tone                ?? 'WARM_PROFESSIONAL',
    language:            params.language            ?? 'es',
    responseStyle:       params.responseStyle       ?? 'NATURAL',
    responseLengthPolicy: params.responseLengthPolicy ?? 'ADAPTIVE',

    conversationPolicy:  params.conversationPolicy  ?? 'GOAL_ORIENTED',
    salesPolicy:         params.salesPolicy          ?? 'CONSULTATIVE',
    trustPolicy:         params.trustPolicy          ?? 'HONEST_AND_HUMBLE',
    knowledgePolicy:     params.knowledgePolicy      ?? 'BUSINESS_SCOPED',
    memoryPolicy:        params.memoryPolicy         ?? 'SESSION',
    toolPolicy:          params.toolPolicy           ?? 'LEAST_PRIVILEGE',
    privacyPolicy:       params.privacyPolicy        ?? 'NO_SENSITIVE_LOG',
    escalationPolicy:    params.escalationPolicy     ?? 'ALWAYS_AVAILABLE',
    fallbackPolicy:      params.fallbackPolicy       ?? 'REDIRECT_HUMAN',
    evaluationPolicy:    params.evaluationPolicy     ?? 'STANDARD',

    channel:   params.channel   ?? CHANNEL.WEB_CHAT,
    riskLevel: params.riskLevel ?? RISK_LEVEL.MEDIUM,
    status:    params.status    ?? AGENT_STATUS.DRAFT,
    version:   params.version   ?? '1.0.0',

    meta: Object.freeze({
      createdAt: new Date().toISOString(),
      isReal:    false,
      dataType:  'AGENT_DEFINITION',
    }),
  });

  return { valid: true, errors: [], definition };
}

/**
 * Validate a definition object (post-creation check).
 */
export function validateAgentDefinition(def) {
  if (!def || typeof def !== 'object') return { valid: false, issues: ['Not an object'] };
  const issues = REQUIRED_FIELDS.filter(f => !def[f]).map(f => `Missing: ${f}`);
  return { valid: issues.length === 0, issues };
}

export const AGENT_DEFINITION_VERSION = '1.0.0';
