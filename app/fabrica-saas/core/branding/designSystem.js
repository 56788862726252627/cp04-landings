/**
 * CORE · designSystem.js · V1.5
 * Design tokens parametrizables por vertical y cliente.
 * Importable desde cualquier componente generado o del núcleo.
 */

export const VERTICAL_TOKENS = {
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
    typography: {
      fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
      fontSizeXs:  '11px',
      fontSizeSm:  '13px',
      fontSizeMd:  '15px',
      fontSizeLg:  '18px',
      fontSizeXl:  '22px',
      fontSize2xl: '28px',
      fontSize3xl: '36px',
      weightNormal: 400,
      weightMedium: 500,
      weightSemibold: 600,
      weightBold: 700,
      weightExtrabold: 800,
    },
    spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' },
    radii: { sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px' },
    shadows: {
      card:     '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      elevated: '0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)',
      hero:     '0 20px 25px -5px rgba(0,0,0,0.10), 0 10px 10px -5px rgba(0,0,0,0.04)',
      inset:    'inset 0 2px 4px rgba(0,0,0,0.06)',
    },
    sector: {
      icon:    '🦷',
      label:   'Clínica Dental',
      entity:  'Paciente',
      plural:  'Pacientes',
      service: 'Tratamiento',
      booking: 'Cita',
    },
  },
  fisioterapia: {
    colors: {
      primary:      '#0d9488',
      primaryLight: '#ccfbf1',
      primaryDark:  '#134e4a',
      secondary:    '#0891b2',
      accent:       '#22d3ee',
      surface:      '#f0fdfa',
      surfaceAlt:   '#f0fdf4',
      background:   '#f8fafc',
      card:         '#ffffff',
      text:         '#0f172a',
      textMuted:    '#64748b',
      textLight:    '#94a3b8',
      border:       '#e2e8f0',
      borderLight:  '#f1f5f9',
      success:      '#059669',
      warning:      '#d97706',
      error:        '#dc2626',
      info:         '#0891b2',
    },
    typography: {
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSizeXs: '11px', fontSizeSm: '13px', fontSizeMd: '15px', fontSizeLg: '18px',
      fontSizeXl: '22px', fontSize2xl: '28px', fontSize3xl: '36px',
      weightNormal: 400, weightMedium: 500, weightSemibold: 600, weightBold: 700, weightExtrabold: 800,
    },
    spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' },
    radii:   { sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px' },
    shadows: {
      card:     '0 1px 3px rgba(0,0,0,0.08)',
      elevated: '0 4px 6px -1px rgba(0,0,0,0.10)',
      hero:     '0 20px 25px -5px rgba(0,0,0,0.10)',
      inset:    'inset 0 2px 4px rgba(0,0,0,0.06)',
    },
    sector: { icon: '🏥', label: 'Clínica Fisioterapia', entity: 'Paciente', plural: 'Pacientes', service: 'Tratamiento', booking: 'Sesión' },
  },
  estetica: {
    colors: {
      primary:      '#9d174d',
      primaryLight: '#fce7f3',
      primaryDark:  '#831843',
      secondary:    '#7e22ce',
      accent:       '#ec4899',
      surface:      '#fdf4ff',
      surfaceAlt:   '#fef0f9',
      background:   '#fafafa',
      card:         '#ffffff',
      text:         '#1a0a2e',
      textMuted:    '#6b7280',
      textLight:    '#9ca3af',
      border:       '#e5e7eb',
      borderLight:  '#f3f4f6',
      success:      '#059669',
      warning:      '#d97706',
      error:        '#dc2626',
      info:         '#7e22ce',
    },
    typography: {
      fontFamily: "'Inter', 'Georgia', system-ui, sans-serif",
      fontSizeXs: '11px', fontSizeSm: '13px', fontSizeMd: '15px', fontSizeLg: '18px',
      fontSizeXl: '22px', fontSize2xl: '28px', fontSize3xl: '36px',
      weightNormal: 400, weightMedium: 500, weightSemibold: 600, weightBold: 700, weightExtrabold: 800,
    },
    spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' },
    radii:   { sm: '8px', md: '14px', lg: '20px', xl: '32px', full: '9999px' },
    shadows: {
      card:     '0 2px 8px rgba(157,23,77,0.08)',
      elevated: '0 8px 16px -4px rgba(157,23,77,0.12)',
      hero:     '0 24px 32px -8px rgba(0,0,0,0.12)',
      inset:    'inset 0 2px 4px rgba(0,0,0,0.06)',
    },
    sector: { icon: '✨', label: 'Centro de Estética', entity: 'Cliente', plural: 'Clientes', service: 'Tratamiento', booking: 'Cita' },
  },
  abogados: {
    colors: {
      primary:      '#1e3a5f',
      primaryLight: '#dbeafe',
      primaryDark:  '#1e2d3d',
      secondary:    '#374151',
      accent:       '#2563eb',
      surface:      '#f8fafc',
      surfaceAlt:   '#f1f5f9',
      background:   '#f8fafc',
      card:         '#ffffff',
      text:         '#111827',
      textMuted:    '#6b7280',
      textLight:    '#9ca3af',
      border:       '#d1d5db',
      borderLight:  '#e5e7eb',
      success:      '#059669',
      warning:      '#d97706',
      error:        '#dc2626',
      info:         '#2563eb',
    },
    typography: {
      fontFamily: "'Inter', 'Georgia', 'Times New Roman', serif",
      fontSizeXs: '11px', fontSizeSm: '13px', fontSizeMd: '15px', fontSizeLg: '18px',
      fontSizeXl: '22px', fontSize2xl: '28px', fontSize3xl: '36px',
      weightNormal: 400, weightMedium: 500, weightSemibold: 600, weightBold: 700, weightExtrabold: 800,
    },
    spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' },
    radii:   { sm: '4px', md: '6px', lg: '10px', xl: '16px', full: '9999px' },
    shadows: {
      card:     '0 1px 3px rgba(0,0,0,0.10)',
      elevated: '0 4px 8px -2px rgba(0,0,0,0.12)',
      hero:     '0 16px 24px -4px rgba(0,0,0,0.10)',
      inset:    'inset 0 2px 4px rgba(0,0,0,0.06)',
    },
    sector: { icon: '⚖️', label: 'Despacho de Abogados', entity: 'Cliente', plural: 'Clientes', service: 'Consulta', booking: 'Consulta' },
  },
};

/**
 * Obtiene los tokens de un vertical con override de colores del branding del manifest.
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
}`;
}

export function getVerticalSector(vertical = 'dental') {
  return (VERTICAL_TOKENS[vertical] ?? VERTICAL_TOKENS.dental).sector;
}
