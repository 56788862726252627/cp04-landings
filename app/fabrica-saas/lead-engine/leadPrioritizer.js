// Lead Prioritizer — ADV-08

import { LEAD_TEMPERATURE } from './leadModel.js';

export const PRIORITY_FILTER = Object.freeze({
  VERTICAL:         'VERTICAL',
  LOCATION:         'LOCATION',
  SERVICE:          'SERVICE',
  TEMPERATURE:      'TEMPERATURE',
  ESTIMATED_VALUE:  'ESTIMATED_VALUE',
  URGENCY:          'URGENCY',
});

function leadSortKey(lead) {
  return [
    -(lead.opportunityScore   ?? 0),
    -(lead.confidence         ?? 0),
    -(lead.dataQualityScore   ?? 0),
  ];
}

function compareTuples(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return  1;
  }
  return 0;
}

export function prioritizeLeads(leads = [], filters = {}) {
  let candidates = [...leads];

  if (filters.vertical) {
    candidates = candidates.filter(l => l.vertical === filters.vertical);
  }
  if (filters.location) {
    const loc = filters.location.toLowerCase();
    candidates = candidates.filter(l => (l.location ?? '').toLowerCase().includes(loc));
  }
  if (filters.service) {
    candidates = candidates.filter(l =>
      (l.recommendedServices ?? []).includes(filters.service) ||
      l.recommendedService === filters.service
    );
  }
  if (filters.temperature) {
    candidates = candidates.filter(l => l.temperature === filters.temperature);
  }
  if (filters.minScore !== undefined) {
    candidates = candidates.filter(l => (l.opportunityScore ?? 0) >= filters.minScore);
  }
  if (filters.minDataQuality !== undefined) {
    candidates = candidates.filter(l => (l.dataQualityScore ?? 0) >= filters.minDataQuality);
  }

  candidates.sort((a, b) => compareTuples(leadSortKey(a), leadSortKey(b)));

  const hot     = candidates.filter(l => l.temperature === LEAD_TEMPERATURE.HOT);
  const warm    = candidates.filter(l => l.temperature === LEAD_TEMPERATURE.WARM);
  const cold    = candidates.filter(l => l.temperature === LEAD_TEMPERATURE.COLD);
  const nurture = candidates.filter(l => l.temperature === LEAD_TEMPERATURE.NURTURE);

  return Object.freeze({
    ranked:         Object.freeze(candidates),
    hot:            Object.freeze(hot),
    warm:           Object.freeze(warm),
    cold:           Object.freeze(cold),
    nurture:        Object.freeze(nurture),
    total:          candidates.length,
    filtersApplied: Object.freeze(filters),
    isReal: false,
  });
}

export const LEAD_PRIORITIZER_VERSION = '1.0.0';
