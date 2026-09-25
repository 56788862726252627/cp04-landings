// Session Security Policy — ADV-19

export function createSessionSecurityPolicy(config = {}) {
  const {
    expirationMinutes = 60,
    idleTimeoutMinutes = 30,
    secureCookies = true,
    sameSite = 'Strict',
    rotationEnabled = true,
    revocationEnabled = true,
    concurrentSessionPolicy = 'ALLOW_SINGLE',
    clientId = null,
  } = config;

  const violations = [];
  if (!secureCookies)    violations.push('COOKIES_NOT_SECURE');
  if (sameSite === 'None' && !secureCookies) violations.push('SAMESITE_NONE_WITHOUT_SECURE');
  if (!rotationEnabled)  violations.push('SESSION_ROTATION_DISABLED');
  if (expirationMinutes > 1440) violations.push('SESSION_EXPIRY_EXCEEDS_24H');

  return Object.freeze({
    clientId,
    expirationMinutes,
    idleTimeoutMinutes,
    secureCookies,
    sameSite,
    rotationEnabled,
    revocationEnabled,
    concurrentSessionPolicy,
    violations: Object.freeze([...violations]),
    compliant: violations.length === 0,
    realSessionNotModified: true,
    isReal: false,
  });
}

export const SESSION_SECURITY_VERSION = '1.0.0';
