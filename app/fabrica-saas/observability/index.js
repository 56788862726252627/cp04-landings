// Observability — ADV-01 Transversal Observability
// Central re-export for all observability modules.

export * from './eventModel.js';
export * from './severityModel.js';
export * from './redactionEngine.js';
export * from './structuredLogger.js';
export * from './correlationContext.js';
export * from './errorNormalizer.js';
export * from './observabilityStore.js';
export * from './metricsEngine.js';
export * from './healthAggregator.js';
export * from './alertEngine.js';
export * from './incidentBridge.js';
export * from './automationObservability.js';
export * from './aiObservability.js';
export * from './deployObservability.js';
export * from './securityObservability.js';
export * from './clientIsolation.js';
export * from './dashboardModel.js';
export * from './debugHelpers.js';
export * from './retentionPolicy.js';
export * from './nexoFixture.js';
export * from './failureScenarios.js';

export const OBSERVABILITY_VERSION = '1.0.0';
export const OBSERVABILITY_MODULES = Object.freeze([
  'eventModel', 'severityModel', 'redactionEngine', 'structuredLogger',
  'correlationContext', 'errorNormalizer', 'observabilityStore', 'metricsEngine',
  'healthAggregator', 'alertEngine', 'incidentBridge', 'automationObservability',
  'aiObservability', 'deployObservability', 'securityObservability', 'clientIsolation',
  'dashboardModel', 'debugHelpers', 'retentionPolicy', 'nexoFixture', 'failureScenarios',
]);
