// CRM Task Engine — ADV-09 CRM

export const TASK_TYPE = Object.freeze({
  RESEARCH:         'RESEARCH',
  QUALIFY:          'QUALIFY',
  PREPARE_DISCOVERY:'PREPARE_DISCOVERY',
  PREPARE_PROPOSAL: 'PREPARE_PROPOSAL',
  SEND_PROPOSAL:    'SEND_PROPOSAL',
  FOLLOW_UP:        'FOLLOW_UP',
  SCHEDULE_MEETING: 'SCHEDULE_MEETING',
  PREPARE_DEMO:     'PREPARE_DEMO',
  AWAIT_RESPONSE:   'AWAIT_RESPONSE',
  NEGOTIATE:        'NEGOTIATE',
  LOG_OUTCOME:      'LOG_OUTCOME',
  HANDOFF:          'HANDOFF',
  REVIEW:           'REVIEW',
  OTHER:            'OTHER',
});

export const TASK_PRIORITY = Object.freeze({
  URGENT:  'URGENT',
  HIGH:    'HIGH',
  MEDIUM:  'MEDIUM',
  LOW:     'LOW',
});

export const TASK_STATUS = Object.freeze({
  TODO:        'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE:        'DONE',
  CANCELLED:   'CANCELLED',
  OVERDUE:     'OVERDUE',
});

export function createCRMTask(fields = {}) {
  return Object.freeze({
    id:               fields.id ?? `task_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    type:             fields.type ?? TASK_TYPE.OTHER,
    priority:         fields.priority ?? TASK_PRIORITY.MEDIUM,
    status:           fields.status ?? TASK_STATUS.TODO,
    description:      fields.description ?? '',
    relatedLeadId:    fields.relatedLeadId ?? '',
    relatedOpportunityId: fields.relatedOpportunityId ?? '',
    ownerId:          fields.ownerId ?? '',
    dueAt:            fields.dueAt ?? '',
    blocking:         fields.blocking ?? false,
    createdAt:        fields.createdAt ?? new Date().toISOString(),
    completedAt:      fields.completedAt ?? '',
    isReal:           false,
  });
}

export function isTaskOverdue(task = {}) {
  if (!task.dueAt || task.status === TASK_STATUS.DONE || task.status === TASK_STATUS.CANCELLED) return false;
  return new Date(task.dueAt) < new Date();
}

export function getTaskStatusCurrent(task = {}) {
  if (task.status === TASK_STATUS.DONE || task.status === TASK_STATUS.CANCELLED) return task.status;
  if (isTaskOverdue(task)) return TASK_STATUS.OVERDUE;
  return task.status;
}

export const CRM_TASK_VERSION = '1.0.0';
