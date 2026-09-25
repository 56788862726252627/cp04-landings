// CMP Fixtures — ADV-19

export const CMP_FIXTURES = Object.freeze({
  healthyCMPProfile: Object.freeze({
    categories: ['STRICTLY_NECESSARY', 'PREFERENCES', 'ANALYTICS', 'MARKETING'],
    vendors: [],
    purposes: ['ANALYTICS_AGGREGATE', 'PERSONALIZATION'],
    consentState: 'PARTIAL',
    policyVersion: '2.0.0',
    regionProfile: 'EU_EEA',
    preferenceCenter: true,
  }),

  compliantBanner: Object.freeze({
    actions: ['ACCEPT', 'REJECT', 'CONFIGURE'],
    preselectedCategories: [],
    acceptAndRejectEqualProminence: true,
  }),

  compliantWithdrawal: Object.freeze({
    withdrawalAccessible: true,
    purposeSpecific: true,
    auditable: true,
    asEasyAsGrant: true,
  }),

  healthyCMPScore: Object.freeze({
    categories: 100,
    trackerClassification: 100,
    defaultState: 100,
    withdrawal: 100,
    versioning: 100,
    preferenceCenter: 100,
    unknownTrackerBlocking: 100,
  }),

  healthyCMPGate: Object.freeze({
    nonEssentialDefaultOn: false,
    unknownTrackerActive: false,
    withdrawUnavailable: false,
    forcedAccept: false,
    marketingWithoutConsent: false,
  }),
});
