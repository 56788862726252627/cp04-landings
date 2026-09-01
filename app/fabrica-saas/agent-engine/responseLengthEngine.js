// Response Length Engine — ADV-03
// determineResponseLength(): devuelve la longitud apropiada para cada respuesta.

export const RESPONSE_LENGTH = Object.freeze({
  VERY_SHORT: 'VERY_SHORT',  // ≤20 words — ack, yes/no, confirmación
  SHORT:      'SHORT',       // 20-60 words — respuesta directa a pregunta simple
  NORMAL:     'NORMAL',      // 60-120 words — explicación con contexto
  DETAILED:   'DETAILED',    // 120-300 words — guía, comparación, escenario complejo
});

export const COMPLEXITY = Object.freeze({
  SIMPLE:   'SIMPLE',
  MODERATE: 'MODERATE',
  COMPLEX:  'COMPLEX',
});

export const URGENCY = Object.freeze({
  LOW:    'LOW',
  NORMAL: 'NORMAL',
  HIGH:   'HIGH',
});

export const CONVERSATION_STAGE = Object.freeze({
  GREETING:      'GREETING',
  DISCOVERY:     'DISCOVERY',
  QUALIFICATION: 'QUALIFICATION',
  VALUE:         'VALUE',
  OBJECTION:     'OBJECTION',
  DECISION:      'DECISION',
  ACTION:        'ACTION',
  FOLLOW_UP:     'FOLLOW_UP',
  CLOSED:        'CLOSED',
});

/**
 * Determine appropriate response length.
 *
 * params: {
 *   userMessageLength      — word count of user message
 *   questionComplexity     — SIMPLE | MODERATE | COMPLEX
 *   urgency                — LOW | NORMAL | HIGH
 *   channel                — WEB_CHAT | WHATSAPP | VOICE | EMAIL | SOCIAL_DM
 *   conversationStage      — GREETING | DISCOVERY | ... | CLOSED
 *   userPreference         — 'BRIEF' | 'DETAILED' | null
 *   clarificationNeeded    — boolean
 * }
 */
export function determineResponseLength(params = {}) {
  const {
    userMessageLength     = 10,
    questionComplexity    = COMPLEXITY.SIMPLE,
    urgency               = URGENCY.NORMAL,
    channel               = 'WEB_CHAT',
    conversationStage     = CONVERSATION_STAGE.DISCOVERY,
    userPreference        = null,
    clarificationNeeded   = false,
  } = params;

  // Voice: always short
  if (channel === 'VOICE') return result(RESPONSE_LENGTH.SHORT, 'voice_short_rule');

  // Explicit user preference overrides
  if (userPreference === 'BRIEF')   return result(RESPONSE_LENGTH.SHORT, 'user_prefers_brief');
  if (userPreference === 'DETAILED') return result(RESPONSE_LENGTH.DETAILED, 'user_prefers_detailed');

  // WhatsApp: bias toward short
  const whatsappPenalty = channel === 'WHATSAPP' ? -1 : 0;

  // Urgency: high urgency → shorter
  const urgencyAdjust = urgency === URGENCY.HIGH ? -1 : urgency === URGENCY.LOW ? 0 : 0;

  // Very short message + simple question → very short
  if (userMessageLength <= 5 && questionComplexity === COMPLEXITY.SIMPLE && !clarificationNeeded) {
    return result(RESPONSE_LENGTH.VERY_SHORT, 'short_message_simple_q');
  }

  // Clarification needed → short question back
  if (clarificationNeeded) return result(RESPONSE_LENGTH.SHORT, 'clarification_needed');

  // Stage-based baseline
  const stageScore = {
    [CONVERSATION_STAGE.GREETING]:      1,
    [CONVERSATION_STAGE.DISCOVERY]:     2,
    [CONVERSATION_STAGE.QUALIFICATION]: 2,
    [CONVERSATION_STAGE.VALUE]:         3,
    [CONVERSATION_STAGE.OBJECTION]:     3,
    [CONVERSATION_STAGE.DECISION]:      2,
    [CONVERSATION_STAGE.ACTION]:        1,
    [CONVERSATION_STAGE.FOLLOW_UP]:     2,
    [CONVERSATION_STAGE.CLOSED]:        1,
  }[conversationStage] ?? 2;

  const complexityScore = {
    [COMPLEXITY.SIMPLE]:   0,
    [COMPLEXITY.MODERATE]: 1,
    [COMPLEXITY.COMPLEX]:  2,
  }[questionComplexity] ?? 0;

  const rawScore = Math.max(0,
    Math.min(3, stageScore + complexityScore - 1 + whatsappPenalty + urgencyAdjust)
  );

  const lengths = [RESPONSE_LENGTH.VERY_SHORT, RESPONSE_LENGTH.SHORT, RESPONSE_LENGTH.NORMAL, RESPONSE_LENGTH.DETAILED];
  return result(lengths[rawScore], 'computed');
}

function result(length, reason) {
  const guidelines = {
    [RESPONSE_LENGTH.VERY_SHORT]: { maxWords: 20,  hint: 'One sentence. Direct answer.' },
    [RESPONSE_LENGTH.SHORT]:      { maxWords: 60,  hint: 'Two to three sentences. No padding.' },
    [RESPONSE_LENGTH.NORMAL]:     { maxWords: 120, hint: 'One short paragraph. Context + answer.' },
    [RESPONSE_LENGTH.DETAILED]:   { maxWords: 300, hint: 'Structured explanation. Use prose over lists.' },
  };
  return Object.freeze({
    length,
    reason,
    ...guidelines[length],
    disclaimer: 'LLM adapts within this guidance.',
  });
}

export const RESPONSE_LENGTH_ENGINE_VERSION = '1.0.0';
