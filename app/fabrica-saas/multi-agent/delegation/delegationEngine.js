// Delegation Engine — ADV-17
// Fixture simulation: validate → select → permissions → context → execute → report.
// No real external actions.

import { createAgentDelegationContract } from './agentDelegationContract.js';
import { selectAgentForTask }            from '../selection/agentSelector.js';

export const DELEGATION_STATUS = Object.freeze({
  SUCCESS:          'SUCCESS',
  FAILED_SELECTION: 'FAILED_SELECTION',
  FAILED_PERMISSION: 'FAILED_PERMISSION',
  FAILED_BUDGET:    'FAILED_BUDGET',
  FAILED_QUALITY:   'FAILED_QUALITY',
  BLOCKED:          'BLOCKED',
});

export function delegateAgentTask(task, specialists, supervisorPolicy, contextPolicy = {}) {
  // Step 1: validate task
  if (!task || !task.objective) {
    return Object.freeze({ status: DELEGATION_STATUS.BLOCKED, reason: 'INVALID_TASK', isReal: false });
  }

  // Step 2: select agent
  const selection = selectAgentForTask(task, specialists);
  if (!selection.selected) {
    return Object.freeze({ status: DELEGATION_STATUS.FAILED_SELECTION, reason: selection.reason, isReal: false });
  }

  const agent = selection.selected;

  // Step 3: permissions check — agent must have required write scope
  if (task.type === 'CRM_UPDATE' && agent.writeScope !== 'CRM' && agent.writeScope !== 'EXTERNAL') {
    return Object.freeze({ status: DELEGATION_STATUS.FAILED_PERMISSION, reason: 'WRITE_SCOPE_INSUFFICIENT', isReal: false });
  }

  // Step 4: context minimization — only pass allowed facts
  const allowedFacts = contextPolicy.allowedFacts ?? [];

  // Step 5: create delegation contract
  const contract = createAgentDelegationContract({
    task,
    assignedAgent:   agent,
    allowedFacts,
    allowedTools:    agent.allowedTools,
    allowedWrites:   agent.writeScope,
    budgetClass:     agent.budgetLimit ?? 'LOW',
  });

  // Step 6: fixture execution — simulate task completion
  const result = Object.freeze({
    taskId:   task.id,
    agentId:  agent.id,
    output:   `Fixture result for: ${task.objective}`,
    warnings: Object.freeze([]),
    isReal:   false,
  });

  return Object.freeze({
    status:   DELEGATION_STATUS.SUCCESS,
    contract,
    agent:    agent.id,
    result,
    isReal:   false,
  });
}

export const DELEGATION_ENGINE_VERSION = '1.0.0';
