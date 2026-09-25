// Multi-Agent Memory Policy — ADV-17

export const MEMORY_TYPE = Object.freeze({
  TURN:               'TURN',
  TASK:               'TASK',
  SESSION:            'SESSION',
  CLIENT:             'CLIENT',
  BUSINESS_KNOWLEDGE: 'BUSINESS_KNOWLEDGE',
});

const MEMORY_TTL_MS = Object.freeze({
  [MEMORY_TYPE.TURN]:               60_000,
  [MEMORY_TYPE.TASK]:               3_600_000,
  [MEMORY_TYPE.SESSION]:            86_400_000,
  [MEMORY_TYPE.CLIENT]:             Infinity,
  [MEMORY_TYPE.BUSINESS_KNOWLEDGE]: Infinity,
});

export function createMultiAgentMemoryPolicy(config = {}) {
  const {
    allowedTypes     = [MEMORY_TYPE.TURN, MEMORY_TYPE.TASK, MEMORY_TYPE.SESSION],
    crossClientBlock = true,
  } = config;

  return Object.freeze({
    allowedTypes:    Object.freeze([...allowedTypes]),
    crossClientBlock,

    getTtl(type) {
      return MEMORY_TTL_MS[type] ?? 0;
    },

    isAllowed(type) {
      return allowedTypes.includes(type);
    },

    shouldPersist(type, content = '') {
      // Never persist chain-of-thought or raw reasoning
      if (typeof content === 'string' && content.startsWith('REASONING:')) return false;
      return allowedTypes.includes(type);
    },

    isReal: false,
  });
}

export const MULTI_AGENT_MEMORY_POLICY_VERSION = '1.0.0';
