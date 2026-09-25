// AI Quality Target — ADV-16

export const AI_QUALITY_TARGET = Object.freeze({
  BASIC:    'BASIC',
  STANDARD: 'STANDARD',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',  // quality+reliability > cost
});

const QUALITY_REQUIREMENTS = Object.freeze({
  [AI_QUALITY_TARGET.BASIC]:    { minQualityClass: 'BASIC',    humanReview: false, groundingRequired: false },
  [AI_QUALITY_TARGET.STANDARD]: { minQualityClass: 'STANDARD', humanReview: false, groundingRequired: false },
  [AI_QUALITY_TARGET.HIGH]:     { minQualityClass: 'HIGH',     humanReview: false, groundingRequired: true  },
  [AI_QUALITY_TARGET.CRITICAL]: { minQualityClass: 'PREMIUM',  humanReview: true,  groundingRequired: true  },
});

export function getQualityRequirements(target) {
  return QUALITY_REQUIREMENTS[target] ?? QUALITY_REQUIREMENTS[AI_QUALITY_TARGET.STANDARD];
}

export function createAIQualityTarget(level = AI_QUALITY_TARGET.STANDARD) {
  const req = getQualityRequirements(level);
  return Object.freeze({ level, ...req, isReal: false });
}

export const AI_QUALITY_TARGET_VERSION = '1.0.0';
