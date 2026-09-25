// Authorization Policy Evaluator — ADV-19

export const AUTH_DECISION = Object.freeze({
  ALLOW:  'ALLOW',
  DENY:   'DENY',
  AUDIT:  'AUDIT',
});

export function createAuthorizationPolicyEvaluator(config = {}) {
  const {
    allowedRoles = [],
    requiredPermissions = [],
    denyByDefault = true,
    clientIsolationEnforced = true,
    clientId = null,
  } = config;

  function evaluate(request = {}) {
    const { role = null, permissions = [], requestClientId = null } = request;

    // Client isolation: mandatory
    if (clientIsolationEnforced && requestClientId && requestClientId !== clientId) {
      return Object.freeze({
        decision: AUTH_DECISION.DENY,
        reason: 'CLIENT_ISOLATION_VIOLATION',
        isReal: false,
      });
    }

    // Role check
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      return Object.freeze({
        decision: AUTH_DECISION.DENY,
        reason: 'ROLE_NOT_ALLOWED',
        isReal: false,
      });
    }

    // Permission check
    const missing = requiredPermissions.filter(p => !permissions.includes(p));
    if (missing.length > 0) {
      return Object.freeze({
        decision: AUTH_DECISION.DENY,
        reason: 'MISSING_PERMISSIONS',
        missing: Object.freeze(missing),
        isReal: false,
      });
    }

    // Deny by default if no explicit allow configured
    if (denyByDefault && allowedRoles.length === 0 && requiredPermissions.length === 0) {
      return Object.freeze({
        decision: AUTH_DECISION.DENY,
        reason: 'DENY_BY_DEFAULT_NO_POLICY_DEFINED',
        isReal: false,
      });
    }

    return Object.freeze({ decision: AUTH_DECISION.ALLOW, reason: 'OK', isReal: false });
  }

  return Object.freeze({
    clientId,
    allowedRoles: Object.freeze([...allowedRoles]),
    requiredPermissions: Object.freeze([...requiredPermissions]),
    denyByDefault,
    clientIsolationEnforced,
    evaluate,
    isReal: false,
  });
}

export const AUTHORIZATION_POLICY_VERSION = '1.0.0';
