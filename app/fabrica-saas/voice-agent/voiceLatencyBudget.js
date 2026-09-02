// Voice Latency Budget — ADV-11

export const LATENCY_COMPONENT = Object.freeze({
  STT:          'STT',
  PLANNING:     'PLANNING',
  TOOL_CALL:    'TOOL_CALL',
  LLM:          'LLM',
  TTS:          'TTS',
});

export const LATENCY_BUDGET_MS = Object.freeze({
  [LATENCY_COMPONENT.STT]:       300,
  [LATENCY_COMPONENT.PLANNING]:  100,
  [LATENCY_COMPONENT.TOOL_CALL]: 500,
  [LATENCY_COMPONENT.LLM]:       800,
  [LATENCY_COMPONENT.TTS]:       200,
  TOTAL:                        1900,
});

export function measureLatency(component = '', actualMs = 0) {
  const budget = LATENCY_BUDGET_MS[component] ?? 0;
  return Object.freeze({
    component,
    actualMs,
    budgetMs:   budget,
    overBudget: actualMs > budget,
    deltaMs:    actualMs - budget,
    isReal: false,
  });
}

export function createVoiceLatencyBudget(measurements = {}) {
  const totalMs   = Object.values(measurements).reduce((s, v) => s + (v ?? 0), 0);
  const overBudget = totalMs > LATENCY_BUDGET_MS.TOTAL;
  return Object.freeze({
    measurements:  Object.freeze({ ...measurements }),
    totalMs,
    budgetMs:      LATENCY_BUDGET_MS.TOTAL,
    overBudget,
    isReal: false,
  });
}

export const VOICE_LATENCY_BUDGET_VERSION = '1.0.0';
