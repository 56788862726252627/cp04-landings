// Agent Evaluation Report — ADV-10

export function createAgentEvaluationReport(fields = {}) {
  const results   = fields.results ?? [];
  const passed    = results.filter(r => r.status === 'PASS').length;
  const warned    = results.filter(r => r.status === 'WARNING').length;
  const failures  = results.filter(r => r.status === 'FAIL').length;
  const blocked   = results.filter(r => r.status === 'BLOCKED').length;
  const critical  = results.flatMap(r => r.criticalFailures ?? []);

  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + (r.weightedScore ?? 0), 0) / results.length)
    : 0;

  const dimAccum = {};
  for (const r of results) {
    for (const s of (r.scores ?? [])) {
      if (!dimAccum[s.dimension]) dimAccum[s.dimension] = [];
      dimAccum[s.dimension].push(s.score);
    }
  }
  const dimensionScores = {};
  for (const [d, arr] of Object.entries(dimAccum)) {
    dimensionScores[d] = Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
  }

  return Object.freeze({
    dataset:          fields.dataset ?? '',
    totalCases:       results.length,
    pass:             passed,
    warnings:         warned,
    failures,
    blocked,
    criticalFailures: Object.freeze(critical),
    dimensionScores:  Object.freeze(dimensionScores),
    overallScore:     avgScore,
    avgLatencyMs:     fields.avgLatencyMs ?? 0,
    avgInputTokens:   fields.avgInputTokens ?? 0,
    avgOutputTokens:  fields.avgOutputTokens ?? 0,
    avgCostUSD:       fields.avgCostUSD ?? 0,
    regressions:      Object.freeze(fields.regressions ?? []),
    recommendations:  Object.freeze(fields.recommendations ?? []),
    generatedAt:      new Date().toISOString(),
    isReal: false,
  });
}

export const EVALUATION_REPORT_VERSION = '1.0.0';
