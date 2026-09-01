// Trust Design System — ADV-07

export const TRUST_ELEMENT = Object.freeze({
  CREDENTIALS:        'CREDENTIALS',
  REVIEWS:            'REVIEWS',
  PROOF:              'PROOF',
  CERTIFICATIONS:     'CERTIFICATIONS',
  PRIVACY_CUES:       'PRIVACY_CUES',
  SECURITY_CUES:      'SECURITY_CUES',
  CONTACT_CLARITY:    'CONTACT_CLARITY',
  LOCAL_TRUST:        'LOCAL_TRUST',
  DISCLAIMER:         'DISCLAIMER',
});

const TRUST_SPECS = Object.freeze({
  [TRUST_ELEMENT.CREDENTIALS]:    { location: 'hero,footer', fixtureOnly: true },
  [TRUST_ELEMENT.REVIEWS]:        { location: 'hero,section', fixtureOnly: true },
  [TRUST_ELEMENT.PROOF]:          { location: 'section', fixtureOnly: true },
  [TRUST_ELEMENT.CERTIFICATIONS]: { location: 'footer,about', fixtureOnly: true },
  [TRUST_ELEMENT.PRIVACY_CUES]:   { location: 'form,footer', fixtureOnly: false },
  [TRUST_ELEMENT.SECURITY_CUES]:  { location: 'form,checkout', fixtureOnly: false },
  [TRUST_ELEMENT.CONTACT_CLARITY]:{ location: 'nav,footer', fixtureOnly: false },
  [TRUST_ELEMENT.LOCAL_TRUST]:    { location: 'hero,footer', fixtureOnly: true },
  [TRUST_ELEMENT.DISCLAIMER]:     { location: 'footer', fixtureOnly: false },
});

export function createTrustDesign(elements = [], vertical = 'default') {
  const validElements = elements.filter(e => TRUST_ELEMENT[e]);
  const specs = validElements.map(e => ({ element: e, ...TRUST_SPECS[e] }));
  const allFixtureOnly = specs.every(s => s.fixtureOnly);
  return Object.freeze({
    elements:           validElements,
    specs,
    noFakeClaims:       true,
    fixtureDataOnly:    allFixtureOnly,
    hasContactClarity:  validElements.includes(TRUST_ELEMENT.CONTACT_CLARITY),
    hasPrivacyCues:     validElements.includes(TRUST_ELEMENT.PRIVACY_CUES),
    vertical,
    isReal:             false,
  });
}

export function buildVerticalTrustDesign(vertical = 'default') {
  const verticalElements = {
    veterinary:  [TRUST_ELEMENT.CREDENTIALS, TRUST_ELEMENT.REVIEWS, TRUST_ELEMENT.LOCAL_TRUST, TRUST_ELEMENT.CONTACT_CLARITY],
    legal:       [TRUST_ELEMENT.CREDENTIALS, TRUST_ELEMENT.CERTIFICATIONS, TRUST_ELEMENT.PRIVACY_CUES, TRUST_ELEMENT.CONTACT_CLARITY],
    beauty:      [TRUST_ELEMENT.PROOF, TRUST_ELEMENT.REVIEWS, TRUST_ELEMENT.CONTACT_CLARITY],
    default:     [TRUST_ELEMENT.CONTACT_CLARITY, TRUST_ELEMENT.PRIVACY_CUES],
  };
  return createTrustDesign(verticalElements[vertical] ?? verticalElements.default, vertical);
}

export const TRUST_DESIGN_SYSTEM_VERSION = '1.0.0';
