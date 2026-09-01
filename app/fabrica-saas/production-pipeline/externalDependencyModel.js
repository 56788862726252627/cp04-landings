// External Dependency Model — ADV-04
// Tracks third-party providers and their availability for a project.

export const EXTERNAL_PROVIDER = Object.freeze({
  CLOUDFLARE: 'CLOUDFLARE',
  SUPABASE:   'SUPABASE',
  MAKE:       'MAKE',
  STRIPE:     'STRIPE',
  META:       'META',
  TWILIO:     'TWILIO',
  EMAIL:      'EMAIL',
  CUSTOM_API: 'CUSTOM_API',
});

export const DEPENDENCY_STATUS = Object.freeze({
  AVAILABLE:        'AVAILABLE',
  AUTH_REQUIRED:    'AUTH_REQUIRED',
  CONFIG_REQUIRED:  'CONFIG_REQUIRED',
  BILLING_REQUIRED: 'BILLING_REQUIRED',
  UNAVAILABLE:      'UNAVAILABLE',
  DEFERRED:         'DEFERRED',
});

export function createExternalDependency(params = {}) {
  if (!params.provider) return { valid: false, error: 'provider required' };
  if (!params.purpose)  return { valid: false, error: 'purpose required' };

  const provider = params.provider;
  if (!Object.values(EXTERNAL_PROVIDER).includes(provider)) {
    return { valid: false, error: `Unknown provider: ${provider}` };
  }

  return Object.freeze({
    valid:            true,
    id:               `DEP-${provider}-${Date.now()}`,
    provider,
    purpose:          params.purpose,
    status:           params.status ?? DEPENDENCY_STATUS.AUTH_REQUIRED,
    blocking:         params.blocking ?? true,
    manualActionType: params.manualActionType ?? null,
    configRequired:   params.configRequired ?? [],
    notes:            params.notes ?? null,
    isReal:           false,
  });
}

export function classifyDependencies(dependencies = []) {
  const available   = dependencies.filter(d => d.status === DEPENDENCY_STATUS.AVAILABLE);
  const blocking    = dependencies.filter(d => d.blocking && d.status !== DEPENDENCY_STATUS.AVAILABLE && d.status !== DEPENDENCY_STATUS.DEFERRED);
  const deferred    = dependencies.filter(d => d.status === DEPENDENCY_STATUS.DEFERRED);
  const needsAuth   = dependencies.filter(d => d.status === DEPENDENCY_STATUS.AUTH_REQUIRED);
  const needsBilling= dependencies.filter(d => d.status === DEPENDENCY_STATUS.BILLING_REQUIRED);

  return Object.freeze({
    available:     available.map(d => d.provider),
    blocking:      blocking.map(d => d.provider),
    deferred:      deferred.map(d => d.provider),
    needsAuth:     needsAuth.map(d => d.provider),
    needsBilling:  needsBilling.map(d => d.provider),
    isFullyReady:  blocking.length === 0,
    blockerCount:  blocking.length,
  });
}

export const EXTERNAL_DEPENDENCY_MODEL_VERSION = '1.0.0';
