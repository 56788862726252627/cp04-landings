// Privacy Quality Score — ADV-19

const FACTORS = Object.freeze([
  { key: 'dataInventory',      weight: 0.12 },
  { key: 'purpose',            weight: 0.10 },
  { key: 'minimization',       weight: 0.10 },
  { key: 'retention',          weight: 0.10 },
  { key: 'rights',             weight: 0.12 },
  { key: 'consent',            weight: 0.12 },
  { key: 'cmp',                weight: 0.08 },
  { key: 'piiProtection',      weight: 0.10 },
  { key: 'processorAwareness', weight: 0.08 },
  { key: 'aiPrivacy',          weight: 0.05 },
  { key: 'auditability',       weight: 0.03 },
]);

export function computePrivacyQualityScore(scores = {}) {
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

export const PRIVACY_QUALITY_SCORE_VERSION = '1.0.0';
