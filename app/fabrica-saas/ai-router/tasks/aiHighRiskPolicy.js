// High-Risk Task Routing Policy — ADV-16
// Legal/medical/financial/security tasks: quality+grounding+safe-failure first.
// Must NOT use cheap model as sole selection criterion for these tasks.

import { TASK_RISK_LEVEL } from './aiTaskClassifier.js';

const HIGH_RISK_DOMAINS = Object.freeze(['legal', 'medical', 'financial', 'security', 'critical_business']);

export function isHighRiskDomain(domain) {
  return HIGH_RISK_DOMAINS.includes(domain?.toLowerCase());
}

export function createAIHighRiskPolicy(config = {}) {
  const {
    enforcePremiumQuality  = true,
    requireGrounding       = true,
    requireSafeFailure     = true,
    requireEvaluation      = true,
  } = config;

  return Object.freeze({
    HIGH_RISK_DOMAINS,
    enforcePremiumQuality,
    requireGrounding,
    requireSafeFailure,
    requireEvaluation,

    evaluate(taskType, riskLevel, selectedQualityClass) {
      const critical = riskLevel === TASK_RISK_LEVEL.CRITICAL || riskLevel === TASK_RISK_LEVEL.HIGH;

      if (!critical) {
        return Object.freeze({ safe: true, reason: null, isReal: false });
      }

      if (enforcePremiumQuality &&
          selectedQualityClass !== 'PREMIUM' &&
          selectedQualityClass !== 'HIGH') {
        return Object.freeze({
          safe:   false,
          reason: 'UNSAFE_HIGH_RISK_ROUTING: quality too low for critical task',
          isReal: false,
        });
      }

      return Object.freeze({
        safe:        true,
        reason:      null,
        grounding:   requireGrounding,
        evaluation:  requireEvaluation,
        safeFailure: requireSafeFailure,
        isReal:      false,
      });
    },
    isReal: false,
  });
}

export const AI_HIGH_RISK_POLICY_VERSION = '1.0.0';
