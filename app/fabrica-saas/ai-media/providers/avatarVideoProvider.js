/* eslint-disable no-unused-vars */
// Avatar Video Provider — ADV-13

export const AVATAR_PROVIDER_STATUS = Object.freeze({
  AVAILABLE:        'AVAILABLE',
  CONFIG_REQUIRED:  'CONFIG_REQUIRED',
  FIXTURE_ONLY:     'FIXTURE_ONLY',
  UNAVAILABLE:      'UNAVAILABLE',
});

export const FixtureAvatarProvider = Object.freeze({
  id:     'fixture_avatar',
  name:   'Fixture Avatar Provider',
  status: AVATAR_PROVIDER_STATUS.FIXTURE_ONLY,
  supportsSynthetic:   true,
  supportsDigitalTwin: false,
  maxResolution:       '1920x1080',
  generate(params) {
    return Object.freeze({
      assetRef:   `fixture://avatar/${params.avatarId ?? 'default'}/output.mp4`,
      durationMs: (params.durationSeconds ?? 30) * 1000,
      resolution: '1920x1080',
      isReal:     false,
    });
  },
});

export const LocalAvatarProviderFoundation = Object.freeze({
  id:     'local_avatar_foundation',
  name:   'Local Avatar Provider (Foundation)',
  status: AVATAR_PROVIDER_STATUS.CONFIG_REQUIRED,
  supportsSynthetic:   true,
  supportsDigitalTwin: false,
  generate(params) {
    throw new Error('NO_REAL_AVATAR_PROVIDER=SI — local foundation not configured');
  },
});

export const ExternalAvatarProviderFoundation = Object.freeze({
  id:     'external_avatar_foundation',
  name:   'External Avatar Provider (Foundation)',
  status: AVATAR_PROVIDER_STATUS.CONFIG_REQUIRED,
  supportsSynthetic:   true,
  supportsDigitalTwin: true,
  generate(params) {
    throw new Error('NO_REAL_AVATAR_PROVIDER=SI — external provider not configured');
  },
});

export const AVATAR_VIDEO_PROVIDER_VERSION = '1.0.0';
