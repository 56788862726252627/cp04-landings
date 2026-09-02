// Pipeline Health Report — ADV-09 CRM

import { computeOpportunityHealthScore, HEALTH_BAND } from './crmHealthScore.js';
import { buildPipelineForecast } from './pipelineForecast.js';

export function buildPipelineHealthReport(opportunities = [], label = '') {
  const scored = opportunities.map(opp => {
    const health = computeOpportunityHealthScore(opp);
    return Object.freeze({ opportunity: opp, health });
  });

  const byBand = {};
  for (const band of Object.values(HEALTH_BAND)) {
    byBand[band] = scored.filter(s => s.health.band === band).length;
  }

  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((s, x) => s + x.health.score, 0) / scored.length)
    : 0;

  const forecast = buildPipelineForecast(opportunities, label);

  const critical = scored
    .filter(s => s.health.band === HEALTH_BAND.CRITICAL || s.health.band === HEALTH_BAND.AT_RISK)
    .map(s => s.opportunity.id ?? '');

  return Object.freeze({
    label:          label || `Pipeline Health ${new Date().toISOString().slice(0,10)}`,
    totalOpportunities: opportunities.length,
    averageHealthScore: avgScore,
    byBand:         Object.freeze(byBand),
    criticalIds:    Object.freeze(critical),
    forecast:       forecast,
    generatedAt:    new Date().toISOString(),
    isReal: false,
  });
}

export const PIPELINE_HEALTH_REPORT_VERSION = '1.0.0';
