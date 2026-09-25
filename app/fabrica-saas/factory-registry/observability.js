// Paso ADV-01 — Transversal Observability Registry Barrel

export {
  SEVERITY,
  EVENT_TYPE,
  ENV,
  SERVICE,
  EVENT_STATUS,
  OBSERVABILITY_EVENT_VERSION,
  createObservabilityEvent,
} from '../observability/eventModel.js';

export {
  SEVERITY_WEIGHTS,
  ELEVATION_RULES,
  SEVERITY_MODEL_VERSION,
  evaluateSeverity,
  compareSeverity,
} from '../observability/severityModel.js';

export {
  REDACTED,
  REDACTION_ENGINE_VERSION,
  redactSensitiveData,
  containsSecret,
  auditMetadataForSecrets,
} from '../observability/redactionEngine.js';

export {
  LOG_ADAPTER_TYPE,
  STRUCTURED_LOGGER_VERSION,
  createLogger,
} from '../observability/structuredLogger.js';

export {
  OPERATION_STATUS,
  CORRELATION_CONTEXT_VERSION,
  createCorrelationContext,
} from '../observability/correlationContext.js';

export {
  ERROR_CATEGORY,
  RECOVERABLE_CATEGORIES,
  ERROR_NORMALIZER_VERSION,
  normalizeError,
  toUserMessage,
} from '../observability/errorNormalizer.js';

export {
  STORE_ADAPTER_TYPE,
  OBSERVABILITY_STORE_VERSION,
  createObservabilityStore,
} from '../observability/observabilityStore.js';

export {
  METRICS_ENGINE_VERSION,
  calculateObservabilityMetrics,
  compareMetrics,
} from '../observability/metricsEngine.js';

export {
  SYSTEM_HEALTH_STATUS,
  HEALTH_FACTORS,
  HEALTH_AGGREGATOR_VERSION,
  calculateSystemHealth,
  buildFactorsFromExistingModules,
} from '../observability/healthAggregator.js';

export {
  ALERT_LEVEL,
  ALERT_CHANNEL,
  ALERT_RULE_ID,
  DEFAULT_ALERT_RULES,
  ALERT_ENGINE_VERSION,
  evaluateAlerts,
  createAlertChannelAdapter,
} from '../observability/alertEngine.js';

export {
  INCIDENT_BRIDGE_VERSION,
  isIncidentEligibleEvent,
  observabilityEventToIncident,
  evaluateIncidentCandidates,
} from '../observability/incidentBridge.js';

export {
  AUTOMATION_EVENT_TYPE,
  SCENARIO_STATUS,
  AUTOMATION_OBSERVABILITY_VERSION,
  createAutomationEvent,
  createWebhookEvent,
} from '../observability/automationObservability.js';

export {
  AI_PROVIDER,
  MODEL_TIER,
  AI_EVENT_TYPE,
  AI_OBSERVABILITY_VERSION,
  createAIEvent,
  createLangfuseTraceStub,
} from '../observability/aiObservability.js';

export {
  DEPLOY_RESULT,
  DEPLOY_ENVIRONMENT,
  DEPLOY_OBSERVABILITY_VERSION,
  createDeployEvent,
} from '../observability/deployObservability.js';

export {
  SECURITY_EVENT_TYPE,
  SECURITY_SEVERITY_MAP,
  SECURITY_OBSERVABILITY_VERSION,
  createSecurityEvent,
} from '../observability/securityObservability.js';

export {
  ISOLATION_VIOLATION_CODE,
  CLIENT_ISOLATION_VERSION,
  assertClientIsolation,
  filterEventsByClient,
  validateClientIsolation,
  createClientScope,
} from '../observability/clientIsolation.js';

export {
  DASHBOARD_VERSION,
  DASHBOARD_MODEL_VERSION,
  buildDashboardModel,
} from '../observability/dashboardModel.js';

export {
  DEBUG_HELPERS_VERSION,
  getRecentCriticalEvents,
  getProjectHealth,
  getClientHealth,
  getCorrelationTimeline,
  getServiceErrors,
  getFailureSummary,
} from '../observability/debugHelpers.js';

export {
  RETENTION_ENVIRONMENT,
  EVENT_RETENTION_DAYS,
  RETENTION_POLICY_VERSION,
  createRetentionPolicy,
  shouldStoreEvent,
  getRetentionExpiry,
} from '../observability/retentionPolicy.js';

export {
  NEXO_CLIENT,
  simulateSuccessfulRequest,
  simulateAPITimeout,
  simulateAutomationFailure,
  simulateAIFallback,
  simulateSecurityWarning,
  simulateDeployFailure,
  runNexoObservabilityScenarios,
} from '../observability/nexoFixture.js';

export {
  FAILURE_SCENARIO,
  FAILURE_SCENARIOS_VERSION,
  runNetworkTimeoutScenario,
  runRateLimitScenario,
  runDatabaseFailureScenario,
  runAutomationFailureScenario,
  runAIProviderFailureScenario,
  runFallbackSuccessScenario,
  runSecurityEventScenario,
  runDeployFailureScenario,
  runRuntimeFailureScenario,
  runRepeatedErrorsScenario,
  runCrossClientAccessScenario,
  runSecretInMetadataScenario,
  runAllFailureScenarios,
} from '../observability/failureScenarios.js';

export const PASO_ADV01_STATUS = '100_PERCENT';
