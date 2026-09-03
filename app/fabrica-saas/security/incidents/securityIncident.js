// Security Incident Model — ADV-19

export const INCIDENT_STATUS = Object.freeze({
  DETECTED:           'DETECTED',
  TRIAGED:            'TRIAGED',
  CONTAINED:          'CONTAINED',
  INVESTIGATING:      'INVESTIGATING',
  RESOLVED_SIMULATED: 'RESOLVED_SIMULATED',
  CLOSED_SIMULATED:   'CLOSED_SIMULATED',
});

export const INCIDENT_SEVERITY = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export function createSecurityIncident(config = {}) {
  const {
    title = '',
    description = '',
    severity = INCIDENT_SEVERITY.MEDIUM,
    affectedAssets = [],
    personalDataInvolved = false,
    clientId = null,
    detectedBy = 'SYSTEM',
  } = config;

  return Object.freeze({
    id: `incident-${Date.now()}`,
    title,
    description,
    severity,
    status: INCIDENT_STATUS.DETECTED,
    affectedAssets: Object.freeze([...affectedAssets]),
    personalDataInvolved,
    clientId,
    detectedBy,
    detectedAt: new Date().toISOString(),
    containedAt: null,
    resolvedAt: null,
    isReal: false,
  });
}

export function transitionIncident(incident, newStatus) {
  const VALID = {
    [INCIDENT_STATUS.DETECTED]:    [INCIDENT_STATUS.TRIAGED],
    [INCIDENT_STATUS.TRIAGED]:     [INCIDENT_STATUS.CONTAINED, INCIDENT_STATUS.INVESTIGATING],
    [INCIDENT_STATUS.CONTAINED]:   [INCIDENT_STATUS.INVESTIGATING],
    [INCIDENT_STATUS.INVESTIGATING]:[INCIDENT_STATUS.RESOLVED_SIMULATED],
    [INCIDENT_STATUS.RESOLVED_SIMULATED]:[INCIDENT_STATUS.CLOSED_SIMULATED],
  };

  const allowed = VALID[incident.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return Object.freeze({ ...incident, error: `INVALID_TRANSITION:${incident.status}→${newStatus}`, isReal: false });
  }

  return Object.freeze({
    ...incident,
    status: newStatus,
    containedAt: newStatus === INCIDENT_STATUS.CONTAINED ? new Date().toISOString() : incident.containedAt,
    resolvedAt: newStatus === INCIDENT_STATUS.RESOLVED_SIMULATED ? new Date().toISOString() : incident.resolvedAt,
    isReal: false,
  });
}

export const SECURITY_INCIDENT_VERSION = '1.0.0';
