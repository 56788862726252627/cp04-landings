// MCP Server Definition — ADV-12

export const SERVER_STATUS = Object.freeze({
  AVAILABLE:       'AVAILABLE',
  CONFIG_REQUIRED: 'CONFIG_REQUIRED',
  AUTH_REQUIRED:   'AUTH_REQUIRED',
  BLOCKED:         'BLOCKED',
  DISABLED:        'DISABLED',
  DEGRADED:        'DEGRADED',
});

export const SERVER_RISK_LEVEL = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export function createMCPServer(config = {}) {
  if (!config.id)   throw new Error('MCPServer requires id');
  if (!config.name) throw new Error('MCPServer requires name');
  return Object.freeze({
    id:              config.id,
    name:            config.name,
    version:         config.version          ?? '1.0.0',
    provider:        config.provider         ?? 'custom',
    transport:       config.transport        ?? 'STDIO',
    endpoint:        config.endpoint         ?? null,
    capabilities:    Object.freeze(config.capabilities    ?? []),
    tools:           Object.freeze(config.tools           ?? []),
    resources:       Object.freeze(config.resources       ?? []),
    prompts:         Object.freeze(config.prompts         ?? []),
    authType:        config.authType         ?? 'NONE',
    requiredScopes:  Object.freeze(config.requiredScopes  ?? []),
    riskLevel:       config.riskLevel        ?? SERVER_RISK_LEVEL.LOW,
    costProfile:     config.costProfile      ?? 'FREE',
    clientIsolation: config.clientIsolation  ?? true,
    status:          config.status           ?? SERVER_STATUS.AVAILABLE,
    isReal: false,
  });
}

export const MCP_SERVER_DEFINITION_VERSION = '1.0.0';
