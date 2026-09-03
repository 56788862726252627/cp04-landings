// Backup Integrity Checksum — ADV-18
// SHA-256-like abstraction. No insecure algorithm. No real crypto.

export const CHECKSUM_ALGORITHM = Object.freeze({
  SHA256:  'SHA-256',
  SHA384:  'SHA-384',
  SHA512:  'SHA-512',
});

export function createBackupIntegrityChecksum(config = {}) {
  const { algorithm = CHECKSUM_ALGORITHM.SHA256 } = config;

  return Object.freeze({
    algorithm,

    compute(logicalName = '', version = '1.0.0', itemCount = 0) {
      // Deterministic simulation — not cryptographically real
      const seed = `${algorithm}:${logicalName}:${version}:${itemCount}`;
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
      }
      const hex = Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
      return Object.freeze({
        value:     hex,
        algorithm,
        source:    logicalName,
        isReal:    false,
        simulated: true,
      });
    },

    verify(checksum = {}, expected = '') {
      if (!checksum?.value || !expected) {
        return Object.freeze({ valid: false, reason: 'MISSING_CHECKSUM', isReal: false });
      }
      const valid = checksum.value === expected;
      return Object.freeze({
        valid,
        reason: valid ? null : 'CHECKSUM_MISMATCH',
        isReal: false,
      });
    },

    isReal: false,
  });
}

export const BACKUP_INTEGRITY_CHECKSUM_VERSION = '1.0.0';
