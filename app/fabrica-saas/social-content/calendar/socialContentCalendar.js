// Social Content Calendar — scheduling and approval workflow

export const CALENDAR_STATUS = Object.freeze({
  IDEA:             'IDEA',
  DRAFT:            'DRAFT',
  READY:            'READY',
  WAITING_APPROVAL: 'WAITING_APPROVAL',
  APPROVED:         'APPROVED',
  SCHEDULED_FUTURE: 'SCHEDULED_FUTURE',
  BLOCKED:          'BLOCKED',
});

export function createSocialContentCalendarEntry(config = {}) {
  if (!config.businessId)    throw new Error('CalendarEntry requires businessId');
  if (!config.clientId)      throw new Error('CalendarEntry requires clientId');
  if (!config.channel)       throw new Error('CalendarEntry requires channel');
  if (!config.scheduledDate) throw new Error('CalendarEntry requires scheduledDate');

  const status = config.status ?? CALENDAR_STATUS.IDEA;
  if (!Object.values(CALENDAR_STATUS).includes(status)) {
    throw new Error(`Unknown calendar status: ${status}`);
  }

  return Object.freeze({
    id:             config.id ?? `cal_${config.businessId}_${Date.now()}`,
    businessId:     config.businessId,
    clientId:       config.clientId,
    channel:        config.channel,
    pillar:         config.pillar    ?? null,
    objective:      config.objective ?? null,
    topic:          config.topic     ?? null,
    postRef:        config.postRef   ?? null,
    scheduledDate:  config.scheduledDate,
    scheduledTime:  config.scheduledTime ?? '09:00',
    status,
    approvedBy:     config.approvedBy ?? null,
    noRealSchedule: true,
    isReal:         false,
  });
}

export function transitionCalendarStatus(entry = {}, newStatus, approver = null) {
  if (!Object.values(CALENDAR_STATUS).includes(newStatus)) {
    throw new Error(`Unknown status: ${newStatus}`);
  }

  const requiresApprover = newStatus === CALENDAR_STATUS.APPROVED;
  if (requiresApprover && !approver) {
    throw new Error('Status APPROVED requires approver');
  }

  return Object.freeze({
    ...entry,
    status:     newStatus,
    approvedBy: approver ?? entry.approvedBy,
    isReal:     false,
  });
}
