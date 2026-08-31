// Health Aggregator — ADV-01 Transversal Observability
// Connects existing health modules (aiHealth, automationHealth, HealthCheck)
// into a single calculateSystemHealth() output.

import { SEVERITY } from './eventModel.js';

export const SYSTEM_HEALTH_STATUS = Object.freeze({
  HEALTHY:  'HEALTHY',
  DEGRADED: 'DEGRADED',
  AT_RISK:  'AT_RISK',
  CRITICAL: 'CRITICAL',
  UNKNOWN:  'UNKNOWN',
});

export const HEALTH_FACTORS = Object.freeze({
  FRONTEND:    'frontend',
  API:         'api',
  DATABASE:    'database',
  AUTOMATION:  'automation',
  AI:          'ai',
  INTEGRATIONS:'integrations',
  DEPLOY:      'deploy',
  SECURITY:    'security',
});

const FACTOR_WEIGHTS = {
  [HEALTH_FACTORS.DATABASE]:    20,
  [HEALTH_FACTORS.API]:         20,
  [HEALTH_FACTORS.SECURITY]:    20,
  [HEALTH_FACTORS.AUTOMATION]:  15,
  [HEALTH_FACTORS.AI]:          10,
  [HEALTH_FACTORS.DEPLOY]:      5,
  [HEALTH_FACTORS.FRONTEND]:    5,
  [HEALTH_FACTORS.INTEGRATIONS]:5,
};

const FACTOR_STATUS = Object.freeze({
  HEALTHY:  'HEALTHY',
  DEGRADED: 'DEGRADED',
  CRITICAL: 'CRITICAL',
  UNKNOWN:  'UNKNOWN',
});

function factorScore(status) {
  if (status === FACTOR_STATUS.HEALTHY)  return 1.0;
  if (status === FACTOR_STATUS.DEGRADED) return 0.5;
  if (status === FACTOR_STATUS.CRITICAL) return 0.0;
  return 0.7; // UNKNOWN — partial credit
}

/**
 * Calculate overall system health from factor statuses.
 * @param {object} factors — map of HEALTH_FACTORS → { status, details? }
 * @param {array}  recentCriticalEvents — from observabilityStore.queryCritical()
 */
export function calculateSystemHealth(factors = {}, recentCriticalEvents = []) {
  const factorResults = {};
  let totalWeight     = 0;
  let weightedScore   = 0;
  const issues        = [];

  for (const [factor, weight] of Object.entries(FACTOR_WEIGHTS)) {
    const factorInput  = factors[factor];
    const status       = factorInput?.status ?? FACTOR_STATUS.UNKNOWN;
    const score        = factorScore(status);
    const contribution = weight * score;

    factorResults[factor] = {
      status,
      weight,
      score,
      contribution,
      details: factorInput?.details ?? null,
    };

    totalWeight   += weight;
    weightedScore += contribution;

    if (status === FACTOR_STATUS.CRITICAL) {
      issues.push({ factor, severity: SEVERITY.CRITICAL, message: `${factor} is CRITICAL` });
    } else if (status === FACTOR_STATUS.DEGRADED) {
      issues.push({ factor, severity: SEVERITY.WARNING, message: `${factor} is DEGRADED` });
    }
  }

  const criticalFromEvents = recentCriticalEvents.filter(e => e.severity === SEVERITY.CRITICAL).length;
  if (criticalFromEvents > 0) {
    issues.push({ factor: 'events', severity: SEVERITY.CRITICAL, message: `${criticalFromEvents} critical events in recent window` });
    weightedScore = Math.max(0, weightedScore - criticalFromEvents * 5);
  }

  const healthPercent = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

  const overallStatus =
    healthPercent >= 90 && issues.filter(i => i.severity === SEVERITY.CRITICAL).length === 0 ? SYSTEM_HEALTH_STATUS.HEALTHY :
    healthPercent >= 70 && issues.filter(i => i.severity === SEVERITY.CRITICAL).length === 0 ? SYSTEM_HEALTH_STATUS.DEGRADED :
    healthPercent >= 50 ? SYSTEM_HEALTH_STATUS.AT_RISK :
    SYSTEM_HEALTH_STATUS.CRITICAL;

  return {
    valid:          true,
    overallStatus,
    healthPercent:  Math.max(0, Math.min(100, healthPercent)),
    factors:        factorResults,
    issues,
    criticalIssues: issues.filter(i => i.severity === SEVERITY.CRITICAL).length,
    recentCriticalEvents: criticalFromEvents,
    requiresIntervention: overallStatus === SYSTEM_HEALTH_STATUS.CRITICAL || overallStatus === SYSTEM_HEALTH_STATUS.AT_RISK,
  };
}

/**
 * Build a factor map from existing health module outputs.
 * aiHealthResult  — from maintenance/aiHealth.js auditAIHealth()
 * autoHealthResult — from maintenance/automationHealth.js auditAutomationHealth()
 * healthCheckResult — from core/health/healthCheck.js check()
 */
export function buildFactorsFromExistingModules({ aiHealthResult, autoHealthResult, healthCheckResult, overrides = {} } = {}) {
  const factors = {};

  if (aiHealthResult) {
    factors[HEALTH_FACTORS.AI] = {
      status:  aiHealthResult.status === 'HEALTHY'  ? FACTOR_STATUS.HEALTHY  :
               aiHealthResult.status === 'WARNING'  ? FACTOR_STATUS.DEGRADED : FACTOR_STATUS.CRITICAL,
      details: { healthScore: aiHealthResult.healthScore, total: aiHealthResult.total },
    };
  }

  if (autoHealthResult) {
    factors[HEALTH_FACTORS.AUTOMATION] = {
      status:  autoHealthResult.status === 'HEALTHY'  ? FACTOR_STATUS.HEALTHY  :
               autoHealthResult.status === 'WARNING'  ? FACTOR_STATUS.DEGRADED : FACTOR_STATUS.CRITICAL,
      details: { healthScore: autoHealthResult.healthScore, active: autoHealthResult.active },
    };
  }

  if (healthCheckResult) {
    const ok = healthCheckResult.healthy;
    factors[HEALTH_FACTORS.API] = {
      status:  ok ? FACTOR_STATUS.HEALTHY : FACTOR_STATUS.DEGRADED,
      details: { checks: healthCheckResult.checks },
    };
  }

  return { ...factors, ...overrides };
}

export const HEALTH_AGGREGATOR_VERSION = '1.0.0';
