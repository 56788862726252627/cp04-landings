// Health Detailed Dashboard Model — ADV-20 (tablet/desktop)

export function createHealthDetailedDashboardModel(config = {}) {
  const { snapshot, signals = [], risks = [], history = [], actions = [] } = config;

  return Object.freeze({
    timestamp: new Date().toISOString(),
    overall: snapshot?.overallStatus ?? 'UNKNOWN',
    score: snapshot?.overallScore ?? 0,
    dimensions: snapshot?.dimensions ?? {},
    criticalIssues: snapshot?.criticalIssues ?? [],
    warnings: snapshot?.warnings ?? [],
    signals: Object.freeze(signals.map(s => Object.freeze({ dimension: s.dimension, status: s.status, score: s.score }))),
    risks: Object.freeze(risks.slice(0, 20)),
    history: Object.freeze(history.slice(-10)),
    actions: Object.freeze(actions.slice(0, 10)),
    productionReady: snapshot?.productionReady ?? false,
    detailed: true,
    isReal: false,
  });
}

export const HEALTH_DETAILED_DASHBOARD_VERSION = '1.0.0';
