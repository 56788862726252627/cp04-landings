// Pricing Fact Evaluator — ADV-10b

export const PRICING_GROUNDING_STATUS = Object.freeze({
  VERIFIED:   'VERIFIED',
  UNVERIFIED: 'UNVERIFIED',
  UNKNOWN:    'UNKNOWN',
  FABRICATED: 'FABRICATED',
  RANGE_OK:   'RANGE_OK',
});

export function evaluatePricingFact(claim = {}, priceFacts = []) {
  const { key, value: claimedPrice } = claim;

  if (claimedPrice === undefined || claimedPrice === null) {
    return Object.freeze({ status: PRICING_GROUNDING_STATUS.UNKNOWN, isCritical: false, isReal: false });
  }

  const authorizedFact = priceFacts.find(f => f.key === key && f.verified);

  if (!authorizedFact) {
    return Object.freeze({
      status:     PRICING_GROUNDING_STATUS.FABRICATED,
      claimedPrice,
      note:       `No authorized price found for "${key}" — agent fabricated price`,
      isCritical: true,
      isReal:     false,
    });
  }

  const authorizedValue = authorizedFact.value;

  // Exact match
  if (claimedPrice === authorizedValue) {
    return Object.freeze({ status: PRICING_GROUNDING_STATUS.VERIFIED, claimedPrice, authorizedValue, isCritical: false, isReal: false });
  }

  // Range check (if authorized value is a range object)
  if (authorizedValue && typeof authorizedValue === 'object' && 'min' in authorizedValue && 'max' in authorizedValue) {
    if (claimedPrice >= authorizedValue.min && claimedPrice <= authorizedValue.max) {
      return Object.freeze({ status: PRICING_GROUNDING_STATUS.RANGE_OK, claimedPrice, authorizedValue, isCritical: false, isReal: false });
    }
  }

  return Object.freeze({
    status:     PRICING_GROUNDING_STATUS.UNVERIFIED,
    claimedPrice,
    authorizedValue,
    note:       `Agent stated ${claimedPrice} but source says ${JSON.stringify(authorizedValue)}`,
    isCritical: true,
    isReal:     false,
  });
}

export const PRICING_FACT_EVALUATOR_VERSION = '1.0.0';
