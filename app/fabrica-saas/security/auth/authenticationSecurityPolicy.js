// Authentication Security Policy — ADV-19

export const AUTH_CONTROL = Object.freeze({
  SECURE_PASSWORD_POLICY:        'SECURE_PASSWORD_POLICY',
  RATE_LIMITING:                 'RATE_LIMITING',
  CREDENTIAL_STUFFING_AWARENESS: 'CREDENTIAL_STUFFING_AWARENESS',
  MFA_CAPABILITY:                'MFA_CAPABILITY',
  RECOVERY_SECURITY:             'RECOVERY_SECURITY',
  ERROR_MESSAGE_PRIVACY:         'ERROR_MESSAGE_PRIVACY',
  ACCOUNT_ENUMERATION_PROTECTION:'ACCOUNT_ENUMERATION_PROTECTION',
});

export function createAuthenticationSecurityPolicy(config = {}) {
  const {
    enabledControls = [],
    mfaAvailable = false,
    genericErrorMessages = true,
    rateLimitEnabled = false,
    clientId = null,
  } = config;

  const violations = [];
  if (!genericErrorMessages) violations.push('ERROR_MESSAGES_EXPOSE_USER_EXISTENCE');
  if (!rateLimitEnabled)     violations.push('NO_RATE_LIMITING_CONFIGURED');

  const controls = [...enabledControls];
  if (mfaAvailable && !controls.includes(AUTH_CONTROL.MFA_CAPABILITY)) {
    controls.push(AUTH_CONTROL.MFA_CAPABILITY);
  }
  if (genericErrorMessages && !controls.includes(AUTH_CONTROL.ERROR_MESSAGE_PRIVACY)) {
    controls.push(AUTH_CONTROL.ERROR_MESSAGE_PRIVACY);
  }
  if (rateLimitEnabled && !controls.includes(AUTH_CONTROL.RATE_LIMITING)) {
    controls.push(AUTH_CONTROL.RATE_LIMITING);
  }

  return Object.freeze({
    clientId,
    controls: Object.freeze([...new Set(controls)]),
    mfaAvailable,
    genericErrorMessages,
    rateLimitEnabled,
    violations: Object.freeze([...violations]),
    compliant: violations.length === 0,
    realAuthNotModified: true,
    isReal: false,
  });
}

export const AUTH_SECURITY_VERSION = '1.0.0';
