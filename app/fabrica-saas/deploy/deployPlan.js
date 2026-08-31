// Deploy Plan Generator — PASO G
// Generates a structured deploy plan. NEVER includes secret values.

export const DEPLOY_STEP_TYPES = Object.freeze({
  BUILD:        'BUILD',
  VERIFY:       'VERIFY',
  DEPLOY:       'DEPLOY',
  CONFIGURE:    'CONFIGURE',
  HUMAN_ACTION: 'HUMAN_ACTION',
  HEALTH_CHECK: 'HEALTH_CHECK',
  ROLLBACK:     'ROLLBACK',
});

/**
 * Generate a deploy plan for a target + environment.
 * @param {object} target — DeployTarget object
 * @param {object} options — { rollbackPlan, secretNames, humanApprovers }
 */
export function generateDeployPlan(target, options = {}) {
  if (!target || !target.id) return { valid: false, error: 'target required' };
  if (!target.environment)   return { valid: false, error: 'target.environment required' };

  const secretNames = options.secretNames ?? target.secretNamesRequired ?? [];
  const humanApprovers = options.humanApprovers ?? ['AGENCY_OWNER'];
  const isProduction = target.environment === 'PRODUCTION';

  const buildSteps = [
    { type: DEPLOY_STEP_TYPES.VERIFY,  step: 'Confirm all tests pass (npm test / node --test)' },
    { type: DEPLOY_STEP_TYPES.VERIFY,  step: 'Confirm lint passes (0 errors)' },
    { type: DEPLOY_STEP_TYPES.BUILD,   step: `Run build: ${target.buildCommand ?? 'npm run build'}` },
    { type: DEPLOY_STEP_TYPES.VERIFY,  step: `Verify output in: ${target.outputDirectory ?? 'dist'}` },
    { type: DEPLOY_STEP_TYPES.VERIFY,  step: 'Run secret safety gate — must PASS' },
    { type: DEPLOY_STEP_TYPES.VERIFY,  step: 'Run data safety gate — must PASS or HUMAN_REVIEW resolved' },
  ];

  const deploymentSteps = [
    ...(isProduction ? [{ type: DEPLOY_STEP_TYPES.HUMAN_ACTION, step: `Human approval required from: ${humanApprovers.join(', ')}` }] : []),
    { type: DEPLOY_STEP_TYPES.CONFIGURE, step: 'Set all required environment variables (names only — see below)' },
    { type: DEPLOY_STEP_TYPES.DEPLOY, step: `Deploy to ${target.provider} — ${target.environment} environment` },
    { type: DEPLOY_STEP_TYPES.VERIFY, step: 'Verify deployment URL is accessible' },
    { type: DEPLOY_STEP_TYPES.HEALTH_CHECK, step: `Run health check on: ${target.healthEndpoint ?? '/'}` },
  ];

  const verificationSteps = [
    { type: DEPLOY_STEP_TYPES.VERIFY,  step: 'Confirm HTTP 200 on health endpoint' },
    { type: DEPLOY_STEP_TYPES.VERIFY,  step: 'Confirm JS/CSS assets load correctly' },
    { type: DEPLOY_STEP_TYPES.VERIFY,  step: 'Run post-deploy QA checklist' },
    { type: DEPLOY_STEP_TYPES.VERIFY,  step: 'Verify security headers in response' },
    { type: DEPLOY_STEP_TYPES.VERIFY,  step: 'Confirm auth boundaries (login, role gates)' },
    ...(target.pwaRequired ? [{ type: DEPLOY_STEP_TYPES.VERIFY, step: 'Verify PWA manifest loads' }] : []),
  ];

  const rollbackSteps = [
    { type: DEPLOY_STEP_TYPES.ROLLBACK, step: `Strategy: ${target.rollbackStrategy ?? 'PREVIOUS_DEPLOYMENT'}` },
    { type: DEPLOY_STEP_TYPES.ROLLBACK, step: 'Identify previous known-good deployment ID' },
    { type: DEPLOY_STEP_TYPES.ROLLBACK, step: 'Re-deploy previous version via provider dashboard or CLI' },
    { type: DEPLOY_STEP_TYPES.VERIFY,   step: 'Verify rollback successful via health check' },
    { type: DEPLOY_STEP_TYPES.HUMAN_ACTION, step: 'Notify client of rollback and ETA for fix' },
  ];

  const postDeploySteps = [
    { type: DEPLOY_STEP_TYPES.VERIFY,  step: 'Run post-deploy monitoring baseline' },
    { type: DEPLOY_STEP_TYPES.VERIFY,  step: 'Create maintenance handoff record (Paso F)' },
    { type: DEPLOY_STEP_TYPES.HUMAN_ACTION, step: 'Send delivery confirmation to client' },
  ];

  return {
    valid: true,
    planId:    `PLAN-${target.id}-${target.environment}`,
    targetId:  target.id,
    provider:  target.provider,
    environment: target.environment,
    projectName: target.projectName,

    preconditions: [
      'Branch merged to main',
      'Pre-deploy readiness: READY',
      'Secret gate: PASS',
      'Data safety gate: PASS',
      ...(isProduction ? ['Human approval documented'] : []),
    ],

    requiredCredentials: secretNames.map(n => ({ name: n, note: 'Set via environment variable — never hardcoded' })),
    requiredHumanActions: [
      ...(isProduction ? [`Obtain explicit approval from: ${humanApprovers.join(', ')}`] : []),
      'Review deploy plan before proceeding',
      'Confirm rollback plan is ready',
    ],

    buildSteps,
    deploymentSteps,
    verificationSteps,
    rollbackSteps,
    postDeploySteps,

    disclaimer: 'Deploy plan contains no secret values. Credential names are references only.',
  };
}

export const DEPLOY_PLAN_VERSION = '1.0.0';
