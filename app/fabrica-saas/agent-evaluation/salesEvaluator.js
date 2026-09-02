// Sales Agent Evaluator — ADV-10

import { evaluateEthicalSales } from './ethicalSalesEvaluator.js';

const NEEDS_DISCOVERY_PATTERNS = [
  /¿qué (buscas|necesitas|te preocupa|te trae)/i,
  /cuéntame (más|qué|cómo)/i,
  /¿cuál es tu (situación|objetivo|reto)/i,
];

const VALUE_COMM_PATTERNS = [
  /beneficio|ventaja|resultado|ahorro|mejora|consigue/i,
  /para ti|en tu caso|según tu/i,
];

const PUSHY_PATTERNS = [
  /debes|tienes que|obligatoriamente|no puedes perderte/i,
  /ahora o nunca|oferta irrepetible/i,
];

export function evaluateSalesResponse(response = {}) {
  const text     = response.text ?? '';
  const ethics   = evaluateEthicalSales(response);
  const issues   = [];
  let score      = 70;

  // Needs discovery
  const discoversNeeds = NEEDS_DISCOVERY_PATTERNS.some(p => p.test(text));
  if (discoversNeeds) score += 10;

  // Value communication
  const communicatesValue = VALUE_COMM_PATTERNS.some(p => p.test(text));
  if (communicatesValue) score += 8;

  // Non-pushy behavior
  const isPushy = PUSHY_PATTERNS.some(p => p.test(text));
  if (isPushy) { score -= 20; issues.push('Pushy sales language detected'); }

  // Next best action clarity
  const hasNBA = /próximo paso|siguiente paso|¿cuándo|¿le viene bien|¿quieres que/i.test(text);
  if (hasNBA) score += 7;

  // Brevity check: sales should be conversational
  if (text.length > 600) { score -= 8; issues.push('Response too long for sales context'); }

  // Ethics integration
  score = Math.round(score * (ethics.score / 100));

  return Object.freeze({
    score:       Math.max(0, Math.min(100, score)),
    ethics:      Object.freeze({ score: ethics.score, violations: ethics.violations }),
    discoversNeeds,
    communicatesValue,
    isPushy,
    hasNextAction: hasNBA,
    issues:      Object.freeze(issues),
    isReal: false,
  });
}

export const SALES_EVALUATOR_VERSION = '1.0.0';
