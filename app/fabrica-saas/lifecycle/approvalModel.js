/**
 * Client Approval Model
 * Declarative approval structure. NOT a legal contract. NOT a binding signature.
 */

export const APPROVAL_MODEL_VERSION = '1.0.0';

export const APPROVAL_DECISIONS = Object.freeze({
  PROPOSAL_ACCEPTED:   'PROPOSAL_ACCEPTED',
  PROPOSAL_REJECTED:   'PROPOSAL_REJECTED',
  CHANGES_REQUESTED:   'CHANGES_REQUESTED',
  WAITING:             'WAITING',
  EXPIRED:             'EXPIRED',
});

/**
 * Creates a ClientApproval record from a client decision.
 * @param {Object} params
 * @param {string} params.proposalId
 * @param {string} params.decision — one of APPROVAL_DECISIONS
 * @param {string} params.decisionDate — ISO date string
 * @param {string} [params.humanReviewer]
 * @param {string[]} [params.requestedChanges]
 * @param {string} [params.approvedScopeVersion]
 * @param {string} [params.notes]
 * @returns {Object} ClientApproval
 */
export function createApproval(params = {}) {
  const {
    proposalId,
    decision,
    decisionDate,
    humanReviewer,
    requestedChanges = [],
    approvedScopeVersion,
    notes,
  } = params;

  if (!Object.values(APPROVAL_DECISIONS).includes(decision)) {
    return {
      valid: false,
      error: `Unknown decision: ${decision}. Allowed: ${Object.values(APPROVAL_DECISIONS).join(', ')}`,
    };
  }

  const isAccepted = decision === APPROVAL_DECISIONS.PROPOSAL_ACCEPTED;

  return {
    valid:                true,
    approvalType:         'CLIENT_APPROVAL',
    disclaimer:           'REGISTRO DECLARATIVO. NO ES UN CONTRATO LEGAL. NO TIENE VALIDEZ AUTÓNOMA. Requiere contrato formal firmado para inicio de proyecto.',
    proposalId:           proposalId ?? 'unknown',
    decision,
    decisionDate:         decisionDate ?? new Date().toISOString().split('T')[0],
    humanReviewer:        humanReviewer ?? null,
    requestedChanges,
    approvedScopeVersion: isAccepted ? (approvedScopeVersion ?? 'v1.0') : null,
    notes:                notes ?? null,
    readyForProduction:   isAccepted && requestedChanges.length === 0,
    version:              APPROVAL_MODEL_VERSION,
  };
}

/**
 * Checks if an approval is blocking production start.
 */
export function isApprovalBlockingProduction(approval = {}) {
  if (!approval.valid) return { blocked: true, reason: 'Invalid approval record' };
  if (approval.decision !== APPROVAL_DECISIONS.PROPOSAL_ACCEPTED) {
    return { blocked: true, reason: `Approval decision is ${approval.decision}, not PROPOSAL_ACCEPTED` };
  }
  if (approval.requestedChanges?.length > 0) {
    return { blocked: true, reason: 'Unresolved changes requested by client' };
  }
  return { blocked: false };
}
