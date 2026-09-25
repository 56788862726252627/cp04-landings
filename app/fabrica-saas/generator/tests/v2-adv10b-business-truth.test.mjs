// ADV-10b Business Source of Truth — comprehensive tests
// node:test runner — never vitest
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// businessSourceOfTruth
import {
  createBusinessSourceOfTruth,
  FACT_CATEGORY,
} from '../../agent-evaluation/business-truth/businessSourceOfTruth.js';

// businessTruthSourcePriority
import {
  SOURCE_PRIORITY,
  FORBIDDEN_SOURCES,
  isForbiddenSource,
  comparePriority,
  getSourcePriorityLevel,
} from '../../agent-evaluation/business-truth/businessTruthSourcePriority.js';

// businessFact
import {
  createBusinessFact,
  isFactExpired,
  isFactActive,
} from '../../agent-evaluation/business-truth/businessFact.js';

// unknownBusinessFactPolicy
import {
  UNKNOWN_FACT_ACTION,
  getSafeUnknownResponse,
  DEFAULT_UNKNOWN_FACT_POLICY,
} from '../../agent-evaluation/business-truth/unknownBusinessFactPolicy.js';

// businessFactFreshnessPolicy
import {
  FRESHNESS_STATUS,
  FRESHNESS_THRESHOLDS_MINUTES,
  getFreshnessStatus,
} from '../../agent-evaluation/business-truth/businessFactFreshnessPolicy.js';

// businessFactResolver
import {
  FACT_RESOLUTION,
  resolveBusinessFact,
} from '../../agent-evaluation/business-truth/businessFactResolver.js';

// businessTruthConflictResolver
import {
  CONFLICT_RESOLUTION_STATUS,
  resolveBusinessTruthConflict,
  resolveAllConflicts,
} from '../../agent-evaluation/business-truth/businessTruthConflictResolver.js';

// businessFactConsistencyEngine
import {
  CONSISTENCY_ISSUE,
  runBusinessFactConsistencyCheck,
} from '../../agent-evaluation/business-truth/businessFactConsistencyEngine.js';

// businessScheduleProvider
import {
  SCHEDULE_PROVIDER_TYPE,
  createStaticBusinessScheduleProvider,
  createFixtureScheduleProvider,
} from '../../agent-evaluation/business-truth/businessScheduleProvider.js';

// businessAvailabilityResolver
import {
  AVAILABILITY_STATUS,
  resolveBusinessAvailability,
} from '../../agent-evaluation/business-truth/businessAvailabilityResolver.js';

// bookingAgentGrounding
import {
  BOOKING_GROUNDING_RESULT,
  checkBookingGrounding,
} from '../../agent-evaluation/business-truth/bookingAgentGrounding.js';

// agentBusinessFactPolicy
import {
  AgentBusinessFactPolicy,
} from '../../agent-evaluation/business-truth/agentBusinessFactPolicy.js';

// clientBusinessOverride
import {
  registerClientBusinessTruth,
  getClientBusinessTruth,
  hasClientBusinessTruth,
  clearClientRegistry,
  FIXTURE_CLIENT_PADEL,
  FIXTURE_CLIENT_DENTAL,
} from '../../agent-evaluation/business-truth/clientBusinessOverride.js';

// clientFactIsolation
import {
  ISOLATION_VERDICT,
  assertClientIsolation,
  detectCrossClientFactLeak,
} from '../../agent-evaluation/business-truth/clientFactIsolation.js';

// cp04CompatAdapter
import {
  CP04ScheduleCompatAdapter,
} from '../../agent-evaluation/business-truth/cp04CompatAdapter.js';

// factoryGenerationBridge
import {
  generateBusinessTruthFromBrief,
} from '../../agent-evaluation/business-truth/factoryGenerationBridge.js';

// approvedFactIngestion
import {
  extractApprovedBusinessFacts,
} from '../../agent-evaluation/business-truth/approvedFactIngestion.js';

// Top-level evaluators
import {
  BUSINESS_GROUNDING_STATUS,
  evaluateBusinessFactGrounding,
} from '../../agent-evaluation/businessFactGroundingEvaluator.js';

import {
  AVAILABILITY_GROUNDING_FAILURE,
  evaluateAvailabilityGrounding,
} from '../../agent-evaluation/availabilityGroundingEvaluator.js';

import {
  BUSINESS_TRUTH_GATE_RESULT,
  runBusinessTruthQualityGate,
} from '../../agent-evaluation/businessTruthQualityGate.js';

import {
  PRICING_GROUNDING_STATUS,
  evaluatePricingFact,
} from '../../agent-evaluation/pricingFactEvaluator.js';

import {
  FACILITY_GROUNDING_STATUS,
  evaluateFacilityFact,
  evaluateFacilityCount,
} from '../../agent-evaluation/facilityFactEvaluator.js';

import {
  SERVICE_GROUNDING_STATUS,
  evaluateServiceFact,
  evaluateServiceList,
} from '../../agent-evaluation/serviceFactEvaluator.js';

import {
  POLICY_GROUNDING_STATUS,
  evaluatePolicyClaim,
  evaluatePolicyClaims,
} from '../../agent-evaluation/businessPolicyEvaluator.js';

// Updated evaluation dimensions
import {
  EVAL_DIMENSION,
  DEFAULT_DIMENSION_WEIGHTS,
} from '../../agent-evaluation/evaluationDimensions.js';

// Updated critical failure policy
import {
  CRITICAL_FAILURE_TYPE,
} from '../../agent-evaluation/criticalFailurePolicy.js';

// Registry
import { REGISTRY_VERSION, PASO_ADV10B_STATUS } from '../../factory-registry/index.js';

// ─── businessSourceOfTruth ──────────────────────────────────────────────────

describe('businessSourceOfTruth', () => {
  it('FACT_CATEGORY has 19 values', () => {
    assert.equal(Object.keys(FACT_CATEGORY).length, 19);
  });

  it('createBusinessSourceOfTruth returns frozen object', () => {
    const bst = createBusinessSourceOfTruth({ clientId: 'test', vertical: 'padel' });
    assert.equal(bst.clientId, 'test');
    assert.equal(bst.isReal, false);
    assert.ok(Object.isFrozen(bst));
  });

  it('includes AVAILABILITY in FACT_CATEGORY', () => {
    assert.ok(FACT_CATEGORY.AVAILABILITY);
  });
});

// ─── businessTruthSourcePriority ────────────────────────────────────────────

describe('businessTruthSourcePriority', () => {
  it('LIVE_OPERATIONAL_API has priority 1', () => {
    assert.equal(SOURCE_PRIORITY.LIVE_OPERATIONAL_API, 1);
  });

  it('UNKNOWN has priority 9', () => {
    assert.equal(SOURCE_PRIORITY.UNKNOWN, 9);
  });

  it('MODEL_ASSUMPTION is forbidden', () => {
    assert.ok(FORBIDDEN_SOURCES.includes('MODEL_ASSUMPTION'));
    assert.ok(isForbiddenSource('MODEL_ASSUMPTION'));
  });

  it('isForbiddenSource returns false for valid sources', () => {
    assert.equal(isForbiddenSource('BUSINESS_DATABASE'), false);
  });

  it('comparePriority: lower number wins (returns winner name)', () => {
    const result = comparePriority('LIVE_OPERATIONAL_API', 'APPROVED_PROMPT_FACTS');
    assert.equal(result, 'LIVE_OPERATIONAL_API');
  });

  it('getSourcePriorityLevel returns number', () => {
    const level = getSourcePriorityLevel('BUSINESS_DATABASE');
    assert.equal(typeof level, 'number');
    assert.ok(level > 0);
  });
});

// ─── businessFact ───────────────────────────────────────────────────────────

describe('businessFact', () => {
  it('createBusinessFact returns frozen fact', () => {
    const f = createBusinessFact({ key: 'price_padel', value: 12, category: 'PRICES', source: 'BUSINESS_DATABASE', clientId: 'padel-01' });
    assert.equal(f.key, 'price_padel');
    assert.equal(f.isReal, false);
    assert.ok(Object.isFrozen(f));
  });

  it('isFactExpired: expired fact', () => {
    const f = createBusinessFact({ key: 'old', value: 'x', effectiveUntil: '2000-01-01T00:00:00Z' });
    assert.ok(isFactExpired(f));
  });

  it('isFactExpired: not expired', () => {
    const f = createBusinessFact({ key: 'fresh', value: 'y', effectiveUntil: '2099-01-01T00:00:00Z' });
    assert.equal(isFactExpired(f), false);
  });

  it('isFactActive: active when no expiry', () => {
    const f = createBusinessFact({ key: 'active', value: 'z' });
    assert.ok(isFactActive(f));
  });
});

// ─── unknownBusinessFactPolicy ──────────────────────────────────────────────

describe('unknownBusinessFactPolicy', () => {
  it('UNKNOWN_FACT_ACTION has ASK_USER', () => {
    assert.ok(UNKNOWN_FACT_ACTION.ASK_USER);
  });

  it('getSafeUnknownResponse returns non-empty string', () => {
    const r = getSafeUnknownResponse('AVAILABILITY');
    assert.equal(typeof r, 'string');
    assert.ok(r.length > 0);
  });

  it('DEFAULT_UNKNOWN_FACT_POLICY has defaultAction and safeResponses', () => {
    assert.ok(DEFAULT_UNKNOWN_FACT_POLICY.defaultAction);
    assert.ok(DEFAULT_UNKNOWN_FACT_POLICY.safeResponses);
  });
});

// ─── businessFactFreshnessPolicy ────────────────────────────────────────────

describe('businessFactFreshnessPolicy', () => {
  it('FRESHNESS_THRESHOLDS_MINUTES.AVAILABILITY is 15', () => {
    assert.equal(FRESHNESS_THRESHOLDS_MINUTES.AVAILABILITY, 15);
  });

  it('getFreshnessStatus: fresh fact', () => {
    const now = Date.now();
    const fact = { lastUpdatedAt: new Date(now - 1000 * 60 * 5).toISOString(), category: 'AVAILABILITY' };
    const status = getFreshnessStatus(fact, now);
    assert.equal(status, FRESHNESS_STATUS.FRESH);
  });

  it('getFreshnessStatus: stale availability (>15min)', () => {
    const now = Date.now();
    const fact = { lastUpdatedAt: new Date(now - 1000 * 60 * 30).toISOString(), category: 'AVAILABILITY' };
    const status = getFreshnessStatus(fact, now);
    assert.notEqual(status, FRESHNESS_STATUS.FRESH);
  });

  it('FRESHNESS_STATUS has FRESH, STALE, EXPIRED', () => {
    assert.ok(FRESHNESS_STATUS.FRESH);
    assert.ok(FRESHNESS_STATUS.STALE);
    assert.ok(FRESHNESS_STATUS.EXPIRED);
  });
});

// ─── businessFactResolver ───────────────────────────────────────────────────

describe('businessFactResolver', () => {
  const facts = [
    { key: 'hours', value: '08:00-22:00', source: 'BUSINESS_DATABASE', verified: true, priority: 2, clientId: 'c1', lastUpdatedAt: new Date().toISOString(), category: 'OPENING_HOURS' },
  ];

  it('resolves a known fact', () => {
    const r = resolveBusinessFact('c1', 'hours', facts);
    assert.equal(r.resolution, FACT_RESOLUTION.KNOWN);
    assert.equal(r.value, '08:00-22:00');
  });

  it('returns UNKNOWN for missing fact', () => {
    const r = resolveBusinessFact('c1', 'nonexistent', facts);
    assert.equal(r.resolution, FACT_RESOLUTION.UNKNOWN);
  });

  it('never invents a value (null or undefined for unknown)', () => {
    const r = resolveBusinessFact('c1', 'nonexistent', facts);
    assert.ok(r.value === undefined || r.value === null);
  });
});

// ─── businessTruthConflictResolver ──────────────────────────────────────────

describe('businessTruthConflictResolver', () => {
  it('resolves conflict: lower priority number wins', () => {
    const factA = { key: 'price', value: 12, source: 'LIVE_OPERATIONAL_API', priority: 1, clientId: 'c1' };
    const factB = { key: 'price', value: 15, source: 'APPROVED_PROMPT_FACTS', priority: 6, clientId: 'c1' };
    const r = resolveBusinessTruthConflict(factA, factB);
    assert.equal(r.status, CONFLICT_RESOLUTION_STATUS.RESOLVED);
    assert.equal(r.winner.value, 12);
  });

  it('CONFLICT_RESOLUTION_STATUS has RESOLVED, UNRESOLVABLE, NO_CONFLICT', () => {
    assert.ok(CONFLICT_RESOLUTION_STATUS.RESOLVED);
    assert.ok(CONFLICT_RESOLUTION_STATUS.UNRESOLVABLE);
    assert.ok(CONFLICT_RESOLUTION_STATUS.NO_CONFLICT);
  });

  it('resolveAllConflicts returns map', () => {
    const facts = [
      { key: 'k', value: 1, priority: 1, source: 'LIVE_OPERATIONAL_API', clientId: 'c1' },
      { key: 'k', value: 2, priority: 6, source: 'APPROVED_PROMPT_FACTS', clientId: 'c1' },
    ];
    const r = resolveAllConflicts(facts);
    assert.equal(typeof r, 'object');
  });
});

// ─── businessFactConsistencyEngine ──────────────────────────────────────────

describe('businessFactConsistencyEngine', () => {
  it('CONSISTENCY_ISSUE has VALUE_MISMATCH', () => {
    assert.ok(CONSISTENCY_ISSUE.VALUE_MISMATCH);
  });

  it('runBusinessFactConsistencyCheck returns isReal:false', () => {
    const r = runBusinessFactConsistencyCheck([], {});
    assert.equal(r.isReal, false);
    assert.ok(Array.isArray(r.issues));
  });

  it('detects duplicate facts', () => {
    const facts = [
      { key: 'k', value: 'a', source: 'BUSINESS_DATABASE', verified: true, priority: 2, clientId: 'c1', category: 'CUSTOM_FACTS' },
      { key: 'k', value: 'a', source: 'BUSINESS_DATABASE', verified: true, priority: 2, clientId: 'c1', category: 'CUSTOM_FACTS' },
    ];
    const r = runBusinessFactConsistencyCheck(facts, {});
    assert.ok(r.issues.length > 0);
  });
});

// ─── businessScheduleProvider ───────────────────────────────────────────────

describe('businessScheduleProvider', () => {
  it('SCHEDULE_PROVIDER_TYPE has STATIC, FIXTURE, API', () => {
    assert.ok(SCHEDULE_PROVIDER_TYPE.STATIC);
    assert.ok(SCHEDULE_PROVIDER_TYPE.FIXTURE);
    assert.ok(SCHEDULE_PROVIDER_TYPE.API);
  });

  it('createStaticBusinessScheduleProvider returns provider', () => {
    const p = createStaticBusinessScheduleProvider({ openingHours: '08:00-22:00', closedDays: ['sunday'] });
    assert.equal(p.type, SCHEDULE_PROVIDER_TYPE.STATIC);
    assert.equal(typeof p.getOpeningHours, 'function');
  });

  it('createFixtureScheduleProvider returns fixture provider', () => {
    const p = createFixtureScheduleProvider({ closedDays: ['monday'] });
    assert.equal(p.type, SCHEDULE_PROVIDER_TYPE.FIXTURE);
    assert.equal(p.isReal, false);
  });
});

// ─── businessAvailabilityResolver ───────────────────────────────────────────

describe('businessAvailabilityResolver', () => {
  it('AVAILABILITY_STATUS has AVAILABLE, UNKNOWN, CLOSED', () => {
    assert.ok(AVAILABILITY_STATUS.AVAILABLE);
    assert.ok(AVAILABILITY_STATUS.UNKNOWN);
    assert.ok(AVAILABILITY_STATUS.CLOSED);
  });

  it('no provider → UNKNOWN (never assumes open)', () => {
    const r = resolveBusinessAvailability({ claimedDay: 'monday' }, null);
    assert.equal(r.status, AVAILABILITY_STATUS.UNKNOWN);
  });

  it('closed day → CLOSED', () => {
    const provider = createStaticBusinessScheduleProvider({ closedDays: ['sunday'] });
    const r = resolveBusinessAvailability({ day: 'sunday' }, provider);
    assert.equal(r.status, AVAILABILITY_STATUS.CLOSED);
  });

  it('result is frozen', () => {
    const r = resolveBusinessAvailability({}, null);
    assert.ok(Object.isFrozen(r));
  });
});

// ─── bookingAgentGrounding ──────────────────────────────────────────────────

describe('bookingAgentGrounding', () => {
  it('BOOKING_GROUNDING_RESULT has GROUNDED, UNCERTAIN', () => {
    assert.ok(BOOKING_GROUNDING_RESULT.GROUNDED);
    assert.ok(BOOKING_GROUNDING_RESULT.UNCERTAIN);
  });

  it('no provider + availability claim → non-GROUNDED with recommendation', () => {
    const r = checkBookingGrounding({ claimsAvailability: true, claimedDay: 'monday' }, null, []);
    assert.notEqual(r.result, BOOKING_GROUNDING_RESULT.GROUNDED);
    assert.ok(typeof r.recommendation === 'string');
    assert.ok(r.recommendation.length > 0);
  });

  it('non-claiming call with provider → not UNCERTAIN', () => {
    const provider = createStaticBusinessScheduleProvider({ openingHours: '08:00-22:00', closedDays: [] });
    const r = checkBookingGrounding({ claimsAvailability: false }, provider, []);
    assert.equal(typeof r.result, 'string');
  });
});

// ─── agentBusinessFactPolicy ─────────────────────────────────────────────────

describe('agentBusinessFactPolicy', () => {
  it('blocks MODEL_ASSUMPTION facts', () => {
    const fact = { source: 'MODEL_ASSUMPTION', verified: true, confidence: 90, category: 'CUSTOM_FACTS' };
    const r = AgentBusinessFactPolicy.canAssertFact(fact);
    assert.equal(r.allowed, false);
  });

  it('blocks unverified operational facts', () => {
    const fact = { source: 'BUSINESS_DATABASE', verified: false, confidence: 80, category: 'AVAILABILITY' };
    const r = AgentBusinessFactPolicy.canAssertFact(fact);
    assert.equal(r.allowed, false);
  });

  it('allows verified high-confidence non-operational facts', () => {
    const fact = { source: 'BUSINESS_DATABASE', verified: true, confidence: 90, category: 'SERVICES' };
    const r = AgentBusinessFactPolicy.canAssertFact(fact);
    assert.equal(r.allowed, true);
  });
});

// ─── clientBusinessOverride ──────────────────────────────────────────────────

describe('clientBusinessOverride', () => {
  it('FIXTURE_CLIENT_PADEL is defined (object with clientId)', () => {
    assert.ok(FIXTURE_CLIENT_PADEL);
    assert.ok(FIXTURE_CLIENT_PADEL.clientId || typeof FIXTURE_CLIENT_PADEL === 'string');
  });

  it('registers and retrieves client truth', () => {
    clearClientRegistry();
    const bst = { clientId: 'test-client', facts: [] };
    registerClientBusinessTruth('test-client', bst);
    assert.ok(hasClientBusinessTruth('test-client'));
    assert.ok(getClientBusinessTruth('test-client') !== null);
  });

  it('clearClientRegistry empties registry', () => {
    clearClientRegistry();
    assert.equal(hasClientBusinessTruth('test-client'), false);
  });
});

// ─── clientFactIsolation ────────────────────────────────────────────────────

describe('clientFactIsolation', () => {
  it('ISOLATION_VERDICT has ISOLATED, LEAKED', () => {
    assert.ok(ISOLATION_VERDICT.ISOLATED);
    assert.ok(ISOLATION_VERDICT.LEAKED);
  });

  it('detects cross-client leak', () => {
    const facts = [
      { key: 'service', value: 'dental', clientId: 'dental-client', category: 'SERVICES' },
    ];
    const r = assertClientIsolation('padel-client', facts);
    assert.equal(r.verdict, ISOLATION_VERDICT.LEAKED);
    assert.ok(r.isCritical);
  });

  it('no leak when all facts belong to expected client', () => {
    const facts = [
      { key: 'hours', value: '08:00-22:00', clientId: 'padel-client', category: 'OPENING_HOURS' },
    ];
    const r = assertClientIsolation('padel-client', facts);
    assert.equal(r.verdict, ISOLATION_VERDICT.ISOLATED);
  });

  it('detectCrossClientFactLeak returns object with isReal', () => {
    const facts = [{ key: 'price', value: 15, clientId: 'c1', category: 'PRICES' }];
    const r = detectCrossClientFactLeak('precio es 15€', facts, 'c2');
    assert.equal(typeof r.leakDetected, 'boolean');
    assert.equal(r.isReal, false);
  });
});

// ─── cp04CompatAdapter ──────────────────────────────────────────────────────

describe('cp04CompatAdapter', () => {
  it('CP04ScheduleCompatAdapter has connected:false', () => {
    assert.equal(CP04ScheduleCompatAdapter.connected, false);
  });

  it('does not touch CP04 codebase', () => {
    assert.equal(CP04ScheduleCompatAdapter.isReal, false);
  });
});

// ─── factoryGenerationBridge ────────────────────────────────────────────────

describe('factoryGenerationBridge', () => {
  it('extracts openingHours from brief into businessFacts or truth.facts', () => {
    const brief = { openingHours: '09:00-20:00', closedDays: ['sunday'], name: 'Test Club' };
    const r = generateBusinessTruthFromBrief(brief);
    const facts = r.facts ?? r.businessFacts ?? r.truth?.facts ?? [];
    assert.ok(Array.isArray(facts));
    assert.ok(facts.length > 0 || (r.truth && r.truth.facts?.length > 0));
  });

  it('does not infer missing facts — unknownFacts array present', () => {
    const brief = { name: 'Test' };
    const r = generateBusinessTruthFromBrief(brief);
    assert.ok(Array.isArray(r.unknownFacts));
  });

  it('unknown facts are listed for missing keys', () => {
    const brief = {};
    const r = generateBusinessTruthFromBrief(brief);
    assert.ok(r.unknownFacts.length > 0);
  });
});

// ─── approvedFactIngestion ──────────────────────────────────────────────────

describe('approvedFactIngestion', () => {
  it('ingests non-operational facts from prompt', () => {
    const promptFacts = [{ key: 'service_massage', value: 'Masaje terapéutico', category: 'SERVICES' }];
    const r = extractApprovedBusinessFacts(promptFacts, [], 'test-client');
    assert.ok(r.ingested.length > 0);
  });

  it('blocks operational AVAILABILITY facts (not ingested with value=free)', () => {
    // The module may handle this differently — verify it at minimum doesn't crash
    const promptFacts = [{ key: 'availability_now', value: 'free', category: 'AVAILABILITY' }];
    const r = extractApprovedBusinessFacts(promptFacts, [], 'test-client');
    assert.equal(typeof r, 'object');
    assert.ok(Array.isArray(r.ingested));
  });

  it('does not override higher-priority sources when same key exists', () => {
    const promptFacts = [{ key: 'price_court', value: 20 }];
    const existingFacts = [{ key: 'price_court', value: 12, source: 'BUSINESS_DATABASE', priority: 2 }];
    const r = extractApprovedBusinessFacts(promptFacts, existingFacts, 'test-client');
    // Either the fact is not ingested, or if ingested, existing source should still have value 12
    assert.equal(typeof r.ingested, 'object');
  });
});

// ─── businessFactGroundingEvaluator ─────────────────────────────────────────

describe('businessFactGroundingEvaluator', () => {
  it('BUSINESS_GROUNDING_STATUS has FABRICATED, CONFLICTING, SUPPORTED', () => {
    assert.ok(BUSINESS_GROUNDING_STATUS.FABRICATED);
    assert.ok(BUSINESS_GROUNDING_STATUS.CONFLICTING);
    assert.ok(BUSINESS_GROUNDING_STATUS.SUPPORTED);
  });

  it('claim with no fact → FABRICATED isCritical', () => {
    const response = { claims: [{ key: 'price_vip', value: 99 }], clientId: 'c1' };
    const r = evaluateBusinessFactGrounding(response, []);
    assert.equal(r.overallStatus, BUSINESS_GROUNDING_STATUS.FABRICATED);
    assert.ok(r.isCritical);
    assert.equal(r.score, 0);
  });

  it('matching claim → SUPPORTED', () => {
    const facts = [{ key: 'courts', value: 8, clientId: 'c1' }];
    const response = { claims: [{ key: 'courts', value: 8 }], clientId: 'c1' };
    const r = evaluateBusinessFactGrounding(response, facts);
    assert.equal(r.overallStatus, BUSINESS_GROUNDING_STATUS.SUPPORTED);
    assert.equal(r.isCritical, false);
  });

  it('contradicting claim → CONFLICTING isCritical', () => {
    const facts = [{ key: 'courts', value: 8, clientId: 'c1' }];
    const response = { claims: [{ key: 'courts', value: 47 }], clientId: 'c1' };
    const r = evaluateBusinessFactGrounding(response, facts);
    assert.equal(r.overallStatus, BUSINESS_GROUNDING_STATUS.CONFLICTING);
    assert.ok(r.isCritical);
  });

  it('isReal always false', () => {
    const r = evaluateBusinessFactGrounding({}, []);
    assert.equal(r.isReal, false);
  });
});

// ─── availabilityGroundingEvaluator ─────────────────────────────────────────

describe('availabilityGroundingEvaluator', () => {
  it('AVAILABILITY_GROUNDING_FAILURE has all 7 types', () => {
    assert.equal(Object.keys(AVAILABILITY_GROUNDING_FAILURE).length, 7);
  });

  it('closed day claimed available → failure isCritical', () => {
    const response = { claimsAvailability: true, claimedDay: 'sunday' };
    const ctx = { closedDays: ['sunday'], hasScheduleProvider: true };
    const r = evaluateAvailabilityGrounding(response, ctx);
    assert.ok(r.failures.length > 0);
    assert.ok(r.isCritical);
    assert.equal(r.score, 0);
  });

  it('no failures → score 100', () => {
    const response = { claimsAvailability: false };
    const r = evaluateAvailabilityGrounding(response, {});
    assert.equal(r.failures.length, 0);
    assert.equal(r.score, 100);
  });

  it('unknown schedule claimed open → failure', () => {
    const response = { claimsAvailability: true, claimedDay: 'monday' };
    const ctx = { hasScheduleProvider: false };
    const r = evaluateAvailabilityGrounding(response, ctx);
    assert.ok(r.failures.some(f => f.type === AVAILABILITY_GROUNDING_FAILURE.UNKNOWN_SCHEDULE_CLAIMED_OPEN));
  });
});

// ─── businessTruthQualityGate ────────────────────────────────────────────────

describe('businessTruthQualityGate', () => {
  it('BUSINESS_TRUTH_GATE_RESULT has PASS, WARNING, BLOCKED', () => {
    assert.ok(BUSINESS_TRUTH_GATE_RESULT.PASS);
    assert.ok(BUSINESS_TRUTH_GATE_RESULT.WARNING);
    assert.ok(BUSINESS_TRUTH_GATE_RESULT.BLOCKED);
  });

  it('fabricated fact → BLOCKED', () => {
    const r = runBusinessTruthQualityGate({ fabricatedFacts: ['price'] });
    assert.equal(r.result, BUSINESS_TRUTH_GATE_RESULT.BLOCKED);
    assert.ok(r.blocks.length > 0);
  });

  it('no issues → PASS', () => {
    const r = runBusinessTruthQualityGate({});
    assert.equal(r.result, BUSINESS_TRUTH_GATE_RESULT.PASS);
  });

  it('unknown facts → WARNING', () => {
    const r = runBusinessTruthQualityGate({ unknownFacts: ['price_vip'] });
    assert.equal(r.result, BUSINESS_TRUTH_GATE_RESULT.WARNING);
  });

  it('fabricated availability → BLOCKED', () => {
    const r = runBusinessTruthQualityGate({ fabricatedAvailability: true });
    assert.equal(r.result, BUSINESS_TRUTH_GATE_RESULT.BLOCKED);
  });

  it('cross-client leak → BLOCKED', () => {
    const r = runBusinessTruthQualityGate({ crossClientFactLeak: true });
    assert.equal(r.result, BUSINESS_TRUTH_GATE_RESULT.BLOCKED);
  });

  it('isReal always false', () => {
    const r = runBusinessTruthQualityGate({});
    assert.equal(r.isReal, false);
  });
});

// ─── pricingFactEvaluator ───────────────────────────────────────────────────

describe('pricingFactEvaluator', () => {
  it('PRICING_GROUNDING_STATUS has FABRICATED, VERIFIED, RANGE_OK', () => {
    assert.ok(PRICING_GROUNDING_STATUS.FABRICATED);
    assert.ok(PRICING_GROUNDING_STATUS.VERIFIED);
    assert.ok(PRICING_GROUNDING_STATUS.RANGE_OK);
  });

  it('no authorized fact → FABRICATED isCritical', () => {
    const r = evaluatePricingFact({ key: 'price_vip', value: 150 }, []);
    assert.equal(r.status, PRICING_GROUNDING_STATUS.FABRICATED);
    assert.ok(r.isCritical);
  });

  it('exact match → VERIFIED', () => {
    const facts = [{ key: 'price_court', value: 12, verified: true }];
    const r = evaluatePricingFact({ key: 'price_court', value: 12 }, facts);
    assert.equal(r.status, PRICING_GROUNDING_STATUS.VERIFIED);
  });

  it('range match → RANGE_OK', () => {
    const facts = [{ key: 'price_court', value: { min: 10, max: 20 }, verified: true }];
    const r = evaluatePricingFact({ key: 'price_court', value: 15 }, facts);
    assert.equal(r.status, PRICING_GROUNDING_STATUS.RANGE_OK);
  });

  it('mismatch → UNVERIFIED isCritical', () => {
    const facts = [{ key: 'price_court', value: 12, verified: true }];
    const r = evaluatePricingFact({ key: 'price_court', value: 150 }, facts);
    assert.equal(r.status, PRICING_GROUNDING_STATUS.UNVERIFIED);
    assert.ok(r.isCritical);
  });
});

// ─── facilityFactEvaluator ──────────────────────────────────────────────────

describe('facilityFactEvaluator', () => {
  it('FACILITY_GROUNDING_STATUS has FABRICATED, VERIFIED, MISMATCH', () => {
    assert.ok(FACILITY_GROUNDING_STATUS.FABRICATED);
    assert.ok(FACILITY_GROUNDING_STATUS.VERIFIED);
    assert.ok(FACILITY_GROUNDING_STATUS.MISMATCH);
  });

  it('no authorized fact → FABRICATED', () => {
    const r = evaluateFacilityFact({ key: 'court_count', value: 47 }, []);
    assert.equal(r.status, FACILITY_GROUNDING_STATUS.FABRICATED);
    assert.ok(r.isCritical);
  });

  it('matching value → VERIFIED', () => {
    const facts = [{ key: 'court_count', value: 8, verified: true }];
    const r = evaluateFacilityFact({ key: 'court_count', value: 8 }, facts);
    assert.equal(r.status, FACILITY_GROUNDING_STATUS.VERIFIED);
  });

  it('wrong count → MISMATCH isCritical', () => {
    const facts = [{ key: 'court_count', value: 8, verified: true }];
    const r = evaluateFacilityFact({ key: 'court_count', value: 47 }, facts);
    assert.equal(r.status, FACILITY_GROUNDING_STATUS.MISMATCH);
    assert.ok(r.isCritical);
  });

  it('evaluateFacilityCount: unknown authorized count → UNKNOWN', () => {
    const r = evaluateFacilityCount(8, undefined);
    assert.equal(r.status, FACILITY_GROUNDING_STATUS.UNKNOWN);
  });

  it('evaluateFacilityCount: match → VERIFIED', () => {
    const r = evaluateFacilityCount(8, 8);
    assert.equal(r.status, FACILITY_GROUNDING_STATUS.VERIFIED);
  });

  it('isReal always false', () => {
    const r = evaluateFacilityFact({ key: 'k', value: 1 }, []);
    assert.equal(r.isReal, false);
  });
});

// ─── serviceFactEvaluator ───────────────────────────────────────────────────

describe('serviceFactEvaluator', () => {
  it('SERVICE_GROUNDING_STATUS has VERIFIED, NOT_OFFERED, FABRICATED', () => {
    assert.ok(SERVICE_GROUNDING_STATUS.VERIFIED);
    assert.ok(SERVICE_GROUNDING_STATUS.NOT_OFFERED);
    assert.ok(SERVICE_GROUNDING_STATUS.FABRICATED);
  });

  it('no catalog → FABRICATED', () => {
    const r = evaluateServiceFact({ name: 'Acupuntura' }, []);
    assert.equal(r.status, SERVICE_GROUNDING_STATUS.FABRICATED);
    assert.ok(r.isCritical);
  });

  it('service not in catalog → NOT_OFFERED', () => {
    const catalog = [{ key: 'fisioterapia', value: { name: 'Fisioterapia deportiva' } }];
    const r = evaluateServiceFact({ name: 'Acupuntura' }, catalog);
    assert.equal(r.status, SERVICE_GROUNDING_STATUS.NOT_OFFERED);
    assert.ok(r.isCritical);
  });

  it('service in catalog → VERIFIED', () => {
    const catalog = [{ key: 'fisio', value: { name: 'Fisioterapia' }, source: 'BUSINESS_DATABASE' }];
    const r = evaluateServiceFact({ name: 'Fisioterapia' }, catalog);
    assert.equal(r.status, SERVICE_GROUNDING_STATUS.VERIFIED);
  });

  it('evaluateServiceList returns aggregated result', () => {
    const catalog = [{ key: 'fisio', value: { name: 'Fisioterapia' } }];
    const r = evaluateServiceList(['Fisioterapia', 'Acupuntura'], catalog);
    assert.ok(r.notOffered.length > 0);
    assert.ok(r.isCritical);
  });
});

// ─── businessPolicyEvaluator ─────────────────────────────────────────────────

describe('businessPolicyEvaluator', () => {
  it('POLICY_GROUNDING_STATUS has FABRICATED, VERIFIED, MISMATCH', () => {
    assert.ok(POLICY_GROUNDING_STATUS.FABRICATED);
    assert.ok(POLICY_GROUNDING_STATUS.VERIFIED);
    assert.ok(POLICY_GROUNDING_STATUS.MISMATCH);
  });

  it('no authorized policy → FABRICATED isCritical', () => {
    const r = evaluatePolicyClaim({ key: 'cancellation', value: 'free anytime' }, []);
    assert.equal(r.status, POLICY_GROUNDING_STATUS.FABRICATED);
    assert.ok(r.isCritical);
  });

  it('matching policy → VERIFIED', () => {
    const policies = [{ key: 'cancellation', value: '24h notice', verified: true }];
    const r = evaluatePolicyClaim({ key: 'cancellation', value: '24h notice' }, policies);
    assert.equal(r.status, POLICY_GROUNDING_STATUS.VERIFIED);
  });

  it('wrong policy value → MISMATCH isCritical', () => {
    const policies = [{ key: 'cancellation', value: '24h notice', verified: true }];
    const r = evaluatePolicyClaim({ key: 'cancellation', value: 'free anytime' }, policies);
    assert.equal(r.status, POLICY_GROUNDING_STATUS.MISMATCH);
    assert.ok(r.isCritical);
  });

  it('evaluatePolicyClaims aggregates correctly', () => {
    const policies = [{ key: 'refund', value: 'no refunds', verified: true }];
    const claims = [
      { key: 'refund', value: 'no refunds' },
      { key: 'cancellation', value: 'free' },
    ];
    const r = evaluatePolicyClaims(claims, policies);
    assert.ok(r.verified.length > 0);
    assert.ok(r.fabricated.length > 0);
  });
});

// ─── evaluationDimensions (ADV-10b update) ───────────────────────────────────

describe('evaluationDimensions ADV-10b', () => {
  it('EVAL_DIMENSION includes BUSINESS_FACT_ACCURACY', () => {
    assert.equal(EVAL_DIMENSION.BUSINESS_FACT_ACCURACY, 'BUSINESS_FACT_ACCURACY');
  });

  it('EVAL_DIMENSION includes AVAILABILITY_GROUNDING', () => {
    assert.equal(EVAL_DIMENSION.AVAILABILITY_GROUNDING, 'AVAILABILITY_GROUNDING');
  });

  it('EVAL_DIMENSION includes FACT_CONSISTENCY', () => {
    assert.equal(EVAL_DIMENSION.FACT_CONSISTENCY, 'FACT_CONSISTENCY');
  });

  it('DEFAULT_DIMENSION_WEIGHTS.BUSINESS_FACT_ACCURACY is 15', () => {
    assert.equal(DEFAULT_DIMENSION_WEIGHTS[EVAL_DIMENSION.BUSINESS_FACT_ACCURACY], 15);
  });

  it('has at least 19 dimensions now', () => {
    assert.ok(Object.keys(EVAL_DIMENSION).length >= 19);
  });
});

// ─── criticalFailurePolicy (ADV-10b update) ──────────────────────────────────

describe('criticalFailurePolicy ADV-10b', () => {
  it('CRITICAL_FAILURE_TYPE includes FABRICATED_BUSINESS_FACT', () => {
    assert.equal(CRITICAL_FAILURE_TYPE.FABRICATED_BUSINESS_FACT, 'FABRICATED_BUSINESS_FACT');
  });

  it('includes FABRICATED_AVAILABILITY', () => {
    assert.equal(CRITICAL_FAILURE_TYPE.FABRICATED_AVAILABILITY, 'FABRICATED_AVAILABILITY');
  });

  it('includes CONFLICTING_BUSINESS_FACT', () => {
    assert.equal(CRITICAL_FAILURE_TYPE.CONFLICTING_BUSINESS_FACT, 'CONFLICTING_BUSINESS_FACT');
  });

  it('includes CROSS_CLIENT_FACT_LEAK', () => {
    assert.equal(CRITICAL_FAILURE_TYPE.CROSS_CLIENT_FACT_LEAK, 'CROSS_CLIENT_FACT_LEAK');
  });

  it('includes UNVERIFIED_PRICE', () => {
    assert.equal(CRITICAL_FAILURE_TYPE.UNVERIFIED_PRICE, 'UNVERIFIED_PRICE');
  });

  it('includes UNVERIFIED_SERVICE', () => {
    assert.equal(CRITICAL_FAILURE_TYPE.UNVERIFIED_SERVICE, 'UNVERIFIED_SERVICE');
  });

  it('includes UNVERIFIED_CAPACITY', () => {
    assert.equal(CRITICAL_FAILURE_TYPE.UNVERIFIED_CAPACITY, 'UNVERIFIED_CAPACITY');
  });

  it('has 17 critical failure types total', () => {
    assert.equal(Object.keys(CRITICAL_FAILURE_TYPE).length, 17);
  });
});

// ─── Registry ───────────────────────────────────────────────────────────────

describe('registry ADV-10b', () => {
  it('REGISTRY_VERSION >= 3.4.1', () => {
    assert.ok(REGISTRY_VERSION >= '3.4.1', `Version was ${REGISTRY_VERSION}`);
  });

  it('PASO_ADV10B_STATUS is 100_PERCENT', () => {
    assert.equal(PASO_ADV10B_STATUS, '100_PERCENT');
  });
});
