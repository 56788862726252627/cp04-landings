// CRM Account Model — ADV-09 CRM

export const ACCOUNT_STATUS = Object.freeze({
  PROSPECT:    'PROSPECT',
  ACTIVE:      'ACTIVE',
  NURTURE:     'NURTURE',
  INACTIVE:    'INACTIVE',
  BLACKLISTED: 'BLACKLISTED',
});

export function createCRMAccount(fields = {}) {
  return Object.freeze({
    id:                  fields.id ?? `acct_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    businessName:        fields.businessName ?? '',
    vertical:            fields.vertical ?? 'default',
    location:            fields.location ?? '',
    website:             fields.website ?? '',
    sizeBand:            fields.sizeBand ?? 'UNKNOWN',
    digitalMaturityLevel:fields.digitalMaturityLevel ?? 'UNKNOWN',
    status:              fields.status ?? ACCOUNT_STATUS.PROSPECT,
    needs:               Object.freeze([...(fields.needs ?? [])]),
    servicesOfInterest:  Object.freeze([...(fields.servicesOfInterest ?? [])]),
    opportunityIds:      Object.freeze([...(fields.opportunityIds ?? [])]),
    contactIds:          Object.freeze([...(fields.contactIds ?? [])]),
    totalOpportunities:  fields.totalOpportunities ?? 0,
    wonOpportunities:    fields.wonOpportunities ?? 0,
    lostOpportunities:   fields.lostOpportunities ?? 0,
    totalRevenue:        fields.totalRevenue ?? 0,
    notes:               fields.notes ?? '',
    source:              fields.source ?? '',
    createdAt:           fields.createdAt ?? new Date().toISOString(),
    updatedAt:           fields.updatedAt ?? new Date().toISOString(),
    lastActivityAt:      fields.lastActivityAt ?? new Date().toISOString(),
    isReal:              false,
  });
}

export const CRM_ACCOUNT_VERSION = '1.0.0';
