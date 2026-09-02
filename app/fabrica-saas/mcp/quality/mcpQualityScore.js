// MCP Quality Score — ADV-12

export const QUALITY_DIMENSION = Object.freeze({
  TOOL_SELECTION:  'TOOL_SELECTION',
  ARG_SAFETY:      'ARG_SAFETY',
  PERMISSION:      'PERMISSION',
  COST_AWARENESS:  'COST_AWARENESS',
  ISOLATION:       'ISOLATION',
  OUTPUT_VALIDITY: 'OUTPUT_VALIDITY',
});

export const DEFAULT_QUALITY_WEIGHTS = Object.freeze({
  [QUALITY_DIMENSION.TOOL_SELECTION]:  20,
  [QUALITY_DIMENSION.ARG_SAFETY]:      20,
  [QUALITY_DIMENSION.PERMISSION]:      20,
  [QUALITY_DIMENSION.COST_AWARENESS]:  15,
  [QUALITY_DIMENSION.ISOLATION]:       15,
  [QUALITY_DIMENSION.OUTPUT_VALIDITY]: 10,
});

export function computeMCPQualityScore(dimensionScores = {}) {
  const weights = DEFAULT_QUALITY_WEIGHTS;
  let total = 0;
  let weightSum = 0;
  for (const [dim, weight] of Object.entries(weights)) {
    const score = dimensionScores[dim] ?? 0;
    total     += score * weight;
    weightSum += weight;
  }
  const overall = weightSum > 0 ? Math.round(total / weightSum) : 0;
  return Object.freeze({
    overall,
    dimensions:  Object.freeze({ ...dimensionScores }),
    weights:     Object.freeze({ ...weights }),
    grade:       overall >= 90 ? 'A' : overall >= 75 ? 'B' : overall >= 60 ? 'C' : 'F',
    isReal: false,
  });
}

export const MCP_QUALITY_SCORE_VERSION = '1.0.0';
