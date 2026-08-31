// ObservabilityEvent Model — ADV-01 Transversal Observability
// Core event structure shared across Agency IA, Factory SaaS, generated SaaS.

export const SEVERITY = Object.freeze({
  DEBUG:    'DEBUG',
  INFO:     'INFO',
  WARNING:  'WARNING',
  ERROR:    'ERROR',
  CRITICAL: 'CRITICAL',
});

export const EVENT_TYPE = Object.freeze({
  REQUEST:     'REQUEST',
  RESPONSE:    'RESPONSE',
  ERROR:       'ERROR',
  HEALTH:      'HEALTH',
  AUTOMATION:  'AUTOMATION',
  AI:          'AI',
  DEPLOY:      'DEPLOY',
  SECURITY:    'SECURITY',
  AUTH:        'AUTH',
  LIFECYCLE:   'LIFECYCLE',
  ALERT:       'ALERT',
  INCIDENT:    'INCIDENT',
  AUDIT:       'AUDIT',
  PERFORMANCE: 'PERFORMANCE',
  INTEGRATION: 'INTEGRATION',
  USER:        'USER',
  SYSTEM:      'SYSTEM',
});

export const ENV = Object.freeze({
  DEVELOPMENT: 'development',
  STAGING:     'staging',
  PRODUCTION:  'production',
  TEST:        'test',
});

export const SERVICE = Object.freeze({
  FRONTEND:   'frontend',
  WORKER:     'worker',
  API:        'api',
  DATABASE:   'database',
  AUTOMATION: 'automation',
  AI:         'ai',
  STORAGE:    'storage',
  AUTH:       'auth',
  DEPLOY:     'deploy',
  MONITORING: 'monitoring',
  EXTERNAL:   'external',
});

export const EVENT_STATUS = Object.freeze({
  SUCCESS:   'SUCCESS',
  FAILURE:   'FAILURE',
  PENDING:   'PENDING',
  RECOVERED: 'RECOVERED',
  SKIPPED:   'SKIPPED',
  BLOCKED:   'BLOCKED',
});

function genId(prefix = 'evt') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create a validated ObservabilityEvent.
 * Caller must redact secrets before passing metadata.
 */
export function createObservabilityEvent(params = {}) {
  const errors = [];

  if (!params.eventType || !Object.values(EVENT_TYPE).includes(params.eventType))
    errors.push(`eventType must be one of: ${Object.values(EVENT_TYPE).join(', ')}`);
  if (!params.severity || !Object.values(SEVERITY).includes(params.severity))
    errors.push(`severity must be one of: ${Object.values(SEVERITY).join(', ')}`);
  if (!params.message)
    errors.push('message required');

  if (errors.length > 0) return { valid: false, errors, event: null };

  const event = Object.freeze({
    eventId:             params.eventId             ?? genId('evt'),
    timestamp:           params.timestamp           ?? new Date().toISOString(),
    projectId:           params.projectId           ?? 'unknown',
    clientId:            params.clientId            ?? 'unknown',
    environment:         params.environment         ?? ENV.DEVELOPMENT,
    service:             params.service             ?? SERVICE.SYSTEM,
    component:           params.component           ?? 'unknown',
    module:              params.module              ?? 'unknown',
    eventType:           params.eventType,
    severity:            params.severity,
    status:              params.status              ?? EVENT_STATUS.SUCCESS,
    message:             params.message,
    correlationId:       params.correlationId       ?? genId('cid'),
    traceId:             params.traceId             ?? genId('trc'),
    operationId:         params.operationId         ?? genId('op'),
    durationMs:          params.durationMs          ?? null,
    errorCode:           params.errorCode           ?? null,
    errorCategory:       params.errorCategory       ?? null,
    recoverable:         params.recoverable         ?? true,
    retryCount:          params.retryCount          ?? 0,
    humanActionRequired: params.humanActionRequired ?? false,
    metadata:            params.metadata            ?? {},
    source:              params.source              ?? 'system',
  });

  return { valid: true, errors: [], event };
}

export const OBSERVABILITY_EVENT_VERSION = '1.0.0';
