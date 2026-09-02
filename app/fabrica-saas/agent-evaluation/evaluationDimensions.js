// Evaluation Dimensions — ADV-10

export const EVAL_DIMENSION = Object.freeze({
  NATURALNESS:         'NATURALNESS',
  USEFULNESS:          'USEFULNESS',
  CLARITY:             'CLARITY',
  BREVITY:             'BREVITY',
  EMPATHY:             'EMPATHY',
  TONE_MATCH:          'TONE_MATCH',
  SALES_QUALITY:       'SALES_QUALITY',
  OBJECTION_HANDLING:  'OBJECTION_HANDLING',
  GROUNDING:           'GROUNDING',
  SAFETY:              'SAFETY',
  POLICY_COMPLIANCE:   'POLICY_COMPLIANCE',
  TOOL_USE:            'TOOL_USE',
  ESCALATION:          'ESCALATION',
  CONSISTENCY:         'CONSISTENCY',
  HUMANNESS:           'HUMANNESS',
  NON_ROBOTIC_STYLE:   'NON_ROBOTIC_STYLE',
});

export const DEFAULT_DIMENSION_WEIGHTS = Object.freeze({
  [EVAL_DIMENSION.NATURALNESS]:        15,
  [EVAL_DIMENSION.USEFULNESS]:         15,
  [EVAL_DIMENSION.CLARITY]:            10,
  [EVAL_DIMENSION.BREVITY]:            10,
  [EVAL_DIMENSION.HUMANNESS]:          10,
  [EVAL_DIMENSION.GROUNDING]:          10,
  [EVAL_DIMENSION.SAFETY]:             10,
  [EVAL_DIMENSION.TOOL_USE]:            5,
  [EVAL_DIMENSION.ESCALATION]:          5,
  [EVAL_DIMENSION.CONSISTENCY]:         5,
  [EVAL_DIMENSION.SALES_QUALITY]:       5,
  // remaining: EMPATHY, TONE_MATCH, OBJECTION_HANDLING, POLICY_COMPLIANCE, NON_ROBOTIC_STYLE → optional
});

export function createDimensionScore(dimension = '', score = 0, rationale = '') {
  return Object.freeze({
    dimension,
    score: Math.max(0, Math.min(100, score)),
    rationale,
    isReal: false,
  });
}

export function computeWeightedScore(dimensionScores = [], weights = DEFAULT_DIMENSION_WEIGHTS) {
  let total = 0;
  let totalWeight = 0;
  for (const ds of dimensionScores) {
    const w = weights[ds.dimension] ?? 0;
    total += ds.score * w;
    totalWeight += w;
  }
  return totalWeight > 0 ? Math.round(total / totalWeight) : 0;
}

export const EVALUATION_DIMENSIONS_VERSION = '1.0.0';
