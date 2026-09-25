// MCP Tool Definition — ADV-12

export const TOOL_RISK_LEVEL = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export const COST_CLASS = Object.freeze({
  FREE:    'FREE',
  LOW:     'LOW',
  MEDIUM:  'MEDIUM',
  HIGH:    'HIGH',
  UNKNOWN: 'UNKNOWN',
});

export function createMCPTool(config = {}) {
  if (!config.id)       throw new Error('MCPTool requires id');
  if (!config.serverId) throw new Error('MCPTool requires serverId');
  if (!config.name)     throw new Error('MCPTool requires name');
  return Object.freeze({
    id:                    config.id,
    serverId:              config.serverId,
    name:                  config.name,
    description:           config.description             ?? '',
    inputSchema:           Object.freeze(config.inputSchema  ?? {}),
    outputSchema:          Object.freeze(config.outputSchema ?? {}),
    requiredScopes:        Object.freeze(config.requiredScopes ?? []),
    riskLevel:             config.riskLevel               ?? TOOL_RISK_LEVEL.LOW,
    costClass:             config.costClass               ?? COST_CLASS.FREE,
    readOnly:              config.readOnly                ?? true,
    idempotent:            config.idempotent              ?? true,
    destructive:           config.destructive             ?? false,
    requiresHumanApproval: config.requiresHumanApproval   ?? false,
    timeoutMs:             config.timeoutMs               ?? 5000,
    retryPolicy:           config.retryPolicy             ?? 'TRANSIENT',
    isReal: false,
  });
}

export const MCP_TOOL_DEFINITION_VERSION = '1.0.0';
