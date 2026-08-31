// Deploy Observability — ADV-01 Transversal Observability
// Records deploy lifecycle events. Integrates with Paso G (deploy/).

import { createObservabilityEvent, SEVERITY, EVENT_TYPE, EVENT_STATUS, SERVICE } from './eventModel.js';

export const DEPLOY_RESULT = Object.freeze({
  SUCCESS:            'SUCCESS',
  FAILED:             'FAILED',
  ROLLBACK_TRIGGERED: 'ROLLBACK_TRIGGERED',
  ROLLBACK_SUCCESS:   'ROLLBACK_SUCCESS',
  ROLLBACK_FAILED:    'ROLLBACK_FAILED',
  QA_FAILED:          'QA_FAILED',
  HEALTH_CHECK_FAILED:'HEALTH_CHECK_FAILED',
  BLOCKED:            'BLOCKED',
});

export const DEPLOY_ENVIRONMENT = Object.freeze({
  LOCAL:      'local',
  STAGING:    'staging',
  PRODUCTION: 'production',
});

/**
 * Create a deploy observability event.
 * @param {object} params
 * @param {string} params.releaseId
 * @param {string} params.commitSha
 * @param {string} params.environment      — DEPLOY_ENVIRONMENT
 * @param {string} params.deployStart      — ISO timestamp
 * @param {string} params.deployEnd        — ISO timestamp
 * @param {string} params.result           — DEPLOY_RESULT
 * @param {boolean} params.runtimeCheckOk
 * @param {boolean} params.postDeployQAOk
 * @param {boolean} params.rollbackTriggered
 * @param {string} params.rollbackResult   — DEPLOY_RESULT
 * @param {string} params.error
 * @param {string} params.clientId
 * @param {string} params.projectId
 * @param {string} params.correlationId
 */
export function createDeployEvent(params = {}) {
  if (!params.result || !Object.values(DEPLOY_RESULT).includes(params.result)) {
    return { valid: false, error: `result must be one of: ${Object.values(DEPLOY_RESULT).join(', ')}` };
  }
  if (!params.environment) {
    return { valid: false, error: 'environment required' };
  }

  const failed = params.result === DEPLOY_RESULT.FAILED ||
                 params.result === DEPLOY_RESULT.ROLLBACK_TRIGGERED ||
                 params.result === DEPLOY_RESULT.QA_FAILED ||
                 params.result === DEPLOY_RESULT.HEALTH_CHECK_FAILED;

  const severity = failed
    ? (params.environment === DEPLOY_ENVIRONMENT.PRODUCTION ? SEVERITY.CRITICAL : SEVERITY.ERROR)
    : params.result === DEPLOY_RESULT.ROLLBACK_SUCCESS ? SEVERITY.WARNING
    : SEVERITY.INFO;

  const durationMs = params.deployStart && params.deployEnd
    ? new Date(params.deployEnd).getTime() - new Date(params.deployStart).getTime()
    : null;

  const message = `Deploy ${params.releaseId ?? params.commitSha ?? 'unknown'} to ${params.environment}: ${params.result}`;

  const result = createObservabilityEvent({
    eventType:    EVENT_TYPE.DEPLOY,
    severity,
    status:       failed ? EVENT_STATUS.FAILURE : EVENT_STATUS.SUCCESS,
    message,
    service:      SERVICE.DEPLOY,
    component:    'cloudflare-pages',
    environment:  params.environment,
    correlationId: params.correlationId,
    clientId:     params.clientId,
    projectId:    params.projectId,
    durationMs,
    errorCategory: failed ? 'DEPLOY' : null,
    recoverable:  params.rollbackTriggered === true,
    humanActionRequired: params.result === DEPLOY_RESULT.ROLLBACK_FAILED ||
                          params.result === DEPLOY_RESULT.HEALTH_CHECK_FAILED,
    metadata: {
      releaseId:         params.releaseId         ?? null,
      commitSha:         params.commitSha         ?? null,
      deployStart:       params.deployStart       ?? null,
      deployEnd:         params.deployEnd         ?? null,
      deployResult:      params.result,
      runtimeCheckOk:    params.runtimeCheckOk   ?? null,
      postDeployQAOk:    params.postDeployQAOk   ?? null,
      rollbackTriggered: params.rollbackTriggered ?? false,
      rollbackResult:    params.rollbackResult    ?? null,
      error:             params.error             ?? null,
    },
    source: 'deploy-observability',
  });

  return result;
}

export const DEPLOY_OBSERVABILITY_VERSION = '1.0.0';
