// PII Data Inventory — ADV-19

export const PII_TYPE = Object.freeze({
  IDENTITY:          'IDENTITY',
  CONTACT:           'CONTACT',
  BUSINESS_DATA:     'BUSINESS_DATA',
  CRM_DATA:          'CRM_DATA',
  LEAD_DATA:         'LEAD_DATA',
  CONVERSATION_DATA: 'CONVERSATION_DATA',
  VOICE_METADATA:    'VOICE_METADATA',
  MEDIA_METADATA:    'MEDIA_METADATA',
  ANALYTICS:         'ANALYTICS',
  CREDENTIALS_REF:   'CREDENTIALS_REF',
});

export const LEGAL_BASIS_CODE = Object.freeze({
  CONSENT:              'CONSENT',
  CONTRACT:             'CONTRACT',
  LEGAL_OBLIGATION:     'LEGAL_OBLIGATION',
  LEGITIMATE_INTEREST:  'LEGITIMATE_INTEREST',
  UNKNOWN:              'UNKNOWN',
});

export const DELETION_METHOD = Object.freeze({
  DELETE:        'DELETE',
  ANONYMIZE:     'ANONYMIZE',
  PSEUDONYMIZE:  'PSEUDONYMIZE',
  LEGAL_HOLD:    'LEGAL_HOLD',
  NOT_DEFINED:   'NOT_DEFINED',
});

export function createPIIDataInventory(config = {}) {
  const {
    dataType = PII_TYPE.IDENTITY,
    classification = 'PERSONAL',
    purpose = '',
    source = 'UNKNOWN',
    storage = 'UNKNOWN',
    processor = 'INTERNAL',
    retention = 'STANDARD',
    legalBasisFoundation = LEGAL_BASIS_CODE.UNKNOWN,
    deletionMethod = DELETION_METHOD.NOT_DEFINED,
    accessRoles = [],
    clientId = null,
  } = config;

  const warnings = [];
  if (legalBasisFoundation === LEGAL_BASIS_CODE.UNKNOWN) {
    warnings.push('LEGAL_BASIS_REQUIRES_REVIEW');
  }
  if (deletionMethod === DELETION_METHOD.NOT_DEFINED) {
    warnings.push('DELETION_METHOD_UNDEFINED');
  }
  if (accessRoles.length === 0) {
    warnings.push('NO_ACCESS_ROLES_DEFINED');
  }

  return Object.freeze({
    dataType,
    classification,
    purpose,
    source,
    storage,
    processor,
    retention,
    legalBasisFoundation,
    deletionMethod,
    accessRoles: Object.freeze([...accessRoles]),
    clientId,
    warnings: Object.freeze([...warnings]),
    requiresLegalReview: legalBasisFoundation === LEGAL_BASIS_CODE.UNKNOWN,
    isReal: false,
  });
}

export const PII_INVENTORY_VERSION = '1.0.0';
