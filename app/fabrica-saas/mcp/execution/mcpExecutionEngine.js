// MCP Execution Engine — ADV-12
// Pipeline: resolve → validate → permission → approval → cost → isolation → execute → validate output → redact → result

import { findTool }                         from '../registry/mcpRegistry.js';
import { validateMCPToolCall, VALIDATION_RESULT } from '../validation/mcpContractValidator.js';
import { sanitizeMCPArguments }             from '../validation/mcpArgumentSanitizer.js';
import { validateMCPOutput }                from '../validation/mcpOutputValidator.js';
import { redactMCPOutput }                  from '../validation/mcpOutputRedactor.js';
import { evaluateHumanApproval }            from '../policies/mcpHumanApprovalPolicy.js';
import { evaluateCostGuard }                from '../policies/mcpCostGuard.js';
import { checkClientIsolation }             from '../policies/mcpClientIsolationPolicy.js';
import { createExecutionResult, EXECUTION_STATUS } from './mcpExecutionResult.js';

export async function executeMCPTool({ toolId, args = {}, clientId, approvedByHuman = false, adapter = null } = {}) {
  const start = Date.now();

  // 1. Resolve tool
  const tool = findTool(toolId, clientId);
  if (!tool) {
    return createExecutionResult({ status: EXECUTION_STATUS.BLOCKED, toolId, error: 'TOOL_NOT_FOUND', isReal: false });
  }

  // 2. Client isolation
  const isolation = checkClientIsolation(clientId, tool.clientId ?? 'global');
  if (!isolation.allowed) {
    return createExecutionResult({ status: EXECUTION_STATUS.BLOCKED, toolId, error: isolation.reason, isReal: false });
  }

  // 3. Sanitize args
  const sanitized = sanitizeMCPArguments(args);

  // 4. Validate contract
  const validation = validateMCPToolCall({ toolId, args: sanitized.sanitized, callerClientId: clientId, approvedByHuman });
  if (validation.result === VALIDATION_RESULT.BLOCKED) {
    return createExecutionResult({ status: EXECUTION_STATUS.BLOCKED, toolId, error: validation.errors[0], isReal: false });
  }
  if (validation.result === VALIDATION_RESULT.FAIL) {
    if (validation.errors.includes('APPROVAL_REQUIRED')) {
      return createExecutionResult({ status: EXECUTION_STATUS.WAITING_HUMAN, toolId, error: 'APPROVAL_REQUIRED', isReal: false });
    }
    return createExecutionResult({ status: EXECUTION_STATUS.FAILED, toolId, error: validation.errors[0], isReal: false });
  }

  // 5. Human approval
  const approval = evaluateHumanApproval(tool);
  if (approval.required && !approvedByHuman) {
    return createExecutionResult({ status: EXECUTION_STATUS.WAITING_HUMAN, toolId, error: 'REQUIRES_HUMAN_APPROVAL', isReal: false });
  }

  // 6. Cost guard
  const costCheck = evaluateCostGuard(tool, { approvedByHuman });
  if (!costCheck.allowed) {
    return createExecutionResult({ status: EXECUTION_STATUS.BLOCKED, toolId, error: `COST_BLOCKED:${tool.costClass}`, isReal: false });
  }

  // 7. Execute via adapter (simulated if no adapter)
  let rawOutput;
  try {
    if (adapter && typeof adapter.execute === 'function') {
      rawOutput = await adapter.execute(tool, sanitized.sanitized);
    } else {
      rawOutput = Object.freeze({ simulated: true, toolId, args: sanitized.sanitized, result: 'SIMULATED_OK', isReal: false });
    }
  } catch (err) {
    return createExecutionResult({ status: EXECUTION_STATUS.FAILED, toolId, error: err.message, durationMs: Date.now() - start, isReal: false });
  }

  // 8. Validate + redact output
  validateMCPOutput(rawOutput, tool);
  const redacted = redactMCPOutput(rawOutput);

  return createExecutionResult({
    status:     EXECUTION_STATUS.SUCCESS,
    toolId,
    output:     redacted,
    durationMs: Date.now() - start,
    simulated:  true,
    isReal: false,
  });
}

export const MCP_EXECUTION_ENGINE_VERSION = '1.0.0';
