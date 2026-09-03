// Security Quality Gate — ADV-19

export const SECURITY_GATE_BLOCKED_REASON = Object.freeze({
  SECRET_LEAK:                   'SECRET_LEAK',
  CROSS_CLIENT_ACCESS:           'CROSS_CLIENT_ACCESS',
  PRIVILEGE_ESCALATION:          'PRIVILEGE_ESCALATION',
  CRITICAL_INJECTION_BYPASS:     'CRITICAL_INJECTION_BYPASS',
  UNSAFE_TOOL_WRITE:             'UNSAFE_TOOL_WRITE',
  MISSING_AUTH_ON_PROTECTED:     'MISSING_AUTH_ON_PROTECTED',
  RESTRICTED_DATA_LEAK:          'RESTRICTED_DATA_LEAK',
  UNAPPROVED_REAL_EXTERNAL_ACTION:'UNAPPROVED_REAL_EXTERNAL_ACTION',
});

export const GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARNING: 'WARNING',
  BLOCKED: 'BLOCKED',
});

export function evaluateSecurityQualityGate(checks = {}) {
  const blocked = [];
  const warnings = [];

  if (checks.secretLeak)              blocked.push(SECURITY_GATE_BLOCKED_REASON.SECRET_LEAK);
  if (checks.crossClientAccess)       blocked.push(SECURITY_GATE_BLOCKED_REASON.CROSS_CLIENT_ACCESS);
  if (checks.privilegeEscalation)     blocked.push(SECURITY_GATE_BLOCKED_REASON.PRIVILEGE_ESCALATION);
  if (checks.injectionBypass)         blocked.push(SECURITY_GATE_BLOCKED_REASON.CRITICAL_INJECTION_BYPASS);
  if (checks.unsafeToolWrite)         blocked.push(SECURITY_GATE_BLOCKED_REASON.UNSAFE_TOOL_WRITE);
  if (checks.missingAuthOnProtected)  blocked.push(SECURITY_GATE_BLOCKED_REASON.MISSING_AUTH_ON_PROTECTED);
  if (checks.restrictedDataLeak)      blocked.push(SECURITY_GATE_BLOCKED_REASON.RESTRICTED_DATA_LEAK);
  if (checks.unapprovedExternalAction)blocked.push(SECURITY_GATE_BLOCKED_REASON.UNAPPROVED_REAL_EXTERNAL_ACTION);

  if (checks.weakHeaders)      warnings.push('WEAK_SECURITY_HEADERS');
  if (checks.noRateLimit)      warnings.push('RATE_LIMITING_NOT_CONFIGURED');
  if (checks.noAuditLog)       warnings.push('AUDIT_LOG_ABSENT');

  const status = blocked.length > 0
    ? GATE_STATUS.BLOCKED
    : warnings.length > 0
      ? GATE_STATUS.WARNING
      : GATE_STATUS.PASS;

  return Object.freeze({
    status,
    blocked: Object.freeze([...blocked]),
    warnings: Object.freeze([...warnings]),
    pass: status === GATE_STATUS.PASS,
    isReal: false,
  });
}

export const SECURITY_GATE_VERSION = '1.0.0';
