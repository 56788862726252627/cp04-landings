// AI Router Cost Guard — ADV-16
// Blocks: unknown paid execution, HIGH without policy, budget exceeded, unapproved provider.

import { COST_CLASS } from './aiModelCostProfile.js';
import { ESTIMATE_CONFIDENCE } from './aiRequestCostEstimate.js';

export const COST_GUARD_RESULT = Object.freeze({
  ALLOWED:  'ALLOWED',
  BLOCKED:  'BLOCKED',
  WARN:     'WARN',
});

export function createAIRouterCostGuard(config = {}) {
  const {
    approvedProviders = null,   // null = all allowed
    blockUnknownPaid  = true,
    blockHighCostWithoutPolicy = true,
  } = config;

  return Object.freeze({
    evaluate(estimate, budgetPolicy = null) {
      const { estimatedCostClass, confidence, provider } = estimate;

      // Block unknown cost when paid is possible
      if (blockUnknownPaid &&
          estimatedCostClass === COST_CLASS.UNKNOWN &&
          confidence === ESTIMATE_CONFIDENCE.UNKNOWN) {
        return Object.freeze({
          result: COST_GUARD_RESULT.BLOCKED,
          reason: 'UNKNOWN_PAID_EXECUTION',
          isReal: false,
        });
      }

      // Block HIGH without explicit budget policy approval
      if (blockHighCostWithoutPolicy &&
          estimatedCostClass === COST_CLASS.HIGH &&
          !budgetPolicy) {
        return Object.freeze({
          result: COST_GUARD_RESULT.BLOCKED,
          reason: 'HIGH_COST_WITHOUT_POLICY',
          isReal: false,
        });
      }

      // Check approved providers
      if (approvedProviders && !approvedProviders.includes(provider)) {
        return Object.freeze({
          result: COST_GUARD_RESULT.BLOCKED,
          reason: 'PROVIDER_NOT_APPROVED',
          isReal: false,
        });
      }

      // Budget policy check
      if (budgetPolicy) {
        if (!budgetPolicy.isAllowed(estimatedCostClass)) {
          return Object.freeze({
            result: COST_GUARD_RESULT.BLOCKED,
            reason: 'BUDGET_EXCEEDED',
            isReal: false,
          });
        }
        if (budgetPolicy.requiresApproval(estimatedCostClass)) {
          return Object.freeze({
            result: COST_GUARD_RESULT.WARN,
            reason: 'HUMAN_APPROVAL_REQUIRED',
            isReal: false,
          });
        }
      }

      return Object.freeze({ result: COST_GUARD_RESULT.ALLOWED, reason: null, isReal: false });
    },
    isReal: false,
  });
}

export const AI_ROUTER_COST_GUARD_VERSION = '1.0.0';
