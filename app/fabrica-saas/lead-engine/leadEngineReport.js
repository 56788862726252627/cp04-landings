// Lead Engine Report & Quality Score — ADV-08

import { LEAD_TEMPERATURE } from './leadModel.js';
import { DATA_QUALITY_LEVEL } from './dataQualityEngine.js';

export function buildLeadEngineReport(results = {}) {
  const leads      = results.leads      ?? [];
  const duplicates = results.duplicates ?? [];
  const rejected   = results.rejected   ?? [];
  const provider   = results.provider   ?? {};

  const fresh  = leads.filter(l => l.freshnessStatus === 'FRESH');
  const stale  = leads.filter(l => l.freshnessStatus === 'STALE');
  const hot    = leads.filter(l => l.temperature === LEAD_TEMPERATURE.HOT);
  const warm   = leads.filter(l => l.temperature === LEAD_TEMPERATURE.WARM);
  const cold   = leads.filter(l => l.temperature === LEAD_TEMPERATURE.COLD);
  const nurture= leads.filter(l => l.temperature === LEAD_TEMPERATURE.NURTURE);

  const avgScore   = leads.length > 0
    ? Math.round(leads.reduce((s, l) => s + (l.opportunityScore ?? 0), 0) / leads.length)
    : 0;
  const avgQuality = leads.length > 0
    ? Math.round(leads.reduce((s, l) => s + (l.dataQualityScore ?? 0), 0) / leads.length)
    : 0;

  const highPriority = leads.filter(l => (l.opportunityScore ?? 0) >= 70);
  const fastWins     = results.fastWins     ?? [];
  const highValue    = results.highValue    ?? [];

  const warnings = [];
  if (avgQuality < 40) warnings.push('Average data quality below 40 — results may be unreliable');
  if (duplicates.length > leads.length * 0.3) warnings.push('High duplicate rate detected');
  if (hot.length === 0 && leads.length > 0) warnings.push('No hot leads found — review scoring weights');

  return Object.freeze({
    discovered:       leads.length + duplicates.length + rejected.length,
    accepted:         leads.length,
    rejected:         rejected.length,
    duplicates:       duplicates.length,
    fresh:            fresh.length,
    stale:            stale.length,
    hot:              hot.length,
    warm:             warm.length,
    cold:             cold.length,
    nurture:          nurture.length,
    averageScore:     avgScore,
    averageQuality:   avgQuality,
    highPriority:     highPriority.length,
    fastWins:         fastWins.length,
    highValue:        highValue.length,
    providerUsage:    provider.name ?? 'FIXTURE',
    estimatedCost:    provider.estimatedCost ?? 0,
    warnings:         Object.freeze(warnings),
    isReal: false,
  });
}

export function calculateLeadEngineQualityScore(report = {}, leads = []) {
  const factors = {};

  const avgQuality = report.averageQuality ?? 0;
  factors.DATA_QUALITY = avgQuality;

  const dupRate = report.discovered > 0 ? (report.duplicates / report.discovered) : 0;
  factors.DEDUPE_QUALITY = Math.round(Math.max(0, 100 - dupRate * 100));

  const hotRate = report.accepted > 0 ? ((report.hot / report.accepted) * 100) : 0;
  factors.SCORING_CONSISTENCY = Math.min(100, Math.round(hotRate * 3 + 40));

  factors.EXPLAINABILITY = leads.length > 0 && leads.every(l => l.temperature) ? 90 : 50;
  factors.PRIVACY = 90;
  factors.PROVIDER_SAFETY = 95;
  factors.PRIORITIZATION = report.highPriority > 0 ? 80 : 50;

  const score = Math.round(
    Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length
  );

  const level = score >= 80 ? DATA_QUALITY_LEVEL.HIGH
    : score >= 55 ? DATA_QUALITY_LEVEL.MEDIUM
    : score >= 30 ? DATA_QUALITY_LEVEL.LOW
    : DATA_QUALITY_LEVEL.MINIMAL;

  return Object.freeze({ score, level, factors: Object.freeze(factors), isReal: false });
}

export const LEAD_ENGINE_REPORT_VERSION = '1.0.0';
