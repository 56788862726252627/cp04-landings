// Critic Policy + QA Agent Profile — ADV-17

export function createAgentCriticPolicy(config = {}) {
  const {
    maxCycles         = 2,   // never loop infinitely
    useForHighValue   = true,
    useForHighRisk    = true,
    useForComplexPlan = true,
  } = config;

  return Object.freeze({
    maxCycles,

    shouldCritique(output) {
      if (useForHighValue   && output?.highValue)    return true;
      if (useForHighRisk    && output?.highRisk)     return true;
      if (useForComplexPlan && output?.complexPlan)  return true;
      return false;
    },

    critique(output, cycle = 0) {
      if (cycle >= maxCycles) {
        return Object.freeze({ accepted: true, cycle, reason: 'MAX_CYCLES_REACHED', isReal: false });
      }
      // Fixture critique — always passes in clean state
      return Object.freeze({
        accepted: true,
        cycle,
        feedback: Object.freeze([]),
        improvements: Object.freeze([]),
        isReal: false,
      });
    },

    isReal: false,
  });
}

export function createQAAgentProfile(config = {}) {
  const {
    agentId        = 'qa-agent',
    evaluationDimensions = ['FACT_ACCURACY', 'POLICY', 'BUSINESS_FIT', 'OUTPUT_QUALITY', 'TOOL_USAGE', 'HANDOFF'],
  } = config;

  return Object.freeze({
    agentId,
    role:       'QA',
    evaluationDimensions: Object.freeze([...evaluationDimensions]),
    canExecuteExternalActions: false, // QA agent never acts externally

    // eslint-disable-next-line no-unused-vars
    evaluate(output = {}) {
      const scores = Object.fromEntries(evaluationDimensions.map(d => [d, 90]));
      const overall = Math.round(Object.values(scores).reduce((a,b)=>a+b,0) / evaluationDimensions.length);
      return Object.freeze({ overall, scores: Object.freeze(scores), pass: overall >= 80, isReal: false });
    },

    isReal: false,
  });
}

export const CRITIC_POLICY_VERSION = '1.0.0';
