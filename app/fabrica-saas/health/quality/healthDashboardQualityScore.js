// Health Dashboard Quality Score — ADV-20 (9 quality factors)

export const QUALITY_FACTOR = Object.freeze({
  SIGNAL_COVERAGE:      'SIGNAL_COVERAGE',
  CORRECT_AGGREGATION:  'CORRECT_AGGREGATION',
  FRESHNESS:            'FRESHNESS',
  RISK_PRIORITIZATION:  'RISK_PRIORITIZATION',
  CLIENT_ISOLATION:     'CLIENT_ISOLATION',
  ACTIONABILITY:        'ACTIONABILITY',
  EXPLAINABILITY:       'EXPLAINABILITY',
  ACCURACY:             'ACCURACY',
  ACCESSIBILITY:        'ACCESSIBILITY',
});

const MAX_FACTOR_SCORE = 100 / Object.keys(QUALITY_FACTOR).length;

export function computeHealthDashboardQualityScore(factors = {}) {
  const keys = Object.keys(QUALITY_FACTOR);
  const factorScores = {};
  let rawTotal = 0;

  for (const key of keys) {
    const v = factors[key] ?? 0;
    const clamped = Math.min(1, Math.max(0, v));
    const raw = clamped * MAX_FACTOR_SCORE;
    factorScores[key] = Math.round(raw * 100) / 100;
    rawTotal += raw;
  }

  // Accumulate unrounded contributions; clamp prevents float overshoot above 100
  const total = Math.min(100, Math.max(0, Math.round(rawTotal * 100) / 100));

  return Object.freeze({
    score: total,
    maxScore: 100,
    grade: total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : 'F',
    factorScores: Object.freeze(factorScores),
    factors: Object.keys(QUALITY_FACTOR).length,
    isReal: false,
  });
}

export const HEALTH_DASHBOARD_QUALITY_SCORE_VERSION = '1.0.0';
