// Business Fact Resolver — ADV-10b

import { getSourcePriorityLevel } from './businessTruthSourcePriority.js';
import { isFactActive } from './businessFact.js';
import { getFreshnessStatus, FRESHNESS_STATUS } from './businessFactFreshnessPolicy.js';

export const FACT_RESOLUTION = Object.freeze({
  KNOWN:    'KNOWN',
  UNKNOWN:  'UNKNOWN',
  CONFLICT: 'CONFLICT',
  STALE:    'STALE',
});

// eslint-disable-next-line no-unused-vars
export function resolveBusinessFact(clientId = '', factKey = '', facts = [], context = {}, timestamp = Date.now()) {
  const clientFacts = facts.filter(f => f.clientId === clientId && f.key === factKey && isFactActive(f));

  if (clientFacts.length === 0) {
    return Object.freeze({
      resolution: FACT_RESOLUTION.UNKNOWN,
      value:      null,
      source:     null,
      fact:       null,
      note:       `No authorized source found for fact "${factKey}" in client "${clientId}"`,
      isReal:     false,
    });
  }

  // Sort by source priority (lower number = higher priority)
  const sorted = [...clientFacts].sort((a, b) =>
    getSourcePriorityLevel(a.source) - getSourcePriorityLevel(b.source)
  );
  const winner = sorted[0];

  // Check freshness
  const freshness = getFreshnessStatus(winner, timestamp);
  if (freshness === FRESHNESS_STATUS.EXPIRED || freshness === FRESHNESS_STATUS.STALE) {
    return Object.freeze({
      resolution: FACT_RESOLUTION.STALE,
      value:      winner.value,
      source:     winner.source,
      fact:       winner,
      freshness,
      note:       `Fact "${factKey}" is ${freshness} — treat with caution`,
      isReal:     false,
    });
  }

  // Check for conflicts (multiple sources with different values)
  const distinctValues = new Set(clientFacts.map(f => JSON.stringify(f.value)));
  if (distinctValues.size > 1) {
    return Object.freeze({
      resolution:    FACT_RESOLUTION.CONFLICT,
      value:         winner.value,   // winner by priority
      source:        winner.source,
      fact:          winner,
      conflictCount: distinctValues.size,
      note:          `Conflict detected for "${factKey}" — using highest priority source "${winner.source}"`,
      isReal:        false,
    });
  }

  return Object.freeze({
    resolution: FACT_RESOLUTION.KNOWN,
    value:      winner.value,
    source:     winner.source,
    fact:       winner,
    note:       null,
    isReal:     false,
  });
}

export const BUSINESS_FACT_RESOLVER_VERSION = '1.0.0';
