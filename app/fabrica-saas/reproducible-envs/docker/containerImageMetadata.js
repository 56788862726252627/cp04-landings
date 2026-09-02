// Container Image Metadata — ADV-15

export function createContainerImageMetadata(config = {}) {
  if (!config.app)     throw new Error('createContainerImageMetadata requires app');
  if (!config.version) throw new Error('createContainerImageMetadata requires version');

  // Never include secrets in image metadata
  const { app, version, gitSha, buildTimestamp, environment, registryVersion } = config;

  if (config.secretKey || config.apiKey || config.password) {
    throw new Error('METADATA_SAFETY: secrets must not be included in image metadata');
  }

  return Object.freeze({
    app,
    version,
    gitSha:          gitSha          ?? 'unknown',
    buildTimestamp:  buildTimestamp  ?? new Date().toISOString(),
    environment:     environment     ?? 'unknown',
    registryVersion: registryVersion ?? 'unknown',
    noSecrets:       true,
    labels: Object.freeze({
      'org.opencontainers.image.title':   app,
      'org.opencontainers.image.version': version,
      'org.opencontainers.image.revision': gitSha ?? 'unknown',
    }),
    isReal: false,
  });
}

export const CONTAINER_IMAGE_METADATA_VERSION = '1.0.0';
