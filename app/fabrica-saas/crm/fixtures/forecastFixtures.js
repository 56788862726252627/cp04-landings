// Forecast Fixtures — ADV-09 CRM

import { buildPipelineForecast } from '../pipelineForecast.js';
import { PIPELINE_FIXTURE_OPPORTUNITIES } from './pipelineFixtures.js';

export const FORECAST_FIXTURE = buildPipelineForecast(
  PIPELINE_FIXTURE_OPPORTUNITIES,
  'September 2026 Forecast'
);
