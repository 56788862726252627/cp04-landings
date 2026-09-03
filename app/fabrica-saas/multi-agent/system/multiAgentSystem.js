// Multi-Agent System — ADV-17
// Top-level container for a coordinated agent workflow.

export const SYSTEM_STATE = Object.freeze({
  IDLE:           'IDLE',
  PLANNING:       'PLANNING',
  RUNNING:        'RUNNING',
  WAITING_AGENT:  'WAITING_AGENT',
  WAITING_HUMAN:  'WAITING_HUMAN',
  COMPLETED:      'COMPLETED',
  FAILED:         'FAILED',
  BLOCKED:        'BLOCKED',
  CANCELLED:      'CANCELLED',
});

export function createMultiAgentSystem(config = {}) {
  const {
    id                = `mas-${Date.now()}`,
    clientId          = 'unknown',
    businessId        = 'unknown',
    vertical          = 'GENERIC',
    objective         = '',
    supervisorAgent   = null,
    specialistAgents  = [],
    coordinationPolicy = null,
    sharedContextPolicy = null,
    budgetPolicy      = null,
    approvalPolicy    = null,
  } = config;

  return Object.freeze({
    id,
    clientId,
    businessId,
    vertical,
    objective,
    supervisorAgent,
    specialistAgents: Object.freeze([...specialistAgents]),
    coordinationPolicy,
    sharedContextPolicy,
    budgetPolicy,
    approvalPolicy,
    state:     SYSTEM_STATE.IDLE,
    createdAt: new Date().toISOString(),
    isReal:    false,
  });
}

export const MULTI_AGENT_SYSTEM_VERSION = '1.0.0';
