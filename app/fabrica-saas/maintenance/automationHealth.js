// Automation Health — PASO F
// Audits Make/Zapier scenario health.

export const AUTOMATION_STATUS = Object.freeze({
  ACTIVE:   'ACTIVE',
  INACTIVE: 'INACTIVE',
  ERROR:    'ERROR',
  PAUSED:   'PAUSED',
  UNKNOWN:  'UNKNOWN',
});

export const AUTOMATION_HEALTH_STATUS = Object.freeze({
  HEALTHY:  'HEALTHY',
  WARNING:  'WARNING',
  CRITICAL: 'CRITICAL',
  UNKNOWN:  'UNKNOWN',
});

/**
 * Audit automation health for a list of scenarios.
 * Each scenario: { id, name, status, errorRate, lastRunAt, critical }
 */
export function auditAutomationHealth(scenarios = []) {
  if (!Array.isArray(scenarios)) {
    return { valid: false, error: 'scenarios must be an array' };
  }

  if (scenarios.length === 0) {
    return {
      valid:       true,
      total:       0,
      healthScore: 100,
      status:      AUTOMATION_HEALTH_STATUS.UNKNOWN,
      issues:      [],
      scenarios:   [],
      disclaimer:  'No automation scenarios provided. Status: UNKNOWN.',
    };
  }

  const issues = [];
  let scoreDeduction = 0;

  const audited = scenarios.map(s => {
    const sIssues = [];

    if (s.status === AUTOMATION_STATUS.ERROR) {
      sIssues.push({ severity: 'CRITICAL', issue: `Scenario ${s.id ?? s.name} is in ERROR state` });
      scoreDeduction += s.critical ? 25 : 10;
    }
    if (s.status === AUTOMATION_STATUS.INACTIVE || s.status === AUTOMATION_STATUS.PAUSED) {
      sIssues.push({ severity: 'WARNING', issue: `Scenario ${s.id ?? s.name} is ${s.status}` });
      scoreDeduction += s.critical ? 15 : 5;
    }
    if ((s.errorRate ?? 0) > 0.1) {
      sIssues.push({ severity: 'WARNING', issue: `Scenario ${s.id ?? s.name} error rate ${Math.round((s.errorRate ?? 0) * 100)}%` });
      scoreDeduction += 10;
    }
    if (!s.lastRunAt) {
      sIssues.push({ severity: 'WARNING', issue: `Scenario ${s.id ?? s.name} has never run` });
      scoreDeduction += 5;
    }

    issues.push(...sIssues);

    return {
      ...s,
      healthy: sIssues.length === 0,
      issues:  sIssues,
    };
  });

  const active   = scenarios.filter(s => s.status === AUTOMATION_STATUS.ACTIVE).length;
  const errored  = scenarios.filter(s => s.status === AUTOMATION_STATUS.ERROR).length;
  const inactive = scenarios.filter(s =>
    s.status === AUTOMATION_STATUS.INACTIVE || s.status === AUTOMATION_STATUS.PAUSED
  ).length;

  const healthScore = Math.max(0, 100 - scoreDeduction);
  const criticalErrors = issues.filter(i => i.severity === 'CRITICAL').length;

  const status = criticalErrors > 0 ? AUTOMATION_HEALTH_STATUS.CRITICAL
    : healthScore < 70              ? AUTOMATION_HEALTH_STATUS.WARNING
    : AUTOMATION_HEALTH_STATUS.HEALTHY;

  return {
    valid:       true,
    total:       scenarios.length,
    active,
    errored,
    inactive,
    healthScore,
    status,
    issues,
    scenarios:   audited,
    disclaimer:  'Automation health audit is an operational assessment. No scenarios modified.',
  };
}

export const AUTOMATION_HEALTH_VERSION = '1.0.0';
