// CRM Dashboard Model — ADV-09 CRM

import { CRM_STAGE } from './salesPipeline.js';
import { HEALTH_BAND } from './crmHealthScore.js';

export function buildCRMDashboard(opportunities = [], tasks = [], period = 'monthly') {
  const active  = opportunities.filter(o => ![CRM_STAGE.WON, CRM_STAGE.LOST].includes(o.stage));
  const won     = opportunities.filter(o => o.stage === CRM_STAGE.WON);
  const lost    = opportunities.filter(o => o.stage === CRM_STAGE.LOST);

  const totalACV = won.reduce((s, o) => s + (o.dealValueEstimate?.acvCentral ?? 0), 0);
  const pipelineACV = active.reduce((s, o) => s + (o.dealValueEstimate?.acvCentral ?? 0), 0);

  const winRate = (won.length + lost.length) > 0
    ? Math.round(won.length / (won.length + lost.length) * 100)
    : 0;

  const overdueTaskCount = tasks.filter(t => t.isOverdue).length;

  const healthAtRisk = opportunities.filter(o =>
    [HEALTH_BAND.AT_RISK, HEALTH_BAND.CRITICAL].includes(o.healthBand)
  ).length;

  return Object.freeze({
    period,
    summary: Object.freeze({
      activeOpportunities: active.length,
      wonDeals:            won.length,
      lostDeals:           lost.length,
      winRate,
      closedACV:           totalACV,
      pipelineACV,
    }),
    tasks: Object.freeze({
      total:   tasks.length,
      overdue: overdueTaskCount,
    }),
    health: Object.freeze({
      atRiskCount: healthAtRisk,
    }),
    generatedAt: new Date().toISOString(),
    isReal: false,
  });
}

export const DASHBOARD_MODEL_VERSION = '1.0.0';
