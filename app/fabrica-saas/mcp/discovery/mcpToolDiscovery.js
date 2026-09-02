// MCP Tool Discovery — ADV-12

import { listTools } from '../registry/mcpRegistry.js';
import { TOOL_RISK_LEVEL, COST_CLASS } from '../core/mcpToolDefinition.js';

const RISK_ORDER = [TOOL_RISK_LEVEL.LOW, TOOL_RISK_LEVEL.MEDIUM, TOOL_RISK_LEVEL.HIGH, TOOL_RISK_LEVEL.CRITICAL];
const COST_ORDER = [COST_CLASS.FREE, COST_CLASS.LOW, COST_CLASS.MEDIUM, COST_CLASS.HIGH, COST_CLASS.UNKNOWN];

export function discoverTools(filters = {}, clientId = 'global') {
  let tools = [...listTools(clientId)];

  if (filters.capability) {
    tools = tools.filter(t => Array.isArray(t.requiredScopes) && t.requiredScopes.includes(filters.capability));
  }
  if (filters.maxRisk) {
    const maxIdx = RISK_ORDER.indexOf(filters.maxRisk);
    tools = tools.filter(t => RISK_ORDER.indexOf(t.riskLevel) <= maxIdx);
  }
  if (filters.readOnly === true) {
    tools = tools.filter(t => t.readOnly === true);
  }
  if (filters.maxCost) {
    const maxIdx = COST_ORDER.indexOf(filters.maxCost);
    tools = tools.filter(t => COST_ORDER.indexOf(t.costClass) <= maxIdx);
  }
  if (filters.excludeDestructive === true) {
    tools = tools.filter(t => !t.destructive);
  }
  if (filters.excludeRequiresApproval === true) {
    tools = tools.filter(t => !t.requiresHumanApproval);
  }
  if (filters.serverId) {
    tools = tools.filter(t => t.serverId === filters.serverId);
  }

  return Object.freeze({
    tools: Object.freeze(tools),
    count: tools.length,
    filters: Object.freeze(filters),
    clientId,
    isReal: false,
  });
}

export function discoverReadOnlyTools(clientId = 'global') {
  return discoverTools({ readOnly: true, maxRisk: TOOL_RISK_LEVEL.MEDIUM, maxCost: COST_CLASS.FREE }, clientId);
}

export function discoverSafeTools(clientId = 'global') {
  return discoverTools({ excludeDestructive: true, excludeRequiresApproval: true, maxRisk: TOOL_RISK_LEVEL.MEDIUM, maxCost: COST_CLASS.LOW }, clientId);
}

export const MCP_TOOL_DISCOVERY_VERSION = '1.0.0';
