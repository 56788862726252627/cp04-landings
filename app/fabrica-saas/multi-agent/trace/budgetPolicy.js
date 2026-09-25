// Multi-Agent Budget Policy — ADV-17
// No real spend. All limits are policy enforcement fixtures.

export const BUDGET_EXCEEDED_REASON = Object.freeze({
  AGENT_COUNT:       'AGENT_COUNT',
  MODEL_SPEND_CLASS: 'MODEL_SPEND_CLASS',
  TOOL_COST:         'TOOL_COST',
  RETRY_COUNT:       'RETRY_COUNT',
  CRITIC_CYCLES:     'CRITIC_CYCLES',
  PARALLEL_BRANCHES: 'PARALLEL_BRANCHES',
});

export function createMultiAgentBudgetPolicy(config = {}) {
  const {
    maxAgents         = 5,
    maxModelSpendClass = 'MEDIUM',   // FREE | VERY_LOW | LOW | MEDIUM | HIGH
    maxToolCostClass   = 'LOW',
    maxRetries         = 3,
    maxCriticCycles    = 2,
    maxParallelBranches = 3,
  } = config;

  const COST_ORDER = { FREE: 0, VERY_LOW: 1, LOW: 2, MEDIUM: 3, HIGH: 4, UNKNOWN: 5 };

  return Object.freeze({
    maxAgents,
    maxModelSpendClass,
    maxToolCostClass,
    maxRetries,
    maxCriticCycles,
    maxParallelBranches,
    realSpend: false,

    check(usage = {}) {
      const violations = [];
      if ((usage.agentCount ?? 0) > maxAgents)
        violations.push(BUDGET_EXCEEDED_REASON.AGENT_COUNT);
      if ((COST_ORDER[usage.modelSpendClass] ?? 0) > (COST_ORDER[maxModelSpendClass] ?? 3))
        violations.push(BUDGET_EXCEEDED_REASON.MODEL_SPEND_CLASS);
      if ((usage.retries ?? 0) > maxRetries)
        violations.push(BUDGET_EXCEEDED_REASON.RETRY_COUNT);
      if ((usage.criticCycles ?? 0) > maxCriticCycles)
        violations.push(BUDGET_EXCEEDED_REASON.CRITIC_CYCLES);
      if ((usage.parallelBranches ?? 0) > maxParallelBranches)
        violations.push(BUDGET_EXCEEDED_REASON.PARALLEL_BRANCHES);

      return Object.freeze({
        withinBudget: violations.length === 0,
        violations:   Object.freeze(violations),
        isReal:       false,
      });
    },

    isReal: false,
  });
}

export const MULTIAGENT_BUDGET_POLICY_VERSION = '1.0.0';
