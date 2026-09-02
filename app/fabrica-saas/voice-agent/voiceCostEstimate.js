// Voice Cost Estimate — ADV-11

export const COST_STATE = Object.freeze({
  FREE:      'FREE',
  ESTIMATED: 'ESTIMATED',
  UNKNOWN:   'UNKNOWN',
  PAID:      'PAID',       // only for future real integrations
});

export function createVoiceCostEstimate(breakdown = {}) {
  const totalEUR = Object.values(breakdown).reduce((s, v) => s + (v ?? 0), 0);
  return Object.freeze({
    state:     totalEUR === 0 ? COST_STATE.FREE : COST_STATE.ESTIMATED,
    totalEUR,
    breakdown: Object.freeze({ ...breakdown }),
    noRealCost: true,
    isReal: false,
  });
}

export const ZERO_COST_ESTIMATE = createVoiceCostEstimate({});

export const VOICE_COST_ESTIMATE_VERSION = '1.0.0';
