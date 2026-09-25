// Resume Support — ADV-04
// resumeProductionPipeline(): resume after WAITING_HUMAN or BLOCKED.
// Never re-runs stages that already PASS. Never re-generates unnecessarily.

export const RESUME_REASON = Object.freeze({
  HUMAN_ACTION_COMPLETED: 'HUMAN_ACTION_COMPLETED',
  BLOCKER_RESOLVED:       'BLOCKER_RESOLVED',
  RETRY_AFTER_FAILURE:    'RETRY_AFTER_FAILURE',
  EXTERNAL_RESOLVED:      'EXTERNAL_RESOLVED',
});

/**
 * Determine which stage to resume from, given a pipeline state.
 * Finds the first BLOCKED or WAITING_HUMAN or FAIL stage.
 * Skips all PASS stages — they are not re-run.
 */
export function findResumePoint(stagesMap = {}) {
  const ORDER = [
    'BRIEF_VALIDATION', 'ANALYSIS', 'VERTICAL_RESOLUTION', 'CLIENT_CONFIG',
    'BRANDING', 'MODULE_PLAN', 'ROLE_PLAN', 'DATA_MODEL', 'AGENT_PLAN',
    'AUTOMATION_PLAN', 'GENERATION', 'TESTS', 'LINT', 'BUILD',
    'SECURITY', 'SECRET_SCAN', 'RELEASE_READINESS', 'DEPLOY_READINESS',
    'DEPLOY_PLAN', 'DEPLOY_EXECUTION', 'POST_DEPLOY_QA', 'RUNTIME_RENDER_CHECK',
    'HEALTH_CHECK', 'RELEASE_MANIFEST', 'ROLLBACK_READY', 'FINAL_HANDOFF', 'FINAL_URL',
  ];

  const RESUME_STATUSES = new Set(['FAIL', 'BLOCKED', 'WAITING_HUMAN', 'PENDING']);

  for (const stageId of ORDER) {
    const stage = stagesMap[stageId];
    if (stage && RESUME_STATUSES.has(stage.status)) {
      return { found: true, stageId, status: stage.status };
    }
  }

  return { found: false, stageId: null, message: 'All stages complete or no resumable stage found.' };
}

/**
 * Mark a manual action as resolved so pipeline can resume.
 * Returns updated context — pure function, no side effects.
 */
export function resolveManualBlock(context = {}, actionId, reason = '') {
  if (!actionId) return { valid: false, error: 'actionId required' };

  const manualActions = (context.manualActions ?? []).map(a =>
    a.id === actionId ? { ...a, completed: true, completedAt: new Date().toISOString(), resolvedReason: reason } : a
  );

  const stillBlocking = manualActions.some(a => a.blocking && !a.completed);

  return Object.freeze({
    valid:         true,
    context:       { ...context, manualActions },
    resolvedId:    actionId,
    stillBlocking,
    readyToResume: !stillBlocking,
  });
}

/**
 * Build a resume request for a stopped pipeline.
 */
export function buildResumeRequest(pipelineId, reason, completedActionIds = []) {
  if (!pipelineId) return { valid: false, error: 'pipelineId required' };
  if (!Object.values(RESUME_REASON).includes(reason)) {
    return { valid: false, error: `Unknown reason: ${reason}. Valid: ${Object.values(RESUME_REASON).join(', ')}` };
  }

  return Object.freeze({
    valid:               true,
    pipelineId,
    reason,
    completedActionIds,
    requestedAt:         new Date().toISOString(),
    skipCompletedStages: true,
    isReal:              false,
  });
}

export const RESUME_SUPPORT_VERSION = '1.0.0';
