// Deployment Runtime Resolver — ADV-15

export const DEPLOY_TARGET = Object.freeze({
  CLOUDFLARE:        'CLOUDFLARE',
  VPS:               'VPS',
  CONTAINER_PLATFORM: 'CONTAINER_PLATFORM',
  LOCAL:             'LOCAL',
  STATIC_HOST:       'STATIC_HOST',
  CUSTOM:            'CUSTOM',
});

export const RUNTIME_RECOMMENDATION = Object.freeze({
  CONTAINER:    'CONTAINER',
  NATIVE:       'NATIVE',
  SERVERLESS:   'SERVERLESS',
  STATIC:       'STATIC',
});

const TARGET_MAP = Object.freeze({
  [DEPLOY_TARGET.CLOUDFLARE]:         { runtime: RUNTIME_RECOMMENDATION.SERVERLESS, dockerValue: 'NONE',   note: 'Cloudflare Pages/Workers are serverless — Docker not applicable' },
  [DEPLOY_TARGET.STATIC_HOST]:        { runtime: RUNTIME_RECOMMENDATION.STATIC,     dockerValue: 'NONE',   note: 'Static hosting — build artifact only' },
  [DEPLOY_TARGET.VPS]:                { runtime: RUNTIME_RECOMMENDATION.CONTAINER,  dockerValue: 'HIGH',   note: 'VPS benefits from containerization' },
  [DEPLOY_TARGET.CONTAINER_PLATFORM]: { runtime: RUNTIME_RECOMMENDATION.CONTAINER,  dockerValue: 'REQUIRED', note: 'Container platform requires Docker' },
  [DEPLOY_TARGET.LOCAL]:              { runtime: RUNTIME_RECOMMENDATION.NATIVE,     dockerValue: 'OPTIONAL', note: 'Local dev — native preferred; Docker optional' },
  [DEPLOY_TARGET.CUSTOM]:             { runtime: RUNTIME_RECOMMENDATION.NATIVE,     dockerValue: 'OPTIONAL', note: 'Custom target — evaluate per case' },
});

export function resolveDeploymentRuntime(config = {}) {
  const { target } = config;

  if (!target || !DEPLOY_TARGET[target]) {
    throw new Error(`resolveDeploymentRuntime: unknown target '${target}'. Valid: ${Object.keys(DEPLOY_TARGET).join(', ')}`);
  }

  const rec = TARGET_MAP[target];

  return Object.freeze({
    target,
    recommendedRuntime: rec.runtime,
    dockerValue:        rec.dockerValue,
    note:               rec.note,
    serverlessBypass:   rec.runtime === RUNTIME_RECOMMENDATION.SERVERLESS || rec.runtime === RUNTIME_RECOMMENDATION.STATIC,
    isReal:             false,
  });
}

export const DEPLOYMENT_RUNTIME_RESOLVER_VERSION = '1.0.0';
