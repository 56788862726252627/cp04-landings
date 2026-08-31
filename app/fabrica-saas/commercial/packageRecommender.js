/**
 * Package Recommender
 * Recommends a commercial package from a businessProfile (Paso B output).
 * Uses deterministic rules — no LLM.
 */

import { PACKAGE_TIERS }      from './packages.js';
import { LIMITS_REGISTRY }    from './serviceLimits.js';
import { getVerticalOverride } from './verticalOverrides.js';

export const PACKAGE_RECOMMENDER_VERSION = '1.0.0';

/**
 * @param {Object} businessProfile  - output from businessAnalyzer
 * @param {Object} brief            - validated brief from Paso B
 * @param {Object} [modulePlan]     - optional: output from modulePlanner
 * @returns {Object} RecommendationResult
 */
export function recommendCommercialPackage(businessProfile = {}, brief = {}, modulePlan = {}) {
  const moduleCount      = modulePlan?.total ?? (brief.requiredModules?.length ?? 0);
  const automationCount  = brief.automationNeeds?.length ?? 0;
  const aiAgentCount     = brief.aiNeeds?.length ?? 0;
  const roleCount        = brief.roles?.length ?? 0;
  const sector           = brief.sector ?? businessProfile.sector ?? 'default';
  const riskTier         = businessProfile.riskProfile?.tier ?? 'low';
  const integrationCount = brief.requiredModules?.length ?? 0;

  const override = getVerticalOverride(sector);
  const reasoning = [];
  const risks     = [];
  const questionsForHumanReview = [];
  const recommendedAddons = [];

  // Determine package by primary constraints
  let score = 0;
  score += moduleCount >= 9 ? 2 : moduleCount >= 4 ? 1 : 0;
  score += aiAgentCount >= 3 ? 2 : aiAgentCount >= 1 ? 1 : 0;
  score += automationCount >= 6 ? 2 : automationCount >= 3 ? 1 : 0;
  score += riskTier === 'high' ? 2 : riskTier === 'medium' ? 1 : 0;
  score += roleCount >= 5 ? 1 : 0;

  let recommendedTier;
  if (score >= 6)      { recommendedTier = 'PREMIUM'; reasoning.push(`Puntuación de complejidad alta (${score}/10) — se requiere PREMIUM`); }
  else if (score >= 3) { recommendedTier = 'PRO';     reasoning.push(`Complejidad media (${score}/10) — PRO es el ajuste óptimo`); }
  else                 { recommendedTier = 'ESSENTIAL'; reasoning.push(`Complejidad baja (${score}/10) — ESSENTIAL cubre las necesidades`); }

  const pkg    = PACKAGE_TIERS[recommendedTier];
  const limits = LIMITS_REGISTRY[recommendedTier];

  // Check where modules exceed the recommended tier
  if (moduleCount > limits.maxModules) {
    const excess = moduleCount - limits.maxModules;
    recommendedAddons.push(...Array(excess).fill('extra-module'));
    risks.push(`${moduleCount} módulos solicitados superan el límite ${limits.maxModules} de ${recommendedTier}. Se necesitan ${excess} addons o upgrade.`);
  }
  if (aiAgentCount > limits.maxAiAgents) {
    const excess = aiAgentCount - limits.maxAiAgents;
    recommendedAddons.push(...Array(excess).fill('extra-ai-agent'));
    risks.push(`${aiAgentCount} agentes IA superan el límite ${limits.maxAiAgents} de ${recommendedTier}.`);
  }
  if (automationCount > limits.maxAutomations) {
    const excess = automationCount - limits.maxAutomations;
    recommendedAddons.push(...Array(excess).fill('extra-automation'));
    risks.push(`${automationCount} automatizaciones superan el límite ${limits.maxAutomations} de ${recommendedTier}.`);
  }

  // Sector risks
  if (override.multiplier > 1.0) {
    risks.push(`Sector ${sector} aplica multiplicador de precio ×${override.multiplier} por: ${override.reason}`);
    if (override.multiplier >= 1.3) {
      questionsForHumanReview.push('¿El cliente ha revisado los requisitos de compliance? (dato sensible confirmado)');
    }
  }

  // Human review questions
  if (brief.legalConstraints?.healthData) {
    questionsForHumanReview.push('¿Se ha definido la política de retención de datos de salud?');
  }
  if (aiAgentCount > 0) {
    questionsForHumanReview.push('¿El cliente tiene API key de IA disponible para producción?');
  }
  if (brief.paymentNeeds?.enabled) {
    questionsForHumanReview.push('¿El cliente tiene cuenta Stripe o pasarela de pago activa?');
  }

  // Alternatives
  const alternatives = [];
  if (recommendedTier !== 'ESSENTIAL') {
    const lowerTier = recommendedTier === 'PREMIUM' ? 'PRO' : 'ESSENTIAL';
    alternatives.push({ tier: lowerTier, tradeOff: `Menor coste inicial pero requiere más add-ons. Limitado a ${LIMITS_REGISTRY[lowerTier].maxModules} módulos.` });
  }
  if (recommendedTier !== 'PREMIUM') {
    alternatives.push({ tier: 'PREMIUM', tradeOff: 'Mayor inversión inicial pero mayor capacidad y soporte. Recomendado si el negocio escala pronto.' });
  }

  return {
    recommendedPackage:    recommendedTier,
    package:               pkg,
    reasoning,
    alternatives,
    recommendedAddons:     [...new Set(recommendedAddons)],
    complexityScore:       score,
    risks,
    questionsForHumanReview,
    sectorOverride:        override,
    humanReviewRequired:   questionsForHumanReview.length > 0 || riskTier === 'high',
    recommenderVersion:    PACKAGE_RECOMMENDER_VERSION,
  };
}
