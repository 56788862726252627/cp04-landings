// Stale Opportunity Detector — ADV-09 CRM

import { CRM_STAGE, createSalesPipeline } from './salesPipeline.js';

const DEFAULT_PIPELINE = createSalesPipeline();

export const STALE_STATUS = Object.freeze({
  FRESH:          'FRESH',
  AGING:          'AGING',
  STALE:          'STALE',
  CRITICAL_STALE: 'CRITICAL_STALE',
});

export function evaluateOpportunityFreshness(opportunity = {}, thresholds = DEFAULT_PIPELINE.staleThresholdDays) {
  const stage   = opportunity.stage ?? CRM_STAGE.NEW;
  const lastAt  = opportunity.lastActivityAt ?? opportunity.createdAt ?? '';
  if (!lastAt) return Object.freeze({ status: STALE_STATUS.STALE, daysIdle: 999, threshold: 0, isReal: false });

  const daysIdle  = Math.floor((Date.now() - new Date(lastAt).getTime()) / 86400000);
  const threshold = thresholds[stage] ?? 14;

  let status;
  if (daysIdle <= threshold * 0.5)    status = STALE_STATUS.FRESH;
  else if (daysIdle <= threshold)     status = STALE_STATUS.AGING;
  else if (daysIdle <= threshold * 2) status = STALE_STATUS.STALE;
  else                                status = STALE_STATUS.CRITICAL_STALE;

  // Waiting-client stage is naturally idle — never CRITICAL for it
  if (stage === CRM_STAGE.WAITING_CLIENT && status === STALE_STATUS.CRITICAL_STALE) {
    status = STALE_STATUS.STALE;
  }
  // Nurture stage should not be CRITICAL_STALE
  if (stage === CRM_STAGE.NURTURE) {
    status = daysIdle > 60 ? STALE_STATUS.STALE : STALE_STATUS.AGING;
  }

  return Object.freeze({ status, daysIdle, threshold, stage, isReal: false });
}

export function detectStaleOpportunities(opportunities = [], thresholds = DEFAULT_PIPELINE.staleThresholdDays) {
  const results = opportunities.map(opp => {
    const freshness = evaluateOpportunityFreshness(opp, thresholds);
    return Object.freeze({ opportunity: opp, freshness });
  });

  return Object.freeze({
    fresh:         results.filter(r => r.freshness.status === STALE_STATUS.FRESH),
    aging:         results.filter(r => r.freshness.status === STALE_STATUS.AGING),
    stale:         results.filter(r => r.freshness.status === STALE_STATUS.STALE),
    criticalStale: results.filter(r => r.freshness.status === STALE_STATUS.CRITICAL_STALE),
    total:         results.length,
    staleCount:    results.filter(r => [STALE_STATUS.STALE, STALE_STATUS.CRITICAL_STALE].includes(r.freshness.status)).length,
    isReal: false,
  });
}

export const STALE_DETECTOR_VERSION = '1.0.0';
