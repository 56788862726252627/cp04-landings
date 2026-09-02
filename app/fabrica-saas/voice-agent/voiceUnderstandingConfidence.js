// Voice Understanding Confidence — ADV-11

export const UNDERSTANDING_LEVEL = Object.freeze({
  HIGH:    'HIGH',    // >= 0.85
  MEDIUM:  'MEDIUM',  // >= 0.60
  LOW:     'LOW',     // >= 0.35
  UNKNOWN: 'UNKNOWN', // < 0.35
});

export function classifyConfidence(score = 0) {
  if (score >= 0.85) return UNDERSTANDING_LEVEL.HIGH;
  if (score >= 0.60) return UNDERSTANDING_LEVEL.MEDIUM;
  if (score >= 0.35) return UNDERSTANDING_LEVEL.LOW;
  return UNDERSTANDING_LEVEL.UNKNOWN;
}

export function createUnderstandingResult(rawText = '', score = 0, intentResult = null) {
  return Object.freeze({
    rawText,
    score,
    level:      classifyConfidence(score),
    intent:     intentResult,
    needsRecovery: score < 0.60,
    isReal: false,
  });
}

export const VOICE_UNDERSTANDING_CONFIDENCE_VERSION = '1.0.0';
