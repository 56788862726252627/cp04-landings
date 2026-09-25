// Media Content Calendar — ADV-13

export function createMediaContentCalendarEntry(config = {}) {
  if (!config.projectId)   throw new Error('CalendarEntry requires projectId');
  if (!config.scheduledAt) throw new Error('CalendarEntry requires scheduledAt');
  return Object.freeze({
    projectId:   config.projectId,
    channel:     config.channel     ?? null,
    scheduledAt: config.scheduledAt,
    objective:   config.objective   ?? null,
    caption:     config.caption     ?? '',
    status:      config.status      ?? 'DRAFT',
    requiresHumanApproval: true,
    isReal: false,
  });
}

export const MEDIA_CONTENT_CALENDAR_VERSION = '1.0.0';
