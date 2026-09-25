// Task Decomposer — ADV-17
// Converts a high-level objective into auditable sub-tasks.
// Fixture/simulation: no LLM call.

import { createAgentTask, TASK_TYPE, TASK_RISK, TASK_PRIORITY } from './agentTask.js';

const OBJECTIVE_PATTERNS = [
  { pattern: /book|reserv/i, tasks: [
    { objective: 'Collect booking details from user',           type: TASK_TYPE.COMMUNICATION,  risk: TASK_RISK.LOW    },
    { objective: 'Check availability via Business Source',      type: TASK_TYPE.RESEARCH,       risk: TASK_RISK.LOW    },
    { objective: 'Confirm and create booking record',           type: TASK_TYPE.BOOKING,        risk: TASK_RISK.MEDIUM },
    { objective: 'Send confirmation to user',                   type: TASK_TYPE.COMMUNICATION,  risk: TASK_RISK.LOW    },
  ]},
  { pattern: /lead|prospect/i, tasks: [
    { objective: 'Research prospect from available sources',    type: TASK_TYPE.RESEARCH,      risk: TASK_RISK.LOW    },
    { objective: 'Qualify lead against criteria',               type: TASK_TYPE.QUALIFICATION, risk: TASK_RISK.LOW    },
    { objective: 'Prioritize and score lead',                   type: TASK_TYPE.ANALYSIS,      risk: TASK_RISK.LOW    },
    { objective: 'Prepare CRM record',                          type: TASK_TYPE.CRM_UPDATE,    risk: TASK_RISK.MEDIUM },
  ]},
  { pattern: /content|post|social/i, tasks: [
    { objective: 'Define content strategy and tone',            type: TASK_TYPE.ANALYSIS,      risk: TASK_RISK.LOW    },
    { objective: 'Generate content draft',                      type: TASK_TYPE.CONTENT,       risk: TASK_RISK.LOW    },
    { objective: 'QA review for policy and brand fit',          type: TASK_TYPE.QA,            risk: TASK_RISK.LOW    },
  ]},
  { pattern: /support|help|issue/i, tasks: [
    { objective: 'Classify support request type',               type: TASK_TYPE.ANALYSIS,      risk: TASK_RISK.LOW    },
    { objective: 'Search knowledge base for resolution',        type: TASK_TYPE.RESEARCH,      risk: TASK_RISK.LOW    },
    { objective: 'Resolve or escalate to human',                type: TASK_TYPE.HANDOFF,       risk: TASK_RISK.MEDIUM },
  ]},
];

export function decomposeAgentObjective(objective = '', overridePattern = null) {
  const pattern = overridePattern ??
    OBJECTIVE_PATTERNS.find(p => p.pattern.test(objective));

  const templates = pattern
    ? pattern.tasks
    : [{ objective: 'Understand and respond to objective', type: TASK_TYPE.GENERIC, risk: TASK_RISK.LOW }];

  const tasks = templates.map((t, i) => createAgentTask({
    objective:  t.objective,
    type:       t.type,
    risk:       t.risk ?? TASK_RISK.LOW,
    priority:   TASK_PRIORITY.NORMAL,
    dependencies: i > 0 ? [] : [], // sequential by default; caller wires dependencies
  }));

  return Object.freeze({
    objective,
    tasks:         Object.freeze(tasks),
    count:         tasks.length,
    patternMatched: !!pattern,
    isReal:         false,
  });
}

export const TASK_DECOMPOSER_VERSION = '1.0.0';
