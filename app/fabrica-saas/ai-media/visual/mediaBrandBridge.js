// Media Brand Bridge — ADV-13

export function resolveBrandForMedia(brandProfile = {}) {
  return Object.freeze({
    primaryColor:   brandProfile.primaryColor   ?? '#1a1a2e',
    secondaryColor: brandProfile.secondaryColor ?? '#ffffff',
    accentColor:    brandProfile.accentColor    ?? '#4a90d9',
    fontFamily:     brandProfile.fontFamily     ?? 'system-ui',
    logoUrl:        brandProfile.logoUrl        ?? null,
    tone:           brandProfile.tone           ?? 'PROFESSIONAL',
    voiceTone:      brandProfile.voiceTone      ?? 'WARM',
    visualStyle:    brandProfile.visualStyle    ?? 'PROFESSIONAL',
    isReal: false,
  });
}

export function validateBrandCompliance(brandProfile, usedStyle) {
  const resolved = resolveBrandForMedia(brandProfile);
  if (usedStyle && usedStyle !== resolved.visualStyle) {
    return Object.freeze({ compliant: false, reason: 'VISUAL_STYLE_MISMATCH', expected: resolved.visualStyle, used: usedStyle, isReal: false });
  }
  return Object.freeze({ compliant: true, isReal: false });
}

export const MEDIA_BRAND_BRIDGE_VERSION = '1.0.0';
