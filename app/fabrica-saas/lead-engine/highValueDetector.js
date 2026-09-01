// High Value Detector — ADV-08

export function detectHighValueOpportunities(leads = []) {
  const highValue = leads.filter(lead => {
    const value   = lead.valueScore       ?? 0;
    const fit     = lead.fitScore         ?? 0;
    const score   = lead.opportunityScore ?? 0;
    const quality = lead.dataQualityScore ?? 0;

    return (
      value   >= 60 &&
      fit     >= 50 &&
      score   >= 55 &&
      quality >= 35
    );
  }).sort((a, b) => {
    const aComp = (a.valueScore ?? 0) * 0.5 + (a.fitScore ?? 0) * 0.3 + (a.opportunityScore ?? 0) * 0.2;
    const bComp = (b.valueScore ?? 0) * 0.5 + (b.fitScore ?? 0) * 0.3 + (b.opportunityScore ?? 0) * 0.2;
    return bComp - aComp;
  });

  return Object.freeze({
    highValue:     Object.freeze(highValue),
    count:         highValue.length,
    fromTotal:     leads.length,
    note:          'High value balanced with fit and complexity — not size-only.',
    isReal: false,
  });
}

export const HIGH_VALUE_DETECTOR_VERSION = '1.0.0';
