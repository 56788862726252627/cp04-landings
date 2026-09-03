// Maintenance Health Profile — ADV-20 (stale deps, backup aging, failing QA detection)

export const MAINTENANCE_ISSUE_TYPE = Object.freeze({
  STALE_DEPENDENCY:    'STALE_DEPENDENCY',
  BACKUP_AGING:        'BACKUP_AGING',
  FAILING_QA:          'FAILING_QA',
  MISSING_TESTS:       'MISSING_TESTS',
  LINT_DRIFT:          'LINT_DRIFT',
  UNRESOLVED_SECURITY: 'UNRESOLVED_SECURITY',
});

export function createMaintenanceHealthProfile(config = {}) {
  const {
    staleDependencies   = 0,
    backupAgingHours    = null,
    failingQASuites     = 0,
    missingTestCoverage = false,
    unresolvedSecurity  = 0,
    lintErrors          = 0,
  } = config;

  const issues = [];

  if (staleDependencies > 0) {
    issues.push(Object.freeze({ type: MAINTENANCE_ISSUE_TYPE.STALE_DEPENDENCY, count: staleDependencies, severity: staleDependencies > 10 ? 'HIGH' : 'MEDIUM' }));
  }
  if (backupAgingHours !== null && backupAgingHours > 72) {
    issues.push(Object.freeze({ type: MAINTENANCE_ISSUE_TYPE.BACKUP_AGING, hours: backupAgingHours, severity: backupAgingHours > 168 ? 'CRITICAL' : 'HIGH' }));
  }
  if (failingQASuites > 0) {
    issues.push(Object.freeze({ type: MAINTENANCE_ISSUE_TYPE.FAILING_QA, count: failingQASuites, severity: 'HIGH' }));
  }
  if (missingTestCoverage) {
    issues.push(Object.freeze({ type: MAINTENANCE_ISSUE_TYPE.MISSING_TESTS, severity: 'MEDIUM' }));
  }
  if (unresolvedSecurity > 0) {
    issues.push(Object.freeze({ type: MAINTENANCE_ISSUE_TYPE.UNRESOLVED_SECURITY, count: unresolvedSecurity, severity: 'CRITICAL' }));
  }
  if (lintErrors > 0) {
    issues.push(Object.freeze({ type: MAINTENANCE_ISSUE_TYPE.LINT_DRIFT, count: lintErrors, severity: 'LOW' }));
  }

  const maintenanceScore = Math.max(0, 100 - (unresolvedSecurity * 20) - (failingQASuites * 15) - (staleDependencies * 2) - (lintErrors * 1));

  return Object.freeze({
    maintenanceScore,
    issues: Object.freeze(issues),
    hasCritical: issues.some(i => i.severity === 'CRITICAL'),
    isReal: false,
  });
}

export const MAINTENANCE_HEALTH_PROFILE_VERSION = '1.0.0';
