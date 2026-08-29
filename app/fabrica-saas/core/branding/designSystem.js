/**
 * CORE · designSystem.js · V1.6
 * Design tokens parametrizables por vertical y cliente.
 * V1.6: 10 verticals + extended tokens (density, style, media, CTA)
 * Importable desde cualquier componente generado o del núcleo.
 */

// ─── Shared typography scale ─────────────────────────────────────────────────

const TYPO_BASE = {
  fontSizeXs: '11px', fontSizeSm: '13px', fontSizeMd: '15px', fontSizeLg: '18px',
  fontSizeXl: '22px', fontSize2xl: '28px', fontSize3xl: '36px',
  weightNormal: 400, weightMedium: 500, weightSemibold: 600, weightBold: 700, weightExtrabold: 800,
};

const SHADOWS_DEFAULT = {
  card:     '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  elevated: '0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)',
  hero:     '0 20px 25px -5px rgba(0,0,0,0.10), 0 10px 10px -5px rgba(0,0,0,0.04)',
  inset:    'inset 0 2px 4px rgba(0,0,0,0.06)',
};

const SPACING_DEFAULT = { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' };

// ─── Vertical token definitions ───────────────────────────────────────────────

export const VERTICAL_TOKENS = {

  // ── DENTAL ──────────────────────────────────────────────────────────────
  dental: {
    colors: {
      primary:       '#0c7873',
      primaryLight:  '#d1fae5',
      primaryDark:   '#064e3b',
      secondary:     '#0369a1',
      accent:        '#06b6d4',
      surface:       '#f0fdfa',
      surfaceAlt:    '#ecfdf5',
      background:    '#f8fafc',
      card:          '#ffffff',
      text:          '#0f172a',
      textMuted:     '#64748b',
      textLight:     '#94a3b8',
      border:        '#e2e8f0',
      borderLight:   '#f1f5f9',
      success:       '#059669',
      warning:       '#d97706',
      error:         '#dc2626',
      info:          '#0284c7',
    },
    typography: { fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif", ...TYPO_BASE },
    spacing:    SPACING_DEFAULT,
    radii:      { sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px' },
    shadows:    SHADOWS_DEFAULT,
    style: {
      density:        'comfortable',
      iconStyle:      'filled',
      heroStyle:      'gradient-teal',
      cardStyle:      'elevated-border',
      ctaStyle:       'rounded-solid',
      sidebarStyle:   'light-border',
      imageTreatment: 'rounded-soft',
    },
    sector: {
      icon: '🦷', label: 'Clínica Dental', entity: 'Paciente', plural: 'Pacientes',
      service: 'Tratamiento', booking: 'Cita',
    },
  },

  // ── LEGAL ────────────────────────────────────────────────────────────────
  legal: {
    colors: {
      primary:       '#1e3a5f',
      primaryLight:  '#dbeafe',
      primaryDark:   '#1e2d3d',
      secondary:     '#374151',
      accent:        '#2563eb',
      surface:       '#f8fafc',
      surfaceAlt:    '#f1f5f9',
      background:    '#f8fafc',
      card:          '#ffffff',
      text:          '#111827',
      textMuted:     '#6b7280',
      textLight:     '#9ca3af',
      border:        '#d1d5db',
      borderLight:   '#e5e7eb',
      success:       '#059669',
      warning:       '#d97706',
      error:         '#dc2626',
      info:          '#2563eb',
    },
    typography: { fontFamily: "'Inter', 'Georgia', 'Times New Roman', serif", ...TYPO_BASE },
    spacing:    SPACING_DEFAULT,
    radii:      { sm: '4px', md: '6px', lg: '10px', xl: '16px', full: '9999px' },
    shadows:    { ...SHADOWS_DEFAULT, card: '0 1px 3px rgba(0,0,0,0.10)', elevated: '0 4px 8px -2px rgba(0,0,0,0.12)' },
    style: {
      density:        'compact',
      iconStyle:      'outline',
      heroStyle:      'dark-navy',
      cardStyle:      'flat-border',
      ctaStyle:       'square-solid',
      sidebarStyle:   'dark-navy',
      imageTreatment: 'sharp',
    },
    sector: {
      icon: '⚖️', label: 'Despacho de Abogados', entity: 'Cliente', plural: 'Clientes',
      service: 'Consulta', booking: 'Consulta',
    },
  },

  // ── FISIOTERAPIA / PHYSIO ────────────────────────────────────────────────
  physio: {
    colors: {
      primary:       '#0d9488',
      primaryLight:  '#ccfbf1',
      primaryDark:   '#134e4a',
      secondary:     '#0891b2',
      accent:        '#22d3ee',
      surface:       '#f0fdfa',
      surfaceAlt:    '#f0fdf4',
      background:    '#f8fafc',
      card:          '#ffffff',
      text:          '#0f172a',
      textMuted:     '#64748b',
      textLight:     '#94a3b8',
      border:        '#e2e8f0',
      borderLight:   '#f1f5f9',
      success:       '#059669',
      warning:       '#d97706',
      error:         '#dc2626',
      info:          '#0891b2',
    },
    typography: { fontFamily: "'Inter', system-ui, sans-serif", ...TYPO_BASE },
    spacing:    SPACING_DEFAULT,
    radii:      { sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px' },
    shadows:    SHADOWS_DEFAULT,
    style: {
      density:        'comfortable',
      iconStyle:      'filled',
      heroStyle:      'gradient-teal-light',
      cardStyle:      'elevated-border',
      ctaStyle:       'rounded-solid',
      sidebarStyle:   'light-border',
      imageTreatment: 'rounded-soft',
    },
    sector: {
      icon: '🏥', label: 'Clínica de Fisioterapia', entity: 'Paciente', plural: 'Pacientes',
      service: 'Tratamiento', booking: 'Sesión',
    },
  },

  // ── PSYCHOLOGY ───────────────────────────────────────────────────────────
  psychology: {
    colors: {
      primary:       '#7c3aed',
      primaryLight:  '#ede9fe',
      primaryDark:   '#4c1d95',
      secondary:     '#6d28d9',
      accent:        '#a78bfa',
      surface:       '#faf5ff',
      surfaceAlt:    '#f3e8ff',
      background:    '#fafafa',
      card:          '#ffffff',
      text:          '#1e1b4b',
      textMuted:     '#6b7280',
      textLight:     '#9ca3af',
      border:        '#e5e7eb',
      borderLight:   '#f3f4f6',
      success:       '#059669',
      warning:       '#d97706',
      error:         '#dc2626',
      info:          '#7c3aed',
    },
    typography: { fontFamily: "'Inter', 'Georgia', system-ui, sans-serif", ...TYPO_BASE },
    spacing:    SPACING_DEFAULT,
    radii:      { sm: '8px', md: '14px', lg: '20px', xl: '32px', full: '9999px' },
    shadows:    { ...SHADOWS_DEFAULT, card: '0 2px 8px rgba(124,58,237,0.07)', elevated: '0 8px 16px -4px rgba(124,58,237,0.10)' },
    style: {
      density:        'spacious',
      iconStyle:      'soft',
      heroStyle:      'warm-purple',
      cardStyle:      'soft-shadow',
      ctaStyle:       'pill-solid',
      sidebarStyle:   'light-purple',
      imageTreatment: 'circle-soft',
    },
    sector: {
      icon: '🧠', label: 'Consulta de Psicología', entity: 'Paciente', plural: 'Pacientes',
      service: 'Sesión', booking: 'Sesión',
    },
  },

  // ── SPEECH THERAPY / LOGOPEDIA ───────────────────────────────────────────
  'speech-therapy': {
    colors: {
      primary:       '#0891b2',
      primaryLight:  '#cffafe',
      primaryDark:   '#164e63',
      secondary:     '#0369a1',
      accent:        '#38bdf8',
      surface:       '#f0f9ff',
      surfaceAlt:    '#e0f2fe',
      background:    '#f8fafc',
      card:          '#ffffff',
      text:          '#0c1a2e',
      textMuted:     '#64748b',
      textLight:     '#94a3b8',
      border:        '#e2e8f0',
      borderLight:   '#f1f5f9',
      success:       '#059669',
      warning:       '#d97706',
      error:         '#dc2626',
      info:          '#0891b2',
    },
    typography: { fontFamily: "'Inter', system-ui, sans-serif", ...TYPO_BASE },
    spacing:    SPACING_DEFAULT,
    radii:      { sm: '8px', md: '12px', lg: '18px', xl: '28px', full: '9999px' },
    shadows:    SHADOWS_DEFAULT,
    style: {
      density:        'comfortable',
      iconStyle:      'filled',
      heroStyle:      'sky-wave',
      cardStyle:      'elevated-border',
      ctaStyle:       'rounded-solid',
      sidebarStyle:   'light-sky',
      imageTreatment: 'rounded-medium',
    },
    sector: {
      icon: '🗣️', label: 'Logopedia', entity: 'Paciente', plural: 'Pacientes',
      service: 'Sesión', booking: 'Sesión',
    },
  },

  // ── SPORTS / DEPORTE ─────────────────────────────────────────────────────
  sports: {
    colors: {
      primary:       '#dc2626',
      primaryLight:  '#fee2e2',
      primaryDark:   '#7f1d1d',
      secondary:     '#ea580c',
      accent:        '#f97316',
      surface:       '#fff7ed',
      surfaceAlt:    '#fef3c7',
      background:    '#f9fafb',
      card:          '#ffffff',
      text:          '#111827',
      textMuted:     '#6b7280',
      textLight:     '#9ca3af',
      border:        '#e5e7eb',
      borderLight:   '#f3f4f6',
      success:       '#16a34a',
      warning:       '#d97706',
      error:         '#dc2626',
      info:          '#0284c7',
    },
    typography: { fontFamily: "'Inter', 'Roboto', system-ui, sans-serif", ...TYPO_BASE },
    spacing:    SPACING_DEFAULT,
    radii:      { sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
    shadows:    { ...SHADOWS_DEFAULT, hero: '0 20px 40px -8px rgba(220,38,38,0.20)' },
    style: {
      density:        'compact',
      iconStyle:      'bold',
      heroStyle:      'dark-energy',
      cardStyle:      'sharp-border',
      ctaStyle:       'square-solid',
      sidebarStyle:   'dark-strong',
      imageTreatment: 'sharp',
    },
    sector: {
      icon: '⚽', label: 'Club Deportivo', entity: 'Socio', plural: 'Socios',
      service: 'Actividad', booking: 'Reserva',
    },
  },

  // ── VETERINARY ───────────────────────────────────────────────────────────
  veterinary: {
    colors: {
      primary:       '#059669',
      primaryLight:  '#d1fae5',
      primaryDark:   '#065f46',
      secondary:     '#0891b2',
      accent:        '#34d399',
      surface:       '#f0fdf4',
      surfaceAlt:    '#ecfdf5',
      background:    '#f8fafc',
      card:          '#ffffff',
      text:          '#0f172a',
      textMuted:     '#64748b',
      textLight:     '#94a3b8',
      border:        '#e2e8f0',
      borderLight:   '#f1f5f9',
      success:       '#059669',
      warning:       '#d97706',
      error:         '#dc2626',
      info:          '#0284c7',
    },
    typography: { fontFamily: "'Inter', system-ui, sans-serif", ...TYPO_BASE },
    spacing:    SPACING_DEFAULT,
    radii:      { sm: '8px', md: '12px', lg: '18px', xl: '28px', full: '9999px' },
    shadows:    SHADOWS_DEFAULT,
    style: {
      density:        'comfortable',
      iconStyle:      'filled',
      heroStyle:      'nature-green',
      cardStyle:      'elevated-border',
      ctaStyle:       'rounded-solid',
      sidebarStyle:   'light-green',
      imageTreatment: 'rounded-soft',
    },
    sector: {
      icon: '🐾', label: 'Clínica Veterinaria', entity: 'Propietario', plural: 'Propietarios',
      service: 'Consulta', booking: 'Cita',
    },
  },

  // ── HAIRDRESSER / PELUQUERÍA ─────────────────────────────────────────────
  hairdresser: {
    colors: {
      primary:       '#b45309',
      primaryLight:  '#fef3c7',
      primaryDark:   '#78350f',
      secondary:     '#d97706',
      accent:        '#f59e0b',
      surface:       '#fffbeb',
      surfaceAlt:    '#fef9c3',
      background:    '#fafaf9',
      card:          '#ffffff',
      text:          '#1c1917',
      textMuted:     '#78716c',
      textLight:     '#a8a29e',
      border:        '#e7e5e4',
      borderLight:   '#f5f5f4',
      success:       '#059669',
      warning:       '#d97706',
      error:         '#dc2626',
      info:          '#0284c7',
    },
    typography: { fontFamily: "'Inter', 'Playfair Display', Georgia, serif", ...TYPO_BASE },
    spacing:    SPACING_DEFAULT,
    radii:      { sm: '6px', md: '12px', lg: '20px', xl: '32px', full: '9999px' },
    shadows:    { ...SHADOWS_DEFAULT, card: '0 2px 8px rgba(180,83,9,0.08)' },
    style: {
      density:        'comfortable',
      iconStyle:      'soft',
      heroStyle:      'warm-amber',
      cardStyle:      'soft-shadow',
      ctaStyle:       'pill-solid',
      sidebarStyle:   'warm-cream',
      imageTreatment: 'rounded-soft',
    },
    sector: {
      icon: '✂️', label: 'Salón de Peluquería', entity: 'Cliente', plural: 'Clientes',
      service: 'Servicio', booking: 'Cita',
    },
  },

  // ── BEAUTY / ESTÉTICA ────────────────────────────────────────────────────
  beauty: {
    colors: {
      primary:       '#9d174d',
      primaryLight:  '#fce7f3',
      primaryDark:   '#831843',
      secondary:     '#7e22ce',
      accent:        '#ec4899',
      surface:       '#fdf4ff',
      surfaceAlt:    '#fef0f9',
      background:    '#fafafa',
      card:          '#ffffff',
      text:          '#1a0a2e',
      textMuted:     '#6b7280',
      textLight:     '#9ca3af',
      border:        '#e5e7eb',
      borderLight:   '#f3f4f6',
      success:       '#059669',
      warning:       '#d97706',
      error:         '#dc2626',
      info:          '#7e22ce',
    },
    typography: { fontFamily: "'Inter', 'Georgia', system-ui, sans-serif", ...TYPO_BASE },
    spacing:    SPACING_DEFAULT,
    radii:      { sm: '8px', md: '14px', lg: '20px', xl: '32px', full: '9999px' },
    shadows:    { ...SHADOWS_DEFAULT, card: '0 2px 8px rgba(157,23,77,0.08)', elevated: '0 8px 16px -4px rgba(157,23,77,0.12)' },
    style: {
      density:        'spacious',
      iconStyle:      'soft',
      heroStyle:      'pink-gradient',
      cardStyle:      'soft-shadow',
      ctaStyle:       'pill-solid',
      sidebarStyle:   'light-pink',
      imageTreatment: 'circle-soft',
    },
    sector: {
      icon: '✨', label: 'Centro de Estética', entity: 'Cliente', plural: 'Clientes',
      service: 'Tratamiento', booking: 'Cita',
    },
  },

  // ── FERTILITY / FERTILIDAD ───────────────────────────────────────────────
  fertility: {
    colors: {
      primary:       '#0e7490',
      primaryLight:  '#cffafe',
      primaryDark:   '#164e63',
      secondary:     '#0891b2',
      accent:        '#67e8f9',
      surface:       '#f0f9ff',
      surfaceAlt:    '#ecfeff',
      background:    '#f8fafc',
      card:          '#ffffff',
      text:          '#0c2340',
      textMuted:     '#64748b',
      textLight:     '#94a3b8',
      border:        '#e0f2fe',
      borderLight:   '#f0f9ff',
      success:       '#059669',
      warning:       '#d97706',
      error:         '#dc2626',
      info:          '#0e7490',
    },
    typography: { fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", ...TYPO_BASE },
    spacing:    SPACING_DEFAULT,
    radii:      { sm: '8px', md: '14px', lg: '22px', xl: '36px', full: '9999px' },
    shadows:    { ...SHADOWS_DEFAULT, card: '0 2px 8px rgba(14,116,144,0.08)' },
    style: {
      density:        'spacious',
      iconStyle:      'soft',
      heroStyle:      'ocean-calm',
      cardStyle:      'soft-shadow',
      ctaStyle:       'pill-solid',
      sidebarStyle:   'light-cyan',
      imageTreatment: 'rounded-large',
    },
    sector: {
      icon: '🌸', label: 'Clínica de Fertilidad', entity: 'Paciente', plural: 'Pacientes',
      service: 'Tratamiento', booking: 'Consulta',
    },
  },

  // ── BACKWARD COMPAT ALIASES ───────────────────────────────────────────────
  fisioterapia: null,  // → physio (resolved below)
  estetica:     null,  // → beauty (resolved below)
  abogados:     null,  // → legal  (resolved below)
};

// Resolve backward-compat aliases
VERTICAL_TOKENS.fisioterapia = VERTICAL_TOKENS.physio;
VERTICAL_TOKENS.estetica     = VERTICAL_TOKENS.beauty;
VERTICAL_TOKENS.abogados     = VERTICAL_TOKENS.legal;

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * Obtiene los tokens de un vertical con override de colores del branding del manifest.
 * @param {string} vertical
 * @param {Object} brandingOverride - { primaryColor, secondaryColor, accentColor, bgColor }
 */
export function getTokens(vertical = 'dental', brandingOverride = {}) {
  const base = VERTICAL_TOKENS[vertical] ?? VERTICAL_TOKENS.dental;
  return {
    ...base,
    colors: {
      ...base.colors,
      ...(brandingOverride.primaryColor   ? { primary:   brandingOverride.primaryColor }   : {}),
      ...(brandingOverride.secondaryColor ? { secondary: brandingOverride.secondaryColor } : {}),
      ...(brandingOverride.accentColor    ? { accent:    brandingOverride.accentColor }    : {}),
      ...(brandingOverride.bgColor        ? { surface:   brandingOverride.bgColor }        : {}),
    },
  };
}

/** Alias for V1.6 — same as getTokens */
export const getVerticalTheme = getTokens;

/**
 * Genera un bloque CSS con custom properties del design system.
 */
export function generateThemeCss(tokens) {
  const c = tokens.colors;
  const t = tokens.typography;
  const r = tokens.radii;
  const s = tokens.shadows;
  return `:root {
  --color-primary:       ${c.primary};
  --color-primary-light: ${c.primaryLight};
  --color-primary-dark:  ${c.primaryDark};
  --color-secondary:     ${c.secondary};
  --color-accent:        ${c.accent};
  --color-surface:       ${c.surface};
  --color-bg:            ${c.background};
  --color-card:          ${c.card};
  --color-text:          ${c.text};
  --color-text-muted:    ${c.textMuted};
  --color-border:        ${c.border};
  --font-sans:           ${t.fontFamily};
  --radius-md:           ${r.md};
  --radius-lg:           ${r.lg};
  --shadow-card:         ${s.card};
  --shadow-elevated:     ${s.elevated};
  /* V1.6 shadcn-compatible */
  --primary:             ${c.primary};
  --background:          ${c.background};
  --foreground:          ${c.text};
  --card:                ${c.card};
  --border:              ${c.border};
  --muted:               ${c.surface};
  --muted-foreground:    ${c.textMuted};
  --radius:              ${r.md};
}`;
}

/**
 * Returns the sector metadata for a vertical.
 */
export function getVerticalSector(vertical = 'dental') {
  return (VERTICAL_TOKENS[vertical] ?? VERTICAL_TOKENS.dental).sector;
}

/**
 * Returns the style metadata (density, heroStyle, etc.) for a vertical.
 */
export function getVerticalStyle(vertical = 'dental') {
  return (VERTICAL_TOKENS[vertical] ?? VERTICAL_TOKENS.dental).style ?? {};
}

/**
 * Returns all supported vertical keys.
 */
export function getSupportedVerticals() {
  return Object.keys(VERTICAL_TOKENS).filter(k => {
    const v = VERTICAL_TOKENS[k];
    return v !== null && v !== undefined && typeof v === 'object';
  });
}
