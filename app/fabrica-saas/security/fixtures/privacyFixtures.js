// Privacy Fixtures — ADV-19

export const PRIVACY_FIXTURES = Object.freeze({
  dataMinimizationCompliant: Object.freeze({
    requiredFields: ['email', 'name'],
    optionalFields: ['phone'],
    contextFields: [],
  }),

  retentionStandard: Object.freeze({
    preset: 'STANDARD',
    dataType: 'CRM_CONTACT',
    legalHold: false,
  }),

  dsarAccessRequest: Object.freeze({
    clientId: 'client-fixture-a',
    subjectReference: 'subject-ref-001',
    rightType: 'ACCESS',
    identityVerified: true,
    dataScopes: ['CRM', 'LEADS', 'CONSENT'],
  }),

  consentGranted: Object.freeze({
    subjectRef: 'subject-ref-001',
    purpose: 'ANALYTICS',
    status: 'GRANTED',
    source: 'PREFERENCE_CENTER',
    policyVersion: '1.2.0',
    evidence: 'click-2026-09-03T06:00:00Z',
    clientId: 'client-fixture-a',
  }),

  consentWithdrawn: Object.freeze({
    subjectRef: 'subject-ref-001',
    purpose: 'ANALYTICS',
    status: 'WITHDRAWN',
    source: 'PREFERENCE_CENTER',
    clientId: 'client-fixture-a',
  }),

  processorApproved: Object.freeze({
    provider: 'openai',
    purpose: 'AI_GENERATION',
    dataTypes: ['INTERNAL'],
    region: 'US',
    contractStatus: 'SIGNED',
    dpaStatus: 'SIGNED',
    risk: 'MEDIUM',
    clientId: 'client-fixture-a',
  }),

  preferenceChange: Object.freeze({
    subjectRef: 'subject-ref-001',
    changed: { ANALYTICS: false, MARKETING: false, PREFERENCES: true },
    clientId: 'client-fixture-a',
  }),

  trackerClassified: Object.freeze({
    id: 'ga4-fixture', provider: 'Google', purpose: 'ANALYTICS',
    category: 'ANALYTICS', essential: false, requiresConsent: true,
  }),
});
