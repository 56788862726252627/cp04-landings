// GDPR Technical Readiness Score — ADV-19
// TECHNICAL READINESS ONLY — NOT GDPR_CERTIFIED

const FACTORS = Object.freeze([
  { key: 'dataMapping',        weight: 0.15 },
  { key: 'rightsFoundation',   weight: 0.15 },
  { key: 'retention',          weight: 0.10 },
  { key: 'consent',            weight: 0.12 },
  { key: 'audit',              weight: 0.10 },
  { key: 'security',           weight: 0.12 },
  { key: 'privacy',            weight: 0.08 },
  { key: 'processors',         weight: 0.08 },
  { key: 'breachFoundation',   weight: 0.05 },
  { key: 'deletionFoundation', weight: 0.05 },
]);

export function computeGDPRTechnicalReadinessScore(scores = {}) {
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
    label: 'GDPR_TECHNICAL_READINESS',
    legalCertification: false,
    disclaimer: 'TECHNICAL_READINESS_ONLY_NOT_LEGAL_CERTIFICATION',
    isReal: false,
  });
}

export const GDPR_READINESS_SCORE_VERSION = '1.0.0';
