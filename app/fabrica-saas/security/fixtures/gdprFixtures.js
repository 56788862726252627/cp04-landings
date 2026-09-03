// GDPR Fixtures — ADV-19

export const GDPR_FIXTURES = Object.freeze({
  healthyGDPRScore: Object.freeze({
    dataMapping: 90, rightsFoundation: 90, retention: 90,
    consent: 95, audit: 90, security: 95, privacy: 90,
    processors: 85, breachFoundation: 90, deletionFoundation: 85,
  }),

  healthyGDPRGate: Object.freeze({
    noDataMapping: false, noRightsFoundation: false, noAuditTrail: false,
    legalBasisUnknown: false, noConsentMechanism: false, noDeletionPlan: false,
    processorDPAMissing: false, breachAssessmentMissing: false,
  }),

  accessRight: Object.freeze({
    rightType: 'ACCESS',
    context: { legalBasis: 'CONTRACT', legalHold: false, technicallyPossible: true },
  }),

  erasureRight: Object.freeze({
    rightType: 'ERASURE',
    context: { legalBasis: 'CONSENT', legalHold: false, technicallyPossible: true },
  }),

  erasureRightLegalHold: Object.freeze({
    rightType: 'ERASURE',
    context: { legalBasis: 'CONTRACT', legalHold: true, technicallyPossible: true },
  }),

  legalBasisConsent: Object.freeze({
    dataType: 'EMAIL_MARKETING',
    purpose: 'SEND_PROMOTIONAL_EMAILS',
    proposedBasis: 'CONSENT',
    legalReviewCompleted: true,
    clientId: 'client-fixture-a',
  }),

  dataMap: Object.freeze({
    clientId: 'client-fixture-a',
    includedSources: ['CRM', 'LEADS', 'AGENT_CONVERSATIONS', 'CONSENT'],
  }),
});
