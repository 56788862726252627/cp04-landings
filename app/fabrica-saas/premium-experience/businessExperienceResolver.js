// Business Experience Resolver — ADV-07
import { createPremiumExperienceProfile, BRAND_PERSONALITY, VISUAL_DENSITY, MOTION_LEVEL, INTERACTION_LEVEL, INFORMATION_DENSITY, ACCESSIBILITY_LEVEL } from './premiumExperienceProfile.js';

const VERTICAL_CORE_PROFILES = Object.freeze({
  veterinary: {
    brandPersonality:   [BRAND_PERSONALITY.WARM, BRAND_PERSONALITY.TRUSTED],
    visualDensity:      VISUAL_DENSITY.BALANCED,
    interactionLevel:   INTERACTION_LEVEL.STANDARD,
    informationDensity: INFORMATION_DENSITY.MODERATE,
    motionLevel:        MOTION_LEVEL.LOW,
    navigationPattern:  'TOP_NAV',
    dashboardPattern:   'BOOKING_FIRST',
    formPattern:        'PROGRESSIVE',
    cardPattern:        'APPOINTMENT',
    heroPattern:        'SERVICE',
    ctaPattern:         'BOOKING_PRIMARY',
    mobilePattern:      'BOTTOM_NAV',
    typographyProfile:  'WARM_HUMANIST',
    spacingProfile:     'SPACIOUS',
    surfaceProfile:     'WARM_LAYERED',
    contentTone:        'WARM_PROFESSIONAL',
  },
  legal: {
    brandPersonality:   [BRAND_PERSONALITY.PROFESSIONAL, BRAND_PERSONALITY.TRUSTED],
    visualDensity:      VISUAL_DENSITY.COMPACT,
    interactionLevel:   INTERACTION_LEVEL.SUBTLE,
    informationDensity: INFORMATION_DENSITY.DENSE,
    motionLevel:        MOTION_LEVEL.NONE,
    navigationPattern:  'SIDEBAR_APP',
    dashboardPattern:   'CRM_FIRST',
    formPattern:        'STRUCTURED',
    cardPattern:        'ENTITY',
    heroPattern:        null,
    ctaPattern:         'TRUST_PRIMARY',
    mobilePattern:      'DRAWER',
    typographyProfile:  'SERIF_AUTHORITY',
    spacingProfile:     'COMPACT',
    surfaceProfile:     'NEUTRAL_MINIMAL',
    contentTone:        'FORMAL_PRECISE',
  },
  beauty: {
    brandPersonality:   [BRAND_PERSONALITY.PREMIUM, BRAND_PERSONALITY.LUXURY],
    visualDensity:      VISUAL_DENSITY.SPACIOUS,
    interactionLevel:   INTERACTION_LEVEL.RICH,
    informationDensity: INFORMATION_DENSITY.MINIMAL,
    motionLevel:        MOTION_LEVEL.STANDARD,
    navigationPattern:  'TOP_NAV',
    dashboardPattern:   'SERVICE_FIRST',
    formPattern:        'MINIMAL_STEPS',
    cardPattern:        'VISUAL_SERVICE',
    heroPattern:        'PREMIUM',
    ctaPattern:         'CONVERSION_FOCUSED',
    mobilePattern:      'BOTTOM_NAV',
    typographyProfile:  'ELEGANT_DISPLAY',
    spacingProfile:     'SPACIOUS',
    surfaceProfile:     'PREMIUM_GLASS',
    contentTone:        'ASPIRATIONAL',
  },
  dental: {
    brandPersonality:   [BRAND_PERSONALITY.CLINICAL, BRAND_PERSONALITY.TRUSTED, BRAND_PERSONALITY.MODERN],
    visualDensity:      VISUAL_DENSITY.BALANCED,
    interactionLevel:   INTERACTION_LEVEL.STANDARD,
    informationDensity: INFORMATION_DENSITY.MODERATE,
    motionLevel:        MOTION_LEVEL.LOW,
    navigationPattern:  'TOP_NAV',
    dashboardPattern:   'BOOKING_FIRST',
    typographyProfile:  'CLEAN_MODERN',
    contentTone:        'WARM_CLINICAL',
  },
  padel: {
    brandPersonality:   [BRAND_PERSONALITY.SPORTY, BRAND_PERSONALITY.MODERN],
    visualDensity:      VISUAL_DENSITY.COMPACT,
    interactionLevel:   INTERACTION_LEVEL.RICH,
    motionLevel:        MOTION_LEVEL.RICH,
    dashboardPattern:   'BOOKING_FIRST',
    typographyProfile:  'BOLD_SPORT',
    contentTone:        'ENERGETIC',
  },
  education: {
    brandPersonality:   [BRAND_PERSONALITY.WARM, BRAND_PERSONALITY.TRUSTED, BRAND_PERSONALITY.MODERN],
    visualDensity:      VISUAL_DENSITY.BALANCED,
    interactionLevel:   INTERACTION_LEVEL.STANDARD,
    informationDensity: INFORMATION_DENSITY.MODERATE,
    typographyProfile:  'FRIENDLY_READABLE',
    contentTone:        'ENCOURAGING',
  },
});

export function resolvePremiumExperience(brief = {}) {
  const { vertical = 'default', businessType, audience, overrides = {} } = brief;
  const core = VERTICAL_CORE_PROFILES[vertical] ?? {};
  const profile = createPremiumExperienceProfile({
    vertical,
    businessType:  businessType ?? 'service',
    audience:      audience ?? 'general',
    ...core,
    ...overrides,
  });
  return Object.freeze({
    profile,
    resolvedFrom: vertical in VERTICAL_CORE_PROFILES ? 'VERTICAL' : 'DEFAULT',
    appliedOverrides: Object.keys(overrides),
    isReal: false,
  });
}

export function applyClientOverrides(profile, overrides = {}) {
  return createPremiumExperienceProfile({ ...profile, ...overrides });
}

export { VERTICAL_CORE_PROFILES };
export const BUSINESS_EXPERIENCE_RESOLVER_VERSION = '1.0.0';
