// MCP Contract Validator — ADV-12

import { findTool } from '../registry/mcpRegistry.js';
import { TOOL_RISK_LEVEL } from '../core/mcpToolDefinition.js';

export const VALIDATION_RESULT = Object.freeze({
  PASS:    'PASS',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

export const VALIDATION_ERROR = Object.freeze({
  TOOL_NOT_FOUND:       'TOOL_NOT_FOUND',
  SCHEMA_MISMATCH:      'SCHEMA_MISMATCH',
  MISSING_REQUIRED_ARG: 'MISSING_REQUIRED_ARG',
  SCOPE_VIOLATION:      'SCOPE_VIOLATION',
  RISK_TOO_HIGH:        'RISK_TOO_HIGH',
  APPROVAL_REQUIRED:    'APPROVAL_REQUIRED',
  COST_BLOCKED:         'COST_BLOCKED',
  CLIENT_ISOLATION:     'CLIENT_ISOLATION',
});

export function validateMCPToolCall({ toolId, args = {}, callerClientId, maxRisk = TOOL_RISK_LEVEL.HIGH, approvedByHuman = false } = {}) {
  const errors = [];

  const tool = findTool(toolId, callerClientId);
  if (!tool) {
    return Object.freeze({
      result: VALIDATION_RESULT.BLOCKED,
      errors: [VALIDATION_ERROR.TOOL_NOT_FOUND],
      toolId,
      isReal: false,
    });
  }

  if (tool.clientId && tool.clientId !== callerClientId) {
    errors.push(VALIDATION_ERROR.CLIENT_ISOLATION);
  }

  const RISK_ORDER = [TOOL_RISK_LEVEL.LOW, TOOL_RISK_LEVEL.MEDIUM, TOOL_RISK_LEVEL.HIGH, TOOL_RISK_LEVEL.CRITICAL];
  if (RISK_ORDER.indexOf(tool.riskLevel) > RISK_ORDER.indexOf(maxRisk)) {
    errors.push(VALIDATION_ERROR.RISK_TOO_HIGH);
  }

  if (tool.requiresHumanApproval && !approvedByHuman) {
    errors.push(VALIDATION_ERROR.APPROVAL_REQUIRED);
  }

  if (tool.costClass === 'UNKNOWN') {
    errors.push(VALIDATION_ERROR.COST_BLOCKED);
  }

  const schema = tool.inputSchema ?? {};
  const required = schema.required ?? [];
  for (const field of required) {
    if (!(field in args)) errors.push(`${VALIDATION_ERROR.MISSING_REQUIRED_ARG}:${field}`);
  }

  const result = errors.length === 0 ? VALIDATION_RESULT.PASS : VALIDATION_RESULT.FAIL;
  return Object.freeze({ result, errors: Object.freeze(errors), toolId, isReal: false });
}

export const MCP_CONTRACT_VALIDATOR_VERSION = '1.0.0';
