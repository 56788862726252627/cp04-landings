// Security Observability — ADV-01 Transversal Observability
// Records security events. Never stores secret values.

import { createObservabilityEvent, SEVERITY, EVENT_TYPE, EVENT_STATUS, SERVICE } from './eventModel.js';
import { redactSensitiveData } from './redactionEngine.js';

export const SECURITY_EVENT_TYPE = Object.freeze({
  AUTH_FAILURE:         'AUTH_FAILURE',
  AUTHORIZATION_DENIED: 'AUTHORIZATION_DENIED',
  SECRET_DETECTED:      'SECRET_DETECTED',
  SUSPICIOUS_RATE:      'SUSPICIOUS_RATE',
  INVALID_WEBHOOK:      'INVALID_WEBHOOK',
  INVALID_INPUT_BURST:  'INVALID_INPUT_BURST',
  SECURITY_GATE_FAIL:   'SECURITY_GATE_FAIL',
  BRUTE_FORCE_ATTEMPT:  'BRUTE_FORCE_ATTEMPT',
  TOKEN_EXPIRED:        'TOKEN_EXPIRED',
  CROSS_CLIENT_ATTEMPT: 'CROSS_CLIENT_ATTEMPT',
});

export const SECURITY_SEVERITY_MAP = Object.freeze({
  [SECURITY_EVENT_TYPE.AUTH_FAILURE]:         SEVERITY.WARNING,
  [SECURITY_EVENT_TYPE.AUTHORIZATION_DENIED]: SEVERITY.WARNING,
  [SECURITY_EVENT_TYPE.SECRET_DETECTED]:      SEVERITY.CRITICAL,
  [SECURITY_EVENT_TYPE.SUSPICIOUS_RATE]:      SEVERITY.WARNING,
  [SECURITY_EVENT_TYPE.INVALID_WEBHOOK]:      SEVERITY.ERROR,
  [SECURITY_EVENT_TYPE.INVALID_INPUT_BURST]:  SEVERITY.WARNING,
  [SECURITY_EVENT_TYPE.SECURITY_GATE_FAIL]:   SEVERITY.ERROR,
  [SECURITY_EVENT_TYPE.BRUTE_FORCE_ATTEMPT]:  SEVERITY.CRITICAL,
  [SECURITY_EVENT_TYPE.TOKEN_EXPIRED]:        SEVERITY.INFO,
  [SECURITY_EVENT_TYPE.CROSS_CLIENT_ATTEMPT]: SEVERITY.CRITICAL,
});

/**
 * Create a security observability event.
 * @param {object} params
 * @param {string} params.securityEventType — SECURITY_EVENT_TYPE value
 * @param {string} params.message
 * @param {string} params.userId            — hashed or anonymized, never raw
 * @param {string} params.ipAddress         — anonymized (e.g. last octet masked)
 * @param {string} params.userAgent
 * @param {string} params.resource
 * @param {string} params.action
 * @param {object} params.metadata          — will be redacted automatically
 * @param {string} params.correlationId
 * @param {string} params.clientId
 * @param {string} params.projectId
 */
export function createSecurityEvent(params = {}) {
  const secType = params.securityEventType;
  if (!secType || !Object.values(SECURITY_EVENT_TYPE).includes(secType)) {
    return { valid: false, error: `securityEventType must be one of: ${Object.values(SECURITY_EVENT_TYPE).join(', ')}` };
  }

  const severity = SECURITY_SEVERITY_MAP[secType] ?? SEVERITY.ERROR;

  const safeMetadata = redactSensitiveData({
    securityEventType: secType,
    userId:            params.userId    ?? null,
    ipAddress:         params.ipAddress ?? null,
    userAgent:         params.userAgent ?? null,
    resource:          params.resource  ?? null,
    action:            params.action    ?? null,
    ...(params.metadata ? redactSensitiveData(params.metadata) : {}),
  });

  const result = createObservabilityEvent({
    eventType:    EVENT_TYPE.SECURITY,
    severity,
    status:       severity === SEVERITY.INFO ? EVENT_STATUS.SUCCESS : EVENT_STATUS.FAILURE,
    message:      params.message ?? `Security event: ${secType}`,
    service:      params.service ?? SERVICE.AUTH,
    component:    params.component ?? 'security-gate',
    correlationId: params.correlationId,
    clientId:     params.clientId,
    projectId:    params.projectId,
    errorCategory: 'SECURITY',
    recoverable:  false,
    humanActionRequired: severity === SEVERITY.CRITICAL,
    metadata:     safeMetadata,
    source: 'security-observability',
  });

  return result;
}

export const SECURITY_OBSERVABILITY_VERSION = '1.0.0';
