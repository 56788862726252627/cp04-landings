/* eslint-disable no-unused-vars */
// Lip Sync Provider — ADV-13

export const LIP_SYNC_STATUS = Object.freeze({
  AVAILABLE:       'AVAILABLE',
  CONFIG_REQUIRED: 'CONFIG_REQUIRED',
  FIXTURE_ONLY:    'FIXTURE_ONLY',
});

export const FixtureLipSyncProvider = Object.freeze({
  id:     'fixture_lipsync',
  name:   'Fixture LipSync Provider',
  status: LIP_SYNC_STATUS.FIXTURE_ONLY,
  sync(params) {
    return Object.freeze({
      assetRef:    `fixture://lipsync/${params.avatarAssetRef ?? 'default'}/synced.mp4`,
      syncQuality: 'SIMULATED',
      isReal:      false,
    });
  },
});

export const LocalLipSyncProviderFoundation = Object.freeze({
  id:     'local_lipsync_foundation',
  name:   'Local LipSync Provider (Foundation)',
  status: LIP_SYNC_STATUS.CONFIG_REQUIRED,
  sync(params) {
    throw new Error('NO_REAL_LIPSYNC=SI — local foundation not configured');
  },
});

export const ExternalLipSyncProviderFoundation = Object.freeze({
  id:     'external_lipsync_foundation',
  name:   'External LipSync Provider (Foundation)',
  status: LIP_SYNC_STATUS.CONFIG_REQUIRED,
  sync(params) {
    throw new Error('NO_REAL_LIPSYNC=SI — external provider not configured');
  },
});

export const LIP_SYNC_PROVIDER_VERSION = '1.0.0';
