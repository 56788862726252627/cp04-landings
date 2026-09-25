// Dependency Security Policy — ADV-19 (connects ADV-15)

export const DEPENDENCY_STATUS = Object.freeze({
  SAFE:        'SAFE',
  VULNERABLE:  'VULNERABLE',
  DEPRECATED:  'DEPRECATED',
  UNVERIFIED:  'UNVERIFIED',
  BLOCKED:     'BLOCKED',
});

export function createDependencySecurityPolicy(config = {}) {
  const {
    lockfilePresent = false,
    vulnerabilities = [],
    deprecated = [],
    unverifiedProvenance = [],
    clientId = null,
  } = config;

  const issues = [];
  if (!lockfilePresent)          issues.push({ issue: 'NO_LOCKFILE', severity: 'HIGH' });
  if (vulnerabilities.length > 0) {
    for (const v of vulnerabilities) {
      issues.push({ issue: `VULNERABILITY:${v}`, severity: 'CRITICAL' });
    }
  }
  if (deprecated.length > 0) {
    for (const d of deprecated) {
      issues.push({ issue: `DEPRECATED:${d}`, severity: 'MEDIUM' });
    }
  }
  if (unverifiedProvenance.length > 0) {
    for (const u of unverifiedProvenance) {
      issues.push({ issue: `SUPPLY_CHAIN_WARNING:${u}`, severity: 'HIGH' });
    }
  }

  const critical = issues.filter(i => i.severity === 'CRITICAL');
  return Object.freeze({
    clientId,
    lockfilePresent,
    issues: Object.freeze(issues.map(i => Object.freeze(i))),
    criticalCount: critical.length,
    status: critical.length > 0
      ? DEPENDENCY_STATUS.BLOCKED
      : issues.length > 0
        ? DEPENDENCY_STATUS.VULNERABLE
        : DEPENDENCY_STATUS.SAFE,
    isReal: false,
  });
}

export const DEPENDENCY_SECURITY_VERSION = '1.0.0';
