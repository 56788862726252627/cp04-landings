// Multi-Agent Recovery Policy — ADV-17

export const RECOVERY_ACTION = Object.freeze({
  RETRY_AGENT:     'RETRY_AGENT',
  REPLACE_AGENT:   'REPLACE_AGENT',
  ESCALATE:        'ESCALATE',
  PARTIAL_RESULT:  'PARTIAL_RESULT',
  SAFE_FAILURE:    'SAFE_FAILURE',
  HUMAN_HANDOFF:   'HUMAN_HANDOFF',
  RESUME_FROM_CHECKPOINT: 'RESUME_FROM_CHECKPOINT',
});

export function createMultiAgentRecoveryPolicy(config = {}) {
  const {
    maxRetries            = 2,
    retryableFailures     = ['TIMEOUT', 'PROVIDER_DOWN', 'TRANSIENT_ERROR'],
    escalatableFailures   = ['POLICY_VIOLATION', 'PERMISSION_DENIED'],
  } = config;

  return Object.freeze({
    maxRetries,

    recommend(failure = {}) {
      const { type, attempt = 0, hasCheckpoint = false } = failure;

      if (hasCheckpoint) {
        return Object.freeze({ action: RECOVERY_ACTION.RESUME_FROM_CHECKPOINT, isReal: false });
      }

      if (retryableFailures.includes(type) && attempt < maxRetries) {
        return Object.freeze({ action: RECOVERY_ACTION.RETRY_AGENT, attempt: attempt + 1, isReal: false });
      }

      if (escalatableFailures.includes(type)) {
        return Object.freeze({ action: RECOVERY_ACTION.ESCALATE, isReal: false });
      }

      if (failure.hasReplacement) {
        return Object.freeze({ action: RECOVERY_ACTION.REPLACE_AGENT, isReal: false });
      }

      return Object.freeze({ action: RECOVERY_ACTION.SAFE_FAILURE, isReal: false });
    },

    isReal: false,
  });
}

export const RECOVERY_POLICY_VERSION = '1.0.0';
