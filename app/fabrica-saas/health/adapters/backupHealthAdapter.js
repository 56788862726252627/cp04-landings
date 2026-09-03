// Backup Health Adapter — ADV-20 (connects ADV-18)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export const BACKUP_FRESHNESS = Object.freeze({
  FRESH:   'FRESH',
  AGING:   'AGING',
  STALE:   'STALE',
  UNKNOWN: 'UNKNOWN',
});

export function createBackupHealthAdapter(config = {}) {
  const {
    lastBackupStatus   = 'UNKNOWN',
    backupAgeHours     = null,
    integrityVerified  = false,
    restoreReadiness   = false,
    rollbackReady      = false,
    encrypted          = true,
    clientIsolated     = true,
    clientId           = null,
    environment        = 'LOCAL',
  } = config;

  let freshness;
  if (backupAgeHours === null)   freshness = BACKUP_FRESHNESS.UNKNOWN;
  else if (backupAgeHours < 24)  freshness = BACKUP_FRESHNESS.FRESH;
  else if (backupAgeHours < 72)  freshness = BACKUP_FRESHNESS.AGING;
  else                           freshness = BACKUP_FRESHNESS.STALE;

  const blockers = [];
  if (!encrypted)       blockers.push('BACKUP_NOT_ENCRYPTED');
  if (!clientIsolated)  blockers.push('BACKUP_NOT_CLIENT_ISOLATED');

  let status, score;
  if (blockers.length > 0) {
    status = HEALTH_STATUS.BLOCKED;
    score = 0;
  } else if (lastBackupStatus === 'FAILED' || freshness === BACKUP_FRESHNESS.STALE) {
    status = HEALTH_STATUS.CRITICAL;
    score = 20;
  } else if (freshness === BACKUP_FRESHNESS.AGING || !restoreReadiness) {
    status = HEALTH_STATUS.WARNING;
    score = 65;
  } else if (freshness === BACKUP_FRESHNESS.UNKNOWN) {
    status = HEALTH_STATUS.UNKNOWN;
    score = 40;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = restoreReadiness && rollbackReady ? 100 : 85;
  }

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.BACKUPS,
    status,
    score,
    source: 'ADV-18',
    clientId,
    environment,
    message: blockers.length > 0 ? `Backup blocked: ${blockers[0]}` : `Backup ${freshness} (${lastBackupStatus})`,
    evidence: blockers,
    recommendedAction: blockers[0] ? `Fix ${blockers[0]}` :
      freshness === BACKUP_FRESHNESS.STALE ? 'Run backup immediately' : null,
  });

  return Object.freeze({
    lastBackupStatus,
    freshness,
    integrityVerified,
    restoreReadiness,
    rollbackReady,
    encrypted,
    clientIsolated,
    blockers: Object.freeze([...blockers]),
    status,
    score,
    signal,
    adv18Connected: true,
    isReal: false,
  });
}

export const BACKUP_HEALTH_ADAPTER_VERSION = '1.0.0';
