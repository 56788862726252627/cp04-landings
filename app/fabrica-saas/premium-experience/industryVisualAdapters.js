// Industry Visual Adapters — ADV-07

export const SUPPORTED_VERTICALS = Object.freeze([
  'dental', 'physio', 'psychology', 'speech_therapy', 'sports',
  'padel', 'veterinary', 'hairdresser', 'beauty', 'legal', 'fertility', 'education',
]);

const INDUSTRY_ADAPTERS = Object.freeze({
  dental: {
    visualPersonality:      'CLINICAL_WARM',
    density:                'BALANCED',
    dashboardPattern:       'BOOKING_FIRST',
    navigationPreference:   'TOP_NAV',
    formStrategy:           'PROGRESSIVE',
    contentTone:            'WARM_CLINICAL',
    trustSignals:           ['credentials', 'reviews', 'before-after', 'certifications'],
    primaryColor:           '#0369a1',
    surfaceProfile:         'LAYERED',
  },
  physio: {
    visualPersonality:      'CLINICAL_APPROACHABLE',
    density:                'BALANCED',
    dashboardPattern:       'BOOKING_FIRST',
    navigationPreference:   'TOP_NAV',
    formStrategy:           'STANDARD',
    contentTone:            'WARM_PROFESSIONAL',
    trustSignals:           ['credentials', 'specializations', 'reviews'],
    primaryColor:           '#0891b2',
    surfaceProfile:         'WARM_LAYERED',
  },
  psychology: {
    visualPersonality:      'CALM_TRUSTED',
    density:                'SPACIOUS',
    dashboardPattern:       'BOOKING_FIRST',
    navigationPreference:   'TOP_NAV',
    formStrategy:           'MINIMAL_STEPS',
    contentTone:            'WARM_PROFESSIONAL',
    trustSignals:           ['credentials', 'privacy_cues', 'confidentiality'],
    primaryColor:           '#6d28d9',
    surfaceProfile:         'WARM_LAYERED',
  },
  speech_therapy: {
    visualPersonality:      'FRIENDLY_CLINICAL',
    density:                'BALANCED',
    dashboardPattern:       'BOOKING_FIRST',
    navigationPreference:   'TOP_NAV',
    formStrategy:           'PROGRESSIVE',
    contentTone:            'ENCOURAGING',
    trustSignals:           ['credentials', 'reviews'],
    primaryColor:           '#0d9488',
    surfaceProfile:         'WARM_LAYERED',
  },
  sports: {
    visualPersonality:      'ENERGETIC_MODERN',
    density:                'COMPACT',
    dashboardPattern:       'BOOKING_FIRST',
    navigationPreference:   'TOP_NAV',
    formStrategy:           'INLINE',
    contentTone:            'ENERGETIC',
    trustSignals:           ['reviews', 'community', 'results'],
    primaryColor:           '#f97316',
    surfaceProfile:         'LAYERED',
  },
  padel: {
    visualPersonality:      'SPORTY_COMPETITIVE',
    density:                'COMPACT',
    dashboardPattern:       'BOOKING_FIRST',
    navigationPreference:   'TOP_NAV',
    formStrategy:           'INLINE',
    contentTone:            'ENERGETIC',
    trustSignals:           ['occupancy', 'members', 'facilities'],
    primaryColor:           '#ef4444',
    surfaceProfile:         'LAYERED',
  },
  veterinary: {
    visualPersonality:      'WARM_TRUSTED_LOCAL',
    density:                'BALANCED',
    dashboardPattern:       'BOOKING_FIRST',
    navigationPreference:   'TOP_NAV',
    formStrategy:           'PROGRESSIVE',
    contentTone:            'WARM_PROFESSIONAL',
    trustSignals:           ['credentials', 'reviews', 'local', 'team'],
    primaryColor:           '#0d9488',
    surfaceProfile:         'WARM_LAYERED',
  },
  hairdresser: {
    visualPersonality:      'CREATIVE_PERSONAL',
    density:                'BALANCED',
    dashboardPattern:       'SERVICE_FIRST',
    navigationPreference:   'TOP_NAV',
    formStrategy:           'MINIMAL_STEPS',
    contentTone:            'WARM_PROFESSIONAL',
    trustSignals:           ['portfolio', 'reviews', 'team'],
    primaryColor:           '#d97706',
    surfaceProfile:         'WARM_LAYERED',
  },
  beauty: {
    visualPersonality:      'PREMIUM_ASPIRATIONAL',
    density:                'SPACIOUS',
    dashboardPattern:       'SERVICE_FIRST',
    navigationPreference:   'TOP_NAV',
    formStrategy:           'MINIMAL_STEPS',
    contentTone:            'ASPIRATIONAL',
    trustSignals:           ['before-after', 'portfolio', 'premium_certifications'],
    primaryColor:           '#d97706',
    surfaceProfile:         'PREMIUM_GLASS',
  },
  legal: {
    visualPersonality:      'AUTHORITY_MINIMAL',
    density:                'COMPACT',
    dashboardPattern:       'CRM_FIRST',
    navigationPreference:   'SIDEBAR_APP',
    formStrategy:           'STRUCTURED',
    contentTone:            'FORMAL_PRECISE',
    trustSignals:           ['credentials', 'bar_registration', 'experience', 'privacy'],
    primaryColor:           '#1e293b',
    surfaceProfile:         'NEUTRAL_MINIMAL',
  },
  fertility: {
    visualPersonality:      'HOPEFUL_TRUSTED',
    density:                'SPACIOUS',
    dashboardPattern:       'BOOKING_FIRST',
    navigationPreference:   'TOP_NAV',
    formStrategy:           'PROGRESSIVE',
    contentTone:            'WARM_PROFESSIONAL',
    trustSignals:           ['success_rates_disclaimer', 'credentials', 'privacy_cues'],
    primaryColor:           '#ec4899',
    surfaceProfile:         'WARM_LAYERED',
  },
  education: {
    visualPersonality:      'FRIENDLY_PROGRESSIVE',
    density:                'BALANCED',
    dashboardPattern:       'CONTENT_FIRST',
    navigationPreference:   'TOP_NAV',
    formStrategy:           'WIZARD',
    contentTone:            'ENCOURAGING',
    trustSignals:           ['results', 'accreditation', 'reviews'],
    primaryColor:           '#1d4ed8',
    surfaceProfile:         'LAYERED',
  },
});

export function getIndustryAdapter(vertical = 'default') {
  const adapter = INDUSTRY_ADAPTERS[vertical];
  if (!adapter) return Object.freeze({ vertical: 'default', ...INDUSTRY_ADAPTERS.dental, isReal: false });
  return Object.freeze({ vertical, ...adapter, isReal: false });
}

export function listSupportedVerticals() {
  return [...SUPPORTED_VERTICALS];
}

export const INDUSTRY_VISUAL_ADAPTERS_VERSION = '1.0.0';
