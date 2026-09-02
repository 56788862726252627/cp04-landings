// Business Fact Grounding Evaluator — ADV-10b

import { FACT_RESOLUTION } from './business-truth/businessFactResolver.js';

export const BUSINESS_GROUNDING_STATUS = Object.freeze({
  SUPPORTED:           'SUPPORTED',
  PARTIALLY_SUPPORTED: 'PARTIALLY_SUPPORTED',
  UNSUPPORTED:         'UNSUPPORTED',
  CONFLICTING:         'CONFLICTING',
  FABRICATED:          'FABRICATED',
});

export function evaluateBusinessFactGrounding(response = {}, facts = []) {
  const claims        = response.claims ?? [];
  const responseText  = response.text ?? '';
  const evaluations   = [];

  for (const claim of claims) {
    const matchingFact = facts.find(f => f.key === claim.key && f.clientId === (response.clientId ?? f.clientId));

    if (!matchingFact) {
      // Claim made with no fact in source of truth
      evaluations.push(Object.freeze({
        claim:  claim.key,
        status: BUSINESS_GROUNDING_STATUS.FABRICATED,
        note:   `No authorized fact for "${claim.key}" — agent fabricated this claim`,
        isCritical: true,
      }));
      continue;
    }

    if (JSON.stringify(claim.value) === JSON.stringify(matchingFact.value)) {
      evaluations.push(Object.freeze({
        claim:  claim.key,
        status: BUSINESS_GROUNDING_STATUS.SUPPORTED,
        source: matchingFact.source,
      }));
    } else {
      // Claim contradicts source
      evaluations.push(Object.freeze({
        claim:    claim.key,
        status:   BUSINESS_GROUNDING_STATUS.CONFLICTING,
        expected: matchingFact.value,
        stated:   claim.value,
        source:   matchingFact.source,
        isCritical: true,
        note:     `Agent stated "${claim.value}" but source says "${matchingFact.value}"`,
      }));
    }
  }

  const fabricated   = evaluations.filter(e => e.status === BUSINESS_GROUNDING_STATUS.FABRICATED);
  const conflicting  = evaluations.filter(e => e.status === BUSINESS_GROUNDING_STATUS.CONFLICTING);
  const supported    = evaluations.filter(e => e.status === BUSINESS_GROUNDING_STATUS.SUPPORTED);

  let overallStatus;
  if (fabricated.length > 0)       overallStatus = BUSINESS_GROUNDING_STATUS.FABRICATED;
  else if (conflicting.length > 0)  overallStatus = BUSINESS_GROUNDING_STATUS.CONFLICTING;
  else if (supported.length === 0 && evaluations.length === 0) overallStatus = BUSINESS_GROUNDING_STATUS.SUPPORTED;
  else if (supported.length < evaluations.length) overallStatus = BUSINESS_GROUNDING_STATUS.PARTIALLY_SUPPORTED;
  else overallStatus = BUSINESS_GROUNDING_STATUS.SUPPORTED;

  const score = fabricated.length > 0 ? 0 :
    conflicting.length > 0 ? 20 :
    evaluations.length === 0 ? 100 :
    Math.round((supported.length / evaluations.length) * 100);

  return Object.freeze({
    overallStatus,
    score,
    evaluations:  Object.freeze(evaluations),
    fabricated:   Object.freeze(fabricated),
    conflicting:  Object.freeze(conflicting),
    supported:    Object.freeze(supported),
    isCritical:   fabricated.length > 0 || conflicting.length > 0,
    isReal:       false,
  });
}

export const BUSINESS_FACT_GROUNDING_EVALUATOR_VERSION = '1.0.0';
