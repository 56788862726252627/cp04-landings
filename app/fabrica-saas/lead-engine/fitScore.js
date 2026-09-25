// Fit Score — ADV-08

const SUPPORTED_VERTICALS = new Set([
  'dental','fisio','veterinary','legal','beauty','padel','education','restaurant','estetica','default',
]);

const DIGITAL_GAP_LEVEL = {
  ABSENT:      100,
  MINIMAL:     85,
  BASIC:       65,
  ESTABLISHED: 35,
  ADVANCED:    10,
};

export function calculateFitScore(lead = {}, weights = {}) {
  const w = {
    verticalCompatibility: weights.verticalCompatibility ?? 25,
    problemServiceMatch:   weights.problemServiceMatch   ?? 25,
    technicalFeasibility:  weights.technicalFeasibility  ?? 20,
    businessSizeFit:       weights.businessSizeFit       ?? 10,
    digitalGap:            weights.digitalGap            ?? 15,
    agencyCapability:      weights.agencyCapability      ?? 5,
  };

  const total = Object.values(w).reduce((a, b) => a + b, 0);

  const vertical = (lead.vertical ?? 'default').toLowerCase();
  const vertScore    = SUPPORTED_VERTICALS.has(vertical) ? 90 : 50;

  const painCount    = (lead.painSignals ?? []).length;
  const matchScore   = Math.min(100, 40 + painCount * 15);

  const hasWebsite   = Boolean(lead.website || lead.domain);
  const techScore    = hasWebsite ? 80 : 60;

  const sizeMap      = { MICRO: 90, SMALL: 85, MEDIUM: 65, LARGE: 40, UNKNOWN: 60 };
  const sizeScore    = sizeMap[lead.estimatedSize] ?? 60;

  const matLevel     = lead.digitalMaturityLevel ?? 'BASIC';
  const gapScore     = DIGITAL_GAP_LEVEL[matLevel] ?? 65;

  const capScore     = 80;

  const raw = (
    vertScore  * w.verticalCompatibility +
    matchScore * w.problemServiceMatch +
    techScore  * w.technicalFeasibility +
    sizeScore  * w.businessSizeFit +
    gapScore   * w.digitalGap +
    capScore   * w.agencyCapability
  ) / total;

  return Object.freeze({
    score:   Math.round(Math.min(100, Math.max(0, raw))),
    factors: Object.freeze({ vertScore, matchScore, techScore, sizeScore, gapScore, capScore }),
    weights: Object.freeze(w),
    isReal: false,
  });
}

export const FIT_SCORE_VERSION = '1.0.0';
