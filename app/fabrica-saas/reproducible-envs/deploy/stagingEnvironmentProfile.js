// Staging Environment Profile — ADV-15

export function createStagingEnvironmentProfile(config = {}) {
  if (!config.appName) throw new Error('createStagingEnvironmentProfile requires appName');

  return Object.freeze({
    appName:          config.appName,
    environment:      'STAGING',
    port:             config.port       ?? 5180,
    nodeVersion:      config.nodeVersion ?? '22',
    buildCommand:     config.buildCommand ?? 'npm run build',
    startCommand:     config.startCommand ?? 'npm run preview',
    healthEndpoint:   '/health',
    secretsSeparated: true,
    noSharedSecretsWithProd: true,
    isolatedFromProduction:  true,
    runtimeMode:      config.runtimeMode ?? 'NATIVE',
    environmentVariables: Object.freeze({
      NODE_ENV:  'staging',
      PORT:      String(config.port ?? 5180),
      ...(config.extraEnv ?? {}),
    }),
    secretReferences: Object.freeze(config.secretRefs ?? []),
    isReal:           false,
  });
}

export const STAGING_ENVIRONMENT_PROFILE_VERSION = '1.0.0';
