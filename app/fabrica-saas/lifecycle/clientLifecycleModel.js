/**
 * Client Lifecycle State Machine
 * Defines all states, allowed transitions, and gate requirements.
 * No LLM. No external calls. Fully deterministic.
 */

export const CLIENT_LIFECYCLE_VERSION = '1.0.0';

export const LIFECYCLE_STATES = Object.freeze({
  LEAD:                 'LEAD',
  QUALIFIED:            'QUALIFIED',
  ONBOARDING:           'ONBOARDING',
  DISCOVERY:            'DISCOVERY',
  DIAGNOSIS:            'DIAGNOSIS',
  REQUIREMENTS_READY:   'REQUIREMENTS_READY',
  PROPOSAL_READY:       'PROPOSAL_READY',
  PROPOSAL_SENT:        'PROPOSAL_SENT',
  APPROVED:             'APPROVED',
  REJECTED:             'REJECTED',
  WAITING_CLIENT:       'WAITING_CLIENT',
  PRODUCTION:           'PRODUCTION',
  QA:                   'QA',
  READY_FOR_DELIVERY:   'READY_FOR_DELIVERY',
  DELIVERED:            'DELIVERED',
  HANDOFF:              'HANDOFF',
  SUPPORT_WINDOW:       'SUPPORT_WINDOW',
  CLOSED:               'CLOSED',
  ON_HOLD:              'ON_HOLD',
  CANCELLED:            'CANCELLED',
});

const S = LIFECYCLE_STATES;

export const STATE_DEFINITIONS = Object.freeze({

  [S.LEAD]: {
    allowedTransitions:  [S.QUALIFIED, S.ONBOARDING, S.CANCELLED],
    requiredInputs:      ['businessName', 'contactRole', 'sector'],
    requiredOutputs:     [],
    blockingConditions:  [],
    humanReviewRequired: false,
    nextActions:         ['Complete onboarding form', 'Schedule discovery call'],
  },

  [S.QUALIFIED]: {
    allowedTransitions:  [S.ONBOARDING, S.CANCELLED, S.ON_HOLD],
    requiredInputs:      ['qualificationResult'],
    requiredOutputs:     ['fitScore', 'qualificationDecision'],
    blockingConditions:  ['qualificationDecision === NOT_A_FIT'],
    humanReviewRequired: false,
    nextActions:         ['Start onboarding process'],
  },

  [S.ONBOARDING]: {
    allowedTransitions:  [S.DISCOVERY, S.WAITING_CLIENT, S.CANCELLED],
    requiredInputs:      ['onboardingData'],
    requiredOutputs:     ['onboardingComplete'],
    blockingConditions:  ['missingRequiredFields.length > 0'],
    humanReviewRequired: false,
    nextActions:         ['Complete onboarding schema', 'Confirm decision maker'],
  },

  [S.DISCOVERY]: {
    allowedTransitions:  [S.DIAGNOSIS, S.WAITING_CLIENT, S.ON_HOLD],
    requiredInputs:      ['onboardingComplete'],
    requiredOutputs:     ['discoveryNotes'],
    blockingConditions:  [],
    humanReviewRequired: false,
    nextActions:         ['Map current processes', 'Identify pain points'],
  },

  [S.DIAGNOSIS]: {
    allowedTransitions:  [S.REQUIREMENTS_READY, S.WAITING_CLIENT],
    requiredInputs:      ['discoveryNotes'],
    requiredOutputs:     ['diagnosticSummary', 'opportunities', 'risks'],
    blockingConditions:  [],
    humanReviewRequired: false,
    nextActions:         ['Produce diagnostic report', 'Identify quick wins'],
  },

  [S.REQUIREMENTS_READY]: {
    allowedTransitions:  [S.PROPOSAL_READY, S.WAITING_CLIENT, S.ON_HOLD],
    requiredInputs:      ['diagnosticSummary', 'requirements'],
    requiredOutputs:     ['requirementsDocument', 'scope'],
    blockingConditions:  ['criticalRequirementsMissing'],
    humanReviewRequired: false,
    nextActions:         ['Build scope', 'Calculate pricing'],
  },

  [S.PROPOSAL_READY]: {
    allowedTransitions:  [S.PROPOSAL_SENT, S.WAITING_CLIENT],
    requiredInputs:      ['scope', 'commercialEstimate'],
    requiredOutputs:     ['proposalDocument'],
    blockingConditions:  ['humanReviewRequired && !humanReviewed'],
    humanReviewRequired: true,
    nextActions:         ['Human review of proposal', 'Send to client'],
  },

  [S.PROPOSAL_SENT]: {
    allowedTransitions:  [S.APPROVED, S.REJECTED, S.WAITING_CLIENT, S.ON_HOLD],
    requiredInputs:      ['proposalDocument'],
    requiredOutputs:     ['clientDecision'],
    blockingConditions:  [],
    humanReviewRequired: true,
    nextActions:         ['Await client response', 'Follow up if overdue'],
  },

  [S.APPROVED]: {
    allowedTransitions:  [S.PRODUCTION, S.ON_HOLD],
    requiredInputs:      ['clientApproval', 'approvedScope'],
    requiredOutputs:     ['productionReadiness'],
    blockingConditions:  ['!productionReady'],
    humanReviewRequired: true,
    nextActions:         ['Run production readiness gate', 'Brief factory'],
  },

  [S.REJECTED]: {
    allowedTransitions:  [S.PROPOSAL_READY, S.CANCELLED, S.ON_HOLD],
    requiredInputs:      ['rejectionReason'],
    requiredOutputs:     [],
    blockingConditions:  [],
    humanReviewRequired: true,
    nextActions:         ['Review changes requested', 'Decide whether to revise'],
  },

  [S.WAITING_CLIENT]: {
    allowedTransitions:  [S.DISCOVERY, S.DIAGNOSIS, S.REQUIREMENTS_READY, S.PROPOSAL_READY, S.PROPOSAL_SENT, S.ON_HOLD, S.CANCELLED],
    requiredInputs:      ['waitingReason'],
    requiredOutputs:     [],
    blockingConditions:  [],
    humanReviewRequired: false,
    nextActions:         ['Follow up with client', 'Set reminder'],
  },

  [S.PRODUCTION]: {
    allowedTransitions:  [S.QA, S.WAITING_CLIENT, S.ON_HOLD],
    requiredInputs:      ['productionBrief', 'productionReadiness'],
    requiredOutputs:     ['productionTracking'],
    blockingConditions:  ['!productionReady'],
    humanReviewRequired: false,
    nextActions:         ['Execute production plan', 'Track progress'],
  },

  [S.QA]: {
    allowedTransitions:  [S.READY_FOR_DELIVERY, S.PRODUCTION, S.WAITING_CLIENT],
    requiredInputs:      ['productionTracking'],
    requiredOutputs:     ['qaReport'],
    blockingConditions:  ['criticalQAFailed'],
    humanReviewRequired: true,
    nextActions:         ['Execute QA checklist', 'Fix critical issues'],
  },

  [S.READY_FOR_DELIVERY]: {
    allowedTransitions:  [S.DELIVERED],
    requiredInputs:      ['qaReport', 'deliveryReadiness'],
    requiredOutputs:     ['deliveryManifest'],
    blockingConditions:  ['!deliveryReady'],
    humanReviewRequired: true,
    nextActions:         ['Prepare delivery package', 'Schedule delivery session'],
  },

  [S.DELIVERED]: {
    allowedTransitions:  [S.HANDOFF, S.SUPPORT_WINDOW],
    requiredInputs:      ['deliveryManifest'],
    requiredOutputs:     ['deliveryConfirmation'],
    blockingConditions:  [],
    humanReviewRequired: false,
    nextActions:         ['Execute handoff process'],
  },

  [S.HANDOFF]: {
    allowedTransitions:  [S.SUPPORT_WINDOW],
    requiredInputs:      ['handoffPackage'],
    requiredOutputs:     ['handoffComplete'],
    blockingConditions:  [],
    humanReviewRequired: true,
    nextActions:         ['Transfer credentials plan', 'Training session'],
  },

  [S.SUPPORT_WINDOW]: {
    allowedTransitions:  [S.CLOSED],
    requiredInputs:      ['handoffComplete', 'supportPlan'],
    requiredOutputs:     ['supportLog'],
    blockingConditions:  ['criticalIssuesOpen'],
    humanReviewRequired: false,
    nextActions:         ['Monitor for bugs', 'Answer questions'],
  },

  [S.CLOSED]: {
    allowedTransitions:  [],
    requiredInputs:      ['closeoutReport'],
    requiredOutputs:     ['projectRecord'],
    blockingConditions:  [],
    humanReviewRequired: false,
    nextActions:         ['Archive project', 'Request testimonial'],
  },

  [S.ON_HOLD]: {
    allowedTransitions:  [S.DISCOVERY, S.DIAGNOSIS, S.REQUIREMENTS_READY, S.PROPOSAL_READY, S.PROPOSAL_SENT, S.APPROVED, S.PRODUCTION, S.CANCELLED],
    requiredInputs:      ['holdReason'],
    requiredOutputs:     [],
    blockingConditions:  [],
    humanReviewRequired: false,
    nextActions:         ['Document hold reason', 'Set resume date'],
  },

  [S.CANCELLED]: {
    allowedTransitions:  [],
    requiredInputs:      ['cancellationReason'],
    requiredOutputs:     ['cancellationRecord'],
    blockingConditions:  [],
    humanReviewRequired: false,
    nextActions:         ['Document learnings'],
  },

});

/**
 * Attempts a state transition. Returns { success, newState, error }.
 */
export function transition(currentState, targetState, context = {}) {
  const def = STATE_DEFINITIONS[currentState];
  if (!def) return { success: false, error: `Unknown state: ${currentState}` };

  if (!def.allowedTransitions.includes(targetState)) {
    return {
      success: false,
      error:   `Transition ${currentState} → ${targetState} is not allowed.`,
      allowedTransitions: def.allowedTransitions,
    };
  }

  const blockingViolations = def.blockingConditions.filter(c => {
    if (c === 'qualificationDecision === NOT_A_FIT') return context.qualificationDecision === 'NOT_A_FIT';
    if (c === 'missingRequiredFields.length > 0') return (context.missingRequiredFields ?? []).length > 0;
    if (c === 'criticalRequirementsMissing') return !!context.criticalRequirementsMissing;
    if (c === 'humanReviewRequired && !humanReviewed') return def.humanReviewRequired && !context.humanReviewed;
    if (c === '!productionReady') return !context.productionReady;
    if (c === 'criticalQAFailed') return !!context.criticalQAFailed;
    if (c === '!deliveryReady') return !context.deliveryReady;
    if (c === 'criticalIssuesOpen') return !!context.criticalIssuesOpen;
    return false;
  });

  if (blockingViolations.length > 0) {
    return { success: false, error: 'Blocking conditions not met', blockingViolations };
  }

  return { success: true, newState: targetState };
}

export function getStateDefinition(state) {
  return STATE_DEFINITIONS[state] ?? null;
}

export function listStates() {
  return Object.values(LIFECYCLE_STATES);
}
