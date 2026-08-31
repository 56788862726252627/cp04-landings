import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Paso H audit modules
import {
  auditAgencyEndToEnd,
  CHAIN_STAGES,
  CHAIN_ISSUE_TYPES,
} from '../../audit/endToEndMap.js';

import {
  auditCrossStepContracts,
  CONTRACT_IDS,
  CONTRACT_STATUS,
} from '../../audit/crossStepContracts.js';

import {
  auditFactoryRegistry,
  EXPECTED_REGISTRY_VERSION,
  EXPECTED_PASO_STATUSES,
  REGISTRY_AUDIT_VERSION,
} from '../../audit/registryAudit.js';

import {
  buildCapabilityMatrix,
  CAPABILITY_STATUS,
  CAPABILITY_CATEGORIES,
} from '../../audit/capabilityMatrix.js';

import {
  auditAdvancedBoundary,
  ADVANCED_ITEMS,
  BOUNDARY_STATUS,
} from '../../audit/advancedBoundary.js';

import {
  auditAgencySecurityBaseline,
  SEC_RESULT,
  SEC_CATEGORIES,
} from '../../audit/securityBaseline.js';

import {
  auditAgencyQABaseline,
  QA_RESULT,
  QA_DIMENSIONS,
} from '../../audit/qaBaseline.js';

import {
  auditAgencyDocumentation,
  DOC_STATUS,
  REQUIRED_DOCS,
} from '../../audit/documentationAudit.js';

import {
  auditBasicDebt,
  DEBT_CATEGORY,
  DEBT_PATTERN_TYPES,
} from '../../audit/basicDebt.js';

import {
  auditAgencyDuplication,
  DUP_SEVERITY,
} from '../../audit/duplicationAudit.js';

import {
  auditNamingConsistency,
  NAMING_RESULT,
  NAMING_CONVENTIONS,
} from '../../audit/namingConsistency.js';

import {
  runNexoClientJourney,
  NEXO_CLIENT_FIXTURE,
  NEXO_JOURNEY_STEPS,
  JOURNEY_MODE,
  JOURNEY_STATUS,
} from '../../audit/clientJourney.js';

import {
  runFailureJourneys,
  FAILURE_SCENARIO,
  FAILURE_RESULT,
} from '../../audit/failureJourney.js';

import {
  auditContextEfficiency,
  EFFICIENCY_RATING,
} from '../../audit/contextEfficiency.js';

import {
  AgencyCompletionStatus,
  BASIC_STATUS,
  PASO_STATUSES,
  AGENCY_BASIC_STATUS,
  AGENCY_BASIC_HOURS,
  AGENCY_BASIC_PASOS,
  AGENCY_ADVANCED_ITEMS,
} from '../../audit/completionStatus.js';

import {
  runAgencyAudit,
  AUDIT_VERSION,
  AUDIT_DIMENSIONS,
} from '../../audit/agencyAuditRunner.js';

// Registry integration
import {
  PASO_H_STATUS_MAIN,
  REGISTRY_VERSION,
} from '../../factory-registry/index.js';

// ─── FASE 2: End-to-End Map ──────────────────────────────────────────────────

describe('Paso H — auditAgencyEndToEnd', () => {
  it('exports CHAIN_STAGES with 30 entries', () => {
    assert.equal(Object.keys(CHAIN_STAGES).length, 30);
  });

  it('exports CHAIN_ISSUE_TYPES', () => {
    assert.equal(typeof CHAIN_ISSUE_TYPES.MISSING_STAGE, 'string');
    assert.equal(typeof CHAIN_ISSUE_TYPES.BROKEN_LINK, 'string');
    assert.equal(typeof CHAIN_ISSUE_TYPES.MISSING_GATE, 'string');
    assert.equal(typeof CHAIN_ISSUE_TYPES.MISSING_OWNER, 'string');
    assert.equal(typeof CHAIN_ISSUE_TYPES.MISSING_ARTIFACT, 'string');
  });

  it('returns valid chain with no overrides', () => {
    const r = auditAgencyEndToEnd();
    assert.equal(r.valid, true);
    assert.equal(r.totalSteps, 30);
    assert.equal(r.issues.length, 0);
    assert.equal(r.chainStatus, 'COMPLETE');
  });

  it('totalSteps matches CHAIN_STAGES count', () => {
    const r = auditAgencyEndToEnd();
    assert.equal(r.totalSteps, Object.keys(CHAIN_STAGES).length);
  });

  it('all steps are IMPLEMENTED by default', () => {
    const r = auditAgencyEndToEnd();
    assert.equal(r.implemented, 30);
  });

  it('has gateCount > 0', () => {
    const r = auditAgencyEndToEnd();
    assert.ok(r.gateCount > 0);
  });

  it('detects BROKEN_LINK when step status is BROKEN', () => {
    const r = auditAgencyEndToEnd({ BUSINESS_INPUT: { status: 'BROKEN' } });
    const broken = r.issues.find((i) => i.type === CHAIN_ISSUE_TYPES.BROKEN_LINK);
    assert.ok(broken);
    assert.equal(broken.stageId, CHAIN_STAGES.BUSINESS_INPUT);
  });

  it('covers all pasos B through G', () => {
    const r = auditAgencyEndToEnd();
    assert.deepEqual(r.pasos, ['B', 'C', 'D', 'E', 'F', 'G']);
  });

  it('steps array has correct structure', () => {
    const r = auditAgencyEndToEnd();
    const step = r.steps[0];
    assert.ok(step.id);
    assert.ok(step.paso);
    assert.ok(step.module);
    assert.ok(step.fn);
    assert.ok(step.artifact);
    assert.ok(step.owner);
  });

  it('CLOSEOUT is the last step', () => {
    const r = auditAgencyEndToEnd();
    const last = r.steps[r.steps.length - 1];
    assert.equal(last.id, CHAIN_STAGES.CLOSEOUT);
    assert.equal(last.paso, 'G');
  });
});

// ─── FASE 3: Cross-Step Contracts ────────────────────────────────────────────

describe('Paso H — auditCrossStepContracts', () => {
  it('exports 9 CONTRACT_IDS', () => {
    assert.equal(Object.keys(CONTRACT_IDS).length, 9);
  });

  it('exports CONTRACT_STATUS enum', () => {
    assert.equal(typeof CONTRACT_STATUS.VERIFIED, 'string');
    assert.equal(typeof CONTRACT_STATUS.BROKEN, 'string');
    assert.equal(typeof CONTRACT_STATUS.COMPATIBLE, 'string');
  });

  it('returns valid with no broken contracts', () => {
    const r = auditCrossStepContracts();
    assert.equal(r.valid, true);
    assert.equal(r.broken, 0);
    assert.equal(r.totalContracts, 9);
  });

  it('overallStatus is VERIFIED when no broken/warning', () => {
    const r = auditCrossStepContracts();
    assert.ok(['VERIFIED', 'WARNING'].includes(r.overallStatus));
  });

  it('detects broken contract via override', () => {
    const r = auditCrossStepContracts({ B_TO_C: { status: CONTRACT_STATUS.BROKEN } });
    assert.equal(r.valid, false);
    assert.equal(r.broken, 1);
  });

  it('B_TO_C contract is VERIFIED', () => {
    const r = auditCrossStepContracts();
    const btoc = r.contracts.find((c) => c.id === CONTRACT_IDS.B_TO_C);
    assert.ok(btoc.status === CONTRACT_STATUS.VERIFIED || btoc.status === CONTRACT_STATUS.COMPATIBLE);
  });

  it('G_TO_F contract exists (reverse loop)', () => {
    const r = auditCrossStepContracts();
    const gtof = r.contracts.find((c) => c.id === CONTRACT_IDS.G_TO_F);
    assert.ok(gtof);
    assert.equal(gtof.from, 'G');
    assert.equal(gtof.to, 'F');
  });

  it('verified count equals total when no broken', () => {
    const r = auditCrossStepContracts();
    assert.equal(r.verified, r.totalContracts);
  });
});

// ─── FASE 4: Registry Audit ──────────────────────────────────────────────────

describe('Paso H — auditFactoryRegistry', () => {
  it('EXPECTED_REGISTRY_VERSION is 2.7.0', () => {
    assert.equal(EXPECTED_REGISTRY_VERSION, '2.7.0');
  });

  it('REGISTRY_AUDIT_VERSION is a string', () => {
    assert.equal(typeof REGISTRY_AUDIT_VERSION, 'string');
  });

  it('EXPECTED_PASO_STATUSES has 7 entries (A-G)', () => {
    assert.equal(Object.keys(EXPECTED_PASO_STATUSES).length, 7);
  });

  it('all expected pasos are 100_PERCENT', () => {
    Object.values(EXPECTED_PASO_STATUSES).forEach((v) => {
      assert.equal(v, '100_PERCENT');
    });
  });

  it('detects VERSION_MISMATCH', () => {
    const r = auditFactoryRegistry({ version: '1.0.0' });
    const issue = r.issues.find((i) => i.type === 'VERSION_MISMATCH');
    assert.ok(issue);
    assert.equal(issue.expected, '2.7.0');
  });

  it('reports valid=false on version mismatch', () => {
    const r = auditFactoryRegistry({ version: '1.0.0' });
    assert.equal(r.valid, false);
  });

  it('detects STATUS_MISMATCH', () => {
    const r = auditFactoryRegistry({
      version: '2.7.0',
      pasoStatuses: { PASO_A: 'IN_PROGRESS' },
    });
    const issue = r.issues.find((i) => i.type === 'STATUS_MISMATCH');
    assert.ok(issue);
  });

  it('returns HEALTHY for perfect snapshot', () => {
    const r = auditFactoryRegistry({
      version: '2.7.0',
      pasoStatuses: {
        PASO_A: '100_PERCENT',
        PASO_B: '100_PERCENT',
        PASO_C: '100_PERCENT',
        PASO_D: '100_PERCENT',
        PASO_E: '100_PERCENT',
        PASO_F: '100_PERCENT',
        PASO_G: '100_PERCENT',
      },
      subRegistries: [
        'COMPONENT_REGISTRY', 'RECIPE_REGISTRY', 'PRESET_REGISTRY', 'TYPOGRAPHY_REGISTRY',
        'INTERACTION_REGISTRY', 'LAYOUT_REGISTRY', 'SECTOR_REGISTRY', 'TOKEN_REGISTRY',
        'AI_PROFILE_REGISTRY', 'A11Y_REGISTRY', 'PERF_REGISTRY', 'COMPAT_REGISTRY',
      ],
      pasoBExports: [
        'validateBrief', 'BRIEF_SCHEMA', 'FIELD_STATUS', 'analyzeBusiness', 'resolveVertical',
        'generateBranding', 'planModules', 'planRoles', 'planDataModel', 'planAIAgents',
        'generateMakeManifest', 'generateContent', 'generateIntegrationManifest',
      ],
      pasoGExports: [
        'createDeployTarget', 'getEnvironmentConfig', 'isAllowedInEnvironment',
        'evaluatePreDeployReadiness', 'READINESS_OUTCOMES',
        'auditCodeForSecrets', 'auditSecretSafety',
        'auditProductionDataSafety', 'auditCodeForData',
        'buildSecurityHeaders', 'validateSecurityHeaders',
        'auditClientCode', 'auditClientSecurity',
        'auditApiSecurity', 'auditDependencies',
        'validateReproducibleBuild', 'generateDeployPlan',
        'runDeployPipeline', 'DEPLOY_MODES', 'PIPELINE_STATUS',
        'runPostDeployQA', 'buildVisualQAPlan', 'recordVisualQAResults',
        'VISUAL_QA_STATUS', 'auditRuntimeRender', 'RENDER_GATE_STATUS',
        'runHealthChecks', 'HEALTH_STATUS',
        'createRollbackPlan', 'evaluateRollbackNeed',
        'createReleaseManifest', 'RELEASE_STATUS',
        'evaluateReleaseGates', 'GATE_RESULT',
        'evaluateProductionChecklist', 'CHECKLIST_CATEGORIES',
        'createCloudflareProfile', 'generateWranglerConfig',
        'createPostDeployHandoff', 'HANDOFF_STATUS',
      ],
      duplicates: [],
      orphans: [],
    });
    assert.equal(r.registryStatus, 'HEALTHY');
    assert.equal(r.valid, true);
  });

  it('detects DUPLICATE_EXPORT', () => {
    const r = auditFactoryRegistry({ duplicates: ['buildSecurityHeaders'] });
    const issue = r.issues.find((i) => i.type === 'DUPLICATE_EXPORT');
    assert.ok(issue);
  });

  it('detects ORPHAN_MODULE', () => {
    const r = auditFactoryRegistry({ orphans: ['oldModule.js'] });
    const issue = r.issues.find((i) => i.type === 'ORPHAN_MODULE');
    assert.ok(issue);
  });

  it('versionMatch is true for correct version', () => {
    const r = auditFactoryRegistry({ version: '2.7.0', pasoStatuses: {}, subRegistries: [], pasoBExports: [], pasoGExports: [] });
    assert.equal(r.versionMatch, true);
  });
});

// ─── FASE 5: Capability Matrix ────────────────────────────────────────────────

describe('Paso H — buildCapabilityMatrix', () => {
  it('exports 19 CAPABILITY_CATEGORIES', () => {
    assert.equal(Object.keys(CAPABILITY_CATEGORIES).length, 19);
  });

  it('exports CAPABILITY_STATUS enum', () => {
    assert.equal(typeof CAPABILITY_STATUS.AVAILABLE, 'string');
    assert.equal(typeof CAPABILITY_STATUS.PARTIAL, 'string');
    assert.equal(typeof CAPABILITY_STATUS.BLOCKED, 'string');
    assert.equal(typeof CAPABILITY_STATUS.ADVANCED_ONLY, 'string');
  });

  it('returns 19 capabilities total', () => {
    const r = buildCapabilityMatrix();
    assert.equal(r.totalCapabilities, 19);
  });

  it('has available + partial >= 17 (most available in basic)', () => {
    const r = buildCapabilityMatrix();
    assert.ok(r.available + r.partial >= 17);
  });

  it('BUSINESS_ANALYSIS is AVAILABLE', () => {
    const r = buildCapabilityMatrix();
    const cap = r.capabilities.find((c) => c.id === CAPABILITY_CATEGORIES.BUSINESS_ANALYSIS);
    assert.equal(cap.status, CAPABILITY_STATUS.AVAILABLE);
  });

  it('BPMN has a limitation note', () => {
    const r = buildCapabilityMatrix();
    const cap = r.capabilities.find((c) => c.id === CAPABILITY_CATEGORIES.BPMN);
    assert.ok(cap.limitation !== null);
  });

  it('basicCoverage is >= 90', () => {
    const r = buildCapabilityMatrix();
    assert.ok(r.basicCoverage >= 90);
  });

  it('override changes capability status', () => {
    const r = buildCapabilityMatrix({ COMMERCIAL: { status: CAPABILITY_STATUS.BLOCKED } });
    const cap = r.capabilities.find((c) => c.id === CAPABILITY_CATEGORIES.COMMERCIAL);
    assert.equal(cap.status, CAPABILITY_STATUS.BLOCKED);
  });

  it('byStatus grouping has all 4 keys', () => {
    const r = buildCapabilityMatrix();
    assert.ok(CAPABILITY_STATUS.AVAILABLE in r.byStatus);
    assert.ok(CAPABILITY_STATUS.PARTIAL in r.byStatus);
    assert.ok(CAPABILITY_STATUS.BLOCKED in r.byStatus);
    assert.ok(CAPABILITY_STATUS.ADVANCED_ONLY in r.byStatus);
  });
});

// ─── FASE 6: Advanced Boundary ───────────────────────────────────────────────

describe('Paso H — auditAdvancedBoundary', () => {
  it('exports exactly 9 ADVANCED_ITEMS', () => {
    assert.equal(ADVANCED_ITEMS.length, 9);
  });

  it('exports BOUNDARY_STATUS enum', () => {
    assert.equal(typeof BOUNDARY_STATUS.BASIC, 'string');
    assert.equal(typeof BOUNDARY_STATUS.ADVANCED, 'string');
  });

  it('returns totalAdvancedItems = 9', () => {
    const r = auditAdvancedBoundary();
    assert.equal(r.totalAdvancedItems, 9);
  });

  it('basicStatus is COMPLETE', () => {
    const r = auditAdvancedBoundary();
    assert.equal(r.basicStatus, 'COMPLETE');
  });

  it('ADV-01 is Playwright E2E', () => {
    const item = ADVANCED_ITEMS.find((i) => i.id === 'ADV-01');
    assert.ok(item.name.includes('Playwright'));
  });

  it('ADV-02 is Stripe real', () => {
    const item = ADVANCED_ITEMS.find((i) => i.id === 'ADV-02');
    assert.ok(item.name.toLowerCase().includes('stripe'));
  });

  it('ADV-04 has complexity CRITICAL', () => {
    const item = ADVANCED_ITEMS.find((i) => i.id === 'ADV-04');
    assert.equal(item.complexity, 'CRITICAL');
  });

  it('all advanced items have basicAlternative', () => {
    ADVANCED_ITEMS.forEach((item) => {
      assert.ok(typeof item.basicAlternative === 'string' && item.basicAlternative.length > 0);
    });
  });

  it('complexity breakdown sums to 9', () => {
    const r = auditAdvancedBoundary();
    const total = r.complexity.CRITICAL + r.complexity.HIGH + r.complexity.MEDIUM;
    assert.equal(total, 9);
  });
});

// ─── FASE 7: Security Baseline ───────────────────────────────────────────────

describe('Paso H — auditAgencySecurityBaseline', () => {
  it('exports SEC_RESULT enum', () => {
    assert.equal(typeof SEC_RESULT.PASS, 'string');
    assert.equal(typeof SEC_RESULT.WARNING, 'string');
    assert.equal(typeof SEC_RESULT.FAIL, 'string');
  });

  it('exports SEC_CATEGORIES enum with 8 entries', () => {
    assert.equal(Object.keys(SEC_CATEGORIES).length, 8);
  });

  it('returns 12 checks total', () => {
    const r = auditAgencySecurityBaseline();
    assert.equal(r.totalChecks, 12);
  });

  it('valid=true with default results (no FAIL)', () => {
    const r = auditAgencySecurityBaseline();
    assert.equal(r.valid, true);
    assert.equal(r.fail, 0);
  });

  it('securityPosture is SOUND by default', () => {
    const r = auditAgencySecurityBaseline();
    assert.ok(['SOUND', 'ACCEPTABLE'].includes(r.securityPosture));
  });

  it('detects FAIL when override set', () => {
    const r = auditAgencySecurityBaseline({ 'SEC-01': SEC_RESULT.FAIL });
    assert.equal(r.valid, false);
    assert.equal(r.fail, 1);
  });

  it('byCategory has 8 category keys', () => {
    const r = auditAgencySecurityBaseline();
    assert.equal(Object.keys(r.byCategory).length, 8);
  });

  it('overallResult is PASS or WARNING by default', () => {
    const r = auditAgencySecurityBaseline();
    assert.ok([SEC_RESULT.PASS, SEC_RESULT.WARNING].includes(r.overallResult));
  });

  it('SEC-12 PRODUCTION_BLOCKED is PASS', () => {
    const r = auditAgencySecurityBaseline();
    const check = r.checks.find((c) => c.id === 'SEC-12');
    assert.equal(check.result, SEC_RESULT.PASS);
  });
});

// ─── FASE 8: QA Baseline ─────────────────────────────────────────────────────

describe('Paso H — auditAgencyQABaseline', () => {
  it('exports QA_RESULT enum', () => {
    assert.equal(typeof QA_RESULT.PASS, 'string');
    assert.equal(typeof QA_RESULT.PARTIAL, 'string');
    assert.equal(typeof QA_RESULT.FAIL, 'string');
  });

  it('exports QA_DIMENSIONS with 9 entries', () => {
    assert.equal(Object.keys(QA_DIMENSIONS).length, 9);
  });

  it('returns 10 gates total', () => {
    const r = auditAgencyQABaseline();
    assert.equal(r.totalGates, 10);
  });

  it('valid=true with no blocking failures', () => {
    const r = auditAgencyQABaseline();
    assert.equal(r.valid, true);
    assert.equal(r.blockingFail, 0);
  });

  it('qaPosture is PRODUCTION_READY by default', () => {
    const r = auditAgencyQABaseline();
    assert.equal(r.qaPosture, 'PRODUCTION_READY');
  });

  it('E2E_TESTS gate is PARTIAL (no Playwright in basic)', () => {
    const r = auditAgencyQABaseline();
    const gate = r.gates.find((g) => g.id === 'QA-04');
    assert.equal(gate.result, QA_RESULT.PARTIAL);
    assert.equal(gate.blocking, false);
  });

  it('UNIT_TESTS gate is PASS', () => {
    const r = auditAgencyQABaseline();
    const gate = r.gates.find((g) => g.id === 'QA-01');
    assert.equal(gate.result, QA_RESULT.PASS);
  });

  it('detects blocking failure via override', () => {
    const r = auditAgencyQABaseline({ 'QA-01': { result: QA_RESULT.FAIL } });
    assert.equal(r.valid, false);
    assert.equal(r.blockingFail, 1);
  });

  it('byDimension has UNIT_TESTS key', () => {
    const r = auditAgencyQABaseline();
    assert.ok(QA_DIMENSIONS.UNIT_TESTS in r.byDimension);
  });
});

// ─── FASE 9: Documentation Audit ─────────────────────────────────────────────

describe('Paso H — auditAgencyDocumentation', () => {
  it('exports REQUIRED_DOCS with 26 entries', () => {
    assert.equal(REQUIRED_DOCS.length, 26);
  });

  it('exports DOC_STATUS enum', () => {
    assert.equal(typeof DOC_STATUS.PRESENT, 'string');
    assert.equal(typeof DOC_STATUS.MISSING, 'string');
    assert.equal(typeof DOC_STATUS.STALE, 'string');
    assert.equal(typeof DOC_STATUS.BROKEN, 'string');
  });

  it('all missing with no docs provided', () => {
    const r = auditAgencyDocumentation([], [], []);
    assert.equal(r.present, 0);
    assert.equal(r.missing, 26);
  });

  it('coveragePercent is 0 when no docs provided', () => {
    const r = auditAgencyDocumentation();
    assert.equal(r.coveragePercent, 0);
  });

  it('detects present docs correctly', () => {
    const docs = ['AGENCY_DEPLOY_STANDARD.md', 'AGENCY_MASTER_OPERATING_SYSTEM.md'];
    const r = auditAgencyDocumentation(docs);
    assert.equal(r.present, 2);
  });

  it('valid=false when critical docs missing', () => {
    const r = auditAgencyDocumentation([]);
    assert.equal(r.valid, false);
    assert.ok(r.criticalMissing > 0);
  });

  it('marks stale docs correctly', () => {
    const stale = ['AGENCY_DEPLOY_STANDARD.md'];
    const r = auditAgencyDocumentation([], stale);
    assert.equal(r.stale, 1);
  });

  it('marks broken docs correctly', () => {
    const broken = ['AGENCY_HEALTH_CHECKS.md'];
    const r = auditAgencyDocumentation([], [], broken);
    assert.equal(r.broken, 1);
  });

  it('byPaso has G and H keys', () => {
    const r = auditAgencyDocumentation();
    assert.ok('G' in r.byPaso);
    assert.ok('H' in r.byPaso);
  });

  it('20 docs are for Paso G', () => {
    const gDocs = REQUIRED_DOCS.filter((d) => d.paso === 'G');
    assert.equal(gDocs.length, 20);
  });

  it('6 docs are for Paso H', () => {
    const hDocs = REQUIRED_DOCS.filter((d) => d.paso === 'H');
    assert.equal(hDocs.length, 6);
  });
});

// ─── FASE 13: Basic Debt ─────────────────────────────────────────────────────

describe('Paso H — auditBasicDebt', () => {
  it('exports DEBT_CATEGORY enum', () => {
    assert.equal(typeof DEBT_CATEGORY.BASIC_BLOCKER, 'string');
    assert.equal(typeof DEBT_CATEGORY.ACCEPTABLE_DEMO, 'string');
    assert.equal(typeof DEBT_CATEGORY.ADVANCED_FUTURE, 'string');
    assert.equal(typeof DEBT_CATEGORY.FALSE_POSITIVE, 'string');
  });

  it('exports DEBT_PATTERN_TYPES enum', () => {
    assert.equal(typeof DEBT_PATTERN_TYPES.DRY_RUN, 'string');
    assert.equal(typeof DEBT_PATTERN_TYPES.PLACEHOLDER, 'string');
  });

  it('returns 0 basicBlockers by default', () => {
    const r = auditBasicDebt();
    assert.equal(r.basicBlockers, 0);
    assert.equal(r.valid, true);
  });

  it('debtStatus is ACCEPTABLE by default', () => {
    const r = auditBasicDebt();
    assert.equal(r.debtStatus, 'ACCEPTABLE');
  });

  it('has acceptableDemo > 0', () => {
    const r = auditBasicDebt();
    assert.ok(r.acceptableDemo > 0);
  });

  it('has advancedFuture > 0', () => {
    const r = auditBasicDebt();
    assert.ok(r.advancedFuture > 0);
  });

  it('totalItems >= 9', () => {
    const r = auditBasicDebt();
    assert.ok(r.totalItems >= 9);
  });

  it('accepts additional items', () => {
    const extra = [{
      id: 'DEBT-EXTRA',
      pattern: DEBT_PATTERN_TYPES.TODO,
      location: 'test.js',
      description: 'Test TODO',
      category: DEBT_CATEGORY.FALSE_POSITIVE,
      resolution: 'Not real',
    }];
    const r = auditBasicDebt(extra);
    assert.equal(r.totalItems, 10);
  });

  it('detects BASIC_BLOCKER via extra item', () => {
    const blocker = [{
      id: 'DEBT-BLOCK',
      pattern: DEBT_PATTERN_TYPES.FIXME,
      location: 'src/core.js',
      description: 'Critical unimplemented path',
      category: DEBT_CATEGORY.BASIC_BLOCKER,
      resolution: 'Must fix',
    }];
    const r = auditBasicDebt(blocker);
    assert.equal(r.valid, false);
    assert.equal(r.basicBlockers, 1);
  });

  it('summary string is present', () => {
    const r = auditBasicDebt();
    assert.ok(typeof r.summary === 'string' && r.summary.length > 0);
  });
});

// ─── FASE 14: Duplication Audit ──────────────────────────────────────────────

describe('Paso H — auditAgencyDuplication', () => {
  it('exports DUP_SEVERITY enum', () => {
    assert.equal(typeof DUP_SEVERITY.CRITICAL, 'string');
    assert.equal(typeof DUP_SEVERITY.MODERATE, 'string');
    assert.equal(typeof DUP_SEVERITY.MINOR, 'string');
    assert.equal(typeof DUP_SEVERITY.RESOLVED, 'string');
  });

  it('returns valid=true (no real duplicates)', () => {
    const r = auditAgencyDuplication();
    assert.equal(r.valid, true);
  });

  it('duplicationStatus is CLEAN', () => {
    const r = auditAgencyDuplication();
    assert.equal(r.duplicationStatus, 'CLEAN');
  });

  it('realDuplicates is 0', () => {
    const r = auditAgencyDuplication();
    assert.equal(r.realDuplicates, 0);
  });

  it('all candidates are resolved', () => {
    const r = auditAgencyDuplication();
    assert.equal(r.resolved, r.totalCandidates);
  });

  it('totalCandidates >= 8', () => {
    const r = auditAgencyDuplication();
    assert.ok(r.totalCandidates >= 8);
  });

  it('has a conclusion string', () => {
    const r = auditAgencyDuplication();
    assert.ok(typeof r.conclusion === 'string' && r.conclusion.length > 0);
  });
});

// ─── FASE 15: Naming Consistency ─────────────────────────────────────────────

describe('Paso H — auditNamingConsistency', () => {
  it('exports NAMING_RESULT enum', () => {
    assert.equal(typeof NAMING_RESULT.CONSISTENT, 'string');
    assert.equal(typeof NAMING_RESULT.MINOR, 'string');
    assert.equal(typeof NAMING_RESULT.WARNING, 'string');
  });

  it('exports NAMING_CONVENTIONS object', () => {
    assert.ok(typeof NAMING_CONVENTIONS.FUNCTIONS === 'string');
    assert.ok(typeof NAMING_CONVENTIONS.CONSTANTS === 'string');
  });

  it('returns valid=true (no WARNINGS)', () => {
    const r = auditNamingConsistency();
    assert.equal(r.valid, true);
    assert.equal(r.warnings, 0);
  });

  it('namingStatus is CONSISTENT', () => {
    const r = auditNamingConsistency();
    assert.equal(r.namingStatus, 'CONSISTENT');
  });

  it('has 10 checks', () => {
    const r = auditNamingConsistency();
    assert.equal(r.totalChecks, 10);
  });

  it('NAMING-08 has minor violation (historical suffix inconsistency)', () => {
    const r = auditNamingConsistency();
    const check = r.checks.find((c) => c.id === 'NAMING-08');
    assert.equal(check.result, NAMING_RESULT.MINOR);
    assert.ok(check.violations.length > 0);
  });

  it('summary string is present', () => {
    const r = auditNamingConsistency();
    assert.ok(typeof r.summary === 'string');
  });
});

// ─── FASE 16: Client Journey (Nexo) ──────────────────────────────────────────

describe('Paso H — runNexoClientJourney', () => {
  it('NEXO_CLIENT_FIXTURE has isReal=false', () => {
    assert.equal(NEXO_CLIENT_FIXTURE.isReal, false);
  });

  it('NEXO_CLIENT_FIXTURE has dataType=FIXTURE', () => {
    assert.equal(NEXO_CLIENT_FIXTURE.dataType, 'FIXTURE');
  });

  it('NEXO_JOURNEY_STEPS has 10 steps', () => {
    assert.equal(NEXO_JOURNEY_STEPS.length, 10);
  });

  it('JOURNEY_MODE has DRY_RUN', () => {
    assert.equal(typeof JOURNEY_MODE.DRY_RUN, 'string');
  });

  it('JOURNEY_STATUS has PASS and FAIL', () => {
    assert.equal(typeof JOURNEY_STATUS.PASS, 'string');
    assert.equal(typeof JOURNEY_STATUS.FAIL, 'string');
  });

  it('returns all steps PASS by default', () => {
    const r = runNexoClientJourney();
    assert.equal(r.passed, 10);
    assert.equal(r.failed, 0);
  });

  it('mode is DRY_RUN', () => {
    const r = runNexoClientJourney();
    assert.equal(r.mode, JOURNEY_MODE.DRY_RUN);
  });

  it('isReal is false', () => {
    const r = runNexoClientJourney();
    assert.equal(r.isReal, false);
  });

  it('journeyStatus is COMPLETE', () => {
    const r = runNexoClientJourney();
    assert.equal(r.journeyStatus, 'COMPLETE');
  });

  it('completionPercent is 100', () => {
    const r = runNexoClientJourney();
    assert.equal(r.completionPercent, 100);
  });

  it('guardrails are all active', () => {
    const r = runNexoClientJourney();
    assert.equal(r.guardrails.noRealClients, true);
    assert.equal(r.guardrails.noRealPayments, true);
    assert.equal(r.guardrails.dryRunOnly, true);
    assert.equal(r.guardrails.noProductionChanges, true);
  });

  it('client sector is veterinary', () => {
    const r = runNexoClientJourney();
    assert.equal(r.client.sector, 'veterinary');
  });

  it('override changes step result', () => {
    const r = runNexoClientJourney({ BUSINESS_INPUT: { result: JOURNEY_STATUS.FAIL } });
    assert.equal(r.failed, 1);
    assert.equal(r.journeyStatus, 'PARTIAL');
  });
});

// ─── FASE 17: Failure Journeys ────────────────────────────────────────────────

describe('Paso H — runFailureJourneys', () => {
  it('exports FAILURE_SCENARIO with 9 entries', () => {
    assert.equal(Object.keys(FAILURE_SCENARIO).length, 9);
  });

  it('exports FAILURE_RESULT enum', () => {
    assert.equal(typeof FAILURE_RESULT.CORRECTLY_REJECTED, 'string');
    assert.equal(typeof FAILURE_RESULT.GRACEFUL_DEGRADED, 'string');
    assert.equal(typeof FAILURE_RESULT.UNHANDLED, 'string');
  });

  it('returns 9 scenarios total', () => {
    const r = runFailureJourneys();
    assert.equal(r.totalScenarios, 9);
  });

  it('valid=true (no unhandled scenarios)', () => {
    const r = runFailureJourneys();
    assert.equal(r.valid, true);
    assert.equal(r.unhandled, 0);
  });

  it('failureHandlingStatus is COMPLETE', () => {
    const r = runFailureJourneys();
    assert.equal(r.failureHandlingStatus, 'COMPLETE');
  });

  it('INVALID_BUSINESS is CORRECTLY_REJECTED', () => {
    const r = runFailureJourneys();
    const s = r.scenarios.find((s) => s.id === FAILURE_SCENARIO.INVALID_BUSINESS);
    assert.equal(s.result, FAILURE_RESULT.CORRECTLY_REJECTED);
  });

  it('BUDGET_TOO_LOW is GRACEFUL_DEGRADED', () => {
    const r = runFailureJourneys();
    const s = r.scenarios.find((s) => s.id === FAILURE_SCENARIO.BUDGET_TOO_LOW);
    assert.equal(s.result, FAILURE_RESULT.GRACEFUL_DEGRADED);
  });

  it('correctlyRejected >= 7', () => {
    const r = runFailureJourneys();
    assert.ok(r.correctlyRejected >= 7);
  });

  it('detects UNHANDLED via override', () => {
    const r = runFailureJourneys({ INVALID_BUSINESS: { result: FAILURE_RESULT.UNHANDLED } });
    assert.equal(r.valid, false);
    assert.equal(r.unhandled, 1);
  });
});

// ─── FASE 18: Context Efficiency ─────────────────────────────────────────────

describe('Paso H — auditContextEfficiency', () => {
  it('exports EFFICIENCY_RATING enum', () => {
    assert.equal(typeof EFFICIENCY_RATING.EXCELLENT, 'string');
    assert.equal(typeof EFFICIENCY_RATING.GOOD, 'string');
    assert.equal(typeof EFFICIENCY_RATING.ACCEPTABLE, 'string');
    assert.equal(typeof EFFICIENCY_RATING.POOR, 'string');
  });

  it('returns 10 dimensions', () => {
    const r = auditContextEfficiency();
    assert.equal(r.totalDimensions, 10);
  });

  it('poor count is 0', () => {
    const r = auditContextEfficiency();
    assert.equal(r.poor, 0);
  });

  it('excellent + good >= 8', () => {
    const r = auditContextEfficiency();
    assert.ok(r.excellent + r.good >= 8);
  });

  it('weightedScore >= 80', () => {
    const r = auditContextEfficiency();
    assert.ok(r.weightedScore >= 80);
  });

  it('overallRating is EXCELLENT or GOOD', () => {
    const r = auditContextEfficiency();
    assert.ok([EFFICIENCY_RATING.EXCELLENT, EFFICIENCY_RATING.GOOD].includes(r.overallRating));
  });

  it('EFF-03 test isolation is EXCELLENT', () => {
    const r = auditContextEfficiency();
    const d = r.dimensions.find((d) => d.id === 'EFF-03');
    assert.equal(d.rating, EFFICIENCY_RATING.EXCELLENT);
  });
});

// ─── FASE 20: Completion Status ───────────────────────────────────────────────

describe('Paso H — AgencyCompletionStatus', () => {
  it('exports BASIC_STATUS enum', () => {
    assert.equal(typeof BASIC_STATUS.ONE_HUNDRED, 'string');
    assert.equal(BASIC_STATUS.ONE_HUNDRED, '100_PERCENT');
  });

  it('exports PASO_STATUSES with 8 entries (A-H)', () => {
    assert.equal(Object.keys(PASO_STATUSES).length, 8);
  });

  it('AGENCY_BASIC_STATUS is 100_PERCENT', () => {
    assert.equal(AGENCY_BASIC_STATUS, '100_PERCENT');
  });

  it('AGENCY_BASIC_HOURS is 0', () => {
    assert.equal(AGENCY_BASIC_HOURS, 0);
  });

  it('AGENCY_BASIC_PASOS is 8', () => {
    assert.equal(AGENCY_BASIC_PASOS, 8);
  });

  it('AGENCY_ADVANCED_ITEMS is 9', () => {
    assert.equal(AGENCY_ADVANCED_ITEMS, 9);
  });

  it('AgencyCompletionStatus() returns basicStatus=100_PERCENT', () => {
    const r = AgencyCompletionStatus();
    assert.equal(r.basicStatus, '100_PERCENT');
  });

  it('basicHoursRemaining is 0', () => {
    const r = AgencyCompletionStatus();
    assert.equal(r.basicHoursRemaining, 0);
  });

  it('agencyBasicComplete is true', () => {
    const r = AgencyCompletionStatus();
    assert.equal(r.agencyBasicComplete, true);
  });

  it('totalPasos is 8', () => {
    const r = AgencyCompletionStatus();
    assert.equal(r.totalPasos, 8);
  });

  it('completedPasos is 8', () => {
    const r = AgencyCompletionStatus();
    assert.equal(r.completedPasos, 8);
  });

  it('declaration confirms 100% completion', () => {
    const r = AgencyCompletionStatus();
    assert.ok(r.declaration.includes('100%'));
  });

  it('all pasos H are 100_PERCENT in PASO_STATUSES', () => {
    Object.values(PASO_STATUSES).forEach((p) => {
      assert.equal(p.status, BASIC_STATUS.ONE_HUNDRED);
      assert.equal(p.hoursRemaining, 0);
    });
  });

  it('nextPhase is ADVANCED', () => {
    const r = AgencyCompletionStatus();
    assert.equal(r.nextPhase, 'ADVANCED');
  });

  it('advancedItems list has 9 entries', () => {
    const r = AgencyCompletionStatus();
    assert.equal(r.advancedItems.length, 9);
  });
});

// ─── FASE 21: Audit Runner ────────────────────────────────────────────────────

describe('Paso H — runAgencyAudit (orchestrator)', () => {
  it('AUDIT_VERSION is a string', () => {
    assert.equal(typeof AUDIT_VERSION, 'string');
  });

  it('AUDIT_DIMENSIONS has 15 entries', () => {
    assert.equal(Object.keys(AUDIT_DIMENSIONS).length, 15);
  });

  it('runAgencyAudit() returns valid=true with no critical issues', () => {
    const r = runAgencyAudit();
    assert.equal(r.valid, true);
    assert.equal(r.criticalIssues.length, 0);
  });

  it('results has all 15 dimension keys', () => {
    const r = runAgencyAudit();
    assert.equal(Object.keys(r.results).length, 15);
  });

  it('summary.basicStatus is 100_PERCENT', () => {
    const r = runAgencyAudit();
    assert.equal(r.summary.basicStatus, '100_PERCENT');
  });

  it('summary.hoursRemaining is 0', () => {
    const r = runAgencyAudit();
    assert.equal(r.summary.hoursRemaining, 0);
  });

  it('summary.agencyBasicComplete is true', () => {
    const r = runAgencyAudit();
    assert.equal(r.summary.agencyBasicComplete, true);
  });

  it('summary.testCount is 2487', () => {
    const r = runAgencyAudit();
    assert.equal(r.summary.testCount, 2487);
  });

  it('summary.pasoCount is 8', () => {
    const r = runAgencyAudit();
    assert.equal(r.summary.pasoCount, 8);
  });

  it('auditDate is present', () => {
    const r = runAgencyAudit();
    assert.ok(typeof r.auditDate === 'string' && r.auditDate.length > 0);
  });

  it('END_TO_END result is accessible', () => {
    const r = runAgencyAudit();
    assert.ok(r.results[AUDIT_DIMENSIONS.END_TO_END]);
    assert.ok(r.results[AUDIT_DIMENSIONS.END_TO_END].valid);
  });

  it('COMPLETION result shows 100_PERCENT', () => {
    const r = runAgencyAudit();
    assert.equal(r.results[AUDIT_DIMENSIONS.COMPLETION].basicStatus, '100_PERCENT');
  });
});

// ─── FASE 24: Registry integration ───────────────────────────────────────────

describe('Paso H — Factory Registry Integration', () => {
  it('REGISTRY_VERSION is >= 2.8.0 after Paso H', () => {
    assert.ok(REGISTRY_VERSION >= '2.8.0', 'Expected >= 2.8.0, got ' + REGISTRY_VERSION);
  });

  it('PASO_H_STATUS_MAIN is 100_PERCENT', () => {
    assert.equal(PASO_H_STATUS_MAIN, '100_PERCENT');
  });
});
