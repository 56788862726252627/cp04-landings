// Permission Escalation Policy — ADV-17
// Agents can REQUEST escalation. They can NEVER self-grant.

export const ESCALATION_STATUS = Object.freeze({
  PENDING:  'PENDING',
  APPROVED: 'APPROVED',
  DENIED:   'DENIED',
  BLOCKED:  'BLOCKED',
});

export function createAgentPermissionEscalationPolicy(config = {}) {
  const {
    requiresHumanApproval  = true,
    allowedEscalationScopes = ['CRM_WRITE', 'BOOKING_WRITE'],
  } = config;

  return Object.freeze({
    requiresHumanApproval,
    allowedEscalationScopes: Object.freeze([...allowedEscalationScopes]),

    requestEscalation(agentId, requestedScope) {
      // Self-grant attempt is always blocked
      if (!allowedEscalationScopes.includes(requestedScope)) {
        return Object.freeze({ status: ESCALATION_STATUS.BLOCKED, agentId, requestedScope, reason: 'SCOPE_NOT_ESCALATABLE', isReal: false });
      }
      return Object.freeze({
        status:         ESCALATION_STATUS.PENDING,
        agentId,
        requestedScope,
        requiresHuman:  requiresHumanApproval,
        selfGranted:    false,  // always false
        isReal:         false,
      });
    },

    isSelfGrant(agentId, grantedByAgentId) {
      return agentId === grantedByAgentId;
    },

    isReal: false,
  });
}

export const PERMISSION_ESCALATION_POLICY_VERSION = '1.0.0';
