// Lead Privacy Policy — ADV-08

export const PRIVACY_PRINCIPLE = Object.freeze({
  PUBLIC_BUSINESS_ONLY:      'PUBLIC_BUSINESS_ONLY',
  DATA_MINIMIZATION:         'DATA_MINIMIZATION',
  RETENTION_POLICY:          'RETENTION_POLICY',
  SOURCE_TRACKING:           'SOURCE_TRACKING',
  DELETION_SUPPORT:          'DELETION_SUPPORT',
  PURPOSE_LIMITATION:        'PURPOSE_LIMITATION',
  NO_SENSITIVE_DATA:         'NO_SENSITIVE_DATA',
  NO_PERSONAL_PROFILING:     'NO_PERSONAL_PROFILING',
});

const PROHIBITED_FIELDS = Object.freeze([
  'nationalId', 'taxId', 'passportNumber', 'birthDate', 'gender',
  'healthData', 'financialData', 'creditScore', 'privateEmail',
  'privatePhone', 'homeAddress', 'personalSocialMedia',
]);

export function createLeadPrivacyPolicy(overrides = {}) {
  return Object.freeze({
    principles:      Object.values(PRIVACY_PRINCIPLE),
    retentionDays:   overrides.retentionDays ?? 180,
    sourceRequired:  true,
    deletionSupported: true,
    prohibitedFields: PROHIBITED_FIELDS,
    disclaimer: 'This policy provides a GDPR-friendly foundation. Full legal compliance requires human legal review.',
    isReal: false,
  });
}

export function auditLeadPrivacy(lead = {}) {
  const violations = [];
  for (const field of PROHIBITED_FIELDS) {
    if (lead[field] !== undefined && lead[field] !== null && lead[field] !== '') {
      violations.push(`Prohibited field present: ${field}`);
    }
  }
  if (!lead.source) violations.push('Missing source attribution');
  if (!lead.discoveredAt) violations.push('Missing discoveredAt timestamp');

  return Object.freeze({
    compliant:  violations.length === 0,
    violations: Object.freeze(violations),
    note:       'Audit based on structural checks only — not a legal certification.',
    isReal: false,
  });
}

export const LEAD_PRIVACY_POLICY_VERSION = '1.0.0';
