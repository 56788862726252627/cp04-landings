// Health Checks — PASO G
// Post-deploy health check model. No real HTTP calls.

export const HEALTH_STATUS = Object.freeze({
  PASS:           'PASS',
  WARNING:        'WARNING',
  FAIL:           'FAIL',
  UNKNOWN:        'UNKNOWN',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
});

export const HEALTH_AREAS = Object.freeze({
  FRONTEND:     'FRONTEND',
  API:          'API',
  AUTH:         'AUTH',
  DATABASE:     'DATABASE',
  AUTOMATION:   'AUTOMATION',
  AI:           'AI',
  INTEGRATIONS: 'INTEGRATIONS',
  STORAGE:      'STORAGE',
  ROUTES:       'ROUTES',
});

const HEALTH_CHECK_DEFINITIONS = [
  { id: 'HC-01', area: HEALTH_AREAS.FRONTEND,     name: 'App loads without error',           critical: true  },
  { id: 'HC-02', area: HEALTH_AREAS.FRONTEND,     name: 'CSS renders correctly',             critical: false },
  { id: 'HC-03', area: HEALTH_AREAS.API,          name: 'API health endpoint responds',      critical: true  },
  { id: 'HC-04', area: HEALTH_AREAS.API,          name: 'API response time < 2s',           critical: false },
  { id: 'HC-05', area: HEALTH_AREAS.AUTH,         name: 'Login flow functional',             critical: true  },
  { id: 'HC-06', area: HEALTH_AREAS.AUTH,         name: 'Token refresh working',             critical: true  },
  { id: 'HC-07', area: HEALTH_AREAS.DATABASE,     name: 'DB connection healthy',            critical: true  },
  { id: 'HC-08', area: HEALTH_AREAS.AUTOMATION,   name: 'Make scenarios active',            critical: false },
  { id: 'HC-09', area: HEALTH_AREAS.AI,           name: 'AI agents responding',             critical: false },
  { id: 'HC-10', area: HEALTH_AREAS.INTEGRATIONS, name: 'Third-party integrations reachable',critical: false },
  { id: 'HC-11', area: HEALTH_AREAS.STORAGE,      name: 'File/media storage accessible',    critical: false },
  { id: 'HC-12', area: HEALTH_AREAS.ROUTES,       name: 'Critical routes return 200',       critical: true  },
];

/**
 * Run health checks from a results map.
 * @param {object} checks — { 'HC-01': 'PASS'|'FAIL'|'WARNING'|'NOT_APPLICABLE' }
 */
export function runHealthChecks(checks = {}) {
  const results = HEALTH_CHECK_DEFINITIONS.map(def => {
    const value  = checks[def.id] ?? HEALTH_STATUS.UNKNOWN;
    const passed = value === HEALTH_STATUS.PASS || value === HEALTH_STATUS.NOT_APPLICABLE;
    return { ...def, status: value, passed };
  });

  const criticalFailed = results.filter(r => r.critical && !r.passed && r.status !== HEALTH_STATUS.UNKNOWN);
  const unknown        = results.filter(r => r.status === HEALTH_STATUS.UNKNOWN);
  const passed         = results.filter(r => r.passed).length;

  const overallStatus = criticalFailed.length > 0  ? HEALTH_STATUS.FAIL
    : unknown.length > results.length / 2           ? HEALTH_STATUS.UNKNOWN
    : passed < results.length                       ? HEALTH_STATUS.WARNING
    : HEALTH_STATUS.PASS;

  const byArea = {};
  for (const area of Object.values(HEALTH_AREAS)) {
    const areaResults = results.filter(r => r.area === area);
    byArea[area] = {
      pass:    areaResults.filter(r => r.status === HEALTH_STATUS.PASS).length,
      fail:    areaResults.filter(r => r.status === HEALTH_STATUS.FAIL).length,
      unknown: areaResults.filter(r => r.status === HEALTH_STATUS.UNKNOWN).length,
    };
  }

  return {
    valid:          true,
    status:         overallStatus,
    totalChecks:    HEALTH_CHECK_DEFINITIONS.length,
    passed,
    criticalFailed: criticalFailed.length,
    unknown:        unknown.length,
    byArea,
    results,
    disclaimer:     'Health checks are operational records. No real HTTP calls performed.',
  };
}

export const HEALTH_CHECKS_VERSION = '1.0.0';
