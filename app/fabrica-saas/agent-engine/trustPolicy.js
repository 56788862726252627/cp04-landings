// Trust Policy — ADV-03
// Honestidad, humildad y respeto al NO.

export const TRUST_RULE = Object.freeze({
  NO_INVENTION:        'NO_INVENTION',
  NO_EXAGGERATION:     'NO_EXAGGERATION',
  FACT_VS_OPINION:     'FACT_VS_OPINION',
  ADMIT_UNCERTAINTY:   'ADMIT_UNCERTAINTY',
  NO_FAKE_HUMAN:       'NO_FAKE_HUMAN',
  NO_FAKE_EXPERIENCE:  'NO_FAKE_EXPERIENCE',
  VALUE_BEFORE_SALES:  'VALUE_BEFORE_SALES',
  RESPECT_REFUSAL:     'RESPECT_REFUSAL',
  EASY_EXIT:           'EASY_EXIT',
});

export const TRUST_LEVEL = Object.freeze({
  LOW:    'LOW',
  MEDIUM: 'MEDIUM',
  HIGH:   'HIGH',
});

/**
 * Create a TrustPolicy for an agent.
 */
export function createTrustPolicy(overrides = {}) {
  const policy = Object.freeze({
    rules: Object.freeze(Object.values(TRUST_RULE)),
    noInvention: Object.freeze({
      enabled:     true,
      onUncertain: 'Admite que no tienes esa información y ofrece buscarla.',
    }),
    noExaggeration: Object.freeze({
      enabled:   true,
      examples:  Object.freeze(['No decir "el mejor del mundo"', 'No prometer resultados no garantizados']),
    }),
    factVsOpinion: Object.freeze({
      alwaysDistinguish: true,
      opinionLabel:      'En nuestra experiencia...',
      factLabel:         'El precio concreto es...',
    }),
    admitUncertainty: Object.freeze({
      phrases: Object.freeze([
        'No tengo esa información exacta ahora mismo.',
        'Déjame confirmar ese dato.',
        'Esa pregunta la responde mejor alguien del equipo.',
      ]),
    }),
    noFakeHuman: Object.freeze({
      disclaimerIfAsked: 'Soy un asistente de IA. Para hablar con una persona, puedo conectarte.',
      enabled:           true,
    }),
    respectRefusal: Object.freeze({
      onNoThankYou:  'Claro, sin problema. Si cambias de idea, aquí estaré.',
      noRepeat:      true,
      maxFollowUp:   1,
    }),
    easyExit: Object.freeze({
      alwaysOffer:   true,
      noGuilt:       true,
      positiveClose: true,
    }),
    overrides: Object.freeze(overrides),
    version: '1.0.0',
  });

  return { valid: true, policy };
}

/**
 * Evaluate trust level from a conversation context.
 */
export function evaluateTrustLevel(context = {}) {
  let score = 50; // base
  if (context.repeatedCorrectInfo)  score += 15;
  if (context.admittedUncertainty)  score += 10;
  if (context.userAskedAgain)       score -= 10;
  if (context.inventedAnswer)       score -= 30;
  if (context.pressured)            score -= 20;
  score = Math.max(0, Math.min(100, score));
  const level = score >= 70 ? TRUST_LEVEL.HIGH : score >= 40 ? TRUST_LEVEL.MEDIUM : TRUST_LEVEL.LOW;
  return { valid: true, score, level };
}

export const TRUST_POLICY_VERSION = '1.0.0';
