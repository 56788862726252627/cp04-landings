// Multi-Agent Checkpoint — ADV-17
// Enables safe resume without repeating side effects. Connects ADV-05.

export function createMultiAgentCheckpoint(config = {}) {
  const {
    systemId   = 'unknown',
    maxCheckpoints = 10,
  } = config;

  const checkpoints = [];

  return Object.freeze({
    systemId,

    save(state = {}) {
      const cp = Object.freeze({
        id:        `cp-${checkpoints.length + 1}`,
        systemId,
        state:     Object.freeze({ ...state }),
        savedAt:   new Date().toISOString(),
        isReal:    false,
      });
      if (checkpoints.length >= maxCheckpoints) checkpoints.shift();
      checkpoints.push(cp);
      return cp;
    },

    latest() {
      return checkpoints[checkpoints.length - 1] ?? null;
    },

    getById(id) {
      return checkpoints.find(c => c.id === id) ?? null;
    },

    canResume() {
      return checkpoints.length > 0;
    },

    count() {
      return checkpoints.length;
    },

    isReal: false,
  });
}

export const CHECKPOINT_VERSION = '1.0.0';
