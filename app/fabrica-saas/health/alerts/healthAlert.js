// Health Alert — ADV-20 (no real alert send)

export const ALERT_TYPE = Object.freeze({
  CRITICAL_FAILURE:    'CRITICAL_FAILURE',
  SECURITY:            'SECURITY',
  PRIVACY:             'PRIVACY',
  BACKUP:              'BACKUP',
  DEPLOYMENT:          'DEPLOYMENT',
  AI:                  'AI',
  BUSINESS_TRUTH:      'BUSINESS_TRUTH',
  CLIENT_ISOLATION:    'CLIENT_ISOLATION',
  QUALITY:             'QUALITY',
  UNKNOWN_CRITICAL:    'UNKNOWN_CRITICAL',
});

export const ALERT_SEVERITY = Object.freeze({
  INFO:     'INFO',
  WARNING:  'WARNING',
  CRITICAL: 'CRITICAL',
});

let _alertCounter = 0;

export function createHealthAlert(config = {}) {
  const {
    type       = ALERT_TYPE.QUALITY,
    severity   = ALERT_SEVERITY.WARNING,
    dimension  = null,
    message    = '',
    source     = 'HEALTH_ENGINE',
    clientId   = null,
    dedupKey   = null,
  } = config;

  const id = config.id || `alert-${type}-${++_alertCounter}`;
  const timestamp = config.timestamp || new Date().toISOString();
  const key = dedupKey || `${type}::${dimension}::${message.slice(0, 30)}`;

  return Object.freeze({
    id,
    type,
    severity,
    dimension,
    message,
    source,
    clientId,
    timestamp,
    dedupKey: key,
    sent: false,
    noRealAlertSend: true,
    isReal: false,
  });
}

export const HEALTH_ALERT_VERSION = '1.0.0';
