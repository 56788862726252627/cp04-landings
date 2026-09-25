// Agency CRM Report — ADV-09 CRM

import { buildPipelineForecast } from './pipelineForecast.js';
import { buildPipelineHealthReport } from './pipelineHealthReport.js';
import { buildCRMDashboard } from './dashboardModel.js';
import { aggregateLossReasons } from './lostDealAnalysis.js';
import { CRM_STAGE } from './salesPipeline.js';

export function generateAgencyCRMReport(opportunities = [], tasks = [], lostAnalyses = [], period = 'monthly') {
  const forecast   = buildPipelineForecast(opportunities);
  const health     = buildPipelineHealthReport(opportunities, `Report ${period}`);
  const dashboard  = buildCRMDashboard(opportunities, tasks, period);
  const lossAgg    = aggregateLossReasons(lostAnalyses);

  const stageBreakdown = {};
  for (const opp of opportunities) {
    const s = opp.stage ?? CRM_STAGE.NEW;
    stageBreakdown[s] = (stageBreakdown[s] ?? 0) + 1;
  }

  return Object.freeze({
    period,
    generatedAt:     new Date().toISOString(),
    dashboard,
    forecast,
    pipelineHealth:  health,
    stageBreakdown:  Object.freeze(stageBreakdown),
    lossAnalysis:    lossAgg,
    note:            'This report is a management estimate only — not financial guidance.',
    isReal: false,
  });
}

export const AGENCY_CRM_REPORT_VERSION = '1.0.0';
