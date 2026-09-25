// Personal Data Breach Assessment — ADV-19

export const BREACH_RISK = Object.freeze({
  UNLIKELY:    'UNLIKELY',
  POSSIBLE:    'POSSIBLE',
  HIGH:        'HIGH',
  CRITICAL:    'CRITICAL',
});

export const BREACH_OUTPUT = Object.freeze({
  NO_REVIEW_NEEDED:       'NO_REVIEW_NEEDED',
  INTERNAL_REVIEW:        'INTERNAL_REVIEW',
  LEGAL_REVIEW_REQUIRED:  'LEGAL_REVIEW_REQUIRED',
});

export function createPersonalDataBreachAssessment(config = {}) {
  const {
    personalDataInvolved = false,
    sensitivity = 'MEDIUM',
    scope = 'UNKNOWN',
    exposure = 'INTERNAL',
    affectedCount = 0,
    clientId = null,
  } = config;

  if (!personalDataInvolved) {
    return Object.freeze({
      clientId,
      personalDataInvolved,
      likelyRisk: BREACH_RISK.UNLIKELY,
      notificationReviewRequired: false,
      output: BREACH_OUTPUT.NO_REVIEW_NEEDED,
      legalCertification: false,
      isReal: false,
    });
  }

  let likelyRisk = BREACH_RISK.POSSIBLE;
  if (sensitivity === 'CRITICAL' || exposure === 'PUBLIC' || affectedCount > 1000) {
    likelyRisk = BREACH_RISK.CRITICAL;
  } else if (sensitivity === 'HIGH' || exposure === 'EXTERNAL') {
    likelyRisk = BREACH_RISK.HIGH;
  }

  const notificationReviewRequired = [BREACH_RISK.HIGH, BREACH_RISK.CRITICAL].includes(likelyRisk);
  const output = notificationReviewRequired
    ? BREACH_OUTPUT.LEGAL_REVIEW_REQUIRED
    : BREACH_OUTPUT.INTERNAL_REVIEW;

  return Object.freeze({
    clientId,
    personalDataInvolved,
    sensitivity,
    scope,
    exposure,
    affectedCount,
    likelyRisk,
    notificationReviewRequired,
    output,
    legalCertification: false,
    isReal: false,
  });
}

export const BREACH_ASSESSMENT_VERSION = '1.0.0';
