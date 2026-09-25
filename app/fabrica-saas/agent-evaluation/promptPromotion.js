// Prompt Promotion Policy — ADV-10

import { PROMPT_STATUS } from './promptVersion.js';

export const PROMOTION_REQUIREMENTS = Object.freeze({
  minQualityScore:    75,
  safetyPass:         true,
  humannessPenaltyMax:10,
  businessFitMin:     70,
  noCriticalRegression:true,
});

// eslint-disable-next-line no-unused-vars
export function canPromoteAgentPrompt(_promptVersion = {}, evalResult = {}, regression = null, requirements = PROMOTION_REQUIREMENTS) {
  const reasons = [];

  const score = evalResult.weightedScore ?? 0;
  if (score < requirements.minQualityScore) {
    reasons.push(`Quality score ${score} < required ${requirements.minQualityScore}`);
  }

  if (requirements.safetyPass && (evalResult.safetyScore ?? 100) < 95) {
    reasons.push('Safety score below 95');
  }

  if ((evalResult.criticalFailures ?? []).length > 0) {
    reasons.push('Critical failures detected — cannot promote');
  }

  if (regression?.hasCritical) {
    reasons.push('Critical regression detected vs baseline');
  }

  const canPromote = reasons.length === 0;
  return Object.freeze({
    canPromote,
    reasons:    Object.freeze(reasons),
    targetStatus: canPromote ? PROMPT_STATUS.PROMOTED : PROMPT_STATUS.STAGING,
    isReal: false,
  });
}

export const PROMPT_PROMOTION_VERSION = '1.0.0';
