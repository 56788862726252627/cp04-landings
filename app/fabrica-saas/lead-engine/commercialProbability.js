// Commercial Probability — ADV-08

export const COMMERCIAL_PROBABILITY = Object.freeze({
  VERY_HIGH: 'VERY_HIGH',
  HIGH:      'HIGH',
  MEDIUM:    'MEDIUM',
  LOW:       'LOW',
});

export function estimateCommercialProbability(lead = {}) {
  const score      = lead.opportunityScore ?? 0;
  const quality    = lead.dataQualityScore ?? 0;
  const confidence = lead.confidence ?? 0;

  const composite = score * 0.5 + quality * 0.3 + confidence * 0.2;

  const probability = composite >= 75 ? COMMERCIAL_PROBABILITY.VERY_HIGH
    : composite >= 55 ? COMMERCIAL_PROBABILITY.HIGH
    : composite >= 35 ? COMMERCIAL_PROBABILITY.MEDIUM
    : COMMERCIAL_PROBABILITY.LOW;

  return Object.freeze({
    probability,
    composite:    Math.round(composite),
    note:         'Ordinal estimate only — no historical conversion data available.',
    isReal: false,
  });
}

export const COMMERCIAL_PROBABILITY_VERSION = '1.0.0';
