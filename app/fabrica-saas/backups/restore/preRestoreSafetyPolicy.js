// Pre-Restore Safety Policy — ADV-18
// Foundation: before any real restore, a restore point of current state must be created.

export function createPreRestoreSafetyPolicy() {
  return Object.freeze({
    evaluate(config = {}) {
      const {
        currentStateSnapshotCreated = false,
        currentStateIntegrityOk     = false,
        targetIsolated              = false,
        approvalGranted             = false,
        mode                        = 'DRY_RUN',
      } = config;

      const isDryRun = mode === 'DRY_RUN';

      // Dry-run: relaxed checks
      if (isDryRun) {
        return Object.freeze({
          safe:    true,
          mode,
          checks:  Object.freeze([
            { check: 'DRY_RUN_SAFE',    passed: true },
            { check: 'NO_REAL_CHANGES', passed: true },
          ]),
          isReal:  false,
        });
      }

      const checks = [
        { check: 'SNAPSHOT_CREATED',          passed: currentStateSnapshotCreated },
        { check: 'CURRENT_STATE_INTEGRITY_OK', passed: currentStateIntegrityOk },
        { check: 'TARGET_ISOLATED',            passed: targetIsolated },
        { check: 'APPROVAL_GRANTED',           passed: approvalGranted },
      ];

      const allPassed = checks.every(c => c.passed);

      return Object.freeze({
        safe:    allPassed,
        mode,
        checks:  Object.freeze(checks),
        isReal:  false,
      });
    },

    isReal: false,
  });
}

export const PRE_RESTORE_SAFETY_POLICY_VERSION = '1.0.0';
