// Legal Basis Profile — ADV-19

export const LEGAL_BASIS = Object.freeze({
  CONSENT:              'CONSENT',
  CONTRACT:             'CONTRACT',
  LEGAL_OBLIGATION:     'LEGAL_OBLIGATION',
  VITAL_INTEREST:       'VITAL_INTEREST',
  PUBLIC_TASK:          'PUBLIC_TASK',
  LEGITIMATE_INTEREST:  'LEGITIMATE_INTEREST',
  UNKNOWN:              'UNKNOWN',
});

const REQUIRES_HUMAN_REVIEW = new Set([LEGAL_BASIS.UNKNOWN, LEGAL_BASIS.VITAL_INTEREST]);

export function createLegalBasisProfile(config = {}) {
  const {
    dataType = 'UNKNOWN',
    purpose = '',
    proposedBasis = LEGAL_BASIS.UNKNOWN,
    clientId = null,
    legalReviewCompleted = false,
  } = config;

  const requiresReview = REQUIRES_HUMAN_REVIEW.has(proposedBasis) || !legalReviewCompleted;

  const warnings = [];
  if (proposedBasis === LEGAL_BASIS.UNKNOWN) {
    warnings.push('LEGAL_BASIS_UNKNOWN_REQUIRES_LEGAL_COUNSEL');
  }
  if (!legalReviewCompleted) {
    warnings.push('LEGAL_REVIEW_NOT_CONFIRMED');
  }
  if (proposedBasis === LEGAL_BASIS.LEGITIMATE_INTEREST) {
    warnings.push('LEGITIMATE_INTEREST_REQUIRES_BALANCING_TEST');
  }

  return Object.freeze({
    clientId,
    dataType,
    purpose,
    proposedBasis,
    legalReviewCompleted,
    requiresReview,
    warnings: Object.freeze([...warnings]),
    legalCertification: false,
    isReal: false,
  });
}

export const LEGAL_BASIS_VERSION = '1.0.0';
