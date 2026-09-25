// MCP Idempotency Policy — ADV-12

const _executed = new Map();

export function createIdempotencyKey(toolId, args) {
  return `${toolId}::${JSON.stringify(args)}`;
}

export function checkIdempotency(toolId, args) {
  const key = createIdempotencyKey(toolId, args);
  const prior = _executed.get(key);
  return Object.freeze({
    key,
    alreadyExecuted: !!prior,
    priorResult: prior ?? null,
    isReal: false,
  });
}

export function registerExecution(toolId, args, result) {
  const key = createIdempotencyKey(toolId, args);
  _executed.set(key, result);
  return key;
}

export function clearIdempotencyStore() {
  _executed.clear();
}

export const MCP_IDEMPOTENCY_POLICY_VERSION = '1.0.0';
