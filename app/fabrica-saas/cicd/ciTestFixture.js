// CI Test Fixture — ADV-02 CI/CD Automatizado
// Proyecto ficticio Factory para tests de integración CI.

export const FIXTURE_PROJECT = Object.freeze({
  clientId:    'FACTORY-DEMO-CI',
  projectId:   'demo-dental-saas',
  branch:      'feature/factory-advanced-02-cicd',
  commitSha:   'abc1234def5678',
  version:     '1.0.0',
  isReal:      false,
  dataType:    'FIXTURE',
  disclaimer:  'All CI data is fictional. No real client.',
});

export function makeTestResult(overrides = {}) {
  return { passed: 238, failed: 1, total: 239, preExistingFails: 1, ...overrides };
}

export function makeCleanTestResult() {
  return makeTestResult({ passed: 238, failed: 1, total: 239, preExistingFails: 1 });
}

export function makeFailingTestResult() {
  return makeTestResult({ passed: 200, failed: 5, total: 205, preExistingFails: 1 });
}

export function makeLintResult(overrides = {}) {
  return { errorCount: 0, ...overrides };
}

export function makeFailingLintResult() {
  return makeLintResult({ errorCount: 3 });
}

export function makeBuildResult(overrides = {}) {
  return { success: true, durationMs: 535, ...overrides };
}

export function makeFailingBuildResult() {
  return makeBuildResult({ success: false, durationMs: 1200 });
}

export function makeSecretResult(overrides = {}) {
  return { secretsFound: 0, critical: false, criticalCount: 0, highCount: 0, findings: [], ...overrides };
}

export function makeSecretFoundResult() {
  return makeSecretResult({
    secretsFound: 1, critical: true, criticalCount: 1,
    findings: [{ file: 'src/config.js', line: 5, type: 'STRIPE_LIVE_KEY', risk: 'CRITICAL', redactedPreview: 'sk_liv...[REDACTED:STRIPE_LIVE_KEY]' }],
  });
}

export function makeSecurityResult(overrides = {}) {
  return { hasCritical: false, hasHigh: false, ...overrides };
}

export function makeDependencyResult(overrides = {}) {
  return { status: 'PASS', risk: 'SAFE', criticalCVEs: 0, highCVEs: 0, moderateCVEs: 0, ...overrides };
}

export function makeArtifactResult(overrides = {}) {
  return { valid: true, status: 'VALID', errors: [], warnings: [], missingFiles: [], fileCount: 12, ...overrides };
}

export function makeInvalidArtifactResult() {
  return makeArtifactResult({ valid: false, status: 'INVALID', errors: ['index.html not found'], missingFiles: ['index.html'] });
}

/**
 * Simulate a clean, passing PR run.
 */
export function simulateCleanPR() {
  return {
    testResult:      makeCleanTestResult(),
    lintResult:      makeLintResult(),
    buildResult:     makeBuildResult(),
    secretResult:    makeSecretResult(),
    securityResult:  makeSecurityResult(),
    dependencyResult: makeDependencyResult(),
    artifactResult:  makeArtifactResult(),
    commitSha:       FIXTURE_PROJECT.commitSha,
    branch:          FIXTURE_PROJECT.branch,
    pipelineId:      'factory-pr-pipeline',
    durationMs:      4200,
    scenario:        'clean_pr',
    isReal:          false,
  };
}

/**
 * Simulate a secret-detected scenario.
 */
export function simulateSecretDetected() {
  return {
    ...simulateCleanPR(),
    secretResult: makeSecretFoundResult(),
    scenario:     'secret_detected',
  };
}

/**
 * Simulate failing tests scenario.
 */
export function simulateTestFailure() {
  return {
    ...simulateCleanPR(),
    testResult: makeFailingTestResult(),
    scenario:   'test_failure',
  };
}

/**
 * Simulate lint failure scenario.
 */
export function simulateLintFailure() {
  return {
    ...simulateCleanPR(),
    lintResult: makeFailingLintResult(),
    scenario:   'lint_failure',
  };
}

/**
 * Simulate build failure scenario.
 */
export function simulateBuildFailure() {
  return {
    ...simulateCleanPR(),
    buildResult:   makeFailingBuildResult(),
    artifactResult: makeInvalidArtifactResult(),
    scenario:      'build_failure',
  };
}

export const CI_TEST_FIXTURE_VERSION = '1.0.0';
