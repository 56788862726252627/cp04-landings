/**
 * Factory Design System V2 — Tokens
 * Motion, interaction, depth, elevation, blur, glass, gradient, density
 * Node + browser compatible. No external deps.
 */

// ─── Motion ───────────────────────────────────────────────────────────────────

export const MOTION_DURATION = Object.freeze({
  instant:   0,
  xfast:     80,
  fast:      150,
  normal:    250,
  slow:      400,
  xslow:     600,
  dramatic:  900,
});

export const MOTION_EASING = Object.freeze({
  linear:       'linear',
  ease:         'ease',
  easeIn:       'ease-in',
  easeOut:      'ease-out',
  easeInOut:    'ease-in-out',
  spring:       'cubic-bezier(0.34, 1.56, 0.64, 1)',
  springGentle: 'cubic-bezier(0.22, 1, 0.36, 1)',
  smooth:       'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate:   'cubic-bezier(0, 0, 0.2, 1)',
  accelerate:   'cubic-bezier(0.4, 0, 1, 1)',
  sharp:        'cubic-bezier(0.4, 0, 0.6, 1)',
  overshoot:    'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  bounce:       'cubic-bezier(0.34, 1.7, 0.64, 1)',
});

export const MOTION_DISTANCE = Object.freeze({
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  40,
  xxl: 64,
});

export const MOTION_SPRING = Object.freeze({
  stiff:    { stiffness: 400, damping: 30, mass: 1 },
  medium:   { stiffness: 250, damping: 25, mass: 1 },
  gentle:   { stiffness: 120, damping: 20, mass: 1 },
  bouncy:   { stiffness: 300, damping: 10, mass: 1 },
  wobbly:   { stiffness: 180, damping: 12, mass: 1 },
  slow:     { stiffness: 80,  damping: 20, mass: 1 },
});

export const STAGGER_DELAYS = Object.freeze({
  tight:   0.04,
  normal:  0.07,
  relaxed: 0.12,
  slow:    0.18,
});

// ─── Interaction ──────────────────────────────────────────────────────────────

export const INTERACTION_HOVER = Object.freeze({
  none:     { scale: 1,    shadow: 'none',                       translateY: 0 },
  subtle:   { scale: 1.01, shadow: '0 4px 16px rgba(0,0,0,.08)', translateY: -1 },
  moderate: { scale: 1.02, shadow: '0 8px 24px rgba(0,0,0,.12)', translateY: -2 },
  deep:     { scale: 1.04, shadow: '0 12px 32px rgba(0,0,0,.16)', translateY: -4 },
  lift:     { scale: 1.03, shadow: '0 16px 48px rgba(0,0,0,.20)', translateY: -6 },
});

export const INTERACTION_TAP = Object.freeze({
  none:    { scale: 1 },
  subtle:  { scale: 0.99 },
  medium:  { scale: 0.97 },
  strong:  { scale: 0.95 },
  bounce:  { scale: 0.93 },
});

export const INTERACTION_FOCUS = Object.freeze({
  ring:    '0 0 0 2px currentColor',
  ringOffset: '0 0 0 4px currentColor',
  glow:    '0 0 0 3px rgba(59,130,246,.5)',
  none:    'none',
});

// ─── Depth ────────────────────────────────────────────────────────────────────

export const DEPTH_LEVELS = Object.freeze({
  flat:      { blur: 0,  opacity: 1,    scale: 1 },
  shallow:   { blur: 2,  opacity: .96,  scale: 1.005 },
  mid:       { blur: 8,  opacity: .92,  scale: 1.01 },
  deep:      { blur: 16, opacity: .85,  scale: 1.02 },
  immersive: { blur: 24, opacity: .75,  scale: 1.04 },
});

// ─── Elevation (box-shadow) ───────────────────────────────────────────────────

export const ELEVATION = Object.freeze({
  0:  'none',
  1:  '0 1px 2px rgba(0,0,0,.06)',
  2:  '0 2px 6px rgba(0,0,0,.08)',
  3:  '0 4px 12px rgba(0,0,0,.10)',
  4:  '0 8px 20px rgba(0,0,0,.12)',
  5:  '0 12px 32px rgba(0,0,0,.14)',
  6:  '0 16px 48px rgba(0,0,0,.16)',
  7:  '0 24px 64px rgba(0,0,0,.20)',
  inset: 'inset 0 2px 8px rgba(0,0,0,.08)',
  colored: (color = '59,130,246') => `0 8px 24px rgba(${color},.25)`,
});

// ─── Blur ─────────────────────────────────────────────────────────────────────

export const BLUR = Object.freeze({
  none:  'blur(0)',
  xs:    'blur(2px)',
  sm:    'blur(4px)',
  md:    'blur(8px)',
  lg:    'blur(16px)',
  xl:    'blur(24px)',
  xxl:   'blur(40px)',
  ultra: 'blur(80px)',
});

// ─── Glass ────────────────────────────────────────────────────────────────────

export const GLASS = Object.freeze({
  light: {
    background:       'rgba(255,255,255,.72)',
    backdropFilter:   'blur(16px) saturate(180%)',
    border:           '1px solid rgba(255,255,255,.5)',
    boxShadow:        '0 4px 24px rgba(0,0,0,.08)',
  },
  dark: {
    background:       'rgba(15,23,42,.72)',
    backdropFilter:   'blur(16px) saturate(180%)',
    border:           '1px solid rgba(255,255,255,.1)',
    boxShadow:        '0 4px 24px rgba(0,0,0,.24)',
  },
  frosted: {
    background:       'rgba(248,250,252,.85)',
    backdropFilter:   'blur(20px) saturate(200%)',
    border:           '1px solid rgba(255,255,255,.8)',
    boxShadow:        ELEVATION[3],
  },
  tinted: (r = 99, g = 102, b = 241) => ({
    background:       `rgba(${r},${g},${b},.15)`,
    backdropFilter:   'blur(12px) saturate(150%)',
    border:           `1px solid rgba(${r},${g},${b},.25)`,
    boxShadow:        `0 4px 20px rgba(${r},${g},${b},.12)`,
  }),
});

// ─── Gradient ─────────────────────────────────────────────────────────────────

export const GRADIENT = Object.freeze({
  primary:    (a = '#6366f1', b = '#8b5cf6') => `linear-gradient(135deg, ${a}, ${b})`,
  warm:       'linear-gradient(135deg, #f59e0b, #ef4444)',
  cool:       'linear-gradient(135deg, #3b82f6, #6366f1)',
  fresh:      'linear-gradient(135deg, #10b981, #3b82f6)',
  sunset:     'linear-gradient(135deg, #f97316, #ec4899)',
  ocean:      'linear-gradient(135deg, #0ea5e9, #6366f1)',
  forest:     'linear-gradient(135deg, #16a34a, #0d9488)',
  slate:      'linear-gradient(135deg, #475569, #1e293b)',
  aurora:     'linear-gradient(135deg, #7c3aed, #0ea5e9, #10b981)',
  mesh:       (c1 = '#6366f1', c2 = '#8b5cf6', c3 = '#ec4899') =>
    `radial-gradient(at 40% 20%, ${c1} 0px, transparent 50%), radial-gradient(at 80% 0%, ${c2} 0px, transparent 50%), radial-gradient(at 0% 50%, ${c3} 0px, transparent 50%)`,
  noise:      'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
});

// ─── Density ─────────────────────────────────────────────────────────────────

export const DENSITY = Object.freeze({
  compact: {
    spaceBase:    4,
    paddingCard:  '12px 16px',
    paddingSection: '32px 24px',
    gap:          8,
    lineHeight:   1.4,
    borderRadius: 8,
  },
  comfortable: {
    spaceBase:    6,
    paddingCard:  '20px 24px',
    paddingSection: '64px 40px',
    gap:          16,
    lineHeight:   1.6,
    borderRadius: 12,
  },
  spacious: {
    spaceBase:    8,
    paddingCard:  '32px 40px',
    paddingSection: '96px 64px',
    gap:          24,
    lineHeight:   1.75,
    borderRadius: 16,
  },
  airy: {
    spaceBase:    12,
    paddingCard:  '48px 56px',
    paddingSection: '128px 80px',
    gap:          32,
    lineHeight:   1.85,
    borderRadius: 24,
  },
});

// ─── Typography scale ─────────────────────────────────────────────────────────

export const TYPE_SCALE = Object.freeze({
  xs:   '0.75rem',
  sm:   '0.875rem',
  base: '1rem',
  lg:   '1.125rem',
  xl:   '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
});

export const FONT_WEIGHT = Object.freeze({
  light:    300,
  normal:   400,
  medium:   500,
  semibold: 600,
  bold:     700,
  extrabold: 800,
  black:    900,
});

// ─── CSS custom property builder ──────────────────────────────────────────────

export function buildV2CssVars(options = {}) {
  const {
    durationMultiplier = 1,
    density = 'comfortable',
    motionReduced = false,
  } = options;

  const d = DENSITY[density] ?? DENSITY.comfortable;
  const mult = motionReduced ? 0 : durationMultiplier;

  return {
    '--motion-fast':     `${Math.round(MOTION_DURATION.fast * mult)}ms`,
    '--motion-normal':   `${Math.round(MOTION_DURATION.normal * mult)}ms`,
    '--motion-slow':     `${Math.round(MOTION_DURATION.slow * mult)}ms`,
    '--motion-spring':   MOTION_EASING.spring,
    '--motion-smooth':   MOTION_EASING.smooth,
    '--space-base':      `${d.spaceBase}px`,
    '--gap':             `${d.gap}px`,
    '--radius-card':     `${d.borderRadius}px`,
    '--line-height':     `${d.lineHeight}`,
    '--elevation-1':     ELEVATION[1],
    '--elevation-3':     ELEVATION[3],
    '--elevation-5':     ELEVATION[5],
  };
}

export const DS_V2_VERSION = '2.0.0';
