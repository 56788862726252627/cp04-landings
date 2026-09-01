// Score Explainer — ADV-08

export function explainLeadScore(lead = {}) {
  const score     = lead.opportunityScore ?? 0;
  const fit       = lead.fitScore         ?? 0;
  const urgency   = lead.urgencyScore     ?? 0;
  const value     = lead.valueScore       ?? 0;
  const ease      = lead.easeScore        ?? 0;
  const quality   = lead.dataQualityScore ?? 0;

  const reasons   = [];
  const missing   = [];
  const improvers = [];

  if (fit >= 70)      reasons.push('Good vertical/service fit');
  else if (fit < 40)  missing.push('Low vertical fit — may not match agency capabilities');

  if (urgency >= 60)  reasons.push('Strong urgency signals detected');
  else if (urgency < 30) missing.push('Low urgency — pain signals not strong');

  if (value >= 60)    reasons.push('High estimated value potential');
  else if (value < 30) missing.push('Low estimated value — small or unknown business');

  if (ease >= 60)     reasons.push('Easy to approach — contact info available');
  else if (ease < 30) missing.push('Hard to approach — limited contact information');

  if (quality >= 70)  reasons.push('Good data quality — reliable signals');
  else if (quality < 40) {
    missing.push('Low data quality — signals may be incomplete');
    improvers.push('Add website, email or phone to improve data quality');
  }

  const painSignals = lead.painSignals ?? [];
  if (painSignals.length > 0) {
    reasons.push(`${painSignals.length} pain signal(s) identified`);
  }
  if ((lead.recommendedService || '').length > 0) {
    reasons.push(`Primary service: ${lead.recommendedService}`);
  }

  if (!lead.website) improvers.push('Finding website would boost fit and ease scores');
  if (!lead.publicEmail && !lead.publicPhone) improvers.push('Contact info required to progress');

  return Object.freeze({
    score,
    temperature:  lead.temperature ?? 'COLD',
    reasons:      Object.freeze(reasons),
    missing:      Object.freeze(missing),
    improvers:    Object.freeze(improvers),
    serviceFit:   lead.recommendedService ?? 'UNKNOWN',
    summary:      `Score ${score}/100 — ${reasons.length} positive, ${missing.length} gap(s)`,
    isReal: false,
  });
}

export const SCORE_EXPLAINER_VERSION = '1.0.0';
