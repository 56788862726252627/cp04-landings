// Tenant Security Context — ADV-19

export const ENVIRONMENT = Object.freeze({
  DEVELOPMENT: 'DEVELOPMENT',
  STAGING:     'STAGING',
  PRODUCTION:  'PRODUCTION',
  UNKNOWN:     'UNKNOWN',
});

export function createTenantSecurityContext(config = {}) {
  const {
    clientId = null,
    businessId = null,
    actor = null,
    role = null,
    scope = [],
    environment = ENVIRONMENT.UNKNOWN,
  } = config;

  const warnings = [];
  if (!clientId)    warnings.push('MISSING_CLIENT_ID');
  if (!businessId)  warnings.push('MISSING_BUSINESS_ID');
  if (!actor)       warnings.push('MISSING_ACTOR');
  if (!role)        warnings.push('MISSING_ROLE');
  if (scope.length === 0) warnings.push('EMPTY_SCOPE');

  const valid = warnings.length === 0;

  return Object.freeze({
    clientId,
    businessId,
    actor,
    role,
    scope: Object.freeze([...scope]),
    environment,
    valid,
    warnings: Object.freeze([...warnings]),
    isReal: false,
  });
}

export function validateContext(ctx) {
  if (!ctx.valid) {
    return Object.freeze({ allowed: false, reason: 'INVALID_TENANT_CONTEXT', warnings: [...ctx.warnings], isReal: false });
  }
  return Object.freeze({ allowed: true, reason: 'OK', isReal: false });
}

export const TENANT_CONTEXT_VERSION = '1.0.0';
