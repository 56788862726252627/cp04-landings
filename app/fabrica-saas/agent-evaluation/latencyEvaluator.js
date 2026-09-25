// Agent Latency Evaluator — ADV-10

export const LATENCY_STATUS = Object.freeze({
  FAST:       'FAST',
  ACCEPTABLE: 'ACCEPTABLE',
  SLOW:       'SLOW',
  CRITICAL:   'CRITICAL',
});

const THRESHOLDS_MS = Object.freeze({
  CHAT:    { fast: 1000, acceptable: 2500, slow: 5000 },
  SALES:   { fast: 1500, acceptable: 3000, slow: 6000 },
  SUPPORT: { fast: 1500, acceptable: 3000, slow: 6000 },
  BOOKING: { fast: 1200, acceptable: 2500, slow: 5000 },
  VOICE:   { fast: 500,  acceptable: 1200, slow: 2500 },
  DEFAULT: { fast: 1500, acceptable: 3000, slow: 6000 },
});

export function createAgentLatencyEvaluator(fields = {}) {
  const channel   = (fields.channel ?? 'DEFAULT').toUpperCase();
  const thresholds = THRESHOLDS_MS[channel] ?? THRESHOLDS_MS.DEFAULT;
  const latencyMs  = fields.latencyMs ?? 0;

  const status = latencyMs <= thresholds.fast       ? LATENCY_STATUS.FAST
               : latencyMs <= thresholds.acceptable  ? LATENCY_STATUS.ACCEPTABLE
               : latencyMs <= thresholds.slow         ? LATENCY_STATUS.SLOW
               : LATENCY_STATUS.CRITICAL;

  const breakdown = Object.freeze({
    planningMs:  fields.planningMs  ?? 0,
    modelMs:     fields.modelMs     ?? latencyMs,
    toolMs:      fields.toolMs      ?? 0,
    totalMs:     latencyMs,
  });

  return Object.freeze({
    channel, latencyMs, status, thresholds, breakdown,
    isReal: false,
  });
}

export const LATENCY_EVALUATOR_VERSION = '1.0.0';
