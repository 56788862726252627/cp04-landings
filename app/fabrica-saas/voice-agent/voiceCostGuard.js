// Voice Cost Guard — ADV-11
// NO_REAL_COST=SI — all estimates are simulation only

export const COST_APPROVAL_STATUS = Object.freeze({
  FREE:       'FREE',
  APPROVED:   'APPROVED',
  DENIED:     'DENIED',
  SIMULATED:  'SIMULATED',
});

export const COST_GATE_TYPE = Object.freeze({
  TTS_CHARS:    'TTS_CHARS',
  STT_SECONDS:  'STT_SECONDS',
  LLM_TOKENS:   'LLM_TOKENS',
  TELEPHONY_MIN:'TELEPHONY_MIN',
});

const SIMULATED_COST_RATES = Object.freeze({
  [COST_GATE_TYPE.TTS_CHARS]:     0,   // EUR per char (simulated = 0)
  [COST_GATE_TYPE.STT_SECONDS]:   0,
  [COST_GATE_TYPE.LLM_TOKENS]:    0,
  [COST_GATE_TYPE.TELEPHONY_MIN]: 0,
});

export function estimateCost(gateType = '', quantity = 0) {
  return Object.freeze({
    gateType,
    quantity,
    estimatedEUR: (SIMULATED_COST_RATES[gateType] ?? 0) * quantity,
    status:       COST_APPROVAL_STATUS.SIMULATED,
    noRealCost:   true,
    isReal: false,
  });
}

export function approveCost(estimate = {}) {
  return Object.freeze({
    approved: true,
    status:   COST_APPROVAL_STATUS.SIMULATED,
    estimate,
    isReal: false,
  });
}

export const VOICE_COST_GUARD_VERSION = '1.0.0';
