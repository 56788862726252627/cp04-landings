// Media Identity Consent — ADV-13

export const CONSENT_MEDIA_TYPE = Object.freeze({
  AVATAR:  'AVATAR',
  VOICE:   'VOICE',
  IMAGE:   'IMAGE',
  VIDEO:   'VIDEO',
});

export function createMediaIdentityConsent(config = {}) {
  if (!config.subjectId) throw new Error('MediaIdentityConsent requires subjectId');
  return Object.freeze({
    subjectId:         config.subjectId,
    mediaType:         config.mediaType          ?? CONSENT_MEDIA_TYPE.AVATAR,
    avatarConsent:     config.avatarConsent       ?? false,
    voiceConsent:      config.voiceConsent        ?? false,
    commercialUse:     config.commercialUse       ?? false,
    channelsAllowed:   Object.freeze(config.channelsAllowed ?? []),
    expiresAt:         config.expiresAt           ?? null,
    revoked:           config.revoked             ?? false,
    evidenceReference: config.evidenceReference   ?? null,
    isReal: false,
  });
}

export function isConsentValid(consent) {
  if (!consent)             return false;
  if (consent.revoked)      return false;
  if (consent.expiresAt && Date.now() > consent.expiresAt) return false;
  return true;
}

export function checkAvatarConsent(consent) {
  if (!isConsentValid(consent)) return Object.freeze({ allowed: false, reason: 'CONSENT_INVALID', isReal: false });
  if (!consent.avatarConsent)   return Object.freeze({ allowed: false, reason: 'AVATAR_CONSENT_NOT_GRANTED', isReal: false });
  return Object.freeze({ allowed: true, isReal: false });
}

export function checkVoiceConsent(consent) {
  if (!isConsentValid(consent)) return Object.freeze({ allowed: false, reason: 'CONSENT_INVALID', isReal: false });
  if (!consent.voiceConsent)    return Object.freeze({ allowed: false, reason: 'VOICE_CONSENT_NOT_GRANTED', isReal: false });
  return Object.freeze({ allowed: true, isReal: false });
}

export const MEDIA_IDENTITY_CONSENT_VERSION = '1.0.0';
