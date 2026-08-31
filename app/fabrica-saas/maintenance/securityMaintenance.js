// Security Maintenance — PASO F
// Periodic security review for maintenance cycles.

export const SECURITY_CHECK_STATUS = Object.freeze({
  PASS:    'PASS',
  FAIL:    'FAIL',
  WARNING: 'WARNING',
  UNKNOWN: 'UNKNOWN',
});

export const SECURITY_HEALTH_STATUS = Object.freeze({
  HEALTHY:  'HEALTHY',
  WARNING:  'WARNING',
  CRITICAL: 'CRITICAL',
  UNKNOWN:  'UNKNOWN',
});

const SECURITY_CHECKS = [
  { id: 'SEC-01', name: 'SSL certificates valid',       critical: true },
  { id: 'SEC-02', name: 'No secrets in codebase',       critical: true },
  { id: 'SEC-03', name: 'Dependencies patched (HIGH/CRITICAL CVEs)', critical: true },
  { id: 'SEC-04', name: 'CORS policy correct',          critical: false },
  { id: 'SEC-05', name: 'CSP headers present',          critical: false },
  { id: 'SEC-06', name: 'Auth tokens expire correctly', critical: true },
  { id: 'SEC-07', name: 'Rate limiting active',         critical: false },
  { id: 'SEC-08', name: 'Data retention enforced',      critical: false },
  { id: 'SEC-09', name: 'Access log reviewed',          critical: false },
  { id: 'SEC-10', name: 'API keys rotated per schedule',critical: false },
];

/**
 * Run a security maintenance review.
 * `checks` is a map of checkId → SECURITY_CHECK_STATUS value.
 */
export function runSecurityMaintenance(input = {}) {
  const checks = input.checks ?? {};
  const overrideNote = input.note ?? null;

  const results = SECURITY_CHECKS.map(check => {
    const status = checks[check.id] ?? SECURITY_CHECK_STATUS.UNKNOWN;
    return {
      ...check,
      status,
      passed:  status === SECURITY_CHECK_STATUS.PASS,
      failed:  status === SECURITY_CHECK_STATUS.FAIL,
      warning: status === SECURITY_CHECK_STATUS.WARNING,
    };
  });

  const criticalFailed = results.filter(r => r.critical && r.failed);
  const totalFailed    = results.filter(r => r.failed).length;
  const totalWarning   = results.filter(r => r.warning).length;
  const totalPassed    = results.filter(r => r.passed).length;
  const totalUnknown   = results.filter(r => r.status === SECURITY_CHECK_STATUS.UNKNOWN).length;

  const scoreBase   = (totalPassed / SECURITY_CHECKS.length) * 100;
  const scorePenalty = criticalFailed.length * 15;
  const healthScore = Math.max(0, Math.round(scoreBase - scorePenalty));

  const status = criticalFailed.length > 0 ? SECURITY_HEALTH_STATUS.CRITICAL
    : healthScore < 70                     ? SECURITY_HEALTH_STATUS.WARNING
    : totalUnknown > 5                     ? SECURITY_HEALTH_STATUS.WARNING
    : SECURITY_HEALTH_STATUS.HEALTHY;

  return {
    valid:          true,
    healthScore,
    status,
    total:          SECURITY_CHECKS.length,
    passed:         totalPassed,
    failed:         totalFailed,
    warnings:       totalWarning,
    unknown:        totalUnknown,
    criticalFailed: criticalFailed.length,
    criticalFailedIds: criticalFailed.map(r => r.id),
    results,
    note:           overrideNote,
    disclaimer:     'Security maintenance is an operational self-assessment. Not a penetration test.',
  };
}

export const SECURITY_MAINTENANCE_VERSION = '1.0.0';
