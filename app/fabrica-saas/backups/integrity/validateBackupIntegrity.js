// Validate Backup Integrity — ADV-18

export const INTEGRITY_RESULT = Object.freeze({
  VALID:     'VALID',
  DEGRADED:  'DEGRADED',
  CORRUPTED: 'CORRUPTED',
  BLOCKED:   'BLOCKED',
});

export function validateBackupIntegrity(manifest = {}, options = {}) {
  const {
    expectedClientId    = null,
    allowMissingOptional = true,
  } = options;

  const failures = [];
  const warnings = [];

  // Manifest completeness
  if (!manifest.version)    failures.push('MISSING_VERSION');
  if (!manifest.createdAt)  failures.push('MISSING_CREATED_AT');
  if (!manifest.schemaVersion) failures.push('MISSING_SCHEMA_VERSION');

  // Client scope check
  if (expectedClientId && manifest.clientId && manifest.clientId !== expectedClientId) {
    failures.push('CLIENT_MISMATCH');
  }

  // Items check
  const items = manifest.items ?? [];
  if (items.length === 0) {
    failures.push('NO_ITEMS');
  }

  const requiredMissing = items.filter(i => i.required && !i.restorable);
  if (requiredMissing.length > 0) {
    failures.push('REQUIRED_ITEM_NOT_RESTORABLE');
  }

  // Checksum check
  const checksums = manifest.checksums ?? {};
  if (Object.keys(checksums).length === 0 && items.length > 0) {
    warnings.push('NO_CHECKSUMS');
  }

  // Secret presence check
  const secretItems = items.filter(i => i.sensitive && !i.encrypted);
  if (secretItems.length > 0) {
    failures.push('UNENCRYPTED_SENSITIVE_ITEM');
  }

  // Corruption flag
  if (manifest.corrupted === true) {
    failures.push('CORRUPTION_FLAG');
  }

  // Schema compatibility
  const schemaVersion = manifest.schemaVersion ?? '1.0.0';
  const [major] = schemaVersion.split('.').map(Number);
  if (major > 1) {
    warnings.push('FUTURE_SCHEMA_VERSION');
  }

  // Secret items with path containing secret patterns
  const secretPatterns = /api[_-]?key|secret|password|private[_-]?key|token|\.env/i;
  for (const item of items) {
    if (secretPatterns.test(item.pathOrLogicalName ?? '')) {
      failures.push('SECRET_DETECTED_IN_ITEM');
      break;
    }
  }

  const result = failures.length > 0
    ? (failures.includes('CLIENT_MISMATCH') || failures.includes('SECRET_DETECTED_IN_ITEM') || failures.includes('CORRUPTION_FLAG')
        ? INTEGRITY_RESULT.BLOCKED
        : INTEGRITY_RESULT.CORRUPTED)
    : (warnings.length > 0 && !allowMissingOptional
        ? INTEGRITY_RESULT.DEGRADED
        : INTEGRITY_RESULT.VALID);

  return Object.freeze({
    result,
    valid:    result === INTEGRITY_RESULT.VALID || result === INTEGRITY_RESULT.DEGRADED,
    blocked:  result === INTEGRITY_RESULT.BLOCKED,
    failures: Object.freeze([...failures]),
    warnings: Object.freeze([...warnings]),
    isReal:   false,
  });
}

export const VALIDATE_BACKUP_INTEGRITY_VERSION = '1.0.0';
