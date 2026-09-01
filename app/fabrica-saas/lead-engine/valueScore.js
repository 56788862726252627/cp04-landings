// Value Score — ADV-08

const SIZE_VALUE = { LARGE: 90, MEDIUM: 70, SMALL: 50, MICRO: 30, UNKNOWN: 40 };

export const ESTIMATED_VALUE_LEVEL = Object.freeze({
  VERY_HIGH: 'VERY_HIGH',
  HIGH:      'HIGH',
  MEDIUM:    'MEDIUM',
  LOW:       'LOW',
});

export function calculateValueScore(lead = {}, weights = {}) {
  const w = weights.value ?? 1;

  const sizeScore     = SIZE_VALUE[lead.estimatedSize] ?? 40;

  const services      = lead.recommendedServices ?? [];
  const breadthBonus  = Math.min(25, services.length * 5);

  const multiLoc      = lead.multiLocation ? 20 : 0;
  const aiPotential   = (lead.digitalSignals ?? []).includes('AI_SIGNALS') ? 10 : 0;

  const raw = Math.min(100, sizeScore + breadthBonus + multiLoc + aiPotential);
  const finalScore = Math.round(raw * w);

  return Object.freeze({
    score:        finalScore,
    sizeScore,
    breadthBonus,
    multiLocation: multiLoc > 0,
    aiPotential:   aiPotential > 0,
    isReal: false,
  });
}

export const VALUE_SCORE_VERSION = '1.0.0';
