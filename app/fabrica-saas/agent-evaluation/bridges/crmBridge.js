// CRM Bridge — ADV-09 ↔ ADV-10 — CRM Agent Evaluation Context

export function buildCRMAgentEvaluationContext(opportunity = {}) {
  return Object.freeze({
    opportunityId:  opportunity.opportunityId ?? 'fixture-opp',
    stage:          opportunity.stage ?? 'QUALIFIED',
    priority:       opportunity.priority ?? 'P2_MEDIUM',
    vertical:       opportunity.vertical ?? 'general',
    agentType:      'CRM',
    evaluationHints: Object.freeze({
      checkStageAccuracy:           true,
      checkNoPIILeak:               true,
      checkEthicalSales:            true,
      checkProposalGrounding:       true,
      checkNoFabricatedDealData:    true,
    }),
    isReal: false,
  });
}

export function validateCRMAgentCompliance(evalResult = {}) {
  const fabricated = evalResult.fabricatedDealData ?? false;
  const piiLeak    = evalResult.piiLeak ?? false;
  const issues = [];
  if (fabricated) issues.push('Fabricated deal data detected');
  if (piiLeak)    issues.push('PII leak detected in CRM context');
  return Object.freeze({
    compliant: issues.length === 0,
    issues:    Object.freeze(issues),
    isReal:    false,
  });
}

export const CRM_BRIDGE_VERSION = '1.0.0';
