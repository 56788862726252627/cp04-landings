// Deploy Execution Adapter — ADV-04
// ProductionDeployAdapter interface with DRY_RUN and STAGING_SIMULATION.
// Prepare real Cloudflare adapter for future — no real deploy here.

export const ADAPTER_MODE = Object.freeze({
  DRY_RUN:             'DRY_RUN',
  STAGING_SIMULATION:  'STAGING_SIMULATION',
  CLOUDFLARE_REAL:     'CLOUDFLARE_REAL',  // future — not implemented here
});

export const DEPLOY_RESULT_STATUS = Object.freeze({
  SUCCESS:   'SUCCESS',
  FAILED:    'FAILED',
  SKIPPED:   'SKIPPED',
  SIMULATED: 'SIMULATED',
});

/**
 * ProductionDeployAdapter factory.
 * Returns an adapter object with prepare/validate/deploy/verify/rollback methods.
 * All methods are pure and deterministic in DRY_RUN mode.
 */
export function createDeployAdapter(mode = ADAPTER_MODE.DRY_RUN) {
  if (mode === ADAPTER_MODE.CLOUDFLARE_REAL) {
    return {
      valid: false,
      error: 'CLOUDFLARE_REAL adapter is not implemented. Requires human authorization and billing.',
    };
  }

  const isSimulated = true;

  return Object.freeze({
    valid: true,
    mode,
    isSimulated,

    prepare(deployPlan = {}) {
      if (!deployPlan.projectId) return { ok: false, error: 'deployPlan.projectId required' };
      return Object.freeze({
        ok:       true,
        step:     'PREPARE',
        mode,
        message:  `[${mode}] Deploy prepared for ${deployPlan.projectId}`,
        isReal:   false,
      });
    },

    validate(deployPlan = {}) {
      const issues = [];
      if (!deployPlan.buildCommand)     issues.push('buildCommand missing');
      if (!deployPlan.outputDir)        issues.push('outputDir missing');
      if ((deployPlan.secretsRequired ?? []).length > 0) {
        issues.push(`Secrets required (names only): ${deployPlan.secretsRequired.join(', ')}`);
      }
      return Object.freeze({
        ok:       issues.length === 0,
        step:     'VALIDATE',
        mode,
        issues,
        isReal:   false,
      });
    },

    deploy(deployPlan = {}) {
      return Object.freeze({
        ok:         true,
        step:       'DEPLOY',
        mode,
        status:     DEPLOY_RESULT_STATUS.SIMULATED,
        deployId:   `DEPLOY-SIM-${Date.now()}`,
        simulatedUrl: `https://${deployPlan.projectId ?? 'project'}.pages.dev`,
        message:    `[${mode}] Simulated deploy — no real deploy executed`,
        isReal:     false,
      });
    },

    verify(deployResult = {}) {
      return Object.freeze({
        ok:       true,
        step:     'VERIFY',
        mode,
        httpStatus: 200,
        message:  `[${mode}] Simulated verification — URL not real`,
        url:      deployResult.simulatedUrl ?? null,
        isReal:   false,
      });
    },

    rollback(deployResult = {}) {
      return Object.freeze({
        ok:       true,
        step:     'ROLLBACK',
        mode,
        message:  `[${mode}] Simulated rollback from ${deployResult.deployId ?? 'unknown'}`,
        isReal:   false,
      });
    },
  });
}

export const DEPLOY_EXECUTION_ADAPTER_VERSION = '1.0.0';
