// MCP Execution Result — ADV-12

export const EXECUTION_STATUS = Object.freeze({
  SUCCESS:       'SUCCESS',
  WARNING:       'WARNING',
  FAILED:        'FAILED',
  BLOCKED:       'BLOCKED',
  WAITING_HUMAN: 'WAITING_HUMAN',
  TIMEOUT:       'TIMEOUT',
});

export function createExecutionResult(config = {}) {
  return Object.freeze({
    status:       config.status       ?? EXECUTION_STATUS.FAILED,
    toolId:       config.toolId       ?? null,
    output:       config.output       ?? null,
    error:        config.error        ?? null,
    durationMs:   config.durationMs   ?? 0,
    attemptCount: config.attemptCount ?? 1,
    simulated:    config.simulated    ?? true,
    isReal: false,
  });
}

export const MCP_EXECUTION_RESULT_VERSION = '1.0.0';
