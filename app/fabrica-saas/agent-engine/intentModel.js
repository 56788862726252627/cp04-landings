// Intent Model — ADV-03
// Resolución determinista de intención. Sin LLM.

export const INTENT = Object.freeze({
  GREETING:        'GREETING',
  INFORMATION:     'INFORMATION',
  PRICE:           'PRICE',
  AVAILABILITY:    'AVAILABILITY',
  BOOKING:         'BOOKING',
  COMPLAINT:       'COMPLAINT',
  SUPPORT:         'SUPPORT',
  PURCHASE_INTENT: 'PURCHASE_INTENT',
  OBJECTION:       'OBJECTION',
  CANCELLATION:    'CANCELLATION',
  HUMAN_REQUEST:   'HUMAN_REQUEST',
  UNKNOWN:         'UNKNOWN',
});

const INTENT_PATTERNS = Object.freeze([
  { intent: INTENT.GREETING,        pattern: /\b(hola|buenos días|buenas tardes|buenas noches|hey|saludos|qué tal)\b/i },
  { intent: INTENT.HUMAN_REQUEST,   pattern: /\b(persona|humano|hablar con alguien|agente real|operador|con una persona)\b/i },
  { intent: INTENT.CANCELLATION,    pattern: /\b(cancelar|cancelación|anular|desistir|baja|dar de baja|quiero cancelar)\b/i },
  { intent: INTENT.COMPLAINT,       pattern: /\b(queja|reclamación|problema|error|mal|pésimo|terrible|decepcionado)\b/i },
  { intent: INTENT.BOOKING,         pattern: /\b(reservar|cita|reserva|agendar|turno|appointment|quiero reservar)\b/i },
  { intent: INTENT.AVAILABILITY,    pattern: /\b(disponible|disponibilidad|hueco|libre|hay sitio|cuando|cuándo|horario libre)\b/i },
  { intent: INTENT.PRICE,           pattern: /\b(precio|coste|costo|tarifa|cuánto cuesta|cuánto vale|cuánto es|importe)\b/i },
  { intent: INTENT.PURCHASE_INTENT, pattern: /\b(quiero contratar|quiero empezar|me apunto|me interesa|voy a empezar|contratar)\b/i },
  { intent: INTENT.OBJECTION,       pattern: /\b(pero|sin embargo|no sé si|no estoy seguro|es caro|no tengo tiempo|no lo veo)\b/i },
  { intent: INTENT.SUPPORT,         pattern: /\b(ayuda|soporte|no funciona|no puedo|problema técnico|error en)\b/i },
  { intent: INTENT.INFORMATION,     pattern: /\b(información|qué es|cómo funciona|explica|cuéntame|qué ofrecen|qué incluye)\b/i },
]);

/**
 * Resolve intent from a user message (deterministic, regex-based).
 * Returns the first confident match or UNKNOWN.
 */
export function resolveIntent(message = '') {
  if (!message || typeof message !== 'string') {
    return intentResult(INTENT.UNKNOWN, 0.0, 'empty_input');
  }

  const normalized = message.trim().toLowerCase();
  if (normalized.length === 0) return intentResult(INTENT.UNKNOWN, 0.0, 'empty_input');

  for (const { intent, pattern } of INTENT_PATTERNS) {
    if (pattern.test(normalized)) {
      return intentResult(intent, 0.85, 'pattern_match');
    }
  }

  // Fallback heuristics
  if (normalized.split(' ').length <= 2) {
    return intentResult(INTENT.INFORMATION, 0.4, 'short_message_fallback');
  }

  return intentResult(INTENT.UNKNOWN, 0.0, 'no_match');
}

function intentResult(intent, confidence, reason) {
  return Object.freeze({ intent, confidence, reason });
}

/**
 * Detect if message contains multiple intents.
 */
export function detectMultipleIntents(message = '') {
  if (!message) return Object.freeze([]);
  const found = [];
  const normalized = message.toLowerCase();
  for (const { intent, pattern } of INTENT_PATTERNS) {
    if (pattern.test(normalized)) found.push(intent);
  }
  return Object.freeze(found);
}

export const INTENT_MODEL_VERSION = '1.0.0';
