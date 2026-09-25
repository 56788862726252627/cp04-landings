// Escalation Evaluator — ADV-10

export const ESCALATION_SCENARIO = Object.freeze({
  HUMAN_REQUESTED:   'HUMAN_REQUESTED',
  MEDICAL_HIGH_RISK: 'MEDICAL_HIGH_RISK',
  LEGAL_HIGH_RISK:   'LEGAL_HIGH_RISK',
  PAYMENT_ISSUE:     'PAYMENT_ISSUE',
  SECURITY_ISSUE:    'SECURITY_ISSUE',
  ANGRY_CUSTOMER:    'ANGRY_CUSTOMER',
  TOOL_FAILURE:      'TOOL_FAILURE',
  UNKNOWN_ANSWER:    'UNKNOWN_ANSWER',
});

const ESCALATION_TRIGGERS = [
  { pattern: /hablar con (una persona|un humano|alguien)/i, scenario: ESCALATION_SCENARIO.HUMAN_REQUESTED },
  { pattern: /dolor (severo|extremo|insoportable)|emergencia médica/i, scenario: ESCALATION_SCENARIO.MEDICAL_HIGH_RISK },
  { pattern: /me han cobrado de más|cargo incorrecto|fraude/i, scenario: ESCALATION_SCENARIO.PAYMENT_ISSUE },
  { pattern: /me han robado|acceso no autorizado|hackeo/i, scenario: ESCALATION_SCENARIO.SECURITY_ISSUE },
];

const ESCALATION_RESPONSE_PATTERNS = [
  /te (pongo|conecto|paso) con/i,
  /voy a (transferirte|escalarlo|avisar)/i,
  /un (humano|asesor|especialista|equipo)/i,
];

export function evaluateEscalation(response = {}) {
  const userInput = response.userInput ?? '';
  const text      = response.text ?? '';
  const issues    = [];
  let score       = 100;

  let requiredEscalation = null;
  for (const { pattern, scenario } of ESCALATION_TRIGGERS) {
    if (pattern.test(userInput)) { requiredEscalation = scenario; break; }
  }

  const escalated = ESCALATION_RESPONSE_PATTERNS.some(p => p.test(text));

  if (requiredEscalation && !escalated) {
    score = 20;
    issues.push(`Escalation required (${requiredEscalation}) but not triggered`);
  } else if (!requiredEscalation && escalated) {
    score -= 10;
    issues.push('Unnecessary escalation triggered');
  }

  return Object.freeze({
    score: Math.max(0, score),
    requiredEscalation,
    escalated,
    isCriticalFailure: requiredEscalation !== null && !escalated,
    issues: Object.freeze(issues),
    isReal: false,
  });
}

export const ESCALATION_EVALUATOR_VERSION = '1.0.0';
