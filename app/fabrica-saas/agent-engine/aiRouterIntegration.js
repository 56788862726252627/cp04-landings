// AI Router Integration — ADV-03
// Integración con core/aiRouter.js existente. Sin nueva lógica de routing.

import { classifyTask, AI_TIERS } from '../core/aiRouter.js';

export const ROUTING_PREFERENCE = Object.freeze({
  COST:    'COST',
  SPEED:   'SPEED',
  QUALITY: 'QUALITY',
  AUTO:    'AUTO',
});

/**
 * Resolve which model tier to use for an agent task.
 * Delegates to core/aiRouter.js — this module is an adapter only.
 */
export function resolveAgentModelTier(params = {}) {
  const {
    agentType       = 'CHAT',
    taskComplexity  = 'SIMPLE',
    riskLevel       = 'LOW',
    channel         = 'WEB_CHAT',
    latencyBudget   = 'NORMAL',
    costPreference  = ROUTING_PREFERENCE.AUTO,
    requiresToolUse = false,
  } = params;

  // Map agent context to aiRouter parameters
  const routerInput = {
    complexity:      mapComplexity(taskComplexity, agentType),
    risk:            riskLevel,
    channel,
    latency:         latencyBudget,
    preference:      costPreference,
    toolUse:         requiresToolUse,
  };

  // Build a task description string for classifyTask
  const taskDesc = `${agentType.toLowerCase()} agent: ${taskComplexity.toLowerCase()} complexity, ${riskLevel.toLowerCase()} risk, channel ${channel}`;

  let tier;
  let fallback = false;
  try {
    const result = classifyTask(taskDesc, { forceReview: riskLevel === 'HIGH' });
    tier = result?.tier ?? AI_TIERS.TIER3_CLAUDE;
  } catch {
    tier     = AI_TIERS.TIER3_CLAUDE;
    fallback = true;
  }

  return Object.freeze({
    tier,
    fallback,
    routerInput,
    agentType,
    taskComplexity,
    disclaimer: 'Model resolution is deterministic. No real API call made.',
  });
}

function mapComplexity(taskComplexity, agentType) {
  if (taskComplexity === 'COMPLEX') return 'high';
  if (agentType === 'SALES' || agentType === 'LEAD') return 'medium';
  if (agentType === 'SUPPORT' || agentType === 'VOICE') return 'medium';
  return 'low';
}

export const AI_ROUTER_INTEGRATION_VERSION = '1.0.0';
