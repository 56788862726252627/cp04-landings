// Hero Experience Resolver — ADV-07

export const HERO_VARIANT = Object.freeze({
  SERVICE:  'SERVICE',
  TRUST:    'TRUST',
  RESULT:   'RESULT',
  BOOKING:  'BOOKING',
  LOCAL:    'LOCAL',
  PREMIUM:  'PREMIUM',
  MINIMAL:  'MINIMAL',
});

const HERO_SPECS = Object.freeze({
  SERVICE:  { hasImage: true,  hasVideo: false, hasCTA: true,  hasTagline: true,  hasSocialProof: false },
  TRUST:    { hasImage: true,  hasVideo: false, hasCTA: true,  hasTagline: true,  hasSocialProof: true  },
  RESULT:   { hasImage: true,  hasVideo: false, hasCTA: true,  hasTagline: true,  hasSocialProof: true  },
  BOOKING:  { hasImage: false, hasVideo: false, hasCTA: true,  hasTagline: true,  hasSocialProof: false },
  LOCAL:    { hasImage: true,  hasVideo: false, hasCTA: true,  hasTagline: true,  hasSocialProof: true  },
  PREMIUM:  { hasImage: true,  hasVideo: false, hasCTA: true,  hasTagline: true,  hasSocialProof: false },
  MINIMAL:  { hasImage: false, hasVideo: false, hasCTA: true,  hasTagline: false, hasSocialProof: false },
});

const VERTICAL_HERO_MAP = Object.freeze({
  veterinary: HERO_VARIANT.LOCAL,
  legal:      null,
  beauty:     HERO_VARIANT.PREMIUM,
  dental:     HERO_VARIANT.TRUST,
  padel:      HERO_VARIANT.SERVICE,
  education:  HERO_VARIANT.SERVICE,
  default:    HERO_VARIANT.SERVICE,
});

export function resolveHeroPattern(brief = {}) {
  const { vertical = 'default', isPublicFacing = true, overrideVariant } = brief;
  if (!isPublicFacing) {
    return Object.freeze({ variant: null, reason: 'app-only-no-hero', isReal: false });
  }
  const variant = overrideVariant ?? VERTICAL_HERO_MAP[vertical] ?? HERO_VARIANT.SERVICE;
  if (!variant) {
    return Object.freeze({ variant: null, reason: 'vertical-prefers-no-hero', isReal: false });
  }
  const spec = HERO_SPECS[variant];
  return Object.freeze({ variant, ...spec, isReal: false });
}

export const HERO_EXPERIENCE_RESOLVER_VERSION = '1.0.0';
