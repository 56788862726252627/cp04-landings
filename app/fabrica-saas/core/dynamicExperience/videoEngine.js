/**
 * Factory Dynamic Experience Engine — Video Engine V1.7
 *
 * Extends Media Engine V1.6 with full video configuration support.
 * Handles: hero video, background video, service video, testimonials,
 * explainers, team video, ambient loops.
 *
 * Rules:
 * - autoplay ONLY when muted (browser security)
 * - always provide poster/image fallback
 * - lazy loading by default
 * - mobile-disable option for ambient loops
 * - reduced-motion disables ambient/autoplay
 * - no external video URLs embedded (placeholder configs only for demos)
 */

// ─── Video type catalog ───────────────────────────────────────────────────────

export const VIDEO_TYPES = [
  'heroVideo',
  'serviceVideo',
  'backgroundVideo',
  'testimonialVideo',
  'explainerVideo',
  'teamVideo',
  'ambientLoop',
];

// ─── Default video config ─────────────────────────────────────────────────────

const VIDEO_DEFAULTS = Object.freeze({
  autoplay:     false,
  muted:        true,
  controls:     true,
  loop:         false,
  preload:      'metadata',
  lazy:         true,
  mobileEnabled: true,
  dataSaverAware: true,
  poster:       null,
  src:          null,
  sources:      [],
  type:         'heroVideo',
});

// ─── Ambient loop defaults ────────────────────────────────────────────────────

const AMBIENT_DEFAULTS = Object.freeze({
  ...VIDEO_DEFAULTS,
  autoplay:     true,
  muted:        true,
  controls:     false,
  loop:         true,
  preload:      'auto',
  mobileEnabled: false,
  type:         'ambientLoop',
});

// ─── Video placeholder configs ────────────────────────────────────────────────

const VIDEO_PLACEHOLDER_COLORS = {
  dental:         { bg: '#d1fae5', icon: '🦷',  label: 'Video Dental' },
  legal:          { bg: '#dbeafe', icon: '⚖️',   label: 'Video Legal' },
  physio:         { bg: '#ccfbf1', icon: '🏥',  label: 'Video Fisioterapia' },
  fisioterapia:   { bg: '#ccfbf1', icon: '🏥',  label: 'Video Fisioterapia' },
  psychology:     { bg: '#ede9fe', icon: '🧠',  label: 'Video Psicología' },
  'speech-therapy': { bg: '#cffafe', icon: '🗣️', label: 'Video Logopedia' },
  sports:         { bg: '#fee2e2', icon: '⚽',  label: 'Video Deportes' },
  veterinary:     { bg: '#d1fae5', icon: '🐾',  label: 'Video Veterinaria' },
  hairdresser:    { bg: '#fef3c7', icon: '✂️',  label: 'Video Peluquería' },
  beauty:         { bg: '#fce7f3', icon: '✨',  label: 'Video Estética' },
  estetica:       { bg: '#fce7f3', icon: '✨',  label: 'Video Estética' },
  fertility:      { bg: '#cffafe', icon: '🌸',  label: 'Video Fertilidad' },
  abogados:       { bg: '#dbeafe', icon: '⚖️',   label: 'Video Abogados' },
  education:      { bg: '#fef9c3', icon: '📚',  label: 'Video Educación' },
};

// ─── Placeholder generator ────────────────────────────────────────────────────

/**
 * Generate an SVG placeholder data URI for a video poster.
 * Used when no real poster is provided.
 */
function makeSvgVideoPoster(vertical, videoType) {
  const conf = VIDEO_PLACEHOLDER_COLORS[vertical] ?? VIDEO_PLACEHOLDER_COLORS.dental;
  const dims = videoType === 'backgroundVideo' || videoType === 'ambientLoop'
    ? { w: 1920, h: 1080 }
    : videoType === 'heroVideo'
      ? { w: 1280, h: 720 }
      : { w: 800, h: 450 };

  const label = `${conf.icon} ${conf.label}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dims.w}" height="${dims.h}">
  <rect width="100%" height="100%" fill="${conf.bg}"/>
  <text x="50%" y="45%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui" font-size="48" fill="#64748b">${conf.icon}</text>
  <text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui" font-size="18" fill="#94a3b8">${label}</text>
  <text x="50%" y="68%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui" font-size="14" fill="#cbd5e1">▶ Video placeholder — reemplazar con asset real</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ─── Video config builder ─────────────────────────────────────────────────────

/**
 * Build full video configuration for a video entry.
 * Enforces autoplay safety (muted required).
 *
 * @param {Object} videoManifestEntry - partial config from manifest
 * @param {string} vertical
 * @param {string} type - from VIDEO_TYPES
 * @returns {Object} complete video config
 */
export function buildVideoConfig(videoManifestEntry = {}, vertical = 'dental', type = 'heroVideo') {
  const isAmbient = type === 'ambientLoop' || type === 'backgroundVideo';
  const base = isAmbient ? { ...AMBIENT_DEFAULTS } : { ...VIDEO_DEFAULTS };

  const config = {
    ...base,
    ...videoManifestEntry,
    type,
    // Security: autoplay requires muted
    muted: videoManifestEntry.autoplay ? true : (videoManifestEntry.muted ?? base.muted),
    // Poster fallback
    poster: videoManifestEntry.poster ?? makeSvgVideoPoster(vertical, type),
    // Sources array (multiple formats for browser compat)
    sources: videoManifestEntry.sources ?? (videoManifestEntry.src
      ? [{ src: videoManifestEntry.src, type: 'video/mp4' }]
      : []),
    // Static fallback for when video cannot play
    staticFallback: videoManifestEntry.staticFallback ?? null,
    placeholder: !videoManifestEntry.src && !videoManifestEntry.sources?.length,
  };

  return config;
}

/**
 * Resolve the full video section from a V1.7 manifest.
 *
 * @param {Object} manifest
 * @param {string} vertical
 * @returns {Object} resolved video config map
 */
export function resolveVideoManifest(manifest = {}, vertical = 'dental') {
  const v = manifest.video ?? {};

  return {
    hero:         buildVideoConfig(v.hero        ?? {}, vertical, 'heroVideo'),
    background:   buildVideoConfig(v.background  ?? {}, vertical, 'backgroundVideo'),
    services:     buildVideoConfig(v.services    ?? {}, vertical, 'serviceVideo'),
    testimonials: buildVideoConfig(v.testimonials ?? {}, vertical, 'testimonialVideo'),
    explainer:    buildVideoConfig(v.explainer   ?? {}, vertical, 'explainerVideo'),
    team:         buildVideoConfig(v.team        ?? {}, vertical, 'teamVideo'),
    ambient:      buildVideoConfig(v.ambient     ?? {}, vertical, 'ambientLoop'),
  };
}

/**
 * Get a safe video component props object for HTML5 video element.
 * Removes internal factory fields, leaves only valid HTML attrs.
 */
export function getVideoElementProps(videoConfig) {
  const { src, muted, autoplay, controls, loop, preload, poster, lazy } = videoConfig;
  return {
    src:      src ?? undefined,
    muted:    muted ?? true,
    autoPlay: autoplay ?? false,
    controls: controls ?? true,
    loop:     loop ?? false,
    preload:  preload ?? 'metadata',
    poster:   poster ?? undefined,
    loading:  lazy ? 'lazy' : 'eager',
  };
}

/**
 * Check if video should be disabled (mobile + mobileEnabled=false, or data saver, or ambient).
 */
export function shouldDisableVideo(videoConfig, context = {}) {
  const { isMobile = false, isDataSaver = false, reducedMotion = false } = context;

  if (reducedMotion && (videoConfig.type === 'ambientLoop' || videoConfig.autoplay)) return true;
  if (isMobile && !videoConfig.mobileEnabled) return true;
  if (isDataSaver && videoConfig.dataSaverAware) return true;
  return false;
}

/**
 * Get the poster-only fallback config when video is disabled.
 */
export function getVideoFallback(videoConfig) {
  return {
    type:    'image',
    src:     videoConfig.poster,
    alt:     `${videoConfig.type} fallback image`,
    placeholder: videoConfig.placeholder,
  };
}

// ─── Performance helpers ──────────────────────────────────────────────────────

/**
 * Validate video size constraint (used in performance budget checks).
 * Returns warnings, not errors (videos are optional content).
 */
export function validateVideoPerformance(videoConfig) {
  const warnings = [];
  if (videoConfig.preload === 'auto') {
    warnings.push('preload=auto may hurt initial load. Consider preload=metadata.');
  }
  if (videoConfig.autoplay && !videoConfig.lazy) {
    warnings.push('autoplay video without lazy loading will block initial render.');
  }
  if (videoConfig.type === 'backgroundVideo' && videoConfig.mobileEnabled) {
    warnings.push('Background video on mobile may cause high data usage. Consider mobileEnabled: false.');
  }
  return warnings;
}
