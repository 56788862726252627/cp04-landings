// Agent Archetypes — ADV-03
// Arquetipos reutilizables. CORE + vertical overrides. Sin duplicar configuración.

export const ARCHETYPE_ID = Object.freeze({
  RECEPTION:         'RECEPTION',
  SALES:             'SALES',
  SUPPORT:           'SUPPORT',
  BOOKING:           'BOOKING',
  LEAD_QUALIFICATION:'LEAD_QUALIFICATION',
  VOICE_RECEPTION:   'VOICE_RECEPTION',
});

const CORE_CONFIG = Object.freeze({
  language:          'es',
  memoryPolicy:      'SESSION',
  escalationPolicy:  'ALWAYS_AVAILABLE',
  trustPolicy:       'HONEST_AND_HUMBLE',
  privacyPolicy:     'NO_SENSITIVE_LOG',
  evaluationPolicy:  'STANDARD',
  fallbackPolicy:    'REDIRECT_HUMAN',
});

const ARCHETYPES = Object.freeze({
  [ARCHETYPE_ID.RECEPTION]: Object.freeze({
    ...CORE_CONFIG,
    type:              'CHAT',
    name:              'Agente de Recepción',
    purpose:           'Dar la bienvenida, responder preguntas frecuentes y orientar al usuario',
    tone:              'WARM_PROFESSIONAL',
    channel:           'WEB_CHAT',
    riskLevel:         'LOW',
    salesPolicy:       'NONE',
    toolPolicy:        'READ_ONLY',
    responseLengthPolicy: 'ADAPTIVE',
  }),
  [ARCHETYPE_ID.SALES]: Object.freeze({
    ...CORE_CONFIG,
    type:              'SALES',
    name:              'Agente de Ventas Consultivo',
    purpose:           'Comprender necesidad y conectar con valor real. Sin presión.',
    tone:              'CONSULTATIVE',
    channel:           'WEB_CHAT',
    riskLevel:         'MEDIUM',
    salesPolicy:       'CONSULTATIVE',
    toolPolicy:        'READ_CRM_WRITE_LOG',
    responseLengthPolicy: 'ADAPTIVE',
  }),
  [ARCHETYPE_ID.SUPPORT]: Object.freeze({
    ...CORE_CONFIG,
    type:              'SUPPORT',
    name:              'Agente de Soporte',
    purpose:           'Resolver problemas con claridad. Escalar cuando no proceda.',
    tone:              'CALM',
    channel:           'WEB_CHAT',
    riskLevel:         'MEDIUM',
    salesPolicy:       'NONE',
    toolPolicy:        'READ_CRM_LOG',
    responseLengthPolicy: 'ADAPTIVE',
  }),
  [ARCHETYPE_ID.BOOKING]: Object.freeze({
    ...CORE_CONFIG,
    type:              'BOOKING',
    name:              'Agente de Reservas',
    purpose:           'Facilitar reservas de forma natural, sin fricción.',
    tone:              'WARM_PROFESSIONAL',
    channel:           'WEB_CHAT',
    riskLevel:         'MEDIUM',
    salesPolicy:       'SOFT',
    toolPolicy:        'BOOKING_TOOLS',
    responseLengthPolicy: 'SHORT_BIAS',
  }),
  [ARCHETYPE_ID.LEAD_QUALIFICATION]: Object.freeze({
    ...CORE_CONFIG,
    type:              'LEAD',
    name:              'Agente de Cualificación de Leads',
    purpose:           'Cualificar el interés real antes de derivar al equipo comercial.',
    tone:              'CONSULTATIVE',
    channel:           'WEB_CHAT',
    riskLevel:         'LOW',
    salesPolicy:       'CONSULTATIVE',
    toolPolicy:        'WRITE_CRM_LOG',
    responseLengthPolicy: 'ADAPTIVE',
  }),
  [ARCHETYPE_ID.VOICE_RECEPTION]: Object.freeze({
    ...CORE_CONFIG,
    type:              'VOICE',
    name:              'Agente de Recepción Telefónica',
    purpose:           'Gestionar llamadas de forma natural. Derivar cuando sea necesario.',
    tone:              'DIRECT',
    channel:           'VOICE',
    riskLevel:         'LOW',
    salesPolicy:       'NONE',
    toolPolicy:        'READ_ONLY',
    responseLengthPolicy: 'VERY_SHORT',
  }),
});

/**
 * Get an archetype definition.
 */
export function getArchetype(archetypeId) {
  const archetype = ARCHETYPES[archetypeId];
  if (!archetype) return { valid: false, error: `Unknown archetype: ${archetypeId}` };
  return { valid: true, archetypeId, archetype };
}

/**
 * Apply vertical overrides to an archetype.
 * Returns merged config without mutating the original.
 */
export function applyVerticalToArchetype(archetypeId, verticalOverrides = {}) {
  const { valid, archetype, error } = getArchetype(archetypeId);
  if (!valid) return { valid: false, error };
  const merged = Object.freeze({ ...archetype, ...verticalOverrides, archetypeId, isReal: false });
  return { valid: true, merged };
}

export const AGENT_ARCHETYPES = ARCHETYPES;
export const ARCHETYPES_VERSION = '1.0.0';
