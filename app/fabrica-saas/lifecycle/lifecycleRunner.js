/**
 * Lifecycle Runner — E2E Client Pipeline
 * Orchestrates the full agency client lifecycle from lead to closeout.
 */

import { validateOnboarding }          from './onboardingSchema.js';
import { qualifyLead }                 from './qualificationEngine.js';
import { diagnoseBusiness }            from './diagnosticEngine.js';
import { buildRequirements }           from './requirementsEngine.js';
import { buildClientScope }            from './scopeBuilder.js';
import { onboardingToProposal }        from './proposalPipeline.js';
import { createApproval }                               from './approvalModel.js';
import { productionReady }             from './productionReadinessGate.js';
import { buildClientProductionBrief }  from './factoryHandoff.js';
import { createProductionTracking, updateComponentStatus } from './productionTracking.js';
import { deliveryReady }               from './deliveryReadiness.js';
import { generateDeliveryManifest }    from './deliveryManifest.js';
import { generateHandoff, completeHandoff } from './handoff.js';
import { createSupportWindow }         from './supportWindow.js';
import { closeClientProject }          from './clientCloseout.js';
import { recommendCommercialPackage }  from '../commercial/packageRecommender.js';

export const LIFECYCLE_RUNNER_VERSION = '1.0.0';

const STAGE = Object.freeze({
  ONBOARDING:         'ONBOARDING',
  QUALIFICATION:      'QUALIFICATION',
  DIAGNOSTIC:         'DIAGNOSTIC',
  REQUIREMENTS:       'REQUIREMENTS',
  SCOPE:              'SCOPE',
  PROPOSAL:           'PROPOSAL',
  APPROVAL:           'APPROVAL',
  PRODUCTION_READY:   'PRODUCTION_READY',
  PRODUCTION_BRIEF:   'PRODUCTION_BRIEF',
  PRODUCTION_TRACKING:'PRODUCTION_TRACKING',
  DELIVERY_READY:     'DELIVERY_READY',
  DELIVERY:           'DELIVERY',
  HANDOFF:            'HANDOFF',
  SUPPORT:            'SUPPORT',
  CLOSEOUT:           'CLOSEOUT',
});

/**
 * Runs the full client lifecycle pipeline.
 * For testing and simulation only — uses fictitious data.
 *
 * @param {Object} lead   — raw onboarding input
 * @param {Object} [opts] — simulation options
 * @param {string} [opts.simulateApprovalDecision] — PROPOSAL_ACCEPTED | PROPOSAL_REJECTED
 * @param {boolean}[opts.markAllComponentsDone]    — skip production phase in tests
 * @returns {Object} LifecycleResult
 */
export async function runClientLifecycle(lead = {}, opts = {}) {
  const completedStages = [];
  const blockedStages   = [];
  const warnings        = [];
  const humanActions    = [];
  const artifacts       = {};

  // ── ONBOARDING ─────────────────────────────────────────────────────────────
  const onboarding = validateOnboarding(lead);
  artifacts.onboarding = onboarding;
  completedStages.push(STAGE.ONBOARDING);

  if (!onboarding.onboardingComplete) {
    return _result('INCOMPLETE', STAGE.ONBOARDING, completedStages, blockedStages, warnings, humanActions, artifacts,
      'Onboarding incompleto. Campos obligatorios faltantes.', onboarding.missingRequired);
  }

  // ── QUALIFICATION ──────────────────────────────────────────────────────────
  const qualification = qualifyLead(onboarding);
  artifacts.qualification = qualification;
  completedStages.push(STAGE.QUALIFICATION);

  if (qualification.decision === 'NOT_A_FIT') {
    return _result('NOT_A_FIT', STAGE.QUALIFICATION, completedStages, blockedStages, warnings, humanActions, artifacts,
      'Lead no encaja con el perfil de cliente de la agencia.');
  }
  if (qualification.decision === 'NEEDS_MORE_INFO') {
    humanActions.push('Solicitar información adicional al lead antes de continuar.');
    return _result('NEEDS_MORE_INFO', STAGE.QUALIFICATION, completedStages, blockedStages, warnings, humanActions, artifacts,
      'Se necesita más información para cualificar al lead.');
  }
  if (qualification.humanReviewRequired) {
    humanActions.push('Revisar lead manualmente antes de continuar.');
    warnings.push('Human review required en qualification.');
  }

  // ── DIAGNOSTIC ─────────────────────────────────────────────────────────────
  const diagnostic = diagnoseBusiness(onboarding);
  artifacts.diagnostic = diagnostic;
  completedStages.push(STAGE.DIAGNOSTIC);

  // ── REQUIREMENTS ───────────────────────────────────────────────────────────
  const requirements = buildRequirements(diagnostic, onboarding);
  artifacts.requirements = requirements;
  completedStages.push(STAGE.REQUIREMENTS);

  if (requirements.humanReviewRequired) {
    humanActions.push('Revisar requisitos críticos antes de generar propuesta.');
  }

  // ── SCOPE ──────────────────────────────────────────────────────────────────
  const recommendation = recommendCommercialPackage(onboarding.data ?? onboarding);
  const scope = buildClientScope(requirements, recommendation, onboarding);
  artifacts.scope       = scope;
  artifacts.recommendation = recommendation;
  completedStages.push(STAGE.SCOPE);

  // ── PROPOSAL ───────────────────────────────────────────────────────────────
  const proposalResult = await onboardingToProposal(lead);
  artifacts.proposal = proposalResult;
  completedStages.push(STAGE.PROPOSAL);

  if (!proposalResult.proposalReady) {
    blockedStages.push(STAGE.APPROVAL);
    return _result('BLOCKED', STAGE.PROPOSAL, completedStages, blockedStages, warnings, humanActions, artifacts,
      'Propuesta no generada.', proposalResult.missingInputs);
  }

  // ── APPROVAL ───────────────────────────────────────────────────────────────
  const approvalDecision = opts.simulateApprovalDecision ?? 'PROPOSAL_ACCEPTED';
  const approval = createApproval({
    proposalId:      proposalResult.proposal?.proposalId ?? 'PROP-SIM-001',
    clientName:      (onboarding.data ?? onboarding).businessName,
    decision:        approvalDecision,
    approvedBy:      (onboarding.data ?? onboarding).contactRole ?? 'OWNER',
    approvedScope:   scope.includedScope ?? [],
    approvedTier:    recommendation.recommendedPackage,
    commercialTerms: { estimate: proposalResult.commercialEstimate },
  });
  artifacts.approval = approval;
  completedStages.push(STAGE.APPROVAL);

  if (approval.decision !== 'PROPOSAL_ACCEPTED') {
    humanActions.push('Contactar cliente para resolver objeciones o renegociar propuesta.');
    return _result('REJECTED', STAGE.APPROVAL, completedStages, blockedStages, warnings, humanActions, artifacts,
      `Propuesta ${approval.decision}.`);
  }

  // ── PRODUCTION READINESS ───────────────────────────────────────────────────
  const prodReadiness = productionReady(approval, scope, onboarding);
  artifacts.productionReadiness = prodReadiness;
  completedStages.push(STAGE.PRODUCTION_READY);

  if (!prodReadiness.ready) {
    blockedStages.push(STAGE.PRODUCTION_BRIEF);
    return _result('BLOCKED', STAGE.PRODUCTION_READY, completedStages, blockedStages, warnings, humanActions, artifacts,
      'Production readiness gate no superado.', prodReadiness.blocks);
  }

  // ── FACTORY HANDOFF / PRODUCTION BRIEF ────────────────────────────────────
  const productionBrief = buildClientProductionBrief(onboarding, scope, approval, requirements, recommendation);
  artifacts.productionBrief = productionBrief;
  completedStages.push(STAGE.PRODUCTION_BRIEF);

  // ── PRODUCTION TRACKING ────────────────────────────────────────────────────
  let tracking = createProductionTracking(productionBrief);

  if (opts.markAllComponentsDone) {
    const components = ['landing','app','modules','roles','data_model','ai','automations','integrations','content','qa','security','documentation','handoff'];
    for (const c of components) {
      tracking = updateComponentStatus(tracking, c, 'DONE');
    }
  }

  artifacts.tracking = tracking;
  completedStages.push(STAGE.PRODUCTION_TRACKING);

  // ── DELIVERY READINESS ─────────────────────────────────────────────────────
  const deliveryReadiness = deliveryReady(tracking, scope, onboarding);
  artifacts.deliveryReadiness = deliveryReadiness;
  completedStages.push(STAGE.DELIVERY_READY);

  if (!deliveryReadiness.ready && !opts.markAllComponentsDone) {
    blockedStages.push(STAGE.DELIVERY);
    warnings.push('Delivery readiness gate no superado — continuar en producción.');
    return _result('IN_PRODUCTION', STAGE.DELIVERY_READY, completedStages, blockedStages, warnings, humanActions, artifacts,
      'Producción en curso. Delivery gate pendiente.', deliveryReadiness.blocks);
  }

  // ── DELIVERY ───────────────────────────────────────────────────────────────
  const manifest = generateDeliveryManifest(productionBrief, scope, tracking, proposalResult.commercialEstimate);
  artifacts.deliveryManifest = manifest;
  completedStages.push(STAGE.DELIVERY);

  // ── HANDOFF ────────────────────────────────────────────────────────────────
  let handoff = generateHandoff(manifest, scope, onboarding);
  // In simulation, mark all items done
  if (opts.markAllComponentsDone) {
    handoff = completeHandoff({
      ...handoff,
      acceptanceChecklist: handoff.acceptanceChecklist.map(c => ({ ...c, done: true })),
      trainingChecklist:   handoff.trainingChecklist.map(c => ({ ...c, done: true })),
    });
  }
  artifacts.handoff = handoff;
  completedStages.push(STAGE.HANDOFF);

  // ── SUPPORT WINDOW ─────────────────────────────────────────────────────────
  const supportWindow = createSupportWindow(recommendation.recommendedPackage);
  artifacts.supportWindow = supportWindow;
  completedStages.push(STAGE.SUPPORT);

  // ── CLOSEOUT ───────────────────────────────────────────────────────────────
  const closeout = closeClientProject({ deliveryManifest: manifest, handoff, supportWindow, tracking, openCRs: [] });
  artifacts.closeout = closeout;
  completedStages.push(STAGE.CLOSEOUT);

  const finalStatus = closeout.closed ? 'CLOSED' : 'BLOCKED';
  return _result(finalStatus, STAGE.CLOSEOUT, completedStages, blockedStages, warnings, humanActions, artifacts,
    closeout.closed ? 'Proyecto cerrado exitosamente.' : 'Cierre bloqueado.', closeout.blocks);
}

function _result(status, currentStage, completedStages, blockedStages, warnings, humanActions, artifacts, message, missingItems) {
  return {
    runnerVersion:   LIFECYCLE_RUNNER_VERSION,
    status,
    currentStage,
    completedStages,
    blockedStages,
    warnings,
    humanActions,
    artifacts,
    message:         message ?? null,
    missingItems:    missingItems ?? [],
    nextAction:      _nextAction(status, currentStage, humanActions),
  };
}

function _nextAction(status, stage, humanActions) {
  if (humanActions.length > 0) return humanActions[0];
  if (status === 'CLOSED')           return 'Proyecto cerrado. Archivar expediente.';
  if (status === 'NOT_A_FIT')        return 'Descartar lead o derivar a otra solución.';
  if (status === 'NEEDS_MORE_INFO')  return 'Solicitar información faltante al cliente.';
  if (status === 'REJECTED')         return 'Renegociar propuesta o cerrar oportunidad.';
  if (status === 'BLOCKED')          return `Resolver bloqueos en fase ${stage} antes de continuar.`;
  if (status === 'IN_PRODUCTION')    return 'Completar desarrollo y superar delivery gate.';
  if (status === 'INCOMPLETE')       return 'Completar datos de onboarding.';
  return 'Continuar con la siguiente fase.';
}
