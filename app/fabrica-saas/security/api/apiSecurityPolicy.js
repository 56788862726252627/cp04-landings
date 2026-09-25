// API Security Policy — ADV-19

export function createAPISecurityPolicy(config = {}) {
  const {
    authRequired = true,
    authorizationChecked = true,
    rateLimitEnabled = true,
    inputValidation = true,
    idempotencySupported = false,
    errorPrivacy = true,
    maxRequestSizeKb = 512,
    auditRequired = true,
    clientId = null,
  } = config;

  const violations = [];
  if (!authRequired)           violations.push('AUTH_NOT_REQUIRED');
  if (!authorizationChecked)   violations.push('AUTHORIZATION_NOT_CHECKED');
  if (!rateLimitEnabled)       violations.push('RATE_LIMIT_DISABLED');
  if (!inputValidation)        violations.push('INPUT_VALIDATION_DISABLED');
  if (!errorPrivacy)           violations.push('ERRORS_MAY_LEAK_INTERNALS');
  if (!auditRequired)          violations.push('AUDIT_NOT_CONFIGURED');

  function evaluateRequest(req = {}) {
    const findings = [];
    const { auth, contentLength = 0, method } = req;

    if (authRequired && !auth) findings.push('MISSING_AUTH');
    if (contentLength > maxRequestSizeKb * 1024) findings.push('REQUEST_TOO_LARGE');
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !req.idempotencyKey && idempotencySupported) {
      findings.push('MISSING_IDEMPOTENCY_KEY');
    }

    return Object.freeze({ safe: findings.length === 0, findings: Object.freeze(findings), isReal: false });
  }

  return Object.freeze({
    clientId,
    authRequired,
    authorizationChecked,
    rateLimitEnabled,
    inputValidation,
    idempotencySupported,
    errorPrivacy,
    maxRequestSizeKb,
    auditRequired,
    violations: Object.freeze([...violations]),
    compliant: violations.length === 0,
    evaluateRequest,
    isReal: false,
  });
}

export const API_SECURITY_VERSION = '1.0.0';
