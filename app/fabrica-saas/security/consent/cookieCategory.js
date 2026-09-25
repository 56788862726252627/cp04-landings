// Cookie Category — ADV-19

export const COOKIE_CATEGORY = Object.freeze({
  STRICTLY_NECESSARY: 'STRICTLY_NECESSARY',
  PREFERENCES:        'PREFERENCES',
  ANALYTICS:          'ANALYTICS',
  MARKETING:          'MARKETING',
  UNKNOWN:            'UNKNOWN',
});

export const DEFAULT_STATE = Object.freeze({
  STRICTLY_NECESSARY: 'ON',
  PREFERENCES:        'OFF',
  ANALYTICS:          'OFF',
  MARKETING:          'OFF',
  UNKNOWN:            'BLOCKED',
});

export function createCookieCategory(config = {}) {
  const {
    name = '',
    category = COOKIE_CATEGORY.UNKNOWN,
    essential = false,
    requiresConsent = true,
    provider = 'UNKNOWN',
    purpose = '',
    clientId = null,
  } = config;

  const defaultOn = category === COOKIE_CATEGORY.STRICTLY_NECESSARY || essential;
  const blocked   = category === COOKIE_CATEGORY.UNKNOWN;

  return Object.freeze({
    clientId,
    name,
    category,
    essential,
    requiresConsent: !essential && requiresConsent,
    provider,
    purpose,
    defaultState: DEFAULT_STATE[category] ?? 'BLOCKED',
    defaultOn,
    blocked,
    isReal: false,
  });
}

export const COOKIE_CATEGORY_VERSION = '1.0.0';
