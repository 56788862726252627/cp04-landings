// Voice Call Quality Score — ADV-11

export const QUALITY_DIMENSION = Object.freeze({
  TASK_COMPLETION:  'TASK_COMPLETION',
  ACCURACY:         'ACCURACY',
  NATURALNESS:      'NATURALNESS',
  LATENCY:          'LATENCY',
  SAFETY:           'SAFETY',
});

const DIMENSION_WEIGHTS = Object.freeze({
  [QUALITY_DIMENSION.TASK_COMPLETION]: 30,
  [QUALITY_DIMENSION.ACCURACY]:        25,
  [QUALITY_DIMENSION.NATURALNESS]:     20,
  [QUALITY_DIMENSION.LATENCY]:         10,
  [QUALITY_DIMENSION.SAFETY]:          15,
});

export function scoreCallQuality(dimensionScores = {}) {
  let weighted = 0;
  let totalWeight = 0;
  for (const [dim, weight] of Object.entries(DIMENSION_WEIGHTS)) {
    const s = dimensionScores[dim] ?? 0;
    weighted    += s * weight;
    totalWeight += weight;
  }
  const overall = totalWeight > 0 ? Math.round(weighted / totalWeight) : 0;
  return Object.freeze({
    overall,
    grade:      overall >= 80 ? 'GOOD' : overall >= 60 ? 'ACCEPTABLE' : 'POOR',
    dimensions: Object.freeze({ ...dimensionScores }),
    weights:    DIMENSION_WEIGHTS,
    isReal: false,
  });
}

export const VOICE_CALL_QUALITY_SCORE_VERSION = '1.0.0';
