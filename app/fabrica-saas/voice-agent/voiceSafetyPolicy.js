// Voice Safety Policy — ADV-11

export const SAFETY_VIOLATION_TYPE = Object.freeze({
  SECRET_EXPOSURE:        'SECRET_EXPOSURE',
  PAYMENT_EXECUTION:      'PAYMENT_EXECUTION',
  FALSE_HUMAN_CLAIM:      'FALSE_HUMAN_CLAIM',
  PROHIBITED_DISCLOSURE:  'PROHIBITED_DISCLOSURE',
  CROSS_CLIENT_DATA_LEAK: 'CROSS_CLIENT_DATA_LEAK',
  OUTBOUND_REAL_ACTION:   'OUTBOUND_REAL_ACTION',
});

const SECRET_PATTERNS = Object.freeze([
  /\bsk[_][a-zA-Z0-9]{20,}\b/,   // Stripe-like secret key
  /\btoken[=:]\s*[a-zA-Z0-9_-]{16,}\b/i,
  /password\s*[:=]\s*\S+/i,
  /\bAPI_KEY\s*[:=]\s*\S+/i,
]);

export function detectsSecretExposure(text = '') {
  return SECRET_PATTERNS.some(p => p.test(text));
}

export function detectsPaymentExecution(text = '') {
  return /\bcobra\b|realiza el pago|ejecuta el cargo|process payment/i.test(text);
}

export function checkVoiceSafety(agentText = '') {
  const violations = [];
  if (detectsSecretExposure(agentText))   violations.push(SAFETY_VIOLATION_TYPE.SECRET_EXPOSURE);
  if (detectsPaymentExecution(agentText)) violations.push(SAFETY_VIOLATION_TYPE.PAYMENT_EXECUTION);
  return Object.freeze({
    safe:       violations.length === 0,
    violations: Object.freeze(violations),
    isReal: false,
  });
}

export function createVoiceSafetyPolicy(config = {}) {
  return Object.freeze({
    blockedViolations: Object.freeze(config.blockedViolations ?? Object.values(SAFETY_VIOLATION_TYPE)),
    isReal: false,
  });
}

export const DEFAULT_VOICE_SAFETY_POLICY = createVoiceSafetyPolicy();

export const VOICE_SAFETY_POLICY_VERSION = '1.0.0';
