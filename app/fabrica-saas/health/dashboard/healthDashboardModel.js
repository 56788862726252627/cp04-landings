// Health Dashboard Model — ADV-20

export const DASHBOARD_SECTION = Object.freeze({
  GLOBAL_HEALTH:        'GLOBAL_HEALTH',
  PRODUCTION_READINESS: 'PRODUCTION_READINESS',
  CRITICAL_ISSUES:      'CRITICAL_ISSUES',
  WARNINGS:             'WARNINGS',
  SECURITY:             'SECURITY',
  PRIVACY:              'PRIVACY',
  BACKUPS:              'BACKUPS',
  AI_AGENTS:            'AI_AGENTS',
  BUSINESS_TRUTH:       'BUSINESS_TRUTH',
  AUTOMATIONS:          'AUTOMATIONS',
  CI_CD:                'CI_CD',
  BROWSER_QA:           'BROWSER_QA',
  NEXT_ACTIONS:         'NEXT_ACTIONS',
});

export function createHealthDashboardModel(config = {}) {
  const {
    snapshot,
    actions      = [],
    risks        = [],
    trend        = null,
    executiveSummary = null,
    clientId     = null,
    environment  = 'LOCAL',
    viewType     = 'FULL',
  } = config;

  const sections = {};

  if (snapshot) {
    sections[DASHBOARD_SECTION.GLOBAL_HEALTH] = Object.freeze({
      status: snapshot.overallStatus,
      score: snapshot.overallScore,
      dimensions: snapshot.dimensions,
    });
    sections[DASHBOARD_SECTION.CRITICAL_ISSUES] = Object.freeze({
      items: snapshot.criticalIssues ?? [],
      count: snapshot.criticalIssues?.length ?? 0,
    });
    sections[DASHBOARD_SECTION.WARNINGS] = Object.freeze({
      items: snapshot.warnings ?? [],
      count: snapshot.warnings?.length ?? 0,
    });
    sections[DASHBOARD_SECTION.PRODUCTION_READINESS] = Object.freeze({
      ready: snapshot.productionReady,
      status: snapshot.productionReady ? 'READY' : 'NOT_READY',
    });
    sections[DASHBOARD_SECTION.NEXT_ACTIONS] = Object.freeze({
      items: actions.slice(0, 5),
      count: actions.length,
    });
  }

  const sectionList = Object.keys(DASHBOARD_SECTION);

  return Object.freeze({
    timestamp: new Date().toISOString(),
    viewType,
    clientId,
    environment,
    sections: Object.freeze({ ...sections }),
    sectionList: Object.freeze(sectionList),
    totalRisks: risks.length,
    trend: trend ?? null,
    executiveSummary: executiveSummary ?? null,
    noCP04: true,
    isReal: false,
  });
}

export const HEALTH_DASHBOARD_MODEL_VERSION = '1.0.0';
