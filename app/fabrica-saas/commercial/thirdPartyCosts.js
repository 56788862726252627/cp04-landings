/**
 * Third-Party Cost Catalog
 * Separates agency fees from external service costs.
 * NEVER present a third-party cost as an agency margin.
 */

export const THIRD_PARTY_COSTS_VERSION = '1.0.0';

export const COST_RESPONSIBILITY = Object.freeze({
  INCLUDED:      'INCLUDED',       // Covered by agency fee
  CLIENT_PAID:   'CLIENT_PAID',    // Client pays directly
  AGENCY_REBILLED:'AGENCY_REBILLED',// Agency pays and rebills at cost
  USAGE_BASED:   'USAGE_BASED',    // Depends on usage volume
  DEFERRED:      'DEFERRED',       // Not needed now, future plan
});

export const THIRD_PARTY_CATALOG = Object.freeze([
  {
    id:              'cloudflare-pages',
    name:            'Cloudflare Pages',
    purpose:         'Hosting de la app y landing (SPA)',
    monthlyEstimate: { min: 0, max: 0 },
    responsibility:  COST_RESPONSIBILITY.INCLUDED,
    notes:           'Tier gratuito suficiente para la mayoría de negocios. Custom domain incluido.',
    link:            'https://developers.cloudflare.com/pages/',
  },
  {
    id:              'supabase',
    name:            'Supabase',
    purpose:         'Base de datos PostgreSQL, auth y almacenamiento',
    monthlyEstimate: { min: 0, max: 25 },
    responsibility:  COST_RESPONSIBILITY.CLIENT_PAID,
    notes:           'Free tier suficiente en etapa inicial. Pro plan ~€25/mes para más de 50k usuarios.',
    link:            'https://supabase.com/pricing',
  },
  {
    id:              'make',
    name:            'Make (Integromat)',
    purpose:         'Automatizaciones de negocio: confirmaciones, recordatorios, reportes',
    monthlyEstimate: { min: 9, max: 29 },
    responsibility:  COST_RESPONSIBILITY.CLIENT_PAID,
    notes:           'Plan Core €9/mes (10k ops). Pro €29/mes para mayor volumen.',
    link:            'https://www.make.com/en/pricing',
  },
  {
    id:              'anthropic-api',
    name:            'Anthropic API (Claude)',
    purpose:         'Agentes IA: chatbot, asistente de citas, FAQ',
    monthlyEstimate: { min: 10, max: 100 },
    responsibility:  COST_RESPONSIBILITY.USAGE_BASED,
    notes:           'Coste variable según tokens. Estimación: €10-100/mes según uso. El cliente aporta su API key.',
    link:            'https://anthropic.com/pricing',
  },
  {
    id:              'smtp-email',
    name:            'SMTP / Email transaccional',
    purpose:         'Confirmaciones y recordatorios por email',
    monthlyEstimate: { min: 5, max: 20 },
    responsibility:  COST_RESPONSIBILITY.CLIENT_PAID,
    notes:           'Resend, SendGrid o similar. Tier gratuito cubre primeros meses.',
    link:            'https://resend.com/pricing',
  },
  {
    id:              'domain',
    name:            'Dominio',
    purpose:         'Dominio personalizado para la app',
    monthlyEstimate: { min: 1, max: 2 },
    responsibility:  COST_RESPONSIBILITY.CLIENT_PAID,
    notes:           '~€12-20/año. El cliente gestiona o la agencia registra y rebilla.',
    link:            'https://www.namecheap.com',
  },
  {
    id:              'whatsapp-api',
    name:            'WhatsApp Business API',
    purpose:         'Notificaciones y chatbot por WhatsApp',
    monthlyEstimate: { min: 50, max: 200 },
    responsibility:  COST_RESPONSIBILITY.CLIENT_PAID,
    notes:           'Requiere cuenta Meta Business verificada. Coste variable por conversación.',
    link:            'https://developers.facebook.com/docs/whatsapp/pricing',
  },
  {
    id:              'stripe',
    name:            'Stripe',
    purpose:         'Procesamiento de pagos online',
    monthlyEstimate: { min: 0, max: 0 },
    responsibility:  COST_RESPONSIBILITY.USAGE_BASED,
    notes:           '1.5% + €0.25 por transacción (Europa). Sin coste fijo. Requiere entidad legal.',
    link:            'https://stripe.com/es/pricing',
  },
  {
    id:              'airtable',
    name:            'Airtable',
    purpose:         'CRM, registro de leads y base de datos flexible',
    monthlyEstimate: { min: 0, max: 20 },
    responsibility:  COST_RESPONSIBILITY.CLIENT_PAID,
    notes:           'Free tier 1.200 filas/base. Team plan €20/usuario/mes para equipos.',
    link:            'https://airtable.com/pricing',
  },
  {
    id:              'google-calendar',
    name:            'Google Calendar API',
    purpose:         'Sincronización de citas con calendarios del equipo',
    monthlyEstimate: { min: 0, max: 0 },
    responsibility:  COST_RESPONSIBILITY.INCLUDED,
    notes:           'Gratis dentro de los límites de la API de Google. Requiere cuenta Google.',
    link:            'https://developers.google.com/calendar',
  },
]);

export function getThirdPartyCostById(id) {
  return THIRD_PARTY_CATALOG.find(c => c.id === id) ?? null;
}

export function getClientPaidCosts() {
  return THIRD_PARTY_CATALOG.filter(c =>
    c.responsibility === COST_RESPONSIBILITY.CLIENT_PAID ||
    c.responsibility === COST_RESPONSIBILITY.USAGE_BASED
  );
}

export function listThirdPartyIds() {
  return THIRD_PARTY_CATALOG.map(c => c.id);
}
