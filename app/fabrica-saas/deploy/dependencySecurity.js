// Dependency Security — PASO G

export const DEPENDENCY_STATUS = Object.freeze({
  OK:             'OK',
  UPGRADE_NEEDED: 'UPGRADE_NEEDED',
  CRITICAL_CVE:   'CRITICAL_CVE',
  HIGH_CVE:       'HIGH_CVE',
  EOL:            'EOL',
  UNKNOWN:        'UNKNOWN',
});

export const DEPENDENCY_AUDIT_STATUS = Object.freeze({
  PASS:         'PASS',
  WARNING:      'WARNING',
  FAIL:         'FAIL',
  SCAN_NEEDED:  'SCAN_NEEDED',
});

/**
 * Record a list of dependency audit results.
 * Each dep: { package, version, status, knownRisk, upgradeRecommended, breakingRisk, humanReviewRequired }
 */
export function auditDependencies(deps = [], options = {}) {
  if (!Array.isArray(deps)) return { valid: false, error: 'deps must be array' };

  if (deps.length === 0) {
    return {
      valid:       true,
      status:      DEPENDENCY_AUDIT_STATUS.SCAN_NEEDED,
      total:       0,
      critical:    0,
      high:        0,
      eol:         0,
      packages:    [],
      recommendation: 'Run `npm audit` to identify known CVEs',
      disclaimer:  'No dependencies provided. Run npm audit for real results.',
    };
  }

  const audited = deps.map(d => ({
    package:             d.package ?? 'unknown',
    version:             d.version ?? 'unknown',
    status:              d.status ?? DEPENDENCY_STATUS.UNKNOWN,
    knownRisk:           d.knownRisk ?? null,
    upgradeRecommended:  d.upgradeRecommended ?? false,
    breakingRisk:        d.breakingRisk ?? false,
    humanReviewRequired: d.humanReviewRequired ?? false,
  }));

  const critical = audited.filter(d => d.status === DEPENDENCY_STATUS.CRITICAL_CVE);
  const high     = audited.filter(d => d.status === DEPENDENCY_STATUS.HIGH_CVE);
  const eol      = audited.filter(d => d.status === DEPENDENCY_STATUS.EOL);
  const upgrade  = audited.filter(d => d.upgradeRecommended);

  const overallStatus = critical.length > 0 ? DEPENDENCY_AUDIT_STATUS.FAIL
    : high.length > 0 || eol.length > 0     ? DEPENDENCY_AUDIT_STATUS.WARNING
    : DEPENDENCY_AUDIT_STATUS.PASS;

  return {
    valid:         true,
    status:        overallStatus,
    total:         audited.length,
    critical:      critical.length,
    high:          high.length,
    eol:           eol.length,
    upgradeNeeded: upgrade.length,
    packages:      audited,
    humanReview:   audited.filter(d => d.humanReviewRequired).length,
    recommendation: options.recommendation ?? 'Keep dependencies current. Run `npm audit` regularly.',
    disclaimer:    'Dependency audit records provided data only. Not a live scan.',
  };
}

export const DEPENDENCY_SECURITY_VERSION = '1.0.0';
