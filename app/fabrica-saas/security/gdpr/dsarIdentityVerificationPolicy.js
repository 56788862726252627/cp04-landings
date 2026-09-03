// DSAR Identity Verification Policy — ADV-19

export const IDENTITY_VERIFICATION_METHOD = Object.freeze({
  AUTHENTICATED_SESSION: 'AUTHENTICATED_SESSION',
  EMAIL_CONFIRMATION:    'EMAIL_CONFIRMATION',
  MANUAL_REVIEW:         'MANUAL_REVIEW',
  RISK_ESCALATION:       'RISK_ESCALATION',
});

export const VERIFICATION_STATUS = Object.freeze({
  VERIFIED:         'VERIFIED',
  PENDING:          'PENDING',
  FAILED:           'FAILED',
  ESCALATED:        'ESCALATED',
  NOT_VERIFIED:     'NOT_VERIFIED',
});

export function createDSARIdentityVerificationPolicy(config = {}) {
  const {
    subjectEmail = null,
    sessionAuthenticated = false,
    emailConfirmed = false,
    manualApproved = false,
    riskLevel = 'MEDIUM',
    clientId = null,
  } = config;

  const warnings = [];

  // Core rule: never deliver data based solely on knowing an email
  if (!sessionAuthenticated && !emailConfirmed && !manualApproved) {
    warnings.push('IDENTITY_NOT_ESTABLISHED');
  }

  if (subjectEmail && !sessionAuthenticated) {
    warnings.push('EMAIL_ALONE_INSUFFICIENT_FOR_VERIFICATION');
  }

  const method = sessionAuthenticated
    ? IDENTITY_VERIFICATION_METHOD.AUTHENTICATED_SESSION
    : emailConfirmed
      ? IDENTITY_VERIFICATION_METHOD.EMAIL_CONFIRMATION
      : manualApproved
        ? IDENTITY_VERIFICATION_METHOD.MANUAL_REVIEW
        : IDENTITY_VERIFICATION_METHOD.RISK_ESCALATION;

  const status = (sessionAuthenticated || (emailConfirmed && riskLevel !== 'HIGH') || manualApproved)
    ? VERIFICATION_STATUS.VERIFIED
    : warnings.length > 0
      ? VERIFICATION_STATUS.NOT_VERIFIED
      : VERIFICATION_STATUS.PENDING;

  return Object.freeze({
    clientId,
    subjectEmail,
    method,
    status,
    verified: status === VERIFICATION_STATUS.VERIFIED,
    warnings: Object.freeze([...warnings]),
    dataDeliveryAllowed: status === VERIFICATION_STATUS.VERIFIED,
    isReal: false,
  });
}

export const DSAR_IDENTITY_VERSION = '1.0.0';
