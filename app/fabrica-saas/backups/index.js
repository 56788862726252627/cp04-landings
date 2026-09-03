// Backup Engine + Restore Validation + Disaster Recovery — ADV-18 barrel export

// ── Scope ────────────────────────────────────────────────────────────────────
export { BACKUP_SCOPE, createBackupScope, BACKUP_SCOPE_VERSION } from './scope/backupScope.js';

// ── Policy ───────────────────────────────────────────────────────────────────
export { BACKUP_FREQUENCY, BACKUP_STATUS, STORAGE_CLASS, createBackupPolicy } from './policy/backupPolicy.js';
export { RETENTION_PRESET, createBackupRetentionPolicy } from './policy/backupRetentionPolicy.js';
export { BACKUP_VERSION_TYPE, createBackupVersionPolicy } from './policy/backupVersionPolicy.js';
export { ENCRYPTION_STATUS, createBackupEncryptionPolicy } from './policy/backupEncryptionPolicy.js';
export { createBackupKeyReferencePolicy } from './policy/backupKeyReferencePolicy.js';
export { COMPRESSION_LEVEL, createBackupCompressionPolicy } from './policy/backupCompressionPolicy.js';
export { DEDUP_STRATEGY, createBackupDeduplicationPolicy } from './policy/backupDeduplicationPolicy.js';
export { STORAGE_TYPE, createBackupStorageProfile } from './policy/backupStorageProfile.js';
export { PII_LEVEL, createBackupPIIPolicy } from './policy/backupPIIPolicy.js';
export { createBackupSecretExclusionPolicy } from './policy/backupSecretExclusionPolicy.js';
export { BACKUP_APPROVAL_TRIGGER, createBackupHumanApprovalPolicy } from './policy/backupHumanApprovalPolicy.js';

// ── Job ──────────────────────────────────────────────────────────────────────
export { BACKUP_JOB_STATUS, BACKUP_SIZE_CLASS, createBackupJob } from './job/backupJob.js';
export { SCHEDULE_FREQUENCY, createBackupSchedule } from './job/backupSchedule.js';
export { EXPIRY_STATE, createBackupExpiryEvaluator } from './job/backupExpiryEvaluator.js';

// ── Manifest ─────────────────────────────────────────────────────────────────
export { BACKUP_ITEM_TYPE, ITEM_SIZE_CLASS, createBackupItem } from './manifest/backupItem.js';
export { createBackupManifest } from './manifest/backupManifest.js';
export { CHECKSUM_ALGORITHM, createBackupIntegrityChecksum } from './manifest/backupIntegrityChecksum.js';

// ── Integrity ────────────────────────────────────────────────────────────────
export { INTEGRITY_RESULT, validateBackupIntegrity } from './integrity/validateBackupIntegrity.js';

// ── Quality ──────────────────────────────────────────────────────────────────
export { BACKUP_QUALITY_FACTOR, computeBackupQualityScore } from './quality/backupQualityScore.js';
export { BACKUP_GATE_STATUS, BACKUP_BLOCK_REASON, evaluateBackupQualityGate } from './quality/backupQualityGate.js';

// ── Restore ──────────────────────────────────────────────────────────────────
export { RESTORE_POINT_STATUS, createRestorePoint } from './restore/restorePoint.js';
export { RESTORE_MODE, RESTORE_TARGET_ENV, createRestorePlan } from './restore/restorePlan.js';
export { PARTIAL_RESTORE_SCOPE, createPartialRestorePlan } from './restore/partialRestorePlan.js';
export { createFullRestorePlan } from './restore/fullRestorePlan.js';
export { ESTIMATED_RISK, simulateRestore } from './restore/simulateRestore.js';
export { RESTORE_VALIDATION_RESULT, validateRestorePlan } from './restore/validateRestorePlan.js';
export { RESTORE_CONFLICT_TYPE, createRestoreConflictDetector } from './restore/restoreConflictDetector.js';
export { CONFLICT_RESOLUTION, createRestoreConflictPolicy } from './restore/restoreConflictPolicy.js';
export { createPreRestoreSafetyPolicy } from './restore/preRestoreSafetyPolicy.js';
export { ROLLBACK_STATUS, createRestoreRollbackPlan } from './restore/restoreRollbackPlan.js';
export { createRestoreTestPolicy } from './restore/restoreTestPolicy.js';

// ── Recovery ─────────────────────────────────────────────────────────────────
export { DR_CRITICALITY, DR_STATUS, createDisasterRecoveryProfile } from './recovery/disasterRecoveryProfile.js';
export { RECOVERY_OBJECTIVE, createRecoveryObjectivePolicy } from './recovery/recoveryObjectivePolicy.js';
export { DRILL_STATUS, createRecoveryDrill } from './recovery/recoveryDrill.js';
export { RECOVERY_FACTOR, computeRecoveryReadinessScore } from './recovery/recoveryReadinessScore.js';
export { RECOVERY_GATE_STATUS, RECOVERY_BLOCK_REASON, evaluateRecoveryQualityGate } from './recovery/recoveryQualityGate.js';

// ── Catalog ──────────────────────────────────────────────────────────────────
export { createBackupCatalog } from './catalog/backupCatalog.js';
export { createRestoreCatalog } from './catalog/restoreCatalog.js';

// ── Audit ────────────────────────────────────────────────────────────────────
export { AUDIT_ACTION, AUDIT_ACTOR_TYPE, createBackupAuditEntry } from './audit/backupAuditEntry.js';

// ── Bridges ──────────────────────────────────────────────────────────────────
export { BACKUP_EVENT, createBackupObservabilityBridge } from './bridges/observabilityBridge.js';
export { BACKUP_HEALTH_STATE, createBackupHealthBridge } from './bridges/healthBridge.js';
export { BACKUP_CICD_CHECK, createBackupCICDBridge } from './bridges/cicdBridge.js';
export { createBackupProductionPipelineBridge } from './bridges/productionPipelineBridge.js';
export { RESTORE_RUNTIME, createBackupDockerEnvBridge } from './bridges/dockerEnvBridge.js';
export { BACKUP_MCP_OPERATION, createBackupMCPBridge } from './bridges/mcpBridge.js';
export { AGENT_BACKUP_PERMISSION, createBackupMultiagentBridge } from './bridges/multiagentBridge.js';

// ── Fixtures ─────────────────────────────────────────────────────────────────
export { GOOD_BACKUP_FIXTURES } from './fixtures/backupFixtures.js';
export { GOOD_RESTORE_FIXTURES } from './fixtures/restoreFixtures.js';
export { FAILURE_BACKUP_FIXTURES } from './fixtures/failureFixtures.js';
export { MULTI_TENANT_FIXTURES } from './fixtures/multiTenantFixtures.js';
export { RECOVERY_DRILL_FIXTURES } from './fixtures/recoveryDrillFixtures.js';

// ── Meta ─────────────────────────────────────────────────────────────────────
export const BACKUP_ENGINE_VERSION = '1.0.0';
export const ADV18_STATUS          = '100_PERCENT';

export const BACKUP_GUARDRAILS = Object.freeze({
  NO_REAL_BACKUP:              true,
  NO_REAL_RESTORE:             true,
  NO_REAL_DELETE:              true,
  NO_REAL_EXTERNAL_COST:       true,
  SECRET_EXCLUSION_ENFORCED:   true,
  CLIENT_ISOLATION_ENFORCED:   true,
  REAL_RESTORE_REQUIRES_HUMAN: true,
  BACKUP_DELETE_REQUIRES_HUMAN: true,
  ENCRYPTION_DOWNGRADE_BLOCKED: true,
  CROSS_CLIENT_BLOCKED:        true,
});
