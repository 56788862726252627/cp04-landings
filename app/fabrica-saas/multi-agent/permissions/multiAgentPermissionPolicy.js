// Multi-Agent Permission Policy — ADV-17
// Each agent receives minimum scope: tools, business, data, write.

export const PERMISSION_SCOPE = Object.freeze({
  TOOL_READ:      'TOOL_READ',
  TOOL_WRITE:     'TOOL_WRITE',
  DATA_READ:      'DATA_READ',
  DATA_WRITE:     'DATA_WRITE',
  CRM_READ:       'CRM_READ',
  CRM_WRITE:      'CRM_WRITE',
  BOOKING_WRITE:  'BOOKING_WRITE',
  EXTERNAL_WRITE: 'EXTERNAL_WRITE',
  ADMIN:          'ADMIN',
});

export function createMultiAgentPermissionPolicy(config = {}) {
  const {
    agentId          = 'unknown',
    role             = 'CHAT',
    grantedScopes    = [PERMISSION_SCOPE.TOOL_READ, PERMISSION_SCOPE.DATA_READ],
    clientId         = 'unknown',
  } = config;

  return Object.freeze({
    agentId,
    role,
    clientId,
    grantedScopes: Object.freeze([...grantedScopes]),

    hasScope(scope) {
      return grantedScopes.includes(scope);
    },

    canWrite() {
      return grantedScopes.some(s =>
        [PERMISSION_SCOPE.DATA_WRITE, PERMISSION_SCOPE.CRM_WRITE,
         PERMISSION_SCOPE.BOOKING_WRITE, PERMISSION_SCOPE.EXTERNAL_WRITE].includes(s)
      );
    },

    canActExternal() {
      return grantedScopes.includes(PERMISSION_SCOPE.EXTERNAL_WRITE);
    },

    // Agents can never self-grant
    selfGrant() {
      return Object.freeze({ allowed: false, reason: 'SELF_GRANT_PROHIBITED', isReal: false });
    },

    isReal: false,
  });
}

export const MULTI_AGENT_PERMISSION_POLICY_VERSION = '1.0.0';
