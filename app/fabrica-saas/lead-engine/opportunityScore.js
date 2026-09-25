// Opportunity Score — ADV-08

import { calculateFitScore }     from './fitScore.js';
import { calculateUrgencyScore } from './urgencyScore.js';
import { calculateValueScore }   from './valueScore.js';
import { calculateEaseScore }    from './easeScore.js';

const DEFAULT_WEIGHTS = Object.freeze({ fit: 40, urgency: 30, value: 20, ease: 10 });

export function calculateOpportunityScore(lead = {}, customWeights = {}) {
  const w = { ...DEFAULT_WEIGHTS, ...customWeights };
  const total = w.fit + w.urgency + w.value + w.ease;

  const fitResult     = calculateFitScore(lead);
  const urgencyResult = calculateUrgencyScore(lead);
  const valueResult   = calculateValueScore(lead);
  const easeResult    = calculateEaseScore(lead);

  const raw = (
    fitResult.score     * w.fit +
    urgencyResult.score * w.urgency +
    valueResult.score   * w.value +
    easeResult.score    * w.ease
  ) / total;

  const score = Math.round(Math.min(100, Math.max(0, raw)));

  const confidence = Math.round(
    (lead.dataQualityScore ?? 0) * 0.6 +
    Math.min(40, (lead.painSignals ?? []).length * 8)
  );

  return Object.freeze({
    score,
    confidence:    Math.min(100, confidence),
    weights:       Object.freeze(w),
    components: Object.freeze({
      fit:     fitResult.score,
      urgency: urgencyResult.score,
      value:   valueResult.score,
      ease:    easeResult.score,
    }),
    isReal: false,
  });
}

export const OPPORTUNITY_SCORE_VERSION = '1.0.0';
