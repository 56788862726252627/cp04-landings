// Automation Observability — ADV-01 Transversal Observability
// Make/scenario-specific event fields. No real Make calls.
// Compatible with core/makeManifest.js.

import { createObservabilityEvent, SEVERITY, EVENT_TYPE, EVENT_STATUS, SERVICE } from './eventModel.js';

export const AUTOMATION_EVENT_TYPE = Object.freeze({
  SCENARIO_STARTED:    'SCENARIO_STARTED',
  SCENARIO_COMPLETED:  'SCENARIO_COMPLETED',
  SCENARIO_FAILED:     'SCENARIO_FAILED',
  SCENARIO_RETRIED:    'SCENARIO_RETRIED',
  WEBHOOK_RECEIVED:    'WEBHOOK_RECEIVED',
  WEBHOOK_FAILED:      'WEBHOOK_FAILED',
  TRIGGER_FIRED:       'TRIGGER_FIRED',
  OPERATION_COMPLETED: 'OPERATION_COMPLETED',
  HUMAN_FALLBACK:      'HUMAN_FALLBACK',
  ERROR_HANDLER_FIRED: 'ERROR_HANDLER_FIRED',
});

export const SCENARIO_STATUS = Object.freeze({
  SUCCESS:   'SUCCESS',
  FAILED:    'FAILED',
  PARTIAL:   'PARTIAL',
  SKIPPED:   'SKIPPED',
  RETRYING:  'RETRYING',
  BLOCKED:   'BLOCKED',
});

/**
 * Create an automation observability event for a Make scenario execution.
 * @param {object} params
 * @param {string} params.scenarioId
 * @param {string} params.scenarioName
 * @param {string} params.executionId
 * @param {string} params.trigger        — what triggered this scenario
 * @param {string} params.status         — SCENARIO_STATUS value
 * @param {number} params.durationMs
 * @param {number} params.operations     — number of operations executed
 * @param {string} params.error          — error message if failed
 * @param {number} params.retryCount
 * @param {boolean} params.errorHandlerFired
 * @param {boolean} params.humanFallback — true if human intervention requested
 * @param {string} params.correlationId
 * @param {string} params.clientId
 * @param {string} params.projectId
 */
export function createAutomationEvent(params = {}) {
  if (!params.scenarioId && !params.scenarioName) {
    return { valid: false, error: 'scenarioId or scenarioName required' };
  }

  const failed = params.status === SCENARIO_STATUS.FAILED || !!params.error;
  const severity = failed
    ? (params.retryCount >= 3 ? SEVERITY.CRITICAL : SEVERITY.ERROR)
    : params.status === SCENARIO_STATUS.PARTIAL ? SEVERITY.WARNING
    : SEVERITY.INFO;

  const message = failed
    ? `Automation scenario ${params.scenarioName ?? params.scenarioId} FAILED: ${params.error ?? 'unknown error'}`
    : `Automation scenario ${params.scenarioName ?? params.scenarioId} completed with status ${params.status}`;

  const result = createObservabilityEvent({
    eventType:    EVENT_TYPE.AUTOMATION,
    severity,
    status:       failed ? EVENT_STATUS.FAILURE : EVENT_STATUS.SUCCESS,
    message,
    service:      SERVICE.AUTOMATION,
    component:    'make-scenario',
    module:       params.scenarioName ?? params.scenarioId,
    correlationId: params.correlationId,
    clientId:     params.clientId,
    projectId:    params.projectId,
    durationMs:   params.durationMs ?? null,
    retryCount:   params.retryCount ?? 0,
    recoverable:  (params.retryCount ?? 0) < 3,
    humanActionRequired: params.humanFallback ?? false,
    metadata: {
      scenarioId:         params.scenarioId ?? null,
      scenarioName:       params.scenarioName ?? null,
      executionId:        params.executionId ?? null,
      trigger:            params.trigger ?? null,
      scenarioStatus:     params.status ?? null,
      operations:         params.operations ?? null,
      errorHandlerFired:  params.errorHandlerFired ?? false,
      humanFallback:      params.humanFallback ?? false,
    },
    source: 'automation-observability',
  });

  return result;
}

/**
 * Create a webhook observability event.
 */
export function createWebhookEvent(params = {}) {
  if (!params.webhookId && !params.source) {
    return { valid: false, error: 'webhookId or source required' };
  }

  const failed = params.failed ?? false;

  return createObservabilityEvent({
    eventType:    EVENT_TYPE.AUTOMATION,
    severity:     failed ? SEVERITY.ERROR : SEVERITY.INFO,
    status:       failed ? EVENT_STATUS.FAILURE : EVENT_STATUS.SUCCESS,
    message:      `Webhook ${params.webhookId ?? params.source} ${failed ? 'FAILED' : 'received'}`,
    service:      SERVICE.AUTOMATION,
    component:    'webhook',
    module:       params.webhookId ?? params.source,
    correlationId: params.correlationId,
    clientId:     params.clientId,
    projectId:    params.projectId,
    durationMs:   params.durationMs ?? null,
    errorCategory: failed ? 'AUTOMATION' : null,
    recoverable:   true,
    metadata: {
      webhookId:   params.webhookId ?? null,
      source:      params.source ?? null,
      httpStatus:  params.httpStatus ?? null,
      payloadSize: params.payloadSize ?? null,
    },
    source: 'automation-observability',
  });
}

export const AUTOMATION_OBSERVABILITY_VERSION = '1.0.0';
