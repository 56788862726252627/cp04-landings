/**
 * Factory Media Engine V1.6
 * Handles hero images, gallery, team, services, favicons, logos,
 * social preview, and video — all parametrizable from manifest.
 *
 * When no real assets are provided, returns sector-neutral placeholders.
 * No copyright-dubious images are fetched. All placeholder paths are
 * relative data URIs or documented public-domain sources.
 */

// ─── Placeholder generators ───────────────────────────────────────────────────

/**
 * Build an SVG placeholder data URI for a given ratio/color/label.
 * Used when no real image is provided in the manifest.
 */
export function makeSvgPlaceholder({ width = 800, height = 400, bg = '#e2e8f0', fg = '#94a3b8', label = '' } = {}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui" font-size="16" fill="${fg}">${label}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Returns a sector-appropriate placeholder image config.
 * @param {string} vertical
 * @param {'hero'|'team'|'service'|'gallery'} type
 */
export function getPlaceholderImage(vertical = 'dental', type = 'hero') {
  const configs = {
    dental:         { bg: '#d1fae5', fg: '#065f46', icon: '🦷' },
    legal:          { bg: '#dbeafe', fg: '#1e3a5f', icon: '⚖️' },
    physio:         { bg: '#ccfbf1', fg: '#134e4a', icon: '🏥' },
    fisioterapia:   { bg: '#ccfbf1', fg: '#134e4a', icon: '🏥' },
    psychology:     { bg: '#ede9fe', fg: '#4c1d95', icon: '🧠' },
    'speech-therapy': { bg: '#cffafe', fg: '#164e63', icon: '🗣️' },
    sports:         { bg: '#fee2e2', fg: '#7f1d1d', icon: '⚽' },
    veterinary:     { bg: '#d1fae5', fg: '#065f46', icon: '🐾' },
    hairdresser:    { bg: '#fef3c7', fg: '#78350f', icon: '✂️' },
    beauty:         { bg: '#fce7f3', fg: '#831843', icon: '✨' },
    estetica:       { bg: '#fce7f3', fg: '#831843', icon: '✨' },
    fertility:      { bg: '#cffafe', fg: '#164e63', icon: '🌸' },
    abogados:       { bg: '#dbeafe', fg: '#1e3a5f', icon: '⚖️' },
  };

  const dims = {
    hero:    { w: 1200, h: 480, label: 'Hero Image' },
    team:    { w: 400,  h: 400, label: 'Team Photo' },
    service: { w: 600,  h: 400, label: 'Service Image' },
    gallery: { w: 800,  h: 600, label: 'Gallery' },
  };

  const conf = configs[vertical] ?? configs.dental;
  const dim  = dims[type] ?? dims.hero;
  const label = `${conf.icon} ${dim.label}`;

  return {
    src: makeSvgPlaceholder({ width: dim.w, height: dim.h, bg: conf.bg, fg: conf.fg, label }),
    alt: label,
    type,
    placeholder: true,
  };
}

// ─── Manifest media resolver ──────────────────────────────────────────────────

/**
 * Resolve media assets from manifest.media section.
 * Returns safe, complete asset config for use in generated components.
 *
 * @param {Object} manifest - the client manifest
 * @returns {Object} mediaConfig
 */
export function resolveManifestMedia(manifest = {}) {
  const vertical = manifest.vertical ?? manifest.sector ?? 'dental';
  const media    = manifest.media ?? {};
  const branding = manifest.branding ?? {};

  return {
    hero: media.hero
      ? { src: media.hero, alt: `${branding.nombre ?? 'Hero'} — imagen principal`, placeholder: false }
      : getPlaceholderImage(vertical, 'hero'),

    gallery: Array.isArray(media.gallery) && media.gallery.length > 0
      ? media.gallery.map((src, i) => ({ src, alt: `Galería ${i + 1}`, placeholder: false }))
      : [getPlaceholderImage(vertical, 'gallery')],

    team: Array.isArray(media.team) && media.team.length > 0
      ? media.team.map((m, i) => ({
          src:  m.photo ?? getPlaceholderImage(vertical, 'team').src,
          name: m.nombre ?? m.name ?? `Profesional ${i + 1}`,
          role: m.rol   ?? m.role ?? 'Especialista',
          placeholder: !m.photo,
        }))
      : [],

    services: Array.isArray(media.services)
      ? media.services.map((s, i) => ({
          src: s.image ?? getPlaceholderImage(vertical, 'service').src,
          label: s.label ?? `Servicio ${i + 1}`,
          placeholder: !s.image,
        }))
      : [],

    video: media.video
      ? { src: media.video, type: media.videoType ?? 'youtube', poster: media.videoPoster ?? null }
      : null,

    favicon: branding.favicon ?? null,
    logo:    branding.logo    ?? null,
    socialPreview: media.socialPreview ?? null,
  };
}

// ─── Favicon generator (re-export for consistency) ───────────────────────────

/**
 * Generate a favicon SVG data URI with a letter on a solid background.
 * @param {string} letter
 * @param {string} bg - hex background color
 * @param {string} fg - hex text color
 */
export function generateFaviconDataUri(letter = 'A', bg = '#0c7873', fg = '#ffffff') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="${bg}"/>
  <text x="16" y="22" text-anchor="middle" font-family="system-ui,sans-serif"
        font-size="18" font-weight="700" fill="${fg}">${letter}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate Open Graph / social preview meta tags string.
 * @param {Object} opts
 */
export function generateSocialMeta({ title, description, url, image, color } = {}) {
  return [
    title       ? `<meta property="og:title" content="${title}"/>` : '',
    description ? `<meta property="og:description" content="${description}"/>` : '',
    url         ? `<meta property="og:url" content="${url}"/>` : '',
    image       ? `<meta property="og:image" content="${image}"/>` : '',
    color       ? `<meta name="theme-color" content="${color}"/>` : '',
  ].filter(Boolean).join('\n  ');
}

// ─── V1.7 Video Engine extensions ────────────────────────────────────────────

const VIDEO_POSTER_COLORS = {
  dental: '#d1fae5', legal: '#dbeafe', physio: '#ccfbf1',
  fisioterapia: '#ccfbf1', psychology: '#ede9fe', 'speech-therapy': '#cffafe',
  sports: '#fee2e2', veterinary: '#d1fae5', hairdresser: '#fef3c7',
  beauty: '#fce7f3', estetica: '#fce7f3', fertility: '#cffafe',
  abogados: '#dbeafe', education: '#fef9c3',
};

/**
 * Generate an SVG data URI to use as a video poster placeholder.
 * @param {string} vertical
 * @param {'hero'|'background'|'service'|'ambient'} type
 * @returns {string} data URI
 */
export function getVideoPlaceholderPoster(vertical = 'dental', type = 'hero') {
  const bg   = VIDEO_POSTER_COLORS[vertical] ?? '#e2e8f0';
  const dims = type === 'background' || type === 'ambient'
    ? { w: 1920, h: 1080 }
    : { w: 1280, h: 720 };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dims.w}" height="${dims.h}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <text x="50%" y="48%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui" font-size="24" fill="#94a3b8">▶ Video Placeholder</text>
  <text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui" font-size="14" fill="#cbd5e1">${vertical} · ${type}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Build a safe video configuration from a manifest video entry.
 * Enforces autoplay safety (muted required when autoplay=true).
 *
 * @param {Object} entry - video section from manifest (hero, ambient, etc.)
 * @param {string} vertical
 * @param {string} type - video role
 * @returns {Object} complete video config
 */
export function buildVideoConfig(entry = {}, vertical = 'dental', type = 'heroVideo') {
  const isAmbient = type === 'ambientLoop' || type === 'backgroundVideo';
  const autoplay  = entry.autoplay ?? isAmbient;
  return {
    src:           entry.src      ?? null,
    sources:       entry.sources  ?? (entry.src ? [{ src: entry.src, type: 'video/mp4' }] : []),
    poster:        entry.poster   ?? getVideoPlaceholderPoster(vertical, type.replace('Video', '').replace('ambientLoop', 'ambient')),
    muted:         autoplay ? true : (entry.muted ?? true),
    autoplay,
    loop:          entry.loop     ?? isAmbient,
    controls:      entry.controls ?? !isAmbient,
    preload:       entry.preload  ?? (isAmbient ? 'auto' : 'metadata'),
    lazy:          entry.lazy     ?? true,
    mobileEnabled: entry.mobileEnabled ?? !isAmbient,
    type,
    placeholder:   !entry.src && !entry.sources?.length,
    staticFallback: entry.staticFallback ?? null,
  };
}

/**
 * Resolve V1.7 media (extends V1.6 resolveManifestMedia with full video engine).
 * @param {Object} manifest
 * @returns {Object} complete media config for V1.7 apps
 */
export function resolveManifestMediaV17(manifest = {}) {
  const base     = resolveManifestMedia(manifest);
  const vertical = manifest.vertical ?? manifest.sector ?? 'dental';
  const v        = manifest.video ?? {};

  return {
    ...base,
    videos: {
      hero:         buildVideoConfig(v.hero        ?? {}, vertical, 'heroVideo'),
      background:   buildVideoConfig(v.background  ?? {}, vertical, 'backgroundVideo'),
      services:     buildVideoConfig(v.services    ?? {}, vertical, 'serviceVideo'),
      testimonials: buildVideoConfig(v.testimonials ?? {}, vertical, 'testimonialVideo'),
      explainer:    buildVideoConfig(v.explainer   ?? {}, vertical, 'explainerVideo'),
      team:         buildVideoConfig(v.team        ?? {}, vertical, 'teamVideo'),
      ambient:      buildVideoConfig(v.ambient     ?? {}, vertical, 'ambientLoop'),
    },
    videoGlobalConfig: {
      autoplay:      v.autoplay      ?? false,
      muted:         v.muted         ?? true,
      mobileEnabled: v.mobileEnabled ?? false,
      lazyLoad:      v.lazyLoad      ?? true,
      poster:        v.poster        ?? null,
    },
  };
}
