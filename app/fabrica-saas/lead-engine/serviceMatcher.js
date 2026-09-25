// Service Matcher — ADV-08

export const AGENCY_SERVICE = Object.freeze({
  SAAS_MVP:       'SAAS_MVP',
  WEB_LANDING:    'WEB_LANDING',
  AUTOMATION:     'AUTOMATION',
  AI_AGENT:       'AI_AGENT',
  BOOKING:        'BOOKING',
  CRM:            'CRM',
  LEAD_ENGINE:    'LEAD_ENGINE',
  DASHBOARD:      'DASHBOARD',
  VOICE:          'VOICE',
  REPORTING:      'REPORTING',
  INTEGRATIONS:   'INTEGRATIONS',
});

const VERTICAL_SERVICE_MAP = Object.freeze({
  dental:       [AGENCY_SERVICE.BOOKING, AGENCY_SERVICE.CRM, AGENCY_SERVICE.WEB_LANDING, AGENCY_SERVICE.AUTOMATION],
  fisio:        [AGENCY_SERVICE.BOOKING, AGENCY_SERVICE.WEB_LANDING, AGENCY_SERVICE.CRM],
  veterinary:   [AGENCY_SERVICE.BOOKING, AGENCY_SERVICE.WEB_LANDING, AGENCY_SERVICE.CRM, AGENCY_SERVICE.AUTOMATION],
  legal:        [AGENCY_SERVICE.CRM, AGENCY_SERVICE.AI_AGENT, AGENCY_SERVICE.DASHBOARD, AGENCY_SERVICE.AUTOMATION],
  beauty:       [AGENCY_SERVICE.BOOKING, AGENCY_SERVICE.WEB_LANDING, AGENCY_SERVICE.AUTOMATION],
  padel:        [AGENCY_SERVICE.BOOKING, AGENCY_SERVICE.SAAS_MVP, AGENCY_SERVICE.REPORTING],
  education:    [AGENCY_SERVICE.SAAS_MVP, AGENCY_SERVICE.WEB_LANDING, AGENCY_SERVICE.CRM, AGENCY_SERVICE.AI_AGENT],
  restaurant:   [AGENCY_SERVICE.WEB_LANDING, AGENCY_SERVICE.BOOKING, AGENCY_SERVICE.AUTOMATION],
  estetica:     [AGENCY_SERVICE.BOOKING, AGENCY_SERVICE.WEB_LANDING],
  default:      [AGENCY_SERVICE.WEB_LANDING, AGENCY_SERVICE.AUTOMATION, AGENCY_SERVICE.CRM],
});

const PAIN_TO_SERVICE = Object.freeze({
  NO_BOOKING:          AGENCY_SERVICE.BOOKING,
  MANUAL_CONTACT_ONLY: AGENCY_SERVICE.CRM,
  POOR_MOBILE_UX:      AGENCY_SERVICE.WEB_LANDING,
  BROKEN_CTA:          AGENCY_SERVICE.WEB_LANDING,
  NO_CRM_SURFACE:      AGENCY_SERVICE.CRM,
  NO_AUTOMATION:       AGENCY_SERVICE.AUTOMATION,
  NO_CHATBOT:          AGENCY_SERVICE.AI_AGENT,
  WEAK_FOLLOW_UP:      AGENCY_SERVICE.CRM,
  NO_LEAD_CAPTURE:     AGENCY_SERVICE.LEAD_ENGINE,
  MANUAL_APPOINTMENTS: AGENCY_SERVICE.BOOKING,
  OUTDATED_WEBSITE:    AGENCY_SERVICE.WEB_LANDING,
});

export function matchAgencyServices(lead = {}) {
  const vertical = (lead.vertical ?? 'default').toLowerCase();
  const verticalServices = VERTICAL_SERVICE_MAP[vertical] ?? VERTICAL_SERVICE_MAP.default;

  const painSignals = lead.painSignals ?? [];
  const painDriven = painSignals
    .map(s => PAIN_TO_SERVICE[typeof s === 'string' ? s : s.type])
    .filter(Boolean);

  const allServices = [...new Set([...verticalServices, ...painDriven])];

  const fitByService = Object.fromEntries(
    allServices.map(svc => {
      const verticalFit = verticalServices.includes(svc) ? 60 : 30;
      const painBoost   = painDriven.includes(svc) ? 30 : 0;
      return [svc, Math.min(100, verticalFit + painBoost)];
    })
  );

  const sorted = [...allServices].sort((a, b) => (fitByService[b] ?? 0) - (fitByService[a] ?? 0));
  const top = sorted[0] ?? AGENCY_SERVICE.WEB_LANDING;

  return Object.freeze({
    recommendedServices:  Object.freeze(sorted),
    primaryService:       top,
    fitByService:         Object.freeze(fitByService),
    reasoningSummary:     `Matched ${sorted.length} services for ${vertical} vertical with ${painDriven.length} pain-driven services`,
    isReal: false,
  });
}

export const SERVICE_MATCHER_VERSION = '1.0.0';
