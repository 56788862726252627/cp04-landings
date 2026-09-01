// Ease Score — ADV-08

export function calculateEaseScore(lead = {}, weights = {}) {
  const w = weights.ease ?? 1;

  const hasEmail  = Boolean(lead.publicEmail && lead.publicEmail.includes('@'));
  const hasPhone  = Boolean(lead.publicPhone && lead.publicPhone.length >= 7);
  const hasWeb    = Boolean(lead.website || lead.domain);
  const hasSocial = Object.keys(lead.socialProfiles ?? {}).length > 0;

  const contactScore = hasEmail && hasPhone ? 100
    : hasEmail || hasPhone ? 70
    : hasSocial ? 40 : 10;

  const existingDigital = lead.digitalMaturityLevel;
  const infraScore = existingDigital === 'ESTABLISHED' ? 80
    : existingDigital === 'BASIC' ? 65
    : existingDigital === 'MINIMAL' ? 50
    : existingDigital === 'ADVANCED' ? 70
    : 40;

  const hasServices   = (lead.recommendedServices ?? []).length > 0;
  const clarityScore  = hasServices ? 80 : 50;

  const hasWebSite    = hasWeb ? 70 : 50;

  const raw = (contactScore * 0.35 + infraScore * 0.30 + clarityScore * 0.20 + hasWebSite * 0.15);
  const finalScore = Math.round(Math.min(100, raw * w));

  return Object.freeze({
    score:         finalScore,
    contactScore,
    infraScore,
    clarityScore,
    isReal: false,
  });
}

export const EASE_SCORE_VERSION = '1.0.0';
