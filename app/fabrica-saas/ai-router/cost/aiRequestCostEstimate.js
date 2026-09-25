// AI Request Cost Estimate — ADV-16
// When cost unknown → UNKNOWN. Never invents pricing.

import { COST_CLASS } from './aiModelCostProfile.js';

export const ESTIMATE_CONFIDENCE = Object.freeze({
  HIGH:    'HIGH',
  MEDIUM:  'MEDIUM',
  LOW:     'LOW',
  UNKNOWN: 'UNKNOWN',
});

export function createAIRequestCostEstimate(config = {}) {
  const {
    provider            = 'unknown',
    model               = 'unknown',
    inputClass          = COST_CLASS.UNKNOWN,
    outputClass         = COST_CLASS.UNKNOWN,
    estimatedCostClass  = COST_CLASS.UNKNOWN,
    confidence          = ESTIMATE_CONFIDENCE.UNKNOWN,
    source              = 'FIXTURE',
    freshness           = 'UNKNOWN',
  } = config;

  return Object.freeze({
    provider,
    model,
    inputClass,
    outputClass,
    estimatedCostClass,
    confidence,
    source,
    freshness,
    realCostStored: false,
    isReal: false,
  });
}

export function estimateFromProfile(model, contextClass = 'SMALL') {
  const base = model?.costClass ?? COST_CLASS.UNKNOWN;
  // Larger context → typically higher cost class
  const bump = contextClass === 'VERY_LARGE' ? 1 : contextClass === 'LARGE' ? 0 : 0;
  const classes = [COST_CLASS.FREE, COST_CLASS.VERY_LOW, COST_CLASS.LOW, COST_CLASS.MEDIUM, COST_CLASS.HIGH, COST_CLASS.UNKNOWN];
  const idx  = classes.indexOf(base);
  const bumped = idx >= 0 && idx + bump < classes.length - 1 ? classes[idx + bump] : base;

  return createAIRequestCostEstimate({
    provider:           model?.provider ?? 'unknown',
    model:              model?.modelId  ?? 'unknown',
    estimatedCostClass: bumped,
    confidence:         base === COST_CLASS.UNKNOWN ? ESTIMATE_CONFIDENCE.UNKNOWN : ESTIMATE_CONFIDENCE.LOW,
    source:             'PROFILE',
  });
}

export const AI_REQUEST_COST_ESTIMATE_VERSION = '1.0.0';
