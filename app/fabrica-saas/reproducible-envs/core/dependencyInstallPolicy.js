// Dependency Install Policy — ADV-15

export const DEPENDENCY_DRIFT_STATUS = Object.freeze({
  CLEAN:             'CLEAN',
  LOCKFILE_MISMATCH: 'LOCKFILE_MISMATCH',
  MISSING_LOCKFILE:  'MISSING_LOCKFILE',
  UNEXPECTED_PM:     'UNEXPECTED_PM',
  DEPENDENCY_DRIFT:  'DEPENDENCY_DRIFT',
});

export const INSTALL_STRATEGY = Object.freeze({
  NPM_CI:        'npm-ci',
  NPM_INSTALL:   'npm-install',
  FROZEN:        'frozen',
  SKIP:          'skip',
});

export function evaluateDependencyState(config = {}) {
  const { hasLockfile = true, expectedPM = 'npm', detectedPM = 'npm', hasNodeModules = false } = config;

  const issues = [];

  if (!hasLockfile) {
    issues.push({ code: DEPENDENCY_DRIFT_STATUS.MISSING_LOCKFILE, message: 'No lockfile found — install is non-deterministic' });
  }
  if (expectedPM !== detectedPM) {
    issues.push({ code: DEPENDENCY_DRIFT_STATUS.UNEXPECTED_PM, message: `Expected ${expectedPM} but found ${detectedPM}` });
  }
  if (hasLockfile && !hasNodeModules) {
    issues.push({ code: DEPENDENCY_DRIFT_STATUS.LOCKFILE_MISMATCH, message: 'Lockfile present but node_modules missing — run install first' });
  }

  const status = issues.length === 0 ? DEPENDENCY_DRIFT_STATUS.CLEAN : issues[0].code;
  const canUseCi = hasLockfile && expectedPM === detectedPM;

  return Object.freeze({
    status,
    issues:      Object.freeze(issues),
    canUseCi,
    recommended: canUseCi ? INSTALL_STRATEGY.NPM_CI : INSTALL_STRATEGY.NPM_INSTALL,
    isReal:      false,
  });
}

export function createDependencyInstallPolicy(config = {}) {
  const state = evaluateDependencyState(config);

  return Object.freeze({
    ...state,
    ciCommand:   'npm ci',
    devCommand:  'npm install',
    cacheKey:    config.cacheKey ?? 'node_modules-{{lockfile-hash}}',
    isReal:      false,
  });
}

export const DEPENDENCY_INSTALL_POLICY_VERSION = '1.0.0';
