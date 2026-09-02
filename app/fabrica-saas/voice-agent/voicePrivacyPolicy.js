// Voice Privacy Policy — ADV-11

export const DATA_CATEGORY = Object.freeze({
  NAME:        'NAME',
  PHONE:       'PHONE',
  EMAIL:       'EMAIL',
  BOOKING_REF: 'BOOKING_REF',
  HEALTH_INFO: 'HEALTH_INFO',
  PAYMENT:     'PAYMENT',
});

export const RETENTION_POLICY = Object.freeze({
  SESSION_ONLY:  'SESSION_ONLY',
  HOURS_24:      '24_HOURS',
  NEVER_STORED:  'NEVER_STORED',
});

export function redactSensitiveData(text = '') {
  return text
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[TARJETA_REDACTADA]')
    .replace(/\b[6-9]\d{8}\b/g, '[TELEFONO_REDACTADO]')
    .replace(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, '[EMAIL_REDACTADO]');
}

export function createVoicePrivacyPolicy(config = {}) {
  return Object.freeze({
    minimumDataOnly:   config.minimumDataOnly  ?? true,
    noHealthStorage:   config.noHealthStorage  ?? true,
    noPaymentStorage:  config.noPaymentStorage ?? true,
    retention:         config.retention        ?? RETENTION_POLICY.SESSION_ONLY,
    clientIsolation:   true,
    isReal: false,
  });
}

export const DEFAULT_VOICE_PRIVACY_POLICY = createVoicePrivacyPolicy();

export const VOICE_PRIVACY_POLICY_VERSION = '1.0.0';
