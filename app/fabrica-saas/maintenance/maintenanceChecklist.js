// Maintenance Checklist — PASO F
// 15 checks, 5 possible outcomes per check

export const CHECK_OUTCOMES = Object.freeze({
  PASS:         'PASS',
  FAIL:         'FAIL',
  WARNING:      'WARNING',
  NOT_APPLICABLE:'NOT_APPLICABLE',
  PENDING:      'PENDING',
});

export const CHECKLIST_AREAS = Object.freeze({
  SECURITY:     'SECURITY',
  BACKUP:       'BACKUP',
  PERFORMANCE:  'PERFORMANCE',
  INTEGRATIONS: 'INTEGRATIONS',
  AI:           'AI',
  AUTOMATIONS:  'AUTOMATIONS',
  DEPENDENCIES: 'DEPENDENCIES',
  MONITORING:   'MONITORING',
});

export const MAINTENANCE_CHECKS = [
  {
    id:       'CHK-01',
    area:     CHECKLIST_AREAS.SECURITY,
    name:     'SSL/TLS certificates valid',
    description: 'All domain certificates valid with >30 days remaining',
    critical: true,
  },
  {
    id:       'CHK-02',
    area:     CHECKLIST_AREAS.SECURITY,
    name:     'No secrets in codebase',
    description: 'Scan codebase for exposed credentials or API keys',
    critical: true,
  },
  {
    id:       'CHK-03',
    area:     CHECKLIST_AREAS.SECURITY,
    name:     'Dependency vulnerabilities',
    description: 'npm audit / equivalent — no HIGH or CRITICAL unpatched CVEs',
    critical: true,
  },
  {
    id:       'CHK-04',
    area:     CHECKLIST_AREAS.SECURITY,
    name:     'Access permissions review',
    description: 'Review who has admin/write access to production systems',
    critical: false,
  },
  {
    id:       'CHK-05',
    area:     CHECKLIST_AREAS.BACKUP,
    name:     'Database backup recent',
    description: 'Last DB backup within the policy window',
    critical: true,
  },
  {
    id:       'CHK-06',
    area:     CHECKLIST_AREAS.BACKUP,
    name:     'Restore test performed',
    description: 'Restore tested within policy frequency',
    critical: false,
  },
  {
    id:       'CHK-07',
    area:     CHECKLIST_AREAS.PERFORMANCE,
    name:     'Core Web Vitals within threshold',
    description: 'LCP < 2.5s, CLS < 0.1, FID < 100ms',
    critical: false,
  },
  {
    id:       'CHK-08',
    area:     CHECKLIST_AREAS.PERFORMANCE,
    name:     'API response times',
    description: 'p95 response time < 2s for critical endpoints',
    critical: false,
  },
  {
    id:       'CHK-09',
    area:     CHECKLIST_AREAS.INTEGRATIONS,
    name:     'Third-party integrations healthy',
    description: 'All configured webhooks and API integrations responding',
    critical: true,
  },
  {
    id:       'CHK-10',
    area:     CHECKLIST_AREAS.AUTOMATIONS,
    name:     'Automation workflows active',
    description: 'All Make/Zapier scenarios active and not in error state',
    critical: false,
  },
  {
    id:       'CHK-11',
    area:     CHECKLIST_AREAS.AI,
    name:     'AI agent health',
    description: 'AI agents responding within latency budget and no error loops',
    critical: false,
  },
  {
    id:       'CHK-12',
    area:     CHECKLIST_AREAS.DEPENDENCIES,
    name:     'Node/framework versions',
    description: 'Runtime versions current, no EOL components in use',
    critical: false,
  },
  {
    id:       'CHK-13',
    area:     CHECKLIST_AREAS.MONITORING,
    name:     'Error rate within threshold',
    description: 'Application error rate < 1% over rolling 24h',
    critical: false,
  },
  {
    id:       'CHK-14',
    area:     CHECKLIST_AREAS.MONITORING,
    name:     'Uptime SLO met',
    description: 'Uptime ≥ 99.5% over rolling 30 days',
    critical: false,
  },
  {
    id:       'CHK-15',
    area:     CHECKLIST_AREAS.SECURITY,
    name:     'Data retention policy enforced',
    description: 'Old data purged per retention schedule; GDPR obligations met',
    critical: false,
  },
];

/**
 * Build a checklist result record for a maintenance cycle.
 * `results` is a map of checkId → CHECK_OUTCOMES value.
 */
export function buildChecklistResult(results = {}, maintenanceTier = null) {
  const checkResults = MAINTENANCE_CHECKS.map(check => {
    const outcome = results[check.id] ?? CHECK_OUTCOMES.PENDING;
    return {
      ...check,
      outcome,
      passed:  outcome === CHECK_OUTCOMES.PASS || outcome === CHECK_OUTCOMES.NOT_APPLICABLE,
      failed:  outcome === CHECK_OUTCOMES.FAIL,
      warning: outcome === CHECK_OUTCOMES.WARNING,
    };
  });

  const criticalChecks = checkResults.filter(c => c.critical);
  const criticalFailed = criticalChecks.filter(c => c.failed);
  const totalPassed    = checkResults.filter(c => c.passed).length;
  const totalFailed    = checkResults.filter(c => c.failed).length;
  const totalWarning   = checkResults.filter(c => c.warning).length;
  const totalPending   = checkResults.filter(c => c.outcome === CHECK_OUTCOMES.PENDING).length;

  const score = Math.round((totalPassed / MAINTENANCE_CHECKS.length) * 100);

  const overallStatus = criticalFailed.length > 0 ? 'CRITICAL'
    : score >= 80 ? 'HEALTHY'
    : score >= 60 ? 'WARNING'
    : 'CRITICAL';

  return {
    total:            MAINTENANCE_CHECKS.length,
    passed:           totalPassed,
    failed:           totalFailed,
    warnings:         totalWarning,
    pending:          totalPending,
    criticalFailed:   criticalFailed.length,
    score,
    overallStatus,
    maintenanceTier,
    checks:           checkResults,
    disclaimer:       'Checklist is an operational self-assessment. Not a security audit.',
  };
}

export const MAINTENANCE_CHECKLIST_VERSION = '1.0.0';
