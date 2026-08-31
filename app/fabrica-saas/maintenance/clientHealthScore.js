// Client Health Score — PASO F
// Composite score 0-100 from multiple audit dimensions.

export const HEALTH_LABELS = Object.freeze({
  HEALTHY:  'HEALTHY',   // 80-100
  WATCH:    'WATCH',     // 60-79
  AT_RISK:  'AT_RISK',   // 40-59
  CRITICAL: 'CRITICAL',  // 0-39
});

const DIMENSION_WEIGHTS = {
  checklistScore:  0.30,
  backupScore:     0.20,
  securityScore:   0.25,
  automationScore: 0.15,
  aiScore:         0.10,
};

/**
 * Calculate a composite client health score.
 *
 * @param {object} dimensions - { checklistScore, backupScore, securityScore, automationScore, aiScore }
 * @returns { score, label, breakdown }
 */
export function calculateClientHealthScore(dimensions = {}) {
  const resolved = {
    checklistScore:  dimensions.checklistScore  ?? 0,
    backupScore:     dimensions.backupScore      ?? 0,
    securityScore:   dimensions.securityScore    ?? 0,
    automationScore: dimensions.automationScore  ?? 100, // default: not audited = not penalized
    aiScore:         dimensions.aiScore          ?? 100,
  };

  const weighted = Object.entries(DIMENSION_WEIGHTS).reduce((acc, [key, weight]) => {
    return acc + (resolved[key] * weight);
  }, 0);

  const score = Math.round(Math.min(100, Math.max(0, weighted)));

  const label = score >= 80 ? HEALTH_LABELS.HEALTHY
    : score >= 60            ? HEALTH_LABELS.WATCH
    : score >= 40            ? HEALTH_LABELS.AT_RISK
    : HEALTH_LABELS.CRITICAL;

  const breakdown = Object.entries(DIMENSION_WEIGHTS).map(([key, weight]) => ({
    dimension:    key,
    score:        resolved[key],
    weight:       `${Math.round(weight * 100)}%`,
    contribution: Math.round(resolved[key] * weight),
  }));

  const recommendations = buildRecommendations(resolved, label);

  return {
    score,
    label,
    breakdown,
    recommendations,
    disclaimer: 'Health score is an operational metric. Not a compliance or security certification.',
  };
}

function buildRecommendations(dimensions, label) {
  const recs = [];

  if (dimensions.securityScore < 70)   recs.push('Run security review — score below threshold');
  if (dimensions.backupScore < 70)     recs.push('Review backup policy — last backup or restore test may be overdue');
  if (dimensions.checklistScore < 70)  recs.push('Address checklist failures before next maintenance cycle');
  if (dimensions.automationScore < 70) recs.push('Check automation scenarios — errors or inactive flows detected');
  if (dimensions.aiScore < 70)         recs.push('Review AI agent health — latency or availability issues');
  if (label === HEALTH_LABELS.CRITICAL) recs.push('URGENT: Schedule emergency maintenance review with client');

  return recs;
}

/**
 * Compare two consecutive health scores and generate a trend.
 */
export function compareHealthScores(previous, current) {
  if (typeof previous !== 'number' || typeof current !== 'number') {
    return { valid: false, error: 'Both scores must be numbers' };
  }

  const delta = current - previous;
  const trend = delta > 5 ? 'IMPROVING' : delta < -5 ? 'DECLINING' : 'STABLE';

  return { valid: true, previous, current, delta, trend };
}

export const CLIENT_HEALTH_SCORE_VERSION = '1.0.0';
