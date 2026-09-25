// Browser Release Policy — ADV-06
// Defines release gate policy based on browser QA score and phase results.

export const RELEASE_VERDICT = Object.freeze({
  APPROVED:       'APPROVED',
  APPROVED_WARN:  'APPROVED_WARN',
  NEEDS_REVIEW:   'NEEDS_REVIEW',
  BLOCKED:        'BLOCKED',
});

export const RELEASE_CHANNEL = Object.freeze({
  INTERNAL:   'INTERNAL',
  STAGING:    'STAGING',
  BETA:       'BETA',
  PRODUCTION: 'PRODUCTION',
});

const CHANNEL_MIN_SCORE = {
  [RELEASE_CHANNEL.INTERNAL]:   0,
  [RELEASE_CHANNEL.STAGING]:    50,
  [RELEASE_CHANNEL.BETA]:       70,
  [RELEASE_CHANNEL.PRODUCTION]: 85,
};

const BLOCKING_PHASES = ['RENDER', 'CONSOLE', 'NETWORK', 'CONTROLS'];

export function createReleasePolicyConfig(overrides = {}) {
  return Object.freeze({
    minScoreInternal:   overrides.minScoreInternal   ?? CHANNEL_MIN_SCORE[RELEASE_CHANNEL.INTERNAL],
    minScoreStaging:    overrides.minScoreStaging    ?? CHANNEL_MIN_SCORE[RELEASE_CHANNEL.STAGING],
    minScoreBeta:       overrides.minScoreBeta       ?? CHANNEL_MIN_SCORE[RELEASE_CHANNEL.BETA],
    minScoreProduction: overrides.minScoreProduction ?? CHANNEL_MIN_SCORE[RELEASE_CHANNEL.PRODUCTION],
    blockingPhases:     overrides.blockingPhases     ?? BLOCKING_PHASES,
    requireHumanForProduction: true,
    isReal: false,
  });
}

export function evaluateReleasePolicy(qaReport = {}, channel = RELEASE_CHANNEL.STAGING, policy = {}) {
  if (!qaReport.valid) return { valid: false, error: 'invalid QA report' };
  if (!RELEASE_CHANNEL[channel]) return { valid: false, error: `unknown channel: ${channel}` };

  const p = { ...createReleasePolicyConfig(), ...policy };
  const minScore = CHANNEL_MIN_SCORE[channel] ?? 50;
  const score    = qaReport.score ?? 0;

  const blockingFailed = (qaReport.failedPhases ?? [])
    .filter(phase => (p.blockingPhases ?? BLOCKING_PHASES).includes(phase));

  let verdict;
  if (blockingFailed.length > 0)            verdict = RELEASE_VERDICT.BLOCKED;
  else if (score < minScore)                verdict = RELEASE_VERDICT.BLOCKED;
  else if ((qaReport.warnPhases ?? []).length > 2) verdict = RELEASE_VERDICT.NEEDS_REVIEW;
  else if ((qaReport.warnPhases ?? []).length > 0) verdict = RELEASE_VERDICT.APPROVED_WARN;
  else                                      verdict = RELEASE_VERDICT.APPROVED;

  const requiresHuman = channel === RELEASE_CHANNEL.PRODUCTION
    || verdict === RELEASE_VERDICT.BLOCKED
    || verdict === RELEASE_VERDICT.NEEDS_REVIEW;

  return Object.freeze({
    valid:          true,
    channel,
    verdict,
    score,
    minScore,
    meetsScoreGate: score >= minScore,
    blockingFailed,
    requiresHuman,
    canRelease:     verdict === RELEASE_VERDICT.APPROVED || verdict === RELEASE_VERDICT.APPROVED_WARN,
    isReal:         false,
  });
}

export function formatReleaseDecision(decision = {}) {
  if (!decision.valid) return 'Release decision: ERROR';
  const icon = { APPROVED: '✅', APPROVED_WARN: '⚠️', NEEDS_REVIEW: '🔶', BLOCKED: '❌' };
  return `Release [${decision.channel}]: ${icon[decision.verdict] ?? '?'} ${decision.verdict} `
    + `(Score: ${decision.score}/${decision.minScore} min)`;
}

export const BROWSER_RELEASE_POLICY_VERSION = '1.0.0';
