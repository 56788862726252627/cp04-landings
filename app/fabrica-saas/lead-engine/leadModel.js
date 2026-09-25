// Lead Model — ADV-08

export const LEAD_STATUS = Object.freeze({
  RAW:          'RAW',
  NORMALIZED:   'NORMALIZED',
  ENRICHED:     'ENRICHED',
  SCORED:       'SCORED',
  QUALIFIED:    'QUALIFIED',
  DISQUALIFIED: 'DISQUALIFIED',
  DUPLICATE:    'DUPLICATE',
  STALE:        'STALE',
  ARCHIVED:     'ARCHIVED',
});

export const LEAD_TEMPERATURE = Object.freeze({
  HOT:     'HOT',
  WARM:    'WARM',
  COLD:    'COLD',
  NURTURE: 'NURTURE',
});

export const LEAD_SOURCE_TYPE = Object.freeze({
  MANUAL:                  'MANUAL',
  CSV:                     'CSV',
  PUBLIC_WEB:              'PUBLIC_WEB',
  GOOGLE_MAPS_FOUNDATION:  'GOOGLE_MAPS_FOUNDATION',
  APIFY:                   'APIFY',
  DIRECTORY:               'DIRECTORY',
  SOCIAL_PUBLIC:           'SOCIAL_PUBLIC',
  REFERRAL:                'REFERRAL',
  CRM_IMPORT:              'CRM_IMPORT',
  CUSTOM:                  'CUSTOM',
  FIXTURE:                 'FIXTURE',
});

export const DUPLICATE_STATUS = Object.freeze({
  UNIQUE:             'UNIQUE',
  POSSIBLE_DUPLICATE: 'POSSIBLE_DUPLICATE',
  DUPLICATE:          'DUPLICATE',
});

export function createLead(fields = {}) {
  return Object.freeze({
    id:                   fields.id ?? `lead_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    businessName:         fields.businessName ?? '',
    vertical:             fields.vertical ?? 'default',
    subcategory:          fields.subcategory ?? '',
    location:             fields.location ?? '',
    website:              fields.website ?? '',
    publicEmail:          fields.publicEmail ?? '',
    publicPhone:          fields.publicPhone ?? '',
    socialProfiles:       fields.socialProfiles ?? {},
    source:               fields.source ?? LEAD_SOURCE_TYPE.MANUAL,
    sourceUrl:            fields.sourceUrl ?? '',
    sourceType:           fields.sourceType ?? LEAD_SOURCE_TYPE.MANUAL,
    discoveredAt:         fields.discoveredAt ?? new Date().toISOString(),
    lastUpdatedAt:        fields.lastUpdatedAt ?? new Date().toISOString(),
    businessSignals:      fields.businessSignals ?? [],
    digitalSignals:       fields.digitalSignals ?? [],
    painSignals:          fields.painSignals ?? [],
    commercialSignals:    fields.commercialSignals ?? [],
    estimatedSize:        fields.estimatedSize ?? 'UNKNOWN',
    estimatedValue:       fields.estimatedValue ?? 'UNKNOWN',
    fitScore:             fields.fitScore ?? 0,
    urgencyScore:         fields.urgencyScore ?? 0,
    valueScore:           fields.valueScore ?? 0,
    easeScore:            fields.easeScore ?? 0,
    opportunityScore:     fields.opportunityScore ?? 0,
    temperature:          fields.temperature ?? LEAD_TEMPERATURE.COLD,
    status:               fields.status ?? LEAD_STATUS.RAW,
    recommendedService:   fields.recommendedService ?? '',
    recommendedNextAction:fields.recommendedNextAction ?? '',
    confidence:           fields.confidence ?? 0,
    dataQualityScore:     fields.dataQualityScore ?? 0,
    duplicateStatus:      fields.duplicateStatus ?? DUPLICATE_STATUS.UNIQUE,
    isReal:               false,
  });
}

export function createLeadSource(fields = {}) {
  return Object.freeze({
    provider:       fields.provider ?? 'MANUAL',
    sourceType:     fields.sourceType ?? LEAD_SOURCE_TYPE.MANUAL,
    query:          fields.query ?? '',
    location:       fields.location ?? '',
    vertical:       fields.vertical ?? 'default',
    fetchedAt:      fields.fetchedAt ?? new Date().toISOString(),
    rawCount:       fields.rawCount ?? 0,
    acceptedCount:  fields.acceptedCount ?? 0,
    rejectedCount:  fields.rejectedCount ?? 0,
    legalNotes:     fields.legalNotes ?? 'Public business data only. Data minimization applied.',
    termsNotes:     fields.termsNotes ?? 'Source terms must be reviewed before real use.',
    isReal:         false,
  });
}

export const LEAD_MODEL_VERSION = '1.0.0';
