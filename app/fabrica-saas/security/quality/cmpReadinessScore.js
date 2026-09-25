// CMP Readiness Score — ADV-19

const FACTORS = Object.freeze([
  { key: 'categories',           weight: 0.15 },
  { key: 'trackerClassification',weight: 0.15 },
  { key: 'defaultState',         weight: 0.20 },
  { key: 'withdrawal',           weight: 0.15 },
  { key: 'versioning',           weight: 0.10 },
  { key: 'preferenceCenter',     weight: 0.15 },
  { key: 'unknownTrackerBlocking',weight: 0.10 },
]);

export function computeCMPReadinessScore(scores = {}) {
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
    notApplicableWhenNoNonEssentialTracking: true,
    isReal: false,
  });
}

export const CMP_READINESS_SCORE_VERSION = '1.0.0';
