// Partial Restore Plan — ADV-18

export const PARTIAL_RESTORE_SCOPE = Object.freeze({
  CONFIG:          'CONFIG',
  BUSINESS_TRUTH:  'BUSINESS_TRUTH',
  CRM:             'CRM',
  LEADS:           'LEADS',
  MEDIA_METADATA:  'MEDIA_METADATA',
  SOCIAL_METADATA: 'SOCIAL_METADATA',
  REGISTRY:        'REGISTRY',
});

export function createPartialRestorePlan(config = {}) {
  const {
    restorePoint     = null,
    selectedScopes   = [],
    targetEnvironment = 'LOCAL',
    preconditions    = [],
    approvalRequired = true,
    clientId         = null,
    dryRunOnly       = true,
  } = config;

  const validScopes = Object.values(PARTIAL_RESTORE_SCOPE);
  const resolvedScopes = selectedScopes.filter(s => validScopes.includes(s));

  return Object.freeze({
    restorePoint:     restorePoint?.id ?? restorePoint,
    selectedScopes:   Object.freeze(resolvedScopes),
    targetEnvironment,
    preconditions:    Object.freeze([...preconditions]),
    approvalRequired,
    clientId,
    dryRunOnly,
    mode:             dryRunOnly ? 'DRY_RUN' : 'PARTIAL',
    scopeCount:       resolvedScopes.length,
    isReal:           false,
  });
}

export const PARTIAL_RESTORE_PLAN_VERSION = '1.0.0';
