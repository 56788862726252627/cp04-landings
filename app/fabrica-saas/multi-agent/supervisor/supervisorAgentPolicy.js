// Supervisor Agent Policy — ADV-17
// Defines responsibilities and constraints for the supervisor role.

export const SUPERVISOR_ACTION = Object.freeze({
  DECOMPOSE:        'DECOMPOSE',
  SELECT_AGENT:     'SELECT_AGENT',
  DELEGATE:         'DELEGATE',
  TRACK:            'TRACK',
  DETECT_CONFLICT:  'DETECT_CONFLICT',
  REQUEST_APPROVAL: 'REQUEST_APPROVAL',
  AGGREGATE:        'AGGREGATE',
  STOP:             'STOP',
});

export function createSupervisorAgentPolicy(config = {}) {
  const {
    maxSpecialists         = 5,
    maxDelegationDepth     = 2,    // supervisor does not sub-delegate to another supervisor
    requiresHumanForHighRisk = true,
    allowDirectExecution   = false, // supervisor must delegate, not execute
    maxRetryPerTask        = 2,
    conflictResolutionMode = 'BUSINESS_TRUTH_FIRST',
  } = config;

  return Object.freeze({
    maxSpecialists,
    maxDelegationDepth,
    requiresHumanForHighRisk,
    allowDirectExecution,
    maxRetryPerTask,
    conflictResolutionMode,

    canDelegate(taskRisk, agentCapabilities, requiredCapabilities) {
      if (!requiredCapabilities.every(c => agentCapabilities.includes(c))) {
        return Object.freeze({ allowed: false, reason: 'CAPABILITY_MISMATCH', isReal: false });
      }
      if (taskRisk === 'CRITICAL' && !requiresHumanForHighRisk) {
        return Object.freeze({ allowed: false, reason: 'CRITICAL_REQUIRES_HUMAN', isReal: false });
      }
      return Object.freeze({ allowed: true, reason: null, isReal: false });
    },

    canStop(reason) {
      const validReasons = ['OBJECTIVE_COMPLETE', 'BLOCKED', 'BUDGET_EXHAUSTED', 'MAX_STEPS', 'HUMAN_REQUIRED', 'CONFLICT_UNRESOLVED', 'QUALITY_GATE_FAIL'];
      return validReasons.includes(reason);
    },

    isReal: false,
  });
}

export const SUPERVISOR_AGENT_POLICY_VERSION = '1.0.0';
