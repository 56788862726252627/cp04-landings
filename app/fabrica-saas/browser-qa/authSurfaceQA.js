// Auth Surface QA — ADV-06
// Validates auth-related UI surfaces without using real OAuth or credentials.

export const AUTH_SURFACE_TYPE = Object.freeze({
  LOGIN_FORM:       'LOGIN_FORM',
  SIGNUP_FORM:      'SIGNUP_FORM',
  LOGOUT_BUTTON:    'LOGOUT_BUTTON',
  AUTH_GATE:        'AUTH_GATE',
  FORGOT_PASSWORD:  'FORGOT_PASSWORD',
  OAUTH_BUTTON:     'OAUTH_BUTTON',
  USER_MENU:        'USER_MENU',
  AUTH_ERROR_MSG:   'AUTH_ERROR_MSG',
});

export const AUTH_QA_STATUS = Object.freeze({
  PASS: 'PASS',
  WARN: 'WARN',
  FAIL: 'FAIL',
});

// GUARDRAIL: No real OAuth, no real credentials, no real sessions
const GUARDRAILS = Object.freeze({
  NO_REAL_OAUTH:        true,
  NO_REAL_CREDENTIALS:  true,
  NO_REAL_SESSIONS:     true,
  FIXTURE_MODE_ONLY:    true,
});

export function createAuthSurfaceDefinition(params = {}) {
  const { appId, surfaces = [], gatedRoutes = [] } = params;
  if (!appId) return { valid: false, error: 'appId required' };

  return Object.freeze({
    valid:        true,
    appId,
    surfaces,
    gatedRoutes,
    guardrails:   GUARDRAILS,
    usesRealAuth: false,
    isReal:       false,
  });
}

export function createAuthSurface(type, selector, options = {}) {
  if (!AUTH_SURFACE_TYPE[type]) return { valid: false, error: `unknown type: ${type}` };
  return Object.freeze({
    valid:    true,
    type,
    selector,
    required: options.required ?? true,
    isReal:   false,
  });
}

export function evaluateAuthSurfaces(definition = {}, snapshot = {}) {
  if (!definition.valid) return { valid: false, error: 'invalid definition' };

  const results = definition.surfaces.map(s => {
    const present = snapshot[s.selector] ?? false;
    return {
      type:     s.type,
      selector: s.selector,
      present,
      required: s.required,
      match:    s.required ? present : true,
    };
  });

  const failed   = results.filter(r => !r.match);
  const status   = failed.length > 0 ? AUTH_QA_STATUS.FAIL : AUTH_QA_STATUS.PASS;

  return Object.freeze({
    valid:       true,
    status,
    guardrails:  GUARDRAILS,
    totalChecks: results.length,
    passed:      results.filter(r => r.match).length,
    failed:      failed.length,
    results,
    isReal:      false,
  });
}

export function checkGatedRouteRedirect(route = '', snapshot = {}) {
  const redirected    = snapshot.redirectedTo ?? null;
  const showsAuthGate = snapshot.authGateVisible ?? false;

  const blocked = !!redirected || showsAuthGate;
  return Object.freeze({
    valid:          true,
    route,
    blocked,
    redirectedTo:   redirected,
    showsAuthGate,
    guardrails:     GUARDRAILS,
    isReal:         false,
  });
}

export const AUTH_SURFACE_QA_VERSION = '1.0.0';
