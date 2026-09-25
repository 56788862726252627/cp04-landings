// CRM Contact Model — ADV-09 CRM
// Only public business contact data. No sensitive personal fields.

export const CONSENT_STATUS = Object.freeze({
  IMPLICIT_PUBLIC: 'IMPLICIT_PUBLIC',
  EXPLICIT:        'EXPLICIT',
  WITHDRAWN:       'WITHDRAWN',
  UNKNOWN:         'UNKNOWN',
});

export const PREFERRED_CHANNEL = Object.freeze({
  EMAIL:    'EMAIL',
  PHONE:    'PHONE',
  WHATSAPP: 'WHATSAPP',
  LINKEDIN: 'LINKEDIN',
  UNKNOWN:  'UNKNOWN',
});

export function createCRMContact(fields = {}) {
  return Object.freeze({
    id:                  fields.id ?? `contact_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    accountId:           fields.accountId ?? '',
    name:                fields.name ?? '',
    role:                fields.role ?? '',
    publicBusinessEmail: fields.publicBusinessEmail ?? '',
    publicBusinessPhone: fields.publicBusinessPhone ?? '',
    preferredChannel:    fields.preferredChannel ?? PREFERRED_CHANNEL.UNKNOWN,
    source:              fields.source ?? '',
    consentStatus:       fields.consentStatus ?? CONSENT_STATUS.IMPLICIT_PUBLIC,
    notes:               fields.notes ?? '',
    createdAt:           fields.createdAt ?? new Date().toISOString(),
    updatedAt:           fields.updatedAt ?? new Date().toISOString(),
    isReal:              false,
  });
}

export const CRM_CONTACT_VERSION = '1.0.0';
