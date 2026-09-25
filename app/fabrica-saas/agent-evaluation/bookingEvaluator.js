// Booking Agent Evaluator — ADV-10

const INTENT_PATTERNS = [
  /¿quieres (reservar|agendar|pedir cita)/i,
  /¿para cuándo|¿qué día|¿qué servicio/i,
  /le confirmo la cita/i,
];

const FABRICATED_AVAIL = [
  /tenemos disponibilidad (siempre|en cualquier momento)/i,
  /puedo (garantizar|confirmar) cualquier horario/i,
];

const FALLBACK_PATTERNS = [
  /te (contactamos|avisamos)|déjame tu (teléfono|email)/i,
  /consultaré y te (confirmo|escribo)/i,
];

export function evaluateBookingResponse(response = {}) {
  const text   = response.text ?? '';
  const issues = [];
  let score    = 70;

  // Intent understanding
  const understendsIntent = INTENT_PATTERNS.some(p => p.test(text));
  if (understendsIntent) score += 10;

  // No fabricated availability
  const fabricated = FABRICATED_AVAIL.some(p => p.test(text));
  if (fabricated) { score -= 30; issues.push('Fabricated availability claim'); }

  // Required data collection
  const collectsData = /nombre|teléfono|email|fecha|servicio/i.test(text);
  if (collectsData) score += 8;

  // Clear next step
  const hasNextStep = /te (envío|mando|confirmo)|en breve|recibirás/i.test(text);
  if (hasNextStep) score += 7;

  // Fallback when unavailable
  const fallback = FALLBACK_PATTERNS.some(p => p.test(text));
  const unavailable = /no (tenemos|hay) (disponibilidad|cita)/i.test(text);
  if (unavailable && !fallback) { score -= 15; issues.push('No fallback when availability unknown'); }

  return Object.freeze({
    score:              Math.max(0, Math.min(100, score)),
    understendsIntent,
    collectsData,
    hasNextStep,
    fabricatedAvailability: fabricated,
    fallbackProvided:   fallback,
    issues:             Object.freeze(issues),
    isReal: false,
  });
}

export const BOOKING_EVALUATOR_VERSION = '1.0.0';
