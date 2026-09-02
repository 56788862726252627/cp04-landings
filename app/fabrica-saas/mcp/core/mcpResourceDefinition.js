// MCP Resource Definition — ADV-12

export const SENSITIVITY = Object.freeze({
  PUBLIC:       'PUBLIC',
  INTERNAL:     'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
  RESTRICTED:   'RESTRICTED',
});

export const ACCESS_POLICY = Object.freeze({
  PUBLIC:       'PUBLIC',
  CLIENT_SCOPED:'CLIENT_SCOPED',
  AGENT_SCOPED: 'AGENT_SCOPED',
  ADMIN_ONLY:   'ADMIN_ONLY',
});

export const CACHE_POLICY = Object.freeze({
  NO_CACHE:       'NO_CACHE',
  SHORT:          'SHORT',    // < 60s
  MEDIUM:         'MEDIUM',   // < 1h
  LONG:           'LONG',     // < 24h
  STATIC:         'STATIC',   // weeks
});

export function createMCPResource(config = {}) {
  if (!config.uri)  throw new Error('MCPResource requires uri');
  if (!config.name) throw new Error('MCPResource requires name');
  return Object.freeze({
    uri:          config.uri,
    name:         config.name,
    mimeType:     config.mimeType     ?? 'application/json',
    description:  config.description  ?? '',
    accessPolicy: config.accessPolicy ?? ACCESS_POLICY.CLIENT_SCOPED,
    clientScope:  config.clientScope  ?? null,
    sensitivity:  config.sensitivity  ?? SENSITIVITY.INTERNAL,
    cachePolicy:  config.cachePolicy  ?? CACHE_POLICY.SHORT,
    freshnessTtlMs: config.freshnessTtlMs ?? 30000,
    isReal: false,
  });
}

export const MCP_RESOURCE_DEFINITION_VERSION = '1.0.0';
