// Backup Key Reference Policy — ADV-18
// Only secret references allowed — never raw key material.

export function createBackupKeyReferencePolicy() {
  return Object.freeze({
    validateReference(ref = {}) {
      const { secretReference, keyMaterial } = ref;

      if (keyMaterial !== undefined && keyMaterial !== null && keyMaterial !== '') {
        return Object.freeze({
          valid:  false,
          reason: 'KEY_MATERIAL_FORBIDDEN',
          isReal: false,
        });
      }
      if (!secretReference || typeof secretReference !== 'string') {
        return Object.freeze({
          valid:  false,
          reason: 'MISSING_SECRET_REFERENCE',
          isReal: false,
        });
      }
      return Object.freeze({
        valid:           true,
        secretReference,
        reason:          null,
        isReal:          false,
      });
    },

    buildReference(secretName = '') {
      return Object.freeze({
        secretReference: secretName,
        keyMaterial:     null,
        isReal:          false,
      });
    },

    isReal: false,
  });
}

export const BACKUP_KEY_REFERENCE_POLICY_VERSION = '1.0.0';
