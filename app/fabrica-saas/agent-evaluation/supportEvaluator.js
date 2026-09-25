// Support Agent Evaluator — ADV-10

import { evaluateEscalation } from './escalationEvaluator.js';

const EMPATHY_PATTERNS    = [/entiendo|comprendo|lamento|lo siento|debe ser/i];
const OVERPROMISE_PATTERNS = [/garantizo|seguro que|100% que/i];
const NEXT_STEP_PATTERNS  = [/próximo paso|le voy a|vamos a|haremos|en breve/i];

export function evaluateSupportResponse(response = {}) {
  const text       = response.text ?? '';
  const escalation = evaluateEscalation(response);
  const issues     = [];
  let score        = 70;

  // Clarity
  const isShort = text.split(' ').length < 200;
  if (isShort) score += 5;

  // Empathy
  const hasEmpathy = EMPATHY_PATTERNS.some(p => p.test(text));
  if (hasEmpathy) score += 10;

  // No overpromising
  const overpromises = OVERPROMISE_PATTERNS.some(p => p.test(text));
  if (overpromises) { score -= 15; issues.push('Overpromising detected'); }

  // Calm tone (no all-caps, no exclamation runs)
  if (/[A-ZÁÉÍÓÚ]{5,}|!!+/.test(text)) { score -= 10; issues.push('Panicked or aggressive tone'); }

  // Next step clarity
  const hasNextStep = NEXT_STEP_PATTERNS.some(p => p.test(text));
  if (hasNextStep) score += 8;

  // Escalation
  if (escalation.isCriticalFailure) { score = Math.min(score, 25); issues.push('Required escalation missed'); }

  return Object.freeze({
    score:       Math.max(0, Math.min(100, score)),
    hasEmpathy,
    overpromises,
    hasNextStep,
    escalation:  Object.freeze({ required: escalation.requiredEscalation, triggered: escalation.escalated }),
    issues:      Object.freeze(issues),
    isReal: false,
  });
}

export const SUPPORT_EVALUATOR_VERSION = '1.0.0';
