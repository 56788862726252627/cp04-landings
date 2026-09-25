// Security Quality Score — ADV-19

const FACTORS = Object.freeze([
  { key: 'auth',            weight: 0.15 },
  { key: 'authorization',   weight: 0.15 },
  { key: 'secrets',         weight: 0.15 },
  { key: 'input',           weight: 0.10 },
  { key: 'output',          weight: 0.10 },
  { key: 'clientIsolation', weight: 0.15 },
  { key: 'aiSafety',        weight: 0.05 },
  { key: 'logging',         weight: 0.05 },
  { key: 'dependency',      weight: 0.05 },
  { key: 'incidentReadiness',weight: 0.05 },
]);

export function computeSecurityQualityScore(scores = {}) {
  let total = 0;
  const breakdown = {};

  for (const { key, weight } of FACTORS) {
    const raw = scores[key] ?? 0;
    const clamped = Math.max(0, Math.min(100, raw));
    breakdown[key] = { raw: clamped, weight, contribution: +(clamped * weight).toFixed(2) };
    total += clamped * weight;
  }

  const final = Math.round(total);

  return Object.freeze({
    score: final,
    breakdown: Object.freeze(breakdown),
    factors: Object.freeze([...FACTORS]),
    grade: final >= 95 ? 'A+' : final >= 90 ? 'A' : final >= 80 ? 'B' : final >= 70 ? 'C' : 'F',
    isReal: false,
  });
}

export const SECURITY_QUALITY_SCORE_VERSION = '1.0.0';
