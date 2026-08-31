/**
 * Pricing Engine — Deterministic
 * Calculates setup and monthly price RANGES from a scope definition.
 * No AI. No hardcoded single quotes. Returns ranges + drivers + exclusions.
 *
 * ALL OUTPUTS ARE ESTIMATES. NOT A CONTRACT. NOT AN AUTOMATIC COMMITMENT.
 */

import { PACKAGE_TIERS }            from './packages.js';
import { ADDON_CATALOG }            from './addons.js';
import { getVerticalMultiplier }     from './verticalOverrides.js';
import { LIMITS_REGISTRY }          from './serviceLimits.js';

export const PRICING_ENGINE_VERSION = '1.0.0';

const ADDON_UNIT_PRICES = Object.freeze({
  'extra-module':      { setup: [200, 400],  monthly: [30, 50]  },
  'extra-role':        { setup: [100, 200],  monthly: [15, 30]  },
  'extra-automation':  { setup: [250, 450],  monthly: [25, 40]  },
  'extra-ai-agent':    { setup: [350, 600],  monthly: [50, 80]  },
  'extra-integration': { setup: [300, 600],  monthly: [35, 55]  },
});

/**
 * Calculates a price range for a given scope.
 *
 * @param {Object} scope
 * @param {string} scope.packageTier    — ESSENTIAL | PRO | PREMIUM
 * @param {string} scope.sector         — sector id for multiplier
 * @param {number} scope.modules        — total modules requested
 * @param {number} scope.roles          — total roles
 * @param {number} scope.automations    — total automations
 * @param {number} scope.aiAgents       — total AI agents
 * @param {number} scope.integrations   — total integrations
 * @param {boolean} scope.dataMigration
 * @param {boolean} scope.multilingual
 * @param {boolean} scope.advancedDesign
 * @param {boolean} scope.advancedAnalytics
 * @param {boolean} scope.paymentGateway
 * @param {boolean} scope.whatsapp
 * @param {boolean} scope.multiSede
 * @param {string[]} scope.extraAddons  — additional addon ids
 * @returns {Object} PricingResult
 */
export function calculatePricing(scope = {}) {
  if (!scope || typeof scope !== 'object') {
    return { valid: false, error: 'scope must be an object', estimatedSetupRange: [0, 0], estimatedMonthlyRange: [0, 0] };
  }

  const tier = scope.packageTier ?? 'PRO';
  const pkg  = PACKAGE_TIERS[tier];
  if (!pkg) {
    return { valid: false, error: `Unknown packageTier: ${tier}`, estimatedSetupRange: [0, 0], estimatedMonthlyRange: [0, 0] };
  }

  const limits  = LIMITS_REGISTRY[tier];
  const sector  = scope.sector ?? 'default';
  const multiplier = getVerticalMultiplier(sector);

  let setupMin = pkg.setupPriceRange.min;
  let setupMax = pkg.setupPriceRange.max;
  let monthlyMin = pkg.monthlyPriceRange.min;
  let monthlyMax = pkg.monthlyPriceRange.max;

  const priceDrivers = [`Paquete base ${tier}: €${setupMin}-${setupMax} setup, €${monthlyMin}-${monthlyMax}/mes`];
  const excludedCosts = [];
  const thirdPartyCosts = [];

  // Extra modules beyond limit
  const extraModules = Math.max(0, (scope.modules ?? 0) - limits.maxModules);
  if (extraModules > 0) {
    const addon = ADDON_UNIT_PRICES['extra-module'];
    setupMin += addon.setup[0] * extraModules;
    setupMax += addon.setup[1] * extraModules;
    monthlyMin += addon.monthly[0] * extraModules;
    monthlyMax += addon.monthly[1] * extraModules;
    priceDrivers.push(`+${extraModules} módulo(s) extra: +€${addon.setup[0]*extraModules}-${addon.setup[1]*extraModules} setup`);
  }

  // Extra roles
  const extraRoles = Math.max(0, (scope.roles ?? 0) - limits.maxRoles);
  if (extraRoles > 0) {
    const addon = ADDON_UNIT_PRICES['extra-role'];
    setupMin += addon.setup[0] * extraRoles;
    setupMax += addon.setup[1] * extraRoles;
    monthlyMin += addon.monthly[0] * extraRoles;
    monthlyMax += addon.monthly[1] * extraRoles;
    priceDrivers.push(`+${extraRoles} rol(es) extra`);
  }

  // Extra automations
  const extraAuto = Math.max(0, (scope.automations ?? 0) - limits.maxAutomations);
  if (extraAuto > 0) {
    const addon = ADDON_UNIT_PRICES['extra-automation'];
    setupMin += addon.setup[0] * extraAuto;
    setupMax += addon.setup[1] * extraAuto;
    monthlyMin += addon.monthly[0] * extraAuto;
    monthlyMax += addon.monthly[1] * extraAuto;
    priceDrivers.push(`+${extraAuto} automatización(es) extra`);
  }

  // Extra AI agents
  const extraAI = Math.max(0, (scope.aiAgents ?? 0) - limits.maxAiAgents);
  if (extraAI > 0) {
    const addon = ADDON_UNIT_PRICES['extra-ai-agent'];
    setupMin += addon.setup[0] * extraAI;
    setupMax += addon.setup[1] * extraAI;
    monthlyMin += addon.monthly[0] * extraAI;
    monthlyMax += addon.monthly[1] * extraAI;
    priceDrivers.push(`+${extraAI} agente(s) IA extra`);
  }

  // Extra integrations
  const extraInt = Math.max(0, (scope.integrations ?? 0) - limits.maxIntegrations);
  if (extraInt > 0) {
    const addon = ADDON_UNIT_PRICES['extra-integration'];
    setupMin += addon.setup[0] * extraInt;
    setupMax += addon.setup[1] * extraInt;
    monthlyMin += addon.monthly[0] * extraInt;
    monthlyMax += addon.monthly[1] * extraInt;
    priceDrivers.push(`+${extraInt} integración(es) extra`);
  }

  // Optional add-ons
  if (scope.dataMigration) {
    setupMin += 400; setupMax += 2000;
    priceDrivers.push('Migración de datos: +€400-2000 (según volumen)');
  }
  if (scope.multilingual) {
    setupMin += 500; setupMax += 800;
    priceDrivers.push('Multiidioma: +€500-800');
    monthlyMin += 20; monthlyMax += 40;
  }
  if (scope.advancedDesign) {
    setupMin += 600; setupMax += 1400;
    priceDrivers.push('Diseño avanzado personalizado: +€600-1400');
  }
  if (scope.advancedAnalytics) {
    setupMin += 500; setupMax += 1000;
    priceDrivers.push('Analítica avanzada: +€500-1000');
    monthlyMin += 40; monthlyMax += 70;
  }
  if (scope.paymentGateway) {
    setupMin += 500; setupMax += 900;
    priceDrivers.push('Pasarela de pago: +€500-900');
    thirdPartyCosts.push('Stripe: 1.5% + €0.25/transacción (cliente)');
    excludedCosts.push('Comisiones de Stripe');
  }
  if (scope.whatsapp) {
    setupMin += 400; setupMax += 700;
    priceDrivers.push('Canal WhatsApp: +€400-700');
    thirdPartyCosts.push('WhatsApp Business API: €50-200/mes (cliente)');
    excludedCosts.push('Coste de mensajes WhatsApp');
  }
  if (scope.multiSede) {
    setupMin += 800; setupMax += 2000;
    priceDrivers.push('Multi-sede: +€800-2000');
    monthlyMin += 80; monthlyMax += 150;
  }

  // Extra add-ons by ID
  for (const addonId of (scope.extraAddons ?? [])) {
    const addon = ADDON_CATALOG.find(a => a.id === addonId);
    if (addon) {
      setupMin += addon.setupRange[0];
      setupMax += addon.setupRange[1];
      monthlyMin += addon.monthlyRange[0];
      monthlyMax += addon.monthlyRange[1];
      priceDrivers.push(`Add-on: ${addon.name}`);
    }
  }

  // Apply vertical multiplier (setup cost only, not monthly)
  if (multiplier !== 1.0) {
    setupMin = Math.round(setupMin * multiplier);
    setupMax = Math.round(setupMax * multiplier);
    priceDrivers.push(`Ajuste sector (×${multiplier}): compliance/complejidad`);
  }

  // Always-excluded costs
  excludedCosts.push('Subscripción Supabase (cliente contrata directamente)');
  excludedCosts.push('Subscripción Make (cliente contrata directamente)');
  excludedCosts.push('Dominio (cliente o agencia + rebill)');
  excludedCosts.push('Tokens de API de IA (uso variable del cliente)');
  thirdPartyCosts.push('Supabase: €0-25/mes', 'Make: €9-29/mes', 'Dominio: ~€1-2/mes');

  // Complexity score (1-10)
  const complexityScore = Math.min(10, Math.round(
    2 +
    ((scope.modules ?? 0) / 3) +
    ((scope.aiAgents ?? 0) * 1.5) +
    ((scope.automations ?? 0) / 2) +
    (scope.dataMigration ? 2 : 0) +
    (scope.multilingual ? 1 : 0) +
    (scope.paymentGateway ? 1.5 : 0) +
    ((multiplier - 1) * 5)
  ));

  return {
    valid:                 true,
    disclaimerType:        'ESTIMATE',
    disclaimer:            'ESTIMACIÓN ORIENTATIVA — NO ES UN CONTRATO NI UN COMPROMISO AUTOMÁTICO.',
    packageTier:           tier,
    sector,
    verticalMultiplier:    multiplier,
    estimatedSetupRange:   [setupMin, setupMax],
    estimatedMonthlyRange: [monthlyMin, monthlyMax],
    complexityScore,
    priceDrivers,
    excludedCosts,
    thirdPartyCosts,
    humanReviewRequired:   complexityScore >= 7 || !!scope.paymentGateway || !!scope.dataMigration,
    currency:              'EUR',
    validity:              '30 días desde emisión',
  };
}
