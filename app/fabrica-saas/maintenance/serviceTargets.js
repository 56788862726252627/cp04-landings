// Service Targets Catalog — PASO F
// Response time targets per priority level and maintenance tier.
// These are operational objectives, not legally binding SLAs.

export const PRIORITY_LEVELS = Object.freeze({
  P1_CRITICAL: 'P1_CRITICAL',
  P2_HIGH:     'P2_HIGH',
  P3_NORMAL:   'P3_NORMAL',
  P4_LOW:      'P4_LOW',
});

export const BASE_SERVICE_TARGETS = Object.freeze({
  P1_CRITICAL: {
    label:              'Crítico — sistema caído / pérdida de datos',
    firstResponseTime:  '4h laborables',
    resolutionTarget:   '24h laborables',
    escalationTrigger:  '2h sin respuesta',
    owner:              'PROJECT_MANAGER',
    notifyOwner:        true,
  },
  P2_HIGH: {
    label:              'Alto — funcionalidad crítica degradada',
    firstResponseTime:  '8h laborables',
    resolutionTarget:   '3 días laborables',
    escalationTrigger:  '1 día laborable sin respuesta',
    owner:              'SUPPORT',
    notifyOwner:        true,
  },
  P3_NORMAL: {
    label:              'Normal — incidencia estándar',
    firstResponseTime:  '1 día laborable',
    resolutionTarget:   '5 días laborables',
    escalationTrigger:  '3 días laborables sin avance',
    owner:              'SUPPORT',
    notifyOwner:        false,
  },
  P4_LOW: {
    label:              'Bajo — mejora o consulta',
    firstResponseTime:  '2 días laborables',
    resolutionTarget:   '10 días laborables',
    escalationTrigger:  '5 días laborables sin avance',
    owner:              'SUPPORT',
    notifyOwner:        false,
  },
});

// Overrides per maintenance tier (delta from base)
const TIER_OVERRIDES = {
  BASIC: {
    P1_CRITICAL: { firstResponseTime: '48h laborables', resolutionTarget: '5 días laborables' },
    P2_HIGH:     { firstResponseTime: '48h laborables', resolutionTarget: '5 días laborables' },
  },
  PRO: {
    P1_CRITICAL: { firstResponseTime: '24h laborables', resolutionTarget: '3 días laborables' },
    P2_HIGH:     { firstResponseTime: '24h laborables', resolutionTarget: '3 días laborables' },
  },
  PRIORITY: {
    P1_CRITICAL: { firstResponseTime: '4h laborables',  resolutionTarget: '24h laborables' },
    P2_HIGH:     { firstResponseTime: '8h laborables',  resolutionTarget: '2 días laborables' },
    P3_NORMAL:   { firstResponseTime: '1 día laborable',resolutionTarget: '3 días laborables' },
  },
};

/**
 * Get effective service targets for a priority level, optionally adjusted by maintenance tier.
 */
export function getServiceTarget(priority, maintenanceTier = null) {
  if (!PRIORITY_LEVELS[priority]) {
    return { valid: false, error: `unknown priority: ${priority}` };
  }

  const base = { ...BASE_SERVICE_TARGETS[priority] };
  const override = maintenanceTier ? (TIER_OVERRIDES[maintenanceTier]?.[priority] ?? {}) : {};

  return {
    valid: true,
    priority,
    maintenanceTier: maintenanceTier ?? 'BASE',
    target: { ...base, ...override },
    disclaimer: 'Service targets are operational objectives, not legally binding SLAs.',
  };
}

/**
 * Return all targets for a given tier.
 */
export function getAllTargetsForTier(maintenanceTier = null) {
  return Object.keys(PRIORITY_LEVELS).map(p => getServiceTarget(p, maintenanceTier));
}

export const SERVICE_TARGETS_VERSION = '1.0.0';
