// Container Test Profile — ADV-15

export const TEST_SCOPE = Object.freeze({
  UNIT:        'UNIT',
  INTEGRATION: 'INTEGRATION',
  PLAYWRIGHT:  'PLAYWRIGHT',
  ALL:         'ALL',
});

export function createContainerTestProfile(config = {}) {
  const scope = config.scope ?? TEST_SCOPE.UNIT;

  return Object.freeze({
    scope,
    port:             5180,
    environment:      'TEST',
    nodeEnv:          'test',
    buildCommand:     config.buildCommand  ?? 'npm run build',
    testCommand:      config.testCommand   ?? 'npm test',
    playwrightReady:  scope === TEST_SCOPE.PLAYWRIGHT || scope === TEST_SCOPE.ALL,
    optimizedFor:     Object.freeze([scope]),
    ephemeral:        true,
    noProductionData: true,
    isReal:           false,
  });
}

export const CONTAINER_TEST_PROFILE_VERSION = '1.0.0';
