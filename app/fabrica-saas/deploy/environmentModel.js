// Environment Model — PASO G

export const ENVIRONMENTS = Object.freeze({
  LOCAL:      'LOCAL',
  PREVIEW:    'PREVIEW',
  STAGING:    'STAGING',
  PRODUCTION: 'PRODUCTION',
});

export const VERIFICATION_LEVELS = Object.freeze({
  MINIMAL:  'MINIMAL',
  STANDARD: 'STANDARD',
  FULL:     'FULL',
});

const ENVIRONMENT_CONFIGS = {
  [ENVIRONMENTS.LOCAL]: {
    allowedData:          ['test', 'demo', 'fixture', 'seed'],
    allowedCredentials:   ['local', 'mock', 'stub'],
    allowedIntegrations:  ['mock', 'local_server'],
    deploymentPolicy:     'DEVELOPER_ONLY',
    verificationLevel:    VERIFICATION_LEVELS.MINIMAL,
    approvalRequired:     false,
    productionData:       false,
    realSecretsAllowed:   false,
    humanApproval:        false,
    rollbackRequired:     false,
  },
  [ENVIRONMENTS.PREVIEW]: {
    allowedData:          ['test', 'demo', 'fixture', 'anonymized'],
    allowedCredentials:   ['sandbox', 'test_key'],
    allowedIntegrations:  ['sandbox', 'mock', 'test_account'],
    deploymentPolicy:     'AUTO_ON_PR',
    verificationLevel:    VERIFICATION_LEVELS.STANDARD,
    approvalRequired:     false,
    productionData:       false,
    realSecretsAllowed:   false,
    humanApproval:        false,
    rollbackRequired:     false,
  },
  [ENVIRONMENTS.STAGING]: {
    allowedData:          ['anonymized', 'representative_sample'],
    allowedCredentials:   ['staging_key', 'test_key'],
    allowedIntegrations:  ['staging', 'sandbox'],
    deploymentPolicy:     'MANUAL_TRIGGER',
    verificationLevel:    VERIFICATION_LEVELS.FULL,
    approvalRequired:     true,
    productionData:       false,
    realSecretsAllowed:   false,
    humanApproval:        true,
    rollbackRequired:     true,
  },
  [ENVIRONMENTS.PRODUCTION]: {
    allowedData:          ['production_only'],
    allowedCredentials:   ['production_key'],
    allowedIntegrations:  ['production'],
    deploymentPolicy:     'HUMAN_GATE_REQUIRED',
    verificationLevel:    VERIFICATION_LEVELS.FULL,
    approvalRequired:     true,
    productionData:       true,
    realSecretsAllowed:   true,
    humanApproval:        true,
    rollbackRequired:     true,
    notes:                'Always maximum validation. Human gate mandatory.',
  },
};

/**
 * Get the config for an environment.
 */
export function getEnvironmentConfig(environment) {
  if (!Object.values(ENVIRONMENTS).includes(environment)) {
    return { valid: false, error: `unknown environment: ${environment}` };
  }
  return { valid: true, environment, config: ENVIRONMENT_CONFIGS[environment] };
}

/**
 * Check if an action is allowed in an environment.
 */
export function isAllowedInEnvironment(environment, action) {
  const cfg = getEnvironmentConfig(environment);
  if (!cfg.valid) return false;

  const c = cfg.config;
  switch (action) {
    case 'PRODUCTION_DATA': return c.productionData ?? false;
    case 'REAL_SECRETS':    return c.realSecretsAllowed ?? false;
    case 'AUTO_DEPLOY':     return !c.humanApproval;
    case 'ROLLBACK':        return c.rollbackRequired ?? false;
    default: return false;
  }
}

export const ENVIRONMENT_MODEL_VERSION = '1.0.0';
