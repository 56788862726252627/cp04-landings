// Escalation Engine — ADV-03
// shouldEscalateToHuman(): siempre disponible cuando sea necesario.

export const ESCALATION_TRIGGER = Object.freeze({
  USER_REQUESTS:        'USER_REQUESTS',
  HIGH_RISK:            'HIGH_RISK',
  MEDICAL_LEGAL_UNCERT: 'MEDICAL_LEGAL_UNCERT',
  PAYMENT_DISPUTE:      'PAYMENT_DISPUTE',
  SECURITY_ISSUE:       'SECURITY_ISSUE',
  REPEATED_FAILURE:     'REPEATED_FAILURE',
  SEVERE_SENTIMENT:     'SEVERE_SENTIMENT',
  UNSUPPORTED_REQUEST:  'UNSUPPORTED_REQUEST',
  POLICY_CONFLICT:      'POLICY_CONFLICT',
  EXPLICIT_COMPLAINT:   'EXPLICIT_COMPLAINT',
});

export const ESCALATION_PRIORITY = Object.freeze({
  IMMEDIATE: 'IMMEDIATE',
  HIGH:      'HIGH',
  NORMAL:    'NORMAL',
  LOW:       'LOW',
});

const TRIGGER_PRIORITY = Object.freeze({
  [ESCALATION_TRIGGER.USER_REQUESTS]:        ESCALATION_PRIORITY.IMMEDIATE,
  [ESCALATION_TRIGGER.HIGH_RISK]:            ESCALATION_PRIORITY.HIGH,
  [ESCALATION_TRIGGER.MEDICAL_LEGAL_UNCERT]: ESCALATION_PRIORITY.HIGH,
  [ESCALATION_TRIGGER.PAYMENT_DISPUTE]:      ESCALATION_PRIORITY.IMMEDIATE,
  [ESCALATION_TRIGGER.SECURITY_ISSUE]:       ESCALATION_PRIORITY.IMMEDIATE,
  [ESCALATION_TRIGGER.REPEATED_FAILURE]:     ESCALATION_PRIORITY.HIGH,
  [ESCALATION_TRIGGER.SEVERE_SENTIMENT]:     ESCALATION_PRIORITY.HIGH,
  [ESCALATION_TRIGGER.UNSUPPORTED_REQUEST]:  ESCALATION_PRIORITY.NORMAL,
  [ESCALATION_TRIGGER.POLICY_CONFLICT]:      ESCALATION_PRIORITY.HIGH,
  [ESCALATION_TRIGGER.EXPLICIT_COMPLAINT]:   ESCALATION_PRIORITY.HIGH,
});

/**
 * Determine if the conversation should escalate to a human agent.
 * Returns structured escalation decision (never silently blocks).
 */
export function shouldEscalateToHuman(params = {}) {
  const {
    userRequestedHuman   = false,
    riskLevel            = 'LOW',
    vertical             = 'default',
    failedAttempts       = 0,
    sentimentScore       = 0,
    requestType          = 'INFORMATION',
    hasUnsupportedRequest = false,
    hasPolicyConflict    = false,
  } = params;

  const triggers = [];

  if (userRequestedHuman)    triggers.push(ESCALATION_TRIGGER.USER_REQUESTS);
  if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') triggers.push(ESCALATION_TRIGGER.HIGH_RISK);
  if (['psychology', 'fertility', 'medical'].includes(vertical?.toLowerCase())) triggers.push(ESCALATION_TRIGGER.MEDICAL_LEGAL_UNCERT);
  if (failedAttempts >= 3)   triggers.push(ESCALATION_TRIGGER.REPEATED_FAILURE);
  if (sentimentScore <= -70) triggers.push(ESCALATION_TRIGGER.SEVERE_SENTIMENT);
  if (hasUnsupportedRequest) triggers.push(ESCALATION_TRIGGER.UNSUPPORTED_REQUEST);
  if (hasPolicyConflict)     triggers.push(ESCALATION_TRIGGER.POLICY_CONFLICT);
  if (requestType === 'COMPLAINT') triggers.push(ESCALATION_TRIGGER.EXPLICIT_COMPLAINT);
  if (requestType === 'PAYMENT_DISPUTE') triggers.push(ESCALATION_TRIGGER.PAYMENT_DISPUTE);

  const shouldEscalate = triggers.length > 0;
  const priority = triggers.map(t => TRIGGER_PRIORITY[t]).reduce((best, p) => {
    const order = [ESCALATION_PRIORITY.IMMEDIATE, ESCALATION_PRIORITY.HIGH, ESCALATION_PRIORITY.NORMAL, ESCALATION_PRIORITY.LOW];
    return order.indexOf(p) < order.indexOf(best) ? p : best;
  }, ESCALATION_PRIORITY.LOW);

  const handoffMessage = shouldEscalate
    ? buildHandoffMessage(triggers[0])
    : null;

  return Object.freeze({
    valid:           true,
    shouldEscalate,
    triggers:        Object.freeze(triggers),
    priority:        shouldEscalate ? priority : null,
    handoffMessage,
    alwaysAvailable: true,
  });
}

function buildHandoffMessage(trigger) {
  const messages = {
    [ESCALATION_TRIGGER.USER_REQUESTS]:        'Claro, te pongo en contacto con una persona del equipo.',
    [ESCALATION_TRIGGER.MEDICAL_LEGAL_UNCERT]: 'Esta pregunta la responde mejor un profesional del equipo.',
    [ESCALATION_TRIGGER.PAYMENT_DISPUTE]:      'Para este tema te conecto directamente con nuestro equipo.',
    [ESCALATION_TRIGGER.REPEATED_FAILURE]:     'Permíteme conectarte con alguien que pueda ayudarte mejor.',
    [ESCALATION_TRIGGER.SEVERE_SENTIMENT]:     'Entiendo que esta situación es frustrante. Te pongo con el equipo ahora mismo.',
    [ESCALATION_TRIGGER.EXPLICIT_COMPLAINT]:   'Quiero que esto se resuelva bien. Te conecto con el equipo.',
  };
  return messages[trigger] ?? 'Voy a conectarte con el equipo para darte la mejor atención.';
}

export const ESCALATION_ENGINE_VERSION = '1.0.0';
