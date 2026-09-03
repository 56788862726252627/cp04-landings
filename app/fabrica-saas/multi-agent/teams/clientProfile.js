// Multi-Agent Client Profile — ADV-17

export function createMultiAgentClientProfile(config = {}) {
  const {
    clientId          = 'unknown',
    allowedAgents     = null,   // null = use defaults
    allowedTeams      = null,
    autonomyLevel     = 'SAFE_AUTO',
    toolPolicy        = 'DEFAULT',
    budgetPolicy      = null,
    approvalPolicy    = null,
    businessTruthProfile = null,
    privacyPolicy     = null,
  } = config;

  return Object.freeze({
    clientId,
    allowedAgents:       allowedAgents   ? Object.freeze([...allowedAgents])   : null,
    allowedTeams:        allowedTeams    ? Object.freeze([...allowedTeams])    : null,
    autonomyLevel,
    toolPolicy,
    budgetPolicy,
    approvalPolicy,
    businessTruthProfile,
    privacyPolicy,
    clientIsolated:      true,  // always true
    isReal:              false,
  });
}

export const CLIENT_PROFILE_VERSION = '1.0.0';
