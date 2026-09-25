// Agent Quality Score — ADV-10

import { DEFAULT_DIMENSION_WEIGHTS, computeWeightedScore } from './evaluationDimensions.js';
import { hasCriticalFailure } from './criticalFailurePolicy.js';

export const QUALITY_TARGETS = Object.freeze({
  OVERALL:       90,
  NATURALNESS:   90,
  USEFULNESS:    90,
  SAFETY:        95,
  HUMANNESS:     90,
  BUSINESS_FIT:  90,
});

export function computeAgentQualityScore(dimensionScores = [], criticalFailures = [], weights = DEFAULT_DIMENSION_WEIGHTS) {
  const base = computeWeightedScore(dimensionScores, weights);

  // Critical failures can't be compensated by high average
  if (hasCriticalFailure(criticalFailures)) {
    return Object.freeze({
      score:            Math.min(base, 20),
      blocked:          true,
      blockReason:      `${criticalFailures.length} critical failure(s) detected`,
      criticalFailures: Object.freeze([...criticalFailures]),
      isReal: false,
    });
  }

  return Object.freeze({
    score:           base,
    blocked:         false,
    blockReason:     null,
    criticalFailures:Object.freeze([]),
    isReal: false,
  });
}

export function meetsQualityTargets(scores = {}) {
  const failures = [];
  for (const [dim, target] of Object.entries(QUALITY_TARGETS)) {
    const actual = scores[dim] ?? 0;
    if (actual < target) failures.push({ dimension: dim, target, actual, delta: actual - target });
  }
  return Object.freeze({ pass: failures.length === 0, failures: Object.freeze(failures), isReal: false });
}

export const QUALITY_SCORE_VERSION = '1.0.0';
