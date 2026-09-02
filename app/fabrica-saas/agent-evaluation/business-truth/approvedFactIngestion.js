// Approved Business Fact Ingestion — ADV-10b
// Only explicit prompt facts qualify — no inference, no contradiction of higher sources.

import { createBusinessFact } from './businessFact.js';
import { FACT_CATEGORY } from './businessSourceOfTruth.js';
import { getSourcePriorityLevel } from './businessTruthSourcePriority.js';

// Keys that must come from higher-priority sources (operational data)
const REQUIRES_HIGHER_SOURCE = new Set(['availability', 'capacity', 'liveCapacity']);

export function extractApprovedBusinessFacts(promptFacts = {}, existingFacts = [], clientId = '') {
  const ingested  = [];
  const rejected  = [];

  for (const [key, value] of Object.entries(promptFacts)) {
    // Operational facts cannot come from prompts
    if (REQUIRES_HIGHER_SOURCE.has(key)) {
      rejected.push({ key, reason: 'Operational fact requires LIVE_OPERATIONAL_API or BUSINESS_DATABASE source' });
      continue;
    }

    // Check if a higher-priority source already has this key
    const higherFact = existingFacts.find(f =>
      f.key === key &&
      f.clientId === clientId &&
      getSourcePriorityLevel(f.source) < getSourcePriorityLevel('APPROVED_PROMPT_FACTS')
    );

    if (higherFact) {
      rejected.push({ key, reason: `Overridden by higher-priority source "${higherFact.source}"` });
      continue;
    }

    ingested.push(createBusinessFact({
      key,
      value,
      category:   guessCategory(key),
      source:     'APPROVED_PROMPT_FACTS',
      verified:   true,
      confidence: 75,
      dynamic:    false,
      clientId,
    }));
  }

  return Object.freeze({
    ingested:  Object.freeze(ingested),
    rejected:  Object.freeze(rejected),
    count:     ingested.length,
    isReal:    false,
  });
}

function guessCategory(key = '') {
  if (/hour|schedule|open|close/i.test(key)) return FACT_CATEGORY.OPENING_HOURS;
  if (/holiday|closed|closure/i.test(key))   return FACT_CATEGORY.CLOSED_DAYS;
  if (/price|cost|fee|rate/i.test(key))       return FACT_CATEGORY.PRICES;
  if (/court|room|facility|pitch/i.test(key)) return FACT_CATEGORY.FACILITIES;
  if (/service|treatment|class/i.test(key))   return FACT_CATEGORY.SERVICES;
  if (/cancel|refund|booking/i.test(key))     return FACT_CATEGORY.POLICIES;
  if (/phone|email|address|location/i.test(key)) return FACT_CATEGORY.CONTACT;
  return FACT_CATEGORY.CUSTOM_FACTS;
}

export const APPROVED_FACT_INGESTION_VERSION = '1.0.0';
