// Agent Evaluation Dashboard Model — ADV-10

export function createAgentEvaluationDashboard(report = {}, promptVersions = []) {
  return Object.freeze({
    widgets: Object.freeze({
      overallQuality: Object.freeze({
        score:    report.overallScore ?? 0,
        status:   (report.overallScore ?? 0) >= 90 ? 'GOOD' : (report.overallScore ?? 0) >= 75 ? 'WARNING' : 'ALERT',
      }),
      dimensions:     Object.freeze(report.dimensionScores ?? {}),
      criticalFailures: Object.freeze({
        count:    (report.criticalFailures ?? []).length,
        items:    Object.freeze(report.criticalFailures ?? []),
      }),
      regressions: Object.freeze({
        count:    (report.regressions ?? []).length,
        items:    Object.freeze(report.regressions ?? []),
      }),
      latency: Object.freeze({
        avgMs:  report.avgLatencyMs ?? 0,
      }),
      cost: Object.freeze({
        avgUSD: report.avgCostUSD ?? 0,
      }),
      agentTypes: Object.freeze({}),
      verticals:  Object.freeze({}),
      promptVersions: Object.freeze(promptVersions.map(p => ({ version: p.version, score: p.evaluationScore, status: p.status, isReal: false }))),
    }),
    generatedAt: new Date().toISOString(),
    isReal: false,
  });
}

export const DASHBOARD_MODEL_VERSION = '1.0.0';
