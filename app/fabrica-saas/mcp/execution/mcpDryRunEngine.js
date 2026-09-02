// MCP Dry-Run Engine — ADV-12
// Simulates execution pipeline without any side effects

import { findTool }                         from '../registry/mcpRegistry.js';
import { validateMCPToolCall } from '../validation/mcpContractValidator.js';
import { sanitizeMCPArguments }             from '../validation/mcpArgumentSanitizer.js';
import { evaluateHumanApproval }            from '../policies/mcpHumanApprovalPolicy.js';
import { evaluateCostGuard }                from '../policies/mcpCostGuard.js';

export function dryRunMCPTool({ toolId, args = {}, clientId, approvedByHuman = false } = {}) {
  const tool = findTool(toolId, clientId);
  if (!tool) {
    return Object.freeze({ wouldExecute: false, blockers: ['TOOL_NOT_FOUND'], toolId, isReal: false });
  }

  const sanitized  = sanitizeMCPArguments(args);
  const validation = validateMCPToolCall({ toolId, args: sanitized.sanitized, callerClientId: clientId, approvedByHuman });
  const approval   = evaluateHumanApproval(tool);
  const costCheck  = evaluateCostGuard(tool, { approvedByHuman });

  const blockers = [...validation.errors];
  if (approval.required && !approvedByHuman) blockers.push('REQUIRES_HUMAN_APPROVAL');
  if (!costCheck.allowed) blockers.push(`COST_BLOCKED:${tool.costClass}`);

  return Object.freeze({
    wouldExecute:      blockers.length === 0,
    blockers:          Object.freeze(blockers),
    sanitizationFlags: sanitized.blocked,
    approvalRequired:  approval.required,
    estimatedCostEur:  0,
    noRealSpend:       true,
    toolId,
    isReal: false,
  });
}

export const MCP_DRY_RUN_ENGINE_VERSION = '1.0.0';
