// Icon Profile — ADV-07

export const ICON_STYLE = Object.freeze({
  OUTLINE:     'OUTLINE',
  FILLED:      'FILLED',
  DUOTONE:     'DUOTONE',
  SHARP:       'SHARP',
  ROUNDED:     'ROUNDED',
});

export const ICON_SIZE = Object.freeze({
  XS:  12,
  SM:  16,
  MD:  20,
  LG:  24,
  XL:  32,
  XXL: 48,
});

const VERTICAL_ICON_PROFILES = Object.freeze({
  veterinary: { style: ICON_STYLE.ROUNDED,  defaultSize: ICON_SIZE.MD, strokeWidth: 2,   library: 'lucide' },
  legal:      { style: ICON_STYLE.SHARP,    defaultSize: ICON_SIZE.SM, strokeWidth: 1.5, library: 'lucide' },
  beauty:     { style: ICON_STYLE.OUTLINE,  defaultSize: ICON_SIZE.MD, strokeWidth: 1.5, library: 'lucide' },
  dental:     { style: ICON_STYLE.OUTLINE,  defaultSize: ICON_SIZE.MD, strokeWidth: 2,   library: 'lucide' },
  padel:      { style: ICON_STYLE.FILLED,   defaultSize: ICON_SIZE.LG, strokeWidth: 0,   library: 'lucide' },
  education:  { style: ICON_STYLE.ROUNDED,  defaultSize: ICON_SIZE.MD, strokeWidth: 2,   library: 'lucide' },
  default:    { style: ICON_STYLE.OUTLINE,  defaultSize: ICON_SIZE.MD, strokeWidth: 2,   library: 'lucide' },
});

export function createIconProfile(vertical = 'default', overrides = {}) {
  const base = VERTICAL_ICON_PROFILES[vertical] ?? VERTICAL_ICON_PROFILES.default;
  return Object.freeze({
    ...base,
    ...overrides,
    noEmojiAsIcons: true,
    consistentStyle: true,
    isReal: false,
  });
}

export function validateIconProfile(profile = {}) {
  const issues = [];
  if (!profile.library) issues.push('missing icon library');
  if (!ICON_STYLE[profile.style]) issues.push(`invalid style: ${profile.style}`);
  if (!profile.noEmojiAsIcons) issues.push('emoji should not be primary iconography');
  return Object.freeze({ valid: issues.length === 0, issues, isReal: false });
}

export const ICON_PROFILE_VERSION = '1.0.0';
