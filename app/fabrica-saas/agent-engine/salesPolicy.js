// Sales Consulting Policy — ADV-03
// Principio: CONSULTATIVE_SELLING — sin presión, sin manipulación.

export const SALES_STAGE = Object.freeze({
  DISCOVERY:        'DISCOVERY',
  QUALIFICATION:    'QUALIFICATION',
  PAIN_ID:          'PAIN_ID',
  VALUE_FRAMING:    'VALUE_FRAMING',
  OBJECTION:        'OBJECTION',
  RISK_REDUCTION:   'RISK_REDUCTION',
  SOCIAL_PROOF:     'SOCIAL_PROOF',
  NEXT_BEST_ACTION: 'NEXT_BEST_ACTION',
  CLOSE:            'CLOSE',
});

export const CLOSING_STYLE = Object.freeze({
  SOFT_INVITATION: 'SOFT_INVITATION',
  QUESTION_CLOSE:  'QUESTION_CLOSE',
  SUMMARY_CLOSE:   'SUMMARY_CLOSE',
  NEXT_STEP_CLOSE: 'NEXT_STEP_CLOSE',
});

export const SALES_PROHIBITIONS = Object.freeze([
  'NO_PRESSURE',
  'NO_MANIPULATION',
  'NO_FALSE_URGENCY',
  'NO_UNVERIFIED_CLAIMS',
  'NO_AGGRESSIVE_CLOSE',
  'NO_IGNORING_NO',
  'NO_FEAR_TACTICS',
  'NO_GUILT_TRIP',
]);

const DISCOVERY_QUESTIONS = Object.freeze([
  '¿Qué te ha llevado a buscar esta solución ahora?',
  '¿Qué es lo más importante para ti en este proceso?',
  '¿Has tenido experiencia previa con algo similar?',
  '¿Hay algo que te preocupa especialmente?',
]);

const VALUE_FRAMES = Object.freeze({
  quality:     'El resultado que obtienes justifica la inversión.',
  convenience: 'Te ahorra tiempo y problemas.',
  trust:       'Trabajamos con garantías claras y sin letra pequeña.',
  results:     'Nuestros clientes ven resultados concretos.',
});

/**
 * Create a SalesConsultingPolicy for an agent.
 */
export function createSalesPolicy(overrides = {}) {
  const policy = Object.freeze({
    principle:         'CONSULTATIVE_SELLING',
    stages:            Object.freeze(Object.values(SALES_STAGE)),
    prohibitions:      SALES_PROHIBITIONS,
    closingStyle:      overrides.closingStyle      ?? CLOSING_STYLE.SOFT_INVITATION,
    discoveryQuestions: overrides.discoveryQuestions ?? DISCOVERY_QUESTIONS,
    valueFrames:       overrides.valueFrames        ?? VALUE_FRAMES,

    discovery: Object.freeze({
      listenFirst:     true,
      askOneQuestion:  true,
      noInterruptions: true,
    }),

    qualification: Object.freeze({
      fitSignals:    Object.freeze(['budget alignment', 'decision authority', 'urgency', 'fit to service']),
      disqualifyIf:  Object.freeze(['no fit', 'out of scope', 'resource mismatch']),
    }),

    objectionHandling: Object.freeze({
      acknowledge: true,
      clarify:     true,
      reframe:     true,
      doNotArgue:  true,
    }),

    socialProof: Object.freeze({
      onlyVerified:  true,
      noInvented:    true,
      contextual:    true,
    }),

    nextBestAction: Object.freeze({
      alwaysPropose: true,
      onlyOneAction: true,
      respectDecision: true,
    }),

    disclaimer: 'Sales policy PROHIBITS pressure, manipulation and unverified claims.',
    version:    '1.0.0',
  });

  return { valid: true, policy };
}

export const SALES_POLICY_VERSION = '1.0.0';
