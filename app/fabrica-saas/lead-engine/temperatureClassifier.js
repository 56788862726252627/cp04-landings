// Temperature Classifier — ADV-08

import { LEAD_TEMPERATURE } from './leadModel.js';

const DEFAULT_THRESHOLDS = Object.freeze({ hot: 80, warm: 60, cold: 40 });

export function classifyTemperature(opportunityScore = 0, thresholds = {}) {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const temp = opportunityScore >= t.hot  ? LEAD_TEMPERATURE.HOT
    : opportunityScore >= t.warm ? LEAD_TEMPERATURE.WARM
    : opportunityScore >= t.cold ? LEAD_TEMPERATURE.COLD
    : LEAD_TEMPERATURE.NURTURE;

  return Object.freeze({ temperature: temp, score: opportunityScore, thresholds: Object.freeze(t), isReal: false });
}

export function classifyLeadTemperature(lead = {}, thresholds = {}) {
  return classifyTemperature(lead.opportunityScore ?? 0, thresholds);
}

export const TEMPERATURE_CLASSIFIER_VERSION = '1.0.0';
