// Voice Confirmation Policy — ADV-11

export const CONFIRMATION_REQUIRED_FOR = Object.freeze([
  'booking',
  'cancellation',
  'reschedule',
  'payment_related_future_action',
  'outbound_request',
  'sensitive_change',
]);

export const CONFIRMATION_STYLE = Object.freeze({
  EXPLICIT:  'EXPLICIT',   // "¿Confirmas la reserva el martes a las 10?"
  SUMMARY:   'SUMMARY',    // "Entonces reservo pista 2, martes 10:00. ¿Todo correcto?"
  MINIMAL:   'MINIMAL',    // "¿Todo bien?"
});

export function createVoiceConfirmationPolicy(config = {}) {
  return Object.freeze({
    requiredFor:   Object.freeze(config.requiredFor   ?? CONFIRMATION_REQUIRED_FOR),
    style:         config.style                       ?? CONFIRMATION_STYLE.EXPLICIT,
    maxFields:     config.maxFields                   ?? 3,
    neverSkipFor:  Object.freeze(['booking', 'cancellation']),
    isReal: false,
  });
}

export function requiresConfirmation(action = '', policy = {}) {
  const required = policy.requiredFor ?? CONFIRMATION_REQUIRED_FOR;
  return required.includes(action);
}

export function buildConfirmationPrompt(action = '', fields = {}) {
  const parts = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join(', ');
  return `Para ${action}: ${parts}. ¿Confirmas?`;
}

export const DEFAULT_CONFIRMATION_POLICY = createVoiceConfirmationPolicy();

export const VOICE_CONFIRMATION_POLICY_VERSION = '1.0.0';
