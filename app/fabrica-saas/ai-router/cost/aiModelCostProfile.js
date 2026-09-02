// AI Model Cost Profile — ADV-16
// Classification only — no real pricing figures.

export const COST_CLASS = Object.freeze({
  FREE:     'FREE',
  VERY_LOW: 'VERY_LOW',
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  UNKNOWN:  'UNKNOWN',
});

export function createAIModelCostProfile(config = {}) {
  const {
    modelId   = 'unknown',
    provider  = 'unknown',
    costClass = COST_CLASS.UNKNOWN,
    notes     = null,
  } = config;

  return Object.freeze({
    modelId,
    provider,
    costClass,
    notes,
    realPricingStored: false,
    isReal: false,
  });
}

export function isCostKnown(profile) {
  return profile.costClass !== COST_CLASS.UNKNOWN;
}

export function isPaidModel(profile) {
  const paid = new Set([COST_CLASS.LOW, COST_CLASS.MEDIUM, COST_CLASS.HIGH]);
  return paid.has(profile.costClass);
}

export const AI_MODEL_COST_PROFILE_VERSION = '1.0.0';
