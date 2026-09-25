// Media Rights Policy — ADV-13

export const RIGHTS_ASSET_TYPE = Object.freeze({
  AVATAR: 'AVATAR', VOICE: 'VOICE', MUSIC: 'MUSIC',
  IMAGE:  'IMAGE',  VIDEO: 'VIDEO',
});

export const RIGHTS_STATUS = Object.freeze({
  CLEARED:        'CLEARED',
  NOT_CLEARED:    'NOT_CLEARED',
  SYNTHETIC_FREE: 'SYNTHETIC_FREE',
  UNKNOWN:        'UNKNOWN',
  REQUIRES_CHECK: 'REQUIRES_CHECK',
});

export function validateMediaRights(plan = {}) {
  const violations = [];
  if (plan.avatarRights === RIGHTS_STATUS.UNKNOWN)   violations.push('AVATAR_RIGHTS_UNKNOWN');
  if (plan.voiceRights  === RIGHTS_STATUS.UNKNOWN)   violations.push('VOICE_RIGHTS_UNKNOWN');
  if (plan.musicRights  === RIGHTS_STATUS.NOT_CLEARED) violations.push('MUSIC_NOT_CLEARED');
  if (plan.imageRights  === RIGHTS_STATUS.NOT_CLEARED) violations.push('IMAGE_NOT_CLEARED');
  if (plan.videoRights  === RIGHTS_STATUS.NOT_CLEARED) violations.push('VIDEO_NOT_CLEARED');
  if (plan.commercialUse && plan.avatarRights !== RIGHTS_STATUS.CLEARED &&
      plan.avatarRights !== RIGHTS_STATUS.SYNTHETIC_FREE) {
    violations.push('COMMERCIAL_USE_NOT_CLEARED');
  }
  return Object.freeze({ passed: violations.length === 0, violations: Object.freeze(violations), isReal: false });
}

export const MEDIA_RIGHTS_POLICY_VERSION = '1.0.0';
