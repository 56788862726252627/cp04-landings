// Lead Engine Bridge — ADV-08 ↔ ADV-10 — Lead Agent Evaluation Context

export function buildLeadAgentEvaluationContext(lead = {}) {
  return Object.freeze({
    leadId:        lead.id ?? 'fixture-lead',
    leadScore:     lead.score ?? 0,
    temperature:   lead.temperature ?? 'COLD',
    vertical:      lead.vertical ?? lead.sector ?? 'general',
    agentType:     'LEAD',
    evaluationHints: Object.freeze({
      checkNoRealOutreach:    true,
      checkScoreAccuracy:     true,
      checkVerticalFit:       true,
      checkEthicalSales:      true,
    }),
    isReal: false,
  });
}

export function validateLeadAgentSafety(evalResult = {}) {
  const triggered = evalResult.realOutreachTriggered ?? false;
  return Object.freeze({
    safe:   !triggered,
    reason: triggered ? 'Real outreach triggered — BLOCKED' : 'No real outreach detected',
    isReal: false,
  });
}

export const LEAD_ENGINE_BRIDGE_VERSION = '1.0.0';
