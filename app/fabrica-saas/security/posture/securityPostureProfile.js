// Security Posture Profile — ADV-19

export const SECURITY_POSTURE_STATUS = Object.freeze({
  UNKNOWN:  'UNKNOWN',
  BASELINE: 'BASELINE',
  HARDENED: 'HARDENED',
  DEGRADED: 'DEGRADED',
  BLOCKED:  'BLOCKED',
});

export const RISK_LEVEL = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export const DATA_SENSITIVITY = Object.freeze({
  PUBLIC:       'PUBLIC',
  INTERNAL:     'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
  SENSITIVE:    'SENSITIVE',
});

export function createSecurityPostureProfile(config = {}) {
  const {
    clientId = 'unknown',
    businessId = 'unknown',
    environment = 'UNKNOWN',
    riskLevel = RISK_LEVEL.MEDIUM,
    dataSensitivity = DATA_SENSITIVITY.INTERNAL,
    authMode = 'UNKNOWN',
    externalIntegrations = [],
    aiEnabled = false,
    trackingEnabled = false,
    securityControls = [],
    privacyControls = [],
  } = config;

  const blockers = [];
  if (!clientId || clientId === 'unknown') blockers.push('MISSING_CLIENT_ID');
  if (trackingEnabled && !privacyControls.includes('CONSENT_CMP')) {
    blockers.push('TRACKING_WITHOUT_CONSENT_CMP');
  }
  if (aiEnabled && !securityControls.includes('AI_PRIVACY_POLICY')) {
    blockers.push('AI_WITHOUT_PRIVACY_POLICY');
  }

  const status = blockers.length > 0
    ? SECURITY_POSTURE_STATUS.BLOCKED
    : securityControls.length >= 5
      ? SECURITY_POSTURE_STATUS.HARDENED
      : securityControls.length >= 2
        ? SECURITY_POSTURE_STATUS.BASELINE
        : SECURITY_POSTURE_STATUS.UNKNOWN;

  return Object.freeze({
    clientId,
    businessId,
    environment,
    riskLevel,
    dataSensitivity,
    authMode,
    externalIntegrations: Object.freeze([...externalIntegrations]),
    aiEnabled,
    trackingEnabled,
    securityControls: Object.freeze([...securityControls]),
    privacyControls: Object.freeze([...privacyControls]),
    status,
    blockers: Object.freeze([...blockers]),
    isReal: false,
  });
}

export const SECURITY_POSTURE_VERSION = '1.0.0';
