// Fast Win Detector — ADV-08

export function detectFastWins(leads = []) {
  const fastWins = leads.filter(lead => {
    const score   = lead.opportunityScore ?? 0;
    const ease    = lead.easeScore        ?? 0;
    const fit     = lead.fitScore         ?? 0;
    const quality = lead.dataQualityScore ?? 0;
    const temp    = lead.temperature      ?? 'COLD';
    const hasContact = Boolean(
      (lead.publicEmail && lead.publicEmail.includes('@')) ||
      (lead.publicPhone && lead.publicPhone.length >= 7)
    );
    const hasService = Boolean(lead.recommendedService || (lead.recommendedServices ?? []).length > 0);

    return (
      score    >= 60 &&
      ease     >= 55 &&
      fit      >= 55 &&
      quality  >= 40 &&
      hasContact &&
      hasService &&
      (temp === 'HOT' || temp === 'WARM')
    );
  });

  return Object.freeze({
    fastWins:      Object.freeze(fastWins),
    count:         fastWins.length,
    fromTotal:     leads.length,
    isReal: false,
  });
}

export const FAST_WIN_DETECTOR_VERSION = '1.0.0';
