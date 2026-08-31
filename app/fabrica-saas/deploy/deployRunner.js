// Deploy Runner — PASO G
// Safe-mode deploy pipeline. DEFAULT: DRY_RUN. PRODUCTION always blocked in Paso G.

import { evaluatePreDeployReadiness, READINESS_OUTCOMES } from './preDeployReadiness.js';
import { generateDeployPlan } from './deployPlan.js';

export const DEPLOY_MODES = Object.freeze({
  DRY_RUN:             'DRY_RUN',
  PREVIEW_ALLOWED:     'PREVIEW_ALLOWED',
  PRODUCTION_BLOCKED:  'PRODUCTION_BLOCKED_BY_DEFAULT',
});

export const PIPELINE_STATUS = Object.freeze({
  DRY_RUN_COMPLETE:    'DRY_RUN_COMPLETE',
  READY:               'READY',
  BLOCKED:             'BLOCKED',
  HUMAN_REVIEW:        'HUMAN_REVIEW',
  PRODUCTION_BLOCKED:  'PRODUCTION_BLOCKED',
});

/**
 * Run the deploy pipeline in safe mode.
 * @param {object} config — { target, readinessChecks, mode, securityResults, qaResults }
 * @returns Pipeline result with deploymentAllowed always false for production in Paso G
 */
export async function runDeployPipeline(config = {}) {
  if (!config.target) return { valid: false, error: 'target required' };

  const mode = config.mode ?? DEPLOY_MODES.DRY_RUN;
  const { target, readinessChecks = {}, securityResults = null, qaResults = null } = config;
  const isProduction = target.environment === 'PRODUCTION';

  // Evaluate readiness
  const readiness = evaluatePreDeployReadiness(readinessChecks, target.environment);

  // Generate plan
  const plan = generateDeployPlan(target, config.planOptions ?? {});

  // Determine human actions required
  const humanActions = [];
  if (readiness.humanReviewIds?.length > 0) {
    humanActions.push(...readiness.humanReviewIds.map(id => `Human review required: ${id}`));
  }
  if (isProduction) {
    humanActions.push('PRODUCTION deployment requires explicit human approval gate');
  }

  // Determine final status
  let pipelineStatus;
  let deploymentAllowed;

  if (mode === DEPLOY_MODES.DRY_RUN) {
    pipelineStatus    = PIPELINE_STATUS.DRY_RUN_COMPLETE;
    deploymentAllowed = false;
  } else if (isProduction || mode === DEPLOY_MODES.PRODUCTION_BLOCKED) {
    pipelineStatus    = PIPELINE_STATUS.PRODUCTION_BLOCKED;
    deploymentAllowed = false;
  } else if (readiness.outcome === READINESS_OUTCOMES.BLOCKED) {
    pipelineStatus    = PIPELINE_STATUS.BLOCKED;
    deploymentAllowed = false;
  } else if (readiness.outcome === READINESS_OUTCOMES.HUMAN_REVIEW) {
    pipelineStatus    = PIPELINE_STATUS.HUMAN_REVIEW;
    deploymentAllowed = false;
  } else {
    pipelineStatus    = PIPELINE_STATUS.READY;
    deploymentAllowed = mode === DEPLOY_MODES.PREVIEW_ALLOWED && !isProduction;
  }

  return {
    valid:            true,
    pipelineStatus,
    mode,
    environment:      target.environment,
    readiness,
    plan:             plan.valid ? plan : null,
    securityResults,
    qaResults,
    humanActions,
    deploymentAllowed,
    rollbackAvailable: !!(config.rollbackPlan),
    nextAction: deploymentAllowed
      ? 'Proceed with deployment per plan'
      : mode === DEPLOY_MODES.DRY_RUN
        ? 'DRY_RUN complete — review plan before executing real deploy'
        : isProduction
          ? 'PRODUCTION_BLOCKED: obtain explicit approval and switch to authorized deploy mode'
          : 'Resolve blocking issues before deployment',
    disclaimer: 'Deploy pipeline in safe mode. No real deployment performed. deploymentAllowed=false for PRODUCTION.',
  };
}

export const DEPLOY_RUNNER_VERSION = '1.0.0';
