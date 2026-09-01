// Design Token Engine — ADV-07

export const TOKEN_CATEGORY = Object.freeze({
  SPACING:    'SPACING',
  RADIUS:     'RADIUS',
  ELEVATION:  'ELEVATION',
  TYPOGRAPHY: 'TYPOGRAPHY',
  COLOR:      'COLOR',
  BORDER:     'BORDER',
  SHADOW:     'SHADOW',
  MOTION:     'MOTION',
  FOCUS:      'FOCUS',
  DENSITY:    'DENSITY',
});

const RADIUS_SCALES = Object.freeze({
  WARM_HUMANIST:   { sm: '6px',  md: '12px', lg: '16px', xl: '24px', full: '9999px' },
  CLEAN_MODERN:    { sm: '4px',  md: '8px',  lg: '12px', xl: '16px', full: '9999px' },
  ELEGANT_DISPLAY: { sm: '2px',  md: '4px',  lg: '8px',  xl: '12px', full: '9999px' },
  SERIF_AUTHORITY: { sm: '2px',  md: '2px',  lg: '4px',  xl: '4px',  full: '9999px' },
  BOLD_SPORT:      { sm: '4px',  md: '6px',  lg: '8px',  xl: '12px', full: '9999px' },
  DEFAULT:         { sm: '4px',  md: '8px',  lg: '12px', xl: '16px', full: '9999px' },
});

const ELEVATION_SCALES = Object.freeze({
  SPACIOUS:   { 0: 'none', 1: '0 1px 3px rgba(0,0,0,.06)', 2: '0 4px 12px rgba(0,0,0,.08)', 3: '0 8px 24px rgba(0,0,0,.10)', 4: '0 16px 48px rgba(0,0,0,.14)' },
  BALANCED:   { 0: 'none', 1: '0 1px 2px rgba(0,0,0,.08)', 2: '0 2px 8px rgba(0,0,0,.10)', 3: '0 4px 16px rgba(0,0,0,.12)', 4: '0 8px 32px rgba(0,0,0,.16)' },
  COMPACT:    { 0: 'none', 1: '0 1px 2px rgba(0,0,0,.10)', 2: '0 2px 6px rgba(0,0,0,.12)', 3: '0 4px 12px rgba(0,0,0,.14)', 4: '0 6px 20px rgba(0,0,0,.18)' },
  FLAT:       { 0: 'none', 1: '0 0 0 1px rgba(0,0,0,.08)', 2: '0 0 0 1px rgba(0,0,0,.12)', 3: '0 0 0 1px rgba(0,0,0,.16)', 4: '0 0 0 1px rgba(0,0,0,.20)' },
});

const DENSITY_SPACING = Object.freeze({
  COMPACT:   { xs: 2, sm: 4, md: 8,  lg: 12, xl: 16, xxl: 24 },
  BALANCED:  { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  SPACIOUS:  { xs: 8, sm: 16, md: 24, lg: 32, xl: 48, xxl: 64 },
});

const FOCUS_TOKENS = Object.freeze({
  STANDARD: { ring: '0 0 0 2px #3b82f6', offset: '0 0 0 4px rgba(59,130,246,.3)' },
  WARM:     { ring: '0 0 0 2px #0d9488', offset: '0 0 0 4px rgba(13,148,136,.3)' },
  PREMIUM:  { ring: '0 0 0 2px #d97706', offset: '0 0 0 4px rgba(217,119,6,.3)' },
  LEGAL:    { ring: '0 0 0 2px #1e293b', offset: '0 0 0 4px rgba(30,41,59,.3)' },
});

export function generateDesignTokens(profile = {}) {
  const { typographyProfile = 'DEFAULT', spacingProfile = 'BALANCED', visualDensity = 'BALANCED', surfaceProfile = 'LAYERED' } = profile;

  const radius    = RADIUS_SCALES[typographyProfile] ?? RADIUS_SCALES.DEFAULT;
  const elevation = ELEVATION_SCALES[spacingProfile] ?? ELEVATION_SCALES[visualDensity] ?? ELEVATION_SCALES.BALANCED;
  const spacing   = DENSITY_SPACING[visualDensity] ?? DENSITY_SPACING.BALANCED;

  const focusKey = typographyProfile === 'WARM_HUMANIST' ? 'WARM'
    : typographyProfile === 'ELEGANT_DISPLAY' ? 'PREMIUM'
    : typographyProfile === 'SERIF_AUTHORITY' ? 'LEGAL'
    : 'STANDARD';
  const focus = FOCUS_TOKENS[focusKey];

  return Object.freeze({
    version:    '1.0.0',
    profile:    typographyProfile,
    spacing,
    radius,
    elevation,
    focus,
    motion: {
      fast:   '150ms',
      normal: '250ms',
      slow:   '400ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    isReal: false,
  });
}

export const DESIGN_TOKEN_ENGINE_VERSION = '1.0.0';
