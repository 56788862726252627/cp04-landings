// Data Quality Engine — ADV-08

export const DATA_QUALITY_LEVEL = Object.freeze({
  HIGH:    'HIGH',
  MEDIUM:  'MEDIUM',
  LOW:     'LOW',
  MINIMAL: 'MINIMAL',
});

const QUALITY_FACTORS = {
  BUSINESS_IDENTITY: { weight: 25 },
  LOCATION:          { weight: 15 },
  WEBSITE:           { weight: 20 },
  CONTACT_AVAILABLE: { weight: 15 },
  SOURCE_RELIABILITY:{ weight: 10 },
  FRESHNESS:         { weight: 10 },
  SIGNAL_COMPLETENESS:{ weight: 5 },
};

function freshnessScore(discoveredAt = '') {
  if (!discoveredAt) return 0;
  const ageDays = (Date.now() - new Date(discoveredAt).getTime()) / 86400000;
  if (ageDays < 7)   return 100;
  if (ageDays < 30)  return 80;
  if (ageDays < 90)  return 60;
  if (ageDays < 180) return 40;
  return 20;
}

const SOURCE_RELIABILITY_MAP = {
  FIXTURE:                 85,
  MANUAL:                  90,
  CRM_IMPORT:              90,
  REFERRAL:                85,
  GOOGLE_MAPS_FOUNDATION:  75,
  APIFY:                   70,
  DIRECTORY:               65,
  PUBLIC_WEB:              60,
  SOCIAL_PUBLIC:           50,
  CSV:                     70,
  CUSTOM:                  60,
};

export function calculateLeadDataQuality(lead = {}) {
  const factors = {};

  const hasName  = Boolean(lead.businessName && lead.businessName.length > 2);
  const hasVert  = Boolean(lead.vertical && lead.vertical !== 'default');
  factors.BUSINESS_IDENTITY = hasName ? (hasVert ? 100 : 70) : 0;

  factors.LOCATION = lead.location && lead.location.length > 2 ? 100 : 0;

  factors.WEBSITE = lead.website && lead.website.length > 5 ? 100
    : lead.domain && lead.domain.length > 3 ? 60 : 0;

  const hasEmail = Boolean(lead.publicEmail && lead.publicEmail.includes('@'));
  const hasPhone = Boolean(lead.publicPhone && lead.publicPhone.length >= 7);
  factors.CONTACT_AVAILABLE = hasEmail && hasPhone ? 100
    : hasEmail || hasPhone ? 60 : 0;

  factors.SOURCE_RELIABILITY = SOURCE_RELIABILITY_MAP[lead.sourceType] ?? 50;

  factors.FRESHNESS = freshnessScore(lead.discoveredAt);

  const signalCount = (lead.businessSignals?.length ?? 0)
    + (lead.digitalSignals?.length ?? 0)
    + (lead.painSignals?.length ?? 0);
  factors.SIGNAL_COMPLETENESS = Math.min(100, signalCount * 20);

  let score = 0;
  let totalWeight = 0;
  for (const [key, cfg] of Object.entries(QUALITY_FACTORS)) {
    score += (factors[key] ?? 0) * cfg.weight;
    totalWeight += cfg.weight;
  }
  const finalScore = Math.round(score / totalWeight);

  const level = finalScore >= 75 ? DATA_QUALITY_LEVEL.HIGH
    : finalScore >= 50 ? DATA_QUALITY_LEVEL.MEDIUM
    : finalScore >= 25 ? DATA_QUALITY_LEVEL.LOW
    : DATA_QUALITY_LEVEL.MINIMAL;

  return Object.freeze({ score: finalScore, level, factors: Object.freeze(factors), isReal: false });
}

export const DATA_QUALITY_ENGINE_VERSION = '1.0.0';
