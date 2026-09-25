// Agent Business Fact Policy — ADV-10b

export const FACT_POLICY_RULE = Object.freeze({
  READ_ONLY_BY_DEFAULT:               'READ_ONLY_BY_DEFAULT',
  SOURCE_REQUIRED:                    'SOURCE_REQUIRED',
  NO_ASSUMPTION:                      'NO_ASSUMPTION',
  NO_UNVERIFIED_OPERATIONAL_FACTS:    'NO_UNVERIFIED_OPERATIONAL_FACTS',
  NO_UNVERIFIED_PRICING:              'NO_UNVERIFIED_PRICING',
  NO_UNVERIFIED_AVAILABILITY:         'NO_UNVERIFIED_AVAILABILITY',
});

export const AgentBusinessFactPolicy = Object.freeze({
  rules: Object.freeze(Object.values(FACT_POLICY_RULE)),
  canAssertFact(fact = {}) {
    if (!fact) return Object.freeze({ allowed: false, reason: 'Null fact', isReal: false });
    if (!fact.source || fact.source === 'UNKNOWN') return Object.freeze({ allowed: false, reason: 'No authorized source', isReal: false });
    if (fact.source === 'MODEL_ASSUMPTION') return Object.freeze({ allowed: false, reason: 'MODEL_ASSUMPTION is forbidden', isReal: false });
    if (!fact.verified && ['AVAILABILITY', 'PRICES', 'CAPACITY'].includes(fact.category)) {
      return Object.freeze({ allowed: false, reason: `Unverified ${fact.category} fact cannot be asserted`, isReal: false });
    }
    if ((fact.confidence ?? 0) < 50) {
      return Object.freeze({ allowed: false, reason: `Low confidence (${fact.confidence}) — cannot assert`, isReal: false });
    }
    return Object.freeze({ allowed: true, reason: null, isReal: false });
  },
  version: '1.0.0',
  isReal: false,
});

export const AGENT_BUSINESS_FACT_POLICY_VERSION = '1.0.0';
