// Typography System — ADV-07

export const TYPOGRAPHY_PROFILE = Object.freeze({
  WARM_HUMANIST:    'WARM_HUMANIST',
  CLEAN_MODERN:     'CLEAN_MODERN',
  ELEGANT_DISPLAY:  'ELEGANT_DISPLAY',
  SERIF_AUTHORITY:  'SERIF_AUTHORITY',
  BOLD_SPORT:       'BOLD_SPORT',
  FRIENDLY_READABLE:'FRIENDLY_READABLE',
  MODERN_SANS:      'MODERN_SANS',
});

const TYPOGRAPHY_SCALES = Object.freeze({
  WARM_HUMANIST: {
    fontHeading: 'Nunito, system-ui, sans-serif',
    fontBody:    'Open Sans, system-ui, sans-serif',
    display:     { size: '3rem',   weight: 700, lineHeight: 1.1 },
    h1:          { size: '2rem',   weight: 700, lineHeight: 1.2 },
    h2:          { size: '1.5rem', weight: 600, lineHeight: 1.3 },
    h3:          { size: '1.25rem',weight: 600, lineHeight: 1.4 },
    body:        { size: '1rem',   weight: 400, lineHeight: 1.6 },
    bodySmall:   { size: '.875rem',weight: 400, lineHeight: 1.5 },
    label:       { size: '.875rem',weight: 500, lineHeight: 1.4 },
    caption:     { size: '.75rem', weight: 400, lineHeight: 1.4 },
    metric:      { size: '2.5rem', weight: 700, lineHeight: 1.0 },
    button:      { size: '.9375rem',weight: 600, lineHeight: 1.2 },
  },
  ELEGANT_DISPLAY: {
    fontHeading: 'Playfair Display, Georgia, serif',
    fontBody:    'Lato, system-ui, sans-serif',
    display:     { size: '3.5rem', weight: 700, lineHeight: 1.1 },
    h1:          { size: '2.25rem',weight: 700, lineHeight: 1.15 },
    h2:          { size: '1.625rem',weight: 600, lineHeight: 1.25 },
    h3:          { size: '1.25rem', weight: 500, lineHeight: 1.35 },
    body:        { size: '1rem',   weight: 300, lineHeight: 1.7 },
    bodySmall:   { size: '.875rem',weight: 300, lineHeight: 1.6 },
    label:       { size: '.8125rem',weight: 400, lineHeight: 1.4 },
    caption:     { size: '.75rem', weight: 300, lineHeight: 1.5 },
    metric:      { size: '3rem',   weight: 300, lineHeight: 1.0 },
    button:      { size: '.875rem', weight: 500, lineHeight: 1.2 },
  },
  SERIF_AUTHORITY: {
    fontHeading: 'Merriweather, Georgia, serif',
    fontBody:    'Source Serif 4, Georgia, serif',
    display:     { size: '2.5rem', weight: 700, lineHeight: 1.15 },
    h1:          { size: '1.875rem',weight: 700, lineHeight: 1.2 },
    h2:          { size: '1.375rem',weight: 600, lineHeight: 1.3 },
    h3:          { size: '1.125rem',weight: 600, lineHeight: 1.4 },
    body:        { size: '1rem',   weight: 400, lineHeight: 1.7 },
    bodySmall:   { size: '.875rem',weight: 400, lineHeight: 1.6 },
    label:       { size: '.8125rem',weight: 600, lineHeight: 1.3 },
    caption:     { size: '.75rem', weight: 400, lineHeight: 1.4 },
    metric:      { size: '2rem',   weight: 700, lineHeight: 1.0 },
    button:      { size: '.875rem', weight: 700, lineHeight: 1.2 },
  },
  BOLD_SPORT: {
    fontHeading: 'Space Grotesk, system-ui, sans-serif',
    fontBody:    'Inter, system-ui, sans-serif',
    display:     { size: '4rem',   weight: 800, lineHeight: 1.0 },
    h1:          { size: '2.5rem', weight: 800, lineHeight: 1.1 },
    h2:          { size: '1.75rem',weight: 700, lineHeight: 1.2 },
    h3:          { size: '1.25rem',weight: 700, lineHeight: 1.3 },
    body:        { size: '1rem',   weight: 400, lineHeight: 1.5 },
    bodySmall:   { size: '.875rem',weight: 400, lineHeight: 1.4 },
    label:       { size: '.875rem',weight: 700, lineHeight: 1.3 },
    caption:     { size: '.75rem', weight: 500, lineHeight: 1.3 },
    metric:      { size: '3.5rem', weight: 800, lineHeight: 1.0 },
    button:      { size: '1rem',   weight: 700, lineHeight: 1.2 },
  },
  MODERN_SANS: {
    fontHeading: 'Inter, system-ui, sans-serif',
    fontBody:    'Inter, system-ui, sans-serif',
    display:     { size: '3rem',   weight: 700, lineHeight: 1.1 },
    h1:          { size: '2rem',   weight: 700, lineHeight: 1.2 },
    h2:          { size: '1.5rem', weight: 600, lineHeight: 1.3 },
    h3:          { size: '1.25rem',weight: 600, lineHeight: 1.4 },
    body:        { size: '1rem',   weight: 400, lineHeight: 1.6 },
    bodySmall:   { size: '.875rem',weight: 400, lineHeight: 1.5 },
    label:       { size: '.875rem',weight: 500, lineHeight: 1.4 },
    caption:     { size: '.75rem', weight: 400, lineHeight: 1.4 },
    metric:      { size: '2.5rem', weight: 700, lineHeight: 1.0 },
    button:      { size: '.9375rem',weight: 600, lineHeight: 1.2 },
  },
  CLEAN_MODERN: {
    fontHeading: 'DM Sans, system-ui, sans-serif',
    fontBody:    'Inter, system-ui, sans-serif',
    display:     { size: '2.75rem',weight: 700, lineHeight: 1.1 },
    h1:          { size: '1.875rem',weight: 700, lineHeight: 1.2 },
    h2:          { size: '1.4rem', weight: 600, lineHeight: 1.3 },
    h3:          { size: '1.125rem',weight: 600, lineHeight: 1.4 },
    body:        { size: '1rem',   weight: 400, lineHeight: 1.6 },
    bodySmall:   { size: '.875rem',weight: 400, lineHeight: 1.5 },
    label:       { size: '.875rem',weight: 500, lineHeight: 1.4 },
    caption:     { size: '.75rem', weight: 400, lineHeight: 1.4 },
    metric:      { size: '2.25rem',weight: 700, lineHeight: 1.0 },
    button:      { size: '.9375rem',weight: 600, lineHeight: 1.2 },
  },
  FRIENDLY_READABLE: {
    fontHeading: 'Nunito, system-ui, sans-serif',
    fontBody:    'Open Sans, system-ui, sans-serif',
    display:     { size: '2.5rem', weight: 700, lineHeight: 1.15 },
    h1:          { size: '1.75rem',weight: 700, lineHeight: 1.25 },
    h2:          { size: '1.375rem',weight: 600, lineHeight: 1.35 },
    h3:          { size: '1.125rem',weight: 600, lineHeight: 1.45 },
    body:        { size: '1rem',   weight: 400, lineHeight: 1.65 },
    bodySmall:   { size: '.875rem',weight: 400, lineHeight: 1.55 },
    label:       { size: '.875rem',weight: 500, lineHeight: 1.4 },
    caption:     { size: '.75rem', weight: 400, lineHeight: 1.5 },
    metric:      { size: '2rem',   weight: 700, lineHeight: 1.0 },
    button:      { size: '.9375rem',weight: 600, lineHeight: 1.2 },
  },
});

export function createTypographyProfile(typographyProfile = 'MODERN_SANS') {
  const scale = TYPOGRAPHY_SCALES[typographyProfile] ?? TYPOGRAPHY_SCALES.MODERN_SANS;
  return Object.freeze({ ...scale, profile: typographyProfile, isReal: false });
}

export function validateTypography(scale = {}) {
  const required = ['fontHeading', 'fontBody', 'h1', 'body', 'button'];
  const missing = required.filter(k => !scale[k]);
  const hierarchy = scale.h1 && scale.h2 ?
    parseFloat(scale.h1.size) >= parseFloat(scale.h2.size) : true;
  return Object.freeze({ valid: missing.length === 0 && hierarchy, missing, hierarchyOk: hierarchy });
}

export { TYPOGRAPHY_SCALES };
export const TYPOGRAPHY_SYSTEM_VERSION = '1.0.0';
