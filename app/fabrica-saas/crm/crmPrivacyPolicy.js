// CRM Privacy Policy — ADV-09 CRM

export const DATA_CATEGORY = Object.freeze({
  BUSINESS_PUBLIC:   'BUSINESS_PUBLIC',
  CONTACT_BUSINESS:  'CONTACT_BUSINESS',
  DEAL_COMMERCIAL:   'DEAL_COMMERCIAL',
  ACTIVITY_LOG:      'ACTIVITY_LOG',
  INTERNAL_NOTES:    'INTERNAL_NOTES',
});

export const LEGAL_BASIS = Object.freeze({
  LEGITIMATE_INTEREST: 'LEGITIMATE_INTEREST',
  CONTRACT:            'CONTRACT',
  CONSENT:             'CONSENT',
});

export function createCRMPrivacyPolicy(fields = {}) {
  return Object.freeze({
    version:          fields.version ?? '1.0.0',
    effectiveDate:    fields.effectiveDate ?? '2026-01-01',
    dataCategories:   Object.freeze([
      { category: DATA_CATEGORY.BUSINESS_PUBLIC,  legalBasis: LEGAL_BASIS.LEGITIMATE_INTEREST, retentionDays: 1095 },
      { category: DATA_CATEGORY.CONTACT_BUSINESS, legalBasis: LEGAL_BASIS.LEGITIMATE_INTEREST, retentionDays: 730 },
      { category: DATA_CATEGORY.DEAL_COMMERCIAL,  legalBasis: LEGAL_BASIS.CONTRACT,            retentionDays: 2555 },
      { category: DATA_CATEGORY.ACTIVITY_LOG,     legalBasis: LEGAL_BASIS.LEGITIMATE_INTEREST, retentionDays: 365 },
      { category: DATA_CATEGORY.INTERNAL_NOTES,   legalBasis: LEGAL_BASIS.LEGITIMATE_INTEREST, retentionDays: 365 },
    ]),
    noSensitivePersonalData: true,
    noSpecialCategory:       true,
    piiMinimization:         true,
    purposeLimitation:       'B2B commercial prospecting and client management only',
    dataSubjectRights:       Object.freeze(['access', 'rectification', 'erasure', 'portability']),
    internationalTransfers:  false,
    note:                    'This policy applies to B2B CRM data only. No consumer personal data is processed.',
    isReal: false,
  });
}

export const CRM_PRIVACY_POLICY_VERSION = '1.0.0';
