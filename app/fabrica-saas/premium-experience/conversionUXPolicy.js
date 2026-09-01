// Conversion UX Policy — ADV-07

export const CONVERSION_GOAL = Object.freeze({
  BOOKING:      'BOOKING',
  LEAD_CAPTURE: 'LEAD_CAPTURE',
  CONTACT:      'CONTACT',
  QUOTE:        'QUOTE',
  DEMO:         'DEMO',
  SIGNUP:       'SIGNUP',
});

export const DARK_PATTERN = Object.freeze({
  FORCED_CONTINUITY:   'FORCED_CONTINUITY',
  HIDDEN_COSTS:        'HIDDEN_COSTS',
  MISDIRECTION:        'MISDIRECTION',
  TRICK_QUESTIONS:     'TRICK_QUESTIONS',
  URGENCY_FAKE:        'URGENCY_FAKE',
  CONFIRM_SHAMING:     'CONFIRM_SHAMING',
  BAIT_SWITCH:         'BAIT_SWITCH',
});

const GOAL_POLICIES = Object.freeze({
  [CONVERSION_GOAL.BOOKING]:      { frictionPoints: 2, requiresAccount: false, socialProof: true,  clarityScore: 'HIGH' },
  [CONVERSION_GOAL.LEAD_CAPTURE]: { frictionPoints: 1, requiresAccount: false, socialProof: false, clarityScore: 'HIGH' },
  [CONVERSION_GOAL.CONTACT]:      { frictionPoints: 1, requiresAccount: false, socialProof: true,  clarityScore: 'HIGH' },
  [CONVERSION_GOAL.QUOTE]:        { frictionPoints: 3, requiresAccount: false, socialProof: true,  clarityScore: 'HIGH' },
  [CONVERSION_GOAL.DEMO]:         { frictionPoints: 2, requiresAccount: false, socialProof: true,  clarityScore: 'HIGH' },
  [CONVERSION_GOAL.SIGNUP]:       { frictionPoints: 2, requiresAccount: true,  socialProof: false, clarityScore: 'HIGH' },
});

export function createConversionPolicy(goal = CONVERSION_GOAL.BOOKING) {
  const spec = GOAL_POLICIES[goal] ?? GOAL_POLICIES[CONVERSION_GOAL.BOOKING];
  return Object.freeze({
    goal,
    ...spec,
    noDarkPatterns:      true,
    clearNextStep:       true,
    mobileOptimized:     true,
    reducedFriction:     true,
    respectsPrivacy:     true,
    prohibitedPatterns:  Object.values(DARK_PATTERN),
    isReal:              false,
  });
}

export function auditForDarkPatterns(uiDescription = '') {
  const found = [];
  const lower = uiDescription.toLowerCase();
  if (lower.includes('only 1 left') || lower.includes('hurry')) found.push(DARK_PATTERN.URGENCY_FAKE);
  if (lower.includes('hidden fee')) found.push(DARK_PATTERN.HIDDEN_COSTS);
  if (lower.includes('no, i don\'t want') || lower.includes('no gracias, no me importa')) found.push(DARK_PATTERN.CONFIRM_SHAMING);
  return Object.freeze({ clean: found.length === 0, found, isReal: false });
}

export const CONVERSION_UX_POLICY_VERSION = '1.0.0';
