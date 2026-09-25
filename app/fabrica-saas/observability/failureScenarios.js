// Failure Scenarios — ADV-01 Transversal Observability
// Tests that all failure types are handled safely.

import { createObservabilityEvent, SEVERITY, EVENT_TYPE, EVENT_STATUS, SERVICE, ENV } from './eventModel.js';
import { normalizeError, ERROR_CATEGORY } from './errorNormalizer.js';
import { redactSensitiveData, containsSecret } from './redactionEngine.js';
import { createSecurityEvent, SECURITY_EVENT_TYPE } from './securityObservability.js';
import { assertClientIsolation } from './clientIsolation.js';

export const FAILURE_SCENARIO = Object.freeze({
  NETWORK_TIMEOUT:           'network_timeout',
  RATE_LIMIT:                'rate_limit',
  DATABASE_FAILURE:          'database_failure',
  AUTOMATION_FAILURE:        'automation_failure',
  AI_PROVIDER_FAILURE:       'ai_provider_failure',
  FALLBACK_SUCCESS:          'fallback_success',
  SECURITY_EVENT:            'security_event',
  DEPLOY_FAILURE:            'deploy_failure',
  RUNTIME_FAILURE:           'runtime_failure',
  REPEATED_ERRORS:           'repeated_errors',
  CRITICAL_EVENT:            'critical_event',
  CROSS_CLIENT_ACCESS:       'cross_client_access_attempt',
  SECRET_IN_METADATA:        'secret_in_metadata',
});

function baseParams(scenario) {
  return {
    clientId:    'TEST-CLIENT-001',
    projectId:   'test-project',
    environment: ENV.TEST,
    correlationId: `cid-test-${scenario}`,
  };
}

export function runNetworkTimeoutScenario() {
  const rawError = new Error('ETIMEDOUT: Connection timed out after 30000ms');
  rawError.code  = 'ETIMEDOUT';
  const normalized = normalizeError(rawError, { ...baseParams(FAILURE_SCENARIO.NETWORK_TIMEOUT) });
  const event = createObservabilityEvent({
    ...baseParams(FAILURE_SCENARIO.NETWORK_TIMEOUT),
    eventType: EVENT_TYPE.ERROR, severity: SEVERITY.ERROR,
    status: EVENT_STATUS.FAILURE, message: normalized.message,
    errorCategory: normalized.errorCategory, recoverable: normalized.recoverable,
    service: SERVICE.EXTERNAL, component: 'google-calendar',
  });
  return {
    scenario: FAILURE_SCENARIO.NETWORK_TIMEOUT,
    handled: event.valid,
    normalized,
    event: event.event,
    safe: !containsSecret(event.event?.metadata ?? {}),
  };
}

export function runRateLimitScenario() {
  const rawError = new Error('429 Too Many Requests: Airtable rate limit exceeded');
  const normalized = normalizeError(rawError, { ...baseParams(FAILURE_SCENARIO.RATE_LIMIT) });
  const event = createObservabilityEvent({
    ...baseParams(FAILURE_SCENARIO.RATE_LIMIT),
    eventType: EVENT_TYPE.ERROR, severity: SEVERITY.WARNING,
    status: EVENT_STATUS.FAILURE, message: normalized.message,
    errorCategory: ERROR_CATEGORY.RATE_LIMIT, recoverable: true,
    service: SERVICE.EXTERNAL, component: 'airtable',
  });
  return { scenario: FAILURE_SCENARIO.RATE_LIMIT, handled: event.valid, normalized, event: event.event };
}

export function runDatabaseFailureScenario() {
  const rawError = new Error('Supabase: relation "bookings" does not exist');
  const normalized = normalizeError(rawError, { ...baseParams(FAILURE_SCENARIO.DATABASE_FAILURE) });
  const event = createObservabilityEvent({
    ...baseParams(FAILURE_SCENARIO.DATABASE_FAILURE),
    eventType: EVENT_TYPE.ERROR, severity: SEVERITY.CRITICAL,
    status: EVENT_STATUS.FAILURE, message: normalized.message,
    errorCategory: normalized.errorCategory, recoverable: false,
    service: SERVICE.DATABASE, component: 'supabase',
    humanActionRequired: true,
  });
  return { scenario: FAILURE_SCENARIO.DATABASE_FAILURE, handled: event.valid, normalized, event: event.event };
}

export function runAutomationFailureScenario() {
  const event = createObservabilityEvent({
    ...baseParams(FAILURE_SCENARIO.AUTOMATION_FAILURE),
    eventType: EVENT_TYPE.AUTOMATION, severity: SEVERITY.ERROR,
    status: EVENT_STATUS.FAILURE,
    message: 'Make scenario appointment-reminder failed after 3 retries',
    errorCategory: ERROR_CATEGORY.AUTOMATION, recoverable: false,
    service: SERVICE.AUTOMATION, component: 'make-scenario',
    retryCount: 3,
  });
  return { scenario: FAILURE_SCENARIO.AUTOMATION_FAILURE, handled: event.valid, event: event.event };
}

export function runAIProviderFailureScenario() {
  const event = createObservabilityEvent({
    ...baseParams(FAILURE_SCENARIO.AI_PROVIDER_FAILURE),
    eventType: EVENT_TYPE.AI, severity: SEVERITY.ERROR,
    status: EVENT_STATUS.FAILURE,
    message: 'Anthropic API overloaded: 529 error',
    errorCategory: ERROR_CATEGORY.AI_PROVIDER, recoverable: true,
    service: SERVICE.AI, component: 'claude-haiku',
  });
  return { scenario: FAILURE_SCENARIO.AI_PROVIDER_FAILURE, handled: event.valid, event: event.event };
}

export function runFallbackSuccessScenario() {
  const failEvent = createObservabilityEvent({
    ...baseParams(FAILURE_SCENARIO.FALLBACK_SUCCESS),
    eventType: EVENT_TYPE.AI, severity: SEVERITY.WARNING,
    status: EVENT_STATUS.FAILURE, message: 'Primary AI model failed, fallback activated',
    errorCategory: ERROR_CATEGORY.AI_PROVIDER, recoverable: true,
    service: SERVICE.AI, component: 'claude-opus',
  });
  const successEvent = createObservabilityEvent({
    ...baseParams(FAILURE_SCENARIO.FALLBACK_SUCCESS),
    eventType: EVENT_TYPE.AI, severity: SEVERITY.INFO,
    status: EVENT_STATUS.RECOVERED, message: 'Fallback to claude-haiku succeeded',
    service: SERVICE.AI, component: 'claude-haiku', durationMs: 420,
  });
  return {
    scenario: FAILURE_SCENARIO.FALLBACK_SUCCESS,
    handled: failEvent.valid && successEvent.valid,
    recovered: true,
    events: [failEvent.event, successEvent.event].filter(Boolean),
  };
}

export function runSecurityEventScenario() {
  const event = createSecurityEvent({
    ...baseParams(FAILURE_SCENARIO.SECURITY_EVENT),
    securityEventType: SECURITY_EVENT_TYPE.BRUTE_FORCE_ATTEMPT,
    message: 'Brute force login attempt detected',
    userId: 'user-hashed-xyz',
    ipAddress: '10.0.0.xxx',
  });
  return {
    scenario: FAILURE_SCENARIO.SECURITY_EVENT,
    handled: event.valid,
    event: event.event,
    safe: !containsSecret(event.event?.metadata ?? {}),
  };
}

export function runDeployFailureScenario() {
  const event = createObservabilityEvent({
    ...baseParams(FAILURE_SCENARIO.DEPLOY_FAILURE),
    eventType: EVENT_TYPE.DEPLOY, severity: SEVERITY.CRITICAL,
    status: EVENT_STATUS.FAILURE,
    message: 'Production deploy failed: health check did not pass',
    errorCategory: ERROR_CATEGORY.DEPLOY, recoverable: false,
    service: SERVICE.DEPLOY, component: 'cloudflare-pages',
    humanActionRequired: true,
    environment: 'production',
  });
  return { scenario: FAILURE_SCENARIO.DEPLOY_FAILURE, handled: event.valid, event: event.event };
}

export function runRuntimeFailureScenario() {
  const event = createObservabilityEvent({
    ...baseParams(FAILURE_SCENARIO.RUNTIME_FAILURE),
    eventType: EVENT_TYPE.ERROR, severity: SEVERITY.CRITICAL,
    status: EVENT_STATUS.FAILURE,
    message: 'RuntimeError: Cannot read properties of undefined (reading "userId")',
    errorCategory: ERROR_CATEGORY.RUNTIME, recoverable: false,
    service: SERVICE.FRONTEND, component: 'App',
    metadata: { errorType: 'RUNTIME_BLANK_SCREEN' },
    humanActionRequired: false,
  });
  return { scenario: FAILURE_SCENARIO.RUNTIME_FAILURE, handled: event.valid, event: event.event };
}

export function runRepeatedErrorsScenario() {
  const events = [];
  for (let i = 0; i < 6; i++) {
    const r = createObservabilityEvent({
      ...baseParams(FAILURE_SCENARIO.REPEATED_ERRORS),
      eventType: EVENT_TYPE.ERROR, severity: SEVERITY.ERROR,
      status: EVENT_STATUS.FAILURE, message: `Database connection failed (attempt ${i + 1})`,
      errorCategory: ERROR_CATEGORY.DATABASE, service: SERVICE.DATABASE,
      retryCount: i,
    });
    if (r.valid) events.push(r.event);
  }
  return { scenario: FAILURE_SCENARIO.REPEATED_ERRORS, handled: events.length > 0, events, count: events.length };
}

export function runCrossClientAccessScenario() {
  let violation = null;
  try {
    assertClientIsolation('CLIENT-B', 'CLIENT-A');
  } catch (err) {
    violation = { code: err.code, message: err.message };
  }
  return {
    scenario: FAILURE_SCENARIO.CROSS_CLIENT_ACCESS,
    handled: violation !== null,
    blocked: violation !== null,
    violation,
  };
}

export function runSecretInMetadataScenario() {
  const dirtyMetadata = {
    userId: 'user-123',
    Authorization: 'Bearer sk_test_abc123xyz456verylongtoken',
    apiKey: 'real-api-key-value',
    normal: 'this is fine',
  };

  const redacted = redactSensitiveData(dirtyMetadata);

  // Verify the SECRET VALUE is no longer present (keys may remain as labels).
  const redactedStr   = JSON.stringify(redacted);
  const originalSecretValue = 'sk_test_abc123xyz456verylongtoken';
  const secretValueGone = !redactedStr.includes(originalSecretValue);

  const event = createObservabilityEvent({
    ...baseParams(FAILURE_SCENARIO.SECRET_IN_METADATA),
    eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO,
    message: 'Request with sensitive headers',
    metadata: redacted,
  });

  return {
    scenario:        FAILURE_SCENARIO.SECRET_IN_METADATA,
    handled:         event.valid,
    secretRedacted:  secretValueGone,
    redactedMetadata: redacted,
    event:           event.event,
  };
}

/**
 * Run all failure scenarios.
 */
export function runAllFailureScenarios() {
  const results = [
    runNetworkTimeoutScenario(),
    runRateLimitScenario(),
    runDatabaseFailureScenario(),
    runAutomationFailureScenario(),
    runAIProviderFailureScenario(),
    runFallbackSuccessScenario(),
    runSecurityEventScenario(),
    runDeployFailureScenario(),
    runRuntimeFailureScenario(),
    runRepeatedErrorsScenario(),
    runCrossClientAccessScenario(),
    runSecretInMetadataScenario(),
  ];

  const allHandled = results.every(r => r.handled);

  return {
    valid:          true,
    totalScenarios: results.length,
    allHandled,
    results,
    disclaimer:     'All scenarios are fictional. No real errors triggered.',
  };
}

export const FAILURE_SCENARIOS_VERSION = '1.0.0';
