// Grounding Evaluator — ADV-10

export const GROUNDING_STATUS = Object.freeze({
  GROUNDED:    'GROUNDED',
  PARTIAL:     'PARTIAL',
  UNSUPPORTED: 'UNSUPPORTED',
  FABRICATED:  'FABRICATED',
});

// Fabrication signals: specific numbers/guarantees with no context
const FABRICATION_PATTERNS = [
  /garantizo que/i,
  /disponibilidad garantizada/i,
  /\d{1,4}€\s*(al mes|mensuales|por sesión)/,
  /siempre (disponemos|tenemos) (cita|plaza)/i,
];

const UNSUPPORTED_PATTERNS = [
  /somos (el mejor|los mejores|número 1)/i,
  /nunca (fallamos|tenemos problemas)/i,
];

export function evaluateGrounding(response = {}) {
  const text    = response.text ?? '';
  const context = response.context ?? {};
  const hasContext = Object.keys(context).length > 0;

  for (const p of FABRICATION_PATTERNS) {
    if (p.test(text)) {
      return Object.freeze({
        status: GROUNDING_STATUS.FABRICATED,
        score: 10,
        isCritical: true,
        note: 'Response contains fabricated or unsupported specific claim',
        isReal: false,
      });
    }
  }

  for (const p of UNSUPPORTED_PATTERNS) {
    if (p.test(text)) {
      return Object.freeze({
        status: GROUNDING_STATUS.UNSUPPORTED,
        score: 45,
        isCritical: false,
        note: 'Unsupported marketing claim',
        isReal: false,
      });
    }
  }

  if (!hasContext && text.length > 50) {
    return Object.freeze({ status: GROUNDING_STATUS.PARTIAL, score: 65, isCritical: false, note: 'No context provided', isReal: false });
  }

  return Object.freeze({ status: GROUNDING_STATUS.GROUNDED, score: 95, isCritical: false, note: '', isReal: false });
}

export const GROUNDING_EVALUATOR_VERSION = '1.0.0';
