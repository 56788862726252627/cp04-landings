// Build Context Policy — ADV-15

export const BUILD_CONTEXT_STATUS = Object.freeze({
  SAFE:    'SAFE',
  WARNING: 'WARNING',
  BLOCKED: 'BLOCKED',
});

const SECRET_FILE_PATTERNS = /\.env$|\.secret|\.pem$|\.key$|\.p12$|\.pfx$|credentials\.json|service-account/i;
const LARGE_ARTIFACT_PATTERNS = /node_modules|\.git|coverage|playwright-report|dist\/|audit\//;

export function evaluateBuildContext(files = []) {
  const secretFiles  = files.filter(f => SECRET_FILE_PATTERNS.test(f));
  const largeArtifacts = files.filter(f => LARGE_ARTIFACT_PATTERNS.test(f));
  const outsidePaths = files.filter(f => f.startsWith('../') || f.startsWith('/') && !f.startsWith('/app'));

  const issues = [
    ...secretFiles.map(f => ({ code: 'SECRET_FILE_IN_CONTEXT',   file: f, severity: 'CRITICAL' })),
    ...largeArtifacts.map(f => ({ code: 'LARGE_ARTIFACT',        file: f, severity: 'WARNING' })),
    ...outsidePaths.map(f => ({ code: 'OUTSIDE_PROJECT_PATH',    file: f, severity: 'HIGH' })),
  ];

  const criticals = issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
  const status = criticals.length > 0
    ? BUILD_CONTEXT_STATUS.BLOCKED
    : issues.length > 0
      ? BUILD_CONTEXT_STATUS.WARNING
      : BUILD_CONTEXT_STATUS.SAFE;

  return Object.freeze({
    status,
    issues:      Object.freeze(issues),
    secretFiles: Object.freeze(secretFiles),
    blocked:     status === BUILD_CONTEXT_STATUS.BLOCKED,
    isReal:      false,
  });
}

export function createBuildContextPolicy(config = {}) {
  return Object.freeze({
    maxContextMb:       config.maxContextMb      ?? 100,
    blockSecretFiles:   true,
    blockOutsidePaths:  true,
    requireDockerignore: config.requireDockerignore ?? true,
    isReal:             false,
  });
}

export const BUILD_CONTEXT_POLICY_VERSION = '1.0.0';
