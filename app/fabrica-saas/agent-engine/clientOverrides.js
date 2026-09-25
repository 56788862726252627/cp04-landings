// Client Overrides — ADV-03
// Jerarquía: CORE → VERTICAL → CLIENT. Sin contaminación entre clientes.

export const OVERRIDE_FIELD = Object.freeze({
  BRAND_TONE:       'BRAND_TONE',
  BUSINESS_NAME:    'BUSINESS_NAME',
  SERVICES:         'SERVICES',
  OPENING_HOURS:    'OPENING_HOURS',
  LOCATION:         'LOCATION',
  PRICING_POLICY:   'PRICING_POLICY',
  SALES_STYLE:      'SALES_STYLE',
  FORBIDDEN_CLAIMS: 'FORBIDDEN_CLAIMS',
  HUMAN_CONTACT:    'HUMAN_CONTACT',
  BOOKING_POLICY:   'BOOKING_POLICY',
});

const ALLOWED_OVERRIDE_FIELDS = new Set(Object.values(OVERRIDE_FIELD));

/**
 * Validate and apply client overrides on top of a base agent config.
 * Strict isolation: overrides only affect this client's agent.
 */
export function applyClientOverrides(baseConfig = {}, overrides = {}, clientId = 'unknown') {
  const errors = [];
  const applied = {};

  for (const [key, value] of Object.entries(overrides)) {
    if (!ALLOWED_OVERRIDE_FIELDS.has(key)) {
      errors.push(`Override field not allowed: ${key}`);
      continue;
    }
    if (value === null || value === undefined) continue;
    applied[key] = value;
  }

  if (errors.length) return { valid: false, errors, result: null };

  const result = Object.freeze({
    ...baseConfig,
    ...applied,
    clientId,
    isClientOverride: true,
    appliedOverrides: Object.freeze(Object.keys(applied)),
    isolation:        true,
    dataType:         'CLIENT_AGENT_CONFIG',
  });

  return { valid: true, errors: [], result };
}

/**
 * Build the override hierarchy: CORE → VERTICAL → CLIENT.
 * No mutation. Each layer only adds/overrides what it defines.
 */
export function buildConfigHierarchy(coreConfig = {}, verticalConfig = {}, clientOverrides = {}, clientId = 'unknown') {
  // Layer 1: CORE
  const withVertical = Object.freeze({ ...coreConfig, ...verticalConfig });

  // Layer 2: VERTICAL → CLIENT
  const { valid, errors, result } = applyClientOverrides(withVertical, clientOverrides, clientId);
  if (!valid) return { valid: false, errors };

  return {
    valid:      true,
    layers:     Object.freeze({ core: !!coreConfig, vertical: !!verticalConfig, client: !!clientId }),
    config:     result,
  };
}

export const CLIENT_OVERRIDES_VERSION = '1.0.0';
