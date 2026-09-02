// Reproducible Environment Quality Score — ADV-15

const FACTORS = Object.freeze([
  { name: 'reproducibility',   weight: 15 },
  { name: 'security',          weight: 20 },
  { name: 'buildDeterminism',  weight: 15 },
  { name: 'runtimeCompatibility', weight: 10 },
  { name: 'secrets',           weight: 20 },
  { name: 'health',            weight: 10 },
  { name: 'rollback',          weight: 5  },
  { name: 'ciIntegration',     weight: 5  },
  { name: 'targetFit',         weight: 5  },
  { name: 'fallback',          weight: 5  },  // ADV-15: total 110 → normalize
]);

const TOTAL_WEIGHT = FACTORS.reduce((s, f) => s + f.weight, 0);

export function computeReproducibleEnvironmentQualityScore(metrics = {}) {
  const scores = {};
  const violations = [];

  for (const f of FACTORS) {
    const raw = metrics[f.name];
    const score = typeof raw === 'number' ? Math.max(0, Math.min(100, raw)) : 0;
    scores[f.name] = score;
    if (score < 50) {
      violations.push({ factor: f.name, score, threshold: 50 });
    }
  }

  const weighted = FACTORS.reduce((sum, f) => sum + (scores[f.name] * f.weight), 0);
  const overall = Math.round(weighted / TOTAL_WEIGHT);

  return Object.freeze({
    overall,
    scores:           Object.freeze(scores),
    violations:       Object.freeze(violations),
    productionReady:  overall >= 85 && violations.length === 0,
    isReal:           false,
  });
}

export const REPRODUCIBLE_ENV_QUALITY_SCORE_VERSION = '1.0.0';
