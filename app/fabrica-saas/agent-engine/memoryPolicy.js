// Agent Memory Policy — ADV-03
// Control de memoria: session-only por defecto. Sin datos sensibles.

export const MEMORY_TYPE = Object.freeze({
  NONE:             'NONE',
  SESSION:          'SESSION',
  SHORT_TERM:       'SHORT_TERM',
  CRM_BACKED_FUTURE:'CRM_BACKED_FUTURE',
});

export const MEMORY_RESTRICTION = Object.freeze({
  NO_SECRETS:       'NO_SECRETS',
  NO_SENSITIVE_PII: 'NO_SENSITIVE_PII',
  ALLOW_FORGET:     'ALLOW_FORGET',
  CLIENT_ISOLATION: 'CLIENT_ISOLATION',
  TTL_ENFORCED:     'TTL_ENFORCED',
  MAX_TURNS:        'MAX_TURNS',
  CONTROLLED_SUMMARY:'CONTROLLED_SUMMARY',
});

/**
 * Create an AgentMemoryPolicy.
 */
export function createMemoryPolicy(params = {}) {
  const {
    memoryType   = MEMORY_TYPE.SESSION,
    maxTurns     = 20,
    ttlSeconds   = 3600,
    allowSummary = true,
    overrides    = {},
  } = params;

  if (!MEMORY_TYPE[memoryType]) {
    return { valid: false, error: `Unknown memory type: ${memoryType}` };
  }

  const restrictions = [
    MEMORY_RESTRICTION.NO_SECRETS,
    MEMORY_RESTRICTION.NO_SENSITIVE_PII,
    MEMORY_RESTRICTION.ALLOW_FORGET,
    MEMORY_RESTRICTION.CLIENT_ISOLATION,
  ];
  if (ttlSeconds > 0) restrictions.push(MEMORY_RESTRICTION.TTL_ENFORCED);
  if (maxTurns > 0)   restrictions.push(MEMORY_RESTRICTION.MAX_TURNS);
  if (allowSummary)   restrictions.push(MEMORY_RESTRICTION.CONTROLLED_SUMMARY);

  const policy = Object.freeze({
    memoryType,
    maxTurns,
    ttlSeconds,
    allowSummary,
    restrictions:  Object.freeze(restrictions),
    neverStore:    Object.freeze(['passwords', 'credit cards', 'medical diagnoses', 'legal advice given', 'real API keys']),
    clientIsolation: true,
    crmNote:       'CRM_BACKED_FUTURE requires explicit activation in ADV-05+.',
    overrides:     Object.freeze(overrides),
    version:       '1.0.0',
  });

  return { valid: true, policy };
}

/**
 * Create a session-only memory store for testing.
 * No persistence, no real data.
 */
export function createSessionMemory(agentId = 'test-agent') {
  const turns = [];
  return {
    agentId,
    type:      MEMORY_TYPE.SESSION,
    isReal:    false,
    push(turn) {
      if (!turn || typeof turn !== 'object') return;
      turns.push({ ...turn, at: Date.now() });
    },
    getAll()    { return [...turns]; },
    getLast(n)  { return turns.slice(-n); },
    clear()     { turns.length = 0; },
    size()      { return turns.length; },
    disclaimer: 'Session memory — no persistence, no real data.',
  };
}

export const MEMORY_POLICY_VERSION = '1.0.0';
