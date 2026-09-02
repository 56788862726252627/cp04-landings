// AI Model Selector — ADV-16
// Selects provider+model from catalog given a request profile and routing mode.
// Never exposes chain-of-thought — only a structured summary.

import { ROUTING_MODE, getRoutingModeWeights } from './aiRoutingMode.js';
import { COST_CLASS } from '../models/aiModelDefinition.js';

const QUALITY_SCORE = { BASIC: 1, STANDARD: 2, HIGH: 3, PREMIUM: 4 };
const SPEED_SCORE   = { VERY_FAST: 4, FAST: 3, NORMAL: 2, SLOW: 1 };
const COST_SCORE    = { FREE: 5, VERY_LOW: 4, LOW: 3, MEDIUM: 2, HIGH: 1, UNKNOWN: 0 };

function scoreModel(model, weights, requestProfile) {
  const q = (QUALITY_SCORE[model.qualityClass] ?? 1) / 4 * 100;
  const s = (SPEED_SCORE[model.speedClass]     ?? 1) / 4 * 100;
  const c = (COST_SCORE[model.costClass]       ?? 0) / 5 * 100;

  // Privacy: prefer models matching or exceeding privacy requirement
  const p = model.privacyClass === requestProfile.privacyLevel ? 100 : 50;

  return (q * weights.quality + s * weights.latency + c * weights.cost + p * weights.privacy) / 100;
}

export function selectAIModel(catalog = [], requestProfile = {}, mode = ROUTING_MODE.BALANCED) {
  if (!catalog.length) {
    return Object.freeze({
      selectedProvider: null,
      selectedModel:    null,
      alternatives:     Object.freeze([]),
      fallbackChain:    Object.freeze([]),
      estimatedCostClass: COST_CLASS.UNKNOWN,
      routingReasonSummary: 'No models in catalog',
      isReal: false,
    });
  }

  const weights = getRoutingModeWeights(mode);
  const requiredCaps = requestProfile.requiredCapabilities ?? [];

  // Filter: only capable models that are AVAILABLE and not BLOCKED
  const eligible = catalog.filter(m => {
    if (m.status !== 'AVAILABLE' && m.status !== 'PREVIEW') return false;
    if (requiredCaps.length && !requiredCaps.every(c => (m.capabilities ?? []).includes(c))) return false;
    if (requestProfile.requiresTools  && !m.tools)            return false;
    if (requestProfile.requiresVision && !m.vision)            return false;
    if (requestProfile.requiresStructuredOutput && !m.structuredOutput) return false;
    return true;
  });

  if (!eligible.length) {
    return Object.freeze({
      selectedProvider: null,
      selectedModel:    null,
      alternatives:     Object.freeze([]),
      fallbackChain:    Object.freeze([]),
      estimatedCostClass: COST_CLASS.UNKNOWN,
      routingReasonSummary: 'No eligible model meets capability requirements',
      isReal: false,
    });
  }

  const scored = eligible
    .map(m => ({ model: m, score: scoreModel(m, weights, requestProfile) }))
    .sort((a, b) => b.score - a.score);

  const best  = scored[0].model;
  const alts  = scored.slice(1, 4).map(s => s.model);
  const chain = scored.slice(1).map(s => ({ provider: s.model.provider, model: s.model.modelId, capabilities: s.model.capabilities }));

  return Object.freeze({
    selectedProvider:     best.provider,
    selectedModel:        best.modelId,
    alternatives:         Object.freeze(alts),
    fallbackChain:        Object.freeze(chain),
    estimatedCostClass:   best.costClass,
    routingReasonSummary: `Mode=${mode} | Quality=${best.qualityClass} | Cost=${best.costClass} | Speed=${best.speedClass}`,
    isReal: false,
  });
}

export const AI_MODEL_SELECTOR_VERSION = '1.0.0';
