// Lead Search Profile — ADV-08

export const BUSINESS_SIZE = Object.freeze({
  MICRO:   'MICRO',
  SMALL:   'SMALL',
  MEDIUM:  'MEDIUM',
  LARGE:   'LARGE',
  UNKNOWN: 'UNKNOWN',
});

export const SOURCE_PREFERENCE = Object.freeze({
  FIXTURE_FIRST:    'FIXTURE_FIRST',
  MANUAL_FIRST:     'MANUAL_FIRST',
  APIFY_IF_AUTH:    'APIFY_IF_AUTH',
  PUBLIC_WEB_ONLY:  'PUBLIC_WEB_ONLY',
  ANY:              'ANY',
});

export function createLeadSearchProfile(options = {}) {
  return Object.freeze({
    vertical:            options.vertical ?? 'default',
    subcategories:       options.subcategories ?? [],
    locations:           options.locations ?? [],
    radius:              options.radius ?? 20,
    businessSize:        options.businessSize ?? [BUSINESS_SIZE.SMALL, BUSINESS_SIZE.MICRO],
    requiredSignals:     options.requiredSignals ?? [],
    excludedSignals:     options.excludedSignals ?? [],
    minimumDataQuality:  options.minimumDataQuality ?? 30,
    maxResults:          options.maxResults ?? 50,
    sourcePreferences:   options.sourcePreferences ?? [SOURCE_PREFERENCE.FIXTURE_FIRST],
    serviceFocus:        options.serviceFocus ?? [],
    isReal:              false,
  });
}

export function validateSearchProfile(profile = {}) {
  const warnings = [];
  if (!profile.vertical || profile.vertical === 'default') {
    warnings.push('No vertical set — results will not be vertical-specific');
  }
  if (!profile.locations || profile.locations.length === 0) {
    warnings.push('No location set — results not location-filtered');
  }
  if (profile.maxResults > 200) {
    warnings.push('maxResults >200 may incur significant provider cost');
  }
  return Object.freeze({ valid: warnings.length === 0, warnings, isReal: false });
}

export const LEAD_SEARCH_PROFILE_VERSION = '1.0.0';
