// Factory Generation Bridge — One Prompt → SaaS truth generation — ADV-10b
// Extracts business facts from a brief without inventing values not present.

import { createBusinessFact } from './businessFact.js';
import { FACT_CATEGORY } from './businessSourceOfTruth.js';
import { createBusinessSourceOfTruth } from './businessSourceOfTruth.js';

export function generateBusinessTruthFromBrief(brief = {}) {
  const facts        = [];
  const unknownFacts = [];

  // Extract only EXPLICIT values from brief — never infer
  if (brief.openingHours) {
    facts.push(createBusinessFact({
      key:      'openingHours',
      value:    brief.openingHours,
      category: FACT_CATEGORY.OPENING_HOURS,
      source:   'APPROVED_PROMPT_FACTS',
      verified: true,
      confidence: 80,
      clientId: brief.clientId ?? 'generated',
      vertical: brief.vertical ?? 'general',
    }));
  } else { unknownFacts.push('openingHours'); }

  if (brief.closedDays) {
    facts.push(createBusinessFact({
      key:      'closedDays',
      value:    brief.closedDays,
      category: FACT_CATEGORY.CLOSED_DAYS,
      source:   'APPROVED_PROMPT_FACTS',
      verified: true,
      confidence: 90,
      clientId: brief.clientId ?? 'generated',
      vertical: brief.vertical ?? 'general',
    }));
  } else { unknownFacts.push('closedDays'); }

  if (brief.prices) {
    facts.push(createBusinessFact({
      key:      'prices',
      value:    brief.prices,
      category: FACT_CATEGORY.PRICES,
      source:   'APPROVED_PROMPT_FACTS',
      verified: true,
      confidence: 85,
      clientId: brief.clientId ?? 'generated',
      vertical: brief.vertical ?? 'general',
    }));
  } else { unknownFacts.push('prices'); }

  if (brief.facilities) {
    facts.push(createBusinessFact({
      key:      'facilities',
      value:    brief.facilities,
      category: FACT_CATEGORY.FACILITIES,
      source:   'APPROVED_PROMPT_FACTS',
      verified: true,
      confidence: 85,
      clientId: brief.clientId ?? 'generated',
      vertical: brief.vertical ?? 'general',
    }));
  } else { unknownFacts.push('facilities'); }

  if (brief.services) {
    facts.push(createBusinessFact({
      key:      'services',
      value:    brief.services,
      category: FACT_CATEGORY.SERVICES,
      source:   'APPROVED_PROMPT_FACTS',
      verified: true,
      confidence: 85,
      clientId: brief.clientId ?? 'generated',
      vertical: brief.vertical ?? 'general',
    }));
  } else { unknownFacts.push('services'); }

  const truth = createBusinessSourceOfTruth({
    clientId: brief.clientId ?? 'generated',
    vertical: brief.vertical ?? 'general',
    name:     brief.businessName ?? 'Generated Business',
    facts,
  });

  return Object.freeze({
    truth,
    businessFacts:     Object.freeze(facts),
    businessSchedule:  brief.openingHours ?? null,
    businessPolicies:  brief.policies ?? null,
    truthSources:      Object.freeze(['APPROVED_PROMPT_FACTS']),
    unknownFacts:      Object.freeze(unknownFacts),
    note:              'Only explicit brief values extracted — no inference',
    isReal:            false,
  });
}

export const FACTORY_GENERATION_BRIDGE_VERSION = '1.0.0';
