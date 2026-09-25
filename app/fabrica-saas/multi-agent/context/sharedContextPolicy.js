// Shared Context Policy — ADV-17

export function createSharedContextPolicy(config = {}) {
  const {
    maxContextChars       = 8000,
    redactPII             = true,
    redactSecrets         = true,
    enforceClientIsolation = true,
    staleContextTtlMs     = 300000, // 5 min
    businessTruthPriority = true,
  } = config;

  return Object.freeze({
    maxContextChars,
    redactPII,
    redactSecrets,
    enforceClientIsolation,
    staleContextTtlMs,
    businessTruthPriority,

    validate(context, agentId, requestClientId) {
      const issues = [];
      if (enforceClientIsolation && context.clientId !== requestClientId) {
        issues.push('CLIENT_ISOLATION_VIOLATION');
      }
      return Object.freeze({
        valid:  issues.length === 0,
        issues: Object.freeze(issues),
        isReal: false,
      });
    },

    minimizeForAgent(fullContext, agentScope) {
      // Returns only the context sections the agent needs
      const allowed = agentScope?.allowedSections ?? ['PUBLIC_WORKING', 'TASK_STATE'];
      return Object.freeze({
        filtered: true,
        sections: Object.freeze([...allowed]),
        isReal:   false,
      });
    },

    isReal: false,
  });
}

export const SHARED_CONTEXT_POLICY_VERSION = '1.0.0';
