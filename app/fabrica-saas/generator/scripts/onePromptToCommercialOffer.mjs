/**
 * ONE PROMPT → Commercial Offer — E2E Pipeline
 * Connects Paso B generation output to a full commercial proposal.
 *
 * Pipeline:
 *   brief → onePromptToSaaS (Paso B) → businessProfile + modulePlan
 *         → recommendCommercialPackage → calculatePricing
 *         → generateEstimate → generateProposal
 *
 * NO real payments. NO real clients. NO secrets.
 */

import { onePromptToSaaS as runOnePipeline } from './onePromptToSaaS.mjs';
import { generateEstimate }         from '../../commercial/commercialEstimate.js';
import { generateProposal }         from '../../commercial/proposalGenerator.js';
import { recommendCommercialPackage } from '../../commercial/packageRecommender.js';
import { calculatePricing }         from '../../commercial/pricingEngine.js';

export const COMMERCIAL_OFFER_PIPELINE_VERSION = '1.0.0';

/**
 * Full E2E pipeline: brief JSON → commercial offer.
 *
 * @param {Object|string} briefInput  - raw brief (parsed or raw JSON)
 * @param {Object} options
 * @param {string} [options.agencyName]
 * @param {string} [options.contactEmail]
 * @param {string} [options.generatedAt]
 * @returns {Promise<CommercialOfferResult>}
 */
export async function onePromptToCommercialOffer(briefInput, options = {}) {
  const startedAt = Date.now();
  const steps = {};

  // ── Step 1: Run Paso B pipeline ──────────────────────────────────────────────
  let pasoB;
  try {
    pasoB = await runOnePipeline(briefInput);
    steps.pasoB = { pass: pasoB.success, durationMs: pasoB.meta?.durationMs ?? 0 };
  } catch (err) {
    return buildError('paso_b_failed', err.message, steps, startedAt);
  }

  if (!pasoB.success) {
    steps.pasoB = { pass: false, errors: pasoB.errors };
    return buildError('paso_b_validation_failed', 'El brief no superó la validación del Paso B.', steps, startedAt);
  }

  const brief         = pasoB.brief;
  const businessProfile = pasoB.artifacts?.businessProfile ?? {};
  const modulePlan    = pasoB.artifacts?.modulePlan ?? {};

  // ── Step 2: Package recommendation ───────────────────────────────────────────
  let recommendation;
  try {
    recommendation = recommendCommercialPackage(businessProfile, brief, modulePlan);
    steps.recommendation = { pass: true, tier: recommendation.recommendedPackage, score: recommendation.complexityScore };
  } catch (err) {
    return buildError('recommendation_failed', err.message, steps, startedAt);
  }

  // ── Step 3: Pricing ───────────────────────────────────────────────────────────
  let pricing;
  try {
    pricing = calculatePricing({
      packageTier:  recommendation.recommendedPackage,
      sector:       brief.sector ?? businessProfile.sector ?? 'default',
      modules:      modulePlan.total ?? brief.requiredModules?.length ?? 0,
      roles:        brief.roles?.length ?? 2,
      automations:  brief.automationNeeds?.length ?? 0,
      aiAgents:     brief.aiNeeds?.length ?? 0,
      integrations: brief.requiredModules?.length ?? 2,
      paymentGateway: brief.paymentNeeds?.enabled ?? false,
      whatsapp:     (brief.automationNeeds ?? []).some(a => a.includes('whatsapp')),
      extraAddons:  recommendation.recommendedAddons.filter(a => !a.startsWith('extra-')),
    });
    steps.pricing = { pass: pricing.valid, setupRange: pricing.estimatedSetupRange, monthlyRange: pricing.estimatedMonthlyRange };
  } catch (err) {
    return buildError('pricing_failed', err.message, steps, startedAt);
  }

  // ── Step 4: Commercial estimate ───────────────────────────────────────────────
  let estimate;
  try {
    estimate = generateEstimate(brief, businessProfile, modulePlan);
    steps.estimate = { pass: true, disclaimerType: estimate.estimateType };
  } catch (err) {
    return buildError('estimate_failed', err.message, steps, startedAt);
  }

  // ── Step 5: Commercial proposal ───────────────────────────────────────────────
  let proposal;
  try {
    proposal = generateProposal(estimate, {
      agencyName:   options.agencyName   ?? 'Agencia IA',
      contactEmail: options.contactEmail ?? 'hola@agencia-ia.es',
      generatedAt:  options.generatedAt  ?? new Date().toISOString().split('T')[0],
    });
    steps.proposal = { pass: true };
  } catch (err) {
    return buildError('proposal_failed', err.message, steps, startedAt);
  }

  // ── Step 6: Cross-client contamination QA ────────────────────────────────────
  const qaContamination = runContaminationCheck({ brief, recommendation, estimate, proposal });
  steps.qa_contamination = qaContamination;

  const durationMs = Date.now() - startedAt;

  return {
    success: true,
    pipeline: 'ONE_PROMPT_TO_COMMERCIAL_OFFER',
    version:  COMMERCIAL_OFFER_PIPELINE_VERSION,
    meta:     { durationMs, stepsCompleted: Object.keys(steps).length },
    steps,

    // Paso B artifacts (for reference)
    pasoB: {
      brief,
      businessProfile,
      modulePlan,
      branding:        pasoB.artifacts?.branding,
      rolePlan:        pasoB.artifacts?.rolePlan,
    },

    // Commercial artifacts
    recommendation,
    pricing,
    estimate,
    proposal,

    // Top-level summary
    summary: {
      businessName:       brief.businessName,
      sector:             brief.sector,
      recommendedPackage: recommendation.recommendedPackage,
      setupRange:         pricing.estimatedSetupRange,
      monthlyRange:       pricing.estimatedMonthlyRange,
      currency:           'EUR',
      complexityScore:    recommendation.complexityScore,
      humanReviewRequired: estimate.humanReviewRequired,
      validity:           estimate.validity,
    },
  };
}

// ── helpers ──────────────────────────────────────────────────────────────────

function buildError(code, message, steps, startedAt) {
  return {
    success:  false,
    pipeline: 'ONE_PROMPT_TO_COMMERCIAL_OFFER',
    version:  COMMERCIAL_OFFER_PIPELINE_VERSION,
    error:    { code, message },
    steps,
    meta:     { durationMs: Date.now() - startedAt },
  };
}

function runContaminationCheck(result) {
  const str = JSON.stringify(result);
  const forbidden = [
    { pattern: /\bcp04\b/i,              label: 'cp04 reference' },
    { pattern: /aurora.*demo/i,          label: 'aurora demo reference' },
    { pattern: /fisionova(?!.*\btest\b)/i, label: 'fisionova reference (non-test)' },
    { pattern: /educa.archidona/i,       label: 'educa-archidona reference' },
    { pattern: /clinica.*aurora/i,       label: 'Clínica Aurora reference' },
    { pattern: /@(?!demo\.test)[^"@\s]{1,}@(?!demo\.test)[a-z0-9.-]+\.[a-z]{2,}/i, label: 'non-demo email' },
  ];

  const found = forbidden.filter(f => f.pattern.test(str));
  return {
    pass:       found.length === 0,
    violations: found.map(f => f.label),
  };
}
