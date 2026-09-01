// Lead Engine — ADV-08
// Barrel export: all modules, providers, bridges, fixtures

// ─── Core Model ──────────────────────────────────────────────────────────────
export { LEAD_STATUS, LEAD_TEMPERATURE, LEAD_SOURCE_TYPE, DUPLICATE_STATUS, createLead, createLeadSource, LEAD_MODEL_VERSION } from './leadModel.js';

// ─── Search Profile ───────────────────────────────────────────────────────────
export { BUSINESS_SIZE, SOURCE_PREFERENCE, createLeadSearchProfile, validateSearchProfile } from './leadSearchProfile.js';

// ─── Discovery Plan ───────────────────────────────────────────────────────────
export { PLAN_STATUS, buildLeadDiscoveryPlan } from './discoveryPlan.js';

// ─── Normalization ────────────────────────────────────────────────────────────
export { NORMALIZE_RESULT, normalizeLead } from './normalizationEngine.js';

// ─── Deduplication ────────────────────────────────────────────────────────────
export { deduplicateLeads } from './deduplicationEngine.js';

// ─── Data Quality ─────────────────────────────────────────────────────────────
export { DATA_QUALITY_LEVEL, calculateLeadDataQuality } from './dataQualityEngine.js';

// ─── Digital Maturity ─────────────────────────────────────────────────────────
export { DIGITAL_SIGNAL, DIGITAL_MATURITY_LEVEL, analyzeDigitalMaturity, inferDigitalSignals } from './digitalMaturityAnalyzer.js';

// ─── Pain Signals ─────────────────────────────────────────────────────────────
export { PAIN_SIGNAL_TYPE, PAIN_SEVERITY, createPainSignal, detectPainSignals } from './painSignalDetector.js';

// ─── Service Matcher ──────────────────────────────────────────────────────────
export { AGENCY_SERVICE, matchAgencyServices } from './serviceMatcher.js';

// ─── Scoring ──────────────────────────────────────────────────────────────────
export { calculateFitScore } from './fitScore.js';
export { calculateUrgencyScore } from './urgencyScore.js';
export { ESTIMATED_VALUE_LEVEL, calculateValueScore } from './valueScore.js';
export { calculateEaseScore } from './easeScore.js';
export { calculateOpportunityScore } from './opportunityScore.js';

// ─── Temperature ──────────────────────────────────────────────────────────────
export { classifyTemperature, classifyLeadTemperature } from './temperatureClassifier.js';

// ─── Commercial ───────────────────────────────────────────────────────────────
export { COMMERCIAL_PROBABILITY, estimateCommercialProbability } from './commercialProbability.js';
export { ECONOMIC_POTENTIAL_LEVEL, estimateEconomicPotential } from './economicPotential.js';

// ─── Prioritization ───────────────────────────────────────────────────────────
export { PRIORITY_FILTER, prioritizeLeads } from './leadPrioritizer.js';

// ─── Explainability ───────────────────────────────────────────────────────────
export { explainLeadScore } from './scoreExplainer.js';

// ─── Next Best Action ─────────────────────────────────────────────────────────
export { NEXT_ACTION, recommendNextBestAction } from './nextBestAction.js';

// ─── Segmentation ─────────────────────────────────────────────────────────────
export { SEGMENT, segmentLead, segmentLeads } from './segmentation.js';

// ─── Fast Win & High Value ────────────────────────────────────────────────────
export { detectFastWins } from './fastWinDetector.js';
export { detectHighValueOpportunities } from './highValueDetector.js';

// ─── Report ───────────────────────────────────────────────────────────────────
export { buildLeadEngineReport, calculateLeadEngineQualityScore } from './leadEngineReport.js';

// ─── Privacy & Freshness ──────────────────────────────────────────────────────
export { PRIVACY_PRINCIPLE, createLeadPrivacyPolicy, auditLeadPrivacy } from './privacyPolicy.js';
export { FRESHNESS_STATUS, createLeadFreshnessPolicy, evaluateLeadFreshness } from './freshnessPolicy.js';

// ─── Cost Guard & Rate Policy ─────────────────────────────────────────────────
export { createLeadProviderCostGuard, guardProviderRun } from './costGuard.js';
export { createLeadDiscoveryRatePolicy, checkRateAllowed } from './ratePolicy.js';

// ─── Providers ────────────────────────────────────────────────────────────────
export { PROVIDER_MODE, PROVIDER_STATUS, COST_STATUS, createProviderDescriptor } from './providers/leadDiscoveryProvider.js';
export { createApifyProviderConfig, validateApifyConfig, buildApifyInput, estimateApifyRunRisk, normalizeApifyResult, getApifyUsageEstimate } from './providers/apifyProvider.js';
export { createFixtureProvider, fetchFromFixtures } from './providers/fixtureProvider.js';
export { createManualImportProvider, validateManualImportRow, importManualLeads } from './providers/manualImportProvider.js';

// ─── Bridges ──────────────────────────────────────────────────────────────────
export { buildLeadContext, buildSalesPreparationContext } from './bridges/agentEngineBridge.js';
export { buildLeadPersonalizationContext } from './bridges/personalizationContext.js';
export { prepareOutreachDraftContext } from './bridges/outreachDraftContext.js';
export { CRM_STAGE, createLeadCRMRecord } from './bridges/crmBridge.js';
export { LEAD_AUTOMATION_EVENT, createLeadAutomationManifest } from './bridges/makeBridge.js';
export { LEAD_ENGINE_EVENT, emitLeadEvent, createLeadEngineLogger } from './bridges/observabilityBridge.js';
export { buildAgencyLeadContext } from './agencyBridge.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
export { BUSINESS_FIXTURES, FIXTURE_COUNT } from './fixtures/businessFixtures.js';
export { APIFY_FIXTURE_RESPONSE } from './fixtures/apifyFixture.js';
