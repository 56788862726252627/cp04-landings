// Agent Evaluation V2 — ADV-17 (extends ADV-10)
// New dimensions for multi-agent scenarios.

export const EVAL_DIMENSION_V2 = Object.freeze({
  // ADV-10 dimensions (retained)
  TASK_COMPLETION:      'TASK_COMPLETION',
  QUALITY:              'QUALITY',
  EFFICIENCY:           'EFFICIENCY',
  SAFETY:               'SAFETY',
  // V2 new dimensions
  DELEGATION_QUALITY:       'DELEGATION_QUALITY',
  AGENT_SELECTION:          'AGENT_SELECTION',
  HANDOFF_QUALITY:          'HANDOFF_QUALITY',
  CONFLICT_RESOLUTION:      'CONFLICT_RESOLUTION',
  SHARED_CONTEXT_SAFETY:    'SHARED_CONTEXT_SAFETY',
  PARALLELISM_QUALITY:      'PARALLELISM_QUALITY',
  AUTONOMY_COMPLIANCE:      'AUTONOMY_COMPLIANCE',
  SUPERVISOR_QUALITY:       'SUPERVISOR_QUALITY',
});

export function createAgentEvaluationV2(config = {}) {
  const {
    agentId       = 'unknown',
    isMultiAgent  = false,
    dimensions    = Object.values(EVAL_DIMENSION_V2),
  } = config;

  return Object.freeze({
    agentId,
    isMultiAgent,
    dimensions: Object.freeze([...dimensions]),

    evaluate(scores = {}) {
      const result = {};
      let total    = 0;
      let count    = 0;

      for (const dim of dimensions) {
        const s         = Math.max(0, Math.min(100, scores[dim] ?? 90));
        result[dim]     = s;
        total          += s;
        count          += 1;
      }

      const overall = count ? Math.round(total / count) : 0;
      return Object.freeze({
        agentId,
        overall,
        scores:  Object.freeze(result),
        pass:    overall >= 80,
        isReal:  false,
      });
    },

    isReal: false,
  });
}

export const AGENT_EVALUATION_V2_VERSION = '1.0.0';
