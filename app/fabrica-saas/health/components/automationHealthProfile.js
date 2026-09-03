// Automation Health Profile — ADV-20 (Make/MCP/other engines; DRY_RUN mode)

export const AUTOMATION_ENGINE = Object.freeze({
  MAKE:    'MAKE',
  MCP:     'MCP',
  AGENT:   'AGENT',
  VOICE:   'VOICE',
  BROWSER: 'BROWSER',
});

export const AUTOMATION_HEALTH_STATUS = Object.freeze({
  OPERATIONAL: 'OPERATIONAL',
  DEGRADED:    'DEGRADED',
  FAILING:     'FAILING',
  INACTIVE:    'INACTIVE',
  UNKNOWN:     'UNKNOWN',
});

export function createAutomationHealthProfile(config = {}) {
  const { engines = [], dryRun = true } = config;

  const engineStatuses = engines.map(e => Object.freeze({
    engine: e.engine,
    status: e.status ?? AUTOMATION_HEALTH_STATUS.UNKNOWN,
    lastRunStatus: e.lastRunStatus ?? null,
    errorCount: e.errorCount ?? 0,
    successRate: e.successRate ?? null,
  }));

  const failingEngines = engineStatuses.filter(e => e.status === AUTOMATION_HEALTH_STATUS.FAILING);
  const degradedEngines = engineStatuses.filter(e => e.status === AUTOMATION_HEALTH_STATUS.DEGRADED);

  const overallStatus = failingEngines.length > 0
    ? AUTOMATION_HEALTH_STATUS.FAILING
    : degradedEngines.length > 0
      ? AUTOMATION_HEALTH_STATUS.DEGRADED
      : engines.length === 0
        ? AUTOMATION_HEALTH_STATUS.INACTIVE
        : AUTOMATION_HEALTH_STATUS.OPERATIONAL;

  return Object.freeze({
    engines: Object.freeze(engineStatuses),
    overallStatus,
    failingEngines: Object.freeze(failingEngines.map(e => e.engine)),
    dryRun,
    noRealScenario: true,
    isReal: false,
  });
}

export const AUTOMATION_HEALTH_PROFILE_VERSION = '1.0.0';
