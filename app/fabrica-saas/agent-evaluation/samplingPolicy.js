// Evaluation Sampling Policy — ADV-10

export const SAMPLING_MODE = Object.freeze({
  ALL_FIXTURES:   'ALL_FIXTURES',
  ERRORS_ONLY:    'ERRORS_ONLY',
  RISK_BASED:     'RISK_BASED',
  PERCENTAGE:     'PERCENTAGE',
  MANUAL:         'MANUAL',
});

export function createEvaluationSamplingPolicy(fields = {}) {
  return Object.freeze({
    mode:       fields.mode ?? SAMPLING_MODE.ALL_FIXTURES,
    percentage: fields.percentage ?? 100,
    maxCases:   fields.maxCases ?? null,
    riskThreshold: fields.riskThreshold ?? 0.5,
    isReal: false,
  });
}

export function applyEvaluationSampling(cases = [], policy = {}) {
  const mode = policy.mode ?? SAMPLING_MODE.ALL_FIXTURES;

  if (mode === SAMPLING_MODE.ALL_FIXTURES) return cases;

  if (mode === SAMPLING_MODE.ERRORS_ONLY) {
    return cases.filter(c => c.expectedToFail || c.scenario === 'ADVERSARIAL' || c.scenario === 'FAILURE');
  }

  if (mode === SAMPLING_MODE.RISK_BASED) {
    const threshold = policy.riskThreshold ?? 0.5;
    return cases.filter(c => (c.riskScore ?? 0) >= threshold);
  }

  if (mode === SAMPLING_MODE.PERCENTAGE) {
    const pct = Math.max(0, Math.min(100, policy.percentage ?? 100));
    const take = Math.ceil(cases.length * pct / 100);
    return cases.slice(0, take);
  }

  if (mode === SAMPLING_MODE.MANUAL) {
    const ids = new Set(policy.manualIds ?? []);
    return cases.filter(c => ids.has(c.id));
  }

  return cases;
}

export const SAMPLING_POLICY_VERSION = '1.0.0';
