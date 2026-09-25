// One Prompt Production Result — ADV-04
// Final output object for a completed (or stopped) production pipeline run.

export const RESULT_STATUS = Object.freeze({
  COMPLETED:      'COMPLETED',
  BLOCKED:        'BLOCKED',
  WAITING_HUMAN:  'WAITING_HUMAN',
  FAILED:         'FAILED',
  SIMULATED:      'SIMULATED',
});

/**
 * Build the OnePromptProductionResult.
 * This is the canonical output of runOnePromptToProduction().
 */
export function buildProductionResult(params = {}) {
  if (!params.projectId) return { valid: false, error: 'projectId required' };
  if (!params.status)    return { valid: false, error: 'status required' };

  const status = params.status;
  if (!Object.values(RESULT_STATUS).includes(status)) {
    return { valid: false, error: `Unknown status: ${status}` };
  }

  return Object.freeze({
    valid:           true,
    projectId:       params.projectId,
    status,
    project:         params.project         ?? null,
    release:         params.release         ?? null,
    url:             params.url             ?? null,
    completedStages: params.completedStages ?? [],
    blockedStages:   params.blockedStages   ?? [],
    manualActions:   params.manualActions   ?? [],
    warnings:        params.warnings        ?? [],
    health:          params.health          ?? { status: 'UNKNOWN' },
    rollback:        params.rollback        ?? null,
    handoff:         params.handoff         ?? null,
    autonomyScore:   params.autonomyScore   ?? null,
    duration:        params.duration        ?? null,
    startedAt:       params.startedAt       ?? null,
    completedAt:     params.completedAt     ?? null,
    environment:     params.environment     ?? 'DRY_RUN',
    isReal:          false,
    disclaimer:      status === RESULT_STATUS.SIMULATED
      ? 'DRY_RUN — no real deploy, no real client data, no real cost.'
      : null,
  });
}

export const ONE_PROMPT_PRODUCTION_RESULT_VERSION = '1.0.0';
