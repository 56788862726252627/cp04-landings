// Health Mobile Dashboard Model — ADV-20

export function createHealthMobileDashboardModel(config = {}) {
  const { snapshot, topAction = null } = config;

  return Object.freeze({
    timestamp: new Date().toISOString(),
    overall: snapshot?.overallStatus ?? 'UNKNOWN',
    score: snapshot?.overallScore ?? 0,
    critical: snapshot?.criticalIssues?.slice(0, 3) ?? [],
    warnings: snapshot?.warnings?.slice(0, 2) ?? [],
    nextAction: topAction,
    productionReady: snapshot?.productionReady ?? false,
    compact: true,
    isReal: false,
  });
}

export const HEALTH_MOBILE_DASHBOARD_VERSION = '1.0.0';
