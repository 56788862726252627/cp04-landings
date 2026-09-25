// Dependency Scan — ADV-02 CI/CD Automatizado
// REUSE: patrón de deploy/dependencySecurity.js — adaptado para CI pipeline.
// No ejecuta npm upgrade automático.

export const DEP_RISK = Object.freeze({
  SAFE:     'SAFE',
  WARNING:  'WARNING',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
  UNKNOWN:  'UNKNOWN',
});

export const DEP_STATUS = Object.freeze({
  PASS:    'PASS',
  WARNING: 'WARNING',
  FAIL:    'FAIL',
});

/**
 * Evaluate dependency risk from npm audit JSON output.
 * auditData: parsed npm audit --json output (or null if not available).
 */
export function evaluateDependencyRisk(auditData = null) {
  if (!auditData) {
    return {
      valid:        true,
      status:       DEP_STATUS.PASS,
      risk:         DEP_RISK.UNKNOWN,
      criticalCVEs: 0,
      highCVEs:     0,
      moderateCVEs: 0,
      totalAdvisories: 0,
      message:      'npm audit not available — dependency risk UNKNOWN',
      disclaimer:   'Run npm audit --json for full dependency analysis.',
    };
  }

  // Handle both npm audit v6 and v7+ formats
  let criticalCVEs = 0;
  let highCVEs     = 0;
  let moderateCVEs = 0;
  let totalAdvisories = 0;

  if (auditData.metadata?.vulnerabilities) {
    const v = auditData.metadata.vulnerabilities;
    criticalCVEs    = v.critical ?? 0;
    highCVEs        = v.high     ?? 0;
    moderateCVEs    = v.moderate ?? 0;
    totalAdvisories = (v.critical ?? 0) + (v.high ?? 0) + (v.moderate ?? 0) + (v.low ?? 0);
  } else if (auditData.vulnerabilities) {
    const entries = Object.values(auditData.vulnerabilities);
    for (const dep of entries) {
      if (dep.severity === 'critical') criticalCVEs++;
      else if (dep.severity === 'high') highCVEs++;
      else if (dep.severity === 'moderate') moderateCVEs++;
      totalAdvisories++;
    }
  }

  const risk   = criticalCVEs > 0 ? DEP_RISK.CRITICAL
    : highCVEs > 0                ? DEP_RISK.HIGH
    : moderateCVEs > 0            ? DEP_RISK.WARNING
    : DEP_RISK.SAFE;

  const status = criticalCVEs > 0 ? DEP_STATUS.FAIL
    : highCVEs > 0                ? DEP_STATUS.WARNING
    : DEP_STATUS.PASS;

  return {
    valid:           true,
    status,
    risk,
    criticalCVEs,
    highCVEs,
    moderateCVEs,
    totalAdvisories,
    message:         `${criticalCVEs} critical, ${highCVEs} high, ${moderateCVEs} moderate vulnerabilities`,
    disclaimer:      'NO_AUTO_UPGRADE. Review and upgrade manually.',
  };
}

/**
 * Quick risk assessment from a package-lock dependency list (no npm audit).
 * packages: array of { name, version }
 */
export function assessKnownRiskyPackages(packages = []) {
  const KNOWN_RISKY = new Map([
    ['node-serialize',   { risk: DEP_RISK.CRITICAL, reason: 'RCE vulnerability via deserialization' }],
    ['xmldom',           { risk: DEP_RISK.HIGH,     reason: 'XXE vulnerability in older versions' }],
    ['serialize-javascript', { risk: DEP_RISK.MEDIUM, reason: 'XSS in older versions' }],
  ]);

  const findings = [];
  for (const pkg of packages) {
    const known = KNOWN_RISKY.get(pkg.name);
    if (known) findings.push({ ...pkg, ...known });
  }

  return {
    checked: packages.length,
    findings,
    hasKnownRisky: findings.length > 0,
  };
}

export const DEPENDENCY_SCAN_VERSION = '1.0.0';
