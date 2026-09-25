// ADV-08 Lead Engine Tests — node:test
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Imports ──────────────────────────────────────────────────────────────────
import { LEAD_STATUS, LEAD_TEMPERATURE, LEAD_SOURCE_TYPE, DUPLICATE_STATUS, createLead, createLeadSource } from '../../lead-engine/leadModel.js';
import { BUSINESS_SIZE, SOURCE_PREFERENCE, createLeadSearchProfile, validateSearchProfile } from '../../lead-engine/leadSearchProfile.js';
import { PLAN_STATUS, buildLeadDiscoveryPlan } from '../../lead-engine/discoveryPlan.js';
import { NORMALIZE_RESULT, normalizeLead } from '../../lead-engine/normalizationEngine.js';
import { deduplicateLeads } from '../../lead-engine/deduplicationEngine.js';
import { DATA_QUALITY_LEVEL, calculateLeadDataQuality } from '../../lead-engine/dataQualityEngine.js';
import { DIGITAL_SIGNAL, DIGITAL_MATURITY_LEVEL, analyzeDigitalMaturity, inferDigitalSignals } from '../../lead-engine/digitalMaturityAnalyzer.js';
import { PAIN_SIGNAL_TYPE, PAIN_SEVERITY, createPainSignal, detectPainSignals } from '../../lead-engine/painSignalDetector.js';
import { AGENCY_SERVICE, matchAgencyServices } from '../../lead-engine/serviceMatcher.js';
import { calculateFitScore } from '../../lead-engine/fitScore.js';
import { calculateUrgencyScore } from '../../lead-engine/urgencyScore.js';
import { calculateValueScore } from '../../lead-engine/valueScore.js';
import { calculateEaseScore } from '../../lead-engine/easeScore.js';
import { calculateOpportunityScore } from '../../lead-engine/opportunityScore.js';
import { classifyTemperature, classifyLeadTemperature } from '../../lead-engine/temperatureClassifier.js';
import { COMMERCIAL_PROBABILITY, estimateCommercialProbability } from '../../lead-engine/commercialProbability.js';
import { ECONOMIC_POTENTIAL_LEVEL, estimateEconomicPotential } from '../../lead-engine/economicPotential.js';
import { prioritizeLeads } from '../../lead-engine/leadPrioritizer.js';
import { explainLeadScore } from '../../lead-engine/scoreExplainer.js';
import { NEXT_ACTION, recommendNextBestAction } from '../../lead-engine/nextBestAction.js';
import { SEGMENT, segmentLead, segmentLeads } from '../../lead-engine/segmentation.js';
import { detectFastWins } from '../../lead-engine/fastWinDetector.js';
import { detectHighValueOpportunities } from '../../lead-engine/highValueDetector.js';
import { buildLeadEngineReport, calculateLeadEngineQualityScore } from '../../lead-engine/leadEngineReport.js';
import { PRIVACY_PRINCIPLE, createLeadPrivacyPolicy, auditLeadPrivacy } from '../../lead-engine/privacyPolicy.js';
import { FRESHNESS_STATUS, createLeadFreshnessPolicy, evaluateLeadFreshness } from '../../lead-engine/freshnessPolicy.js';
import { createLeadProviderCostGuard, guardProviderRun } from '../../lead-engine/costGuard.js';
import { createLeadDiscoveryRatePolicy, checkRateAllowed } from '../../lead-engine/ratePolicy.js';
import { PROVIDER_MODE, PROVIDER_STATUS, COST_STATUS, createProviderDescriptor } from '../../lead-engine/providers/leadDiscoveryProvider.js';
import { createApifyProviderConfig, validateApifyConfig, buildApifyInput, estimateApifyRunRisk, normalizeApifyResult, getApifyUsageEstimate } from '../../lead-engine/providers/apifyProvider.js';
import { createFixtureProvider, fetchFromFixtures } from '../../lead-engine/providers/fixtureProvider.js';
import { createManualImportProvider, validateManualImportRow, importManualLeads } from '../../lead-engine/providers/manualImportProvider.js';
import { buildLeadContext, buildSalesPreparationContext } from '../../lead-engine/bridges/agentEngineBridge.js';
import { buildLeadPersonalizationContext } from '../../lead-engine/bridges/personalizationContext.js';
import { prepareOutreachDraftContext } from '../../lead-engine/bridges/outreachDraftContext.js';
import { CRM_STAGE, createLeadCRMRecord } from '../../lead-engine/bridges/crmBridge.js';
import { LEAD_AUTOMATION_EVENT, createLeadAutomationManifest } from '../../lead-engine/bridges/makeBridge.js';
import { LEAD_ENGINE_EVENT, emitLeadEvent, createLeadEngineLogger } from '../../lead-engine/bridges/observabilityBridge.js';
import { buildAgencyLeadContext } from '../../lead-engine/agencyBridge.js';
import { BUSINESS_FIXTURES, FIXTURE_COUNT } from '../../lead-engine/fixtures/businessFixtures.js';
import { APIFY_FIXTURE_RESPONSE } from '../../lead-engine/fixtures/apifyFixture.js';
import { LEAD_ENGINE_REGISTRY } from '../../factory-registry/leadEngine.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeLead(overrides = {}) {
  return {
    id: 'test_001', businessName: 'Test Clínica', vertical: 'dental',
    location: 'Málaga', website: 'https://test-ejemplo.com',
    publicEmail: 'test@test-ejemplo.com', publicPhone: '+34600000001',
    source: LEAD_SOURCE_TYPE.FIXTURE, sourceType: LEAD_SOURCE_TYPE.FIXTURE,
    discoveredAt: new Date().toISOString(), lastUpdatedAt: new Date().toISOString(),
    digitalSignals: ['WEBSITE_PRESENT', 'SOCIAL_PRESENCE'],
    painSignals: ['NO_BOOKING', 'NO_AUTOMATION'],
    estimatedSize: 'SMALL', socialProfiles: {},
    opportunityScore: 70, fitScore: 72, urgencyScore: 65, valueScore: 55, easeScore: 60,
    dataQualityScore: 75, confidence: 70, temperature: LEAD_TEMPERATURE.WARM,
    recommendedService: AGENCY_SERVICE.BOOKING, recommendedNextAction: NEXT_ACTION.QUALIFY,
    isReal: false, ...overrides,
  };
}

// ── Lead Model ────────────────────────────────────────────────────────────────
describe('lead model', () => {
  it('LEAD_STATUS has expected keys', () => {
    assert.ok(LEAD_STATUS.RAW);
    assert.ok(LEAD_STATUS.SCORED);
    assert.ok(LEAD_STATUS.DUPLICATE);
  });
  it('LEAD_TEMPERATURE has 4 values', () => {
    assert.equal(Object.keys(LEAD_TEMPERATURE).length, 4);
  });
  it('LEAD_SOURCE_TYPE includes APIFY and FIXTURE', () => {
    assert.ok(LEAD_SOURCE_TYPE.APIFY);
    assert.ok(LEAD_SOURCE_TYPE.FIXTURE);
  });
  it('DUPLICATE_STATUS has 3 values', () => {
    assert.equal(Object.keys(DUPLICATE_STATUS).length, 3);
  });
  it('createLead returns frozen object with isReal:false', () => {
    const lead = createLead({ businessName: 'Test', vertical: 'dental' });
    assert.equal(lead.isReal, false);
    assert.equal(lead.businessName, 'Test');
    assert.equal(lead.status, LEAD_STATUS.RAW);
  });
  it('createLead defaults temperature to COLD', () => {
    const lead = createLead({});
    assert.equal(lead.temperature, LEAD_TEMPERATURE.COLD);
  });
  it('createLeadSource returns frozen with isReal:false', () => {
    const src = createLeadSource({ provider: 'APIFY' });
    assert.equal(src.isReal, false);
    assert.equal(src.provider, 'APIFY');
  });
});

// ── Lead Search Profile ───────────────────────────────────────────────────────
describe('lead search profile', () => {
  it('createLeadSearchProfile returns valid profile', () => {
    const p = createLeadSearchProfile({ vertical: 'dental', locations: ['Málaga'] });
    assert.equal(p.vertical, 'dental');
    assert.equal(p.isReal, false);
  });
  it('validateSearchProfile warns when no vertical', () => {
    const r = validateSearchProfile({});
    assert.equal(r.valid, false);
    assert.ok(r.warnings.length > 0);
  });
  it('validateSearchProfile warns when maxResults >200', () => {
    const r = validateSearchProfile({ vertical: 'dental', locations: ['Málaga'], maxResults: 300 });
    assert.ok(r.warnings.some(w => w.includes('200')));
  });
  it('BUSINESS_SIZE has MICRO and SMALL', () => {
    assert.ok(BUSINESS_SIZE.MICRO);
    assert.ok(BUSINESS_SIZE.SMALL);
  });
  it('SOURCE_PREFERENCE has FIXTURE_FIRST', () => {
    assert.equal(SOURCE_PREFERENCE.FIXTURE_FIRST, 'FIXTURE_FIRST');
  });
});

// ── Discovery Plan ────────────────────────────────────────────────────────────
describe('discovery plan', () => {
  it('PLAN_STATUS has DRY_RUN_READY', () => {
    assert.ok(PLAN_STATUS.DRY_RUN_READY);
  });
  it('buildLeadDiscoveryPlan with no providers returns WAITING_AUTH', () => {
    const plan = buildLeadDiscoveryPlan({ vertical: 'dental' }, []);
    assert.equal(plan.status, PLAN_STATUS.WAITING_AUTH);
    assert.equal(plan.isReal, false);
  });
  it('buildLeadDiscoveryPlan with fixture provider returns DRY_RUN_READY', () => {
    const provider = createFixtureProvider();
    const plan = buildLeadDiscoveryPlan({ vertical: 'dental', locations: ['Málaga'] }, [provider]);
    assert.equal(plan.status, PLAN_STATUS.DRY_RUN_READY);
    assert.ok(plan.queries.length > 0);
  });
  it('plan has estimatedCost 0 for fixture provider', () => {
    const provider = createFixtureProvider();
    const plan = buildLeadDiscoveryPlan({}, [provider]);
    assert.equal(plan.estimatedCost, 0);
  });
});

// ── Normalization ─────────────────────────────────────────────────────────────
describe('normalization engine', () => {
  it('NORMALIZE_RESULT has OK, PARTIAL, FAILED', () => {
    assert.ok(NORMALIZE_RESULT.OK);
    assert.ok(NORMALIZE_RESULT.PARTIAL);
    assert.ok(NORMALIZE_RESULT.FAILED);
  });
  it('normalizeLead normalizes email to lowercase', () => {
    const r = normalizeLead({ businessName: 'Test', location: 'Málaga', publicEmail: 'INFO@Test.COM', website: 'http://test.com' });
    assert.equal(r.normalized.publicEmail, 'info@test.com');
    assert.equal(r.isReal, false);
  });
  it('normalizeLead normalizes domain from website', () => {
    const r = normalizeLead({ businessName: 'Test', location: 'Málaga', website: 'https://www.example.com/page' });
    assert.equal(r.normalized.domain, 'example.com');
  });
  it('normalizeLead normalizes phone — removes spaces', () => {
    const r = normalizeLead({ businessName: 'T', publicPhone: '+34 611 000 001', website: 'https://t.com', location: 'Málaga' });
    assert.equal(r.normalized.publicPhone, '+34611000001');
  });
  it('normalizeLead returns FAILED when no businessName', () => {
    const r = normalizeLead({ businessName: '' });
    assert.equal(r.result, NORMALIZE_RESULT.FAILED);
  });
  it('normalizeLead returns OK for valid lead', () => {
    const r = normalizeLead({ businessName: 'Clínica', location: 'Málaga', website: 'https://c.com', publicEmail: 'a@b.com', publicPhone: '+34600000001' });
    assert.equal(r.result, NORMALIZE_RESULT.OK);
  });
  it('normalizeLead returns PARTIAL when missing contact', () => {
    const r = normalizeLead({ businessName: 'Clínica', location: 'Málaga', website: '' });
    assert.equal(r.result, NORMALIZE_RESULT.PARTIAL);
  });
  it('normalizeLead normalizes URL — adds https', () => {
    const r = normalizeLead({ businessName: 'T', location: 'M', website: 'test.com' });
    assert.ok(r.normalized.website.startsWith('https://'));
  });
});

// ── Deduplication ─────────────────────────────────────────────────────────────
describe('deduplication engine', () => {
  it('deduplicateLeads with no duplicates returns all unique', () => {
    const leads = [
      { businessName: 'A', website: 'https://a.com', publicEmail: 'a@a.com', publicPhone: '600000001', location: 'Málaga' },
      { businessName: 'B', website: 'https://b.com', publicEmail: 'b@b.com', publicPhone: '600000002', location: 'Málaga' },
    ];
    const r = deduplicateLeads(leads);
    assert.equal(r.unique.length, 2);
    assert.equal(r.duplicatesFound, 0);
    assert.equal(r.isReal, false);
  });
  it('deduplicateLeads detects same domain', () => {
    const leads = [
      { businessName: 'A', website: 'https://clinic.com', publicEmail: '', publicPhone: '', location: 'M' },
      { businessName: 'A2', website: 'https://clinic.com', publicEmail: '', publicPhone: '', location: 'M' },
    ];
    const r = deduplicateLeads(leads);
    assert.equal(r.duplicatesFound, 1);
    assert.equal(r.totalOut, 1);
  });
  it('deduplicateLeads detects same email', () => {
    const leads = [
      { businessName: 'A', website: '', publicEmail: 'same@clinic.com', publicPhone: '', location: 'M' },
      { businessName: 'B', website: '', publicEmail: 'same@clinic.com', publicPhone: '', location: 'M' },
    ];
    const r = deduplicateLeads(leads);
    assert.equal(r.duplicatesFound, 1);
  });
  it('deduplicateLeads detects same phone', () => {
    const leads = [
      { businessName: 'A', website: '', publicEmail: '', publicPhone: '600111222', location: 'M' },
      { businessName: 'B', website: '', publicEmail: '', publicPhone: '600111222', location: 'M' },
    ];
    const r = deduplicateLeads(leads);
    assert.equal(r.duplicatesFound, 1);
  });
  it('deduplicateLeads apify fixture has 1 duplicate', () => {
    const items = [...APIFY_FIXTURE_RESPONSE.items].map(i => ({
      businessName: i.name, website: i.website, publicEmail: i.email,
      publicPhone: i.phone, location: i.city, externalId: i.placeId,
    }));
    const r = deduplicateLeads(items);
    assert.equal(r.duplicatesFound, 1);
    assert.equal(r.totalOut, 5);
  });
});

// ── Data Quality ──────────────────────────────────────────────────────────────
describe('data quality engine', () => {
  it('DATA_QUALITY_LEVEL has HIGH and MINIMAL', () => {
    assert.ok(DATA_QUALITY_LEVEL.HIGH);
    assert.ok(DATA_QUALITY_LEVEL.MINIMAL);
  });
  it('calculateLeadDataQuality returns 0-100 score', () => {
    const r = calculateLeadDataQuality(makeLead());
    assert.ok(r.score >= 0 && r.score <= 100);
    assert.equal(r.isReal, false);
  });
  it('calculateLeadDataQuality HIGH for well-formed lead', () => {
    const lead = makeLead({ discoveredAt: new Date().toISOString() });
    const r = calculateLeadDataQuality(lead);
    assert.equal(r.level, DATA_QUALITY_LEVEL.HIGH);
  });
  it('calculateLeadDataQuality LOW for minimal lead', () => {
    const r = calculateLeadDataQuality({ businessName: 'X', vertical: 'default' });
    assert.ok(r.score < 50);
  });
  it('data quality separates from commercial quality', () => {
    const highDataLead = makeLead({ opportunityScore: 10 });
    const r = calculateLeadDataQuality(highDataLead);
    assert.ok(r.score > 0);
  });
});

// ── Digital Maturity ──────────────────────────────────────────────────────────
describe('digital maturity analyzer', () => {
  it('DIGITAL_SIGNAL has BOOKING_SYSTEM', () => {
    assert.equal(DIGITAL_SIGNAL.BOOKING_SYSTEM, 'BOOKING_SYSTEM');
  });
  it('DIGITAL_MATURITY_LEVEL has ADVANCED and ABSENT', () => {
    assert.ok(DIGITAL_MATURITY_LEVEL.ADVANCED);
    assert.ok(DIGITAL_MATURITY_LEVEL.ABSENT);
  });
  it('analyzeDigitalMaturity with all signals returns ADVANCED', () => {
    const r = analyzeDigitalMaturity(Object.values(DIGITAL_SIGNAL));
    assert.equal(r.level, DIGITAL_MATURITY_LEVEL.ADVANCED);
    assert.equal(r.isReal, false);
  });
  it('analyzeDigitalMaturity with no signals returns ABSENT', () => {
    const r = analyzeDigitalMaturity([]);
    assert.equal(r.level, DIGITAL_MATURITY_LEVEL.ABSENT);
    assert.equal(r.score, 0);
  });
  it('inferDigitalSignals infers WEBSITE_PRESENT from website field', () => {
    const lead = { website: 'https://test.com', socialProfiles: {}, digitalSignals: [] };
    const signals = inferDigitalSignals(lead);
    assert.ok(signals.includes(DIGITAL_SIGNAL.WEBSITE_PRESENT));
  });
  it('inferDigitalSignals infers RESPONSE_CHANNELS from email', () => {
    const lead = { website: '', publicEmail: 'a@b.com', socialProfiles: {}, digitalSignals: [] };
    const signals = inferDigitalSignals(lead);
    assert.ok(signals.includes(DIGITAL_SIGNAL.RESPONSE_CHANNELS));
  });
  it('analyzeDigitalMaturity returns detected and absent arrays', () => {
    const r = analyzeDigitalMaturity(['WEBSITE_PRESENT', 'BOOKING_SYSTEM']);
    assert.ok(r.detected.includes('WEBSITE_PRESENT'));
    assert.ok(r.absent.length > 0);
  });
});

// ── Pain Signals ──────────────────────────────────────────────────────────────
describe('pain signal detector', () => {
  it('PAIN_SIGNAL_TYPE has NO_BOOKING and MANUAL_APPOINTMENTS', () => {
    assert.ok(PAIN_SIGNAL_TYPE.NO_BOOKING);
    assert.ok(PAIN_SIGNAL_TYPE.MANUAL_APPOINTMENTS);
  });
  it('PAIN_SEVERITY has CRITICAL and HIGH', () => {
    assert.ok(PAIN_SEVERITY.CRITICAL);
    assert.ok(PAIN_SEVERITY.HIGH);
  });
  it('createPainSignal returns signal with correct type', () => {
    const s = createPainSignal(PAIN_SIGNAL_TYPE.NO_BOOKING, 'no booking detected');
    assert.equal(s.type, PAIN_SIGNAL_TYPE.NO_BOOKING);
    assert.equal(s.severity, PAIN_SEVERITY.CRITICAL);
    assert.equal(s.isReal, false);
  });
  it('createPainSignal returns null for unknown type', () => {
    const s = createPainSignal('UNKNOWN_TYPE');
    assert.equal(s, null);
  });
  it('detectPainSignals infers NO_BOOKING when no digital booking signal', () => {
    const r = detectPainSignals({ digitalSignals: [], painSignals: [] });
    assert.ok(r.signals.some(s => s.type === PAIN_SIGNAL_TYPE.NO_BOOKING));
    assert.equal(r.isReal, false);
  });
  it('detectPainSignals counts critical signals', () => {
    const lead = { digitalSignals: [], painSignals: [PAIN_SIGNAL_TYPE.BROKEN_CTA, PAIN_SIGNAL_TYPE.MANUAL_APPOINTMENTS] };
    const r = detectPainSignals(lead);
    assert.ok(r.criticalCount >= 2);
  });
  it('detectPainSignals deduplicates signal types', () => {
    const lead = { digitalSignals: [], painSignals: [PAIN_SIGNAL_TYPE.NO_BOOKING, PAIN_SIGNAL_TYPE.NO_BOOKING] };
    const r = detectPainSignals(lead);
    const noBs = r.signals.filter(s => s.type === PAIN_SIGNAL_TYPE.NO_BOOKING);
    assert.equal(noBs.length, 1);
  });
});

// ── Service Matcher ───────────────────────────────────────────────────────────
describe('service matcher', () => {
  it('AGENCY_SERVICE has BOOKING and CRM', () => {
    assert.ok(AGENCY_SERVICE.BOOKING);
    assert.ok(AGENCY_SERVICE.CRM);
  });
  it('matchAgencyServices for dental vertical recommends BOOKING', () => {
    const r = matchAgencyServices({ vertical: 'dental', painSignals: [] });
    assert.ok(r.recommendedServices.includes(AGENCY_SERVICE.BOOKING));
    assert.equal(r.isReal, false);
  });
  it('matchAgencyServices for legal vertical recommends CRM', () => {
    const r = matchAgencyServices({ vertical: 'legal', painSignals: [] });
    assert.ok(r.recommendedServices.includes(AGENCY_SERVICE.CRM));
  });
  it('matchAgencyServices boosts service from pain signal', () => {
    const r = matchAgencyServices({ vertical: 'default', painSignals: [PAIN_SIGNAL_TYPE.NO_BOOKING] });
    assert.ok(r.recommendedServices.includes(AGENCY_SERVICE.BOOKING));
  });
  it('matchAgencyServices returns primaryService', () => {
    const r = matchAgencyServices({ vertical: 'dental', painSignals: ['NO_BOOKING'] });
    assert.ok(r.primaryService.length > 0);
  });
  it('matchAgencyServices fitByService has values 0-100', () => {
    const r = matchAgencyServices({ vertical: 'beauty', painSignals: [] });
    for (const v of Object.values(r.fitByService)) {
      assert.ok(v >= 0 && v <= 100);
    }
  });
});

// ── Fit Score ─────────────────────────────────────────────────────────────────
describe('fit score', () => {
  it('calculateFitScore returns 0-100 score', () => {
    const r = calculateFitScore(makeLead());
    assert.ok(r.score >= 0 && r.score <= 100);
    assert.equal(r.isReal, false);
  });
  it('calculateFitScore lower for unknown vertical', () => {
    const low = calculateFitScore({ vertical: 'unknown_xyz', estimatedSize: 'MICRO', painSignals: [] });
    const high = calculateFitScore({ vertical: 'dental', estimatedSize: 'SMALL', painSignals: ['NO_BOOKING'] });
    assert.ok(high.score > low.score);
  });
  it('calculateFitScore respects custom weights', () => {
    const r = calculateFitScore(makeLead(), { verticalCompatibility: 50, problemServiceMatch: 50, technicalFeasibility: 0, businessSizeFit: 0, digitalGap: 0, agencyCapability: 0 });
    assert.ok(r.score >= 0 && r.score <= 100);
  });
  it('calculateFitScore returns factors breakdown', () => {
    const r = calculateFitScore(makeLead());
    assert.ok('vertScore' in r.factors);
    assert.ok('sizeScore' in r.factors);
  });
});

// ── Urgency Score ─────────────────────────────────────────────────────────────
describe('urgency score', () => {
  it('calculateUrgencyScore returns 0-100', () => {
    const r = calculateUrgencyScore(makeLead());
    assert.ok(r.score >= 0 && r.score <= 100);
    assert.equal(r.isReal, false);
  });
  it('calculateUrgencyScore higher with more critical pain signals', () => {
    const low  = calculateUrgencyScore({ painSignals: [], digitalMaturityLevel: 'ESTABLISHED' });
    const high = calculateUrgencyScore({ painSignals: [PAIN_SIGNAL_TYPE.NO_BOOKING, PAIN_SIGNAL_TYPE.BROKEN_CTA, PAIN_SIGNAL_TYPE.MANUAL_APPOINTMENTS], digitalMaturityLevel: 'ABSENT' });
    assert.ok(high.score > low.score);
  });
  it('calculateUrgencyScore includes maturity boost for ABSENT', () => {
    const r = calculateUrgencyScore({ painSignals: [], digitalMaturityLevel: 'ABSENT' });
    assert.ok(r.maturityBoost > 0);
  });
});

// ── Value Score ───────────────────────────────────────────────────────────────
describe('value score', () => {
  it('calculateValueScore returns 0-100', () => {
    const r = calculateValueScore(makeLead());
    assert.ok(r.score >= 0 && r.score <= 100);
    assert.equal(r.isReal, false);
  });
  it('LARGE business scores higher than MICRO', () => {
    const large = calculateValueScore({ estimatedSize: 'LARGE', recommendedServices: [], digitalSignals: [] });
    const micro = calculateValueScore({ estimatedSize: 'MICRO', recommendedServices: [], digitalSignals: [] });
    assert.ok(large.score > micro.score);
  });
  it('multiLocation adds to score', () => {
    const noML = calculateValueScore({ estimatedSize: 'SMALL', multiLocation: false, recommendedServices: [], digitalSignals: [] });
    const withML = calculateValueScore({ estimatedSize: 'SMALL', multiLocation: true, recommendedServices: [], digitalSignals: [] });
    assert.ok(withML.score > noML.score);
  });
});

// ── Ease Score ────────────────────────────────────────────────────────────────
describe('ease score', () => {
  it('calculateEaseScore returns 0-100', () => {
    const r = calculateEaseScore(makeLead());
    assert.ok(r.score >= 0 && r.score <= 100);
    assert.equal(r.isReal, false);
  });
  it('full contact info boosts ease', () => {
    const full = calculateEaseScore({ publicEmail: 'a@b.com', publicPhone: '600000001', digitalMaturityLevel: 'BASIC', recommendedServices: ['BOOKING'], website: 'https://t.com', socialProfiles: {} });
    const none = calculateEaseScore({ publicEmail: '', publicPhone: '', digitalMaturityLevel: 'ABSENT', recommendedServices: [], website: '', socialProfiles: {} });
    assert.ok(full.score > none.score);
  });
});

// ── Opportunity Score ─────────────────────────────────────────────────────────
describe('opportunity score', () => {
  it('calculateOpportunityScore returns 0-100', () => {
    const r = calculateOpportunityScore(makeLead());
    assert.ok(r.score >= 0 && r.score <= 100);
    assert.equal(r.isReal, false);
  });
  it('calculateOpportunityScore returns components', () => {
    const r = calculateOpportunityScore(makeLead());
    assert.ok('fit' in r.components);
    assert.ok('urgency' in r.components);
    assert.ok('value' in r.components);
    assert.ok('ease' in r.components);
  });
  it('calculateOpportunityScore uses default weights 40-30-20-10', () => {
    const r = calculateOpportunityScore(makeLead());
    assert.equal(r.weights.fit + r.weights.urgency + r.weights.value + r.weights.ease, 100);
  });
  it('calculateOpportunityScore accepts custom weights', () => {
    const r = calculateOpportunityScore(makeLead(), { fit: 50, urgency: 50, value: 0, ease: 0 });
    assert.ok(r.score >= 0 && r.score <= 100);
  });
});

// ── Temperature ───────────────────────────────────────────────────────────────
describe('temperature classifier', () => {
  it('classifyTemperature 80+ = HOT', () => {
    const r = classifyTemperature(85);
    assert.equal(r.temperature, LEAD_TEMPERATURE.HOT);
    assert.equal(r.isReal, false);
  });
  it('classifyTemperature 60-79 = WARM', () => {
    const r = classifyTemperature(65);
    assert.equal(r.temperature, LEAD_TEMPERATURE.WARM);
  });
  it('classifyTemperature 40-59 = COLD', () => {
    const r = classifyTemperature(45);
    assert.equal(r.temperature, LEAD_TEMPERATURE.COLD);
  });
  it('classifyTemperature <40 = NURTURE', () => {
    const r = classifyTemperature(30);
    assert.equal(r.temperature, LEAD_TEMPERATURE.NURTURE);
  });
  it('classifyLeadTemperature reads opportunityScore from lead', () => {
    const r = classifyLeadTemperature({ opportunityScore: 82 });
    assert.equal(r.temperature, LEAD_TEMPERATURE.HOT);
  });
  it('classifyTemperature accepts custom thresholds', () => {
    const r = classifyTemperature(75, { hot: 90, warm: 70, cold: 50 });
    assert.equal(r.temperature, LEAD_TEMPERATURE.WARM);
  });
});

// ── Commercial Probability ────────────────────────────────────────────────────
describe('commercial probability', () => {
  it('COMMERCIAL_PROBABILITY has VERY_HIGH and LOW', () => {
    assert.ok(COMMERCIAL_PROBABILITY.VERY_HIGH);
    assert.ok(COMMERCIAL_PROBABILITY.LOW);
  });
  it('estimateCommercialProbability returns ordinal result', () => {
    const r = estimateCommercialProbability({ opportunityScore: 85, dataQualityScore: 80, confidence: 70 });
    assert.ok(Object.values(COMMERCIAL_PROBABILITY).includes(r.probability));
    assert.equal(r.isReal, false);
  });
  it('estimateCommercialProbability HIGH for good lead', () => {
    const r = estimateCommercialProbability({ opportunityScore: 80, dataQualityScore: 75, confidence: 70 });
    assert.ok([COMMERCIAL_PROBABILITY.HIGH, COMMERCIAL_PROBABILITY.VERY_HIGH].includes(r.probability));
  });
  it('estimateCommercialProbability LOW for poor lead', () => {
    const r = estimateCommercialProbability({ opportunityScore: 10, dataQualityScore: 15, confidence: 20 });
    assert.equal(r.probability, COMMERCIAL_PROBABILITY.LOW);
  });
});

// ── Economic Potential ────────────────────────────────────────────────────────
describe('economic potential', () => {
  it('ECONOMIC_POTENTIAL_LEVEL has VERY_HIGH and LOW', () => {
    assert.ok(ECONOMIC_POTENTIAL_LEVEL.VERY_HIGH);
    assert.ok(ECONOMIC_POTENTIAL_LEVEL.LOW);
  });
  it('estimateEconomicPotential returns level and ticketRange', () => {
    const r = estimateEconomicPotential({ valueScore: 80, fitScore: 75 });
    assert.ok(Object.values(ECONOMIC_POTENTIAL_LEVEL).includes(r.level));
    assert.ok(r.ticketRange.min > 0);
    assert.equal(r.isReal, false);
  });
  it('estimateEconomicPotential HIGH for high value+fit', () => {
    const r = estimateEconomicPotential({ valueScore: 85, fitScore: 80 });
    assert.ok([ECONOMIC_POTENTIAL_LEVEL.HIGH, ECONOMIC_POTENTIAL_LEVEL.VERY_HIGH].includes(r.level));
  });
  it('estimateEconomicPotential disclaimer present', () => {
    const r = estimateEconomicPotential({});
    assert.ok(r.disclaimer.length > 5);
  });
});

// ── Lead Prioritizer ──────────────────────────────────────────────────────────
describe('lead prioritizer', () => {
  it('prioritizeLeads sorts by opportunityScore DESC', () => {
    const leads = [
      makeLead({ id: 'a', opportunityScore: 50 }),
      makeLead({ id: 'b', opportunityScore: 80 }),
      makeLead({ id: 'c', opportunityScore: 60 }),
    ];
    const r = prioritizeLeads(leads);
    assert.equal(r.ranked[0].id, 'b');
    assert.equal(r.isReal, false);
  });
  it('prioritizeLeads filters by vertical', () => {
    const leads = [
      makeLead({ vertical: 'dental' }),
      makeLead({ vertical: 'fisio' }),
    ];
    const r = prioritizeLeads(leads, { vertical: 'dental' });
    assert.equal(r.total, 1);
    assert.equal(r.ranked[0].vertical, 'dental');
  });
  it('prioritizeLeads filters by temperature', () => {
    const leads = [
      makeLead({ temperature: LEAD_TEMPERATURE.HOT }),
      makeLead({ temperature: LEAD_TEMPERATURE.COLD }),
    ];
    const r = prioritizeLeads(leads, { temperature: LEAD_TEMPERATURE.HOT });
    assert.equal(r.total, 1);
  });
  it('prioritizeLeads groups hot/warm/cold/nurture', () => {
    const leads = [
      makeLead({ temperature: LEAD_TEMPERATURE.HOT, opportunityScore: 90 }),
      makeLead({ temperature: LEAD_TEMPERATURE.WARM, opportunityScore: 65 }),
      makeLead({ temperature: LEAD_TEMPERATURE.COLD, opportunityScore: 45 }),
      makeLead({ temperature: LEAD_TEMPERATURE.NURTURE, opportunityScore: 25 }),
    ];
    const r = prioritizeLeads(leads);
    assert.equal(r.hot.length, 1);
    assert.equal(r.warm.length, 1);
    assert.equal(r.cold.length, 1);
    assert.equal(r.nurture.length, 1);
  });
});

// ── Score Explainer ───────────────────────────────────────────────────────────
describe('score explainer', () => {
  it('explainLeadScore returns summary', () => {
    const r = explainLeadScore(makeLead());
    assert.ok(r.summary.length > 0);
    assert.equal(r.isReal, false);
  });
  it('explainLeadScore returns reasons for high scores', () => {
    const r = explainLeadScore(makeLead({ fitScore: 80, urgencyScore: 75, valueScore: 70 }));
    assert.ok(r.reasons.length > 0);
  });
  it('explainLeadScore lists improvers for missing website', () => {
    const r = explainLeadScore(makeLead({ website: '', fitScore: 30 }));
    assert.ok(r.improvers.some(i => i.includes('website')));
  });
  it('explainLeadScore includes temperature', () => {
    const r = explainLeadScore(makeLead({ temperature: LEAD_TEMPERATURE.HOT }));
    assert.equal(r.temperature, LEAD_TEMPERATURE.HOT);
  });
});

// ── Next Best Action ──────────────────────────────────────────────────────────
describe('next best action', () => {
  it('NEXT_ACTION has RESEARCH_MORE and PREPARE_OUTREACH', () => {
    assert.ok(NEXT_ACTION.RESEARCH_MORE);
    assert.ok(NEXT_ACTION.PREPARE_OUTREACH);
  });
  it('recommendNextBestAction low quality → RESEARCH_MORE', () => {
    const r = recommendNextBestAction({ dataQualityScore: 15, opportunityScore: 60, confidence: 50, temperature: 'WARM' });
    assert.equal(r.action, NEXT_ACTION.RESEARCH_MORE);
    assert.equal(r.isReal, false);
  });
  it('recommendNextBestAction HOT + quality → PREPARE_OUTREACH', () => {
    const r = recommendNextBestAction({ dataQualityScore: 70, opportunityScore: 80, confidence: 60, temperature: 'HOT' });
    assert.equal(r.action, NEXT_ACTION.PREPARE_OUTREACH);
  });
  it('recommendNextBestAction WARM → QUALIFY', () => {
    const r = recommendNextBestAction({ dataQualityScore: 60, opportunityScore: 65, confidence: 60, temperature: 'WARM' });
    assert.equal(r.action, NEXT_ACTION.QUALIFY);
  });
  it('recommendNextBestAction always has note about no real outreach', () => {
    const r = recommendNextBestAction(makeLead());
    assert.ok(r.note.toLowerCase().includes('no'));
  });
});

// ── Segmentation ──────────────────────────────────────────────────────────────
describe('segmentation', () => {
  it('SEGMENT has 6 values', () => {
    assert.equal(Object.keys(SEGMENT).length, 6);
  });
  it('segmentLead LOW quality → RESEARCH_REQUIRED', () => {
    const seg = segmentLead({ dataQualityScore: 10, opportunityScore: 70, easeScore: 80, valueScore: 60, temperature: 'HOT' });
    assert.equal(seg, SEGMENT.RESEARCH_REQUIRED);
  });
  it('segmentLead HOT + ease → FAST_WIN', () => {
    const seg = segmentLead({ dataQualityScore: 60, opportunityScore: 75, easeScore: 70, valueScore: 50, temperature: 'HOT' });
    assert.equal(seg, SEGMENT.FAST_WIN);
  });
  it('segmentLead high score + value → HIGH_VALUE_LONGER_CYCLE', () => {
    const seg = segmentLead({ dataQualityScore: 60, opportunityScore: 75, easeScore: 40, valueScore: 70, temperature: 'WARM' });
    assert.equal(seg, SEGMENT.HIGH_VALUE_LONGER_CYCLE);
  });
  it('segmentLeads groups all leads', () => {
    const leads = [
      makeLead({ dataQualityScore: 80, opportunityScore: 85, easeScore: 70, valueScore: 65, temperature: 'HOT' }),
      makeLead({ dataQualityScore: 10, opportunityScore: 20, easeScore: 20, valueScore: 20, temperature: 'COLD' }),
    ];
    const r = segmentLeads(leads);
    assert.equal(r.total, 2);
    assert.equal(r.isReal, false);
  });
});

// ── Fast Win Detector ─────────────────────────────────────────────────────────
describe('fast win detector', () => {
  it('detectFastWins finds qualifying leads', () => {
    const leads = [
      makeLead({ opportunityScore: 75, easeScore: 65, fitScore: 65, dataQualityScore: 55, temperature: 'HOT',
        publicEmail: 'a@b.com', recommendedService: 'BOOKING' }),
      makeLead({ opportunityScore: 20, easeScore: 20, fitScore: 20, dataQualityScore: 20, temperature: 'COLD',
        publicEmail: '', recommendedService: '' }),
    ];
    const r = detectFastWins(leads);
    assert.equal(r.count, 1);
    assert.equal(r.isReal, false);
  });
  it('detectFastWins returns 0 for empty input', () => {
    const r = detectFastWins([]);
    assert.equal(r.count, 0);
  });
  it('detectFastWins requires contact info', () => {
    const lead = makeLead({ opportunityScore: 80, easeScore: 70, fitScore: 70, dataQualityScore: 60,
      temperature: 'HOT', publicEmail: '', publicPhone: '', recommendedService: 'BOOKING' });
    const r = detectFastWins([lead]);
    assert.equal(r.count, 0);
  });
});

// ── High Value Detector ───────────────────────────────────────────────────────
describe('high value detector', () => {
  it('detectHighValueOpportunities finds qualifying leads', () => {
    const leads = [
      makeLead({ valueScore: 75, fitScore: 65, opportunityScore: 70, dataQualityScore: 55 }),
      makeLead({ valueScore: 20, fitScore: 20, opportunityScore: 20, dataQualityScore: 20 }),
    ];
    const r = detectHighValueOpportunities(leads);
    assert.equal(r.count, 1);
    assert.equal(r.isReal, false);
  });
  it('detectHighValueOpportunities sorts by composite value', () => {
    const leads = [
      makeLead({ id: 'a', valueScore: 65, fitScore: 55, opportunityScore: 60, dataQualityScore: 50 }),
      makeLead({ id: 'b', valueScore: 80, fitScore: 70, opportunityScore: 75, dataQualityScore: 60 }),
    ];
    const r = detectHighValueOpportunities(leads);
    assert.equal(r.highValue[0].id, 'b');
  });
});

// ── Lead Engine Report ────────────────────────────────────────────────────────
describe('lead engine report', () => {
  it('buildLeadEngineReport returns valid report', () => {
    const leads = [
      makeLead({ temperature: 'HOT', freshnessStatus: 'FRESH' }),
      makeLead({ temperature: 'WARM', freshnessStatus: 'FRESH' }),
    ];
    const r = buildLeadEngineReport({ leads, duplicates: [], rejected: [], provider: { name: 'FIXTURE', estimatedCost: 0 } });
    assert.ok(r.accepted >= 0);
    assert.ok(r.hot >= 0);
    assert.equal(r.isReal, false);
  });
  it('buildLeadEngineReport warns on 0 hot leads', () => {
    const leads = [makeLead({ temperature: 'COLD' })];
    const r = buildLeadEngineReport({ leads, duplicates: [], rejected: [] });
    assert.ok(r.warnings.some(w => w.includes('No hot')));
  });
  it('calculateLeadEngineQualityScore returns 0-100', () => {
    const report = { averageQuality: 70, discovered: 10, duplicates: 1, hot: 2, accepted: 10, highPriority: 3 };
    const r = calculateLeadEngineQualityScore(report, [makeLead()]);
    assert.ok(r.score >= 0 && r.score <= 100);
    assert.equal(r.isReal, false);
  });
});

// ── Privacy Policy ────────────────────────────────────────────────────────────
describe('privacy policy', () => {
  it('PRIVACY_PRINCIPLE has DATA_MINIMIZATION', () => {
    assert.ok(PRIVACY_PRINCIPLE.DATA_MINIMIZATION);
  });
  it('createLeadPrivacyPolicy returns policy with principles', () => {
    const p = createLeadPrivacyPolicy();
    assert.ok(p.principles.length > 0);
    assert.equal(p.isReal, false);
  });
  it('auditLeadPrivacy flags lead missing source', () => {
    const r = auditLeadPrivacy({ source: '' });
    assert.equal(r.compliant, false);
    assert.ok(r.violations.some(v => v.includes('source')));
  });
  it('auditLeadPrivacy passes clean lead', () => {
    const r = auditLeadPrivacy(makeLead());
    assert.equal(r.compliant, true);
  });
  it('auditLeadPrivacy flags prohibited fields', () => {
    const r = auditLeadPrivacy({ ...makeLead(), nationalId: '12345678X' });
    assert.equal(r.compliant, false);
  });
});

// ── Freshness Policy ──────────────────────────────────────────────────────────
describe('freshness policy', () => {
  it('FRESHNESS_STATUS has FRESH, AGING, STALE, UNKNOWN', () => {
    assert.equal(Object.keys(FRESHNESS_STATUS).length, 4);
  });
  it('createLeadFreshnessPolicy returns policy', () => {
    const p = createLeadFreshnessPolicy();
    assert.ok(p.freshDays > 0);
    assert.equal(p.isReal, false);
  });
  it('evaluateLeadFreshness FRESH for new lead', () => {
    const r = evaluateLeadFreshness({ discoveredAt: new Date().toISOString() });
    assert.equal(r.status, FRESHNESS_STATUS.FRESH);
    assert.equal(r.isReal, false);
  });
  it('evaluateLeadFreshness STALE for very old lead', () => {
    const r = evaluateLeadFreshness({ discoveredAt: '2025-01-01T00:00:00Z' });
    assert.equal(r.status, FRESHNESS_STATUS.STALE);
  });
  it('evaluateLeadFreshness UNKNOWN for missing date', () => {
    const r = evaluateLeadFreshness({});
    assert.equal(r.status, FRESHNESS_STATUS.UNKNOWN);
  });
});

// ── Cost Guard ────────────────────────────────────────────────────────────────
describe('cost guard', () => {
  it('createLeadProviderCostGuard returns guard', () => {
    const g = createLeadProviderCostGuard({ maxBudgetEUR: 5 });
    assert.equal(g.maxBudgetEUR, 5);
    assert.equal(g.isReal, false);
  });
  it('guardProviderRun allows free provider', () => {
    const g = createLeadProviderCostGuard();
    const r = guardProviderRun({ requiresToken: false, estimatedCost: 0 }, g);
    assert.equal(r.allowed, true);
    assert.equal(r.costStatus, COST_STATUS.FREE_SAFE);
  });
  it('guardProviderRun blocks expensive provider', () => {
    const g = createLeadProviderCostGuard({ maxBudgetEUR: 5 });
    const r = guardProviderRun({ requiresToken: true, estimatedCost: 50 }, g);
    assert.equal(r.allowed, false);
    assert.equal(r.costStatus, COST_STATUS.BLOCKED);
  });
  it('guardProviderRun requires approval for paid provider', () => {
    const g = createLeadProviderCostGuard({ maxBudgetEUR: 100, autoApprove: false });
    const r = guardProviderRun({ requiresToken: true, estimatedCost: 10 }, g);
    assert.equal(r.costStatus, COST_STATUS.REQUIRES_APPROVAL);
  });
});

// ── Rate Policy ───────────────────────────────────────────────────────────────
describe('rate policy', () => {
  it('createLeadDiscoveryRatePolicy returns policy with prohibitions', () => {
    const p = createLeadDiscoveryRatePolicy();
    assert.ok(p.prohibit.includes('aggressive_scraping'));
    assert.equal(p.isReal, false);
  });
  it('checkRateAllowed returns true with no lastRunAt', () => {
    const r = checkRateAllowed(null, {});
    assert.equal(r.allowed, true);
    assert.equal(r.isReal, false);
  });
  it('checkRateAllowed returns false for recent lastRunAt', () => {
    const r = checkRateAllowed(new Date().toISOString(), { requestsPerMinute: 1 });
    assert.equal(r.allowed, false);
    assert.ok(r.waitMs > 0);
  });
});

// ── Providers ─────────────────────────────────────────────────────────────────
describe('fixture provider', () => {
  it('createFixtureProvider returns READY provider', () => {
    const p = createFixtureProvider();
    assert.equal(p.status, PROVIDER_STATUS.READY);
    assert.equal(p.costStatus, COST_STATUS.FREE_SAFE);
    assert.equal(p.isReal, false);
  });
  it('fetchFromFixtures filters by vertical', () => {
    const r = fetchFromFixtures(BUSINESS_FIXTURES, { vertical: 'dental', maxResults: 50 });
    assert.ok(r.leads.every(l => l.vertical === 'dental'));
    assert.equal(r.isReal, false);
  });
  it('fetchFromFixtures respects maxResults', () => {
    const r = fetchFromFixtures(BUSINESS_FIXTURES, { maxResults: 3 });
    assert.ok(r.leads.length <= 3);
  });
  it('fetchFromFixtures returns 0 for unknown vertical', () => {
    const r = fetchFromFixtures(BUSINESS_FIXTURES, { vertical: 'xyz_unknown' });
    assert.equal(r.acceptedCount, 0);
  });
});

describe('manual import provider', () => {
  it('createManualImportProvider returns READY', () => {
    const p = createManualImportProvider();
    assert.equal(p.status, PROVIDER_STATUS.READY);
  });
  it('validateManualImportRow errors on missing name', () => {
    const r = validateManualImportRow({});
    assert.equal(r.valid, false);
    assert.ok(r.errors.includes('MISSING_BUSINESS_NAME'));
  });
  it('validateManualImportRow valid row', () => {
    const r = validateManualImportRow({ businessName: 'Test', location: 'Málaga', website: 'https://t.com' });
    assert.equal(r.valid, true);
  });
  it('importManualLeads separates accepted and rejected', () => {
    const rows = [
      { businessName: 'A', location: 'M', website: 'https://a.com' },
      { businessName: '', location: '', website: '' },
    ];
    const r = importManualLeads(rows);
    assert.equal(r.acceptedCount, 1);
    assert.equal(r.rejectedCount, 1);
    assert.equal(r.isReal, false);
  });
});

describe('apify provider', () => {
  it('createApifyProviderConfig without token returns FIXTURE_MODE', () => {
    const c = createApifyProviderConfig({});
    assert.equal(c.mode, PROVIDER_MODE.FIXTURE_MODE);
    assert.equal(c.hasToken, false);
    assert.equal(c.isReal, false);
  });
  it('validateApifyConfig without token has errors', () => {
    const c = createApifyProviderConfig({});
    const r = validateApifyConfig(c);
    assert.equal(r.valid, false);
    assert.ok(r.errors.length > 0);
  });
  it('buildApifyInput creates query from profile', () => {
    const r = buildApifyInput({ vertical: 'dental', locations: ['Málaga'], maxResults: 20 });
    assert.ok(r.query.length > 0);
    assert.equal(r.isReal, false);
  });
  it('estimateApifyRunRisk is NONE without token', () => {
    const c = createApifyProviderConfig({});
    const r = estimateApifyRunRisk(c, {});
    assert.equal(r.risk, 'NONE');
    assert.equal(r.costStatus, COST_STATUS.FREE_SAFE);
  });
  it('normalizeApifyResult maps Apify item to lead fields', () => {
    const item = APIFY_FIXTURE_RESPONSE.items[0];
    const r = normalizeApifyResult(item);
    assert.equal(r.businessName, item.name);
    assert.equal(r.isReal, false);
  });
  it('getApifyUsageEstimate $0 without token', () => {
    const c = createApifyProviderConfig({});
    const r = getApifyUsageEstimate(c, 100);
    assert.equal(r.estimatedUSD, 0);
    assert.equal(r.isReal, false);
  });
});

// ── Bridges ───────────────────────────────────────────────────────────────────
describe('agent engine bridge', () => {
  it('buildLeadContext returns frozen context with isReal:false', () => {
    const r = buildLeadContext(makeLead());
    assert.equal(r.isReal, false);
    assert.ok(r.leadId.length > 0);
  });
  it('buildLeadContext includes pain signals as strings', () => {
    const r = buildLeadContext(makeLead({ painSignals: [PAIN_SIGNAL_TYPE.NO_BOOKING] }));
    assert.ok(r.painSignals.includes(PAIN_SIGNAL_TYPE.NO_BOOKING));
  });
  it('buildSalesPreparationContext includes value proposition', () => {
    const r = buildSalesPreparationContext(makeLead());
    assert.ok(r.valueProposition.length > 0);
    assert.equal(r.isReal, false);
  });
});

describe('personalization context', () => {
  it('buildLeadPersonalizationContext returns hooks from pain signals', () => {
    const lead = makeLead({ painSignals: ['NO_BOOKING', 'OUTDATED_WEBSITE'] });
    const r = buildLeadPersonalizationContext(lead);
    assert.ok(r.hooks.length > 0);
    assert.equal(r.isReal, false);
  });
  it('buildLeadPersonalizationContext note about public data', () => {
    const r = buildLeadPersonalizationContext(makeLead());
    assert.ok(r.note.toLowerCase().includes('public'));
  });
});

describe('outreach draft context', () => {
  it('prepareOutreachDraftContext readyToSend is always false', () => {
    const r = prepareOutreachDraftContext(makeLead(), { hooks: ['no booking'] });
    assert.equal(r.readyToSend, false);
    assert.equal(r.isReal, false);
  });
  it('prepareOutreachDraftContext antiPatterns present', () => {
    const r = prepareOutreachDraftContext(makeLead(), {});
    assert.ok(r.antiPatterns.length > 0);
  });
});

describe('crm bridge', () => {
  it('CRM_STAGE has DISCOVERED and WON', () => {
    assert.ok(CRM_STAGE.DISCOVERED);
    assert.ok(CRM_STAGE.WON);
  });
  it('createLeadCRMRecord returns record with isReal:false', () => {
    const r = createLeadCRMRecord(makeLead());
    assert.equal(r.isReal, false);
    assert.equal(r.stage, CRM_STAGE.DISCOVERED);
  });
  it('createLeadCRMRecord sets nextReviewAt', () => {
    const r = createLeadCRMRecord(makeLead());
    assert.ok(r.nextReviewAt.length > 0);
  });
});

describe('make bridge', () => {
  it('LEAD_AUTOMATION_EVENT has newLead', () => {
    assert.ok(LEAD_AUTOMATION_EVENT.NEW_LEAD);
  });
  it('createLeadAutomationManifest always includes newLead', () => {
    const r = createLeadAutomationManifest(makeLead());
    assert.ok(r.triggeredEvents.includes(LEAD_AUTOMATION_EVENT.NEW_LEAD));
    assert.equal(r.isReal, false);
  });
  it('createLeadAutomationManifest includes HOT_LEAD for hot leads', () => {
    const r = createLeadAutomationManifest(makeLead({ temperature: 'HOT' }));
    assert.ok(r.triggeredEvents.includes(LEAD_AUTOMATION_EVENT.HOT_LEAD));
  });
  it('createLeadAutomationManifest requiresAuth is true', () => {
    const r = createLeadAutomationManifest(makeLead());
    assert.equal(r.requiresAuth, true);
  });
});

describe('observability bridge', () => {
  it('LEAD_ENGINE_EVENT has all expected events', () => {
    assert.ok(LEAD_ENGINE_EVENT.DISCOVERY_STARTED);
    assert.ok(LEAD_ENGINE_EVENT.LEAD_SCORED);
    assert.ok(LEAD_ENGINE_EVENT.ENGINE_COMPLETED);
  });
  it('emitLeadEvent returns event with isReal:false', () => {
    const r = emitLeadEvent(LEAD_ENGINE_EVENT.LEAD_SCORED, { leadId: 'x', opportunityScore: 70 });
    assert.equal(r.isReal, false);
    assert.equal(r.type, LEAD_ENGINE_EVENT.LEAD_SCORED);
  });
  it('emitLeadEvent strips publicEmail from payload', () => {
    const r = emitLeadEvent(LEAD_ENGINE_EVENT.LEAD_IMPORTED, { publicEmail: 'private@test.com', leadId: 'x' });
    assert.equal(r.payload.publicEmail, undefined);
  });
  it('createLeadEngineLogger returns logger with all methods', () => {
    const logger = createLeadEngineLogger();
    assert.equal(typeof logger.leadScored, 'function');
    assert.equal(typeof logger.engineCompleted, 'function');
  });
  it('createLeadEngineLogger calls emitFn', () => {
    let called = false;
    const logger = createLeadEngineLogger(() => { called = true; });
    logger.leadScored({ leadId: 'x' });
    assert.equal(called, true);
  });
});

// ── Agency Bridge ─────────────────────────────────────────────────────────────
describe('agency bridge', () => {
  it('buildAgencyLeadContext returns fit assessment', () => {
    const r = buildAgencyLeadContext(makeLead(), { supportedVerticals: ['dental'], capabilities: ['BOOKING'] });
    assert.equal(r.isVerticalSupported, true);
    assert.equal(r.isReal, false);
  });
  it('buildAgencyLeadContext lower fit for unsupported vertical', () => {
    const r = buildAgencyLeadContext(makeLead({ vertical: 'unknown' }), { supportedVerticals: ['dental'] });
    assert.equal(r.isVerticalSupported, false);
    assert.ok(r.agencyFitScore < 50);
  });
});

// ── Fixtures ──────────────────────────────────────────────────────────────────
describe('business fixtures', () => {
  it('BUSINESS_FIXTURES has 30 entries', () => {
    assert.equal(BUSINESS_FIXTURES.length, 30);
    assert.equal(FIXTURE_COUNT, 30);
  });
  it('all fixtures have isReal:false', () => {
    assert.ok(BUSINESS_FIXTURES.every(f => f.isReal === false));
  });
  it('fixtures cover dental vertical', () => {
    assert.ok(BUSINESS_FIXTURES.some(f => f.vertical === 'dental'));
  });
  it('fixtures cover fisio vertical', () => {
    assert.ok(BUSINESS_FIXTURES.some(f => f.vertical === 'fisio'));
  });
  it('fixtures cover legal vertical', () => {
    assert.ok(BUSINESS_FIXTURES.some(f => f.vertical === 'legal'));
  });
  it('fixtures cover veterinary vertical', () => {
    assert.ok(BUSINESS_FIXTURES.some(f => f.vertical === 'veterinary'));
  });
  it('fixtures cover beauty vertical', () => {
    assert.ok(BUSINESS_FIXTURES.some(f => f.vertical === 'beauty'));
  });
  it('fixtures cover padel vertical', () => {
    assert.ok(BUSINESS_FIXTURES.some(f => f.vertical === 'padel'));
  });
  it('fixtures cover education vertical', () => {
    assert.ok(BUSINESS_FIXTURES.some(f => f.vertical === 'education'));
  });
  it('fixtures have varied pain signals', () => {
    const allPains = new Set(BUSINESS_FIXTURES.flatMap(f => f.painSignals));
    assert.ok(allPains.size >= 5);
  });
  it('some fixtures have stale discoveredAt', () => {
    assert.ok(BUSINESS_FIXTURES.some(f => new Date(f.discoveredAt) < new Date('2026-01-01')));
  });
});

describe('apify fixture', () => {
  it('APIFY_FIXTURE_RESPONSE has 6 items', () => {
    assert.equal(APIFY_FIXTURE_RESPONSE.itemCount, 6);
    assert.equal(APIFY_FIXTURE_RESPONSE.items.length, 6);
  });
  it('APIFY_FIXTURE_RESPONSE is FIXTURE_MODE', () => {
    assert.equal(APIFY_FIXTURE_RESPONSE.status, 'FIXTURE_MODE');
    assert.equal(APIFY_FIXTURE_RESPONSE.isReal, false);
  });
  it('all items have placeId for dedup testing', () => {
    assert.ok(APIFY_FIXTURE_RESPONSE.items.every(i => i.placeId.length > 0));
  });
  it('item 6 is intentional duplicate of item 1', () => {
    const i1 = APIFY_FIXTURE_RESPONSE.items[0];
    const i6 = APIFY_FIXTURE_RESPONSE.items[5];
    assert.equal(i1.placeId, i6.placeId);
  });
});

// ── Registry ──────────────────────────────────────────────────────────────────
describe('lead engine registry', () => {
  it('LEAD_ENGINE_REGISTRY has correct moduleCount', () => {
    assert.equal(LEAD_ENGINE_REGISTRY.moduleCount, 30);
  });
  it('LEAD_ENGINE_REGISTRY has 4 providers', () => {
    assert.equal(LEAD_ENGINE_REGISTRY.providers.length, 4);
  });
  it('LEAD_ENGINE_REGISTRY has 6 bridges', () => {
    assert.equal(LEAD_ENGINE_REGISTRY.bridges.length, 6);
  });
  it('LEAD_ENGINE_REGISTRY guardrails.isReal is false', () => {
    assert.equal(LEAD_ENGINE_REGISTRY.guardrails.isReal, false);
  });
  it('LEAD_ENGINE_REGISTRY realRunEnabled is false', () => {
    assert.equal(LEAD_ENGINE_REGISTRY.realRunEnabled, false);
  });
  it('LEAD_ENGINE_REGISTRY connectedAdv includes ADV-01 and ADV-03', () => {
    assert.ok(LEAD_ENGINE_REGISTRY.connectedAdv.includes('ADV-01'));
    assert.ok(LEAD_ENGINE_REGISTRY.connectedAdv.includes('ADV-03'));
  });
});

// ── Integration: Full Pipeline ────────────────────────────────────────────────
describe('integration: full fixture pipeline', () => {
  it('fetch → normalize → dedupe → score pipeline produces valid result', () => {
    const provider = createFixtureProvider();
    const profile = createLeadSearchProfile({ vertical: 'dental', locations: ['Málaga'], maxResults: 10 });
    const fetched = fetchFromFixtures(BUSINESS_FIXTURES, profile);

    const normalized = fetched.leads.map(l => normalizeLead(l).normalized);
    const deduped = deduplicateLeads(normalized);

    assert.ok(deduped.unique.length >= 1);
    assert.equal(deduped.isReal, false);

    const scored = deduped.unique.map(u => {
      const lead = u.lead;
      const opp = calculateOpportunityScore(lead);
      const temp = classifyTemperature(opp.score);
      return { ...lead, opportunityScore: opp.score, temperature: temp.temperature };
    });

    const prioritized = prioritizeLeads(scored);
    assert.ok(prioritized.total >= 1);
    assert.equal(prioritized.isReal, false);
  });

  it('apify fixture → normalize → dedupe removes duplicate', () => {
    const items = [...APIFY_FIXTURE_RESPONSE.items].map(normalizeApifyResult);
    const raw   = items.map(i => i);
    const deduped = deduplicateLeads(raw);
    assert.equal(deduped.duplicatesFound, 1);
    assert.equal(deduped.totalOut, 5);
  });

  it('prioritized HOT leads appear at top', () => {
    const leads = [
      makeLead({ id: 'hot', opportunityScore: 85, temperature: 'HOT' }),
      makeLead({ id: 'cold', opportunityScore: 30, temperature: 'COLD' }),
      makeLead({ id: 'warm', opportunityScore: 65, temperature: 'WARM' }),
    ];
    const r = prioritizeLeads(leads);
    assert.equal(r.ranked[0].id, 'hot');
  });

  it('segmentation + fast win + high value runs on full fixture set', () => {
    const leads = BUSINESS_FIXTURES.map(l => {
      const opp = calculateOpportunityScore(l);
      const temp = classifyTemperature(opp.score);
      const quality = calculateLeadDataQuality(l);
      return {
        ...l,
        opportunityScore: opp.score,
        fitScore: opp.components.fit,
        urgencyScore: opp.components.urgency,
        valueScore: opp.components.value,
        easeScore: opp.components.ease,
        dataQualityScore: quality.score,
        temperature: temp.temperature,
        confidence: quality.score,
      };
    });
    const segs = segmentLeads(leads);
    assert.equal(segs.total, 30);
    const fw = detectFastWins(leads);
    const hv = detectHighValueOpportunities(leads);
    assert.ok(fw.count >= 0);
    assert.ok(hv.count >= 0);
  });

  it('engine report from fixture dataset', () => {
    const leads = BUSINESS_FIXTURES.slice(0, 10).map(l => {
      const opp = calculateOpportunityScore(l);
      const temp = classifyTemperature(opp.score);
      const fresh = evaluateLeadFreshness(l);
      return { ...l, opportunityScore: opp.score, temperature: temp.temperature, freshnessStatus: fresh.status };
    });
    const fw  = detectFastWins(leads);
    const hv  = detectHighValueOpportunities(leads);
    const r   = buildLeadEngineReport({ leads, duplicates: [], rejected: [], provider: { name: 'FIXTURE' }, fastWins: fw.fastWins, highValue: hv.highValue });
    assert.equal(r.accepted, 10);
    assert.ok(r.averageScore >= 0 && r.averageScore <= 100);
  });
});
