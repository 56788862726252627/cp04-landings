// Lead Segmentation — ADV-08

export const SEGMENT = Object.freeze({
  HIGH_PRIORITY:          'HIGH_PRIORITY',
  FAST_WIN:               'FAST_WIN',
  HIGH_VALUE_LONGER_CYCLE:'HIGH_VALUE_LONGER_CYCLE',
  NURTURE:                'NURTURE',
  RESEARCH_REQUIRED:      'RESEARCH_REQUIRED',
  LOW_PRIORITY:           'LOW_PRIORITY',
});

export function segmentLead(lead = {}) {
  const score   = lead.opportunityScore ?? 0;
  const quality = lead.dataQualityScore ?? 0;
  const ease    = lead.easeScore        ?? 0;
  const value   = lead.valueScore       ?? 0;
  const temp    = lead.temperature      ?? 'COLD';

  if (quality < 25) return SEGMENT.RESEARCH_REQUIRED;
  if (score < 20)   return SEGMENT.LOW_PRIORITY;
  if (temp === 'HOT' && ease >= 60) return SEGMENT.FAST_WIN;
  if (score >= 70 && value >= 60)   return SEGMENT.HIGH_VALUE_LONGER_CYCLE;
  if (score >= 60)                  return SEGMENT.HIGH_PRIORITY;
  if (score >= 40)                  return SEGMENT.NURTURE;
  return SEGMENT.LOW_PRIORITY;
}

export function segmentLeads(leads = []) {
  const groups = Object.fromEntries(Object.values(SEGMENT).map(s => [s, []]));
  for (const lead of leads) {
    const seg = segmentLead(lead);
    groups[seg].push(lead);
  }
  return Object.freeze({
    ...Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, Object.freeze(v)])),
    total: leads.length,
    isReal: false,
  });
}

export const SEGMENTATION_VERSION = '1.0.0';
