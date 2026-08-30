/**
 * Factory Experience Presets V2
 * 10 new presets extending V1.7. Each preset includes V2 dimensions:
 * glass, gradient, depth, density, motionLibrary, blur, typography personality.
 * Import V1 presets from presets.js — these are additive, not replacements.
 */

// tokens.js provides runtime token values; palette values here are design decisions, not derived from tokens

// ─── V2 preset schema additions ───────────────────────────────────────────────

/**
 * @typedef {Object} ExperiencePresetV2
 * Extends V1 preset with:
 * @property {string}   density          - 'compact'|'comfortable'|'spacious'|'airy'
 * @property {boolean}  glassEffect      - use glassmorphism on cards/headers
 * @property {string}   gradientStyle    - gradient key from tokens.js
 * @property {string}   depthLevel       - 'flat'|'shallow'|'mid'|'deep'|'immersive'
 * @property {string}   motionLibrary    - 'css'|'motion' (motion/react)
 * @property {boolean}  blurBackgrounds  - blur on overlays/cards
 * @property {string}   typographyMood   - 'editorial'|'functional'|'expressive'|'authoritative'|'warm'
 * @property {string[]} primaryFonts     - font-family suggestions
 * @property {string}   layoutPersonality- 'asymmetric'|'grid'|'flow'|'centered'|'editorial'
 * @property {string}   colorMode        - 'light'|'dark'|'auto'
 * @property {boolean}  microAnimations  - fine-grained UI interactions
 * @property {string}   heroStyle        - V2 hero variant
 * @property {Object}   palette          - semantic color hints
 */

export const EXPERIENCE_PRESETS_V2 = Object.freeze({

  // 1. Minimal Premium — clean, whitespace-forward, subtle motion
  'minimal-premium': {
    // V1 compatibility
    motionIntensity:       'low',
    transitionSpeed:       'slow',
    scrollEffects:         ['fade-in'],
    hoverDepth:            'subtle',
    cardMotion:            'subtle-lift',
    heroMotion:            'fade',
    chartAnimation:        true,
    navigationTransitions: 'fade',
    backgroundMotion:      false,
    videoBehavior:         'none',
    reducedMotionFallback: 'static',
    // V2 additions
    density:              'airy',
    glassEffect:          false,
    gradientStyle:        'slate',
    depthLevel:           'flat',
    motionLibrary:        'motion',
    blurBackgrounds:      false,
    typographyMood:       'editorial',
    primaryFonts:         ['Inter', 'Geist', 'system-ui'],
    layoutPersonality:    'asymmetric',
    colorMode:            'light',
    microAnimations:      true,
    heroStyle:            'text-only-hero',
    palette:              { primary: '#0f172a', accent: '#6366f1', surface: '#fafafa' },
  },

  // 2. Clinical Premium — healthcare, trust, precision
  'clinical-premium': {
    motionIntensity:       'low',
    transitionSpeed:       'normal',
    scrollEffects:         ['fade-in', 'slide-up'],
    hoverDepth:            'minimal',
    cardMotion:            'subtle-lift',
    heroMotion:            'fade',
    chartAnimation:        true,
    navigationTransitions: 'fade',
    backgroundMotion:      false,
    videoBehavior:         'none',
    reducedMotionFallback: 'static',
    density:              'comfortable',
    glassEffect:          false,
    gradientStyle:        'cool',
    depthLevel:           'shallow',
    motionLibrary:        'motion',
    blurBackgrounds:      false,
    typographyMood:       'authoritative',
    primaryFonts:         ['Inter', 'DM Sans', 'Helvetica Neue'],
    layoutPersonality:    'grid',
    colorMode:            'light',
    microAnimations:      true,
    heroStyle:            'split-trust',
    palette:              { primary: '#0369a1', accent: '#10b981', surface: '#f0f9ff' },
  },

  // 3. Luxury Editorial — high-end, bold typography, dramatic reveals
  'luxury-editorial': {
    motionIntensity:       'medium',
    transitionSpeed:       'slow',
    scrollEffects:         ['fade-in', 'slide-up', 'stagger-reveal', 'parallax-subtle'],
    hoverDepth:            'deep',
    cardMotion:            'glow',
    heroMotion:            'gradient-shift',
    chartAnimation:        false,
    navigationTransitions: 'slide',
    backgroundMotion:      true,
    videoBehavior:         'ambient-loop',
    reducedMotionFallback: 'fade-only',
    density:              'airy',
    glassEffect:          true,
    gradientStyle:        'aurora',
    depthLevel:           'deep',
    motionLibrary:        'motion',
    blurBackgrounds:      true,
    typographyMood:       'editorial',
    primaryFonts:         ['Playfair Display', 'Georgia', 'serif'],
    layoutPersonality:    'editorial',
    colorMode:            'auto',
    microAnimations:      true,
    heroStyle:            'full-bleed-editorial',
    palette:              { primary: '#1c1917', accent: '#d97706', surface: '#fafaf9' },
  },

  // 4. Sports Dynamic — energy, speed, bold visual impact
  'sports-dynamic': {
    motionIntensity:       'high',
    transitionSpeed:       'fast',
    scrollEffects:         ['fade-in', 'slide-up', 'stagger-reveal', 'counter-on-visible'],
    hoverDepth:            'deep',
    cardMotion:            'scale-up',
    heroMotion:            'slide-up',
    chartAnimation:        true,
    navigationTransitions: 'slide',
    backgroundMotion:      true,
    videoBehavior:         'autoplay-silent',
    reducedMotionFallback: 'fade-only',
    density:              'comfortable',
    glassEffect:          true,
    gradientStyle:        'warm',
    depthLevel:           'mid',
    motionLibrary:        'motion',
    blurBackgrounds:      true,
    typographyMood:       'expressive',
    primaryFonts:         ['Barlow Condensed', 'Oswald', 'Impact'],
    layoutPersonality:    'asymmetric',
    colorMode:            'dark',
    microAnimations:      true,
    heroStyle:            'video-full-bleed',
    palette:              { primary: '#ef4444', accent: '#f59e0b', surface: '#111827' },
  },

  // 5. Tech Futuristic — SaaS, dark, neon accents
  'tech-futuristic': {
    motionIntensity:       'high',
    transitionSpeed:       'fast',
    scrollEffects:         ['fade-in', 'slide-up', 'progress-on-scroll', 'stagger-reveal'],
    hoverDepth:            'deep',
    cardMotion:            'glow',
    heroMotion:            'gradient-shift',
    chartAnimation:        true,
    navigationTransitions: 'fade',
    backgroundMotion:      true,
    videoBehavior:         'ambient-loop',
    reducedMotionFallback: 'minimal',
    density:              'compact',
    glassEffect:          true,
    gradientStyle:        'ocean',
    depthLevel:           'immersive',
    motionLibrary:        'motion',
    blurBackgrounds:      true,
    typographyMood:       'functional',
    primaryFonts:         ['JetBrains Mono', 'Fira Code', 'Space Grotesk'],
    layoutPersonality:    'grid',
    colorMode:            'dark',
    microAnimations:      true,
    heroStyle:            'mesh-gradient-hero',
    palette:              { primary: '#6366f1', accent: '#22d3ee', surface: '#0f172a' },
  },

  // 6. Education Interactive — engaging, playful, clear hierarchy
  'education-interactive': {
    motionIntensity:       'medium',
    transitionSpeed:       'normal',
    scrollEffects:         ['fade-in', 'stagger-reveal', 'counter-on-visible'],
    hoverDepth:            'moderate',
    cardMotion:            'subtle-lift',
    heroMotion:            'slide-up',
    chartAnimation:        true,
    navigationTransitions: 'slide',
    backgroundMotion:      false,
    videoBehavior:         'on-demand',
    reducedMotionFallback: 'fade-only',
    density:              'comfortable',
    glassEffect:          false,
    gradientStyle:        'fresh',
    depthLevel:           'shallow',
    motionLibrary:        'motion',
    blurBackgrounds:      false,
    typographyMood:       'warm',
    primaryFonts:         ['Nunito', 'Plus Jakarta Sans', 'system-ui'],
    layoutPersonality:    'flow',
    colorMode:            'light',
    microAnimations:      true,
    heroStyle:            'split-illustrated',
    palette:              { primary: '#1d4ed8', accent: '#16a34a', surface: '#eff6ff' },
  },

  // 7. Professional Authority — B2B, consulting, serious
  'professional-authority': {
    motionIntensity:       'low',
    transitionSpeed:       'normal',
    scrollEffects:         ['fade-in', 'slide-up'],
    hoverDepth:            'minimal',
    cardMotion:            'none',
    heroMotion:            'fade',
    chartAnimation:        true,
    navigationTransitions: 'fade',
    backgroundMotion:      false,
    videoBehavior:         'none',
    reducedMotionFallback: 'static',
    density:              'spacious',
    glassEffect:          false,
    gradientStyle:        'slate',
    depthLevel:           'flat',
    motionLibrary:        'css',
    blurBackgrounds:      false,
    typographyMood:       'authoritative',
    primaryFonts:         ['IBM Plex Sans', 'Source Sans 3', 'Georgia'],
    layoutPersonality:    'centered',
    colorMode:            'light',
    microAnimations:      false,
    heroStyle:            'statement-hero',
    palette:              { primary: '#1e293b', accent: '#2563eb', surface: '#f8fafc' },
  },

  // 8. Friendly Human — SMB, local business, approachable
  'friendly-human': {
    motionIntensity:       'medium',
    transitionSpeed:       'normal',
    scrollEffects:         ['fade-in', 'stagger-reveal'],
    hoverDepth:            'moderate',
    cardMotion:            'subtle-lift',
    heroMotion:            'slide-up',
    chartAnimation:        false,
    navigationTransitions: 'fade',
    backgroundMotion:      false,
    videoBehavior:         'on-demand',
    reducedMotionFallback: 'fade-only',
    density:              'comfortable',
    glassEffect:          false,
    gradientStyle:        'fresh',
    depthLevel:           'shallow',
    motionLibrary:        'motion',
    blurBackgrounds:      false,
    typographyMood:       'warm',
    primaryFonts:         ['Nunito', 'Poppins', 'system-ui'],
    layoutPersonality:    'flow',
    colorMode:            'light',
    microAnimations:      true,
    heroStyle:            'split-photo-human',
    palette:              { primary: '#16a34a', accent: '#f59e0b', surface: '#f0fdf4' },
  },

  // 9. Immersive Showcase — portfolio, agency, full-screen experiences
  'immersive-showcase': {
    motionIntensity:       'high',
    transitionSpeed:       'slow',
    scrollEffects:         ['fade-in', 'parallax-subtle', 'sticky-section', 'stagger-reveal'],
    hoverDepth:            'deep',
    cardMotion:            'tilt',
    heroMotion:            'parallax',
    chartAnimation:        false,
    navigationTransitions: 'slide',
    backgroundMotion:      true,
    videoBehavior:         'autoplay-silent',
    reducedMotionFallback: 'fade-only',
    density:              'airy',
    glassEffect:          true,
    gradientStyle:        'aurora',
    depthLevel:           'immersive',
    motionLibrary:        'motion',
    blurBackgrounds:      true,
    typographyMood:       'editorial',
    primaryFonts:         ['Fraunces', 'DM Serif Display', 'serif'],
    layoutPersonality:    'editorial',
    colorMode:            'dark',
    microAnimations:      true,
    heroStyle:            'full-screen-scroll',
    palette:              { primary: '#7c3aed', accent: '#ec4899', surface: '#09090b' },
  },

  // 10. Data-Heavy SaaS — dashboard, analytics, information-dense
  'data-heavy-saas': {
    motionIntensity:       'low',
    transitionSpeed:       'fast',
    scrollEffects:         ['fade-in', 'counter-on-visible'],
    hoverDepth:            'subtle',
    cardMotion:            'none',
    heroMotion:            'none',
    chartAnimation:        true,
    navigationTransitions: 'instant',
    backgroundMotion:      false,
    videoBehavior:         'none',
    reducedMotionFallback: 'static',
    density:              'compact',
    glassEffect:          false,
    gradientStyle:        'cool',
    depthLevel:           'flat',
    motionLibrary:        'css',
    blurBackgrounds:      false,
    typographyMood:       'functional',
    primaryFonts:         ['Inter', 'Roboto', 'system-ui'],
    layoutPersonality:    'grid',
    colorMode:            'light',
    microAnimations:      false,
    heroStyle:            'dashboard-header',
    palette:              { primary: '#3b82f6', accent: '#8b5cf6', surface: '#f8fafc' },
  },
});

// ─── Vertical → V2 preset mapping ────────────────────────────────────────────

export const VERTICAL_TO_V2_PRESET = Object.freeze({
  dental:       'clinical-premium',
  salud:        'clinical-premium',
  clinica:      'clinical-premium',
  fisioterapia: 'clinical-premium',
  estetica:     'luxury-editorial',
  belleza:      'luxury-editorial',
  spa:          'luxury-editorial',
  deporte:      'sports-dynamic',
  padel:        'sports-dynamic',
  fitness:      'sports-dynamic',
  tecnologia:   'tech-futuristic',
  saas:         'tech-futuristic',
  software:     'tech-futuristic',
  educacion:    'education-interactive',
  education:    'education-interactive',
  legal:        'professional-authority',
  consultoria:  'professional-authority',
  finanzas:     'professional-authority',
  restaurante:  'friendly-human',
  local:        'friendly-human',
  comercio:     'friendly-human',
  portfolio:    'immersive-showcase',
  agencia:      'immersive-showcase',
  creativo:     'immersive-showcase',
  analitica:    'data-heavy-saas',
  dashboard:    'data-heavy-saas',
  erp:          'data-heavy-saas',
  // default
  default:      'friendly-human',
});

export function getV2PresetForVertical(vertical) {
  const key = (vertical ?? 'default').toLowerCase().trim();
  const presetId = VERTICAL_TO_V2_PRESET[key] ?? VERTICAL_TO_V2_PRESET.default;
  return { id: presetId, preset: EXPERIENCE_PRESETS_V2[presetId] };
}

export function listV2Presets() {
  return Object.keys(EXPERIENCE_PRESETS_V2);
}

export function isValidV2Preset(id) {
  return id in EXPERIENCE_PRESETS_V2;
}

export const PRESETS_V2_VERSION = '2.0.0';
