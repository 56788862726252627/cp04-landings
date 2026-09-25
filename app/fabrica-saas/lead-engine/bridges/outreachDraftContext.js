// Outreach Draft Context — ADV-08
// Prepares context ONLY — NO sending, NO API calls, NO emails, NO WhatsApp

export function prepareOutreachDraftContext(lead = {}, personalizationCtx = {}) {
  const hooks     = personalizationCtx.hooks ?? [];
  const name      = lead.businessName ?? 'your business';
  const service   = lead.recommendedService ?? 'digital solutions';
  const action    = lead.recommendedNextAction ?? 'QUALIFY';

  const hookPhrase = hooks.length > 0
    ? `We noticed ${hooks[0]}${hooks[1] ? ` and ${hooks[1]}` : ''}`
    : 'We found some areas where digital tools could help';

  return Object.freeze({
    subject:         `${name} — improving digital operations`,
    bodyHints:       Object.freeze([
      `Opening: ${hookPhrase}`,
      `Value: ${service} tailored for ${lead.vertical ?? 'your sector'}`,
      `CTA: Brief call to explore fit — 15 min`,
    ]),
    tone:            'professional and concise',
    antiPatterns:    Object.freeze(['no fake urgency', 'no pressure', 'no false claims', 'not spammy']),
    readyToSend:     false,
    blockingReason:  action !== 'PREPARE_OUTREACH' ? `Action is ${action}, not PREPARE_OUTREACH` : 'Human review required before sending',
    note:            'DRAFT CONTEXT ONLY. NO outreach will be sent automatically. Ever.',
    isReal: false,
  });
}

export const OUTREACH_DRAFT_CONTEXT_VERSION = '1.0.0';
