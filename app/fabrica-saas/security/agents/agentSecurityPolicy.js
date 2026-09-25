// Agent Security Policy — ADV-19 (connects ADV-17)

export const AGENT_SECURITY_CONTROL = Object.freeze({
  NO_SELF_PERMISSION:          'NO_SELF_PERMISSION',
  NO_CROSS_CLIENT_MEMORY:      'NO_CROSS_CLIENT_MEMORY',
  NO_EXTERNAL_ACTION_UNAUTH:   'NO_EXTERNAL_ACTION_WITHOUT_APPROVAL',
  NO_BUSINESS_TRUTH_BYPASS:    'NO_BUSINESS_TRUTH_BYPASS',
  NO_SECRET_PROPAGATION:       'NO_SECRET_PROPAGATION',
  PROMPT_INJECTION_GUARD:      'PROMPT_INJECTION_GUARD',
});

export function createAgentSecurityPolicy(config = {}) {
  const {
    agentId = null,
    allowedOperations = [],
    humanApprovalRequired = [],
    clientId = null,
  } = config;

  const enforced = Object.values(AGENT_SECURITY_CONTROL);

  function validate(operation = {}) {
    const { type, targetClientId, selfPermissionAttempt, bypassAttempt } = operation;

    if (selfPermissionAttempt) {
      return Object.freeze({ allowed: false, reason: 'SELF_PERMISSION_BLOCKED', isReal: false });
    }

    if (targetClientId && targetClientId !== clientId) {
      return Object.freeze({ allowed: false, reason: 'CROSS_CLIENT_BLOCKED', isReal: false });
    }

    if (bypassAttempt) {
      return Object.freeze({ allowed: false, reason: 'BYPASS_BLOCKED', isReal: false });
    }

    const needsHuman = humanApprovalRequired.includes(type);
    if (needsHuman && !operation.humanApproved) {
      return Object.freeze({ allowed: false, reason: 'HUMAN_APPROVAL_REQUIRED', isReal: false });
    }

    if (allowedOperations.length > 0 && !allowedOperations.includes(type)) {
      return Object.freeze({ allowed: false, reason: 'OPERATION_NOT_IN_ALLOWLIST', isReal: false });
    }

    return Object.freeze({ allowed: true, reason: 'OK', isReal: false });
  }

  return Object.freeze({
    agentId,
    clientId,
    enforced: Object.freeze([...enforced]),
    allowedOperations: Object.freeze([...allowedOperations]),
    humanApprovalRequired: Object.freeze([...humanApprovalRequired]),
    validate,
    isReal: false,
  });
}

export const AGENT_SECURITY_VERSION = '1.0.0';
