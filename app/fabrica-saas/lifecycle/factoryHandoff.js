/**
 * Factory Handoff
 * Converts an approved client lifecycle into a ClientProductionBrief
 * compatible with onePromptToSaaS() and onePromptToCommercialOffer().
 */

export const FACTORY_HANDOFF_VERSION = '1.0.0';

/**
 * Builds the stable input for the Factory generation pipeline.
 * @param {Object} onboarding    - validated onboarding
 * @param {Object} scope         - from buildClientScope()
 * @param {Object} approval      - from createApproval()
 * @param {Object} requirements  - from buildRequirements()
 * @param {Object} recommendation - from recommendCommercialPackage()
 * @returns {Object} ClientProductionBrief
 */
export function buildClientProductionBrief(onboarding = {}, scope = {}, approval = {}, requirements = {}, recommendation = {}) {
  const data = onboarding.data ?? onboarding;

  if (!approval.readyForProduction) {
    return {
      valid: false,
      error: 'Approval is not ready for production. Check approval.readyForProduction.',
    };
  }

  const sector = data.sector ?? data._inferredSector ?? 'default';

  // Map requirement types to factory brief fields
  const functionalReqs = requirements.byType?.FUNCTIONAL ?? [];
  const aiReqs         = requirements.byType?.AI ?? [];
  const autoReqs       = requirements.byType?.AUTOMATION ?? [];
  const integReqs      = requirements.byType?.INTEGRATION ?? [];

  const requiredModules = functionalReqs.map(r => r.description.split(' ')[0].toLowerCase().replace(/[^a-z]/g, ''));
  const aiNeeds         = aiReqs.map(r => r.description.slice(0, 40));
  const automationNeeds = autoReqs.map(r => r.description.slice(0, 40));

  const businessBrief = {
    businessName:    data.businessName,
    businessType:    data.businessType,
    sector,
    location:        data.location ?? { country: 'España' },
    targetAudience:  data.targetAudience ?? 'clientes locales',
    services:        data.services ?? [],
    brandTone:       data.brandTone ?? 'professional',
    conversionGoal:  'booking',
    roles:           ['admin', 'owner'],
    requiredModules,
    automationNeeds,
    aiNeeds,
    dataNeeds:       { demo: false, production: true, sensitive: !!(data.legalConstraints?.healthData) },
    bookingNeeds:    { enabled: true, realBookings: false },
    paymentNeeds:    { enabled: false, realPayments: false },
    language:        data.language ?? 'es',
    legalConstraints: data.legalConstraints ?? { gdpr: true },
    devicePriority:  'mobile',
    accessibilityNeeds: { wcagLevel: 'AA' },
    specialRequirements: data.specialRequirements ?? [],
  };

  const commercialConstraints = {
    approvedTier:          scope.tier,
    approvedSetupRange:    null,
    approvedScopeVersion:  approval.approvedScopeVersion ?? 'v1.0',
    includedScope:         scope.includedScope,
    excludedScope:         scope.excludedScope,
    limits:                scope.limits,
  };

  const deliveryRequirements = {
    includeQA:           true,
    includeDocumentation:true,
    includeFunctionalQA: true,
    includeMobileQA:     true,
    includeA11yQA:       true,
    includeSecurityScan: true,
    maintenancePlan:     recommendation.recommendedPackage ? recommendation.recommendedPackage.toLowerCase() : 'pro',
  };

  return {
    valid:              true,
    briefType:          'CLIENT_PRODUCTION_BRIEF',
    disclaimer:         'Este brief está aprobado por el cliente. NO incluye secretos ni datos reales. Las credenciales de producción son propiedad del cliente.',
    version:            FACTORY_HANDOFF_VERSION,
    approvedScopeVersion: approval.approvedScopeVersion ?? 'v1.0',
    businessBrief,
    approvedScope:      scope.includedScope,
    vertical:           sector,
    modules:            requiredModules,
    roles:              ['admin', 'owner', 'client'],
    branding:           { tone: data.brandTone ?? 'professional', sector },
    experience:         { preset: sector === 'padel' ? 'sports-energetic' : 'professional-clean' },
    integrations:       integReqs.map(r => ({ id: r.id, description: r.description, type: 'external' })),
    aiPlan:             aiReqs.map(r => ({ agent: r.description.slice(0, 30), priority: r.priority })),
    makePlan:           autoReqs.map(r => ({ automation: r.description.slice(0, 30), priority: r.priority })),
    commercialConstraints,
    deliveryRequirements,
    thirdPartyDependencies: scope.thirdPartyDependencies ?? [],
  };
}
