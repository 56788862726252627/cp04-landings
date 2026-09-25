// Multi-Agent Quality Gate — ADV-17

export const MULTIAGENT_GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARN:    'WARN',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

export const MULTIAGENT_BLOCK_REASON = Object.freeze({
  UNAUTHORIZED_AGENT_ACTION:    'UNAUTHORIZED_AGENT_ACTION',
  CROSS_CLIENT_AGENT_MEMORY:    'CROSS_CLIENT_AGENT_MEMORY',
  INFINITE_AGENT_LOOP:          'INFINITE_AGENT_LOOP',
  UNSAFE_PARALLEL_WRITE:        'UNSAFE_PARALLEL_WRITE',
  INVALID_HANDOFF:              'INVALID_HANDOFF',
  PERMISSION_SELF_ESCALATION:   'PERMISSION_SELF_ESCALATION',
  BUSINESS_TRUTH_BYPASS:        'BUSINESS_TRUTH_BYPASS',
  UNAPPROVED_EXTERNAL_ACTION:   'UNAPPROVED_EXTERNAL_ACTION',
  AGENT_DEADLOCK_UNHANDLED:     'AGENT_DEADLOCK_UNHANDLED',
  BUDGET_BYPASS:                'BUDGET_BYPASS',
});

export function evaluateMultiAgentQualityGate(params = {}) {
  const {
    score                    = 100,
    noUnauthorizedAction     = true,
    noClientMemoryLeak       = true,
    noLoop                   = true,
    noUnsafeWrite            = true,
    handoffValid             = true,
    noSelfEscalation         = true,
    businessTruthRespected   = true,
    noUnapprovedExternal     = true,
    deadlockHandled          = true,
    budgetRespected          = true,
  } = params;

  const blocks = [];
  if (!noUnauthorizedAction)   blocks.push(MULTIAGENT_BLOCK_REASON.UNAUTHORIZED_AGENT_ACTION);
  if (!noClientMemoryLeak)     blocks.push(MULTIAGENT_BLOCK_REASON.CROSS_CLIENT_AGENT_MEMORY);
  if (!noLoop)                 blocks.push(MULTIAGENT_BLOCK_REASON.INFINITE_AGENT_LOOP);
  if (!noUnsafeWrite)          blocks.push(MULTIAGENT_BLOCK_REASON.UNSAFE_PARALLEL_WRITE);
  if (!handoffValid)           blocks.push(MULTIAGENT_BLOCK_REASON.INVALID_HANDOFF);
  if (!noSelfEscalation)       blocks.push(MULTIAGENT_BLOCK_REASON.PERMISSION_SELF_ESCALATION);
  if (!businessTruthRespected) blocks.push(MULTIAGENT_BLOCK_REASON.BUSINESS_TRUTH_BYPASS);
  if (!noUnapprovedExternal)   blocks.push(MULTIAGENT_BLOCK_REASON.UNAPPROVED_EXTERNAL_ACTION);
  if (!deadlockHandled)        blocks.push(MULTIAGENT_BLOCK_REASON.AGENT_DEADLOCK_UNHANDLED);
  if (!budgetRespected)        blocks.push(MULTIAGENT_BLOCK_REASON.BUDGET_BYPASS);

  if (blocks.length > 0) {
    return Object.freeze({ status: MULTIAGENT_GATE_STATUS.BLOCKED, blocks: Object.freeze(blocks), score, isReal: false });
  }
  if (score < 80) {
    return Object.freeze({ status: MULTIAGENT_GATE_STATUS.FAIL, blocks: Object.freeze([]), score, isReal: false });
  }
  if (score < 90) {
    return Object.freeze({ status: MULTIAGENT_GATE_STATUS.WARN, blocks: Object.freeze([]), score, isReal: false });
  }
  return Object.freeze({ status: MULTIAGENT_GATE_STATUS.PASS, blocks: Object.freeze([]), score, isReal: false });
}

export const MULTIAGENT_QUALITY_GATE_VERSION = '1.0.0';
