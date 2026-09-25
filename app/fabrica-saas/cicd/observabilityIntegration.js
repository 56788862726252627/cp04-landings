// Observability Integration — ADV-02 CI/CD Automatizado
// Integra Mejora 1 (ADV-01). Cada pipeline emite eventos de observabilidad.
// No duplica el logger — usa createObservabilityEvent directamente.

import { createObservabilityEvent, SEVERITY, EVENT_TYPE, EVENT_STATUS, SERVICE, ENV } from '../observability/eventModel.js';

export const CI_EVENT_TYPE = Object.freeze({
  CI_STARTED:        'CI_STARTED',
  JOB_STARTED:       'JOB_STARTED',
  JOB_PASSED:        'JOB_PASSED',
  JOB_FAILED:        'JOB_FAILED',
  PIPELINE_PASSED:   'PIPELINE_PASSED',
  PIPELINE_FAILED:   'PIPELINE_FAILED',
  RELEASE_BLOCKED:   'RELEASE_BLOCKED',
});

function baseParams(pipelineContext) {
  return {
    clientId:      pipelineContext.clientId   ?? 'factory-cicd',
    projectId:     pipelineContext.projectId  ?? 'factory-saas',
    correlationId: pipelineContext.correlationId ?? null,
    environment:   pipelineContext.environment  ?? ENV.CI,
    service:       SERVICE.DEPLOY,
    component:     'ci-pipeline',
  };
}

/**
 * Create a CI observability event.
 * Each CI event maps to an ObservabilityEvent for unified tracking.
 */
export function createCIEvent(ciEventType, pipelineContext = {}, detail = {}) {
  const severityMap = {
    [CI_EVENT_TYPE.CI_STARTED]:      SEVERITY.INFO,
    [CI_EVENT_TYPE.JOB_STARTED]:     SEVERITY.INFO,
    [CI_EVENT_TYPE.JOB_PASSED]:      SEVERITY.INFO,
    [CI_EVENT_TYPE.JOB_FAILED]:      SEVERITY.ERROR,
    [CI_EVENT_TYPE.PIPELINE_PASSED]: SEVERITY.INFO,
    [CI_EVENT_TYPE.PIPELINE_FAILED]: SEVERITY.ERROR,
    [CI_EVENT_TYPE.RELEASE_BLOCKED]: SEVERITY.WARNING,
  };

  const statusMap = {
    [CI_EVENT_TYPE.CI_STARTED]:      EVENT_STATUS.PENDING,
    [CI_EVENT_TYPE.JOB_STARTED]:     EVENT_STATUS.PENDING,
    [CI_EVENT_TYPE.JOB_PASSED]:      EVENT_STATUS.SUCCESS,
    [CI_EVENT_TYPE.JOB_FAILED]:      EVENT_STATUS.FAILURE,
    [CI_EVENT_TYPE.PIPELINE_PASSED]: EVENT_STATUS.SUCCESS,
    [CI_EVENT_TYPE.PIPELINE_FAILED]: EVENT_STATUS.FAILURE,
    [CI_EVENT_TYPE.RELEASE_BLOCKED]: EVENT_STATUS.FAILURE,
  };

  const result = createObservabilityEvent({
    ...baseParams(pipelineContext),
    eventType:   EVENT_TYPE.DEPLOY,
    severity:    severityMap[ciEventType] ?? SEVERITY.INFO,
    status:      statusMap[ciEventType]   ?? EVENT_STATUS.PENDING,
    message:     detail.message ?? `CI: ${ciEventType}`,
    metadata: {
      ciEventType,
      pipelineId:  pipelineContext.pipelineId  ?? null,
      commitSha:   pipelineContext.commitSha    ?? null,
      branch:      pipelineContext.branch       ?? null,
      jobId:       detail.jobId                 ?? null,
      duration:    detail.durationMs            ?? null,
      failureCat:  detail.failureCategory       ?? null,
    },
    durationMs:          detail.durationMs ?? null,
    humanActionRequired: ciEventType === CI_EVENT_TYPE.RELEASE_BLOCKED || ciEventType === CI_EVENT_TYPE.PIPELINE_FAILED,
  });

  return result;
}

/**
 * Emit events for a completed job result.
 */
export function emitJobEvents(jobResult, pipelineContext = {}) {
  const events = [];
  const passed = jobResult.status === 'PASSED';

  const type = passed ? CI_EVENT_TYPE.JOB_PASSED : CI_EVENT_TYPE.JOB_FAILED;
  const ev = createCIEvent(type, pipelineContext, {
    jobId:           jobResult.jobId,
    message:         `Job ${jobResult.name}: ${jobResult.status}`,
    durationMs:      jobResult.durationMs ?? null,
    failureCategory: jobResult.failureCategory ?? null,
  });
  if (ev.valid) events.push(ev.event);

  return events;
}

/**
 * Emit pipeline-level summary event.
 */
export function emitPipelineEvent(pipelineStatus, pipelineContext = {}) {
  const type = pipelineStatus === 'PASSED'
    ? CI_EVENT_TYPE.PIPELINE_PASSED
    : CI_EVENT_TYPE.PIPELINE_FAILED;

  return createCIEvent(type, pipelineContext, {
    message: `Pipeline ${pipelineContext.pipelineId ?? 'unknown'}: ${pipelineStatus}`,
  });
}

export const OBSERVABILITY_INTEGRATION_VERSION = '1.0.0';
