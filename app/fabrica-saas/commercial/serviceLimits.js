/**
 * Service Limits
 * Clear hard limits per package tier to prevent scope creep.
 * Exceeding a limit → addon or package upgrade or human review.
 */

export const SERVICE_LIMITS_VERSION = '1.0.0';

export const LIMITS_REGISTRY = Object.freeze({

  ESSENTIAL: {
    tier:                     'ESSENTIAL',
    maxModules:               3,
    maxAutomations:           2,
    maxIntegrations:          2,
    maxRoles:                 2,
    maxAiAgents:              0,
    maxRevisionRounds:        1,
    includedSupportMonths:    1,
    customDevelopmentHours:   0,
    dataMigrationRecords:     0,
    landingPages:             1,
    multilingualLanguages:    0,
    multiSede:                false,
    whiteLabel:               false,
    analyticsLevel:           'BASIC',
    designLevel:              'STANDARD',
    backupFrequency:          'WEEKLY',
  },

  PRO: {
    tier:                     'PRO',
    maxModules:               8,
    maxAutomations:           5,
    maxIntegrations:          5,
    maxRoles:                 4,
    maxAiAgents:              1,
    maxRevisionRounds:        3,
    includedSupportMonths:    3,
    customDevelopmentHours:   4,
    dataMigrationRecords:     500,
    landingPages:             1,
    multilingualLanguages:    0,
    multiSede:                false,
    whiteLabel:               false,
    analyticsLevel:           'STANDARD',
    designLevel:              'PREMIUM',
    backupFrequency:          'DAILY',
  },

  PREMIUM: {
    tier:                     'PREMIUM',
    maxModules:               15,
    maxAutomations:           10,
    maxIntegrations:          10,
    maxRoles:                 8,
    maxAiAgents:              3,
    maxRevisionRounds:        5,
    includedSupportMonths:    6,
    customDevelopmentHours:   16,
    dataMigrationRecords:     5000,
    landingPages:             2,
    multilingualLanguages:    1,
    multiSede:                false,
    whiteLabel:               true,
    analyticsLevel:           'ADVANCED',
    designLevel:              'PREMIUM_CUSTOM',
    backupFrequency:          'DAILY_POINT_IN_TIME',
  },

});

/**
 * Checks if a requested scope exceeds tier limits.
 * Returns { exceeded: boolean, violations: string[], requiredAddons: string[], upgradeRequired: boolean }
 */
export function checkLimits(tierId, requestedScope = {}) {
  const limits  = LIMITS_REGISTRY[tierId];
  if (!limits) return { exceeded: false, violations: [], requiredAddons: [], upgradeRequired: false };

  const violations    = [];
  const requiredAddons = [];

  const checks = [
    { key: 'modules',      limit: limits.maxModules,      label: 'módulos',        addon: 'extra-module',      upgradeAt: { ESSENTIAL: 8, PRO: 15 } },
    { key: 'automations',  limit: limits.maxAutomations,  label: 'automatizaciones', addon: 'extra-automation', upgradeAt: { ESSENTIAL: 5, PRO: 10 } },
    { key: 'integrations', limit: limits.maxIntegrations, label: 'integraciones',   addon: 'extra-integration', upgradeAt: { ESSENTIAL: 5, PRO: 10 } },
    { key: 'roles',        limit: limits.maxRoles,        label: 'roles',           addon: 'extra-role',        upgradeAt: { ESSENTIAL: 4, PRO: 8  } },
    { key: 'aiAgents',     limit: limits.maxAiAgents,     label: 'agentes IA',      addon: 'extra-ai-agent',    upgradeAt: { ESSENTIAL: 1, PRO: 3  } },
  ];

  let upgradeRequired = false;

  for (const c of checks) {
    const requested = requestedScope[c.key] ?? 0;
    if (requested > c.limit) {
      const excess = requested - c.limit;
      violations.push(`${c.label}: solicitados ${requested}, límite ${c.limit} (+${excess} exceso)`);
      // Add addons for excess (1 addon per unit exceeding)
      for (let i = 0; i < excess; i++) requiredAddons.push(c.addon);
      // If exceeds upgrade threshold, recommend package upgrade
      if (c.upgradeAt[tierId] && requested > c.upgradeAt[tierId]) {
        upgradeRequired = true;
      }
    }
  }

  return {
    exceeded:       violations.length > 0,
    violations,
    requiredAddons: [...new Set(requiredAddons)],
    upgradeRequired,
    humanReviewRequired: upgradeRequired || violations.length > 3,
  };
}

export function getLimits(tierId) {
  return LIMITS_REGISTRY[tierId] ?? null;
}
