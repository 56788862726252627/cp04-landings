// Media Privacy Policy — ADV-13

export const PRIVACY_PRINCIPLE = Object.freeze({
  MINIMUM_DATA:           'MINIMUM_DATA',
  CONSENT_REQUIRED:       'CONSENT_REQUIRED',
  CLIENT_ISOLATION:       'CLIENT_ISOLATION',
  RETENTION_LIMITED:      'RETENTION_LIMITED',
  NO_BIOMETRIC_REUSE:     'NO_BIOMETRIC_REUSE',
  NO_RAW_VOICE_CLONE:     'NO_RAW_VOICE_CLONE',
  NO_HIDDEN_TRAINING:     'NO_HIDDEN_TRAINING',
});

export function validateMediaPrivacy(project = {}) {
  const violations = [];
  if (project.avatarProfile?.isRealPerson && !project.avatarProfile?.consentStatus !== 'GRANTED') {
    violations.push(PRIVACY_PRINCIPLE.CONSENT_REQUIRED);
  }
  if (project.voiceProfile?.consentRequired && project.voiceProfile?.consentStatus !== 'GRANTED') {
    violations.push(PRIVACY_PRINCIPLE.CONSENT_REQUIRED);
  }
  return Object.freeze({
    passed:     violations.length === 0,
    violations: Object.freeze(violations),
    principles: Object.freeze(Object.values(PRIVACY_PRINCIPLE)),
    isReal:     false,
  });
}

export const MEDIA_PRIVACY_POLICY_VERSION = '1.0.0';
