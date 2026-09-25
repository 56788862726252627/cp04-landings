// Container Release Strategy — ADV-15

export const RELEASE_STRATEGY = Object.freeze({
  RECREATE:         'RECREATE',
  ROLLING:          'ROLLING',
  BLUE_GREEN:       'BLUE_GREEN',
  CANARY_FOUNDATION: 'CANARY_FOUNDATION',
});

const STRATEGY_META = Object.freeze({
  [RELEASE_STRATEGY.RECREATE]: {
    downtime: true,
    complexity: 'LOW',
    recommended: 'dev/staging',
    description: 'Stop old, start new — simple, has downtime',
  },
  [RELEASE_STRATEGY.ROLLING]: {
    downtime: false,
    complexity: 'MEDIUM',
    recommended: 'production',
    description: 'Replace instances gradually — no downtime',
  },
  [RELEASE_STRATEGY.BLUE_GREEN]: {
    downtime: false,
    complexity: 'HIGH',
    recommended: 'production-critical',
    description: 'Parallel environments, instant switch',
  },
  [RELEASE_STRATEGY.CANARY_FOUNDATION]: {
    downtime: false,
    complexity: 'HIGH',
    recommended: 'production-advanced',
    description: 'Route partial traffic to new version — ADV-15 foundation only',
  },
});

export function createContainerReleaseStrategy(config = {}) {
  const strategy = config.strategy ?? RELEASE_STRATEGY.RECREATE;

  if (!RELEASE_STRATEGY[strategy]) {
    throw new Error(`createContainerReleaseStrategy: unknown strategy '${strategy}'`);
  }

  const meta = STRATEGY_META[strategy];

  return Object.freeze({
    strategy,
    ...meta,
    noRealInfrastructure: true,
    isReal:               false,
  });
}

export const CONTAINER_RELEASE_STRATEGY_VERSION = '1.0.0';
