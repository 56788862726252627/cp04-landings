// Dashboard Model — ADV-01 Transversal Observability
// Data model for the future observability dashboard.
// No UI here — pure data structure. Dashboard UI is a separate improvement.

import { SYSTEM_HEALTH_STATUS } from './healthAggregator.js';
import { ALERT_LEVEL } from './alertEngine.js';

export const DASHBOARD_VERSION = '1.0.0';

/**
 * Build a dashboard model from observability data.
 * All fields are safe to serialize and render.
 */
export function buildDashboardModel({
  healthResult    = null,
  metrics         = null,
  alertResult     = null,
  recentEvents    = [],
  incidents       = [],
  deployStatus    = null,
  automationStatus = null,
  aiStatus        = null,
  securityStatus  = null,
  clientId        = null,
  projectId       = null,
} = {}) {

  const overallHealth = healthResult?.overallStatus ?? SYSTEM_HEALTH_STATUS.UNKNOWN;
  const alertLevel    = alertResult?.overallLevel   ?? ALERT_LEVEL.NO_ALERT;

  const criticalEvents = recentEvents.filter(e => e.severity === 'CRITICAL');
  const errorEvents    = recentEvents.filter(e => e.severity === 'ERROR');

  const activeIncidents = incidents.filter(i =>
    i.status !== 'RESOLVED' && i.status !== 'CLOSED' && i.status !== 'POSTMORTEM'
  );

  const model = Object.freeze({
    modelVersion:    DASHBOARD_VERSION,
    generatedAt:     new Date().toISOString(),
    clientId:        clientId ?? 'all',
    projectId:       projectId ?? 'all',

    summary: Object.freeze({
      overallHealth,
      healthPercent:   healthResult?.healthPercent ?? null,
      alertLevel,
      hasAlerts:       alertResult?.hasAlerts ?? false,
      hasCritical:     alertResult?.hasCritical ?? false,
      activeIncidents: activeIncidents.length,
      criticalEvents:  criticalEvents.length,
      errorEvents:     errorEvents.length,
      requiresIntervention: healthResult?.requiresIntervention ?? false,
    }),

    metrics: Object.freeze({
      totalEvents:     metrics?.totalEvents        ?? null,
      errorRate:       metrics?.errorRatePercent   ?? null,
      errorRateRaw:    metrics?.errorRate          ?? null,
      successCount:    metrics?.successCount       ?? null,
      failureCount:    metrics?.failureCount       ?? null,
      criticalCount:   metrics?.criticalCount      ?? null,
      averageDuration: metrics?.averageDuration    ?? null,
      p95Duration:     metrics?.p95Duration        ?? null,
      recoveryRate:    metrics?.recoveryRate       ?? null,
      humanActions:    metrics?.humanActionCount   ?? null,
    }),

    services: Object.freeze({
      frontend:    healthResult?.factors?.frontend    ?? null,
      api:         healthResult?.factors?.api         ?? null,
      database:    healthResult?.factors?.database    ?? null,
      automation:  healthResult?.factors?.automation  ?? null,
      ai:          healthResult?.factors?.ai          ?? null,
      integrations:healthResult?.factors?.integrations?? null,
      deploy:      healthResult?.factors?.deploy      ?? null,
      security:    healthResult?.factors?.security    ?? null,
    }),

    alerts: Object.freeze({
      level:    alertLevel,
      triggered: alertResult?.triggered ?? [],
      count:    alertResult?.triggeredCount ?? 0,
    }),

    recentIncidents: Object.freeze(
      activeIncidents.slice(0, 5).map(i => ({
        incidentId: i.incidentId,
        title:      i.title,
        severity:   i.severity,
        status:     i.status,
        reportedAt: i.reportedAt,
      }))
    ),

    deployStatus: deployStatus ?? null,
    automationStatus: automationStatus ?? null,
    aiStatus:         aiStatus         ?? null,
    securityStatus:   securityStatus   ?? null,

    recentErrors: Object.freeze(
      [...criticalEvents, ...errorEvents]
        .slice(0, 10)
        .map(e => ({
          eventId:   e.eventId,
          severity:  e.severity,
          message:   e.message,
          timestamp: e.timestamp,
          service:   e.service,
          component: e.component,
        }))
    ),
  });

  return { valid: true, model };
}

export const DASHBOARD_MODEL_VERSION = '1.0.0';
