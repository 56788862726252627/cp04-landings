// Voice Recovery Policy — ADV-11

export const RECOVERY_TRIGGER = Object.freeze({
  ASR_LOW_CONFIDENCE:   'ASR_LOW_CONFIDENCE',
  USER_REPEATED:        'USER_REPEATED',
  LONG_SILENCE:         'LONG_SILENCE',
  UNDERSTOOD_NOTHING:   'UNDERSTOOD_NOTHING',
  OFF_TOPIC:            'OFF_TOPIC',
});

export const RECOVERY_STRATEGY = Object.freeze({
  CLARIFY:   'CLARIFY',    // "¿Puedes repetirlo?"
  PARTIAL:   'PARTIAL',    // "Creo que dijiste X, ¿es correcto?"
  FALLBACK:  'FALLBACK',   // escalate or offer menu
  OFFER_MENU:'OFFER_MENU', // offer explicit options
  TRANSFER:  'TRANSFER',   // hand off to human
});

const MAX_RECOVERY_ATTEMPTS = 3;

export function createVoiceRecoveryPolicy(config = {}) {
  return Object.freeze({
    maxAttempts:         config.maxAttempts         ?? MAX_RECOVERY_ATTEMPTS,
    thresholdConfidence: config.thresholdConfidence ?? 0.5,
    strategy:            config.strategy            ?? RECOVERY_STRATEGY.CLARIFY,
    afterMaxAttempts:    config.afterMaxAttempts    ?? RECOVERY_STRATEGY.TRANSFER,
    isReal: false,
  });
}

export function selectRecoveryStrategy(attempts = 0, policy = {}) {
  const max = policy.maxAttempts ?? MAX_RECOVERY_ATTEMPTS;
  if (attempts >= max) return policy.afterMaxAttempts ?? RECOVERY_STRATEGY.TRANSFER;
  if (attempts === 1)  return RECOVERY_STRATEGY.PARTIAL;
  if (attempts === 2)  return RECOVERY_STRATEGY.OFFER_MENU;
  return policy.strategy ?? RECOVERY_STRATEGY.CLARIFY;
}

export const DEFAULT_RECOVERY_POLICY = createVoiceRecoveryPolicy();

export const VOICE_RECOVERY_POLICY_VERSION = '1.0.0';
