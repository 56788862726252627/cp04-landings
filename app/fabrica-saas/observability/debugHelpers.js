// Debug Helpers — ADV-01 Transversal Observability
// Query and timeline helpers for correlation tracing and incident diagnosis.

import { SEVERITY } from './eventModel.js';

/**
 * Get recent CRITICAL events from a list (most recent first).
 */
export function getRecentCriticalEvents(events, { limit = 20 } = {}) {
  if (!Array.isArray(events)) return [];
  return events
    .filter(e => e.severity === SEVERITY.CRITICAL)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, limit);
}

/**
 * Get health summary for a specific project.
 * @param {array} events
 * @param {string} projectId
 */
export function getProjectHealth(events, projectId) {
  if (!Array.isArray(events) || !projectId) return null;
  const projectEvents = events.filter(e => e.projectId === projectId);
  if (projectEvents.length === 0) return { projectId, status: 'NO_DATA', events: 0 };

  const criticals = projectEvents.filter(e => e.severity === SEVERITY.CRITICAL).length;
  const errors    = projectEvents.filter(e => e.severity === SEVERITY.ERROR).length;
  const failures  = projectEvents.filter(e => e.status === 'FAILURE').length;

  const status = criticals > 0 ? 'CRITICAL' :
                 errors    > 2 ? 'DEGRADED'  :
                 failures  > 5 ? 'AT_RISK'   : 'HEALTHY';

  return {
    projectId,
    status,
    events:    projectEvents.length,
    criticals,
    errors,
    failures,
    lastEvent: projectEvents.sort((a, b) => a.timestamp < b.timestamp ? 1 : -1)[0] ?? null,
  };
}

/**
 * Get health summary for a specific client.
 */
export function getClientHealth(events, clientId) {
  if (!Array.isArray(events) || !clientId) return null;
  const clientEvents = events.filter(e => e.clientId === clientId);
  if (clientEvents.length === 0) return { clientId, status: 'NO_DATA', events: 0 };

  const criticals = clientEvents.filter(e => e.severity === SEVERITY.CRITICAL).length;
  const errors    = clientEvents.filter(e => e.severity === SEVERITY.ERROR).length;
  const failures  = clientEvents.filter(e => e.status === 'FAILURE').length;

  const status = criticals > 0 ? 'CRITICAL' :
                 errors    > 2 ? 'DEGRADED'  :
                 failures  > 5 ? 'AT_RISK'   : 'HEALTHY';

  return {
    clientId,
    status,
    events:    clientEvents.length,
    criticals,
    errors,
    failures,
    lastEvent: clientEvents.sort((a, b) => a.timestamp < b.timestamp ? 1 : -1)[0] ?? null,
  };
}

/**
 * Get all events with a given correlationId, sorted chronologically.
 * This is the "trace timeline" for a single user operation.
 */
export function getCorrelationTimeline(events, correlationId) {
  if (!Array.isArray(events) || !correlationId) return [];
  return events
    .filter(e => e.correlationId === correlationId)
    .sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
    .map((e, idx) => ({
      step:       idx + 1,
      timestamp:  e.timestamp,
      severity:   e.severity,
      service:    e.service,
      component:  e.component,
      status:     e.status,
      message:    e.message,
      durationMs: e.durationMs,
      errorCategory: e.errorCategory,
    }));
}

/**
 * Get error events for a specific service.
 */
export function getServiceErrors(events, service, { limit = 50 } = {}) {
  if (!Array.isArray(events) || !service) return [];
  return events
    .filter(e => e.service === service && (e.severity === SEVERITY.ERROR || e.severity === SEVERITY.CRITICAL))
    .sort((a, b) => a.timestamp < b.timestamp ? 1 : -1)
    .slice(0, limit);
}

/**
 * Get a human-readable failure summary across all events.
 */
export function getFailureSummary(events) {
  if (!Array.isArray(events)) return null;

  const failures  = events.filter(e => e.status === 'FAILURE');
  const criticals = events.filter(e => e.severity === SEVERITY.CRITICAL);
  const errors    = events.filter(e => e.severity === SEVERITY.ERROR);

  const byCategory = {};
  for (const e of [...failures, ...errors]) {
    const cat = e.errorCategory ?? 'UNKNOWN';
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  return {
    totalEvents:    events.length,
    totalFailures:  failures.length,
    totalCriticals: criticals.length,
    totalErrors:    errors.length,
    failureRate:    events.length > 0 ? parseFloat((failures.length / events.length).toFixed(4)) : 0,
    byCategory,
    topCategory:    topCategory ? { category: topCategory[0], count: topCategory[1] } : null,
    humanActions:   events.filter(e => e.humanActionRequired).length,
  };
}

export const DEBUG_HELPERS_VERSION = '1.0.0';
