// Business Fact Model — ADV-10b

import { FACT_CATEGORY } from './businessSourceOfTruth.js';
import { SOURCE_PRIORITY } from './businessTruthSourcePriority.js';

export function createBusinessFact(fields = {}) {
  return Object.freeze({
    key:             fields.key ?? '',
    value:           fields.value ?? null,
    category:        fields.category ?? FACT_CATEGORY.CUSTOM_FACTS,
    source:          fields.source ?? 'UNKNOWN',
    sourceId:        fields.sourceId ?? null,
    verified:        fields.verified ?? false,
    confidence:      fields.confidence ?? 0,           // 0-100
    effectiveFrom:   fields.effectiveFrom ?? null,
    effectiveUntil:  fields.effectiveUntil ?? null,
    lastUpdatedAt:   fields.lastUpdatedAt ?? new Date().toISOString(),
    priority:        fields.priority ?? (SOURCE_PRIORITY[fields.source ?? 'UNKNOWN'] ?? 9),
    dynamic:         fields.dynamic ?? false,          // true = real-time sensitive
    clientId:        fields.clientId ?? 'fixture-client',
    vertical:        fields.vertical ?? 'general',
    isReal:          false,
  });
}

export function isFactExpired(fact = {}) {
  if (!fact.effectiveUntil) return false;
  return new Date(fact.effectiveUntil) < new Date();
}

export function isFactActive(fact = {}) {
  if (isFactExpired(fact)) return false;
  if (fact.effectiveFrom && new Date(fact.effectiveFrom) > new Date()) return false;
  return true;
}

export const BUSINESS_FACT_VERSION = '1.0.0';
