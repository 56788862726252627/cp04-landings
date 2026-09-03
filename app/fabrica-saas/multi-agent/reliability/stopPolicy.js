// Multi-Agent Stop Policy — ADV-17

export const STOP_REASON = Object.freeze({
  OBJECTIVE_COMPLETE:   'OBJECTIVE_COMPLETE',
  BLOCKED_DEPENDENCY:   'BLOCKED_DEPENDENCY',
  HUMAN_REQUIRED:       'HUMAN_REQUIRED',
  BUDGET_EXHAUSTED:     'BUDGET_EXHAUSTED',
  MAX_STEPS:            'MAX_STEPS',
  REPEATED_FAILURE:     'REPEATED_FAILURE',
  CONFLICT_UNRESOLVED:  'CONFLICT_UNRESOLVED',
  QUALITY_GATE_FAIL:    'QUALITY_GATE_FAIL',
  TIMEOUT:              'TIMEOUT',
  CANCELLED:            'CANCELLED',
});

export function createMultiAgentStopPolicy(config = {}) {
  const {
    maxSteps          = 20,
    maxRetries        = 3,
    timeoutMs         = 300000,
    qualityThreshold  = 80,
  } = config;

  return Object.freeze({
    maxSteps,
    maxRetries,
    timeoutMs,
    qualityThreshold,

    shouldStop(state = {}) {
      if (state.objectiveComplete)                       return Object.freeze({ stop: true, reason: STOP_REASON.OBJECTIVE_COMPLETE,  isReal: false });
      if ((state.steps ?? 0) >= maxSteps)                return Object.freeze({ stop: true, reason: STOP_REASON.MAX_STEPS,           isReal: false });
      if ((state.failures ?? 0) >= maxRetries)           return Object.freeze({ stop: true, reason: STOP_REASON.REPEATED_FAILURE,    isReal: false });
      if (state.humanRequired)                           return Object.freeze({ stop: true, reason: STOP_REASON.HUMAN_REQUIRED,      isReal: false });
      if (state.budgetExhausted)                         return Object.freeze({ stop: true, reason: STOP_REASON.BUDGET_EXHAUSTED,    isReal: false });
      if (state.conflictUnresolved)                      return Object.freeze({ stop: true, reason: STOP_REASON.CONFLICT_UNRESOLVED, isReal: false });
      if (state.qualityScore < qualityThreshold)         return Object.freeze({ stop: true, reason: STOP_REASON.QUALITY_GATE_FAIL,   isReal: false });
      return Object.freeze({ stop: false, reason: null, isReal: false });
    },

    isReal: false,
  });
}

export const STOP_POLICY_VERSION = '1.0.0';
