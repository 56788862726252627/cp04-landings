// Multi-Agent Quality Score — ADV-17
// 10 factors totalling 100 points.

const FACTORS = Object.freeze({
  taskDecomposition:   10,
  agentSelection:      10,
  delegation:          10,
  handoff:             10,
  businessTruth:       15,
  permissions:         10,
  conflictHandling:    10,
  efficiency:          10,
  quality:             10,
  completion:           5,
});

export function computeMultiAgentQualityScore(metrics = {}) {
  const scores = {};
  let total    = 0;
  let maxTotal = 0;

  for (const [factor, weight] of Object.entries(FACTORS)) {
    const raw     = metrics[factor] ?? 100;
    const clamped = Math.max(0, Math.min(100, raw));
    scores[factor] = clamped;
    total    += clamped * weight;
    maxTotal += 100    * weight;
  }

  const overall  = Math.round(total / maxTotal * 100);
  const violations = Object.entries(scores)
    .filter(([, v]) => v < 50)
    .map(([k]) => k);

  return Object.freeze({
    overall,
    scores:       Object.freeze(scores),
    violations:   Object.freeze(violations),
    routingReady: overall >= 80 && violations.length === 0,
    isReal:       false,
  });
}

export const MULTIAGENT_QUALITY_SCORE_VERSION = '1.0.0';
