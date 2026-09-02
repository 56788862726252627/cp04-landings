// Pipeline Forecast — ADV-09 CRM

import { CRM_STAGE } from './salesPipeline.js';

export const FORECAST_CATEGORY = Object.freeze({
  COMMIT:      'COMMIT',
  BEST_CASE:   'BEST_CASE',
  PIPELINE:    'PIPELINE',
  OMITTED:     'OMITTED',
});

const STAGE_CATEGORY_MAP = Object.freeze({
  [CRM_STAGE.NEW]:           FORECAST_CATEGORY.OMITTED,
  [CRM_STAGE.RESEARCH]:      FORECAST_CATEGORY.OMITTED,
  [CRM_STAGE.QUALIFIED]:     FORECAST_CATEGORY.PIPELINE,
  [CRM_STAGE.DISCOVERY]:     FORECAST_CATEGORY.PIPELINE,
  [CRM_STAGE.SOLUTION_FIT]:  FORECAST_CATEGORY.PIPELINE,
  [CRM_STAGE.PROPOSAL_PREP]: FORECAST_CATEGORY.BEST_CASE,
  [CRM_STAGE.PROPOSAL_SENT]: FORECAST_CATEGORY.BEST_CASE,
  [CRM_STAGE.NEGOTIATION]:   FORECAST_CATEGORY.COMMIT,
  [CRM_STAGE.WAITING_CLIENT]:FORECAST_CATEGORY.COMMIT,
  [CRM_STAGE.WON]:           FORECAST_CATEGORY.COMMIT,
  [CRM_STAGE.LOST]:          FORECAST_CATEGORY.OMITTED,
  [CRM_STAGE.NURTURE]:       FORECAST_CATEGORY.OMITTED,
});

function forecastCategory(stage) {
  return STAGE_CATEGORY_MAP[stage] ?? FORECAST_CATEGORY.OMITTED;
}

export function createOpportunityForecastLine(opportunity = {}) {
  const category       = forecastCategory(opportunity.stage);
  const acv            = opportunity.dealValueEstimate?.acvCentral ?? 0;
  const probability    = opportunity.dealValueEstimate?.probability ?? 0;
  const weightedValue  = Math.round(acv * probability);
  return Object.freeze({
    opportunityId:  opportunity.id ?? '',
    businessName:   opportunity.businessName ?? '',
    stage:          opportunity.stage ?? CRM_STAGE.NEW,
    category,
    acvCentral:     acv,
    probability,
    weightedValue,
    closeWindowDays:opportunity.closeWindowDays ?? 90,
    isReal: false,
  });
}

export function buildPipelineForecast(opportunities = [], label = '') {
  const lines = opportunities.map(createOpportunityForecastLine);

  function sum(cat) {
    return lines.filter(l => l.category === cat).reduce((s, l) => s + l.weightedValue, 0);
  }

  return Object.freeze({
    label:         label || `Forecast ${new Date().toISOString().slice(0,10)}`,
    totalPipeline: lines.reduce((s, l) => s + l.acvCentral, 0),
    commitValue:   sum(FORECAST_CATEGORY.COMMIT),
    bestCaseValue: sum(FORECAST_CATEGORY.COMMIT) + sum(FORECAST_CATEGORY.BEST_CASE),
    pipelineValue: lines.reduce((s, l) => s + l.weightedValue, 0),
    lineCount:     lines.length,
    lines:         Object.freeze(lines),
    generatedAt:   new Date().toISOString(),
    note:          'Forecast estimate only — not a committed revenue figure.',
    isReal: false,
  });
}

export const PIPELINE_FORECAST_VERSION = '1.0.0';
