// Local Business Content Policy — rules specific to local service businesses

export const LOCAL_POLICY_RULE = Object.freeze({
  NO_INVENTED_PRICES:      'NO_INVENTED_PRICES',
  NO_INVENTED_HOURS:       'NO_INVENTED_HOURS',
  NO_FAKE_TESTIMONIALS:    'NO_FAKE_TESTIMONIALS',
  NO_INVENTED_RESULTS:     'NO_INVENTED_RESULTS',
  NO_MISLEADING_GUARANTEE: 'NO_MISLEADING_GUARANTEE',
  CITE_SOURCE_FOR_STATS:   'CITE_SOURCE_FOR_STATS',
  GDPR_COMPLIANT:          'GDPR_COMPLIANT',
  NO_MINOR_IMAGES_WITHOUT_CONSENT: 'NO_MINOR_IMAGES_WITHOUT_CONSENT',
});

const DEFAULT_RULES = Object.freeze(Object.values(LOCAL_POLICY_RULE));

export function createLocalBusinessContentPolicy(config = {}) {
  return Object.freeze({
    businessId:        config.businessId ?? null,
    activeRules:       Object.freeze(config.activeRules ?? DEFAULT_RULES),
    sector:            config.sector ?? 'default',
    gdprRequired:      config.gdprRequired ?? true,
    menorProtection:   config.menorProtection ?? true,
    noInventedClaims:  true,
    isReal:            false,
  });
}

export function validateAgainstLocalPolicy(content = {}, policy = {}) {
  const violations = [];
  const rules = policy.activeRules ?? DEFAULT_RULES;

  if (rules.includes(LOCAL_POLICY_RULE.NO_INVENTED_PRICES) && content.mentionsPrice && !content.priceVerified) {
    violations.push({ rule: LOCAL_POLICY_RULE.NO_INVENTED_PRICES, detail: 'Precio no verificado en el brief' });
  }
  if (rules.includes(LOCAL_POLICY_RULE.NO_INVENTED_HOURS) && content.mentionsHours && !content.hoursVerified) {
    violations.push({ rule: LOCAL_POLICY_RULE.NO_INVENTED_HOURS, detail: 'Horario no verificado' });
  }
  if (rules.includes(LOCAL_POLICY_RULE.NO_FAKE_TESTIMONIALS) && content.hasFakeTestimonial) {
    violations.push({ rule: LOCAL_POLICY_RULE.NO_FAKE_TESTIMONIALS, detail: 'Testimonio fabricado detectado' });
  }
  if (rules.includes(LOCAL_POLICY_RULE.NO_INVENTED_RESULTS) && content.hasInventedResults) {
    violations.push({ rule: LOCAL_POLICY_RULE.NO_INVENTED_RESULTS, detail: 'Resultado inventado' });
  }

  return Object.freeze({ passed: violations.length === 0, violations, isReal: false });
}
