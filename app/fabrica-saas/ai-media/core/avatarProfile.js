// Avatar Profile — ADV-13

export const AVATAR_TYPE = Object.freeze({
  SYNTHETIC:               'SYNTHETIC',
  BRAND_CHARACTER:         'BRAND_CHARACTER',
  AUTHORIZED_DIGITAL_TWIN: 'AUTHORIZED_DIGITAL_TWIN',
  GENERIC_PRESENTER:       'GENERIC_PRESENTER',
});

export const AVATAR_STYLE = Object.freeze({
  REALISTIC:    'REALISTIC',
  ILLUSTRATED:  'ILLUSTRATED',
  ANIMATED:     'ANIMATED',
  SILHOUETTE:   'SILHOUETTE',
});

export const CONSENT_STATUS = Object.freeze({
  GRANTED:     'GRANTED',
  NOT_REQUIRED:'NOT_REQUIRED',
  PENDING:     'PENDING',
  REVOKED:     'REVOKED',
  UNKNOWN:     'UNKNOWN',
});

export function createAvatarProfile(config = {}) {
  if (!config.id)   throw new Error('AvatarProfile requires id');
  if (!config.type) throw new Error('AvatarProfile requires type');
  return Object.freeze({
    id:                 config.id,
    type:               config.type,
    style:              config.style             ?? AVATAR_STYLE.REALISTIC,
    ageBand:            config.ageBand           ?? 'ADULT',
    presentation:       config.presentation      ?? 'PROFESSIONAL',
    wardrobeStyle:      config.wardrobeStyle     ?? 'BUSINESS_CASUAL',
    backgroundStyle:    config.backgroundStyle   ?? 'NEUTRAL',
    cameraStyle:        config.cameraStyle       ?? 'MEDIUM_SHOT',
    framing:            config.framing           ?? 'UPPER_BODY',
    gestureLevel:       config.gestureLevel      ?? 'MODERATE',
    expressionLevel:    config.expressionLevel   ?? 'NATURAL',
    brandFit:           config.brandFit          ?? null,
    consentStatus:      config.consentStatus     ?? CONSENT_STATUS.NOT_REQUIRED,
    sourceType:         config.sourceType        ?? 'SYNTHETIC',
    provider:           config.provider          ?? 'fixture',
    isRealPerson:       config.isRealPerson      ?? false,
    identityDisclosure: config.identityDisclosure ?? 'AI_GENERATED',
    isReal: false,
  });
}

export const AVATAR_PROFILE_VERSION = '1.0.0';
