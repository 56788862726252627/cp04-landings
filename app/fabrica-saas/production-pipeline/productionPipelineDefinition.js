// Production Pipeline Definition — ADV-04
// Model for the full One Prompt → Production pipeline.

export const PIPELINE_STATUS = Object.freeze({
  DRAFT:          'DRAFT',
  READY:          'READY',
  RUNNING:        'RUNNING',
  BLOCKED:        'BLOCKED',
  WAITING_HUMAN:  'WAITING_HUMAN',
  FAILED:         'FAILED',
  COMPLETED:      'COMPLETED',
  ROLLED_BACK:    'ROLLED_BACK',
});

export const PIPELINE_ENVIRONMENT = Object.freeze({
  PREVIEW:  'PREVIEW',
  STAGING:  'STAGING',
  PRODUCTION: 'PRODUCTION',
  DRY_RUN:  'DRY_RUN',
});

export const PIPELINE_STAGE_IDS = Object.freeze([
  'BRIEF_VALIDATION',
  'ANALYSIS',
  'VERTICAL_RESOLUTION',
  'CLIENT_CONFIG',
  'BRANDING',
  'MODULE_PLAN',
  'ROLE_PLAN',
  'DATA_MODEL',
  'AGENT_PLAN',
  'AUTOMATION_PLAN',
  'GENERATION',
  'TESTS',
  'LINT',
  'BUILD',
  'SECURITY',
  'SECRET_SCAN',
  'RELEASE_READINESS',
  'DEPLOY_READINESS',
  'DEPLOY_PLAN',
  'DEPLOY_EXECUTION',
  'POST_DEPLOY_QA',
  'RUNTIME_RENDER_CHECK',
  'HEALTH_CHECK',
  'RELEASE_MANIFEST',
  'ROLLBACK_READY',
  'FINAL_HANDOFF',
  'FINAL_URL',
]);

export const PIPELINE_MANUAL_GATES = Object.freeze([
  'OAUTH',
  'API_KEY',
  'BILLING',
  'DOMAIN',
  'LEGAL_APPROVAL',
  'PRODUCTION_APPROVE',
]);

/**
 * Create a new ProductionPipelineDefinition.
 * Never includes secret values. isReal always false.
 */
export function createProductionPipeline(params = {}) {
  if (!params.projectId)  return { valid: false, error: 'projectId required' };
  if (!params.vertical)   return { valid: false, error: 'vertical required' };
  if (!params.clientId)   return { valid: false, error: 'clientId required' };

  const environment = params.environment ?? PIPELINE_ENVIRONMENT.DRY_RUN;

  return Object.freeze({
    valid:        true,
    id:           `PIPELINE-${params.projectId}-${Date.now()}`,
    version:      '1.0.0',
    projectId:    params.projectId,
    clientId:     params.clientId,
    vertical:     params.vertical,
    environment,
    status:       PIPELINE_STATUS.DRAFT,
    stages:       [...PIPELINE_STAGE_IDS],
    requiredInputs: params.requiredInputs ?? ['brief'],
    artifacts:    [],
    requiredGates: PIPELINE_MANUAL_GATES,
    manualGates:  [],
    externalDependencies: params.externalDependencies ?? [],
    rollbackPlan: null,
    finalUrl:     null,
    startedAt:    null,
    completedAt:  null,
    isReal:       false,
    disclaimer:   'DRY_RUN — no real deploy, no real client data.',
  });
}

/**
 * Transition pipeline to a new status.
 * Validates allowed transitions.
 */
export function transitionPipelineStatus(pipeline, newStatus, reason = '') {
  const ALLOWED = {
    [PIPELINE_STATUS.DRAFT]:         [PIPELINE_STATUS.READY, PIPELINE_STATUS.BLOCKED],
    [PIPELINE_STATUS.READY]:         [PIPELINE_STATUS.RUNNING, PIPELINE_STATUS.BLOCKED],
    [PIPELINE_STATUS.RUNNING]:       [PIPELINE_STATUS.WAITING_HUMAN, PIPELINE_STATUS.BLOCKED, PIPELINE_STATUS.FAILED, PIPELINE_STATUS.COMPLETED],
    [PIPELINE_STATUS.WAITING_HUMAN]: [PIPELINE_STATUS.RUNNING, PIPELINE_STATUS.FAILED, PIPELINE_STATUS.BLOCKED],
    [PIPELINE_STATUS.BLOCKED]:       [PIPELINE_STATUS.RUNNING, PIPELINE_STATUS.FAILED],
    [PIPELINE_STATUS.FAILED]:        [PIPELINE_STATUS.ROLLED_BACK],
    [PIPELINE_STATUS.COMPLETED]:     [],
    [PIPELINE_STATUS.ROLLED_BACK]:   [],
  };

  const allowed = ALLOWED[pipeline.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${pipeline.status} → ${newStatus}. Allowed: ${allowed.join(', ')}`,
    };
  }

  return { valid: true, previousStatus: pipeline.status, newStatus, reason };
}

export const PRODUCTION_PIPELINE_DEFINITION_VERSION = '1.0.0';
