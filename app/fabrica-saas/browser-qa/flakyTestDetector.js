// Flaky Test Detector — ADV-06
// Detects and classifies flaky E2E tests based on run history.

export const FLAKY_CLASS = Object.freeze({
  TIMING:      'TIMING',
  NETWORK:     'NETWORK',
  STATE_LEAK:  'STATE_LEAK',
  SELECTOR:    'SELECTOR',
  ANIMATION:   'ANIMATION',
  RACE_COND:   'RACE_COND',
  ENVIRONMENT: 'ENVIRONMENT',
  UNKNOWN:     'UNKNOWN',
});

export const FLAKY_SEVERITY = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH:     'HIGH',
  MEDIUM:   'MEDIUM',
  LOW:      'LOW',
});

export const FLAKY_THRESHOLD = Object.freeze({
  STRICT:   { maxFailRate: 0.0,  label: 'STRICT' },
  MODERATE: { maxFailRate: 0.1,  label: 'MODERATE' },
  RELAXED:  { maxFailRate: 0.2,  label: 'RELAXED' },
});

export function createTestRunRecord(testId, passed, options = {}) {
  return Object.freeze({
    testId,
    passed,
    durationMs: options.durationMs ?? 0,
    error:      options.error ?? null,
    runAt:      new Date().toISOString(),
    isReal:     false,
  });
}

export function analyzeTestHistory(testId, runs = []) {
  if (!Array.isArray(runs) || runs.length === 0) {
    return { valid: false, error: 'runs array required' };
  }
  const relevant = runs.filter(r => r.testId === testId);
  const failures  = relevant.filter(r => !r.passed);
  const failRate  = relevant.length > 0 ? failures.length / relevant.length : 0;

  const isFlaky   = failRate > 0 && failRate < 1.0;
  const isConsistent = failRate === 0 || failRate === 1.0;

  const durations = relevant.map(r => r.durationMs).filter(d => d > 0);
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

  const highVariance = maxDuration > avgDuration * 2 && avgDuration > 0;

  return Object.freeze({
    valid:      true,
    testId,
    runCount:   relevant.length,
    failCount:  failures.length,
    failRate,
    isFlaky,
    isConsistent,
    highVariance,
    avgDurationMs: Math.round(avgDuration),
    maxDurationMs: maxDuration,
    isReal:     false,
  });
}

export function classifyFlakiness(analysis = {}) {
  if (!analysis.valid || !analysis.isFlaky) return null;

  const errorTexts = analysis.sampleErrors ?? [];
  if (errorTexts.some(e => /timeout|Timeout/i.test(e))) return FLAKY_CLASS.TIMING;
  if (errorTexts.some(e => /network|net::|ERR_/i.test(e))) return FLAKY_CLASS.NETWORK;
  if (errorTexts.some(e => /selector|locator|element/i.test(e))) return FLAKY_CLASS.SELECTOR;
  if (analysis.highVariance) return FLAKY_CLASS.TIMING;
  return FLAKY_CLASS.UNKNOWN;
}

export function buildFlakyReport(histories = []) {
  const flaky      = histories.filter(h => h.valid && h.isFlaky);
  const stable     = histories.filter(h => h.valid && h.isConsistent && h.failRate === 0);
  const alwaysFail = histories.filter(h => h.valid && h.failRate === 1.0);

  return Object.freeze({
    valid:          true,
    totalTests:     histories.length,
    flakyCount:     flaky.length,
    stableCount:    stable.length,
    alwaysFailCount:alwaysFail.length,
    flaky,
    alwaysFail,
    flakyRate:      histories.length > 0 ? flaky.length / histories.length : 0,
    isReal:         false,
  });
}

export const FLAKY_TEST_DETECTOR_VERSION = '1.0.0';
