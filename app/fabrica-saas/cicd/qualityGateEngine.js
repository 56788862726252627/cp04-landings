// Quality Gate Engine — ADV-02 CI/CD Automatizado
// evaluateQualityGates(): evalúa 8 gates P0. Cualquier P0 FAIL → bloquea merge/release.

export const GATE_STATUS = Object.freeze({
  PASS:           'PASS',
  WARNING:        'WARNING',
  FAIL:           'FAIL',
  BLOCKED:        'BLOCKED',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
});

export const GATE_ID = Object.freeze({
  TEST_GATE:        'TEST_GATE',
  LINT_GATE:        'LINT_GATE',
  BUILD_GATE:       'BUILD_GATE',
  SECURITY_GATE:    'SECURITY_GATE',
  SECRET_GATE:      'SECRET_GATE',
  DEPENDENCY_GATE:  'DEPENDENCY_GATE',
  REGRESSION_GATE:  'REGRESSION_GATE',
  ARTIFACT_GATE:    'ARTIFACT_GATE',
});

export const GATE_PRIORITY = Object.freeze({
  [GATE_ID.SECRET_GATE]:     'P0',
  [GATE_ID.TEST_GATE]:       'P0',
  [GATE_ID.LINT_GATE]:       'P0',
  [GATE_ID.BUILD_GATE]:      'P0',
  [GATE_ID.SECURITY_GATE]:   'P0',
  [GATE_ID.ARTIFACT_GATE]:   'P0',
  [GATE_ID.DEPENDENCY_GATE]: 'P1',
  [GATE_ID.REGRESSION_GATE]: 'P1',
});

function makeGate(id, status, detail = {}) {
  return Object.freeze({
    gateId:   id,
    status,
    priority: GATE_PRIORITY[id] ?? 'P1',
    blocking: GATE_PRIORITY[id] === 'P0',
    ...detail,
  });
}

/**
 * Evaluate all quality gates from CI context.
 * context: {
 *   testResult:        { passed, failed, total, preExistingFails }
 *   lintResult:        { errorCount }
 *   buildResult:       { success, durationMs }
 *   secretResult:      { secretsFound, critical }
 *   securityResult:    { hasCritical, hasHigh }
 *   dependencyResult:  { criticalCVEs, highCVEs }
 *   regressionResult:  { riskLevel }  — 'LOW'|'MEDIUM'|'HIGH'
 *   artifactResult:    { valid, missingFiles }
 * }
 */
export function evaluateQualityGates(context = {}) {
  const {
    testResult       = null,
    lintResult       = null,
    buildResult      = null,
    secretResult     = null,
    securityResult   = null,
    dependencyResult = null,
    regressionResult = null,
    artifactResult   = null,
  } = context;

  const gates = [];

  // SECRET_GATE — P0
  if (secretResult) {
    const critical = secretResult.critical || secretResult.secretsFound > 0;
    gates.push(makeGate(GATE_ID.SECRET_GATE,
      critical ? GATE_STATUS.BLOCKED : GATE_STATUS.PASS,
      { secretsFound: secretResult.secretsFound ?? 0, message: critical ? 'Secrets detected — merge blocked' : 'No secrets detected' }
    ));
  } else {
    gates.push(makeGate(GATE_ID.SECRET_GATE, GATE_STATUS.NOT_APPLICABLE, { message: 'Secret scan not run' }));
  }

  // TEST_GATE — P0
  if (testResult) {
    const newFails = (testResult.failed ?? 0) - (testResult.preExistingFails ?? 0);
    const status = newFails > 0        ? GATE_STATUS.FAIL
      : testResult.failed > 0          ? GATE_STATUS.WARNING  // pre-existing only
      : GATE_STATUS.PASS;
    gates.push(makeGate(GATE_ID.TEST_GATE, status, {
      passed: testResult.passed ?? 0,
      failed: testResult.failed ?? 0,
      total:  testResult.total  ?? 0,
      newFails,
      message: status === GATE_STATUS.FAIL ? `${newFails} new test failure(s)` : `${testResult.passed}/${testResult.total} tests passed`,
    }));
  } else {
    gates.push(makeGate(GATE_ID.TEST_GATE, GATE_STATUS.NOT_APPLICABLE, { message: 'Tests not run' }));
  }

  // LINT_GATE — P0
  if (lintResult) {
    const status = (lintResult.errorCount ?? 0) > 0 ? GATE_STATUS.FAIL : GATE_STATUS.PASS;
    gates.push(makeGate(GATE_ID.LINT_GATE, status, {
      errorCount: lintResult.errorCount ?? 0,
      message: status === GATE_STATUS.FAIL ? `${lintResult.errorCount} lint error(s)` : 'No lint errors',
    }));
  } else {
    gates.push(makeGate(GATE_ID.LINT_GATE, GATE_STATUS.NOT_APPLICABLE, { message: 'Lint not run' }));
  }

  // BUILD_GATE — P0
  if (buildResult) {
    const status = buildResult.success ? GATE_STATUS.PASS : GATE_STATUS.FAIL;
    gates.push(makeGate(GATE_ID.BUILD_GATE, status, {
      durationMs: buildResult.durationMs ?? null,
      message: status === GATE_STATUS.FAIL ? 'Build failed' : `Build passed in ${buildResult.durationMs ?? '?'}ms`,
    }));
  } else {
    gates.push(makeGate(GATE_ID.BUILD_GATE, GATE_STATUS.NOT_APPLICABLE, { message: 'Build not run' }));
  }

  // SECURITY_GATE — P0
  if (securityResult) {
    const status = securityResult.hasCritical ? GATE_STATUS.BLOCKED
      : securityResult.hasHigh               ? GATE_STATUS.WARNING
      : GATE_STATUS.PASS;
    gates.push(makeGate(GATE_ID.SECURITY_GATE, status, {
      message: status === GATE_STATUS.BLOCKED ? 'Critical security issue detected' : 'Security check passed',
    }));
  } else {
    gates.push(makeGate(GATE_ID.SECURITY_GATE, GATE_STATUS.NOT_APPLICABLE, { message: 'Security scan not run' }));
  }

  // DEPENDENCY_GATE — P1
  if (dependencyResult) {
    const status = (dependencyResult.criticalCVEs ?? 0) > 0 ? GATE_STATUS.FAIL
      : (dependencyResult.highCVEs ?? 0) > 0               ? GATE_STATUS.WARNING
      : GATE_STATUS.PASS;
    gates.push(makeGate(GATE_ID.DEPENDENCY_GATE, status, {
      criticalCVEs: dependencyResult.criticalCVEs ?? 0,
      highCVEs:     dependencyResult.highCVEs ?? 0,
      message: `${dependencyResult.criticalCVEs ?? 0} critical, ${dependencyResult.highCVEs ?? 0} high CVEs`,
    }));
  } else {
    gates.push(makeGate(GATE_ID.DEPENDENCY_GATE, GATE_STATUS.NOT_APPLICABLE, { message: 'Dependency scan not run' }));
  }

  // REGRESSION_GATE — P1
  if (regressionResult) {
    const status = regressionResult.riskLevel === 'HIGH'   ? GATE_STATUS.WARNING
      : regressionResult.riskLevel === 'MEDIUM'            ? GATE_STATUS.WARNING
      : GATE_STATUS.PASS;
    gates.push(makeGate(GATE_ID.REGRESSION_GATE, status, {
      riskLevel: regressionResult.riskLevel ?? 'LOW',
      message: `Regression risk: ${regressionResult.riskLevel ?? 'LOW'}`,
    }));
  } else {
    gates.push(makeGate(GATE_ID.REGRESSION_GATE, GATE_STATUS.NOT_APPLICABLE, { message: 'Regression analysis not run' }));
  }

  // ARTIFACT_GATE — P0
  if (artifactResult) {
    const status = artifactResult.valid ? GATE_STATUS.PASS : GATE_STATUS.FAIL;
    gates.push(makeGate(GATE_ID.ARTIFACT_GATE, status, {
      missingFiles: artifactResult.missingFiles ?? [],
      message: status === GATE_STATUS.FAIL ? `Artifact invalid: ${(artifactResult.missingFiles ?? []).join(', ')}` : 'Artifact valid',
    }));
  } else {
    gates.push(makeGate(GATE_ID.ARTIFACT_GATE, GATE_STATUS.NOT_APPLICABLE, { message: 'Artifact not validated' }));
  }

  const p0Failures = gates.filter(g => g.priority === 'P0' && (g.status === GATE_STATUS.FAIL || g.status === GATE_STATUS.BLOCKED));
  const warnings   = gates.filter(g => g.status === GATE_STATUS.WARNING);
  const blocked    = p0Failures.length > 0;
  const overallStatus = blocked ? GATE_STATUS.BLOCKED : warnings.length > 0 ? GATE_STATUS.WARNING : GATE_STATUS.PASS;

  return {
    valid:         true,
    overallStatus,
    blocked,
    gates,
    p0Failures:    p0Failures.map(g => g.gateId),
    warnings:      warnings.map(g => g.gateId),
    gateCount:     gates.length,
    passCount:     gates.filter(g => g.status === GATE_STATUS.PASS).length,
    disclaimer:    'Quality gates are advisory unless enforced by branch protection.',
  };
}

export const QUALITY_GATE_ENGINE_VERSION = '1.0.0';
