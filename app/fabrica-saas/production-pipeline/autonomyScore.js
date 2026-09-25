// Autonomy Score — ADV-04
// calculateProductionAutonomyScore(): 0-100 score for how automated a project is.

export const AUTONOMY_FACTOR = Object.freeze({
  AUTO_STAGES:       'AUTO_STAGES',
  MANUAL_ACTIONS:    'MANUAL_ACTIONS',
  EXTERNAL_AUTH:     'EXTERNAL_AUTH',
  DEPLOY_AUTO:       'DEPLOY_AUTO',
  QA_AUTO:           'QA_AUTO',
  SECURITY_AUTO:     'SECURITY_AUTO',
  ROLLBACK_AUTO:     'ROLLBACK_AUTO',
  HANDOFF_AUTO:      'HANDOFF_AUTO',
});

const FACTOR_WEIGHT = Object.freeze({
  [AUTONOMY_FACTOR.AUTO_STAGES]:    20,
  [AUTONOMY_FACTOR.MANUAL_ACTIONS]: 20,
  [AUTONOMY_FACTOR.EXTERNAL_AUTH]:  15,
  [AUTONOMY_FACTOR.DEPLOY_AUTO]:    15,
  [AUTONOMY_FACTOR.QA_AUTO]:        10,
  [AUTONOMY_FACTOR.SECURITY_AUTO]:  10,
  [AUTONOMY_FACTOR.ROLLBACK_AUTO]:   5,
  [AUTONOMY_FACTOR.HANDOFF_AUTO]:    5,
});

/**
 * Calculate autonomy score for a production pipeline run.
 *
 * input: {
 *   totalStages          number
 *   automaticStages      number
 *   manualActions        number   — count of manual actions required
 *   externalAuthCount    number   — OAuth/API keys needing human
 *   deployIsAuto         boolean
 *   qaIsAuto             boolean
 *   securityIsAuto       boolean
 *   rollbackIsAuto       boolean
 *   handoffIsAuto        boolean
 * }
 */
export function calculateProductionAutonomyScore(input = {}) {
  const {
    totalStages       = 27,
    automaticStages   = 0,
    manualActions     = 0,
    externalAuthCount = 0,
    deployIsAuto      = false,
    qaIsAuto          = false,
    securityIsAuto    = false,
    rollbackIsAuto    = false,
    handoffIsAuto     = false,
  } = input;

  const autoStageRatio   = totalStages > 0 ? automaticStages / totalStages : 0;
  const manualPenalty    = Math.min(1, manualActions / 5);
  const authPenalty      = Math.min(1, externalAuthCount / 3);

  const scores = {
    [AUTONOMY_FACTOR.AUTO_STAGES]:    Math.round(autoStageRatio * FACTOR_WEIGHT[AUTONOMY_FACTOR.AUTO_STAGES]),
    [AUTONOMY_FACTOR.MANUAL_ACTIONS]: Math.round((1 - manualPenalty) * FACTOR_WEIGHT[AUTONOMY_FACTOR.MANUAL_ACTIONS]),
    [AUTONOMY_FACTOR.EXTERNAL_AUTH]:  Math.round((1 - authPenalty)   * FACTOR_WEIGHT[AUTONOMY_FACTOR.EXTERNAL_AUTH]),
    [AUTONOMY_FACTOR.DEPLOY_AUTO]:    deployIsAuto   ? FACTOR_WEIGHT[AUTONOMY_FACTOR.DEPLOY_AUTO]    : 0,
    [AUTONOMY_FACTOR.QA_AUTO]:        qaIsAuto       ? FACTOR_WEIGHT[AUTONOMY_FACTOR.QA_AUTO]        : 0,
    [AUTONOMY_FACTOR.SECURITY_AUTO]:  securityIsAuto ? FACTOR_WEIGHT[AUTONOMY_FACTOR.SECURITY_AUTO]  : 0,
    [AUTONOMY_FACTOR.ROLLBACK_AUTO]:  rollbackIsAuto ? FACTOR_WEIGHT[AUTONOMY_FACTOR.ROLLBACK_AUTO]  : 0,
    [AUTONOMY_FACTOR.HANDOFF_AUTO]:   handoffIsAuto  ? FACTOR_WEIGHT[AUTONOMY_FACTOR.HANDOFF_AUTO]   : 0,
  };

  const totalScore = Object.values(scores).reduce((s, v) => s + v, 0);
  const clamped    = Math.min(100, Math.max(0, totalScore));

  const grade = clamped >= 80 ? 'A' : clamped >= 60 ? 'B' : clamped >= 40 ? 'C' : clamped >= 20 ? 'D' : 'F';

  return Object.freeze({
    valid:         true,
    totalScore:    clamped,
    grade,
    scores,
    manualStepsCurrent: manualActions,
    factors: Object.fromEntries(
      Object.entries(FACTOR_WEIGHT).map(([k, w]) => [k, { weight: w, earned: scores[k] }])
    ),
    isReal: false,
  });
}

export const AUTONOMY_SCORE_VERSION = '1.0.0';
