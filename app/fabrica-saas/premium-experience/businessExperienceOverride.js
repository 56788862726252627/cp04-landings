// Business Experience Override — ADV-07

export const BUSINESS_PROFILE = Object.freeze({
  PREMIUM_URBAN:   'PREMIUM_URBAN',
  FAMILY_LOCAL:    'FAMILY_LOCAL',
  EMERGENCY_24H:   'EMERGENCY_24H',
  BUDGET_ACCESS:   'BUDGET_ACCESS',
  SPECIALIST:      'SPECIALIST',
  BOUTIQUE:        'BOUTIQUE',
});

const PROFILE_OVERRIDES = Object.freeze({
  PREMIUM_URBAN: {
    visualDensity:   'SPACIOUS',
    motionLevel:     'STANDARD',
    brandPersonality: ['PREMIUM', 'MODERN'],
    surfaceProfile:  'PREMIUM_GLASS',
    contentTone:     'ASPIRATIONAL',
    heroPattern:     'PREMIUM',
    ctaPattern:      'CONVERSION_FOCUSED',
  },
  FAMILY_LOCAL: {
    visualDensity:   'BALANCED',
    motionLevel:     'LOW',
    brandPersonality: ['WARM', 'TRUSTED'],
    surfaceProfile:  'WARM_LAYERED',
    contentTone:     'WARM_PROFESSIONAL',
    heroPattern:     'LOCAL',
    ctaPattern:      'TRUST_PRIMARY',
  },
  EMERGENCY_24H: {
    visualDensity:   'COMPACT',
    motionLevel:     'NONE',
    brandPersonality: ['TRUSTED', 'CLINICAL'],
    surfaceProfile:  'HIGH_CONTRAST',
    contentTone:     'CLINICAL',
    heroPattern:     'MINIMAL',
    ctaPattern:      'SINGLE_ACTION',
  },
  SPECIALIST: {
    visualDensity:   'BALANCED',
    motionLevel:     'LOW',
    brandPersonality: ['PROFESSIONAL', 'TRUSTED'],
    surfaceProfile:  'LAYERED',
    contentTone:     'FORMAL_PRECISE',
    heroPattern:     'TRUST',
    ctaPattern:      'TRUST_PRIMARY',
  },
  BOUTIQUE: {
    visualDensity:   'SPACIOUS',
    motionLevel:     'RICH',
    brandPersonality: ['LUXURY', 'PREMIUM'],
    surfaceProfile:  'PREMIUM_GLASS',
    contentTone:     'ASPIRATIONAL',
    heroPattern:     'PREMIUM',
    ctaPattern:      'CONVERSION_FOCUSED',
  },
});

export function createBusinessOverride(businessProfile = BUSINESS_PROFILE.FAMILY_LOCAL) {
  const overrides = PROFILE_OVERRIDES[businessProfile] ?? PROFILE_OVERRIDES.FAMILY_LOCAL;
  return Object.freeze({ businessProfile, overrides, isReal: false });
}

export function applyOverrides(baseProfile = {}, businessOverride = {}) {
  const { overrides = {} } = businessOverride;
  return Object.freeze({ ...baseProfile, ...overrides, overrideApplied: businessOverride.businessProfile ?? 'NONE' });
}

export const BUSINESS_EXPERIENCE_OVERRIDE_VERSION = '1.0.0';
