// Backup Docker/Env Bridge — ADV-18 → ADV-15
// Restore targets must declare their runtime.

export const RESTORE_RUNTIME = Object.freeze({
  LOCAL:       'LOCAL',
  STAGING:     'STAGING',
  PRODUCTION:  'PRODUCTION',
  CONTAINER:   'CONTAINER',
  SERVERLESS:  'SERVERLESS',
});

export function createBackupDockerEnvBridge() {
  return Object.freeze({
    declareTarget(runtime = RESTORE_RUNTIME.LOCAL) {
      const valid = Object.values(RESTORE_RUNTIME).includes(runtime);
      return Object.freeze({
        runtime:       valid ? runtime : RESTORE_RUNTIME.LOCAL,
        valid,
        isolated:      runtime !== RESTORE_RUNTIME.PRODUCTION,
        safeForDryRun: true,
        isReal:        false,
      });
    },

    validateRuntimeForRestore(runtime = '', mode = 'DRY_RUN') {
      if (mode === 'DRY_RUN') {
        return Object.freeze({ allowed: true, reason: null, isReal: false });
      }
      if (runtime === RESTORE_RUNTIME.PRODUCTION) {
        return Object.freeze({ allowed: false, reason: 'PRODUCTION_REQUIRES_HUMAN_APPROVAL', isReal: false });
      }
      return Object.freeze({ allowed: true, reason: null, isReal: false });
    },

    isReal: false,
  });
}

export const BACKUP_DOCKER_ENV_BRIDGE_VERSION = '1.0.0';
