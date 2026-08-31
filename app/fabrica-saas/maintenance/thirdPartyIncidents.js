// Third-Party Incidents — PASO F
// Classifies incident ownership: AGENCY / CLIENT / THIRD_PARTY

export const OWNERSHIP = Object.freeze({
  AGENCY_OWNED:       'AGENCY_OWNED',
  CLIENT_OWNED:       'CLIENT_OWNED',
  THIRD_PARTY_OWNED:  'THIRD_PARTY_OWNED',
  SHARED:             'SHARED',
});

export const THIRD_PARTY_CATEGORIES = Object.freeze({
  HOSTING:       'HOSTING',        // Cloudflare, Vercel, Netlify
  DATABASE:      'DATABASE',       // Supabase, PlanetScale
  PAYMENT:       'PAYMENT',        // Stripe, PayPal
  EMAIL:         'EMAIL',          // SendGrid, Resend
  AI_PROVIDER:   'AI_PROVIDER',    // OpenAI, Anthropic
  AUTOMATION:    'AUTOMATION',     // Make, Zapier
  ANALYTICS:     'ANALYTICS',      // Plausible, GA
  CRM:           'CRM',            // Airtable, HubSpot
  COMMUNICATION: 'COMMUNICATION',  // Twilio, WhatsApp Business
  OTHER:         'OTHER',
});

const AGENCY_OWNED_KEYWORDS   = ['codebase', 'deployment config', 'custom code', 'agency', 'build', 'ci/cd', 'worker'];
const CLIENT_OWNED_KEYWORDS   = ['client content', 'client credentials', 'domain registrar', 'client account', 'client password'];
const THIRD_PARTY_KEYWORDS    = ['stripe', 'openai', 'anthropic', 'supabase', 'cloudflare', 'make.com', 'zapier', 'twilio', 'whatsapp', 'sendgrid', 'vercel', 'netlify', 'airtable'];

/**
 * Classify the ownership of an incident description.
 */
export function classifyOwnership(description = '', category = null) {
  const lower = description.toLowerCase();

  const isThirdParty = THIRD_PARTY_KEYWORDS.some(kw => lower.includes(kw));
  const isClientOwned = CLIENT_OWNED_KEYWORDS.some(kw => lower.includes(kw));
  const isAgencyOwned = AGENCY_OWNED_KEYWORDS.some(kw => lower.includes(kw));

  let ownership;
  if (isThirdParty && isAgencyOwned) {
    ownership = OWNERSHIP.SHARED;
  } else if (isThirdParty) {
    ownership = OWNERSHIP.THIRD_PARTY_OWNED;
  } else if (isClientOwned) {
    ownership = OWNERSHIP.CLIENT_OWNED;
  } else if (isAgencyOwned) {
    ownership = OWNERSHIP.AGENCY_OWNED;
  } else {
    ownership = OWNERSHIP.AGENCY_OWNED; // default: agency investigates
  }

  return {
    ownership,
    category:         category ?? OTHER,
    detectedKeywords: [...THIRD_PARTY_KEYWORDS, ...AGENCY_OWNED_KEYWORDS, ...CLIENT_OWNED_KEYWORDS]
      .filter(kw => lower.includes(kw)),
    agencyAction: getAgencyAction(ownership),
    disclaimer:   'Ownership classification is an operational guide. Does not limit liability.',
  };
}

function getAgencyAction(ownership) {
  switch (ownership) {
    case OWNERSHIP.AGENCY_OWNED:
      return 'Agency owns resolution — activate incident protocol';
    case OWNERSHIP.CLIENT_OWNED:
      return 'Inform client — support as needed but client resolves';
    case OWNERSHIP.THIRD_PARTY_OWNED:
      return 'Monitor third-party status page — communicate to client, escalate if SLA breach';
    case OWNERSHIP.SHARED:
      return 'Joint investigation — agency handles its layer, escalates third-party issue separately';
    default:
      return 'Investigate ownership before taking action';
  }
}

/**
 * Build a third-party incident report.
 */
export function createThirdPartyIncidentReport(params = {}) {
  if (!params.description) return { valid: false, error: 'description required' };

  const classification = classifyOwnership(params.description, params.category);

  return {
    valid:          true,
    reportId:       params.reportId ?? `TPI-${Date.now()}`,
    title:          params.title ?? 'Third-party incident',
    description:    params.description,
    classification,
    affectedService: params.affectedService ?? 'unknown',
    statusPageUrl:   params.statusPageUrl ?? null,
    workaround:      params.workaround ?? null,
    communicationLog: params.communicationLog ?? [],
    createdAt:       new Date().toISOString(),
    disclaimer:      'This report is for tracking purposes only. No real incident actions triggered.',
  };
}

const OTHER = THIRD_PARTY_CATEGORIES.OTHER;

export const THIRD_PARTY_INCIDENTS_VERSION = '1.0.0';
