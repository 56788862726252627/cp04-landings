// Regression Gate — ADV-02 CI/CD Automatizado
// evaluateRegressionRisk(): compara baseline con estado actual.

export const REGRESSION_RISK = Object.freeze({
  LOW:     'LOW',
  MEDIUM:  'MEDIUM',
  HIGH:    'HIGH',
  UNKNOWN: 'UNKNOWN',
});

const CRITICAL_FILE_PATTERNS = [
  /factory-registry\/index\.js$/,
  /observability\/index\.js$/,
  /deploy\/releaseGates\.js$/,
  /deploy\/preDeployReadiness\.js$/,
  /cicd\/qualityGateEngine\.js$/,
  /src\/components\/App\.jsx$/,
  /worker\/.*\.js$/,
];

function isCriticalFile(filePath) {
  return CRITICAL_FILE_PATTERNS.some(p => p.test(filePath));
}

/**
 * Evaluate regression risk from test deltas and file changes.
 * params: {
 *   baseline: { testCount, passCount, buildSuccess }  — previous known-good state
 *   current:  { testCount, passCount, failCount, buildSuccess }
 *   changedFiles: string[]  — list of changed file paths
 *   removedTests: number   — tests removed vs baseline
 * }
 */
export function evaluateRegressionRisk(params = {}) {
  const { baseline = null, current = null, changedFiles = [], removedTests = 0 } = params;

  const factors = [];
  let riskScore = 0;

  // Removed tests
  if (removedTests > 0) {
    factors.push({ factor: 'removed_tests', count: removedTests, weight: 2 });
    riskScore += removedTests * 2;
  }

  // New test failures
  if (baseline && current) {
    const newFailures = Math.max(0, (current.failCount ?? 0) - (baseline.failCount ?? 0));
    if (newFailures > 0) {
      factors.push({ factor: 'new_test_failures', count: newFailures, weight: 5 });
      riskScore += newFailures * 5;
    }

    // Test count drop
    if (current.testCount < baseline.testCount) {
      const dropped = baseline.testCount - current.testCount;
      factors.push({ factor: 'test_count_drop', count: dropped, weight: 3 });
      riskScore += dropped * 3;
    }

    // Build regression
    if (baseline.buildSuccess && !current.buildSuccess) {
      factors.push({ factor: 'build_regression', count: 1, weight: 10 });
      riskScore += 10;
    }
  }

  // Critical files touched
  const criticalTouched = changedFiles.filter(isCriticalFile);
  if (criticalTouched.length > 0) {
    factors.push({ factor: 'critical_files_touched', files: criticalTouched, weight: 3 });
    riskScore += criticalTouched.length * 3;
  }

  const riskLevel = riskScore === 0 ? REGRESSION_RISK.LOW
    : riskScore <= 5               ? REGRESSION_RISK.LOW
    : riskScore <= 15              ? REGRESSION_RISK.MEDIUM
    : REGRESSION_RISK.HIGH;

  return {
    valid:          true,
    riskLevel,
    riskScore,
    factors,
    criticalFilesTouched: criticalTouched,
    hasBaseline:    baseline !== null,
    message:        `Regression risk: ${riskLevel} (score: ${riskScore})`,
  };
}

export const REGRESSION_GATE_VERSION = '1.0.0';
