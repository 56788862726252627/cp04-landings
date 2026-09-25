// MCP Cost Guard — ADV-12
// COST_CLASS.UNKNOWN never auto-executes — blocked unconditionally

export const COST_GUARD_ACTION = Object.freeze({
  ALLOW:        'ALLOW',
  BLOCK:        'BLOCK',
  REQUIRE_APPROVAL: 'REQUIRE_APPROVAL',
});

// All simulated — NO_REAL_SPEND=SI
const COST_GATE = Object.freeze({
  FREE:    COST_GUARD_ACTION.ALLOW,
  LOW:     COST_GUARD_ACTION.ALLOW,
  MEDIUM:  COST_GUARD_ACTION.REQUIRE_APPROVAL,
  HIGH:    COST_GUARD_ACTION.REQUIRE_APPROVAL,
  UNKNOWN: COST_GUARD_ACTION.BLOCK,
});

export function evaluateCostGuard(tool, { approvedByHuman = false } = {}) {
  const action = COST_GATE[tool.costClass] ?? COST_GUARD_ACTION.BLOCK;

  if (action === COST_GUARD_ACTION.ALLOW) {
    return Object.freeze({ allowed: true, action, costClass: tool.costClass, estimatedCostEur: 0, noRealSpend: true, isReal: false });
  }
  if (action === COST_GUARD_ACTION.REQUIRE_APPROVAL) {
    return Object.freeze({ allowed: approvedByHuman, action, costClass: tool.costClass, estimatedCostEur: 0, noRealSpend: true, isReal: false });
  }
  return Object.freeze({ allowed: false, action: COST_GUARD_ACTION.BLOCK, costClass: tool.costClass, estimatedCostEur: 0, noRealSpend: true, isReal: false });
}

export const MCP_COST_GUARD_VERSION = '1.0.0';
