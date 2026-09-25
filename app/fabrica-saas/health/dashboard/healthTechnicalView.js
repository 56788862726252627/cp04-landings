// Health Technical View — ADV-20

export function createHealthTechnicalView(config = {}) {
  const { snapshot, signals = [], freshness = [], dependencies = [], gates = [] } = config;

  return Object.freeze({
    timestamp: new Date().toISOString(),
    overallStatus: snapshot?.overallStatus ?? 'UNKNOWN',
    overallScore: snapshot?.overallScore ?? 0,
    signals: Object.freeze(signals.map(s => Object.freeze({
      id: s.id,
      dimension: s.dimension,
      status: s.status,
      score: s.score,
      source: s.source,
      evidence: s.evidence,
      freshness: freshness.find(f => f.signalId === s.id)?.status ?? 'UNKNOWN',
    }))),
    criticalIssues: Object.freeze(snapshot?.criticalIssues ?? []),
    warnings: Object.freeze(snapshot?.warnings ?? []),
    dependencies: Object.freeze(dependencies),
    gates: Object.freeze(gates),
    secretsExcluded: true,
    isReal: false,
  });
}

export const HEALTH_TECHNICAL_VIEW_VERSION = '1.0.0';
