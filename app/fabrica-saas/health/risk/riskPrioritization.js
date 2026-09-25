// Risk Prioritization — ADV-20

export function prioritizeHealthRisks(risks = []) {
  const sorted = [...risks].sort((a, b) => {
    // Security/privacy/production blockers first
    if (a.productionBlocker && !b.productionBlocker) return -1;
    if (!a.productionBlocker && b.productionBlocker) return 1;
    if (a.securityRisk && !b.securityRisk)   return -1;
    if (!a.securityRisk && b.securityRisk)   return 1;
    if (a.privacyRisk && !b.privacyRisk)     return -1;
    if (!a.privacyRisk && b.privacyRisk)     return 1;
    // Then by urgency score
    return (b.urgencyScore ?? 0) - (a.urgencyScore ?? 0);
  });

  const productionBlockers = sorted.filter(r => r.productionBlocker);
  const securityRisks      = sorted.filter(r => r.securityRisk && !r.productionBlocker);
  const others             = sorted.filter(r => !r.productionBlocker && !r.securityRisk);

  return Object.freeze({
    prioritized: Object.freeze(sorted),
    productionBlockers: Object.freeze(productionBlockers),
    securityRisks: Object.freeze(securityRisks),
    others: Object.freeze(others),
    totalCount: sorted.length,
    topRisk: sorted[0] ?? null,
    isReal: false,
  });
}

export const RISK_PRIORITIZATION_VERSION = '1.0.0';
