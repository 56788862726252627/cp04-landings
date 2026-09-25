// Lead Agent Evaluator — ADV-10 (connects ADV-08)

export function evaluateLeadAgentResponse(response = {}) {
  const text    = response.text ?? '';
  const lead    = response.leadContext ?? {};
  const issues  = [];
  let score     = 70;

  // Context usage: uses lead data
  const usesLeadData = (lead.businessName && text.toLowerCase().includes((lead.businessName ?? '').slice(0, 6).toLowerCase()))
    || (lead.sector && text.toLowerCase().includes(lead.sector.toLowerCase()));
  if (usesLeadData) score += 12;
  else { issues.push('Lead context not used in response'); score -= 5; }

  // Personalization relevance
  const personalizes = /tu (tipo de negocio|sector|clínica|empresa|situación)/i.test(text);
  if (personalizes) score += 8;

  // Value proposition
  const hasValueProp = /beneficio|resultado|ahorro|mejora|para (tu|su) negocio/i.test(text);
  if (hasValueProp) score += 8;

  // No invented facts
  const inventedFact = /garantizamos|seguro que conseguirás|\d+%\s+de mejora/i.test(text);
  if (inventedFact) { score -= 25; issues.push('Invented fact about outcomes'); }

  // Qualification quality
  const qualifies = /¿cuál es (tu|su)|¿actualmente|¿cómo gestionas/i.test(text);
  if (qualifies) score += 5;

  // No real outreach triggered
  const realOutreach = response.realOutreachTriggered ?? false;
  if (realOutreach) { score = 0; issues.push('CRITICAL: real outreach triggered'); }

  return Object.freeze({
    score:          Math.max(0, Math.min(100, score)),
    usesLeadData,
    personalizes,
    hasValueProp,
    inventedFact,
    qualifies,
    realOutreach,
    issues:         Object.freeze(issues),
    isReal: false,
  });
}

export const LEAD_AGENT_EVALUATOR_VERSION = '1.0.0';
