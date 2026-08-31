// AI Health — PASO F
// Audits AI agent health: latency, error rate, model availability.

export const AI_AGENT_STATUS = Object.freeze({
  HEALTHY:     'HEALTHY',
  DEGRADED:    'DEGRADED',
  UNAVAILABLE: 'UNAVAILABLE',
  UNKNOWN:     'UNKNOWN',
});

export const AI_HEALTH_STATUS = Object.freeze({
  HEALTHY:  'HEALTHY',
  WARNING:  'WARNING',
  CRITICAL: 'CRITICAL',
  UNKNOWN:  'UNKNOWN',
});

const DEFAULT_THRESHOLDS = {
  maxLatencyMs:     3000,
  maxErrorRate:     0.05,
  minTokenBudget:   1000,
};

/**
 * Audit AI agent health for a list of agents.
 * Each agent: { id, name, status, latencyMs, errorRate, model, tokenBudgetRemaining, critical }
 */
export function auditAIHealth(agents = [], thresholds = {}) {
  if (!Array.isArray(agents)) {
    return { valid: false, error: 'agents must be an array' };
  }

  const limits = { ...DEFAULT_THRESHOLDS, ...thresholds };

  if (agents.length === 0) {
    return {
      valid:       true,
      total:       0,
      healthScore: 100,
      status:      AI_HEALTH_STATUS.UNKNOWN,
      issues:      [],
      agents:      [],
      disclaimer:  'No AI agents provided. Status: UNKNOWN.',
    };
  }

  const issues = [];
  let scoreDeduction = 0;

  const audited = agents.map(agent => {
    const aIssues = [];

    if (agent.status === AI_AGENT_STATUS.UNAVAILABLE) {
      aIssues.push({ severity: 'CRITICAL', issue: `Agent ${agent.id ?? agent.name} is UNAVAILABLE` });
      scoreDeduction += agent.critical ? 30 : 15;
    }
    if (agent.status === AI_AGENT_STATUS.DEGRADED) {
      aIssues.push({ severity: 'WARNING', issue: `Agent ${agent.id ?? agent.name} is DEGRADED` });
      scoreDeduction += 10;
    }
    if ((agent.latencyMs ?? 0) > limits.maxLatencyMs) {
      aIssues.push({ severity: 'WARNING', issue: `Agent ${agent.id ?? agent.name} latency ${agent.latencyMs}ms exceeds ${limits.maxLatencyMs}ms threshold` });
      scoreDeduction += 10;
    }
    if ((agent.errorRate ?? 0) > limits.maxErrorRate) {
      aIssues.push({ severity: 'WARNING', issue: `Agent ${agent.id ?? agent.name} error rate ${Math.round((agent.errorRate ?? 0) * 100)}% exceeds ${limits.maxErrorRate * 100}% threshold` });
      scoreDeduction += 10;
    }
    if ((agent.tokenBudgetRemaining ?? Infinity) < limits.minTokenBudget) {
      aIssues.push({ severity: 'WARNING', issue: `Agent ${agent.id ?? agent.name} token budget low: ${agent.tokenBudgetRemaining} remaining` });
      scoreDeduction += 5;
    }

    issues.push(...aIssues);

    return {
      ...agent,
      healthy: aIssues.length === 0,
      issues:  aIssues,
    };
  });

  const healthy     = agents.filter(a => a.status === AI_AGENT_STATUS.HEALTHY).length;
  const unavailable = agents.filter(a => a.status === AI_AGENT_STATUS.UNAVAILABLE).length;
  const degraded    = agents.filter(a => a.status === AI_AGENT_STATUS.DEGRADED).length;

  const healthScore = Math.max(0, 100 - scoreDeduction);
  const criticalErrors = issues.filter(i => i.severity === 'CRITICAL').length;

  const status = criticalErrors > 0 ? AI_HEALTH_STATUS.CRITICAL
    : healthScore < 70              ? AI_HEALTH_STATUS.WARNING
    : AI_HEALTH_STATUS.HEALTHY;

  return {
    valid:       true,
    total:       agents.length,
    healthy,
    unavailable,
    degraded,
    healthScore,
    status,
    issues,
    agents:      audited,
    thresholds:  limits,
    disclaimer:  'AI health audit is an operational assessment. No agent configuration modified.',
  };
}

export const AI_HEALTH_VERSION = '1.0.0';
