// Lead Engine Registry — ADV-08

export const LEAD_ENGINE_REGISTRY = Object.freeze({
  version:        '1.0.0',
  adv:            '08',
  description:    'Lead discovery, enrichment, scoring and prioritization engine for Agency IA',
  apifyMode:      'FIXTURE_MODE',
  realRunEnabled: false,

  models: Object.freeze([
    'Lead', 'LeadSource', 'LeadSearchProfile', 'LeadDiscoveryPlan',
  ]),

  modules: Object.freeze([
    // Core
    'leadModel', 'leadSearchProfile', 'discoveryPlan',
    // Pipeline
    'normalizationEngine', 'deduplicationEngine', 'dataQualityEngine',
    // Signals
    'digitalMaturityAnalyzer', 'painSignalDetector', 'serviceMatcher',
    // Scoring
    'fitScore', 'urgencyScore', 'valueScore', 'easeScore', 'opportunityScore',
    // Classification
    'temperatureClassifier', 'commercialProbability', 'economicPotential',
    // Prioritization & analysis
    'leadPrioritizer', 'scoreExplainer', 'nextBestAction',
    // Segmentation
    'segmentation', 'fastWinDetector', 'highValueDetector',
    // Report
    'leadEngineReport',
    // Policy
    'privacyPolicy', 'freshnessPolicy', 'costGuard', 'ratePolicy',
    // Agency
    'agencyBridge',
  ]),

  moduleCount: 30,

  providers: Object.freeze([
    'LeadDiscoveryProvider',
    'ApifyLeadProvider',
    'FixtureProvider',
    'ManualImportProvider',
  ]),

  bridges: Object.freeze([
    'agentEngineBridge',
    'personalizationContext',
    'outreachDraftContext',
    'crmBridge',
    'makeBridge',
    'observabilityBridge',
  ]),

  fixtures: Object.freeze([
    'businessFixtures',
    'apifyFixture',
  ]),

  fixtureLeads:  30,
  apifyFixtureItems: 6,

  guardrails: Object.freeze({
    isReal:            false,
    realRunEnabled:    false,
    noRealOutreach:    true,
    noRealSpend:       true,
    noRealScraping:    true,
    dataMinimization:  true,
    purposeLimitation: true,
    sourceAttribution: true,
  }),

  connectedAdv: Object.freeze(['ADV-01', 'ADV-03']),
  futureAdv:    Object.freeze(['ADV-09']),
});

export const LEAD_ENGINE_REGISTRY_VERSION = '1.0.0';
