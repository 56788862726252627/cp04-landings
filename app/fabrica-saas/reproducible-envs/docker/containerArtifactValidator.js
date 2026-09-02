// Container Artifact Validator — ADV-15

export const ARTIFACT_STATUS = Object.freeze({
  VALID:   'VALID',
  INVALID: 'INVALID',
  WARNING: 'WARNING',
});

const MAX_DIST_MB = 500;

export function validateContainerArtifact(spec = {}) {
  const {
    distExists       = false,
    entrypoint       = null,
    expectedEntrypoints = ['dist/index.html', 'dist/server.js', 'server.js', 'index.js'],

    sizeMb           = 0,
    hasSecretFiles   = false,
    hasRequiredFiles = true,
  } = spec;

  const issues = [];

  if (!distExists) {
    issues.push({ code: 'DIST_MISSING',        severity: 'CRITICAL' });
  }
  if (entrypoint && !expectedEntrypoints.some(e => entrypoint.endsWith(e))) {
    issues.push({ code: 'UNEXPECTED_ENTRYPOINT', severity: 'HIGH' });
  }
  if (hasSecretFiles) {
    issues.push({ code: 'SECRET_IN_ARTIFACT',   severity: 'CRITICAL' });
  }
  if (sizeMb > MAX_DIST_MB) {
    issues.push({ code: 'ARTIFACT_TOO_LARGE',   severity: 'WARNING', detail: `${sizeMb}MB > ${MAX_DIST_MB}MB` });
  }
  if (!hasRequiredFiles) {
    issues.push({ code: 'MISSING_REQUIRED_FILES', severity: 'HIGH' });
  }

  const criticals = issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
  const status = criticals.length > 0
    ? ARTIFACT_STATUS.INVALID
    : issues.length > 0
      ? ARTIFACT_STATUS.WARNING
      : ARTIFACT_STATUS.VALID;

  return Object.freeze({
    status,
    issues:   Object.freeze(issues),
    distExists,
    sizeMb,
    valid:    status === ARTIFACT_STATUS.VALID,
    isReal:   false,
  });
}

export const CONTAINER_ARTIFACT_VALIDATOR_VERSION = '1.0.0';
