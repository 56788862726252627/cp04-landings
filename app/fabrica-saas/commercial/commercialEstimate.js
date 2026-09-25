/**
 * Commercial Estimate Generator
 * Produces a structured estimate from a recommendation + pricing result.
 *
 * ESTIMATE — NOT A CONTRACT — NOT AN AUTOMATIC COMMITMENT
 * All prices are indicative ranges based on declared scope.
 */

import { calculatePricing }         from './pricingEngine.js';
import { recommendCommercialPackage } from './packageRecommender.js';
import { getThirdPartyCostById }     from './thirdPartyCosts.js';
import { recommendMaintenancePlan }  from './maintenancePlans.js';
import { checkLimits }               from './serviceLimits.js';
import { ADDON_CATALOG }             from './addons.js';

export const COMMERCIAL_ESTIMATE_VERSION = '1.0.0';

/**
 * @param {Object} brief          - validated brief (Paso B)
 * @param {Object} businessProfile - businessAnalyzer output
 * @param {Object} [modulePlan]    - modulePlanner output (optional)
 * @returns {Object} CommercialEstimate
 */
export function generateEstimate(brief = {}, businessProfile = {}, modulePlan = {}) {
  // Step 1: Recommend package
  const recommendation = recommendCommercialPackage(businessProfile, brief, modulePlan);
  const tier = recommendation.recommendedPackage;

  // Step 2: Build scope for pricing engine
  const scope = {
    packageTier:     tier,
    sector:          brief.sector ?? businessProfile.sector ?? 'default',
    modules:         modulePlan?.total ?? brief.requiredModules?.length ?? 0,
    roles:           brief.roles?.length ?? 2,
    automations:     brief.automationNeeds?.length ?? 0,
    aiAgents:        brief.aiNeeds?.length ?? 0,
    integrations:    brief.requiredModules?.length ?? 2,
    dataMigration:   false,
    multilingual:    brief.contentNeeds?.multilingual ?? false,
    advancedDesign:  tier === 'PREMIUM',
    advancedAnalytics: tier === 'PREMIUM',
    paymentGateway:  brief.paymentNeeds?.enabled ?? false,
    whatsapp:        (brief.automationNeeds ?? []).some(a => a.includes('whatsapp')),
    multiSede:       false,
    extraAddons:     recommendation.recommendedAddons.filter(a => !a.startsWith('extra-')),
  };

  // Step 3: Calculate pricing
  const pricing = calculatePricing(scope);

  // Step 4: Limits check
  const limitsCheck = checkLimits(tier, { modules: scope.modules, automations: scope.automations, integrations: scope.integrations, roles: scope.roles, aiAgents: scope.aiAgents });

  // Step 5: Third-party costs
  const thirdPartyItems = ['supabase', 'smtp-email', 'domain'];
  if (scope.aiAgents > 0) thirdPartyItems.push('anthropic-api');
  if (scope.automations > 0) thirdPartyItems.push('make');
  if (scope.whatsapp) thirdPartyItems.push('whatsapp-api');
  if (scope.paymentGateway) thirdPartyItems.push('stripe');

  const thirdPartyCosts = thirdPartyItems.map(id => getThirdPartyCostById(id)).filter(Boolean);

  // Step 6: Add-ons list with details
  const addonDetails = recommendation.recommendedAddons.map(addonId => {
    const addon = ADDON_CATALOG.find(a => a.id === addonId);
    return addon ? { id: addonId, name: addon.name, setupRange: addon.setupRange, monthlyRange: addon.monthlyRange } : null;
  }).filter(Boolean);

  // Step 7: Maintenance
  const recommendedMaintenance = recommendMaintenancePlan(tier);

  return {
    estimateType:       'COMMERCIAL_ESTIMATE',
    disclaimer:         'ESTIMACIÓN ORIENTATIVA. NO ES UN CONTRATO. NO ES UN COMPROMISO AUTOMÁTICO. Sujeto a revisión técnica y validación de scope definitivo.',
    validity:           '30 días desde emisión',
    version:            COMMERCIAL_ESTIMATE_VERSION,

    business: {
      name:   brief.businessName ?? 'Sin nombre',
      sector: brief.sector ?? 'default',
    },

    recommendedPackage:    tier,
    packageName:           recommendation.package?.name ?? tier,
    recommendationReasoning: recommendation.reasoning,

    setupRange:    pricing.estimatedSetupRange,
    monthlyRange:  pricing.estimatedMonthlyRange,
    currency:      'EUR',

    addons:        addonDetails,
    thirdPartyCosts,

    maintenance: {
      recommended:    recommendedMaintenance,
      note:           'El mantenimiento no está incluido en el setup. Es un servicio mensual separado.',
    },

    assumptions: [
      'El scope final puede variar tras el diagnóstico técnico.',
      'Los precios de terceros son orientativos y gestionados por el cliente.',
      'El tiempo de entrega estimado es de 4-12 semanas según complejidad.',
      'Se requiere disponibilidad del cliente para validaciones y feedback.',
    ],

    exclusions: [
      ...pricing.excludedCosts,
      'Contenido real (textos, fotos, vídeos)',
      'Fotografía profesional',
      'Gestión de redes sociales',
      'Soporte legal o compliance externo',
    ],

    dependencies: [
      'Cuenta Supabase activa del cliente',
      brief.aiNeeds?.length > 0 ? 'API key Anthropic (producción)' : null,
      scope.automations > 0     ? 'Subscripción Make activa' : null,
      scope.paymentGateway      ? 'Cuenta Stripe verificada' : null,
    ].filter(Boolean),

    limitsCheck,
    humanReviewRequired:  recommendation.humanReviewRequired || pricing.humanReviewRequired,
    risks:                recommendation.risks,
    questionsForHumanReview: recommendation.questionsForHumanReview,
    complexityScore:      pricing.complexityScore,
    priceDrivers:         pricing.priceDrivers,
  };
}
