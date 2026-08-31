// API Security Gate — PASO G
// Conceptual security check model for API endpoints and Workers.

export const API_SECURITY_STATUS = Object.freeze({
  PASS:        'PASS',
  WARNING:     'WARNING',
  FAIL:        'FAIL',
  NOT_AUDITED: 'NOT_AUDITED',
});

const API_CHECKS = [
  { id: 'API-01', name: 'Authentication required',         critical: true,  description: 'All endpoints require auth token or session' },
  { id: 'API-02', name: 'Authorization enforced',          critical: true,  description: 'Role/permission checks on protected resources' },
  { id: 'API-03', name: 'Rate limiting active',            critical: false, description: 'Rate limiting prevents abuse on public endpoints' },
  { id: 'API-04', name: 'Input validation present',        critical: true,  description: 'All inputs validated before processing' },
  { id: 'API-05', name: 'Output filtering applied',        critical: false, description: 'Responses filtered to remove sensitive fields' },
  { id: 'API-06', name: 'CORS policy correct',             critical: true,  description: 'CORS allows only expected origins' },
  { id: 'API-07', name: 'HTTP method restrictions',        critical: false, description: 'Only required methods allowed per endpoint' },
  { id: 'API-08', name: 'Error messages sanitized',        critical: true,  description: 'Errors do not expose internal details' },
  { id: 'API-09', name: 'Idempotency on mutations',        critical: false, description: 'Write operations are idempotent where required' },
  { id: 'API-10', name: 'Webhook signature verification',  critical: true,  description: 'Incoming webhooks verified with HMAC/secret' },
  { id: 'API-11', name: 'Secrets not in response body',    critical: true,  description: 'API keys/tokens never returned to client' },
  { id: 'API-12', name: 'Least privilege principle',       critical: false, description: 'API keys have minimum required permissions' },
];

/**
 * Audit API security from a checks map.
 * @param {object} checks — { 'API-01': true|false|'N/A' }
 */
export function auditApiSecurity(checks = {}) {
  const results = API_CHECKS.map(check => {
    const value = checks[check.id];
    const na = value === 'N/A' || value === 'NOT_APPLICABLE';
    const passed = value === true || na;
    return { ...check, value, passed, notApplicable: na };
  });

  const criticalFailed = results.filter(r => r.critical && !r.passed && !r.notApplicable);
  const warnings       = results.filter(r => !r.critical && !r.passed && !r.notApplicable);
  const totalPassed    = results.filter(r => r.passed).length;

  const status = criticalFailed.length > 0 ? API_SECURITY_STATUS.FAIL
    : warnings.length > 0                  ? API_SECURITY_STATUS.WARNING
    : API_SECURITY_STATUS.PASS;

  const score = Math.round((totalPassed / API_CHECKS.length) * 100);

  return {
    valid:          true,
    status,
    score,
    totalChecks:    API_CHECKS.length,
    passed:         totalPassed,
    criticalFailed: criticalFailed.length,
    criticalFailedIds: criticalFailed.map(r => r.id),
    warningCount:   warnings.length,
    results,
    disclaimer:     'API security audit is a conceptual gate. Requires manual validation for real endpoints.',
  };
}

export const API_SECURITY_VERSION = '1.0.0';
