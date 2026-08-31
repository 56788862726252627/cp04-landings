// Incident Bridge — ADV-01 Transversal Observability
// Converts ObservabilityEvents into Incident records when criteria are met.
// Reuses sop/incidentManagement.js (REUSE classification from audit).

import { SEVERITY, EVENT_TYPE } from './eventModel.js';
import { INCIDENT_SEVERITY } from '../sop/incidentManagement.js';

const SEVERITY_TO_INCIDENT = {
  [SEVERITY.CRITICAL]: INCIDENT_SEVERITY.SEV1,
  [SEVERITY.ERROR]:    INCIDENT_SEVERITY.SEV2,
  [SEVERITY.WARNING]:  INCIDENT_SEVERITY.SEV3,
  [SEVERITY.INFO]:     INCIDENT_SEVERITY.SEV4,
  [SEVERITY.DEBUG]:    INCIDENT_SEVERITY.SEV4,
};

/**
 * Determine if an ObservabilityEvent warrants incident creation.
 * Criteria: CRITICAL severity, or ERROR security event, or humanActionRequired.
 */
export function isIncidentEligibleEvent(event) {
  if (!event) return false;
  if (event.severity === SEVERITY.CRITICAL) return true;
  if (event.eventType === EVENT_TYPE.SECURITY && event.severity === SEVERITY.ERROR) return true;
  if (event.humanActionRequired === true) return true;
  if (event.severity === SEVERITY.ERROR && !event.recoverable) return true;
  return false;
}

/**
 * Convert an ObservabilityEvent to an incident params object.
 * Does NOT call createIncident() — returns the params for the caller to decide.
 * This avoids auto-generating incidents without explicit human gate.
 */
export function observabilityEventToIncident(event, options = {}) {
  if (!event) return { valid: false, error: 'event required' };

  if (!isIncidentEligibleEvent(event) && !options.force) {
    return {
      valid:    false,
      eligible: false,
      reason:   'event does not meet incident escalation criteria',
    };
  }

  const severity = SEVERITY_TO_INCIDENT[event.severity] ?? INCIDENT_SEVERITY.SEV3;

  const incidentParams = {
    title:         options.title ?? `[${event.eventType}] ${event.message}`,
    severity:      options.overrideSeverity ?? severity,
    reportedBy:    options.reportedBy ?? 'observability-system',
    description:   event.message,
    clientId:      event.clientId,
    projectId:     event.projectId,
    correlationId: event.correlationId,
    sourceEventId: event.eventId,
    service:       event.service,
    component:     event.component,
    environment:   event.environment,
    impact:        options.impact ?? (event.severity === SEVERITY.CRITICAL ? 'high' : 'medium'),
  };

  return {
    valid:          true,
    eligible:       true,
    incidentParams,
    recommendedSeverity: severity,
    disclaimer:     'Call createIncident(incidentParams) from sop/incidentManagement.js to create the incident.',
  };
}

/**
 * Evaluate a batch of events and return those that should become incidents.
 * Deduplicates by correlationId to avoid incident storms.
 */
export function evaluateIncidentCandidates(events = []) {
  if (!Array.isArray(events)) return { valid: false, error: 'events must be array' };

  const seen = new Set();
  const candidates = [];

  for (const event of events) {
    if (!isIncidentEligibleEvent(event)) continue;
    const dedupeKey = event.correlationId ?? event.eventId;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const result = observabilityEventToIncident(event);
    if (result.valid) candidates.push({ event, incidentParams: result.incidentParams });
  }

  return {
    valid:          true,
    total:          events.length,
    candidates:     candidates.length,
    incidentList:   candidates,
    disclaimer:     'Human review required before calling createIncident().',
  };
}

export const INCIDENT_BRIDGE_VERSION = '1.0.0';
