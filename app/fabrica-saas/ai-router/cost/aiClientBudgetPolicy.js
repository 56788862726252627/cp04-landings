// AI Client Budget Policy — ADV-16
// No real billing — classification and guardrail only.

import { COST_CLASS } from './aiModelCostProfile.js';

export const BUDGET_MODE = Object.freeze({
  UNLIMITED:   'UNLIMITED',
  MONITORED:   'MONITORED',
  CAPPED:      'CAPPED',
  FREE_ONLY:   'FREE_ONLY',
});

const COST_ORDER = [COST_CLASS.FREE, COST_CLASS.VERY_LOW, COST_CLASS.LOW, COST_CLASS.MEDIUM, COST_CLASS.HIGH, COST_CLASS.UNKNOWN];

export function createAIClientBudgetPolicy(config = {}) {
  const {
    clientId                = 'unknown',
    mode                    = BUDGET_MODE.MONITORED,
    maxRequestCostClass     = COST_CLASS.MEDIUM,
    dailyBudgetFoundation   = null,   // placeholder, no real billing
    monthlyBudgetFoundation = null,
    allowPaidFallback       = true,
    humanApprovalThreshold  = COST_CLASS.HIGH,
  } = config;

  return Object.freeze({
    clientId,
    mode,
    maxRequestCostClass,
    dailyBudgetFoundation,
    monthlyBudgetFoundation,
    allowPaidFallback,
    humanApprovalThreshold,
    realBillingActive: false,

    isAllowed(costClass) {
      if (mode === BUDGET_MODE.UNLIMITED) return true;
      if (mode === BUDGET_MODE.FREE_ONLY)  return costClass === COST_CLASS.FREE;
      if (costClass === COST_CLASS.UNKNOWN) return false; // block unknown paid
      const idx    = COST_ORDER.indexOf(costClass);
      const maxIdx = COST_ORDER.indexOf(maxRequestCostClass);
      return idx <= maxIdx;
    },

    requiresApproval(costClass) {
      const idx    = COST_ORDER.indexOf(costClass);
      const appIdx = COST_ORDER.indexOf(humanApprovalThreshold);
      return idx >= appIdx;
    },
    isReal: false,
  });
}

export const AI_CLIENT_BUDGET_POLICY_VERSION = '1.0.0';
