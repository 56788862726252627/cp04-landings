// Agency Bridge — Lead Engine ↔ Factory/Agency — ADV-08

export function buildAgencyLeadContext(lead = {}, agencyConfig = {}) {
  const capabilities  = agencyConfig.capabilities  ?? [];
  const verticals     = agencyConfig.supportedVerticals ?? [];
  const pricingRanges = agencyConfig.pricingRanges ?? {};

  const isVerticalSupported = verticals.length === 0 || verticals.includes(lead.vertical);
  const hasCapability = capabilities.length === 0 ||
    capabilities.includes(lead.recommendedService);

  const estimatedTicket = pricingRanges[lead.recommendedService]
    ?? pricingRanges.default
    ?? { min: 800, max: 3000 };

  return Object.freeze({
    leadId:              lead.id ?? '',
    vertical:            lead.vertical ?? 'default',
    isVerticalSupported,
    hasCapability,
    recommendedService:  lead.recommendedService ?? '',
    estimatedTicket,
    agencyFitScore:      isVerticalSupported && hasCapability ? 80 : 30,
    note:                'Agency fit based on config — not a revenue guarantee.',
    isReal: false,
  });
}

export const AGENCY_BRIDGE_VERSION = '1.0.0';
