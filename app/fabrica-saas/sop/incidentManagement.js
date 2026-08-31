// Incident Management — FASE 16: gestión de incidentes con severidades

export const INCIDENT_SEVERITY = Object.freeze({
  SEV1: 'SEV1',  // sistema caído, pérdida de datos, impacto crítico
  SEV2: 'SEV2',  // funcionalidad mayor rota, sin workaround
  SEV3: 'SEV3',  // funcionalidad menor rota, workaround disponible
  SEV4: 'SEV4',  // cosmético, impacto mínimo
});

export const INCIDENT_STATUS = Object.freeze({
  OPEN:        'OPEN',
  CONTAINED:   'CONTAINED',
  INVESTIGATING:'INVESTIGATING',
  RESOLVED:    'RESOLVED',
  POSTMORTEM:  'POSTMORTEM',
  CLOSED:      'CLOSED',
});

const SEV_CONFIG = {
  [INCIDENT_SEVERITY.SEV1]: {
    responseTarget:  '15 minutes',
    owner:           'AGENCY_OWNER',
    communication:   'immediate client notification + status page update',
    escalation:      'All hands',
  },
  [INCIDENT_SEVERITY.SEV2]: {
    responseTarget:  '1 hour',
    owner:           'PROJECT_MANAGER',
    communication:   'client notification within 30 min',
    escalation:      'AGENCY_OWNER if unresolved after 2h',
  },
  [INCIDENT_SEVERITY.SEV3]: {
    responseTarget:  '4 hours',
    owner:           'SUPPORT',
    communication:   'client notification within 2h',
    escalation:      'PROJECT_MANAGER if unresolved after 8h',
  },
  [INCIDENT_SEVERITY.SEV4]: {
    responseTarget:  '24 hours',
    owner:           'SUPPORT',
    communication:   'next maintenance window',
    escalation:      'PROJECT_MANAGER if unresolved after 72h',
  },
};

/**
 * Create a new incident record.
 */
export function createIncident(params = {}) {
  const errors = [];

  if (!params.title)              errors.push('title required');
  if (!params.severity || !Object.values(INCIDENT_SEVERITY).includes(params.severity)) {
    errors.push(`severity must be one of: ${Object.values(INCIDENT_SEVERITY).join(', ')}`);
  }
  if (!params.reportedBy)         errors.push('reportedBy required');

  if (errors.length > 0) return { valid: false, errors, incident: null };

  const config = SEV_CONFIG[params.severity];
  const incident = {
    incidentId:      params.incidentId ?? `INC-${Date.now()}`,
    title:           params.title,
    severity:        params.severity,
    status:          INCIDENT_STATUS.OPEN,
    reportedBy:      params.reportedBy,
    reportedAt:      new Date().toISOString(),
    impact:          params.impact ?? 'unknown',
    urgency:         params.urgency ?? 'normal',
    owner:           params.owner ?? config.owner,
    responseTarget:  config.responseTarget,
    communication:   config.communication,
    escalation:      config.escalation,
    containment:     null,
    recovery:        null,
    rootCause:       null,
    followUp:        [],
    timeline:        [{ at: new Date().toISOString(), event: 'OPENED', by: params.reportedBy }],
    disclaimer:      'This incident record does not imply legal SLA commitment.',
  };

  return { valid: true, errors: [], incident };
}

/**
 * Classify severity from impact description.
 */
export function classifySeverity(description = '') {
  const d = description.toLowerCase();
  if (d.includes('system down') || d.includes('data loss') || d.includes('all users') || d.includes('payment')) {
    return INCIDENT_SEVERITY.SEV1;
  }
  if (d.includes('major feature') || d.includes('broken') || d.includes('no workaround')) {
    return INCIDENT_SEVERITY.SEV2;
  }
  if (d.includes('minor') || d.includes('workaround') || d.includes('partial')) {
    return INCIDENT_SEVERITY.SEV3;
  }
  return INCIDENT_SEVERITY.SEV4;
}

/**
 * Advance incident through lifecycle stages.
 */
export function updateIncident(incident = {}, update = {}) {
  if (!incident.incidentId) return { valid: false, errors: ['invalid incident'], incident: null };

  const allowed = [
    INCIDENT_STATUS.CONTAINED,
    INCIDENT_STATUS.INVESTIGATING,
    INCIDENT_STATUS.RESOLVED,
    INCIDENT_STATUS.POSTMORTEM,
    INCIDENT_STATUS.CLOSED,
  ];

  if (update.status && !allowed.includes(update.status)) {
    return { valid: false, errors: [`invalid status: ${update.status}`], incident: null };
  }

  const timeline = [...(incident.timeline ?? [])];
  if (update.status) {
    timeline.push({ at: new Date().toISOString(), event: update.status, by: update.updatedBy ?? 'SYSTEM' });
  }

  const updated = {
    ...incident,
    ...update,
    timeline,
    containment:  update.containment  ?? incident.containment,
    recovery:     update.recovery     ?? incident.recovery,
    rootCause:    update.rootCause    ?? incident.rootCause,
    followUp:     update.followUp     ?? incident.followUp,
  };

  return { valid: true, errors: [], incident: updated };
}

/**
 * Postmortem template.
 */
export function generatePostmortem(incident = {}) {
  if (incident.status !== INCIDENT_STATUS.RESOLVED && incident.status !== INCIDENT_STATUS.CLOSED) {
    return { valid: false, error: 'incident must be RESOLVED before postmortem' };
  }

  return {
    valid: true,
    postmortem: {
      incidentId:   incident.incidentId,
      severity:     incident.severity,
      timeline:     incident.timeline ?? [],
      impact:       incident.impact,
      rootCause:    incident.rootCause ?? 'TBD',
      containment:  incident.containment ?? 'TBD',
      recovery:     incident.recovery ?? 'TBD',
      followUp:     incident.followUp ?? [],
      lessons:      [],
      generatedAt:  new Date().toISOString(),
      disclaimer:   'Post-mortem is a learning document, not a legal liability record.',
    },
  };
}

export const INCIDENT_MANAGEMENT_VERSION = '1.0.0';
