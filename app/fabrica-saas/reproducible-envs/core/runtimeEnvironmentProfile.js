// Runtime Environment Profile — ADV-15

export const ENVIRONMENT = Object.freeze({
  LOCAL:      'LOCAL',
  TEST:       'TEST',
  CI:         'CI',
  STAGING:    'STAGING',
  PRODUCTION: 'PRODUCTION',
});

export const RUNTIME_MODE = Object.freeze({
  CONTAINER:  'CONTAINER',
  NATIVE:     'NATIVE',
  SERVERLESS: 'SERVERLESS',
});

const RESOURCE_PROFILES = Object.freeze({
  MINIMAL:  Object.freeze({ cpu: '0.25', memory: '256m', pids: 50 }),
  STANDARD: Object.freeze({ cpu: '0.5',  memory: '512m', pids: 100 }),
  LARGE:    Object.freeze({ cpu: '1.0',  memory: '1g',   pids: 200 }),
});

export function createRuntimeEnvironmentProfile(config = {}) {
  const { environment, runtimeMode = RUNTIME_MODE.NATIVE } = config;

  if (!ENVIRONMENT[environment]) {
    throw new Error(`createRuntimeEnvironmentProfile: unknown environment '${environment}'. Valid: ${Object.keys(ENVIRONMENT).join(', ')}`);
  }
  if (!RUNTIME_MODE[runtimeMode]) {
    throw new Error(`createRuntimeEnvironmentProfile: unknown runtimeMode '${runtimeMode}'`);
  }

  const defaults = {
    [ENVIRONMENT.LOCAL]:      { port: 5173, installMode: 'npm-install', readinessPolicy: 'WAIT_FOR_PROCESS' },
    [ENVIRONMENT.TEST]:       { port: 5180, installMode: 'npm-ci',      readinessPolicy: 'IMMEDIATE' },
    [ENVIRONMENT.CI]:         { port: 5180, installMode: 'npm-ci',      readinessPolicy: 'IMMEDIATE' },
    [ENVIRONMENT.STAGING]:    { port: 5180, installMode: 'npm-ci',      readinessPolicy: 'WAIT_FOR_HEALTH' },
    [ENVIRONMENT.PRODUCTION]: { port: 5180, installMode: 'npm-ci',      readinessPolicy: 'WAIT_FOR_HEALTH' },
  };

  const d = defaults[environment];

  return Object.freeze({
    environment,
    runtimeMode,
    nodeVersion:          config.nodeVersion          ?? 'lts',
    packageManager:       config.packageManager       ?? 'npm',
    installMode:          config.installMode          ?? d.installMode,
    buildCommand:         config.buildCommand         ?? 'npm run build',
    startCommand:         config.startCommand         ?? 'npm run preview',
    port:                 config.port                 ?? d.port,
    healthEndpoint:       config.healthEndpoint       ?? '/health',
    environmentVariables: Object.freeze(config.environmentVariables ?? {}),
    secretReferences:     Object.freeze(config.secretReferences     ?? []),
    resourceProfile:      RESOURCE_PROFILES[config.resourceProfile] ?? RESOURCE_PROFILES.STANDARD,
    readinessPolicy:      config.readinessPolicy      ?? d.readinessPolicy,
    shutdownPolicy:       config.shutdownPolicy       ?? 'GRACEFUL_30S',
    isReal: false,
  });
}

export const RUNTIME_ENVIRONMENT_PROFILE_VERSION = '1.0.0';
