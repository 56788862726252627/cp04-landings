// DeployTarget Model — PASO G
// Declarative deployment target config. No real deploys.

export const PROVIDERS = Object.freeze({
  CLOUDFLARE_PAGES:   'CLOUDFLARE_PAGES',
  CLOUDFLARE_WORKERS: 'CLOUDFLARE_WORKERS',
  STATIC_HOST:        'STATIC_HOST',
  CUSTOM:             'CUSTOM',
});

export const DOMAIN_TYPES = Object.freeze({
  PAGES_DEFAULT: 'PAGES_DEFAULT',   // *.pages.dev
  CUSTOM:        'CUSTOM',          // client-owned domain
  SUBDOMAIN:     'SUBDOMAIN',       // subdomain of agency domain
});

export const ROLLBACK_STRATEGIES = Object.freeze({
  PREVIOUS_DEPLOYMENT: 'PREVIOUS_DEPLOYMENT',
  MANUAL_REVERT:       'MANUAL_REVERT',
  BLUE_GREEN:          'BLUE_GREEN',
  FEATURE_FLAG:        'FEATURE_FLAG',
});

export function createDeployTarget(params = {}) {
  const errors = [];

  if (!params.id)          errors.push('id required');
  if (!params.provider || !Object.values(PROVIDERS).includes(params.provider)) {
    errors.push(`provider must be one of: ${Object.values(PROVIDERS).join(', ')}`);
  }
  if (!params.projectName) errors.push('projectName required');
  if (!params.environment) errors.push('environment required');

  if (errors.length > 0) return { valid: false, errors, target: null };

  const target = {
    id:                       params.id,
    provider:                 params.provider,
    environment:              params.environment,
    projectName:              params.projectName,
    domainType:               params.domainType ?? DOMAIN_TYPES.PAGES_DEFAULT,
    customDomainRequired:     params.customDomainRequired ?? false,
    buildCommand:             params.buildCommand ?? 'npm run build',
    outputDirectory:          params.outputDirectory ?? 'dist',
    nodeVersion:              params.nodeVersion ?? '20',
    runtime:                  params.runtime ?? 'static',
    environmentVariablesRequired: params.environmentVariablesRequired ?? [],
    secretNamesRequired:      params.secretNamesRequired ?? [],
    headersRequired:          params.headersRequired ?? true,
    redirectsRequired:        params.redirectsRequired ?? false,
    pwaRequired:              params.pwaRequired ?? false,
    healthEndpoint:           params.healthEndpoint ?? '/',
    rollbackStrategy:         params.rollbackStrategy ?? ROLLBACK_STRATEGIES.PREVIOUS_DEPLOYMENT,
    ownership:                params.ownership ?? 'AGENCY',
    humanApprovalRequired:    params.humanApprovalRequired ?? true,
    notes:                    params.notes ?? '',
    disclaimer:               'DeployTarget is a declarative config. No real deployment performed.',
  };

  return { valid: true, errors: [], target };
}

export const DEPLOY_TARGET_VERSION = '1.0.0';
