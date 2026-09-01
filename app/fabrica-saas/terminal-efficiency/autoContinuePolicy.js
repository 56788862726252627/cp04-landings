// Auto Continue Policy — ADV-05
// Decides which pipeline stages can proceed automatically without pause.

export const STAGE_CONTINUITY = Object.freeze({
  AUTO_CONTINUE: 'AUTO_CONTINUE',
  PAUSE:         'PAUSE',
  BLOCKED:       'BLOCKED',
});

const AUTO_CONTINUE_STAGES = new Set([
  'IMPLEMENTATION', 'TARGETED_TESTS', 'FIX_LINT', 'RE_TEST',
  'LINT', 'BUILD', 'FULL_TESTS', 'COMMIT_PREP',
  'COMMIT', 'PUSH', 'PR_CREATE',
]);

const ALWAYS_PAUSE_STAGES = new Set([
  'OAUTH_SETUP', 'MFA_SETUP', 'SECRET_CREATION', 'BILLING_SETUP',
  'REAL_DEPLOY', 'DNS_CHANGE', 'DESTRUCTIVE_MIGRATION',
]);

export function evaluateContinuity(stage = '', promptAuthorized = true) {
  if (!stage) return { valid: false, error: 'stage required' };

  if (ALWAYS_PAUSE_STAGES.has(stage)) {
    return { valid: true, stage, continuity: STAGE_CONTINUITY.BLOCKED, reason: 'always requires human', isReal: false };
  }

  if (AUTO_CONTINUE_STAGES.has(stage) && promptAuthorized) {
    return { valid: true, stage, continuity: STAGE_CONTINUITY.AUTO_CONTINUE, reason: 'safe + authorized', isReal: false };
  }

  return { valid: true, stage, continuity: STAGE_CONTINUITY.PAUSE, reason: 'not in auto-continue list or prompt not authorized', isReal: false };
}

export function buildAutoContinuePlan(stages = [], promptAuthorized = true) {
  if (!Array.isArray(stages)) return { valid: false, error: 'stages must be array' };
  const evaluated = stages.map(s => evaluateContinuity(s, promptAuthorized));
  const pausePoints = evaluated.filter(e => e.continuity !== STAGE_CONTINUITY.AUTO_CONTINUE).map(e => e.stage);
  return {
    valid:        true,
    stages:       evaluated,
    pausePoints,
    autoContinueCount: evaluated.filter(e => e.continuity === STAGE_CONTINUITY.AUTO_CONTINUE).length,
    pauseCount:   pausePoints.length,
    isReal:       false,
  };
}

export const AUTO_CONTINUE_POLICY_VERSION = '1.0.0';
