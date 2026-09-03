// Tool Security Policy — ADV-19 (connects ADV-12 MCP)

export const TOOL_SENSITIVITY = Object.freeze({
  READ_ONLY: 'READ_ONLY',
  WRITE:     'WRITE',
  ADMIN:     'ADMIN',
  EXTERNAL:  'EXTERNAL',
});

export function createToolSecurityPolicy(config = {}) {
  const {
    allowedTools = [],
    allowedServers = [],
    writeRequiresHuman = true,
    externalRequiresHuman = true,
    clientId = null,
  } = config;

  function evaluate(toolRequest = {}) {
    const { toolId, serverId, sensitivity, dataClass, humanApproved = false, requestClientId } = toolRequest;

    if (requestClientId && requestClientId !== clientId) {
      return Object.freeze({ allowed: false, reason: 'CROSS_CLIENT_TOOL_ACCESS', isReal: false });
    }

    if (allowedTools.length > 0 && !allowedTools.includes(toolId)) {
      return Object.freeze({ allowed: false, reason: 'TOOL_NOT_IN_ALLOWLIST', isReal: false });
    }

    if (allowedServers.length > 0 && serverId && !allowedServers.includes(serverId)) {
      return Object.freeze({ allowed: false, reason: 'SERVER_NOT_IN_ALLOWLIST', isReal: false });
    }

    if (sensitivity === TOOL_SENSITIVITY.WRITE && writeRequiresHuman && !humanApproved) {
      return Object.freeze({ allowed: false, reason: 'WRITE_REQUIRES_HUMAN_APPROVAL', isReal: false });
    }

    if (sensitivity === TOOL_SENSITIVITY.EXTERNAL && externalRequiresHuman && !humanApproved) {
      return Object.freeze({ allowed: false, reason: 'EXTERNAL_REQUIRES_HUMAN_APPROVAL', isReal: false });
    }

    if (dataClass === 'RESTRICTED' && sensitivity !== TOOL_SENSITIVITY.READ_ONLY) {
      return Object.freeze({ allowed: false, reason: 'RESTRICTED_DATA_WRITE_BLOCKED', isReal: false });
    }

    return Object.freeze({ allowed: true, reason: 'OK', isReal: false });
  }

  return Object.freeze({
    clientId,
    allowedTools: Object.freeze([...allowedTools]),
    allowedServers: Object.freeze([...allowedServers]),
    writeRequiresHuman,
    externalRequiresHuman,
    evaluate,
    isReal: false,
  });
}

export const TOOL_SECURITY_VERSION = '1.0.0';
