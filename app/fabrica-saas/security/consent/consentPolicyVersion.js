// Consent Policy Version — ADV-19

export const VERSION_CHANGE_TYPE = Object.freeze({
  MATERIAL:     'MATERIAL',
  MINOR:        'MINOR',
  CORRECTION:   'CORRECTION',
});

export function createConsentPolicyVersion(config = {}) {
  const {
    version = '1.0.0',
    previousVersion = null,
    changeType = VERSION_CHANGE_TYPE.MINOR,
    changedPurposes = [],
    requiresNewConsent = false,
    effectiveDate = new Date().toISOString(),
    clientId = null,
  } = config;

  const materialChange = changeType === VERSION_CHANGE_TYPE.MATERIAL;
  const newConsentRequired = materialChange || requiresNewConsent;

  return Object.freeze({
    clientId,
    version,
    previousVersion,
    changeType,
    changedPurposes: Object.freeze([...changedPurposes]),
    requiresNewConsent: newConsentRequired,
    effectiveDate,
    notes: newConsentRequired
      ? 'MATERIAL_CHANGE_EXISTING_CONSENTS_MAY_NEED_REFRESH'
      : null,
    isReal: false,
  });
}

export const CONSENT_VERSION_POLICY_VERSION = '1.0.0';
