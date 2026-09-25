// Business Source of Truth — ADV-10b

export const FACT_CATEGORY = Object.freeze({
  BUSINESS_IDENTITY:   'BUSINESS_IDENTITY',
  OPENING_HOURS:       'OPENING_HOURS',
  CLOSED_DAYS:         'CLOSED_DAYS',
  HOLIDAYS:            'HOLIDAYS',
  SPECIAL_CLOSURES:    'SPECIAL_CLOSURES',
  AVAILABILITY:        'AVAILABILITY',
  CAPACITY:            'CAPACITY',
  FACILITIES:          'FACILITIES',
  SERVICES:            'SERVICES',
  PRICES:              'PRICES',
  POLICIES:            'POLICIES',
  LOCATION:            'LOCATION',
  CONTACT:             'CONTACT',
  STAFF:               'STAFF',
  BOOKING_RULES:       'BOOKING_RULES',
  CANCELLATION_RULES:  'CANCELLATION_RULES',
  PAYMENT_RULES:       'PAYMENT_RULES',
  LEGAL_INFO:          'LEGAL_INFO',
  CUSTOM_FACTS:        'CUSTOM_FACTS',
});

export function createBusinessSourceOfTruth(fields = {}) {
  return Object.freeze({
    clientId:    fields.clientId ?? 'fixture-client',
    vertical:    fields.vertical ?? 'general',
    name:        fields.name ?? 'Fixture Business',
    facts:       Object.freeze(fields.facts ?? []),
    factSources: Object.freeze(fields.factSources ?? []),
    createdAt:   fields.createdAt ?? new Date().toISOString(),
    version:     fields.version ?? '1.0.0',
    isReal:      false,
  });
}

export const BUSINESS_SOURCE_OF_TRUTH_VERSION = '1.0.0';
