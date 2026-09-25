// Write Coordinator — ADV-17
// Serializes conflicting writes. Foundation for idempotency and lock detection.

export const WRITE_RESULT = Object.freeze({
  ACCEPTED:  'ACCEPTED',
  QUEUED:    'QUEUED',
  REJECTED:  'REJECTED',
  CONFLICT:  'CONFLICT',
});

export function createAgentWriteCoordinator(config = {}) {
  const { idempotencyWindow = 5000 } = config;
  const locks    = new Map();  // resource → { taskId, timestamp }
  const history  = new Map();  // idempotencyKey → result

  return Object.freeze({
    tryAcquire(resource, taskId) {
      const existing = locks.get(resource);
      if (existing && existing.taskId !== taskId) {
        return Object.freeze({ result: WRITE_RESULT.CONFLICT, holder: existing.taskId, isReal: false });
      }
      locks.set(resource, { taskId, timestamp: Date.now() });
      return Object.freeze({ result: WRITE_RESULT.ACCEPTED, resource, taskId, isReal: false });
    },

    release(resource, taskId) {
      const existing = locks.get(resource);
      if (existing?.taskId === taskId) locks.delete(resource);
    },

    isLocked(resource) {
      return locks.has(resource);
    },

    recordIdempotent(key, result) {
      history.set(key, { result, timestamp: Date.now() });
    },

    getIdempotent(key) {
      const entry = history.get(key);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > idempotencyWindow) { history.delete(key); return null; }
      return entry.result;
    },

    snapshot() {
      return Object.freeze({ activeLocks: locks.size, historySize: history.size, isReal: false });
    },

    isReal: false,
  });
}

export const WRITE_COORDINATOR_VERSION = '1.0.0';
