// Health Score Explanation — ADV-20 (explainability, deterministic)

export function createHealthScoreExplanation(config = {}) {
  const { score = 0, signals = [], weights = {}, blockers = [] } = config;

  const positiveFactors = [];
  const negativeFactors = [];

  for (const signal of signals) {
    const w = weights[signal.dimension] ?? 1;
    if (signal.score >= 80) {
      positiveFactors.push(Object.freeze({ dimension: signal.dimension, score: signal.score, contribution: Math.round(signal.score * w) }));
    } else if (signal.score < 60) {
      negativeFactors.push(Object.freeze({ dimension: signal.dimension, score: signal.score, contribution: Math.round(signal.score * w) }));
    }
  }

  positiveFactors.sort((a, b) => b.contribution - a.contribution);
  negativeFactors.sort((a, b) => a.contribution - b.contribution);

  return Object.freeze({
    score,
    grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'F',
    topPositiveFactors: Object.freeze(positiveFactors.slice(0, 3)),
    topNegativeFactors: Object.freeze(negativeFactors.slice(0, 3)),
    blockers: Object.freeze([...blockers]),
    deterministic: true,
    isReal: false,
  });
}

export const HEALTH_SCORE_EXPLANATION_VERSION = '1.0.0';
