// AI Routing Quality Score — ADV-16

const FACTORS = Object.freeze([
  { name: 'taskFit',            weight: 25 },
  { name: 'quality',            weight: 20 },
  { name: 'costAppropriateness',weight: 15 },
  { name: 'latency',            weight: 15 },
  { name: 'privacy',            weight: 10 },
  { name: 'health',             weight: 10 },
  { name: 'fallback',           weight:  3 },
  { name: 'outputCompatibility',weight:  2 },
]);

const TOTAL_WEIGHT = FACTORS.reduce((s, f) => s + f.weight, 0);

export function computeAIRoutingQualityScore(metrics = {}) {
  const scores     = {};
  const violations = [];

  for (const f of FACTORS) {
    const raw   = metrics[f.name];
    const score = typeof raw === 'number' ? Math.max(0, Math.min(100, raw)) : 0;
    scores[f.name] = score;
    if (score < 50) violations.push({ factor: f.name, score, threshold: 50 });
  }

  const weighted = FACTORS.reduce((sum, f) => sum + scores[f.name] * f.weight, 0);
  const overall  = Math.round(weighted / TOTAL_WEIGHT);

  return Object.freeze({
    overall,
    scores:         Object.freeze(scores),
    violations:     Object.freeze(violations),
    routingReady:   overall >= 80 && violations.length === 0,
    isReal:         false,
  });
}

export const AI_ROUTING_QUALITY_SCORE_VERSION = '1.0.0';
