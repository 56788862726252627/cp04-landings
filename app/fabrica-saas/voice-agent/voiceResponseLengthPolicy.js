// Voice Response Length Policy — ADV-11

export const RESPONSE_LENGTH_TIER = Object.freeze({
  ULTRA_SHORT: 'ULTRA_SHORT',  // ≤5 words (yes/no + brief)
  SHORT:       'SHORT',        // ≤15 words (default)
  NORMAL:      'NORMAL',       // ≤30 words
  EXTENDED:    'EXTENDED',     // ≤50 words (explanation requested)
  NEVER:       'NEVER',        // >50 words — always split or avoid
});

export const EXTEND_CONDITION = Object.freeze({
  USER_REQUESTED_EXPLANATION: 'USER_REQUESTED_EXPLANATION',
  COMPLEX_INFORMATION:        'COMPLEX_INFORMATION',
  SAFETY_REQUIRED:            'SAFETY_REQUIRED',
  MULTI_FIELD_CONFIRMATION:   'MULTI_FIELD_CONFIRMATION',
});

const TIER_LIMITS = { ULTRA_SHORT: 5, SHORT: 15, NORMAL: 30, EXTENDED: 50, NEVER: Infinity };

export function createVoiceResponseLengthPolicy(config = {}) {
  return Object.freeze({
    defaultTier:     config.defaultTier     ?? RESPONSE_LENGTH_TIER.SHORT,
    extendConditions: Object.freeze(config.extendConditions ?? Object.values(EXTEND_CONDITION)),
    maxWordsDefault: config.maxWordsDefault ?? 15,
    isReal: false,
  });
}

export function checkResponseLength(text = '', tier = RESPONSE_LENGTH_TIER.SHORT) {
  const words  = text.split(/\s+/).filter(Boolean).length;
  const limit  = TIER_LIMITS[tier] ?? 30;
  const passes = words <= limit;
  return Object.freeze({ words, limit, tier, passes, isReal: false });
}

export function getRequiredTier(context = {}) {
  if (context.userRequestedExplanation) return RESPONSE_LENGTH_TIER.EXTENDED;
  if (context.complexInfo)              return RESPONSE_LENGTH_TIER.NORMAL;
  if (context.safetyRequired)           return RESPONSE_LENGTH_TIER.EXTENDED;
  if (context.multiFieldConfirmation)   return RESPONSE_LENGTH_TIER.NORMAL;
  return RESPONSE_LENGTH_TIER.SHORT;
}

export const DEFAULT_RESPONSE_LENGTH_POLICY = createVoiceResponseLengthPolicy();

export const VOICE_RESPONSE_LENGTH_POLICY_VERSION = '1.0.0';
