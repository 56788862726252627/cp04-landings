// AI Fallback Chain — ADV-16
// Never fallback to a model incapable of completing the task.

import { shouldFallback } from './aiFallbackPolicy.js';

export const CHAIN_RESULT = Object.freeze({
  RESOLVED:     'RESOLVED',
  EXHAUSTED:    'EXHAUSTED',
  BLOCKED:      'BLOCKED',
  SAFE_FAILURE: 'SAFE_FAILURE',
});

export function createAIFallbackChain(providers = []) {
  // providers: [{ provider, model, capabilities }]
  return Object.freeze({
    chain:  Object.freeze([...providers]),
    length: providers.length,
    isReal: false,
  });
}

export function resolveNextFallback(chain, currentIndex, failureType, requiredCapabilities = []) {
  if (!shouldFallback(failureType)) {
    return Object.freeze({
      result:   CHAIN_RESULT.BLOCKED,
      provider: null,
      reason:   `Failure type ${failureType} requires escalation, not fallback`,
      isReal:   false,
    });
  }

  for (let i = currentIndex + 1; i < chain.chain.length; i++) {
    const candidate = chain.chain[i];
    const caps = candidate.capabilities ?? [];
    const meets = requiredCapabilities.every(c => caps.includes(c));
    if (meets) {
      return Object.freeze({
        result:   CHAIN_RESULT.RESOLVED,
        provider: Object.freeze(candidate),
        index:    i,
        isReal:   false,
      });
    }
  }

  return Object.freeze({
    result:   CHAIN_RESULT.EXHAUSTED,
    provider: null,
    reason:   'No capable fallback provider in chain',
    isReal:   false,
  });
}

export const FALLBACK_CHAIN_VERSION = '1.0.0';
