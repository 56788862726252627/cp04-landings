// Restore Conflict Detector — ADV-18

export const RESTORE_CONFLICT_TYPE = Object.freeze({
  VERSION_CONFLICT:       'VERSION_CONFLICT',
  SCHEMA_CONFLICT:        'SCHEMA_CONFLICT',
  CLIENT_CONFLICT:        'CLIENT_CONFLICT',
  EXISTING_DATA_CONFLICT: 'EXISTING_DATA_CONFLICT',
  DEPENDENCY_CONFLICT:    'DEPENDENCY_CONFLICT',
  POLICY_CONFLICT:        'POLICY_CONFLICT',
});

export function createRestoreConflictDetector() {
  return Object.freeze({
    detect(plan = {}, currentState = {}) {
      const conflicts = [];

      if (plan.clientId && currentState.clientId && plan.clientId !== currentState.clientId) {
        conflicts.push({ type: RESTORE_CONFLICT_TYPE.CLIENT_CONFLICT, detail: 'Client ID mismatch' });
      }

      if (plan.sourceVersion && currentState.version) {
        const [planMajor] = (plan.sourceVersion ?? '1.0.0').split('.').map(Number);
        const [currMajor] = (currentState.version ?? '1.0.0').split('.').map(Number);
        if (planMajor !== currMajor) {
          conflicts.push({ type: RESTORE_CONFLICT_TYPE.VERSION_CONFLICT, detail: `${plan.sourceVersion} vs ${currentState.version}` });
        }
      }

      if (plan.schemaVersion && currentState.schemaVersion && plan.schemaVersion !== currentState.schemaVersion) {
        conflicts.push({ type: RESTORE_CONFLICT_TYPE.SCHEMA_CONFLICT, detail: `schema ${plan.schemaVersion} vs ${currentState.schemaVersion}` });
      }

      if (currentState.hasExistingData && plan.mode !== 'DRY_RUN') {
        conflicts.push({ type: RESTORE_CONFLICT_TYPE.EXISTING_DATA_CONFLICT, detail: 'Target has existing data' });
      }

      if (plan.retentionPolicy && currentState.retentionPolicy) {
        if (plan.retentionPolicy !== currentState.retentionPolicy) {
          conflicts.push({ type: RESTORE_CONFLICT_TYPE.POLICY_CONFLICT, detail: 'Retention policy mismatch' });
        }
      }

      return Object.freeze({
        hasConflicts: conflicts.length > 0,
        conflicts:    Object.freeze(conflicts),
        count:        conflicts.length,
        isReal:       false,
      });
    },

    isReal: false,
  });
}

export const RESTORE_CONFLICT_DETECTOR_VERSION = '1.0.0';
