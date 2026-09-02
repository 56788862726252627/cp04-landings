// Container Supply Chain Policy — ADV-15

export function createContainerSupplyChainPolicy(config = {}) {
  return Object.freeze({
    pinBaseImage:        config.pinBaseImage    ?? false,
    lockDependencies:    true,
    imageProvenanceUrl:  config.provenanceUrl   ?? null,
    sbomFuture:          true,
    noUnknownBaseImages: true,
    allowedRegistries: Object.freeze(config.allowedRegistries ?? ['docker.io', 'ghcr.io', 'gcr.io']),
    isReal:              false,
  });
}

export function evaluateBaseImageSafety(image = '') {
  const known = ['node:', 'alpine:', 'debian:', 'ubuntu:', 'nginx:'];
  const isKnown = known.some(k => image.includes(k));
  const isPinned = /@sha256:/.test(image);

  return Object.freeze({
    image,
    isKnown,
    isPinned,
    recommended: isPinned ? image : `${image}@sha256:<digest>`,
    isReal: false,
  });
}

export const CONTAINER_SUPPLY_CHAIN_POLICY_VERSION = '1.0.0';
