// Base Image Policy — ADV-15

export const BASE_IMAGE_STATUS = Object.freeze({
  APPROVED:  'APPROVED',
  UNKNOWN:   'UNKNOWN',
  BLOCKED:   'BLOCKED',
});

const APPROVED_BASE_IMAGES = Object.freeze([
  { pattern: /^node:\d+(-alpine)?$/, reason: 'Official Node.js image' },
  { pattern: /^node:\d+\.\d+\.\d+(-alpine)?$/, reason: 'Official pinned Node.js' },
  { pattern: /^node:\d+@sha256:/, reason: 'Digest-pinned Node.js' },
  { pattern: /^alpine:\d+\.\d+$/, reason: 'Official Alpine' },
  { pattern: /^debian:(bullseye|bookworm|stable)-slim$/, reason: 'Official Debian slim' },
]);

export function evaluateBaseImage(image = '') {
  if (!image) return Object.freeze({ status: BASE_IMAGE_STATUS.BLOCKED, reason: 'No base image specified', isReal: false });

  const approved = APPROVED_BASE_IMAGES.find(a => a.pattern.test(image));
  if (approved) {
    return Object.freeze({ status: BASE_IMAGE_STATUS.APPROVED, reason: approved.reason, image, isReal: false });
  }

  const looksOfficial = /^(node|alpine|debian|ubuntu|nginx|python):/.test(image);
  if (looksOfficial) {
    return Object.freeze({ status: BASE_IMAGE_STATUS.APPROVED, reason: 'Known official base', image, isReal: false });
  }

  return Object.freeze({ status: BASE_IMAGE_STATUS.UNKNOWN, reason: 'Unrecognized base image', image, isReal: false });
}

export function createBaseImagePolicy(config = {}) {
  return Object.freeze({
    preferAlpine:    config.preferAlpine    ?? true,
    preferOfficial:  true,
    preferMaintained: true,
    preferCompatible: true,
    noUnknownImages: true,
    recommendedForNode: 'node:22-alpine',
    isReal:          false,
  });
}

export const BASE_IMAGE_POLICY_VERSION = '1.0.0';
