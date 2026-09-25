// Social Content Privacy Policy — GDPR, client isolation, data protection

export const PRIVACY_RISK = Object.freeze({
  REAL_PERSON_WITHOUT_CONSENT: 'REAL_PERSON_WITHOUT_CONSENT',
  MINOR_IMAGE_WITHOUT_CONSENT: 'MINOR_IMAGE_WITHOUT_CONSENT',
  PERSONAL_DATA_IN_COPY:       'PERSONAL_DATA_IN_COPY',
  CLIENT_DATA_CROSS_LEAK:      'CLIENT_DATA_CROSS_LEAK',
  GDPR_NON_COMPLIANT:          'GDPR_NON_COMPLIANT',
});

export function validateSocialContentPrivacy(post = {}, context = {}) {
  if (!post.businessId) throw new Error('validateSocialContentPrivacy requires businessId');
  if (!post.clientId)   throw new Error('validateSocialContentPrivacy requires clientId');

  const risks = [];

  if (context.requestingClientId && context.requestingClientId !== post.clientId) {
    risks.push({ risk: PRIVACY_RISK.CLIENT_DATA_CROSS_LEAK, detail: 'Content from a different client accessed' });
  }

  if (post.hasRealPersonImage && !post.personConsentRef) {
    risks.push({ risk: PRIVACY_RISK.REAL_PERSON_WITHOUT_CONSENT, detail: 'Real person image without consent reference' });
  }

  if (post.hasMinorImage && !post.minorConsentRef) {
    risks.push({ risk: PRIVACY_RISK.MINOR_IMAGE_WITHOUT_CONSENT, detail: 'Minor image without consent reference' });
  }

  const personalDataPattern = /\b\d{8}[A-Z]\b|\b[0-9]{9}\b/;
  if (personalDataPattern.test(post.fullText ?? '')) {
    risks.push({ risk: PRIVACY_RISK.PERSONAL_DATA_IN_COPY, detail: 'Possible personal ID number in copy' });
  }

  return Object.freeze({
    passed:          risks.length === 0,
    risks:           Object.freeze(risks),
    gdprCompliant:   !risks.some(r => r.risk === PRIVACY_RISK.GDPR_NON_COMPLIANT),
    clientIsolation: !risks.some(r => r.risk === PRIVACY_RISK.CLIENT_DATA_CROSS_LEAK),
    isReal:          false,
  });
}
