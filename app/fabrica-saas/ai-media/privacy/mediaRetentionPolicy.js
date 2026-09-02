// Media Retention Policy — ADV-13

export const ASSET_LIFECYCLE_STAGE = Object.freeze({
  SOURCE:    'SOURCE',
  GENERATED: 'GENERATED',
  TEMPORARY: 'TEMPORARY',
  APPROVED:  'APPROVED',
  DELETED:   'DELETED',
});

export const RETENTION_DAYS = Object.freeze({
  [ASSET_LIFECYCLE_STAGE.SOURCE]:    90,
  [ASSET_LIFECYCLE_STAGE.GENERATED]: 30,
  [ASSET_LIFECYCLE_STAGE.TEMPORARY]: 1,
  [ASSET_LIFECYCLE_STAGE.APPROVED]:  365,
  [ASSET_LIFECYCLE_STAGE.DELETED]:   0,
});

export function createRetentionSchedule(assetId, stage) {
  const days = RETENTION_DAYS[stage];
  if (days === undefined) throw new Error(`Unknown lifecycle stage: ${stage}`);
  const expiresAt = days > 0 ? Date.now() + days * 86400000 : null;
  return Object.freeze({ assetId, stage, retentionDays: days, expiresAt, isReal: false });
}

export const MEDIA_RETENTION_POLICY_VERSION = '1.0.0';
