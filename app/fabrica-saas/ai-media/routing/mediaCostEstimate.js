// Media Cost Estimate — ADV-13

import { MEDIA_COST_GATE } from './mediaCostGuard.js';

export function createMediaCostEstimate(config = {}) {
  const components = Object.freeze({
    avatar:       config.avatar       ?? 0,
    voice:        config.voice        ?? 0,
    video:        config.video        ?? 0,
    storage:      config.storage      ?? 0,
    render:       config.render       ?? 0,
    api:          config.api          ?? 0,
    music:        config.music        ?? 0,
    distribution: config.distribution ?? 0,
  });
  const totalEstimatedCents = Object.values(components).reduce((a, b) => a + b, 0);
  let gate = MEDIA_COST_GATE.FREE_SAFE;
  if (config.hasUnknownCost)          gate = MEDIA_COST_GATE.UNKNOWN;
  else if (totalEstimatedCents > 500) gate = MEDIA_COST_GATE.REQUIRES_APPROVAL;
  else if (totalEstimatedCents > 0)   gate = MEDIA_COST_GATE.ESTIMATED;
  return Object.freeze({
    components,
    totalEstimatedCents,
    gate,
    approvedByHuman: config.approvedByHuman ?? false,
    isReal: false,
  });
}

export const MEDIA_COST_ESTIMATE_VERSION = '1.0.0';
