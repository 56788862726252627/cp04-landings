// Surface System — ADV-07

export const SURFACE_TYPE = Object.freeze({
  BASE:        'BASE',
  ELEVATED:    'ELEVATED',
  INTERACTIVE: 'INTERACTIVE',
  HIGHLIGHT:   'HIGHLIGHT',
  SUCCESS:     'SUCCESS',
  WARNING:     'WARNING',
  DANGER:      'DANGER',
  INFO:        'INFO',
  GLASS:       'GLASS',
});

export const SURFACE_PROFILE = Object.freeze({
  LAYERED:         'LAYERED',
  WARM_LAYERED:    'WARM_LAYERED',
  NEUTRAL_MINIMAL: 'NEUTRAL_MINIMAL',
  PREMIUM_GLASS:   'PREMIUM_GLASS',
  HIGH_CONTRAST:   'HIGH_CONTRAST',
});

const SURFACE_PALETTES = Object.freeze({
  WARM_LAYERED: {
    [SURFACE_TYPE.BASE]:        { bg: '#ffffff',  border: '#e5f0ee' },
    [SURFACE_TYPE.ELEVATED]:    { bg: '#f0fdfa',  border: '#ccfbf1' },
    [SURFACE_TYPE.INTERACTIVE]: { bg: '#f0fdfa',  border: '#0d9488', hover: '#ccfbf1' },
    [SURFACE_TYPE.HIGHLIGHT]:   { bg: '#fef3c7',  border: '#fde68a' },
    [SURFACE_TYPE.SUCCESS]:     { bg: '#f0fdf4',  border: '#bbf7d0', text: '#166534' },
    [SURFACE_TYPE.WARNING]:     { bg: '#fffbeb',  border: '#fde68a', text: '#92400e' },
    [SURFACE_TYPE.DANGER]:      { bg: '#fef2f2',  border: '#fecaca', text: '#991b1b' },
    [SURFACE_TYPE.INFO]:        { bg: '#eff6ff',  border: '#bfdbfe', text: '#1e40af' },
    [SURFACE_TYPE.GLASS]:       { bg: 'rgba(240,253,250,.85)', backdropBlur: '12px', border: 'rgba(13,148,136,.2)' },
  },
  NEUTRAL_MINIMAL: {
    [SURFACE_TYPE.BASE]:        { bg: '#ffffff',  border: '#e2e8f0' },
    [SURFACE_TYPE.ELEVATED]:    { bg: '#f8fafc',  border: '#e2e8f0' },
    [SURFACE_TYPE.INTERACTIVE]: { bg: '#f1f5f9',  border: '#cbd5e1', hover: '#e2e8f0' },
    [SURFACE_TYPE.HIGHLIGHT]:   { bg: '#f1f5f9',  border: '#94a3b8' },
    [SURFACE_TYPE.SUCCESS]:     { bg: '#f0fdf4',  border: '#bbf7d0', text: '#166534' },
    [SURFACE_TYPE.WARNING]:     { bg: '#fffbeb',  border: '#fde68a', text: '#92400e' },
    [SURFACE_TYPE.DANGER]:      { bg: '#fef2f2',  border: '#fecaca', text: '#991b1b' },
    [SURFACE_TYPE.INFO]:        { bg: '#eff6ff',  border: '#bfdbfe', text: '#1e40af' },
    [SURFACE_TYPE.GLASS]:       { bg: 'rgba(248,250,252,.9)', backdropBlur: '8px', border: 'rgba(203,213,225,.4)' },
  },
  PREMIUM_GLASS: {
    [SURFACE_TYPE.BASE]:        { bg: '#fdf8f3',  border: '#f3e6d6' },
    [SURFACE_TYPE.ELEVATED]:    { bg: '#ffffff',  border: '#f3e6d6', shadow: '0 8px 32px rgba(180,120,60,.08)' },
    [SURFACE_TYPE.INTERACTIVE]: { bg: '#fff7ed',  border: '#d97706', hover: '#fef3c7' },
    [SURFACE_TYPE.HIGHLIGHT]:   { bg: '#fef3c7',  border: '#fbbf24' },
    [SURFACE_TYPE.SUCCESS]:     { bg: '#f0fdf4',  border: '#bbf7d0', text: '#166534' },
    [SURFACE_TYPE.WARNING]:     { bg: '#fffbeb',  border: '#fde68a', text: '#92400e' },
    [SURFACE_TYPE.DANGER]:      { bg: '#fef2f2',  border: '#fecaca', text: '#991b1b' },
    [SURFACE_TYPE.INFO]:        { bg: '#eff6ff',  border: '#bfdbfe', text: '#1e40af' },
    [SURFACE_TYPE.GLASS]:       { bg: 'rgba(255,251,235,.80)', backdropBlur: '16px', border: 'rgba(217,119,6,.25)' },
  },
  LAYERED: {
    [SURFACE_TYPE.BASE]:        { bg: '#ffffff',  border: '#e5e7eb' },
    [SURFACE_TYPE.ELEVATED]:    { bg: '#f9fafb',  border: '#e5e7eb' },
    [SURFACE_TYPE.INTERACTIVE]: { bg: '#f3f4f6',  border: '#d1d5db', hover: '#e5e7eb' },
    [SURFACE_TYPE.HIGHLIGHT]:   { bg: '#eff6ff',  border: '#bfdbfe' },
    [SURFACE_TYPE.SUCCESS]:     { bg: '#f0fdf4',  border: '#bbf7d0', text: '#166534' },
    [SURFACE_TYPE.WARNING]:     { bg: '#fffbeb',  border: '#fde68a', text: '#92400e' },
    [SURFACE_TYPE.DANGER]:      { bg: '#fef2f2',  border: '#fecaca', text: '#991b1b' },
    [SURFACE_TYPE.INFO]:        { bg: '#eff6ff',  border: '#bfdbfe', text: '#1e40af' },
    [SURFACE_TYPE.GLASS]:       { bg: 'rgba(249,250,251,.85)', backdropBlur: '8px', border: 'rgba(209,213,219,.4)' },
  },
});

export function createSurface(type = SURFACE_TYPE.BASE, surfaceProfile = 'LAYERED') {
  const palette = SURFACE_PALETTES[surfaceProfile] ?? SURFACE_PALETTES.LAYERED;
  const surface = palette[type] ?? palette[SURFACE_TYPE.BASE];
  return Object.freeze({ type, profile: surfaceProfile, ...surface, isReal: false });
}

export function buildSurfaceSystem(surfaceProfile = 'LAYERED') {
  const surfaces = Object.fromEntries(
    Object.values(SURFACE_TYPE).map(t => [t, createSurface(t, surfaceProfile)])
  );
  return Object.freeze({
    profile: surfaceProfile,
    surfaces,
    useGlass: surfaceProfile === 'PREMIUM_GLASS',
    isReal: false,
  });
}

export const SURFACE_SYSTEM_VERSION = '1.0.0';
