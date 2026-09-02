// Recording Consent Policy — ADV-11
// Foundation stub — no real recording in this system (NO_REAL_CALLS=SI)

export const CONSENT_STATUS = Object.freeze({
  GRANTED:  'GRANTED',
  DENIED:   'DENIED',
  PENDING:  'PENDING',
  UNKNOWN:  'UNKNOWN',
});

export const CONSENT_DISCLOSURE = Object.freeze(
  'Esta llamada puede ser grabada con fines de calidad. ¿De acuerdo?',
);

export function createRecordingConsentPolicy(config = {}) {
  return Object.freeze({
    requireConsent:      config.requireConsent   ?? true,
    disclosureRequired:  config.disclosureRequired ?? true,
    noRealRecording:     true,
    isReal: false,
  });
}

export function buildConsentRequest() {
  return Object.freeze({
    disclosure:     CONSENT_DISCLOSURE,
    status:         CONSENT_STATUS.PENDING,
    isReal: false,
  });
}

export const DEFAULT_RECORDING_CONSENT_POLICY = createRecordingConsentPolicy();

export const RECORDING_CONSENT_POLICY_VERSION = '1.0.0';
