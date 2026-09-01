// Human Communication Profile — ADV-03
// Defines rules for sounding natural, not robotic, across all agents.

export const COMMUNICATION_RULE = Object.freeze({
  NATURAL_PHRASING:      'NATURAL_PHRASING',
  AVOID_BULLET_OVERLOAD: 'AVOID_BULLET_OVERLOAD',
  ADAPTIVE_LENGTH:       'ADAPTIVE_LENGTH',
  NO_ROBOTIC_PREFIX:     'NO_ROBOTIC_PREFIX',
  NO_SERVILE_TONE:       'NO_SERVILE_TONE',
  NO_ARROGANT_TONE:      'NO_ARROGANT_TONE',
  NO_REPETITION:         'NO_REPETITION',
  GENUINE_EMPATHY:       'GENUINE_EMPATHY',
  CONFIDENT_HUMILITY:    'CONFIDENT_HUMILITY',
  VALUE_FIRST:           'VALUE_FIRST',
});

export const ROBOTIC_PATTERNS = Object.freeze([
  'Por supuesto, aquí tienes',
  'Como asistente de IA',
  'Es un placer ayudarte',
  'Entendido. Procederé a',
  '¡Claro que sí!',
  'Estimado cliente',
  'De acuerdo, en primer lugar',
  '¡Fantástico!',
  'No dudes en consultarme',
  'Espero haberte ayudado',
]);

export const HUMAN_PROFILE_RULES = Object.freeze({
  naturalPhrasing: Object.freeze({
    avoid: ROBOTIC_PATTERNS,
    prefer: Object.freeze([
      'Directo al grano',
      'Frases de conversación real',
      'Sin saludos artificiales en cada turno',
    ]),
  }),
  listUsage: Object.freeze({
    maxListItemsBeforeWarning: 4,
    preferProse:               true,
    allowListsFor:             Object.freeze(['comparaciones explícitas', 'pasos secuenciales', 'opciones concretas']),
  }),
  lengthRules: Object.freeze({
    defaultBias:              'BRIEF',
    expandOnlyIf:             Object.freeze(['user asks explicitly', 'complexity requires it', 'booking confirmation']),
    maxParagraphsDefault:     2,
    warningThresholdWords:    120,
    hardLimitWords:           400,
  }),
  toneConstraints: Object.freeze({
    noFakeEnthusiasm:  true,
    noFakeUrgency:     true,
    noFakeScarcity:    true,
    noGuiltTrip:       true,
    noExcessiveExclamation: true,
    noPressure:        true,
  }),
  empathyRules: Object.freeze({
    acknowledge:      true,
    validate:         true,
    doNotOverdo:      true,
    oneEmpathyPerTurn: true,
  }),
});

/**
 * Create a HumanCommunicationProfile for an agent.
 * Allows overriding specific rules per vertical or client.
 */
export function createHumanProfile(overrides = {}) {
  const base = HUMAN_PROFILE_RULES;

  const profile = Object.freeze({
    naturalPhrasing:   overrides.naturalPhrasing   ?? base.naturalPhrasing,
    listUsage:         overrides.listUsage          ?? base.listUsage,
    lengthRules:       overrides.lengthRules        ?? base.lengthRules,
    toneConstraints:   overrides.toneConstraints    ?? base.toneConstraints,
    empathyRules:      overrides.empathyRules       ?? base.empathyRules,
    disclaimer:        'Profile is a guideline, not an LLM constraint.',
    profileVersion:    '1.0.0',
    dataType:          'HUMAN_COMMUNICATION_PROFILE',
  });

  return { valid: true, profile };
}

/**
 * Check a response text against humanness rules.
 * Returns issues found (for use in QA, not for blocking production).
 */
export function checkResponseHumanness(text = '') {
  const issues = [];

  for (const pattern of ROBOTIC_PATTERNS) {
    if (text.includes(pattern)) {
      issues.push({ rule: 'NO_ROBOTIC_PREFIX', pattern, severity: 'WARNING' });
    }
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > HUMAN_PROFILE_RULES.lengthRules.hardLimitWords) {
    issues.push({ rule: 'ADAPTIVE_LENGTH', wordCount, limit: HUMAN_PROFILE_RULES.lengthRules.hardLimitWords, severity: 'WARNING' });
  }

  const exclamationCount = (text.match(/!/g) ?? []).length;
  if (exclamationCount > 2) {
    issues.push({ rule: 'NO_FAKE_ENTHUSIASM', exclamationCount, severity: 'WARNING' });
  }

  return { valid: true, issues, humanScore: Math.max(0, 100 - issues.length * 15) };
}

export const HUMAN_PROFILE_VERSION = '1.0.0';
