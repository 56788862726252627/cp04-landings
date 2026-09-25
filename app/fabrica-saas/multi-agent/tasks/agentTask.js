// Agent Task — ADV-17

export const TASK_STATUS = Object.freeze({
  PENDING:   'PENDING',
  READY:     'READY',
  RUNNING:   'RUNNING',
  WAITING:   'WAITING',
  COMPLETED: 'COMPLETED',
  FAILED:    'FAILED',
  BLOCKED:   'BLOCKED',
  CANCELLED: 'CANCELLED',
});

export const TASK_TYPE = Object.freeze({
  RESEARCH:       'RESEARCH',
  QUALIFICATION:  'QUALIFICATION',
  COMMUNICATION:  'COMMUNICATION',
  BOOKING:        'BOOKING',
  CONTENT:        'CONTENT',
  CRM_UPDATE:     'CRM_UPDATE',
  QA:             'QA',
  ANALYSIS:       'ANALYSIS',
  HANDOFF:        'HANDOFF',
  APPROVAL:       'APPROVAL',
  GENERIC:        'GENERIC',
});

export const TASK_PRIORITY = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH:     'HIGH',
  NORMAL:   'NORMAL',
  LOW:      'LOW',
});

export const TASK_RISK = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

let _taskCounter = 0;

export function createAgentTask(config = {}) {
  const {
    objective            = '',
    type                 = TASK_TYPE.GENERIC,
    input                = {},
    dependencies         = [],
    requiredCapabilities = [],
    requiredTools        = [],
    risk                 = TASK_RISK.LOW,
    priority             = TASK_PRIORITY.NORMAL,
  } = config;

  return Object.freeze({
    id:                  `task-${++_taskCounter}`,
    objective,
    type,
    input:               Object.freeze({ ...input }),
    dependencies:        Object.freeze([...dependencies]),
    assignedAgent:       null,
    requiredCapabilities: Object.freeze([...requiredCapabilities]),
    requiredTools:       Object.freeze([...requiredTools]),
    risk,
    priority,
    status:              TASK_STATUS.PENDING,
    result:              null,
    warnings:            Object.freeze([]),
    createdAt:           new Date().toISOString(),
    startedAt:           null,
    completedAt:         null,
    isReal:              false,
  });
}

export const AGENT_TASK_VERSION = '1.0.0';
