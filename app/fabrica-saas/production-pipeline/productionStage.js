// Production Stage Model — ADV-04
// Each stage in the production pipeline.

export const STAGE_TYPE = Object.freeze({
  ANALYSIS:     'ANALYSIS',
  CONFIGURATION:'CONFIGURATION',
  GENERATION:   'GENERATION',
  QA:           'QA',
  SECURITY:     'SECURITY',
  BUILD:        'BUILD',
  RELEASE:      'RELEASE',
  DEPLOY:       'DEPLOY',
  POST_DEPLOY:  'POST_DEPLOY',
  HANDOFF:      'HANDOFF',
});

export const STAGE_STATUS = Object.freeze({
  PENDING:        'PENDING',
  RUNNING:        'RUNNING',
  PASS:           'PASS',
  FAIL:           'FAIL',
  SKIPPED:        'SKIPPED',
  WAITING_HUMAN:  'WAITING_HUMAN',
  BLOCKED:        'BLOCKED',
});

const STAGE_DEFINITIONS = Object.freeze({
  BRIEF_VALIDATION:     { type: STAGE_TYPE.ANALYSIS,      blocking: true,  dependsOn: [] },
  ANALYSIS:             { type: STAGE_TYPE.ANALYSIS,      blocking: true,  dependsOn: ['BRIEF_VALIDATION'] },
  VERTICAL_RESOLUTION:  { type: STAGE_TYPE.ANALYSIS,      blocking: true,  dependsOn: ['ANALYSIS'] },
  CLIENT_CONFIG:        { type: STAGE_TYPE.CONFIGURATION, blocking: true,  dependsOn: ['VERTICAL_RESOLUTION'] },
  BRANDING:             { type: STAGE_TYPE.CONFIGURATION, blocking: false, dependsOn: ['CLIENT_CONFIG'] },
  MODULE_PLAN:          { type: STAGE_TYPE.CONFIGURATION, blocking: true,  dependsOn: ['CLIENT_CONFIG'] },
  ROLE_PLAN:            { type: STAGE_TYPE.CONFIGURATION, blocking: true,  dependsOn: ['CLIENT_CONFIG'] },
  DATA_MODEL:           { type: STAGE_TYPE.CONFIGURATION, blocking: true,  dependsOn: ['MODULE_PLAN', 'ROLE_PLAN'] },
  AGENT_PLAN:           { type: STAGE_TYPE.CONFIGURATION, blocking: false, dependsOn: ['CLIENT_CONFIG'] },
  AUTOMATION_PLAN:      { type: STAGE_TYPE.CONFIGURATION, blocking: false, dependsOn: ['MODULE_PLAN'] },
  GENERATION:           { type: STAGE_TYPE.GENERATION,    blocking: true,  dependsOn: ['MODULE_PLAN', 'ROLE_PLAN', 'DATA_MODEL'] },
  TESTS:                { type: STAGE_TYPE.QA,            blocking: true,  dependsOn: ['GENERATION'] },
  LINT:                 { type: STAGE_TYPE.QA,            blocking: true,  dependsOn: ['GENERATION'] },
  BUILD:                { type: STAGE_TYPE.BUILD,         blocking: true,  dependsOn: ['TESTS', 'LINT'] },
  SECURITY:             { type: STAGE_TYPE.SECURITY,      blocking: true,  dependsOn: ['BUILD'] },
  SECRET_SCAN:          { type: STAGE_TYPE.SECURITY,      blocking: true,  dependsOn: ['GENERATION'] },
  RELEASE_READINESS:    { type: STAGE_TYPE.RELEASE,       blocking: true,  dependsOn: ['TESTS', 'LINT', 'BUILD', 'SECURITY', 'SECRET_SCAN'] },
  DEPLOY_READINESS:     { type: STAGE_TYPE.RELEASE,       blocking: true,  dependsOn: ['RELEASE_READINESS'] },
  DEPLOY_PLAN:          { type: STAGE_TYPE.DEPLOY,        blocking: true,  dependsOn: ['DEPLOY_READINESS'] },
  DEPLOY_EXECUTION:     { type: STAGE_TYPE.DEPLOY,        blocking: true,  dependsOn: ['DEPLOY_PLAN'] },
  POST_DEPLOY_QA:       { type: STAGE_TYPE.POST_DEPLOY,   blocking: true,  dependsOn: ['DEPLOY_EXECUTION'] },
  RUNTIME_RENDER_CHECK: { type: STAGE_TYPE.POST_DEPLOY,   blocking: true,  dependsOn: ['DEPLOY_EXECUTION'] },
  HEALTH_CHECK:         { type: STAGE_TYPE.POST_DEPLOY,   blocking: true,  dependsOn: ['DEPLOY_EXECUTION'] },
  RELEASE_MANIFEST:     { type: STAGE_TYPE.RELEASE,       blocking: false, dependsOn: ['POST_DEPLOY_QA', 'HEALTH_CHECK'] },
  ROLLBACK_READY:       { type: STAGE_TYPE.DEPLOY,        blocking: true,  dependsOn: ['DEPLOY_EXECUTION'] },
  FINAL_HANDOFF:        { type: STAGE_TYPE.HANDOFF,       blocking: false, dependsOn: ['RELEASE_MANIFEST'] },
  FINAL_URL:            { type: STAGE_TYPE.HANDOFF,       blocking: false, dependsOn: ['FINAL_HANDOFF'] },
});

export function createStage(stageId, overrides = {}) {
  const def = STAGE_DEFINITIONS[stageId];
  if (!def) return { valid: false, error: `Unknown stage: ${stageId}` };

  return Object.freeze({
    valid:               true,
    id:                  stageId,
    name:                stageId.replace(/_/g, ' ').toLowerCase(),
    type:                def.type,
    status:              STAGE_STATUS.PENDING,
    blocking:            def.blocking,
    dependsOn:           [...def.dependsOn],
    inputs:              overrides.inputs  ?? {},
    outputs:             overrides.outputs ?? {},
    startedAt:           null,
    completedAt:         null,
    failureReason:       null,
    humanActionRequired: false,
    ...overrides,
  });
}

export function createAllStages() {
  return Object.fromEntries(
    Object.keys(STAGE_DEFINITIONS).map(id => [id, createStage(id)])
  );
}

export function canStageRun(stageId, stagesMap) {
  const stage = stagesMap[stageId];
  if (!stage || !stage.valid) return { canRun: false, reason: 'Stage not found or invalid' };
  if (stage.status !== STAGE_STATUS.PENDING) return { canRun: false, reason: `Stage is ${stage.status}` };

  const blockedDep = stage.dependsOn.find(depId => {
    const dep = stagesMap[depId];
    return !dep || dep.status !== STAGE_STATUS.PASS;
  });

  if (blockedDep) return { canRun: false, reason: `Dependency not passed: ${blockedDep}` };
  return { canRun: true };
}

export const PRODUCTION_STAGE_VERSION = '1.0.0';
