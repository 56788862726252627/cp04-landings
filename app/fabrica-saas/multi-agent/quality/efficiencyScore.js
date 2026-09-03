// Multi-Agent Efficiency Score — ADV-17
// Penalizes unnecessary agents, duplicate work, excessive context, excessive retries.

export function computeMultiAgentEfficiencyScore(metrics = {}) {
  const {
    agentCount        = 1,
    optimalAgentCount = 2,
    duplicateTasks    = 0,
    unnecessaryDelegations = 0,
    contextSizeKb     = 1,
    maxContextKb      = 8,
    retryCount        = 0,
    maxRetries        = 3,
    criticCycles      = 0,
    maxCriticCycles   = 2,
  } = metrics;

  let score = 100;

  // Too many agents penalty
  if (agentCount > optimalAgentCount) score -= Math.min(20, (agentCount - optimalAgentCount) * 5);

  // Duplicate work
  score -= Math.min(20, duplicateTasks * 10);

  // Unnecessary delegations
  score -= Math.min(15, unnecessaryDelegations * 5);

  // Context bloat
  if (contextSizeKb > maxContextKb) score -= Math.min(15, Math.floor((contextSizeKb - maxContextKb) / maxContextKb * 15));

  // Excessive retries
  if (retryCount > maxRetries) score -= Math.min(15, (retryCount - maxRetries) * 5);

  // Excessive critic cycles
  if (criticCycles > maxCriticCycles) score -= Math.min(15, (criticCycles - maxCriticCycles) * 5);

  const final = Math.max(0, Math.round(score));

  return Object.freeze({
    overall:       final,
    efficient:     final >= 70,
    penalties:     Object.freeze({
      agentOverhead:          agentCount > optimalAgentCount ? (agentCount - optimalAgentCount) * 5 : 0,
      duplicateWork:          duplicateTasks * 10,
      unnecessaryDelegations: unnecessaryDelegations * 5,
      contextBloat:           contextSizeKb > maxContextKb ? 10 : 0,
      excessRetries:          retryCount > maxRetries ? (retryCount - maxRetries) * 5 : 0,
      excessCriticCycles:     criticCycles > maxCriticCycles ? (criticCycles - maxCriticCycles) * 5 : 0,
    }),
    isReal: false,
  });
}

export const EFFICIENCY_SCORE_VERSION = '1.0.0';
