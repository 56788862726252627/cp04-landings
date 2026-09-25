// Personalization Context — ADV-08

export function buildLeadPersonalizationContext(lead = {}) {
  const painTypes = (lead.painSignals ?? []).map(s => typeof s === 'string' ? s : s.type);
  const service   = lead.recommendedService ?? '';
  const name      = lead.businessName ?? 'your business';
  const location  = lead.location ?? '';
  const vertical  = lead.vertical ?? 'default';

  const hooks = [];
  if (painTypes.includes('NO_BOOKING'))          hooks.push('no online booking system');
  if (painTypes.includes('OUTDATED_WEBSITE'))     hooks.push('outdated website');
  if (painTypes.includes('NO_AUTOMATION'))        hooks.push('manual repetitive processes');
  if (painTypes.includes('POOR_MOBILE_UX'))       hooks.push('poor mobile experience');
  if (painTypes.includes('NO_CRM_SURFACE'))       hooks.push('no client management system');

  return Object.freeze({
    businessName:   name,
    vertical,
    location,
    service,
    hooks:          Object.freeze(hooks),
    tone:           hooks.length >= 2 ? 'diagnostic' : 'exploratory',
    note:           'Context built from public signals only — no private data used.',
    isReal: false,
  });
}

export const PERSONALIZATION_CONTEXT_VERSION = '1.0.0';
