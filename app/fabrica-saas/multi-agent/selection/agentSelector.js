// Agent Selector — ADV-17
// Selects best specialist for a task based on multiple factors.

export function selectAgentForTask(task, specialists = [], policy = {}) {
  const {
    maxRiskLevel   = 'HIGH',   // block agents above this risk
    preferredRole  = null,
  } = policy;

  const RISK_ORDER = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

  const capable = specialists.filter(s => {
    const reqCaps = task.requiredCapabilities ?? [];
    if (!reqCaps.every(c => s.capabilities.includes(c))) return false;
    if (RISK_ORDER[s.riskLevel] > RISK_ORDER[maxRiskLevel ?? 'HIGH']) return false;
    return true;
  });

  if (!capable.length) {
    return Object.freeze({
      selected: null,
      reason:   'NO_CAPABLE_AGENT',
      candidates: 0,
      isReal:   false,
    });
  }

  // Prefer exact role match, then lowest risk
  const sorted = [...capable].sort((a, b) => {
    const aRole = preferredRole ? (a.role === preferredRole ? 0 : 1) : 0;
    const bRole = preferredRole ? (b.role === preferredRole ? 0 : 1) : 0;
    if (aRole !== bRole) return aRole - bRole;
    return (RISK_ORDER[a.riskLevel] ?? 0) - (RISK_ORDER[b.riskLevel] ?? 0);
  });

  return Object.freeze({
    selected:   sorted[0],
    reason:     'BEST_MATCH',
    candidates: capable.length,
    isReal:     false,
  });
}

export const AGENT_SELECTOR_VERSION = '1.0.0';
