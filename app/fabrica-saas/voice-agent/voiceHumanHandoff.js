// Voice Human Handoff — ADV-11

export const HANDOFF_TRIGGER = Object.freeze({
  USER_REQUESTED:     'USER_REQUESTED',
  REPEATED_FAILURES:  'REPEATED_FAILURES',
  CRITICAL_COMPLAINT: 'CRITICAL_COMPLAINT',
  COMPLEX_ISSUE:      'COMPLEX_ISSUE',
  PAYMENT_DISPUTE:    'PAYMENT_DISPUTE',
  OUT_OF_SCOPE:       'OUT_OF_SCOPE',
});

export function detectHandoffTrigger(text = '', recoveryAttempts = 0) {
  if (/persona real|humano|operador|con alguien/i.test(text)) return HANDOFF_TRIGGER.USER_REQUESTED;
  if (/urgente|emergencia|muy grave/i.test(text))              return HANDOFF_TRIGGER.CRITICAL_COMPLAINT;
  if (/disputa|reembolso|error de cobro/i.test(text))          return HANDOFF_TRIGGER.PAYMENT_DISPUTE;
  if (recoveryAttempts >= 3)                                   return HANDOFF_TRIGGER.REPEATED_FAILURES;
  return null;
}

export function buildHandoffMessage(trigger = '') {
  const messages = {
    [HANDOFF_TRIGGER.USER_REQUESTED]:     'Entendido. Ahora mismo te paso con alguien del equipo.',
    [HANDOFF_TRIGGER.REPEATED_FAILURES]:  'Parece que no he podido ayudarte bien. Te paso con el equipo.',
    [HANDOFF_TRIGGER.CRITICAL_COMPLAINT]: 'Entiendo que es importante. Te comunico con un responsable.',
    [HANDOFF_TRIGGER.COMPLEX_ISSUE]:      'Este tema requiere atención personalizada. Te paso con alguien.',
    [HANDOFF_TRIGGER.PAYMENT_DISPUTE]:    'Para gestiones de pago te pongo con el equipo adecuado.',
    [HANDOFF_TRIGGER.OUT_OF_SCOPE]:       'Eso está fuera de lo que puedo gestionar. Te ayuda el equipo.',
  };
  return messages[trigger] ?? 'Te paso con el equipo ahora mismo.';
}

export const VOICE_HUMAN_HANDOFF_VERSION = '1.0.0';
