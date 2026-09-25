// MCP Auth Profile — ADV-12

export const AUTH_TYPE = Object.freeze({
  NONE:    'NONE',
  API_KEY: 'API_KEY',
  OAUTH:   'OAUTH',
  BEARER:  'BEARER',
  BASIC:   'BASIC',
  CUSTOM:  'CUSTOM',
});

export const AUTH_STATUS = Object.freeze({
  CONFIGURED:      'CONFIGURED',
  NOT_CONFIGURED:  'NOT_CONFIGURED',
  EXPIRED:         'EXPIRED',
  INVALID:         'INVALID',
  PENDING_REFRESH: 'PENDING_REFRESH',
  SIMULATED:       'SIMULATED',
});

export function createMCPAuthProfile(config = {}) {
  if (!config.serverId) throw new Error('MCPAuthProfile requires serverId');
  return Object.freeze({
    serverId:     config.serverId,
    authType:     config.authType  ?? AUTH_TYPE.NONE,
    status:       config.status    ?? AUTH_STATUS.SIMULATED,
    // Store env var NAME only — never the value
    envVarName:   config.envVarName  ?? null,
    scopes:       Object.freeze(config.scopes ?? []),
    expiresAt:    config.expiresAt   ?? null,
    isReal: false,
  });
}

export const MCP_AUTH_PROFILE_VERSION = '1.0.0';
