/**
 * Integration Manifest — Phase 15
 * Declares future integrations needed. Nothing is connected in demo.
 * Each integration has: required/optional/deferred, credential needed, production gate.
 */

export const INTEGRATION_MANIFEST_VERSION = '1.0.0';

const INTEGRATION_CATALOG = Object.freeze({
  supabase: {
    name: 'Supabase',
    purpose: 'Primary database, auth, real-time subscriptions',
    type: 'database',
    credentialNeeded: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    productionGate: 'SCHEMA_MIGRATION_APPROVED',
    demoMode: 'mock_data_only',
    docs: 'https://supabase.com/docs',
  },
  airtable: {
    name: 'Airtable',
    purpose: 'CRM, client records, lead tracking',
    type: 'crm',
    credentialNeeded: ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID'],
    productionGate: 'BASE_STRUCTURE_APPROVED',
    demoMode: 'mock_airtable_adapter',
    docs: 'https://airtable.com/developers',
  },
  make: {
    name: 'Make (Integromat)',
    purpose: 'Workflow automation: confirmations, reminders, reports',
    type: 'automation',
    credentialNeeded: ['MAKE_WEBHOOK_URL', 'MAKE_API_KEY'],
    productionGate: 'SCENARIO_APPROVED_AND_TESTED',
    demoMode: 'declarative_manifest_only',
    docs: 'https://www.make.com/en/help',
  },
  email: {
    name: 'Email Provider (SMTP/SES)',
    purpose: 'Transactional emails: confirmations, reminders, reports',
    type: 'communication',
    credentialNeeded: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'],
    productionGate: 'DOMAIN_VERIFIED',
    demoMode: 'logs_only',
    docs: null,
  },
  whatsapp: {
    name: 'WhatsApp Business API',
    purpose: 'WhatsApp notifications and chatbot',
    type: 'communication',
    credentialNeeded: ['WHATSAPP_API_KEY', 'WHATSAPP_PHONE_ID', 'WHATSAPP_TEMPLATE_NS'],
    productionGate: 'META_BUSINESS_ACCOUNT_APPROVED',
    demoMode: 'logs_only',
    docs: 'https://developers.facebook.com/docs/whatsapp',
  },
  stripe: {
    name: 'Stripe',
    purpose: 'Payment processing, subscriptions',
    type: 'payments',
    credentialNeeded: ['STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    productionGate: 'STRIPE_ACCOUNT_VERIFIED_LEGAL_ENTITY',
    demoMode: 'stripe_sandbox_only',
    docs: 'https://stripe.com/docs',
  },
  cloudflare: {
    name: 'Cloudflare Pages + Workers',
    purpose: 'Hosting, edge compute, KV storage, CDN',
    type: 'infrastructure',
    credentialNeeded: ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN'],
    productionGate: 'DOMAIN_CONFIGURED',
    demoMode: 'pages_preview_only',
    docs: 'https://developers.cloudflare.com',
  },
  googleCalendar: {
    name: 'Google Calendar',
    purpose: 'Appointment sync to professional calendars',
    type: 'calendar',
    credentialNeeded: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'],
    productionGate: 'OAUTH_CONSENT_SCREEN_VERIFIED',
    demoMode: 'mock_calendar',
    docs: 'https://developers.google.com/calendar',
  },
  googleDrive: {
    name: 'Google Drive',
    purpose: 'Document storage, backups, report delivery',
    type: 'storage',
    credentialNeeded: ['GOOGLE_DRIVE_FOLDER_ID', 'GOOGLE_SERVICE_ACCOUNT_JSON'],
    productionGate: 'SERVICE_ACCOUNT_AUTHORIZED',
    demoMode: 'local_files_only',
    docs: 'https://developers.google.com/drive',
  },
  anthropicAI: {
    name: 'Anthropic API (Claude)',
    purpose: 'AI agents: appointment assistant, FAQ, chatbot',
    type: 'ai',
    credentialNeeded: ['ANTHROPIC_API_KEY'],
    productionGate: 'API_KEY_RATE_LIMITS_CONFIGURED',
    demoMode: 'deterministic_stubs_only',
    docs: 'https://docs.anthropic.com',
  },
});

// ─── Sector Integration Profiles ─────────────────────────────────────────────

const SECTOR_INTEGRATIONS = Object.freeze({
  dental:     { required: ['supabase', 'email', 'cloudflare'], optional: ['whatsapp', 'googleCalendar', 'airtable'], deferred: ['stripe', 'anthropicAI'] },
  salud:      { required: ['supabase', 'email', 'cloudflare'], optional: ['whatsapp', 'googleCalendar'], deferred: ['stripe'] },
  fisio:      { required: ['supabase', 'email', 'cloudflare'], optional: ['whatsapp', 'googleCalendar', 'make'], deferred: ['stripe', 'anthropicAI'] },
  estetica:   { required: ['supabase', 'email', 'cloudflare'], optional: ['whatsapp', 'stripe', 'googleCalendar'], deferred: ['airtable'] },
  tech:       { required: ['supabase', 'email', 'cloudflare', 'anthropicAI'], optional: ['stripe', 'airtable'], deferred: ['whatsapp'] },
  educacion:  { required: ['supabase', 'email', 'cloudflare'], optional: ['googleCalendar', 'googleDrive'], deferred: ['stripe'] },
  legal:      { required: ['supabase', 'email', 'cloudflare', 'googleDrive'], optional: ['stripe', 'googleCalendar'], deferred: ['airtable'] },
  veterinary: { required: ['supabase', 'email', 'cloudflare', 'make'], optional: ['whatsapp', 'googleCalendar', 'anthropicAI'], deferred: ['stripe', 'airtable'] },
  default:    { required: ['supabase', 'email', 'cloudflare'], optional: ['make'], deferred: ['stripe'] },
});

/**
 * Generate integration manifest.
 * @param {Object} brief   - validated brief
 * @param {Object} profile - business profile
 * @returns {Object} integrationManifest
 */
export function generateIntegrationManifest(brief = {}, profile = {}) {
  const sector  = brief.sector ?? profile.sector ?? 'default';
  const sectorConf = SECTOR_INTEGRATIONS[sector] ?? SECTOR_INTEGRATIONS.default;

  function buildEntry(id, status) {
    const catalog = INTEGRATION_CATALOG[id];
    if (!catalog) return { id, status, name: id, unknown: true };
    return {
      id, status, ...catalog,
      productionReady: false,
      currentMode: catalog.demoMode,
    };
  }

  const integrations = {
    required: sectorConf.required.map(id => buildEntry(id, 'required')),
    optional: sectorConf.optional.map(id => buildEntry(id, 'optional')),
    deferred: sectorConf.deferred.map(id => buildEntry(id, 'deferred')),
  };

  const allCredentials = [
    ...sectorConf.required, ...sectorConf.optional,
  ].flatMap(id => INTEGRATION_CATALOG[id]?.credentialNeeded ?? []);

  return {
    totalIntegrations: sectorConf.required.length + sectorConf.optional.length + sectorConf.deferred.length,
    integrations,
    credentialsNeeded:    [...new Set(allCredentials)],
    productionStatus:     'NONE_CONNECTED — all integrations are declarative',
    notes: [
      'No real API keys are included in this manifest.',
      'All integrations require credential configuration before production use.',
      'Demo mode uses mocks/stubs for all external services.',
    ],
    manifestVersion: INTEGRATION_MANIFEST_VERSION,
  };
}
