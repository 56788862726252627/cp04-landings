// MCP Timeout Policy — ADV-12

export const DEFAULT_TIMEOUTS_MS = Object.freeze({
  READ_ONLY:    3000,
  SAFE_WRITE:   5000,
  SENSITIVE:    8000,
  EXTERNAL_IO: 15000,
  LLM_CALL:    30000,
});

export function createTimeoutPolicy(config = {}) {
  return Object.freeze({
    defaultMs:  config.defaultMs  ?? DEFAULT_TIMEOUTS_MS.SAFE_WRITE,
    perToolMs:  Object.freeze(config.perToolMs ?? {}),
    isReal: false,
  });
}

export function getToolTimeout(toolId, policy, tool = {}) {
  if (policy.perToolMs[toolId]) return policy.perToolMs[toolId];
  if (tool.timeoutMs)           return tool.timeoutMs;
  return policy.defaultMs;
}

export const MCP_TIMEOUT_POLICY_VERSION = '1.0.0';
