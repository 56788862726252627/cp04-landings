/**
 * Proposal Pipeline
 * Connects onboarding → qualification → diagnosis → requirements → scope → commercial offer → proposal.
 * Returns proposalReady + all artifacts. Never sends anything automatically.
 */

import { validateOnboarding }         from './onboardingSchema.js';
import { qualifyLead }                from './qualificationEngine.js';
import { diagnoseBusiness }           from './diagnosticEngine.js';
import { buildRequirements }          from './requirementsEngine.js';
import { buildClientScope }           from './scopeBuilder.js';
import { recommendCommercialPackage } from '../commercial/packageRecommender.js';
import { generateEstimate }           from '../commercial/commercialEstimate.js';
import { generateProposal }           from '../commercial/proposalGenerator.js';

export const PROPOSAL_PIPELINE_VERSION = '1.0.0';

/**
 * Full pipeline: raw onboarding data → proposal-ready package.
 * @param {Object} rawOnboarding - onboarding form data
 * @param {Object} [options]
 * @param {string} [options.agencyName]
 * @param {string} [options.contactEmail]
 * @returns {Object} ProposalPipelineResult
 */
export function onboardingToProposal(rawOnboarding = {}, options = {}) {
  const steps = {};

  // Step 1: Validate onboarding
  const onboarding = validateOnboarding(rawOnboarding);
  steps.onboarding = { pass: onboarding.valid, missingRequired: onboarding.missingRequired };

  if (!onboarding.valid) {
    return {
      proposalReady:        false,
      missingInputs:        onboarding.missingRequired,
      currentStage:         'ONBOARDING',
      risks:                [],
      humanReviewRequired:  false,
      commercialEstimate:   null,
      scope:                null,
      timelineEstimate:     null,
      nextStep:             'Complete onboarding data: ' + onboarding.missingRequired.join(', '),
      steps,
      version:              PROPOSAL_PIPELINE_VERSION,
    };
  }

  // Step 2: Qualify lead
  const qualification = qualifyLead(onboarding);
  steps.qualification = { pass: qualification.decision !== 'NOT_A_FIT', decision: qualification.decision };

  if (qualification.decision === 'NOT_A_FIT') {
    return {
      proposalReady:       false,
      missingInputs:       [],
      currentStage:        'QUALIFIED',
      risks:               qualification.flags,
      humanReviewRequired: false,
      commercialEstimate:  null,
      scope:               null,
      timelineEstimate:    null,
      nextStep:            `Lead not qualified: ${qualification.warnings[0] ?? 'does not fit criteria'}`,
      steps,
      qualification,
      version:             PROPOSAL_PIPELINE_VERSION,
    };
  }

  if (qualification.decision === 'NEEDS_MORE_INFO') {
    return {
      proposalReady:       false,
      missingInputs:       qualification.flags,
      currentStage:        'ONBOARDING',
      risks:               qualification.flags,
      humanReviewRequired: false,
      commercialEstimate:  null,
      scope:               null,
      timelineEstimate:    null,
      nextStep:            'Gather missing information: ' + qualification.flags.join(', '),
      steps,
      qualification,
      version:             PROPOSAL_PIPELINE_VERSION,
    };
  }

  // Step 3: Diagnose
  const diagnostic = diagnoseBusiness(onboarding);
  steps.diagnosis = { pass: true, problemsFound: diagnostic.problems.length };

  // Step 4: Build requirements
  const requirements = buildRequirements(diagnostic, onboarding);
  steps.requirements = { pass: true, total: requirements.total };

  // Step 5: Commercial recommendation
  const modulePlan = { total: requirements.byType?.FUNCTIONAL?.length ?? 5 };
  const businessProfile = {
    sector:      onboarding.data.sector ?? onboarding.data._inferredSector ?? 'default',
    riskProfile: { tier: qualification.riskScore >= 3 ? 'high' : qualification.riskScore >= 1 ? 'medium' : 'low' },
  };
  const recommendation = recommendCommercialPackage(businessProfile, {
    sector:          onboarding.data.sector ?? onboarding.data._inferredSector ?? 'default',
    requiredModules: requirements.byType?.FUNCTIONAL?.map(r => r.id) ?? [],
    automationNeeds: requirements.byType?.AUTOMATION?.map(r => r.id) ?? [],
    aiNeeds:         requirements.byType?.AI?.map(r => r.id) ?? [],
    roles:           ['admin', 'owner'],
    paymentNeeds:    { enabled: false },
  }, modulePlan);
  steps.recommendation = { pass: true, tier: recommendation.recommendedPackage };

  // Step 6: Scope
  const scope = buildClientScope(requirements, recommendation, onboarding);
  steps.scope = { pass: true };

  // Step 7: Commercial estimate
  const brief = {
    businessName:    onboarding.data.businessName,
    sector:          onboarding.data.sector ?? onboarding.data._inferredSector ?? 'default',
    requiredModules: requirements.byType?.FUNCTIONAL?.map(r => r.id) ?? [],
    automationNeeds: requirements.byType?.AUTOMATION?.map(r => r.id) ?? [],
    aiNeeds:         requirements.byType?.AI?.map(r => r.id) ?? [],
    roles:           ['admin', 'owner'],
    paymentNeeds:    { enabled: false, realPayments: false },
    legalConstraints: onboarding.data.legalConstraints ?? {},
  };
  const estimate = generateEstimate(brief, businessProfile, modulePlan);
  steps.estimate = { pass: true, setupRange: estimate.setupRange };

  // Step 8: Proposal
  const proposal = generateProposal(estimate, {
    agencyName:   options.agencyName   ?? 'Agencia IA',
    contactEmail: options.contactEmail ?? 'hola@agencia-ia.es',
  });
  steps.proposal = { pass: true };

  const allRisks = [
    ...qualification.flags,
    ...diagnostic.risks.map(r => r.id),
    ...recommendation.risks,
  ];

  const TIMELINE_BY_TIER = { ESSENTIAL: '3–5 semanas', PRO: '6–10 semanas', PREMIUM: '10–16 semanas' };

  return {
    proposalReady:       true,
    missingInputs:       [],
    currentStage:        'PROPOSAL_READY',
    risks:               allRisks,
    humanReviewRequired: recommendation.humanReviewRequired || estimate.humanReviewRequired || qualification.humanReviewRequired,
    commercialEstimate:  estimate,
    proposal,
    scope,
    qualification,
    diagnostic,
    requirements,
    recommendation,
    timelineEstimate:    TIMELINE_BY_TIER[recommendation.recommendedPackage] ?? '6–10 semanas',
    nextStep:            'Human review of proposal → send to client',
    steps,
    version:             PROPOSAL_PIPELINE_VERSION,
  };
}
