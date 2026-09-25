/**
 * Brand Engine — Phase 5
 * Generates branding from brief + sector data.
 * No third-party branding. No real marks. Integrates with Premium Experience V2.
 */

export const BRAND_ENGINE_VERSION = '1.0.0';

// ─── Palettes ─────────────────────────────────────────────────────────────────

const SECTOR_PALETTES = Object.freeze({
  dental:     { primary:'#0369a1', secondary:'#0891b2', accent:'#10b981', surface:'#f0f9ff', bg:'#ffffff' },
  salud:      { primary:'#0284c7', secondary:'#0ea5e9', accent:'#06b6d4', surface:'#f0f9ff', bg:'#ffffff' },
  fisio:      { primary:'#0891b2', secondary:'#06b6d4', accent:'#10b981', surface:'#ecfeff', bg:'#ffffff' },
  estetica:   { primary:'#d97706', secondary:'#f59e0b', accent:'#e879f9', surface:'#fffbeb', bg:'#ffffff' },
  spa:        { primary:'#9333ea', secondary:'#a855f7', accent:'#ec4899', surface:'#fdf4ff', bg:'#ffffff' },
  padel:      { primary:'#ef4444', secondary:'#f97316', accent:'#eab308', surface:'#fef2f2', bg:'#ffffff' },
  fitness:    { primary:'#f97316', secondary:'#ef4444', accent:'#eab308', surface:'#fff7ed', bg:'#ffffff' },
  tech:       { primary:'#6366f1', secondary:'#8b5cf6', accent:'#06b6d4', surface:'#eef2ff', bg:'#fafafa' },
  educacion:  { primary:'#1d4ed8', secondary:'#2563eb', accent:'#10b981', surface:'#eff6ff', bg:'#ffffff' },
  legal:      { primary:'#1e293b', secondary:'#334155', accent:'#64748b', surface:'#f8fafc', bg:'#ffffff' },
  consultoria:{ primary:'#334155', secondary:'#475569', accent:'#0ea5e9', surface:'#f8fafc', bg:'#ffffff' },
  restaurante:{ primary:'#16a34a', secondary:'#15803d', accent:'#eab308', surface:'#f0fdf4', bg:'#ffffff' },
  comercio:   { primary:'#15803d', secondary:'#166534', accent:'#f97316', surface:'#f0fdf4', bg:'#ffffff' },
  veterinary: { primary:'#0d9488', secondary:'#0f766e', accent:'#f59e0b', surface:'#f0fdfa', bg:'#ffffff' },
  portfolio:  { primary:'#7c3aed', secondary:'#6d28d9', accent:'#ec4899', surface:'#fdf4ff', bg:'#0f0f0f' },
  analytics:  { primary:'#3b82f6', secondary:'#2563eb', accent:'#8b5cf6', surface:'#eff6ff', bg:'#f8fafc' },
  default:    { primary:'#3b82f6', secondary:'#2563eb', accent:'#10b981', surface:'#eff6ff', bg:'#ffffff' },
});

// ─── Typography Presets ───────────────────────────────────────────────────────

const SECTOR_TYPOGRAPHY = Object.freeze({
  dental:     { heading: 'DM Sans',  body: 'Inter',    mono: 'JetBrains Mono' },
  salud:      { heading: 'DM Sans',  body: 'Inter',    mono: 'JetBrains Mono' },
  fisio:      { heading: 'DM Sans',  body: 'Inter',    mono: 'JetBrains Mono' },
  estetica:   { heading: 'Playfair Display', body: 'Lato', mono: 'Courier New' },
  legal:      { heading: 'Merriweather', body: 'Source Serif 4', mono: 'Courier Prime' },
  consultoria:{ heading: 'Merriweather', body: 'Source Serif 4', mono: 'Courier Prime' },
  tech:       { heading: 'Space Grotesk', body: 'Inter', mono: 'JetBrains Mono' },
  educacion:  { heading: 'Nunito',   body: 'Open Sans',mono: 'Courier New' },
  veterinary: { heading: 'Nunito',   body: 'Open Sans',mono: 'Courier New' },
  restaurante:{ heading: 'Playfair Display', body: 'Lato', mono: 'Courier New' },
  default:    { heading: 'Inter',    body: 'Inter',    mono: 'JetBrains Mono' },
});

// ─── Tagline Templates ────────────────────────────────────────────────────────

const TAGLINE_TEMPLATES = Object.freeze({
  dental:     (n) => `${n} — Tu sonrisa, nuestra prioridad`,
  salud:      (n) => `${n} — Salud y bienestar para tu familia`,
  fisio:      (n) => `${n} — Recupera tu movimiento`,
  estetica:   (n) => `${n} — Tu mejor versión`,
  spa:        (n) => `${n} — Bienestar que se siente`,
  padel:      (n) => `${n} — Juega al máximo`,
  fitness:    (n) => `${n} — Tu mejor yo comienza hoy`,
  tech:       (n) => `${n} — Tecnología que impulsa`,
  educacion:  (n) => `${n} — Aprendizaje que transforma`,
  legal:      (n) => `${n} — Asesoría legal de confianza`,
  consultoria:(n) => `${n} — Resultados que cuentan`,
  restaurante:(n) => `${n} — Sabor con alma`,
  comercio:   (n) => `${n} — Lo que necesitas, cerca de ti`,
  veterinary: (n) => `${n} — Cuidando a quienes quieres`,
  portfolio:  (n) => `${n} — Creamos experiencias`,
  analytics:  (n) => `${n} — Datos que deciden`,
  default:    (n) => `${n} — Calidad y profesionalismo`,
});

// ─── Icon Strategy ────────────────────────────────────────────────────────────

const SECTOR_ICONS = Object.freeze({
  dental:     { emoji: '🦷', strategy: 'tooth-wave' },
  salud:      { emoji: '🏥', strategy: 'cross-plus' },
  fisio:      { emoji: '🫁', strategy: 'body-motion' },
  estetica:   { emoji: '✨', strategy: 'sparkle-glow' },
  spa:        { emoji: '🧖', strategy: 'zen-circle' },
  padel:      { emoji: '🎾', strategy: 'ball-slash' },
  fitness:    { emoji: '💪', strategy: 'bolt-flex' },
  tech:       { emoji: '🚀', strategy: 'code-pixel' },
  educacion:  { emoji: '📚', strategy: 'book-star' },
  legal:      { emoji: '⚖️', strategy: 'scale-serif' },
  consultoria:{ emoji: '💼', strategy: 'brief-arrow' },
  restaurante:{ emoji: '🍽️', strategy: 'plate-fork' },
  comercio:   { emoji: '🏪', strategy: 'store-tag' },
  veterinary: { emoji: '🐾', strategy: 'paw-heart' },
  portfolio:  { emoji: '🎨', strategy: 'palette-stroke' },
  analytics:  { emoji: '📊', strategy: 'bar-dot' },
  default:    { emoji: '⭐', strategy: 'generic-star' },
});

// ─── Main Generator ───────────────────────────────────────────────────────────

/**
 * Generate branding for a business from its brief.
 * @param {Object} brief   - validated brief
 * @param {Object} profile - business profile from analyzer
 * @returns {Object} branding
 */
export function generateBranding(brief = {}, profile = {}) {
  const sector   = brief.sector ?? 'default';
  const name     = brief.businessName ?? 'Business';
  const tone     = brief.brandTone ?? 'professional';
  const language = brief.language ?? 'es';

  const palette    = SECTOR_PALETTES[sector]    ?? SECTOR_PALETTES.default;
  const typography = SECTOR_TYPOGRAPHY[sector]  ?? SECTOR_TYPOGRAPHY.default;
  const iconData   = SECTOR_ICONS[sector]       ?? SECTOR_ICONS.default;
  const taglineFn  = TAGLINE_TEMPLATES[sector]  ?? TAGLINE_TEMPLATES.default;
  const tagline    = taglineFn(name);

  const initial    = name.charAt(0).toUpperCase();
  const shortName  = name.split(' ').slice(0, 2).join(' ');

  // Semantic colors
  const semanticColors = {
    success:  '#10b981',
    warning:  '#f59e0b',
    error:    '#ef4444',
    info:     palette.secondary,
    muted:    '#64748b',
    border:   `${palette.primary}20`,
    hover:    `${palette.primary}12`,
  };

  // Visual personality
  const personalityMap = {
    clinical:      { feel: 'clean trust', motion: 'subtle', depth: 'flat' },
    luxury:        { feel: 'premium warmth', motion: 'expressive', depth: 'layered' },
    dynamic:       { feel: 'energy action', motion: 'expressive', depth: 'raised' },
    authoritative: { feel: 'strong clarity', motion: 'subtle', depth: 'flat' },
    educational:   { feel: 'friendly growth', motion: 'standard', depth: 'subtle' },
    friendly:      { feel: 'warm approachable', motion: 'standard', depth: 'subtle' },
    playful:       { feel: 'creative surprise', motion: 'expressive', depth: 'layered' },
    human:         { feel: 'warm real', motion: 'standard', depth: 'subtle' },
    professional:  { feel: 'confident clear', motion: 'subtle', depth: 'flat' },
  };
  const personality = personalityMap[tone] ?? personalityMap.professional;

  // Logo strategy
  const logoStrategy = {
    type:        'initial-wordmark',
    initial,
    wordmark:    shortName,
    placeholder: `${initial}${name.split(' ')[1]?.charAt(0) ?? ''}`,
    faviconColor: palette.primary,
    manifestTheme: palette.primary,
    manifestBg:    palette.bg,
  };

  // Media/image direction
  const mediaDirection = profile.contentNeeds?.mediaNeeds === 'heavy'
    ? { style: 'editorial-photography', subjects: `${sector} environment, lifestyle`, avoidRealFaces: true }
    : { style: 'clean-minimal', subjects: `${sector} professional space`, avoidRealFaces: true };

  return {
    businessName:  name,
    tagline,
    shortName,
    sector,
    tone,
    language,
    palette,
    semanticColors,
    typography,
    iconStrategy:  iconData,
    personality,
    logoStrategy,
    mediaDirection,
    premiumExperienceCompatible: true,
    designSystemV2Compatible:    true,
    brandVersion:                BRAND_ENGINE_VERSION,
  };
}
