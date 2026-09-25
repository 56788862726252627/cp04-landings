// Agent Delegation Contract — ADV-17
// Formal contract for a supervisor→specialist task delegation.

export function createAgentDelegationContract(config = {}) {
  const {
    task              = {},
    assignedAgent     = null,
    expectedOutput    = '',
    allowedFacts      = [],
    allowedTools      = [],
    allowedWrites     = 'NONE',  // NONE | LOCAL | CRM | BOOKING
    budgetClass       = 'LOW',
    timeoutMs         = 30000,
    escalationPolicy  = 'SUPERVISOR',
    stopConditions    = ['OBJECTIVE_COMPLETE', 'BUDGET_EXHAUSTED', 'MAX_STEPS'],
  } = config;

  return Object.freeze({
    task:             Object.freeze({ ...task }),
    assignedAgentId:  assignedAgent?.id ?? null,
    expectedOutput,
    allowedFacts:     Object.freeze([...allowedFacts]),
    allowedTools:     Object.freeze([...allowedTools]),
    allowedWrites,
    budgetClass,
    timeoutMs,
    escalationPolicy,
    stopConditions:   Object.freeze([...stopConditions]),
    createdAt:        new Date().toISOString(),
    isReal:           false,
  });
}

export const AGENT_DELEGATION_CONTRACT_VERSION = '1.0.0';
