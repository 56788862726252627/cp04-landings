// Voice CRM Context — ADV-11 (connects ADV-09)

export function createVoiceCRMContext(crmAdapter = null) {
  function lookupContact(phone = '') {
    if (!crmAdapter || !phone) {
      return Object.freeze({ found: false, contact: null, phone, isReal: false });
    }
    const contact = crmAdapter.findByPhone?.(phone) ?? null;
    return Object.freeze({ found: Boolean(contact), contact, phone, isReal: false });
  }

  function buildPersonalizedGreeting(contact = null, businessName = '') {
    if (contact?.name) return `Hola ${contact.name}, te llama el asistente de ${businessName}.`;
    return `Hola, te llama el asistente de ${businessName}. ¿Con quién tengo el gusto?`;
  }

  function recordLeadFromCall(callData = {}) {
    return Object.freeze({
      recorded: Boolean(crmAdapter),
      callData: Object.freeze(callData),
      isReal: false,
    });
  }

  return Object.freeze({ lookupContact, buildPersonalizedGreeting, recordLeadFromCall, hasCRM: Boolean(crmAdapter), isReal: false });
}

export const VOICE_CRM_CONTEXT_VERSION = '1.0.0';
