// Good Routing Fixtures — ADV-16
// 8 valid routing scenarios.

export const FIXTURE_ROUTE_SIMPLE_SUPPORT = Object.freeze({
  id: 'route-simple-support',
  scenario: 'Simple customer support → balanced routing',
  request: Object.freeze({ taskType: 'CUSTOMER_SUPPORT', qualityTarget: 'STANDARD', costSensitivity: 'MEDIUM' }),
  expectedMode: 'BALANCED',
  expectedQuality: 'STANDARD',
  isReal: false,
});

export const FIXTURE_ROUTE_HIGH_RISK = Object.freeze({
  id: 'route-high-risk',
  scenario: 'High-risk factual task → quality-first routing',
  request: Object.freeze({ taskType: 'FACTUAL_HIGH_RISK', qualityTarget: 'CRITICAL', costSensitivity: 'LOW' }),
  expectedMode: 'QUALITY_FIRST',
  expectedQuality: 'PREMIUM',
  isReal: false,
});

export const FIXTURE_ROUTE_PRIVACY_SENSITIVE = Object.freeze({
  id: 'route-privacy-sensitive',
  scenario: 'Privacy-sensitive data → local or approved provider',
  request: Object.freeze({ taskType: 'SIMPLE_CHAT', privacyLevel: 'RESTRICTED', localPreference: true }),
  expectedMode: 'LOCAL_FIRST',
  expectedProvider: 'local',
  isReal: false,
});

export const FIXTURE_ROUTE_FAST_VOICE = Object.freeze({
  id: 'route-fast-voice',
  scenario: 'Fast voice planning → latency-optimized routing',
  request: Object.freeze({ taskType: 'VOICE_PLANNING', latencyTarget: 'LOW', modelAlias: 'FAST' }),
  expectedMode: 'LATENCY_FIRST',
  expectedAlias: 'FAST',
  isReal: false,
});

export const FIXTURE_ROUTE_CODING = Object.freeze({
  id: 'route-coding',
  scenario: 'Coding task → coding-capable model',
  request: Object.freeze({ taskType: 'CODING', requiredCapabilities: ['CODING','TOOLS'], qualityTarget: 'HIGH' }),
  expectedCapabilities: ['CODING'],
  isReal: false,
});

export const FIXTURE_ROUTE_VISION = Object.freeze({
  id: 'route-vision',
  scenario: 'Vision task → vision-capable model required',
  request: Object.freeze({ taskType: 'STRUCTURED_EXTRACTION', requiresVision: true }),
  expectedVision: true,
  isReal: false,
});

export const FIXTURE_ROUTE_CHEAP_BATCH = Object.freeze({
  id: 'route-cheap-batch',
  scenario: 'Social copy batch → cost-aware routing',
  request: Object.freeze({ taskType: 'SOCIAL_COPY', costSensitivity: 'HIGH', modelAlias: 'CHEAP' }),
  expectedMode: 'COST_FIRST',
  expectedCostClass: 'VERY_LOW',
  isReal: false,
});

export const FIXTURE_ROUTE_PROVIDER_DOWN_FALLBACK = Object.freeze({
  id: 'route-fallback',
  scenario: 'Primary provider down → valid fallback activated',
  request: Object.freeze({ taskType: 'SIMPLE_CHAT', fallbackAllowed: true }),
  primaryDown: true,
  expectedFallback: true,
  isReal: false,
});

export const ALL_GOOD_ROUTING_FIXTURES = Object.freeze([
  FIXTURE_ROUTE_SIMPLE_SUPPORT,
  FIXTURE_ROUTE_HIGH_RISK,
  FIXTURE_ROUTE_PRIVACY_SENSITIVE,
  FIXTURE_ROUTE_FAST_VOICE,
  FIXTURE_ROUTE_CODING,
  FIXTURE_ROUTE_VISION,
  FIXTURE_ROUTE_CHEAP_BATCH,
  FIXTURE_ROUTE_PROVIDER_DOWN_FALLBACK,
]);

export const GOOD_ROUTING_FIXTURES_VERSION = '1.0.0';
