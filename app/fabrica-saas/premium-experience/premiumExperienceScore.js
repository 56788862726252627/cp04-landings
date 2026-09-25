// Premium Experience Score — ADV-07

export const SCORE_FACTORS = Object.freeze({
  VISUAL_HIERARCHY:    { weight: 0.12 },
  BUSINESS_FIT:        { weight: 0.15 },
  NAVIGATION:          { weight: 0.10 },
  RESPONSIVE:          { weight: 0.10 },
  FORMS:               { weight: 0.08 },
  STATES:              { weight: 0.08 },
  ACCESSIBILITY:       { weight: 0.10 },
  CONSISTENCY:         { weight: 0.08 },
  INTERACTION:         { weight: 0.07 },
  TRUST:               { weight: 0.05 },
  PERFORMANCE:         { weight: 0.04 },
  CONTENT_CLARITY:     { weight: 0.03 },
});

export const SCORE_THRESHOLDS = Object.freeze({
  EXCELLENT: 95,
  GREAT:     90,
  GOOD:      80,
  ACCEPTABLE:70,
  NEEDS_WORK:60,
});

const BLOCKING_FACTORS = ['VISUAL_HIERARCHY', 'NAVIGATION', 'RESPONSIVE'];

export function calculatePremiumExperienceScore(factors = {}) {
  let weightedSum   = 0;
  let totalWeight   = 0;
  const breakdown   = {};
  const criticalFailures = [];

  for (const [factor, { weight }] of Object.entries(SCORE_FACTORS)) {
    const raw   = factors[factor] ?? 0;
    const score = Math.max(0, Math.min(100, raw));
    const contribution = score * weight;
    weightedSum  += contribution;
    totalWeight  += weight;
    breakdown[factor] = { score, weight, contribution: Math.round(contribution * 10) / 10 };

    if (BLOCKING_FACTORS.includes(factor) && score < 50) {
      criticalFailures.push({ factor, score });
    }
  }

  const rawScore     = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const finalScore   = criticalFailures.length > 0
    ? Math.min(rawScore, 49)
    : rawScore;
  const roundedScore = Math.round(finalScore * 10) / 10;

  const grade = roundedScore >= SCORE_THRESHOLDS.EXCELLENT ? 'A+'
    : roundedScore >= SCORE_THRESHOLDS.GREAT       ? 'A'
    : roundedScore >= SCORE_THRESHOLDS.GOOD        ? 'B'
    : roundedScore >= SCORE_THRESHOLDS.ACCEPTABLE  ? 'C'
    : roundedScore >= SCORE_THRESHOLDS.NEEDS_WORK  ? 'D'
    : 'F';

  return Object.freeze({
    score:          roundedScore,
    grade,
    breakdown,
    criticalFailures,
    blocked:        criticalFailures.length > 0,
    isReal:         false,
  });
}

export const PREMIUM_EXPERIENCE_SCORE_VERSION = '1.0.0';
