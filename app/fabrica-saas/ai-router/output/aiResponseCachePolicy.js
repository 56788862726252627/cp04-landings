// AI Response Cache Policy — ADV-16
// Only safe, non-personal, cacheable, stable content.

export const CACHE_ELIGIBILITY = Object.freeze({
  CACHEABLE:     'CACHEABLE',
  NOT_CACHEABLE: 'NOT_CACHEABLE',
  FORBIDDEN:     'FORBIDDEN',
});

const FORBIDDEN_TASK_TYPES = new Set([
  'FACTUAL_HIGH_RISK',
  'BOOKING',
  'CUSTOMER_SUPPORT', // per-user
]);

const FORBIDDEN_PRIVACY_LEVELS = new Set([
  'PERSONAL',
  'SENSITIVE',
  'RESTRICTED',
]);

export function createAIResponseCachePolicy(config = {}) {
  const { ttlSeconds = 3600 } = config;

  return Object.freeze({
    ttlSeconds,

    evaluate(taskType, privacyLevel, isPersonalized = false) {
      if (FORBIDDEN_TASK_TYPES.has(taskType)) {
        return Object.freeze({ eligibility: CACHE_ELIGIBILITY.FORBIDDEN, reason: 'TASK_TYPE_NOT_CACHEABLE', isReal: false });
      }
      if (FORBIDDEN_PRIVACY_LEVELS.has(privacyLevel)) {
        return Object.freeze({ eligibility: CACHE_ELIGIBILITY.FORBIDDEN, reason: 'SENSITIVE_DATA_NOT_CACHEABLE', isReal: false });
      }
      if (isPersonalized) {
        return Object.freeze({ eligibility: CACHE_ELIGIBILITY.NOT_CACHEABLE, reason: 'PERSONALIZED_RESPONSE', isReal: false });
      }
      return Object.freeze({ eligibility: CACHE_ELIGIBILITY.CACHEABLE, ttlSeconds, reason: null, isReal: false });
    },
    isReal: false,
  });
}

export const AI_RESPONSE_CACHE_POLICY_VERSION = '1.0.0';
