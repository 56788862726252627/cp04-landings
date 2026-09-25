// Validate Restore Plan — ADV-18

export const RESTORE_VALIDATION_RESULT = Object.freeze({
  VALID:    'VALID',
  WARN:     'WARN',
  INVALID:  'INVALID',
  BLOCKED:  'BLOCKED',
});

export function validateRestorePlan(plan = {}, manifest = {}) {
  const failures = [];
  const warnings = [];

  // Target compatibility
  if (!plan.targetEnvironment) {
    failures.push('MISSING_TARGET_ENVIRONMENT');
  }

  // Schema compatibility
  const schemaVersion = manifest.schemaVersion ?? '1.0.0';
  const [major] = schemaVersion.split('.').map(Number);
  if (major > 2) {
    failures.push('UNSUPPORTED_SCHEMA_VERSION');
  }

  // Client match
  const planClient = plan.clientId;
  const manifestClient = manifest.clientId;
  if (planClient && manifestClient && planClient !== manifestClient) {
    failures.push('CLIENT_MISMATCH');
  }

  // Required restore point
  if (!plan.restorePoint) {
    failures.push('MISSING_RESTORE_POINT');
  }

  // Health prerequisites (conceptual)
  if (plan.targetEnvironment === 'PRODUCTION' && !plan.approvalRequired) {
    failures.push('PRODUCTION_WITHOUT_APPROVAL');
  }

  // Backup integrity check
  if (manifest.corrupted === true) {
    failures.push('CORRUPTED_MANIFEST');
  }

  // Dependencies
  const deps = manifest.dependencies ?? [];
  for (const dep of deps) {
    if (dep.required && !dep.available) {
      warnings.push(`DEPENDENCY_UNAVAILABLE: ${dep.name}`);
    }
  }

  const result = failures.some(f => ['CLIENT_MISMATCH', 'CORRUPTED_MANIFEST', 'PRODUCTION_WITHOUT_APPROVAL'].includes(f))
    ? RESTORE_VALIDATION_RESULT.BLOCKED
    : failures.length > 0
      ? RESTORE_VALIDATION_RESULT.INVALID
      : warnings.length > 0
        ? RESTORE_VALIDATION_RESULT.WARN
        : RESTORE_VALIDATION_RESULT.VALID;

  return Object.freeze({
    result,
    valid:    result === RESTORE_VALIDATION_RESULT.VALID || result === RESTORE_VALIDATION_RESULT.WARN,
    blocked:  result === RESTORE_VALIDATION_RESULT.BLOCKED,
    failures: Object.freeze([...failures]),
    warnings: Object.freeze([...warnings]),
    isReal:   false,
  });
}

export const VALIDATE_RESTORE_PLAN_VERSION = '1.0.0';
