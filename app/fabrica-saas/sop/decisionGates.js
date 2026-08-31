// Decision Gates — FASE 17: gates reutilizables para cada etapa del pipeline

export const GATE_OUTCOMES = Object.freeze({
  PASS:         'PASS',
  BLOCKED:      'BLOCKED',
  HUMAN_REVIEW: 'HUMAN_REVIEW',
  PENDING:      'PENDING',
});

export const GATE_IDS = Object.freeze({
  COMMERCIAL:   'COMMERCIAL_GATE',
  SCOPE:        'SCOPE_GATE',
  PRODUCTION:   'PRODUCTION_GATE',
  QA:           'QA_GATE',
  SECURITY:     'SECURITY_GATE',
  DELIVERY:     'DELIVERY_GATE',
  CHANGE:       'CHANGE_GATE',
  INCIDENT:     'INCIDENT_GATE',
});

function buildGateResult(gateId, inputs, requiredChecks, blockingChecks, humanApprovalNeeded, context = {}) {
  const missingRequired = requiredChecks.filter(k => context[k] === undefined || context[k] === null);
  const failedBlocking  = blockingChecks.filter(k => context[k] === false);
  const needsHuman      = humanApprovalNeeded.some(k => context[k] === 'HUMAN_REVIEW' || context[k] === true);

  const outcome = missingRequired.length > 0
    ? GATE_OUTCOMES.PENDING
    : failedBlocking.length > 0
      ? GATE_OUTCOMES.BLOCKED
      : needsHuman
        ? GATE_OUTCOMES.HUMAN_REVIEW
        : GATE_OUTCOMES.PASS;

  return {
    gate:              gateId,
    outcome,
    inputs,
    missingRequired,
    failedBlocking,
    humanApprovalNeeded: needsHuman,
    reason:            failedBlocking[0] ?? missingRequired[0] ?? null,
    pass:              outcome === GATE_OUTCOMES.PASS,
  };
}

export function commercialGate(context = {}) {
  return buildGateResult(
    GATE_IDS.COMMERCIAL,
    ['budgetQualified', 'decisionMakerConfirmed', 'proposalGenerated'],
    ['budgetQualified', 'decisionMakerConfirmed'],
    ['budgetQualified', 'decisionMakerConfirmed'],
    ['humanReviewRequired'],
    context,
  );
}

export function scopeGate(context = {}) {
  return buildGateResult(
    GATE_IDS.SCOPE,
    ['scopeDocumentReady', 'hasP0Requirements', 'requirementsApproved'],
    ['scopeDocumentReady', 'hasP0Requirements'],
    ['scopeDocumentReady', 'hasP0Requirements', 'requirementsApproved'],
    [],
    context,
  );
}

export function productionGate(context = {}) {
  return buildGateResult(
    GATE_IDS.PRODUCTION,
    ['qaPass', 'securityPass', 'buildPass', 'envConfigured', 'agencyOwnerAuthorizes'],
    ['qaPass', 'securityPass', 'buildPass', 'envConfigured'],
    ['qaPass', 'securityPass', 'buildPass'],
    ['agencyOwnerAuthorizes'],
    context,
  );
}

export function qaGate(context = {}) {
  return buildGateResult(
    GATE_IDS.QA,
    ['functionalQA', 'deadControlQA', 'mobileQA', 'buildPasses', 'securityReview', 'testsPass'],
    ['functionalQA', 'deadControlQA', 'mobileQA', 'buildPasses', 'securityReview', 'testsPass'],
    ['functionalQA', 'deadControlQA', 'mobileQA', 'buildPasses', 'securityReview', 'testsPass'],
    ['privacyHumanReview'],
    context,
  );
}

export function securityGate(context = {}) {
  return buildGateResult(
    GATE_IDS.SECURITY,
    ['noSecretsInCode', 'leastPrivilegeApplied', 'demoDataClean', 'credentialPlanValid'],
    ['noSecretsInCode', 'leastPrivilegeApplied', 'demoDataClean'],
    ['noSecretsInCode', 'credentialPlanValid'],
    ['restrictedDataFound'],
    context,
  );
}

export function deliveryGate(context = {}) {
  return buildGateResult(
    GATE_IDS.DELIVERY,
    ['qaPass', 'deliveryManifestReady', 'clientAccepts', 'handoffPlanReady'],
    ['qaPass', 'deliveryManifestReady'],
    ['qaPass', 'deliveryManifestReady', 'clientAccepts'],
    [],
    context,
  );
}

export function changeGate(context = {}) {
  return buildGateResult(
    GATE_IDS.CHANGE,
    ['crClassified', 'impactEstimated'],
    ['crClassified'],
    ['crClassified'],
    ['scopeChangeApproval'],
    context,
  );
}

export function incidentGate(context = {}) {
  return buildGateResult(
    GATE_IDS.INCIDENT,
    ['incidentSeverity', 'incidentOwner', 'containmentInPlace'],
    ['incidentSeverity', 'incidentOwner'],
    ['containmentInPlace'],
    ['sev1EscalationRequired'],
    context,
  );
}

export const ALL_GATES = [
  GATE_IDS.COMMERCIAL, GATE_IDS.SCOPE, GATE_IDS.PRODUCTION,
  GATE_IDS.QA, GATE_IDS.SECURITY, GATE_IDS.DELIVERY,
  GATE_IDS.CHANGE, GATE_IDS.INCIDENT,
];

export const DECISION_GATES_VERSION = '1.0.0';
