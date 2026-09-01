// Lead Provider Cost Guard — ADV-08

import { COST_STATUS } from './providers/leadDiscoveryProvider.js';

export function createLeadProviderCostGuard(limits = {}) {
  return Object.freeze({
    maxBudgetEUR:    limits.maxBudgetEUR    ?? 0,
    maxResults:      limits.maxResults      ?? 100,
    maxActorRuns:    limits.maxActorRuns    ?? 1,
    autoApprove:     limits.autoApprove     ?? false,
    blockIfUnknown:  limits.blockIfUnknown  ?? true,
    isReal: false,
  });
}

export function guardProviderRun(provider = {}, guard = {}) {
  const estimated = provider.estimatedCost ?? 0;
  const maxBudget = guard.maxBudgetEUR     ?? 0;

  if (estimated === 0 || !provider.requiresToken) {
    return Object.freeze({ allowed: true, costStatus: COST_STATUS.FREE_SAFE, reason: 'Free/fixture provider', isReal: false });
  }
  if (estimated > maxBudget) {
    return Object.freeze({ allowed: false, costStatus: COST_STATUS.BLOCKED, reason: `Estimated cost ${estimated} EUR exceeds budget ${maxBudget} EUR`, isReal: false });
  }
  if (!guard.autoApprove) {
    return Object.freeze({ allowed: false, costStatus: COST_STATUS.REQUIRES_APPROVAL, reason: 'Manual approval required before live run', isReal: false });
  }
  return Object.freeze({ allowed: true, costStatus: COST_STATUS.REQUIRES_APPROVAL, reason: 'Auto-approved', isReal: false });
}

export const COST_GUARD_VERSION = '1.0.0';
