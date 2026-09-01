// Premium Experience Profile — ADV-07

export const BRAND_PERSONALITY = Object.freeze({
  PROFESSIONAL:  'PROFESSIONAL',
  WARM:          'WARM',
  PREMIUM:       'PREMIUM',
  MODERN:        'MODERN',
  CLINICAL:      'CLINICAL',
  SPORTY:        'SPORTY',
  TRUSTED:       'TRUSTED',
  LUXURY:        'LUXURY',
  PLAYFUL:       'PLAYFUL',
  MINIMAL:       'MINIMAL',
  TECH:          'TECH',
});

export const VISUAL_DENSITY = Object.freeze({
  COMPACT:   'COMPACT',
  BALANCED:  'BALANCED',
  SPACIOUS:  'SPACIOUS',
});

export const INTERACTION_LEVEL = Object.freeze({
  STATIC:     'STATIC',
  SUBTLE:     'SUBTLE',
  STANDARD:   'STANDARD',
  RICH:       'RICH',
});

export const INFORMATION_DENSITY = Object.freeze({
  MINIMAL:  'MINIMAL',
  MODERATE: 'MODERATE',
  DENSE:    'DENSE',
});

export const MOTION_LEVEL = Object.freeze({
  NONE:     'NONE',
  LOW:      'LOW',
  STANDARD: 'STANDARD',
  RICH:     'RICH',
});

export const ACCESSIBILITY_LEVEL = Object.freeze({
  BASELINE: 'BASELINE',
  ENHANCED: 'ENHANCED',
  FULL:     'FULL',
});

export const PREMIUM_PROFILE_VERSION = '1.0.0';

export function createPremiumExperienceProfile(overrides = {}) {
  const defaults = {
    id:                  `pep-${Date.now()}`,
    version:             PREMIUM_PROFILE_VERSION,
    vertical:            'default',
    businessType:        'service',
    audience:            'general',
    brandPersonality:    [BRAND_PERSONALITY.PROFESSIONAL],
    visualDensity:       VISUAL_DENSITY.BALANCED,
    interactionLevel:    INTERACTION_LEVEL.STANDARD,
    informationDensity:  INFORMATION_DENSITY.MODERATE,
    motionLevel:         MOTION_LEVEL.STANDARD,
    navigationPattern:   'SIDEBAR_APP',
    dashboardPattern:    'STANDARD',
    formPattern:         'STANDARD',
    cardPattern:         'ENTITY',
    heroPattern:         null,
    ctaPattern:          'PRIMARY_SECONDARY',
    mobilePattern:       'BOTTOM_NAV',
    typographyProfile:   'MODERN_SANS',
    spacingProfile:      'BALANCED',
    surfaceProfile:      'LAYERED',
    iconProfile:         'OUTLINE',
    contentTone:         'PROFESSIONAL',
    accessibilityLevel:  ACCESSIBILITY_LEVEL.ENHANCED,
    isReal:              false,
  };
  return Object.freeze({ ...defaults, ...overrides });
}

export function validateProfile(profile = {}) {
  const issues = [];
  if (!profile.vertical) issues.push('missing vertical');
  if (!profile.brandPersonality || !Array.isArray(profile.brandPersonality) || profile.brandPersonality.length === 0) {
    issues.push('brandPersonality must be non-empty array');
  }
  if (!Object.values(VISUAL_DENSITY).includes(profile.visualDensity)) {
    issues.push(`invalid visualDensity: ${profile.visualDensity}`);
  }
  if (!Object.values(MOTION_LEVEL).includes(profile.motionLevel)) {
    issues.push(`invalid motionLevel: ${profile.motionLevel}`);
  }
  return Object.freeze({ valid: issues.length === 0, issues });
}
