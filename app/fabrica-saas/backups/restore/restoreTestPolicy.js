// Restore Test Policy — ADV-18
// A backup is not considered good just by existing.
// It must be both integrity-validated AND restore-dry-run validated.

export function createRestoreTestPolicy() {
  return Object.freeze({
    evaluate(config = {}) {
      const {
        integrityValidated  = false,
        dryRunValidated     = false,
        lastTestedAt        = null,
        maxAgeHours         = 168, // 7 days
      } = config;

      const failures = [];

      if (!integrityValidated) failures.push('INTEGRITY_NOT_VALIDATED');
      if (!dryRunValidated)    failures.push('DRY_RUN_NOT_VALIDATED');

      if (lastTestedAt) {
        const ageMs  = Date.now() - new Date(lastTestedAt).getTime();
        const ageHrs = ageMs / 3600000;
        if (ageHrs > maxAgeHours) failures.push('RESTORE_TEST_STALE');
      } else {
        failures.push('NEVER_TESTED');
      }

      return Object.freeze({
        trusted:  failures.length === 0,
        failures: Object.freeze([...failures]),
        isReal:   false,
      });
    },

    isReal: false,
  });
}

export const RESTORE_TEST_POLICY_VERSION = '1.0.0';
