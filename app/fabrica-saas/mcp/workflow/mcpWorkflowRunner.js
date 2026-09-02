// MCP Workflow Runner — ADV-12

import { executeMCPTool }       from '../execution/mcpExecutionEngine.js';
import { EXECUTION_STATUS }     from '../execution/mcpExecutionResult.js';
import { PLAN_TYPE }            from '../planning/mcpToolPlan.js';

export const WORKFLOW_STATUS = Object.freeze({
  PENDING:   'PENDING',
  RUNNING:   'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED:    'FAILED',
  BLOCKED:   'BLOCKED',
});

export async function runMCPWorkflow(plan, context = {}) {
  const { clientId, approvedByHuman = false } = context;
  const results = [];

  if (plan.type === PLAN_TYPE.PARALLEL_READ_ONLY) {
    const settled = await Promise.allSettled(
      plan.steps.map(step => executeMCPTool({ toolId: step.toolId, args: step.args ?? {}, clientId, approvedByHuman }))
    );
    for (const r of settled) {
      results.push(r.status === 'fulfilled' ? r.value : { status: EXECUTION_STATUS.FAILED, error: r.reason?.message, isReal: false });
    }
  } else {
    // SINGLE or SEQUENTIAL
    for (const step of plan.steps) {
      const result = await executeMCPTool({ toolId: step.toolId, args: step.args ?? {}, clientId, approvedByHuman });
      results.push(result);
      if (result.status === EXECUTION_STATUS.BLOCKED || result.status === EXECUTION_STATUS.FAILED) break;
    }
  }

  const overallStatus = results.every(r => r.status === EXECUTION_STATUS.SUCCESS)
    ? WORKFLOW_STATUS.COMPLETED
    : results.some(r => r.status === EXECUTION_STATUS.BLOCKED)
      ? WORKFLOW_STATUS.BLOCKED
      : WORKFLOW_STATUS.FAILED;

  return Object.freeze({
    planId:  plan.id,
    status:  overallStatus,
    results: Object.freeze(results),
    isReal: false,
  });
}

export const MCP_WORKFLOW_RUNNER_VERSION = '1.0.0';
