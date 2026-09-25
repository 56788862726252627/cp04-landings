// Agent Autonomy Level — ADV-17
// Controls how much the system can act without human approval.
// Default: SAFE_AUTO. FULL_UNLIMITED is not available.

export const AGENT_AUTONOMY_LEVEL = Object.freeze({
  ASSIST_ONLY:      'ASSIST_ONLY',    // suggest only, no action
  PLAN_AND_SUGGEST: 'PLAN_AND_SUGGEST', // plan + present for approval
  SAFE_AUTO:        'SAFE_AUTO',      // auto for low-risk, human for high-risk
  BOUNDED_AUTO:     'BOUNDED_AUTO',   // auto within explicit scope
  HUMAN_CONTROLLED: 'HUMAN_CONTROLLED', // all actions human-approved
});

export const DEFAULT_AUTONOMY_LEVEL = AGENT_AUTONOMY_LEVEL.SAFE_AUTO;

const LEVEL_ORDER = {
  HUMAN_CONTROLLED: 0,
  ASSIST_ONLY:      1,
  PLAN_AND_SUGGEST: 2,
  SAFE_AUTO:        3,
  BOUNDED_AUTO:     4,
};

export function isHigherAutonomy(a, b) {
  return (LEVEL_ORDER[a] ?? 0) > (LEVEL_ORDER[b] ?? 0);
}

export function createAutonomyPolicy(level = DEFAULT_AUTONOMY_LEVEL) {
  const requiresHumanForHighRisk = level === AGENT_AUTONOMY_LEVEL.HUMAN_CONTROLLED
    || level === AGENT_AUTONOMY_LEVEL.ASSIST_ONLY
    || level === AGENT_AUTONOMY_LEVEL.PLAN_AND_SUGGEST
    || level === AGENT_AUTONOMY_LEVEL.SAFE_AUTO;

  return Object.freeze({
    level,
    requiresHumanForHighRisk,
    allowSelfExpansion: false, // always false — agents cannot self-expand permissions
    isReal: false,
  });
}

export const AGENT_AUTONOMY_LEVEL_VERSION = '1.0.0';
