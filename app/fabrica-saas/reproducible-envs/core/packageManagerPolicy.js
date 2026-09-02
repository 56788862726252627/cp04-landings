// Package Manager Policy — ADV-15

export const PACKAGE_MANAGER = Object.freeze({
  NPM:  'npm',
  PNPM: 'pnpm',
  YARN: 'yarn',
  BUN:  'bun',
});

export const PM_DETECTION_SOURCE = Object.freeze({
  PACKAGE_JSON_FIELD: 'PACKAGE_JSON_FIELD',
  LOCKFILE:           'LOCKFILE',
  DEFAULT:            'DEFAULT',
});

const LOCKFILE_MAP = Object.freeze({
  'package-lock.json': PACKAGE_MANAGER.NPM,
  'pnpm-lock.yaml':    PACKAGE_MANAGER.PNPM,
  'yarn.lock':         PACKAGE_MANAGER.YARN,
  'bun.lockb':         PACKAGE_MANAGER.BUN,
});

export function detectPackageManager(config = {}) {
  const { packageManagerField, lockfiles = [] } = config;

  if (packageManagerField) {
    const pm = packageManagerField.split('@')[0].toLowerCase();
    if (PACKAGE_MANAGER[pm.toUpperCase()]) {
      return Object.freeze({
        detected:  pm,
        source:    PM_DETECTION_SOURCE.PACKAGE_JSON_FIELD,
        lockfiles: Object.freeze(lockfiles),
        isReal:    false,
      });
    }
  }

  for (const lf of lockfiles) {
    const pm = LOCKFILE_MAP[lf];
    if (pm) {
      return Object.freeze({
        detected: pm,
        source:   PM_DETECTION_SOURCE.LOCKFILE,
        lockfiles: Object.freeze(lockfiles),
        isReal:   false,
      });
    }
  }

  return Object.freeze({
    detected:  PACKAGE_MANAGER.NPM,
    source:    PM_DETECTION_SOURCE.DEFAULT,
    lockfiles: Object.freeze(lockfiles),
    isReal:    false,
  });
}

export function createPackageManagerPolicy(config = {}) {
  const detection = detectPackageManager(config);
  const pm = detection.detected;

  const installCmd = {
    [PACKAGE_MANAGER.NPM]:  'npm ci',
    [PACKAGE_MANAGER.PNPM]: 'pnpm install --frozen-lockfile',
    [PACKAGE_MANAGER.YARN]: 'yarn install --frozen-lockfile',
    [PACKAGE_MANAGER.BUN]:  'bun install --frozen-lockfile',
  }[pm] ?? 'npm ci';

  return Object.freeze({
    ...detection,
    installCommand:    installCmd,
    allowMigration:    false,
    migrateIfNeeded:   false,
    isReal:            false,
  });
}

export const PACKAGE_MANAGER_POLICY_VERSION = '1.0.0';
