// Nexo Client Fixture — ADV-01 Transversal Observability
// Clínica Veterinaria Nexo — fictional test client. All data is fake.

import { createObservabilityEvent, SEVERITY, EVENT_TYPE, EVENT_STATUS, SERVICE, ENV } from './eventModel.js';
import { createCorrelationContext } from './correlationContext.js';
import { createAutomationEvent } from './automationObservability.js';
import { createAIEvent, AI_PROVIDER, MODEL_TIER } from './aiObservability.js';
import { createDeployEvent, DEPLOY_RESULT, DEPLOY_ENVIRONMENT } from './deployObservability.js';
import { createSecurityEvent, SECURITY_EVENT_TYPE } from './securityObservability.js';
import { evaluateAlerts } from './alertEngine.js';
import { calculateObservabilityMetrics } from './metricsEngine.js';
import { calculateSystemHealth } from './healthAggregator.js';

export const NEXO_CLIENT = Object.freeze({
  clientId:     'NEXO-VET-001',
  businessName: 'Clínica Veterinaria Nexo',
  sector:       'veterinary',
  isReal:       false,
  dataType:     'FIXTURE',
  contact:      Object.freeze({
    name:  'Carlos García (FICTICIO)',
    email: 'carlos@nexo-vet.ficticio',
    phone: '+34-600-000-000 (FICTICIO)',
  }),
  environment:  ENV.TEST,
});

/**
 * Simulate a successful booking request flow.
 * Returns all events + correlation context.
 */
export function simulateSuccessfulRequest() {
  const { context } = createCorrelationContext({
    operation: 'book_appointment',
    clientId:  NEXO_CLIENT.clientId,
    projectId: 'nexo-vet-saas',
    source:    'web',
  });

  const events = [];
  const base = {
    clientId:  NEXO_CLIENT.clientId,
    projectId: 'nexo-vet-saas',
    environment: ENV.TEST,
    correlationId: context.correlationId,
  };

  events.push(createObservabilityEvent({ ...base, eventType: EVENT_TYPE.REQUEST, severity: SEVERITY.INFO, status: EVENT_STATUS.SUCCESS, message: 'Booking request received', service: SERVICE.FRONTEND, component: 'BookingForm' }).event);
  events.push(createObservabilityEvent({ ...base, eventType: EVENT_TYPE.AUTH, severity: SEVERITY.INFO, status: EVENT_STATUS.SUCCESS, message: 'User authenticated', service: SERVICE.AUTH, component: 'supabase-auth' }).event);
  events.push(createObservabilityEvent({ ...base, eventType: EVENT_TYPE.REQUEST, severity: SEVERITY.INFO, status: EVENT_STATUS.SUCCESS, message: 'Availability checked', service: SERVICE.DATABASE, component: 'supabase-query', durationMs: 45 }).event);
  events.push(createAutomationEvent({ ...base, scenarioId: 'MAKE-001', scenarioName: 'booking-confirmation', status: 'SUCCESS', durationMs: 1200, operations: 3 }).event);
  events.push(createAIEvent({ ...base, agentType: 'BOOKING_AGENT', provider: AI_PROVIDER.ANTHROPIC, modelTier: MODEL_TIER.FAST, success: true, latencyMs: 320, estimatedTokens: 450, estimatedCostEur: 0.0002 }).event);
  events.push(createObservabilityEvent({ ...base, eventType: EVENT_TYPE.RESPONSE, severity: SEVERITY.INFO, status: EVENT_STATUS.SUCCESS, message: 'Booking confirmed', service: SERVICE.API, component: 'worker', durationMs: 1800 }).event);

  return {
    client:   NEXO_CLIENT,
    context:  context.toMeta(),
    scenario: 'SUCCESSFUL_REQUEST',
    events:   events.filter(Boolean),
    isReal:   false,
  };
}

/**
 * Simulate an API timeout failure with recovery.
 */
export function simulateAPITimeout() {
  const { context } = createCorrelationContext({
    operation: 'sync_calendar',
    clientId:  NEXO_CLIENT.clientId,
    projectId: 'nexo-vet-saas',
    source:    'cron',
  });

  const base = { clientId: NEXO_CLIENT.clientId, projectId: 'nexo-vet-saas', environment: ENV.TEST, correlationId: context.correlationId };
  const events = [];

  events.push(createObservabilityEvent({ ...base, eventType: EVENT_TYPE.REQUEST, severity: SEVERITY.INFO, message: 'Calendar sync started', service: SERVICE.EXTERNAL, component: 'google-calendar' }).event);
  events.push(createObservabilityEvent({ ...base, eventType: EVENT_TYPE.ERROR, severity: SEVERITY.ERROR, status: EVENT_STATUS.FAILURE, message: 'Calendar API timeout after 30000ms', service: SERVICE.EXTERNAL, component: 'google-calendar', durationMs: 30000, errorCategory: 'TIMEOUT', retryCount: 1 }).event);
  events.push(createObservabilityEvent({ ...base, eventType: EVENT_TYPE.REQUEST, severity: SEVERITY.INFO, status: EVENT_STATUS.RECOVERED, message: 'Calendar sync retry succeeded', service: SERVICE.EXTERNAL, component: 'google-calendar', durationMs: 1200, retryCount: 1 }).event);

  return { client: NEXO_CLIENT, context: context.toMeta(), scenario: 'API_TIMEOUT', events: events.filter(Boolean), isReal: false };
}

/**
 * Simulate an automation failure.
 */
export function simulateAutomationFailure() {
  const { context } = createCorrelationContext({ operation: 'send_reminder', clientId: NEXO_CLIENT.clientId, projectId: 'nexo-vet-saas', source: 'make' });
  const base = { clientId: NEXO_CLIENT.clientId, projectId: 'nexo-vet-saas', environment: ENV.TEST, correlationId: context.correlationId };

  const events = [
    createAutomationEvent({ ...base, scenarioId: 'MAKE-002', scenarioName: 'appointment-reminder', status: 'FAILED', error: 'WhatsApp API rate limit (429)', retryCount: 3, durationMs: 500 }).event,
  ].filter(Boolean);

  return { client: NEXO_CLIENT, context: context.toMeta(), scenario: 'AUTOMATION_FAILURE', events, isReal: false };
}

/**
 * Simulate an AI fallback scenario.
 */
export function simulateAIFallback() {
  const { context } = createCorrelationContext({ operation: 'answer_query', clientId: NEXO_CLIENT.clientId, projectId: 'nexo-vet-saas', source: 'web' });
  const base = { clientId: NEXO_CLIENT.clientId, projectId: 'nexo-vet-saas', environment: ENV.TEST, correlationId: context.correlationId };

  const events = [
    createAIEvent({ ...base, agentType: 'CHAT_AGENT', provider: AI_PROVIDER.ANTHROPIC, modelTier: MODEL_TIER.FAST, success: false, error: 'Context window exceeded', fallbackUsed: true }).event,
    createAIEvent({ ...base, agentType: 'CHAT_AGENT', provider: AI_PROVIDER.ANTHROPIC, modelTier: MODEL_TIER.BALANCED, success: true, fallbackUsed: true, latencyMs: 800 }).event,
  ].filter(Boolean);

  return { client: NEXO_CLIENT, context: context.toMeta(), scenario: 'AI_FALLBACK', events, isReal: false };
}

/**
 * Simulate a security warning event.
 */
export function simulateSecurityWarning() {
  const { context } = createCorrelationContext({ operation: 'login_attempt', clientId: NEXO_CLIENT.clientId, projectId: 'nexo-vet-saas', source: 'web' });
  const base = { clientId: NEXO_CLIENT.clientId, projectId: 'nexo-vet-saas', environment: ENV.TEST, correlationId: context.correlationId };

  const events = [
    createSecurityEvent({ ...base, securityEventType: SECURITY_EVENT_TYPE.AUTH_FAILURE, message: 'Failed login attempt', userId: 'user-hashed-abc123', ipAddress: '192.168.1.xxx' }).event,
  ].filter(Boolean);

  return { client: NEXO_CLIENT, context: context.toMeta(), scenario: 'SECURITY_WARNING', events, isReal: false };
}

/**
 * Simulate a deploy failure.
 */
export function simulateDeployFailure() {
  const { context } = createCorrelationContext({ operation: 'deploy', clientId: NEXO_CLIENT.clientId, projectId: 'nexo-vet-saas', source: 'ci' });
  const base = { clientId: NEXO_CLIENT.clientId, projectId: 'nexo-vet-saas', environment: ENV.TEST, correlationId: context.correlationId };

  const now = new Date();
  const end  = new Date(now.getTime() + 120000);

  const events = [
    createDeployEvent({ ...base, releaseId: 'v1.2.3', commitSha: 'abc1234', environment: DEPLOY_ENVIRONMENT.STAGING, deployStart: now.toISOString(), deployEnd: end.toISOString(), result: DEPLOY_RESULT.QA_FAILED, runtimeCheckOk: false, error: 'E2E test failed: booking form not rendering' }).event,
  ].filter(Boolean);

  return { client: NEXO_CLIENT, context: context.toMeta(), scenario: 'DEPLOY_FAILURE', events, isReal: false };
}

/**
 * Run all Nexo scenarios and aggregate results.
 */
export function runNexoObservabilityScenarios() {
  const scenarios = [
    simulateSuccessfulRequest(),
    simulateAPITimeout(),
    simulateAutomationFailure(),
    simulateAIFallback(),
    simulateSecurityWarning(),
    simulateDeployFailure(),
  ];

  const allEvents = scenarios.flatMap(s => s.events);
  const metrics   = calculateObservabilityMetrics(allEvents);
  const alerts    = evaluateAlerts(allEvents, metrics);
  const health    = calculateSystemHealth({});

  return {
    client:          NEXO_CLIENT,
    totalScenarios:  scenarios.length,
    totalEvents:     allEvents.length,
    scenarios:       scenarios.map(s => ({ scenario: s.scenario, events: s.events.length })),
    metrics,
    alerts,
    health,
    isReal:          false,
    guardrails:      Object.freeze({
      noRealClients:       true,
      noRealPayments:      true,
      dryRunOnly:          true,
      noProductionChanges: true,
    }),
  };
}
