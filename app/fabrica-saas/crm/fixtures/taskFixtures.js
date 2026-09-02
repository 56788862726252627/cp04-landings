// Task Fixtures — ADV-09 CRM (fictional tasks)

import { createCRMTask, TASK_TYPE, TASK_PRIORITY, TASK_STATUS } from '../crmTask.js';

export const TASK_FIXTURE_COUNT = 10;

export const TASK_FIXTURES = Object.freeze([
  createCRMTask({ id: 'task_001', relatedOpportunityId: 'opp_001', description: 'Send revised contract',        type: TASK_TYPE.SEND_PROPOSAL,    priority: TASK_PRIORITY.HIGH,   status: TASK_STATUS.TODO,        dueAt: '2026-09-05T10:00:00Z' }),
  createCRMTask({ id: 'task_002', relatedOpportunityId: 'opp_002', description: 'Follow up on proposal',        type: TASK_TYPE.FOLLOW_UP,        priority: TASK_PRIORITY.HIGH,   status: TASK_STATUS.IN_PROGRESS, dueAt: '2026-09-03T10:00:00Z' }),
  createCRMTask({ id: 'task_003', relatedOpportunityId: 'opp_003', description: 'Schedule discovery call',      type: TASK_TYPE.SCHEDULE_MEETING, priority: TASK_PRIORITY.MEDIUM, status: TASK_STATUS.TODO,        dueAt: '2026-09-10T09:00:00Z' }),
  createCRMTask({ id: 'task_004', relatedOpportunityId: 'opp_004', description: 'Qualify budget and authority', type: TASK_TYPE.QUALIFY,          priority: TASK_PRIORITY.MEDIUM, status: TASK_STATUS.TODO,        dueAt: '2026-09-08T14:00:00Z' }),
  createCRMTask({ id: 'task_005', relatedOpportunityId: 'opp_005', description: 'Prepare solution demo',        type: TASK_TYPE.PREPARE_DEMO,     priority: TASK_PRIORITY.MEDIUM, status: TASK_STATUS.IN_PROGRESS, dueAt: '2026-09-12T10:00:00Z' }),
  createCRMTask({ id: 'task_006', relatedOpportunityId: 'opp_006', description: 'Await client signature',       type: TASK_TYPE.AWAIT_RESPONSE,   priority: TASK_PRIORITY.LOW,    status: TASK_STATUS.IN_PROGRESS, dueAt: '2026-09-15T17:00:00Z' }),
  createCRMTask({ id: 'task_007', relatedOpportunityId: 'opp_007', description: 'Finish proposal document',     type: TASK_TYPE.PREPARE_PROPOSAL, priority: TASK_PRIORITY.HIGH,   status: TASK_STATUS.TODO,        dueAt: '2026-09-04T12:00:00Z' }),
  createCRMTask({ id: 'task_008', relatedOpportunityId: 'opp_008', description: 'Negotiate final terms',        type: TASK_TYPE.NEGOTIATE,        priority: TASK_PRIORITY.HIGH,   status: TASK_STATUS.IN_PROGRESS, dueAt: '2026-09-06T11:00:00Z' }),
  createCRMTask({ id: 'task_009', relatedOpportunityId: 'opp_011', description: 'Prepare onboarding handoff',   type: TASK_TYPE.HANDOFF,          priority: TASK_PRIORITY.HIGH,   status: TASK_STATUS.TODO,        dueAt: '2026-09-07T09:00:00Z' }),
  createCRMTask({ id: 'task_010', relatedOpportunityId: 'opp_012', description: 'Analyze loss and log reasons', type: TASK_TYPE.LOG_OUTCOME,      priority: TASK_PRIORITY.LOW,    status: TASK_STATUS.TODO,        dueAt: '2026-09-09T10:00:00Z' }),
]);
