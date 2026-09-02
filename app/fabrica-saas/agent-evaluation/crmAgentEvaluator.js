// CRM Agent Evaluator — ADV-10 (connects ADV-09)

export function evaluateCRMAgentResponse(response = {}) {
  const text     = response.text ?? '';
  const opp      = response.opportunityContext ?? {};
  const issues   = [];
  let score      = 70;

  // Stage awareness
  const stage = opp.stage ?? '';
  const stageAware = stage && text.toLowerCase().includes(stage.toLowerCase().replace('_', ' '));
  if (stageAware) score += 10;

  // Deal context usage
  const usesDealContext = (opp.businessName && text.toLowerCase().includes((opp.businessName ?? '').slice(0,6).toLowerCase()))
    || (opp.service && text.toLowerCase().includes((opp.service ?? '').toLowerCase()));
  if (usesDealContext) score += 8;

  // Next action quality
  const suggestsNextAction = /próximo paso|siguiente acción|deberíamos|propongo/i.test(text);
  if (suggestsNextAction) score += 8;

  // Proposal preparation
  const proposalReady = /propuesta|presupuesto|oferta|precio/i.test(text) && stage?.includes('PROPOSAL');
  if (proposalReady) score += 7;

  // No stage hallucination
  const hallucinatesStage = /estamos en (contrato|firma|cierre)/i.test(text) && !['WON', 'NEGOTIATION'].includes(stage);
  if (hallucinatesStage) { score -= 25; issues.push('Stage hallucination detected'); }

  // Follow-up suitability
  const followUp = /¿cuándo podemos|¿tienes disponibilidad|te llamo/i.test(text);
  if (followUp) score += 5;

  return Object.freeze({
    score:         Math.max(0, Math.min(100, score)),
    stageAware,
    usesDealContext,
    suggestsNextAction,
    hallucinatesStage,
    followUp,
    issues:        Object.freeze(issues),
    isReal: false,
  });
}

export const CRM_AGENT_EVALUATOR_VERSION = '1.0.0';
