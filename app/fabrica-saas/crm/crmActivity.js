// CRM Activity Timeline — ADV-09 CRM

export const ACTIVITY_TYPE = Object.freeze({
  LEAD_CREATED:    'LEAD_CREATED',
  RESEARCH:        'RESEARCH',
  QUALIFICATION:   'QUALIFICATION',
  NOTE:            'NOTE',
  TASK:            'TASK',
  CALL_PLANNED:    'CALL_PLANNED',
  EMAIL_PLANNED:   'EMAIL_PLANNED',
  MEETING_PLANNED: 'MEETING_PLANNED',
  PROPOSAL:        'PROPOSAL',
  NEGOTIATION:     'NEGOTIATION',
  STATUS_CHANGE:   'STATUS_CHANGE',
  WON:             'WON',
  LOST:            'LOST',
  NURTURE:         'NURTURE',
  HANDOFF:         'HANDOFF',
});

export function createCRMActivity(fields = {}) {
  return Object.freeze({
    id:             fields.id ?? `activity_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    type:           fields.type ?? ACTIVITY_TYPE.NOTE,
    crmLeadId:      fields.crmLeadId ?? '',
    opportunityId:  fields.opportunityId ?? '',
    accountId:      fields.accountId ?? '',
    description:    fields.description ?? '',
    metadata:       Object.freeze({ ...(fields.metadata ?? {}) }),
    ownerId:        fields.ownerId ?? '',
    occurredAt:     fields.occurredAt ?? new Date().toISOString(),
    isReal:         false,
  });
}

export function buildActivityTimeline(activities = []) {
  const sorted = [...activities].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
  return Object.freeze({
    activities: Object.freeze(sorted),
    total:      sorted.length,
    lastActivityAt: sorted[0]?.occurredAt ?? null,
    isReal: false,
  });
}

export const CRM_ACTIVITY_VERSION = '1.0.0';
