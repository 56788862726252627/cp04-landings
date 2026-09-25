// Psychology / Marketing Communication Policy — ADV-03
// Ética en persuasión. Prohibición explícita de dark patterns.

export const PSYCH_PRINCIPLE = Object.freeze({
  CLARITY:           'CLARITY',
  HONEST_FRAMING:    'HONEST_FRAMING',
  VERIFIED_PROOF:    'VERIFIED_PROOF',
  COMMITMENT:        'COMMITMENT',
  TRUST:             'TRUST',
  RECIPROCITY:       'RECIPROCITY',
  FRICTION_REDUCTION: 'FRICTION_REDUCTION',
  CHOICE_ARCHITECTURE:'CHOICE_ARCHITECTURE',
});

export const DARK_PATTERNS = Object.freeze([
  'GUILT_TRIP',
  'ARTIFICIAL_FEAR',
  'FALSE_SCARCITY',
  'FALSE_AUTHORITY',
  'UNDUE_PRESSURE',
  'MANUFACTURED_URGENCY',
  'MISLEADING_FRAMING',
  'HIDDEN_COSTS',
  'BAIT_AND_SWITCH',
]);

/**
 * Create the psychology/marketing communication policy.
 * All dark patterns are explicitly prohibited.
 */
export function createPsychologyPolicy(overrides = {}) {
  const policy = Object.freeze({
    allowedPrinciples: Object.freeze(Object.values(PSYCH_PRINCIPLE)),
    prohibitedPatterns: DARK_PATTERNS,

    clarity: Object.freeze({
      useSimpleLanguage:   true,
      avoidJargon:         true,
      explainComplexTerms: true,
    }),

    framing: Object.freeze({
      useHonestFraming:     true,
      allowLossAvoidance:   'FACTUAL_ONLY',
      noManipulativeFraming: true,
    }),

    socialProof: Object.freeze({
      mustBeVerified:    true,
      noInventedStories: true,
      contextual:        true,
      generalStatements: 'VERIFIED_ONLY',
    }),

    commitment: Object.freeze({
      voluntaryOnly:        true,
      easyToReverse:        true,
      noFakeCommitmentLoop: true,
    }),

    trust: Object.freeze({
      beHonestAboutLimitations: true,
      admitUncertainty:         true,
      noPretendHuman:           true,
    }),

    reciprocity: Object.freeze({
      giveRealValue:  true,
      notTransactional: true,
      noUpsellOnEvery: true,
    }),

    choiceArchitecture: Object.freeze({
      helpDecide:     true,
      noHiddenOptions: true,
      allowSayNo:     true,
    }),

    overrides: Object.freeze(overrides),
    disclaimer: 'Dark patterns are PROHIBITED. Ethics first.',
    version:    '1.0.0',
  });

  return { valid: true, policy };
}

/**
 * Audit a message for psychology/marketing violations.
 */
export function auditMessageEthics(text = '') {
  const issues = [];
  const lowerText = text.toLowerCase();

  const patterns = [
    { keyword: 'última oportunidad', pattern: 'FALSE_SCARCITY' },
    { keyword: 'solo quedan', pattern: 'FALSE_SCARCITY' },
    { keyword: 'oferta expira', pattern: 'MANUFACTURED_URGENCY' },
    { keyword: 'te arrepentirás', pattern: 'GUILT_TRIP' },
    { keyword: 'si no actúas', pattern: 'ARTIFICIAL_FEAR' },
    { keyword: 'garantizado al 100%', pattern: 'FALSE_AUTHORITY' },
    { keyword: 'sin ningún riesgo', pattern: 'MISLEADING_FRAMING' },
  ];

  for (const { keyword, pattern } of patterns) {
    if (lowerText.includes(keyword)) {
      issues.push({ type: 'DARK_PATTERN', pattern, keyword });
    }
  }

  return { valid: true, issues, ethicsScore: Math.max(0, 100 - issues.length * 25) };
}

export const PSYCHOLOGY_POLICY_VERSION = '1.0.0';
