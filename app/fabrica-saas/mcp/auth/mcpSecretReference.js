// MCP Secret Reference — ADV-12
// Stores env var NAMES only, NEVER values. NO_REAL_SECRETS=SI

export function createSecretReference(config = {}) {
  if (!config.envVarName) throw new Error('SecretReference requires envVarName');
  if (config.value !== undefined) {
    throw new Error('SecretReference MUST NOT store actual secret values — use envVarName only (NO_REAL_SECRETS=SI)');
  }
  return Object.freeze({
    envVarName:   config.envVarName,
    description:  config.description  ?? '',
    required:     config.required     ?? true,
    isConfigured: () => false, // always false in simulation
    resolve:      () => { throw new Error('NO_REAL_SECRETS=SI — resolve() blocked in simulation'); },
    isReal: false,
  });
}

export const MCP_SECRET_REFERENCE_VERSION = '1.0.0';
