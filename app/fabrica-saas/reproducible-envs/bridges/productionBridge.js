// Production Bridge — ADV-15 → ADV-04

export const RUNTIME_MODE_OPTION = Object.freeze({
  CONTAINER:  'CONTAINER',
  NATIVE:     'NATIVE',
  SERVERLESS: 'SERVERLESS',
});

export function bridgeToProductionPipeline(config = {}) {
  const { target, runtimeMode } = config;

  const resolved = runtimeMode ?? (
    target === 'CLOUDFLARE' || target === 'STATIC_HOST'
      ? RUNTIME_MODE_OPTION.SERVERLESS
      : RUNTIME_MODE_OPTION.NATIVE
  );

  return Object.freeze({
    adv04Bridge:    'PRODUCTION_PIPELINE_CONNECTED',
    target:         target ?? 'UNKNOWN',
    runtimeMode:    resolved,
    cloudflareOk:   target === 'CLOUDFLARE',
    containerOk:    resolved === RUNTIME_MODE_OPTION.CONTAINER,
    serverlessBypass: resolved === RUNTIME_MODE_OPTION.SERVERLESS,
    noRealDeploy:   true,
    isReal:         false,
  });
}

export const PRODUCTION_BRIDGE_VERSION = '1.0.0';
