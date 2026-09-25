// Business Fit Engine — ADV-07

const FIT_DIMENSIONS = Object.freeze([
  'navigation',
  'dashboard',
  'cta',
  'form',
  'visualTone',
  'contentTone',
  'roleFit',
]);

const VERTICAL_FIT_EXPECTATIONS = Object.freeze({
  veterinary: {
    navigation:  'booking-friendly',
    dashboard:   'agenda-centric',
    cta:         'book-appointment',
    form:        'patient-progressive',
    visualTone:  'warm-teal',
    contentTone: 'warm-professional',
    roleFit:     'vet+owner',
  },
  legal: {
    navigation:  'sidebar-rich',
    dashboard:   'expedient-centric',
    cta:         'consult-trust',
    form:        'structured-detailed',
    visualTone:  'dark-minimal',
    contentTone: 'formal-precise',
    roleFit:     'lawyer+client',
  },
  beauty: {
    navigation:  'service-gallery',
    dashboard:   'booking-revenue',
    cta:         'book-now',
    form:        'minimal-steps',
    visualTone:  'premium-warm',
    contentTone: 'aspirational',
    roleFit:     'staff+client',
  },
});

export function evaluateBusinessExperienceFit(profile = {}, vertical = 'default') {
  const expected = VERTICAL_FIT_EXPECTATIONS[vertical];
  if (!expected) {
    return Object.freeze({ score: 70, note: 'no expectations defined for vertical', vertical, isReal: false });
  }

  let matched = 0;
  const results = {};
  for (const dim of FIT_DIMENSIONS) {
    const exp = expected[dim] ?? '';
    const actual = profile[dim] ?? profile[`${dim}Pattern`] ?? '';
    const fit = actual.toString().toLowerCase().includes(exp.split('-')[0]) || exp === '';
    results[dim] = { expected: exp, actual, fit };
    if (fit) matched++;
  }

  const score = Math.round((matched / FIT_DIMENSIONS.length) * 100);
  return Object.freeze({ score, matched, total: FIT_DIMENSIONS.length, results, vertical, isReal: false });
}

export const BUSINESS_FIT_ENGINE_VERSION = '1.0.0';
