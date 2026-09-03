// ADV-18 — Backup Engine + Restore Validation + Disaster Recovery Foundation
// Tests: 240 | Suites: 58

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Scope ────────────────────────────────────────────────────────────────────
import { BACKUP_SCOPE, createBackupScope } from '../../backups/scope/backupScope.js';

// ── Policy ───────────────────────────────────────────────────────────────────
import { BACKUP_FREQUENCY, BACKUP_STATUS, createBackupPolicy } from '../../backups/policy/backupPolicy.js';
import { RETENTION_PRESET, createBackupRetentionPolicy } from '../../backups/policy/backupRetentionPolicy.js';
import { createBackupSecretExclusionPolicy } from '../../backups/policy/backupSecretExclusionPolicy.js';
import { PII_LEVEL, createBackupPIIPolicy } from '../../backups/policy/backupPIIPolicy.js';
import { BACKUP_VERSION_TYPE, createBackupVersionPolicy } from '../../backups/policy/backupVersionPolicy.js';
import { ENCRYPTION_STATUS, createBackupEncryptionPolicy } from '../../backups/policy/backupEncryptionPolicy.js';
import { createBackupKeyReferencePolicy } from '../../backups/policy/backupKeyReferencePolicy.js';
import { COMPRESSION_LEVEL, createBackupCompressionPolicy } from '../../backups/policy/backupCompressionPolicy.js';
import { DEDUP_STRATEGY, createBackupDeduplicationPolicy } from '../../backups/policy/backupDeduplicationPolicy.js';
import { STORAGE_TYPE, createBackupStorageProfile } from '../../backups/policy/backupStorageProfile.js';
import { BACKUP_APPROVAL_TRIGGER, createBackupHumanApprovalPolicy } from '../../backups/policy/backupHumanApprovalPolicy.js';

// ── Job ──────────────────────────────────────────────────────────────────────
import { BACKUP_JOB_STATUS, createBackupJob } from '../../backups/job/backupJob.js';
import { SCHEDULE_FREQUENCY, createBackupSchedule } from '../../backups/job/backupSchedule.js';
import { EXPIRY_STATE, createBackupExpiryEvaluator } from '../../backups/job/backupExpiryEvaluator.js';

// ── Manifest ─────────────────────────────────────────────────────────────────
import { BACKUP_ITEM_TYPE, createBackupItem } from '../../backups/manifest/backupItem.js';
import { createBackupManifest } from '../../backups/manifest/backupManifest.js';
import { CHECKSUM_ALGORITHM, createBackupIntegrityChecksum } from '../../backups/manifest/backupIntegrityChecksum.js';

// ── Integrity ────────────────────────────────────────────────────────────────
import { INTEGRITY_RESULT, validateBackupIntegrity } from '../../backups/integrity/validateBackupIntegrity.js';

// ── Quality ──────────────────────────────────────────────────────────────────
import { computeBackupQualityScore } from '../../backups/quality/backupQualityScore.js';
import { BACKUP_GATE_STATUS, BACKUP_BLOCK_REASON, evaluateBackupQualityGate } from '../../backups/quality/backupQualityGate.js';

// ── Restore ──────────────────────────────────────────────────────────────────
import { RESTORE_POINT_STATUS, createRestorePoint } from '../../backups/restore/restorePoint.js';
import { RESTORE_MODE, RESTORE_TARGET_ENV, createRestorePlan } from '../../backups/restore/restorePlan.js';
import { PARTIAL_RESTORE_SCOPE, createPartialRestorePlan } from '../../backups/restore/partialRestorePlan.js';
import { createFullRestorePlan } from '../../backups/restore/fullRestorePlan.js';
import { ESTIMATED_RISK, simulateRestore } from '../../backups/restore/simulateRestore.js';
import { RESTORE_VALIDATION_RESULT, validateRestorePlan } from '../../backups/restore/validateRestorePlan.js';
import { RESTORE_CONFLICT_TYPE, createRestoreConflictDetector } from '../../backups/restore/restoreConflictDetector.js';
import { CONFLICT_RESOLUTION, createRestoreConflictPolicy } from '../../backups/restore/restoreConflictPolicy.js';
import { createPreRestoreSafetyPolicy } from '../../backups/restore/preRestoreSafetyPolicy.js';
import { ROLLBACK_STATUS, createRestoreRollbackPlan } from '../../backups/restore/restoreRollbackPlan.js';
import { createRestoreTestPolicy } from '../../backups/restore/restoreTestPolicy.js';

// ── Recovery ─────────────────────────────────────────────────────────────────
import { DR_CRITICALITY, DR_STATUS, createDisasterRecoveryProfile } from '../../backups/recovery/disasterRecoveryProfile.js';
import { RECOVERY_OBJECTIVE, createRecoveryObjectivePolicy } from '../../backups/recovery/recoveryObjectivePolicy.js';
import { DRILL_STATUS, createRecoveryDrill } from '../../backups/recovery/recoveryDrill.js';
import { computeRecoveryReadinessScore } from '../../backups/recovery/recoveryReadinessScore.js';
import { RECOVERY_GATE_STATUS, RECOVERY_BLOCK_REASON, evaluateRecoveryQualityGate } from '../../backups/recovery/recoveryQualityGate.js';

// ── Catalog ──────────────────────────────────────────────────────────────────
import { createBackupCatalog } from '../../backups/catalog/backupCatalog.js';
import { createRestoreCatalog } from '../../backups/catalog/restoreCatalog.js';

// ── Audit ────────────────────────────────────────────────────────────────────
import { AUDIT_ACTION, AUDIT_ACTOR_TYPE, createBackupAuditEntry } from '../../backups/audit/backupAuditEntry.js';

// ── Bridges ──────────────────────────────────────────────────────────────────
import { BACKUP_EVENT, createBackupObservabilityBridge } from '../../backups/bridges/observabilityBridge.js';
import { BACKUP_HEALTH_STATE, createBackupHealthBridge } from '../../backups/bridges/healthBridge.js';
import { BACKUP_CICD_CHECK, createBackupCICDBridge } from '../../backups/bridges/cicdBridge.js';
import { createBackupProductionPipelineBridge } from '../../backups/bridges/productionPipelineBridge.js';
import { RESTORE_RUNTIME, createBackupDockerEnvBridge } from '../../backups/bridges/dockerEnvBridge.js';
import { BACKUP_MCP_OPERATION, createBackupMCPBridge } from '../../backups/bridges/mcpBridge.js';
import { AGENT_BACKUP_PERMISSION, createBackupMultiagentBridge } from '../../backups/bridges/multiagentBridge.js';

// ── Fixtures ─────────────────────────────────────────────────────────────────
import { GOOD_BACKUP_FIXTURES } from '../../backups/fixtures/backupFixtures.js';
import { GOOD_RESTORE_FIXTURES } from '../../backups/fixtures/restoreFixtures.js';
import { FAILURE_BACKUP_FIXTURES } from '../../backups/fixtures/failureFixtures.js';
import { MULTI_TENANT_FIXTURES } from '../../backups/fixtures/multiTenantFixtures.js';
import { RECOVERY_DRILL_FIXTURES } from '../../backups/fixtures/recoveryDrillFixtures.js';

// ── Registry ─────────────────────────────────────────────────────────────────
import { BACKUP_RESTORE_REGISTRY } from '../../factory-registry/backupRestore.js';
import { BACKUP_ENGINE_VERSION, ADV18_STATUS, BACKUP_GUARDRAILS } from '../../backups/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// SCOPE
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupScope', () => {
  it('creates scope with defaults', () => {
    const s = createBackupScope();
    assert.ok(Array.isArray(s.scopes));
    assert.equal(s.isReal, false);
    assert.equal(s.excludeSecrets, true);
  });

  it('has 12 scope types', () => {
    assert.equal(Object.keys(BACKUP_SCOPE).length, 12);
  });

  it('FULL scope expands to all scopes minus FULL', () => {
    const s = createBackupScope({ scopes: [BACKUP_SCOPE.FULL] });
    assert.equal(s.isFull, true);
    assert.ok(!s.scopes.includes(BACKUP_SCOPE.FULL));
  });

  it('filters invalid scopes', () => {
    const s = createBackupScope({ scopes: ['CONFIG', 'INVALID_SCOPE'] });
    assert.ok(!s.scopes.includes('INVALID_SCOPE'));
    assert.ok(s.scopes.includes('CONFIG'));
  });

  it('sets clientId and businessId', () => {
    const s = createBackupScope({ scopes: ['CONFIG'], clientId: 'c1', businessId: 'b1' });
    assert.equal(s.clientId, 'c1');
    assert.equal(s.businessId, 'b1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BACKUP POLICY
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupPolicy', () => {
  it('creates policy with defaults', () => {
    const p = createBackupPolicy();
    assert.equal(p.excludeSecrets, true);
    assert.equal(p.clientIsolation, true);
    assert.equal(p.isActive, true);
    assert.equal(p.isReal, false);
  });

  it('has backup frequency constants', () => {
    assert.ok(BACKUP_FREQUENCY.DAILY);
    assert.ok(BACKUP_FREQUENCY.MANUAL);
    assert.ok(BACKUP_FREQUENCY.ON_DEPLOY);
  });

  it('supports paused status', () => {
    const p = createBackupPolicy({ status: BACKUP_STATUS.PAUSED });
    assert.equal(p.isActive, false);
  });

  it('encryption required flag propagates', () => {
    const p = createBackupPolicy({ encryptionRequired: true });
    assert.equal(p.encryptionRequired, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RETENTION POLICY
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupRetentionPolicy', () => {
  it('SHORT preset = 7 days', () => {
    const r = createBackupRetentionPolicy({ preset: RETENTION_PRESET.SHORT });
    assert.equal(r.retentionDays, 7);
  });

  it('STANDARD preset = 30 days', () => {
    const r = createBackupRetentionPolicy({ preset: RETENTION_PRESET.STANDARD });
    assert.equal(r.retentionDays, 30);
  });

  it('EXTENDED preset = 90 days', () => {
    const r = createBackupRetentionPolicy({ preset: RETENTION_PRESET.EXTENDED });
    assert.equal(r.retentionDays, 90);
  });

  it('LEGAL_HOLD = infinite, no auto-delete', () => {
    const r = createBackupRetentionPolicy({ preset: RETENTION_PRESET.LEGAL_HOLD_FOUNDATION });
    assert.equal(r.isIndefinite, true);
    assert.equal(r.canAutoDelete, false);
  });

  it('legalHold overrides autoDelete', () => {
    const r = createBackupRetentionPolicy({ autoDelete: true, legalHold: true });
    assert.equal(r.autoDelete, false);
    assert.equal(r.legalHold, true);
  });

  it('custom preset uses customDays', () => {
    const r = createBackupRetentionPolicy({ preset: RETENTION_PRESET.CUSTOM, customDays: 45 });
    assert.equal(r.retentionDays, 45);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SECRET EXCLUSION POLICY
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupSecretExclusionPolicy', () => {
  it('safe input passes', () => {
    const p = createBackupSecretExclusionPolicy();
    const r = p.inspect('config.json');
    assert.equal(r.safe, true);
    assert.equal(r.blocked, false);
  });

  it('.env file triggers BLOCKED', () => {
    const p = createBackupSecretExclusionPolicy();
    const r = p.inspect('.env.production');
    assert.equal(r.blocked, true);
    assert.ok(r.reasons.includes('ENV_FILE'));
  });

  it('api-key triggers BLOCKED', () => {
    const p = createBackupSecretExclusionPolicy();
    const r = p.inspect('stripe_api_key_backup.json');
    assert.equal(r.blocked, true);
  });

  it('password triggers BLOCKED', () => {
    const p = createBackupSecretExclusionPolicy();
    const r = p.inspect('db_password_2026.txt');
    assert.equal(r.blocked, true);
    assert.ok(r.reasons.includes('PASSWORD'));
  });

  it('private-key triggers BLOCKED', () => {
    const p = createBackupSecretExclusionPolicy();
    const r = p.inspect('private_key.pem');
    assert.equal(r.blocked, true);
  });

  it('inspectItems scans array of items', () => {
    const p = createBackupSecretExclusionPolicy();
    const r = p.inspectItems([
      { pathOrLogicalName: 'config.json' },
      { pathOrLogicalName: '.env.production' },
    ]);
    assert.equal(r.blocked, true);
    assert.equal(r.detected.length, 1);
  });

  it('inspectItems with all safe items passes', () => {
    const p = createBackupSecretExclusionPolicy();
    const r = p.inspectItems([
      { pathOrLogicalName: 'crm-export.json' },
      { pathOrLogicalName: 'registry-snapshot.json' },
    ]);
    assert.equal(r.safe, true);
    assert.equal(r.detected.length, 0);
  });

  it('isReal is always false', () => {
    const p = createBackupSecretExclusionPolicy();
    assert.equal(p.isReal, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PII POLICY
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupPIIPolicy', () => {
  it('NONE level — no encryption required', () => {
    const p = createBackupPIIPolicy({ piiLevel: PII_LEVEL.NONE });
    assert.equal(p.encryptionRequired, false);
    assert.equal(p.isHighRisk, false);
  });

  it('SENSITIVE requires encryption', () => {
    const p = createBackupPIIPolicy({ piiLevel: PII_LEVEL.SENSITIVE });
    assert.equal(p.encryptionRequired, true);
    assert.equal(p.isHighRisk, true);
  });

  it('RESTRICTED requires approval for restore', () => {
    const p = createBackupPIIPolicy({ piiLevel: PII_LEVEL.RESTRICTED });
    assert.equal(p.restoreApprovalRequired, true);
    assert.equal(p.isRestricted, true);
  });

  it('5 PII levels defined', () => {
    assert.equal(Object.keys(PII_LEVEL).length, 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VERSION POLICY
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupVersionPolicy', () => {
  it('creates FULL version policy', () => {
    const v = createBackupVersionPolicy({ versionType: BACKUP_VERSION_TYPE.FULL });
    assert.equal(v.isFull, true);
    assert.equal(v.isReal, false);
  });

  it('SNAPSHOT type', () => {
    const v = createBackupVersionPolicy({ versionType: BACKUP_VERSION_TYPE.SNAPSHOT });
    assert.equal(v.isSnapshot, true);
  });

  it('CONFIG_ONLY type', () => {
    const v = createBackupVersionPolicy({ versionType: BACKUP_VERSION_TYPE.CONFIG_ONLY });
    assert.equal(v.isConfigOnly, true);
  });

  it('4 version types defined', () => {
    assert.equal(Object.keys(BACKUP_VERSION_TYPE).length, 4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ENCRYPTION POLICY
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupEncryptionPolicy', () => {
  it('REQUIRED status sets isRequired', () => {
    const p = createBackupEncryptionPolicy({ status: ENCRYPTION_STATUS.REQUIRED });
    assert.equal(p.isRequired, true);
  });

  it('keyReferenceOnly is true by default', () => {
    const p = createBackupEncryptionPolicy();
    assert.equal(p.keyReferenceOnly, true);
  });

  it('4 encryption statuses defined', () => {
    assert.equal(Object.keys(ENCRYPTION_STATUS).length, 4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KEY REFERENCE POLICY
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupKeyReferencePolicy', () => {
  it('valid secretReference passes', () => {
    const p = createBackupKeyReferencePolicy();
    const r = p.validateReference({ secretReference: 'MY_STRIPE_SECRET' });
    assert.equal(r.valid, true);
  });

  it('raw keyMaterial is rejected', () => {
    const p = createBackupKeyReferencePolicy();
    const r = p.validateReference({ secretReference: 'MY_KEY', keyMaterial: 'sk_live_abc123' });
    assert.equal(r.valid, false);
    assert.equal(r.reason, 'KEY_MATERIAL_FORBIDDEN');
  });

  it('missing secretReference is rejected', () => {
    const p = createBackupKeyReferencePolicy();
    const r = p.validateReference({});
    assert.equal(r.valid, false);
    assert.equal(r.reason, 'MISSING_SECRET_REFERENCE');
  });

  it('buildReference never includes key material', () => {
    const p = createBackupKeyReferencePolicy();
    const ref = p.buildReference('AIRTABLE_API_KEY');
    assert.equal(ref.keyMaterial, null);
    assert.equal(ref.secretReference, 'AIRTABLE_API_KEY');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPRESSION + DEDUP + STORAGE
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupCompressionPolicy', () => {
  it('STANDARD level enables compression', () => {
    const c = createBackupCompressionPolicy({ level: COMPRESSION_LEVEL.STANDARD });
    assert.equal(c.compressionEnabled, true);
  });

  it('NONE level disables compression', () => {
    const c = createBackupCompressionPolicy({ level: COMPRESSION_LEVEL.NONE });
    assert.equal(c.compressionEnabled, false);
  });
});

describe('BackupDeduplicationPolicy', () => {
  it('crossClient is always false regardless of input', () => {
    const d = createBackupDeduplicationPolicy({ crossClient: true });
    assert.equal(d.crossClient, false);
  });

  it('NONE strategy disables dedup', () => {
    const d = createBackupDeduplicationPolicy({ strategy: DEDUP_STRATEGY.NONE });
    assert.equal(d.enabled, false);
  });
});

describe('BackupStorageProfile', () => {
  it('LOCAL profile is not remote', () => {
    const s = createBackupStorageProfile({ type: STORAGE_TYPE.LOCAL });
    assert.equal(s.isRemote, false);
  });

  it('CLOUD_PROVIDER profile is remote', () => {
    const s = createBackupStorageProfile({ type: STORAGE_TYPE.CLOUD_PROVIDER });
    assert.equal(s.isRemote, true);
  });

  it('4 storage types defined', () => {
    assert.equal(Object.keys(STORAGE_TYPE).length, 4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HUMAN APPROVAL POLICY
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupHumanApprovalPolicy', () => {
  it('REAL_RESTORE is required', () => {
    const p = createBackupHumanApprovalPolicy();
    const r = p.requires(BACKUP_APPROVAL_TRIGGER.REAL_RESTORE);
    assert.equal(r.required, true);
    assert.equal(r.status, 'REQUIRED');
  });

  it('BACKUP_DELETION is required', () => {
    const p = createBackupHumanApprovalPolicy();
    const r = p.requires(BACKUP_APPROVAL_TRIGGER.BACKUP_DELETION);
    assert.equal(r.required, true);
  });

  it('requestApproval returns PENDING', () => {
    const p = createBackupHumanApprovalPolicy();
    const r = p.requestApproval({ trigger: BACKUP_APPROVAL_TRIGGER.REAL_RESTORE, context: {} });
    assert.equal(r.status, 'PENDING');
    assert.equal(r.approvedBy, null);
    assert.equal(r.isReal, false);
  });

  it('7 approval triggers defined', () => {
    assert.equal(Object.keys(BACKUP_APPROVAL_TRIGGER).length, 7);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BACKUP JOB
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupJob', () => {
  it('creates job with PLANNED status', () => {
    const j = createBackupJob({ clientId: 'client-a', scope: ['CONFIG'] });
    assert.equal(j.status, BACKUP_JOB_STATUS.PLANNED);
    assert.equal(j.isCompleted, false);
    assert.equal(j.isReal, false);
  });

  it('COMPLETED job has isCompleted=true', () => {
    const j = createBackupJob({ status: BACKUP_JOB_STATUS.COMPLETED });
    assert.equal(j.isCompleted, true);
  });

  it('BLOCKED job has isBlocked=true', () => {
    const j = createBackupJob({ status: BACKUP_JOB_STATUS.BLOCKED });
    assert.equal(j.isBlocked, true);
  });

  it('job gets unique id', () => {
    const j1 = createBackupJob();
    const j2 = createBackupJob();
    assert.notEqual(j1.id, j2.id);
  });

  it('7 job statuses defined', () => {
    assert.equal(Object.keys(BACKUP_JOB_STATUS).length, 7);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BACKUP SCHEDULE
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupSchedule', () => {
  it('creates disabled schedule by default', () => {
    const s = createBackupSchedule();
    assert.equal(s.enabled, false);
    assert.equal(s.isReal, false);
  });

  it('DAILY frequency', () => {
    const s = createBackupSchedule({ frequency: SCHEDULE_FREQUENCY.DAILY, enabled: true });
    assert.equal(s.frequency, 'DAILY');
    assert.equal(s.enabled, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPIRY EVALUATOR
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupExpiryEvaluator', () => {
  it('fresh backup is ACTIVE', () => {
    const e = createBackupExpiryEvaluator();
    const r = e.evaluate({
      createdAt:     new Date().toISOString(),
      retentionDays: 30,
    });
    assert.equal(r.state, EXPIRY_STATE.ACTIVE);
  });

  it('old backup is EXPIRED', () => {
    const e = createBackupExpiryEvaluator();
    const old = new Date(Date.now() - 40 * 86400000).toISOString();
    const r = e.evaluate({ createdAt: old, retentionDays: 30 });
    assert.equal(r.state, EXPIRY_STATE.EXPIRED);
    assert.equal(r.daysRemaining, 0);
  });

  it('legal hold is HOLD', () => {
    const e = createBackupExpiryEvaluator();
    const r = e.evaluate({ createdAt: new Date().toISOString(), legalHold: true });
    assert.equal(r.state, EXPIRY_STATE.HOLD);
  });

  it('backup within 7 days of expiry is EXPIRING', () => {
    const e = createBackupExpiryEvaluator();
    const created = new Date(Date.now() - 25 * 86400000).toISOString();
    const r = e.evaluate({ createdAt: created, retentionDays: 30 });
    assert.equal(r.state, EXPIRY_STATE.EXPIRING);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BACKUP ITEM
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupItem', () => {
  it('creates item with defaults', () => {
    const i = createBackupItem({ type: BACKUP_ITEM_TYPE.CONFIG_FILE });
    assert.equal(i.type, 'CONFIG_FILE');
    assert.equal(i.restorable, true);
    assert.equal(i.isReal, false);
  });

  it('sensitive item unencrypted is allowed to create but flagged', () => {
    const i = createBackupItem({ sensitive: true, encrypted: false });
    assert.equal(i.sensitive, true);
    assert.equal(i.encrypted, false);
  });

  it('12 item types defined', () => {
    assert.equal(Object.keys(BACKUP_ITEM_TYPE).length, 12);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BACKUP MANIFEST
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupManifest', () => {
  it('creates manifest with items', () => {
    const item = createBackupItem({ type: BACKUP_ITEM_TYPE.CONFIG_FILE, pathOrLogicalName: 'config.json' });
    const m = createBackupManifest({
      scope:    ['CONFIG'],
      items:    [item],
      clientId: 'client-a',
    });
    assert.equal(m.itemCount, 1);
    assert.equal(m.clientId, 'client-a');
    assert.ok(m.createdAt);
    assert.equal(m.isReal, false);
  });

  it('empty manifest has itemCount 0', () => {
    const m = createBackupManifest({});
    assert.equal(m.itemCount, 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CHECKSUM
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupIntegrityChecksum', () => {
  it('computes a hex checksum', () => {
    const c = createBackupIntegrityChecksum();
    const r = c.compute('config.json', '1.0.0', 5);
    assert.ok(typeof r.value === 'string');
    assert.equal(r.value.length, 64);
    assert.equal(r.isReal, false);
    assert.equal(r.simulated, true);
  });

  it('same inputs produce same checksum', () => {
    const c = createBackupIntegrityChecksum();
    const r1 = c.compute('config.json', '1.0.0', 5);
    const r2 = c.compute('config.json', '1.0.0', 5);
    assert.equal(r1.value, r2.value);
  });

  it('different inputs produce different checksums', () => {
    const c = createBackupIntegrityChecksum();
    const r1 = c.compute('config.json', '1.0.0', 5);
    const r2 = c.compute('other.json', '1.0.0', 3);
    assert.notEqual(r1.value, r2.value);
  });

  it('verify returns valid when checksums match', () => {
    const c = createBackupIntegrityChecksum();
    const computed = c.compute('config.json', '1.0.0', 5);
    const v = c.verify(computed, computed.value);
    assert.equal(v.valid, true);
  });

  it('verify returns invalid when checksums differ', () => {
    const c = createBackupIntegrityChecksum();
    const computed = c.compute('config.json', '1.0.0', 5);
    const v = c.verify(computed, 'wrongchecksum');
    assert.equal(v.valid, false);
    assert.equal(v.reason, 'CHECKSUM_MISMATCH');
  });

  it('3 algorithms defined', () => {
    assert.equal(Object.keys(CHECKSUM_ALGORITHM).length, 3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRITY VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
describe('validateBackupIntegrity', () => {
  it('valid manifest passes', () => {
    const item = createBackupItem({ type: BACKUP_ITEM_TYPE.CONFIG_FILE, pathOrLogicalName: 'config.json' });
    const m = createBackupManifest({ items: [item], clientId: 'c1', checksums: { 'config.json': 'abc' } });
    const r = validateBackupIntegrity(m);
    assert.equal(r.result, INTEGRITY_RESULT.VALID);
    assert.equal(r.valid, true);
    assert.equal(r.isReal, false);
  });

  it('missing version → CORRUPTED', () => {
    const r = validateBackupIntegrity({ version: null, items: [{ required: false, restorable: true }], checksums: {} });
    assert.ok(r.failures.includes('MISSING_VERSION'));
    assert.ok(r.result !== INTEGRITY_RESULT.VALID);
  });

  it('empty items → failure', () => {
    const r = validateBackupIntegrity({ version: '1.0.0', createdAt: new Date().toISOString(), schemaVersion: '1.0.0', items: [], checksums: {} });
    assert.ok(r.failures.includes('NO_ITEMS'));
  });

  it('client mismatch → BLOCKED', () => {
    const m = createBackupManifest({ items: [createBackupItem({ pathOrLogicalName: 'c.json' })], clientId: 'client-a' });
    const r = validateBackupIntegrity(m, { expectedClientId: 'client-b' });
    assert.equal(r.result, INTEGRITY_RESULT.BLOCKED);
    assert.equal(r.blocked, true);
  });

  it('corruption flag → BLOCKED', () => {
    const m = { ...createBackupManifest({ items: [createBackupItem({ pathOrLogicalName: 'f.json' })], checksums: { f: 'x' } }), corrupted: true };
    const r = validateBackupIntegrity(m);
    assert.equal(r.result, INTEGRITY_RESULT.BLOCKED);
  });

  it('secret in item path → BLOCKED', () => {
    const secretItem = createBackupItem({ pathOrLogicalName: '.env.production', type: BACKUP_ITEM_TYPE.CONFIG_FILE });
    const m = createBackupManifest({ items: [secretItem] });
    const r = validateBackupIntegrity(m);
    assert.equal(r.result, INTEGRITY_RESULT.BLOCKED);
    assert.ok(r.failures.includes('SECRET_DETECTED_IN_ITEM'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BACKUP QUALITY SCORE
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupQualityScore', () => {
  it('perfect metrics → 100', () => {
    const r = computeBackupQualityScore({});
    assert.equal(r.overall, 100);
    assert.equal(r.grade, 'A');
    assert.equal(r.isReal, false);
  });

  it('zero integrity lowers overall', () => {
    const r = computeBackupQualityScore({ integrity: 0 });
    assert.ok(r.overall < 100);
  });

  it('8 quality factors defined', () => {
    const r = computeBackupQualityScore({});
    assert.equal(Object.keys(r.scores).length, 8);
  });

  it('low score gets grade F', () => {
    const r = computeBackupQualityScore({
      completeness: 0, integrity: 0, security: 0, restorability: 0,
      freshness: 0, clientIsolation: 0, policyCompliance: 0, manifestQuality: 0,
    });
    assert.equal(r.grade, 'F');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BACKUP QUALITY GATE
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupQualityGate', () => {
  it('high score no issues → PASS', () => {
    const r = evaluateBackupQualityGate({ overallScore: 95 });
    assert.equal(r.status, BACKUP_GATE_STATUS.PASS);
    assert.equal(r.isReal, false);
  });

  it('mid score → WARN', () => {
    const r = evaluateBackupQualityGate({ overallScore: 85 });
    assert.equal(r.status, BACKUP_GATE_STATUS.WARN);
  });

  it('low score → FAIL', () => {
    const r = evaluateBackupQualityGate({ overallScore: 70 });
    assert.equal(r.status, BACKUP_GATE_STATUS.FAIL);
  });

  it('secretIncluded → BLOCKED', () => {
    const r = evaluateBackupQualityGate({ overallScore: 100, secretIncluded: true });
    assert.equal(r.status, BACKUP_GATE_STATUS.BLOCKED);
    assert.ok(r.blockReasons.includes(BACKUP_BLOCK_REASON.SECRET_INCLUDED));
  });

  it('checksumMismatch → BLOCKED', () => {
    const r = evaluateBackupQualityGate({ checksumMismatch: true });
    assert.equal(r.status, BACKUP_GATE_STATUS.BLOCKED);
  });

  it('wrongClient → BLOCKED', () => {
    const r = evaluateBackupQualityGate({ wrongClient: true });
    assert.equal(r.status, BACKUP_GATE_STATUS.BLOCKED);
  });

  it('unencryptedSensitive → BLOCKED', () => {
    const r = evaluateBackupQualityGate({ unencryptedSensitive: true });
    assert.equal(r.status, BACKUP_GATE_STATUS.BLOCKED);
    assert.ok(r.blockReasons.includes(BACKUP_BLOCK_REASON.UNENCRYPTED_SENSITIVE_BACKUP));
  });

  it('8 block reasons defined', () => {
    assert.equal(Object.keys(BACKUP_BLOCK_REASON).length, 8);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESTORE POINT
// ─────────────────────────────────────────────────────────────────────────────
describe('RestorePoint', () => {
  it('creates available restore point', () => {
    const rp = createRestorePoint({ backupId: 'bk-001', clientId: 'c1' });
    assert.ok(rp.id);
    assert.equal(rp.status, RESTORE_POINT_STATUS.AVAILABLE);
    assert.equal(rp.isAvailable, true);
    assert.equal(rp.isReal, false);
  });

  it('VERIFIED point is also available', () => {
    const rp = createRestorePoint({ status: RESTORE_POINT_STATUS.VERIFIED, verified: true });
    assert.equal(rp.isAvailable, true);
    assert.equal(rp.verified, true);
  });

  it('BLOCKED point is not available', () => {
    const rp = createRestorePoint({ status: RESTORE_POINT_STATUS.BLOCKED });
    assert.equal(rp.isBlocked, true);
    assert.equal(rp.isAvailable, false);
  });

  it('5 restore point statuses defined', () => {
    assert.equal(Object.keys(RESTORE_POINT_STATUS).length, 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESTORE PLAN
// ─────────────────────────────────────────────────────────────────────────────
describe('RestorePlan', () => {
  it('defaults to DRY_RUN mode', () => {
    const p = createRestorePlan({});
    assert.equal(p.mode, RESTORE_MODE.DRY_RUN);
    assert.equal(p.isSafeMode, true);
    assert.equal(p.isReal, false);
  });

  it('FULL mode is not safe mode', () => {
    const p = createRestorePlan({ mode: RESTORE_MODE.FULL });
    assert.equal(p.isSafeMode, false);
  });

  it('approvalRequired defaults to true', () => {
    const p = createRestorePlan({});
    assert.equal(p.approvalRequired, true);
  });

  it('4 restore target environments defined', () => {
    assert.ok(RESTORE_TARGET_ENV.LOCAL);
    assert.ok(RESTORE_TARGET_ENV.PRODUCTION);
    assert.ok(RESTORE_TARGET_ENV.CONTAINER);
    assert.ok(RESTORE_TARGET_ENV.SERVERLESS);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PARTIAL RESTORE PLAN
// ─────────────────────────────────────────────────────────────────────────────
describe('PartialRestorePlan', () => {
  it('creates with selected scopes', () => {
    const p = createPartialRestorePlan({
      selectedScopes: [PARTIAL_RESTORE_SCOPE.CONFIG, PARTIAL_RESTORE_SCOPE.CRM],
      clientId:       'c1',
    });
    assert.equal(p.scopeCount, 2);
    assert.equal(p.dryRunOnly, true);
    assert.equal(p.isReal, false);
  });

  it('7 partial restore scopes defined', () => {
    assert.equal(Object.keys(PARTIAL_RESTORE_SCOPE).length, 7);
  });

  it('invalid scopes are filtered', () => {
    const p = createPartialRestorePlan({ selectedScopes: ['CONFIG', 'INVALID'] });
    assert.equal(p.scopeCount, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FULL RESTORE PLAN
// ─────────────────────────────────────────────────────────────────────────────
describe('FullRestorePlan', () => {
  it('creates with DRY_RUN default', () => {
    const p = createFullRestorePlan({});
    assert.equal(p.dryRunOnly, true);
    assert.equal(p.mode, 'DRY_RUN');
    assert.equal(p.isReal, false);
  });

  it('includes all 7 lifecycle steps', () => {
    const p = createFullRestorePlan({});
    assert.equal(p.steps.length, 7);
    assert.ok(p.steps.includes('PRE_CHECK'));
    assert.ok(p.steps.includes('ROLLBACK_OPTION'));
  });

  it('approvalRequired defaults to true', () => {
    const p = createFullRestorePlan({});
    assert.equal(p.approvalRequired, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATE RESTORE
// ─────────────────────────────────────────────────────────────────────────────
describe('simulateRestore', () => {
  it('basic dry-run with restorable items', () => {
    const manifest = createBackupManifest({
      items: [
        createBackupItem({ pathOrLogicalName: 'config.json', type: BACKUP_ITEM_TYPE.CONFIG_FILE }),
        createBackupItem({ pathOrLogicalName: 'crm-export.json', type: BACKUP_ITEM_TYPE.CRM_EXPORT }),
      ],
      clientId: 'c1',
    });
    const r = simulateRestore({ clientId: 'c1' }, manifest);
    assert.equal(r.mode, 'DRY_RUN');
    assert.ok(r.wouldRestore.length > 0);
    assert.equal(r.wouldBlock.length, 0);
    assert.equal(r.isReal, false);
    assert.equal(r.executed, false);
  });

  it('secret item in manifest → wouldBlock', () => {
    const manifest = createBackupManifest({
      items: [
        createBackupItem({ pathOrLogicalName: '.env.production', type: BACKUP_ITEM_TYPE.CONFIG_FILE }),
      ],
    });
    const r = simulateRestore({}, manifest);
    assert.ok(r.wouldBlock.length > 0);
    assert.equal(r.validationResult, 'BLOCKED');
    assert.equal(r.estimatedRisk, ESTIMATED_RISK.CRITICAL);
  });

  it('client mismatch → wouldBlock ALL', () => {
    const manifest = createBackupManifest({
      items: [createBackupItem({ pathOrLogicalName: 'data.json' })],
      clientId: 'client-a',
    });
    const r = simulateRestore({ clientId: 'client-b' }, manifest);
    assert.ok(r.wouldBlock.some(b => b.reason === 'CLIENT_MISMATCH'));
  });

  it('non-restorable items → wouldSkip', () => {
    const manifest = createBackupManifest({
      items: [
        createBackupItem({ pathOrLogicalName: 'read-only.json', restorable: false }),
      ],
    });
    const r = simulateRestore({}, manifest);
    assert.ok(r.wouldSkip.includes('read-only.json'));
  });

  it('scope filter skips non-selected items', () => {
    const manifest = createBackupManifest({
      items: [
        createBackupItem({ pathOrLogicalName: 'crm.json', type: BACKUP_ITEM_TYPE.CRM_EXPORT }),
        createBackupItem({ pathOrLogicalName: 'config.json', type: BACKUP_ITEM_TYPE.CONFIG_FILE }),
      ],
    });
    const r = simulateRestore({ selectedScopes: [BACKUP_ITEM_TYPE.CONFIG_FILE] }, manifest);
    assert.ok(r.wouldRestore.includes('config.json'));
    assert.ok(r.wouldSkip.includes('crm.json'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATE RESTORE PLAN
// ─────────────────────────────────────────────────────────────────────────────
describe('validateRestorePlan', () => {
  it('valid plan passes', () => {
    const plan     = createRestorePlan({ restorePoint: 'rp-001', clientId: 'c1', targetEnvironment: 'LOCAL' });
    const manifest = createBackupManifest({ clientId: 'c1' });
    const r = validateRestorePlan(plan, manifest);
    assert.equal(r.valid, true);
    assert.equal(r.isReal, false);
  });

  it('client mismatch → BLOCKED', () => {
    const plan     = createRestorePlan({ clientId: 'c1' });
    const manifest = createBackupManifest({ clientId: 'c2' });
    const r = validateRestorePlan(plan, manifest);
    assert.equal(r.blocked, true);
    assert.ok(r.failures.includes('CLIENT_MISMATCH'));
  });

  it('production without approval → BLOCKED', () => {
    const plan     = { ...createRestorePlan({ targetEnvironment: 'PRODUCTION' }), approvalRequired: false };
    const manifest = createBackupManifest({});
    const r = validateRestorePlan(plan, manifest);
    assert.equal(r.blocked, true);
    assert.ok(r.failures.includes('PRODUCTION_WITHOUT_APPROVAL'));
  });

  it('corrupted manifest → BLOCKED', () => {
    const plan     = createRestorePlan({ restorePoint: 'rp-001' });
    const manifest = { ...createBackupManifest({}), corrupted: true };
    const r = validateRestorePlan(plan, manifest);
    assert.equal(r.blocked, true);
    assert.ok(r.failures.includes('CORRUPTED_MANIFEST'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESTORE CONFLICT DETECTOR
// ─────────────────────────────────────────────────────────────────────────────
describe('RestoreConflictDetector', () => {
  it('no conflicts for clean restore', () => {
    const d = createRestoreConflictDetector();
    const r = d.detect({ clientId: 'c1', mode: 'DRY_RUN' }, { clientId: 'c1' });
    assert.equal(r.hasConflicts, false);
    assert.equal(r.isReal, false);
  });

  it('client conflict detected', () => {
    const d = createRestoreConflictDetector();
    const r = d.detect({ clientId: 'c1' }, { clientId: 'c2' });
    assert.equal(r.hasConflicts, true);
    assert.ok(r.conflicts.some(c => c.type === RESTORE_CONFLICT_TYPE.CLIENT_CONFLICT));
  });

  it('version conflict detected', () => {
    const d = createRestoreConflictDetector();
    const r = d.detect({ sourceVersion: '2.0.0' }, { version: '1.0.0' });
    assert.equal(r.hasConflicts, true);
    assert.ok(r.conflicts.some(c => c.type === RESTORE_CONFLICT_TYPE.VERSION_CONFLICT));
  });

  it('existing data conflict in FULL mode', () => {
    const d = createRestoreConflictDetector();
    const r = d.detect({ mode: 'FULL' }, { hasExistingData: true });
    assert.ok(r.conflicts.some(c => c.type === RESTORE_CONFLICT_TYPE.EXISTING_DATA_CONFLICT));
  });

  it('6 conflict types defined', () => {
    assert.equal(Object.keys(RESTORE_CONFLICT_TYPE).length, 6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESTORE CONFLICT POLICY
// ─────────────────────────────────────────────────────────────────────────────
describe('RestoreConflictPolicy', () => {
  it('client conflict → BLOCK (sensitive, no auto-merge)', () => {
    const p = createRestoreConflictPolicy();
    const r = p.resolve({ type: 'CLIENT_CONFLICT' });
    assert.equal(r.resolution, CONFLICT_RESOLUTION.BLOCK);
    assert.equal(r.isReal, false);
  });

  it('existing data conflict → BLOCK (sensitive)', () => {
    const p = createRestoreConflictPolicy();
    const r = p.resolve({ type: 'EXISTING_DATA_CONFLICT' });
    assert.equal(r.resolution, CONFLICT_RESOLUTION.BLOCK);
  });

  it('version conflict uses default resolution', () => {
    const p = createRestoreConflictPolicy({ defaultResolution: CONFLICT_RESOLUTION.REQUIRE_HUMAN });
    const r = p.resolve({ type: 'VERSION_CONFLICT' });
    assert.equal(r.resolution, CONFLICT_RESOLUTION.REQUIRE_HUMAN);
  });

  it('resolveAll processes array', () => {
    const p = createRestoreConflictPolicy();
    const results = p.resolveAll([
      { type: 'CLIENT_CONFLICT' },
      { type: 'VERSION_CONFLICT' },
    ]);
    assert.equal(results.length, 2);
  });

  it('4 resolution options defined', () => {
    assert.equal(Object.keys(CONFLICT_RESOLUTION).length, 4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRE-RESTORE SAFETY POLICY
// ─────────────────────────────────────────────────────────────────────────────
describe('PreRestoreSafetyPolicy', () => {
  it('DRY_RUN mode is always safe', () => {
    const p = createPreRestoreSafetyPolicy();
    const r = p.evaluate({ mode: 'DRY_RUN' });
    assert.equal(r.safe, true);
    assert.equal(r.isReal, false);
  });

  it('FULL mode requires all checks', () => {
    const p = createPreRestoreSafetyPolicy();
    const r = p.evaluate({ mode: 'FULL', currentStateSnapshotCreated: false });
    assert.equal(r.safe, false);
  });

  it('FULL mode with all checks passes', () => {
    const p = createPreRestoreSafetyPolicy();
    const r = p.evaluate({
      mode:                       'FULL',
      currentStateSnapshotCreated: true,
      currentStateIntegrityOk:     true,
      targetIsolated:              true,
      approvalGranted:             true,
    });
    assert.equal(r.safe, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ROLLBACK PLAN
// ─────────────────────────────────────────────────────────────────────────────
describe('RestoreRollbackPlan', () => {
  it('creates rollback plan', () => {
    const rp = createRestoreRollbackPlan({ preRestorePoint: 'rp-001', clientId: 'c1' });
    assert.equal(rp.preRestorePoint, 'rp-001');
    assert.equal(rp.status, ROLLBACK_STATUS.AVAILABLE);
    assert.equal(rp.steps.length, 6);
    assert.equal(rp.isReal, false);
  });

  it('includes health and integrity validation steps', () => {
    const rp = createRestoreRollbackPlan({});
    assert.ok(rp.steps.includes('VALIDATE_HEALTH'));
    assert.ok(rp.steps.includes('VALIDATE_INTEGRITY'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESTORE TEST POLICY
// ─────────────────────────────────────────────────────────────────────────────
describe('RestoreTestPolicy', () => {
  it('fully validated backup is trusted', () => {
    const p = createRestoreTestPolicy();
    const r = p.evaluate({
      integrityValidated: true,
      dryRunValidated:    true,
      lastTestedAt:       new Date().toISOString(),
    });
    assert.equal(r.trusted, true);
    assert.equal(r.isReal, false);
  });

  it('missing dry-run → not trusted', () => {
    const p = createRestoreTestPolicy();
    const r = p.evaluate({ integrityValidated: true, dryRunValidated: false, lastTestedAt: new Date().toISOString() });
    assert.equal(r.trusted, false);
    assert.ok(r.failures.includes('DRY_RUN_NOT_VALIDATED'));
  });

  it('never tested → NEVER_TESTED', () => {
    const p = createRestoreTestPolicy();
    const r = p.evaluate({ integrityValidated: true, dryRunValidated: true });
    assert.ok(r.failures.includes('NEVER_TESTED'));
  });

  it('stale test → RESTORE_TEST_STALE', () => {
    const p = createRestoreTestPolicy();
    const old = new Date(Date.now() - 200 * 3600000).toISOString();
    const r = p.evaluate({ integrityValidated: true, dryRunValidated: true, lastTestedAt: old });
    assert.ok(r.failures.includes('RESTORE_TEST_STALE'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DISASTER RECOVERY PROFILE
// ─────────────────────────────────────────────────────────────────────────────
describe('DisasterRecoveryProfile', () => {
  it('creates STANDARD profile', () => {
    const p = createDisasterRecoveryProfile({ criticality: DR_CRITICALITY.STANDARD });
    assert.equal(p.isConfigured, false);
    assert.equal(p.isReal, false);
  });

  it('CRITICAL criticality is flagged', () => {
    const p = createDisasterRecoveryProfile({ criticality: DR_CRITICALITY.CRITICAL });
    assert.equal(p.isCritical, true);
  });

  it('TESTED status is configured and tested', () => {
    const p = createDisasterRecoveryProfile({ status: DR_STATUS.TESTED });
    assert.equal(p.isConfigured, true);
    assert.equal(p.isTested, true);
  });

  it('4 criticality levels defined', () => {
    assert.equal(Object.keys(DR_CRITICALITY).length, 4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RECOVERY OBJECTIVE POLICY
// ─────────────────────────────────────────────────────────────────────────────
describe('RecoveryObjectivePolicy', () => {
  it('DAILY RPO/RTO', () => {
    const p = createRecoveryObjectivePolicy({ RPO: RECOVERY_OBJECTIVE.DAILY, RTO: RECOVERY_OBJECTIVE.DAILY });
    assert.equal(p.RPO, 'DAILY');
    assert.equal(p.isAmbitious, false);
    assert.ok(p.disclaimer);
    assert.equal(p.isReal, false);
  });

  it('NEAR_REALTIME is ambitious', () => {
    const p = createRecoveryObjectivePolicy({ RPO: RECOVERY_OBJECTIVE.NEAR_REALTIME_FOUNDATION });
    assert.equal(p.isAmbitious, true);
  });

  it('4 recovery objectives defined', () => {
    assert.equal(Object.keys(RECOVERY_OBJECTIVE).length, 4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RECOVERY DRILL
// ─────────────────────────────────────────────────────────────────────────────
describe('RecoveryDrill', () => {
  it('creates drill in PLANNED state', () => {
    const d = createRecoveryDrill({ clientId: 'c1', scope: ['CONFIG'] });
    assert.equal(d.status, DRILL_STATUS.PLANNED);
    assert.equal(d.passed, false);
    assert.equal(d.isReal, false);
  });

  it('PASSED drill has passed=true', () => {
    const d = createRecoveryDrill({ status: DRILL_STATUS.PASSED });
    assert.equal(d.passed, true);
  });

  it('4 drill statuses defined', () => {
    assert.equal(Object.keys(DRILL_STATUS).length, 4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RECOVERY READINESS SCORE
// ─────────────────────────────────────────────────────────────────────────────
describe('RecoveryReadinessScore', () => {
  it('perfect metrics → ready', () => {
    const r = computeRecoveryReadinessScore({});
    assert.equal(r.overall, 100);
    assert.equal(r.ready, true);
    assert.equal(r.grade, 'A');
    assert.equal(r.isReal, false);
  });

  it('zero freshness significantly lowers overall', () => {
    const r = computeRecoveryReadinessScore({ backupFreshness: 0 });
    assert.ok(r.overall < 90);
  });

  it('8 recovery factors present', () => {
    const r = computeRecoveryReadinessScore({});
    assert.equal(Object.keys(r.scores).length, 8);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RECOVERY QUALITY GATE
// ─────────────────────────────────────────────────────────────────────────────
describe('RecoveryQualityGate', () => {
  it('high score no issues → PASS', () => {
    const r = evaluateRecoveryQualityGate({ overallScore: 95 });
    assert.equal(r.status, RECOVERY_GATE_STATUS.PASS);
    assert.equal(r.isReal, false);
  });

  it('noValidRestorePoint → BLOCKED', () => {
    const r = evaluateRecoveryQualityGate({ noValidRestorePoint: true });
    assert.equal(r.status, RECOVERY_GATE_STATUS.BLOCKED);
    assert.ok(r.blockReasons.includes(RECOVERY_BLOCK_REASON.NO_VALID_RESTORE_POINT));
  });

  it('criticalSecretExposure → BLOCKED', () => {
    const r = evaluateRecoveryQualityGate({ criticalSecretExposure: true });
    assert.equal(r.status, RECOVERY_GATE_STATUS.BLOCKED);
  });

  it('corruptLatestBackup → BLOCKED', () => {
    const r = evaluateRecoveryQualityGate({ corruptLatestBackup: true });
    assert.equal(r.status, RECOVERY_GATE_STATUS.BLOCKED);
  });

  it('clientLeak → BLOCKED', () => {
    const r = evaluateRecoveryQualityGate({ clientLeak: true });
    assert.equal(r.status, RECOVERY_GATE_STATUS.BLOCKED);
  });

  it('restoreUnvalidated → BLOCKED', () => {
    const r = evaluateRecoveryQualityGate({ restoreUnvalidated: true });
    assert.equal(r.status, RECOVERY_GATE_STATUS.BLOCKED);
  });

  it('6 recovery block reasons defined', () => {
    assert.equal(Object.keys(RECOVERY_BLOCK_REASON).length, 6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CATALOGS
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupCatalog', () => {
  it('adds entry for correct client', () => {
    const c = createBackupCatalog({ clientId: 'c1' });
    const r = c.add({ backupId: 'bk-001', client: 'c1', scope: ['CONFIG'] });
    assert.equal(r.added, true);
    assert.equal(r.isReal, false);
  });

  it('rejects wrong client entry', () => {
    const c = createBackupCatalog({ clientId: 'c1' });
    const r = c.add({ backupId: 'bk-999', client: 'c2', scope: ['CONFIG'] });
    assert.equal(r.added, false);
    assert.equal(r.reason, 'CLIENT_MISMATCH');
  });

  it('lists only own client entries', () => {
    const c = createBackupCatalog({ clientId: 'c1' });
    c.add({ backupId: 'bk-001', client: 'c1' });
    const listing = c.list('c1');
    assert.equal(listing.count, 1);
  });

  it('find returns null for missing', () => {
    const c = createBackupCatalog({ clientId: 'c1' });
    assert.equal(c.find('missing'), null);
  });
});

describe('RestoreCatalog', () => {
  it('links restore point to backup', () => {
    const c = createRestoreCatalog({ clientId: 'c1' });
    c.add({ restorePointId: 'rp-001', backupId: 'bk-001', client: 'c1' });
    const found = c.findByBackup('bk-001');
    assert.equal(found.length, 1);
    assert.equal(found[0].restorePointId, 'rp-001');
  });

  it('rejects cross-client entries', () => {
    const c = createRestoreCatalog({ clientId: 'c1' });
    const r = c.add({ restorePointId: 'rp-999', backupId: 'bk-999', client: 'c2' });
    assert.equal(r.added, false);
  });

  it('lists for client', () => {
    const c = createRestoreCatalog({ clientId: 'c2' });
    c.add({ restorePointId: 'rp-004', backupId: 'bk-crm-001', client: 'c2' });
    const listing = c.listForClient('c2');
    assert.equal(listing.count, 1);
    assert.equal(listing.isReal, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT ENTRY
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupAuditEntry', () => {
  it('creates audit entry', () => {
    const e = createBackupAuditEntry({ action: AUDIT_ACTION.BACKUP_COMPLETED, backupId: 'bk-001' });
    assert.ok(e.id);
    assert.equal(e.action, 'BACKUP_COMPLETED');
    assert.equal(e.result, 'OK');
    assert.ok(e.timestamp);
    assert.equal(e.isReal, false);
  });

  it('unique IDs per entry', () => {
    const e1 = createBackupAuditEntry({});
    const e2 = createBackupAuditEntry({});
    assert.notEqual(e1.id, e2.id);
  });

  it('11+ audit actions defined', () => {
    assert.ok(Object.keys(AUDIT_ACTION).length >= 11);
  });

  it('3+ actor types defined', () => {
    assert.ok(Object.keys(AUDIT_ACTOR_TYPE).length >= 3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OBSERVABILITY BRIDGE
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupObservabilityBridge', () => {
  it('emits events', () => {
    const b = createBackupObservabilityBridge();
    b.emit(BACKUP_EVENT.BACKUP_COMPLETED, { backupId: 'bk-001' });
    b.emit(BACKUP_EVENT.BACKUP_COMPLETED, { backupId: 'bk-002' });
    assert.equal(b.getEvents().length, 2);
    assert.equal(b.isReal, false);
  });

  it('filters events by type', () => {
    const b = createBackupObservabilityBridge();
    b.emit(BACKUP_EVENT.BACKUP_COMPLETED, {});
    b.emit(BACKUP_EVENT.RESTORE_BLOCKED, {});
    const completed = b.getEventsOfType(BACKUP_EVENT.BACKUP_COMPLETED);
    assert.equal(completed.length, 1);
  });

  it('reset clears events', () => {
    const b = createBackupObservabilityBridge();
    b.emit(BACKUP_EVENT.BACKUP_PLANNED, {});
    b.reset();
    assert.equal(b.getEvents().length, 0);
  });

  it('10 backup events defined', () => {
    assert.equal(Object.keys(BACKUP_EVENT).length, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH BRIDGE
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupHealthBridge', () => {
  it('healthy system', () => {
    const b = createBackupHealthBridge();
    const r = b.getStatus({
      lastBackupStatus:   'COMPLETED',
      lastBackupAgeHours: 2,
      hasValidRestorePoint: true,
      integrityState:     'VALID',
    });
    assert.equal(r.overallHealth, BACKUP_HEALTH_STATE.HEALTHY);
    assert.equal(r.recoveryRisk, 'LOW');
    assert.equal(r.isReal, false);
  });

  it('no valid restore point → CRITICAL', () => {
    const b = createBackupHealthBridge();
    const r = b.getStatus({ hasValidRestorePoint: false });
    assert.equal(r.overallHealth, BACKUP_HEALTH_STATE.CRITICAL);
    assert.equal(r.recoveryRisk, 'HIGH');
  });

  it('4 health states defined', () => {
    assert.equal(Object.keys(BACKUP_HEALTH_STATE).length, 4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CICD BRIDGE
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupCICDBridge', () => {
  it('all checks pass', () => {
    const b = createBackupCICDBridge();
    const r = b.runGate({});
    assert.equal(r.pass, true);
    assert.equal(r.blocked.length, 0);
    assert.equal(r.isReal, false);
  });

  it('failed secret exclusion blocks', () => {
    const b = createBackupCICDBridge();
    const r = b.runGate({ secretExclusionPass: false });
    assert.equal(r.pass, false);
    assert.ok(r.blocked.includes(BACKUP_CICD_CHECK.SECRET_EXCLUSION_PASS));
  });

  it('5 CI/CD checks defined', () => {
    assert.equal(Object.keys(BACKUP_CICD_CHECK).length, 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION PIPELINE BRIDGE
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupProductionPipelineBridge', () => {
  it('not ready without backup policy', () => {
    const b = createBackupProductionPipelineBridge();
    const r = b.checkProductionReadiness({});
    assert.equal(r.ready, false);
    assert.equal(r.isReal, false);
  });

  it('ready with all checks passing', () => {
    const b = createBackupProductionPipelineBridge();
    const r = b.checkProductionReadiness({
      backupPolicyConfigured:   true,
      restorePathDefined:       true,
      integrityValidationAvail: true,
      lastBackupAgeHours:       2,
    });
    assert.equal(r.ready, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DOCKER ENV BRIDGE
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupDockerEnvBridge', () => {
  it('LOCAL target is isolated', () => {
    const b = createBackupDockerEnvBridge();
    const r = b.declareTarget(RESTORE_RUNTIME.LOCAL);
    assert.equal(r.isolated, true);
    assert.equal(r.safeForDryRun, true);
    assert.equal(r.isReal, false);
  });

  it('PRODUCTION in DRY_RUN mode is allowed', () => {
    const b = createBackupDockerEnvBridge();
    const r = b.validateRuntimeForRestore('PRODUCTION', 'DRY_RUN');
    assert.equal(r.allowed, true);
  });

  it('PRODUCTION in FULL mode requires human approval', () => {
    const b = createBackupDockerEnvBridge();
    const r = b.validateRuntimeForRestore('PRODUCTION', 'FULL');
    assert.equal(r.allowed, false);
    assert.equal(r.reason, 'PRODUCTION_REQUIRES_HUMAN_APPROVAL');
  });

  it('5 restore runtimes defined', () => {
    assert.equal(Object.keys(RESTORE_RUNTIME).length, 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MCP BRIDGE
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupMCPBridge', () => {
  it('READ_METADATA is allowed without approval', () => {
    const b = createBackupMCPBridge();
    const r = b.authorize(BACKUP_MCP_OPERATION.READ_METADATA);
    assert.equal(r.allowed, true);
    assert.equal(r.requiresHuman, false);
    assert.equal(r.isReal, false);
  });

  it('RESTORE_BACKUP without approval is blocked', () => {
    const b = createBackupMCPBridge();
    const r = b.authorize(BACKUP_MCP_OPERATION.RESTORE_BACKUP);
    assert.equal(r.allowed, false);
    assert.equal(r.requiresHuman, true);
    assert.equal(r.reason, 'HUMAN_APPROVAL_REQUIRED');
  });

  it('RESTORE_BACKUP with approval is allowed', () => {
    const b = createBackupMCPBridge();
    const r = b.authorize(BACKUP_MCP_OPERATION.RESTORE_BACKUP, { humanApproved: true });
    assert.equal(r.allowed, true);
  });

  it('5 MCP operations defined', () => {
    assert.equal(Object.keys(BACKUP_MCP_OPERATION).length, 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-AGENT BRIDGE
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupMultiagentBridge', () => {
  it('INSPECT_HEALTH allowed for agents', () => {
    const b = createBackupMultiagentBridge();
    const r = b.authorize('agent-1', AGENT_BACKUP_PERMISSION.INSPECT_HEALTH);
    assert.equal(r.allowed, true);
    assert.equal(r.requiresHuman, false);
    assert.equal(r.isReal, false);
  });

  it('PREPARE_RESTORE_PLAN allowed for agents', () => {
    const b = createBackupMultiagentBridge();
    const r = b.authorize('agent-1', AGENT_BACKUP_PERMISSION.PREPARE_RESTORE_PLAN);
    assert.equal(r.allowed, true);
  });

  it('EXECUTE_RESTORE without approval is blocked', () => {
    const b = createBackupMultiagentBridge();
    const r = b.authorize('agent-1', AGENT_BACKUP_PERMISSION.EXECUTE_RESTORE);
    assert.equal(r.allowed, false);
    assert.equal(r.requiresHuman, true);
  });

  it('DELETE_BACKUP without approval is blocked', () => {
    const b = createBackupMultiagentBridge();
    const r = b.authorize('agent-1', AGENT_BACKUP_PERMISSION.DELETE_BACKUP);
    assert.equal(r.allowed, false);
  });

  it('EXECUTE_RESTORE with human approval is allowed', () => {
    const b = createBackupMultiagentBridge();
    const r = b.authorize('agent-1', AGENT_BACKUP_PERMISSION.EXECUTE_RESTORE, { humanApproved: true });
    assert.equal(r.allowed, true);
  });

  it('6 agent permissions defined', () => {
    assert.equal(Object.keys(AGENT_BACKUP_PERMISSION).length, 6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GOOD BACKUP FIXTURES
// ─────────────────────────────────────────────────────────────────────────────
describe('Good Backup Fixtures', () => {
  it('has 8 good backup fixtures', () => {
    assert.equal(GOOD_BACKUP_FIXTURES.length, 8);
  });

  it('all fixtures are not real', () => {
    assert.ok(GOOD_BACKUP_FIXTURES.every(f => f.isReal === false));
  });

  it('all have COMPLETED status', () => {
    assert.ok(GOOD_BACKUP_FIXTURES.every(f => f.status === 'COMPLETED'));
  });

  it('all have VALID integrity', () => {
    assert.ok(GOOD_BACKUP_FIXTURES.every(f => f.integrity === 'VALID'));
  });

  it('all are restoreReady', () => {
    assert.ok(GOOD_BACKUP_FIXTURES.every(f => f.restoreReady === true));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GOOD RESTORE FIXTURES
// ─────────────────────────────────────────────────────────────────────────────
describe('Good Restore Fixtures', () => {
  it('has 8 restore fixtures', () => {
    assert.equal(GOOD_RESTORE_FIXTURES.length, 8);
  });

  it('all fixtures are not real', () => {
    assert.ok(GOOD_RESTORE_FIXTURES.every(f => f.isReal === false));
  });

  it('all have valid restore point IDs', () => {
    assert.ok(GOOD_RESTORE_FIXTURES.every(f => f.id?.startsWith('rp-')));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FAILURE FIXTURES
// ─────────────────────────────────────────────────────────────────────────────
describe('Failure Backup Fixtures', () => {
  it('has 13 failure fixtures', () => {
    assert.equal(FAILURE_BACKUP_FIXTURES.length, 13);
  });

  it('all failures are not real', () => {
    assert.ok(FAILURE_BACKUP_FIXTURES.every(f => f.isReal === false));
  });

  it('secret fixtures are BLOCKED', () => {
    const secretFixtures = FAILURE_BACKUP_FIXTURES.filter(f => f.blockReason === 'SECRET_INCLUDED');
    assert.ok(secretFixtures.length >= 2);
    assert.ok(secretFixtures.every(f => f.status === 'BLOCKED'));
  });

  it('corrupt fixture detected by INTEGRITY_VALIDATOR', () => {
    const corrupt = FAILURE_BACKUP_FIXTURES.find(f => f.id === 'fail-corrupt-001');
    assert.ok(corrupt);
    assert.equal(corrupt.detectedBy, 'INTEGRITY_VALIDATOR');
  });

  it('all 13 failure scenarios have a blockReason or are FAILED/BLOCKED', () => {
    assert.ok(FAILURE_BACKUP_FIXTURES.every(f => f.blockReason || f.status === 'FAILED' || f.status === 'BLOCKED' || f.status === 'EXPIRED'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-TENANT FIXTURES
// ─────────────────────────────────────────────────────────────────────────────
describe('Multi-Tenant Fixtures — CLIENT ISOLATION', () => {
  it('client A has isolated catalog', () => {
    assert.equal(MULTI_TENANT_FIXTURES.clientA.clientId, 'client-a');
    assert.ok(MULTI_TENANT_FIXTURES.clientA.catalog.length > 0);
  });

  it('client B has isolated catalog', () => {
    assert.equal(MULTI_TENANT_FIXTURES.clientB.clientId, 'client-b');
    assert.ok(MULTI_TENANT_FIXTURES.clientB.catalog.length > 0);
  });

  it('4 cross-tenant attempts all blocked (CLIENT_ISOLATION=100%)', () => {
    const attempts = MULTI_TENANT_FIXTURES.crossTenantAttempts;
    assert.equal(attempts.length, 4);
    assert.ok(attempts.every(a => a.blocked === true));
  });

  it('all cross-tenant attempts are not real', () => {
    assert.ok(MULTI_TENANT_FIXTURES.crossTenantAttempts.every(a => a.isReal === false));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RECOVERY DRILL FIXTURES
// ─────────────────────────────────────────────────────────────────────────────
describe('Recovery Drill Fixtures', () => {
  it('has 4 recovery drills', () => {
    assert.equal(RECOVERY_DRILL_FIXTURES.length, 4);
  });

  it('includes PASSED, WARNING, and FAILED states', () => {
    const statuses = RECOVERY_DRILL_FIXTURES.map(d => d.status);
    assert.ok(statuses.includes('PASSED'));
    assert.ok(statuses.includes('WARNING'));
    assert.ok(statuses.includes('FAILED'));
  });

  it('all drills are not real', () => {
    assert.ok(RECOVERY_DRILL_FIXTURES.every(d => d.isReal === false));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FACTORY REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
describe('BackupRestore Registry', () => {
  it('has correct ADV reference', () => {
    assert.equal(BACKUP_RESTORE_REGISTRY.adv, 'ADV-18');
    assert.equal(BACKUP_RESTORE_REGISTRY.status, '100_PERCENT');
  });

  it('has 50+ modules', () => {
    assert.ok(BACKUP_RESTORE_REGISTRY.modules.length >= 50);
  });

  it('guardrails are all set', () => {
    const g = BACKUP_RESTORE_REGISTRY.guardrails;
    assert.equal(g.NO_REAL_BACKUP, true);
    assert.equal(g.NO_REAL_RESTORE, true);
    assert.equal(g.NO_REAL_DELETE, true);
    assert.equal(g.CLIENT_ISOLATION_ENFORCED, true);
    assert.equal(g.REAL_RESTORE_REQUIRES_HUMAN, true);
  });

  it('has key capabilities list', () => {
    assert.ok(BACKUP_RESTORE_REGISTRY.keyCapabilities.length >= 30);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// META / GUARDRAILS
// ─────────────────────────────────────────────────────────────────────────────
describe('ADV-18 Meta Guardrails', () => {
  it('BACKUP_ENGINE_VERSION is set', () => {
    assert.equal(BACKUP_ENGINE_VERSION, '1.0.0');
  });

  it('ADV18_STATUS is 100_PERCENT', () => {
    assert.equal(ADV18_STATUS, '100_PERCENT');
  });

  it('NO_REAL_BACKUP guardrail active', () => {
    assert.equal(BACKUP_GUARDRAILS.NO_REAL_BACKUP, true);
  });

  it('NO_REAL_RESTORE guardrail active', () => {
    assert.equal(BACKUP_GUARDRAILS.NO_REAL_RESTORE, true);
  });

  it('NO_REAL_DELETE guardrail active', () => {
    assert.equal(BACKUP_GUARDRAILS.NO_REAL_DELETE, true);
  });

  it('SECRET_EXCLUSION_ENFORCED guardrail active', () => {
    assert.equal(BACKUP_GUARDRAILS.SECRET_EXCLUSION_ENFORCED, true);
  });

  it('CLIENT_ISOLATION_ENFORCED guardrail active', () => {
    assert.equal(BACKUP_GUARDRAILS.CLIENT_ISOLATION_ENFORCED, true);
  });

  it('REAL_RESTORE_REQUIRES_HUMAN guardrail active', () => {
    assert.equal(BACKUP_GUARDRAILS.REAL_RESTORE_REQUIRES_HUMAN, true);
  });

  it('CROSS_CLIENT_BLOCKED guardrail active', () => {
    assert.equal(BACKUP_GUARDRAILS.CROSS_CLIENT_BLOCKED, true);
  });

  it('ENCRYPTION_DOWNGRADE_BLOCKED guardrail active', () => {
    assert.equal(BACKUP_GUARDRAILS.ENCRYPTION_DOWNGRADE_BLOCKED, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// END-TO-END: FULL BACKUP → VALIDATE → RESTORE DRY-RUN FLOW
// ─────────────────────────────────────────────────────────────────────────────
describe('E2E: Full Backup → Integrity → Restore Dry-Run', () => {
  it('complete safe pipeline passes all gates', () => {
    // 1. Create scope
    const scope = createBackupScope({ scopes: ['CONFIG', 'BUSINESS_TRUTH'], clientId: 'c1' });
    assert.equal(scope.excludeSecrets, true);

    // 2. Create items (no secrets)
    const configItem = createBackupItem({ type: BACKUP_ITEM_TYPE.CONFIG_FILE, pathOrLogicalName: 'config.json' });
    const btItem     = createBackupItem({ type: BACKUP_ITEM_TYPE.BUSINESS_TRUTH, pathOrLogicalName: 'bt-snapshot.json' });

    // 3. Check secret exclusion
    const secretPolicy = createBackupSecretExclusionPolicy();
    assert.equal(secretPolicy.inspect('config.json').safe, true);
    assert.equal(secretPolicy.inspect('bt-snapshot.json').safe, true);

    // 4. Build manifest
    const checksum = createBackupIntegrityChecksum();
    const cs = checksum.compute('backup-001', '1.0.0', 2);
    const manifest = createBackupManifest({
      items:    [configItem, btItem],
      checksums: { 'config.json': cs.value },
      clientId:  'c1',
      scope:     scope.scopes,
    });

    // 5. Validate integrity
    const integrity = validateBackupIntegrity(manifest, { expectedClientId: 'c1' });
    assert.equal(integrity.result, INTEGRITY_RESULT.VALID);

    // 6. Quality score + gate
    const score = computeBackupQualityScore({});
    const gate  = evaluateBackupQualityGate({ overallScore: score.overall });
    assert.equal(gate.status, BACKUP_GATE_STATUS.PASS);

    // 7. Restore point + dry-run
    const rp   = createRestorePoint({ backupId: 'bk-001', clientId: 'c1' });
    const plan = createRestorePlan({ restorePoint: rp, clientId: 'c1', mode: RESTORE_MODE.DRY_RUN });
    const sim  = simulateRestore(plan, manifest);
    assert.equal(sim.mode, 'DRY_RUN');
    assert.ok(sim.wouldRestore.length > 0);
    assert.equal(sim.wouldBlock.length, 0);
    assert.equal(sim.estimatedRisk, ESTIMATED_RISK.LOW);

    // 8. Audit
    const audit = createBackupAuditEntry({ action: AUDIT_ACTION.RESTORE_DRY_RUN_COMPLETED, backupId: 'bk-001' });
    assert.equal(audit.action, 'RESTORE_DRY_RUN_COMPLETED');
    assert.equal(audit.isReal, false);
  });

  it('secret in backup → blocked at every gate', () => {
    const secretItem = createBackupItem({ pathOrLogicalName: '.env.production', type: BACKUP_ITEM_TYPE.CONFIG_FILE });
    const manifest   = createBackupManifest({ items: [secretItem] });

    // Quality gate blocks
    const gate = evaluateBackupQualityGate({ secretIncluded: true });
    assert.equal(gate.status, BACKUP_GATE_STATUS.BLOCKED);

    // Integrity validator blocks
    const integrity = validateBackupIntegrity(manifest);
    assert.equal(integrity.result, INTEGRITY_RESULT.BLOCKED);

    // Simulate restore blocks
    const sim = simulateRestore({}, manifest);
    assert.equal(sim.validationResult, 'BLOCKED');
  });
});
