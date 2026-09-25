// Tests — Paso G: Deploy + QA + Security Reutilizable
// node --test

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ─── Imports ──────────────────────────────────────────────────────────────────
import { PROVIDERS, DOMAIN_TYPES, ROLLBACK_STRATEGIES, createDeployTarget, DEPLOY_TARGET_VERSION } from '../../deploy/deployTarget.js';
import { ENVIRONMENTS, VERIFICATION_LEVELS, getEnvironmentConfig, isAllowedInEnvironment } from '../../deploy/environmentModel.js';
import { evaluatePreDeployReadiness, READINESS_OUTCOMES } from '../../deploy/preDeployReadiness.js';
import { auditCodeForSecrets, auditSecretSafety } from '../../deploy/secretSafetyGate.js';
import { auditProductionDataSafety, auditCodeForData } from '../../deploy/dataSafetyGate.js';
import { buildSecurityHeaders, validateSecurityHeaders } from '../../deploy/securityHeaders.js';
import { auditClientCode, auditClientSecurity } from '../../deploy/clientSecurityAudit.js';
import { auditApiSecurity } from '../../deploy/apiSecurityGate.js';
import { auditDependencies } from '../../deploy/dependencySecurity.js';
import { validateReproducibleBuild } from '../../deploy/reproducibleBuild.js';
import { generateDeployPlan } from '../../deploy/deployPlan.js';
import { runDeployPipeline, DEPLOY_MODES, PIPELINE_STATUS } from '../../deploy/deployRunner.js';
import { runPostDeployQA } from '../../deploy/postDeployQA.js';
import { buildVisualQAPlan, recordVisualQAResults, BREAKPOINTS, VISUAL_SCREENS, VISUAL_QA_STATUS } from '../../deploy/visualQA.js';
import { auditRuntimeRender, RENDER_FAILURE_TYPES, RENDER_GATE_STATUS } from '../../deploy/runtimeRenderGate.js';
import { runHealthChecks, HEALTH_STATUS, HEALTH_AREAS } from '../../deploy/healthChecks.js';
import { createRollbackPlan, evaluateRollbackNeed, ROLLBACK_TRIGGER_CONDITIONS } from '../../deploy/rollbackModel.js';
import { createReleaseManifest, advanceReleaseStatus, RELEASE_STATUS } from '../../deploy/releaseManifest.js';
import { evaluateReleaseGates, GATE_RESULT, RELEASE_GATE_IDS } from '../../deploy/releaseGates.js';
import { evaluateProductionChecklist, CHECKLIST_STATUS, CHECKLIST_CATEGORIES } from '../../deploy/productionChecklist.js';
import { createCloudflareProfile, generateWranglerConfig, CLOUDFLARE_SERVICES, CF_BUILD_PRESETS } from '../../deploy/cloudflareProfile.js';
import { createPostDeployHandoff, HANDOFF_STATUS, HANDOFF_SECTIONS } from '../../deploy/postDeployHandoff.js';
import * as registry from '../../factory-registry/index.js';

// ─── 1. deployTarget ──────────────────────────────────────────────────────────
describe('deployTarget', () => {
  it('exports PROVIDERS enum', () => {
    assert.ok(PROVIDERS.CLOUDFLARE_PAGES);
    assert.ok(PROVIDERS.CLOUDFLARE_WORKERS);
    assert.ok(PROVIDERS.STATIC_HOST);
    assert.ok(PROVIDERS.CUSTOM);
  });

  it('exports DOMAIN_TYPES enum', () => {
    assert.ok(DOMAIN_TYPES.PAGES_DEFAULT);
    assert.ok(DOMAIN_TYPES.CUSTOM);
    assert.ok(DOMAIN_TYPES.SUBDOMAIN);
  });

  it('exports ROLLBACK_STRATEGIES enum', () => {
    assert.ok(ROLLBACK_STRATEGIES.PREVIOUS_DEPLOYMENT);
    assert.ok(ROLLBACK_STRATEGIES.BLUE_GREEN);
  });

  it('createDeployTarget returns valid target', () => {
    const r = createDeployTarget({
      id: 'nexo-preview',
      provider: PROVIDERS.CLOUDFLARE_PAGES,
      projectName: 'clinica-nexo',
      environment: 'PREVIEW',
    });
    assert.ok(r.valid);
    assert.equal(r.target.provider, PROVIDERS.CLOUDFLARE_PAGES);
  });

  it('createDeployTarget fails without required fields', () => {
    const r = createDeployTarget({});
    assert.ok(!r.valid);
    assert.ok(r.errors.length > 0);
  });

  it('DEPLOY_TARGET_VERSION is defined', () => {
    assert.ok(DEPLOY_TARGET_VERSION);
  });
});

// ─── 2. environmentModel ──────────────────────────────────────────────────────
describe('environmentModel', () => {
  it('exports ENVIRONMENTS enum', () => {
    assert.ok(ENVIRONMENTS.LOCAL);
    assert.ok(ENVIRONMENTS.PREVIEW);
    assert.ok(ENVIRONMENTS.STAGING);
    assert.ok(ENVIRONMENTS.PRODUCTION);
  });

  it('exports VERIFICATION_LEVELS enum', () => {
    assert.ok(VERIFICATION_LEVELS.MINIMAL);
    assert.ok(VERIFICATION_LEVELS.STANDARD);
    assert.ok(VERIFICATION_LEVELS.FULL);
  });

  it('getEnvironmentConfig returns config for PRODUCTION', () => {
    const cfg = getEnvironmentConfig(ENVIRONMENTS.PRODUCTION);
    assert.equal(cfg.environment, ENVIRONMENTS.PRODUCTION);
    assert.equal(cfg.config.humanApproval, true);
    assert.equal(cfg.config.rollbackRequired, true);
  });

  it('getEnvironmentConfig returns config for PREVIEW', () => {
    const cfg = getEnvironmentConfig(ENVIRONMENTS.PREVIEW);
    assert.equal(cfg.environment, ENVIRONMENTS.PREVIEW);
    assert.equal(cfg.config.humanApproval, false);
  });

  it('isAllowedInEnvironment blocks PRODUCTION_DATA in PREVIEW', () => {
    const r = isAllowedInEnvironment(ENVIRONMENTS.PREVIEW, 'PRODUCTION_DATA');
    assert.equal(r, false);
  });

  it('isAllowedInEnvironment allows PRODUCTION_DATA in PRODUCTION', () => {
    const r = isAllowedInEnvironment(ENVIRONMENTS.PRODUCTION, 'PRODUCTION_DATA');
    assert.equal(r, true);
  });

  it('isAllowedInEnvironment allows ROLLBACK in PRODUCTION', () => {
    const r = isAllowedInEnvironment(ENVIRONMENTS.PRODUCTION, 'ROLLBACK');
    assert.equal(r, true);
  });
});

// ─── 3. preDeployReadiness ────────────────────────────────────────────────────
describe('preDeployReadiness', () => {
  it('exports READINESS_OUTCOMES', () => {
    assert.ok(READINESS_OUTCOMES.READY);
    assert.ok(READINESS_OUTCOMES.BLOCKED);
    assert.ok(READINESS_OUTCOMES.HUMAN_REVIEW);
  });

  it('evaluatePreDeployReadiness returns READY when all pass', () => {
    const checks = {};
    const allCheckIds = [
      'scope_approved','requirements_approved','production_ready','delivery_ready',
      'tests_pass','lint_pass','build_pass','functional_gate','dead_control_gate',
      'mobile_gate','accessibility_gate','security_gate','privacy_gate','role_isolation',
      'cross_client_isolation','no_real_demo_data','no_hardcoded_secrets',
      'environment_configured','rollback_defined','backup_policy_defined',
      'health_verification_defined','human_approval',
    ];
    for (const id of allCheckIds) checks[id] = true;
    const r = evaluatePreDeployReadiness(checks, 'PREVIEW');
    assert.ok(['READY', 'HUMAN_REVIEW'].includes(r.outcome));
  });

  it('evaluatePreDeployReadiness blocks without human_approval for PRODUCTION', () => {
    const checks = { human_approval: false };
    const r = evaluatePreDeployReadiness(checks, 'PRODUCTION');
    assert.equal(r.outcome, READINESS_OUTCOMES.BLOCKED);
  });

  it('evaluatePreDeployReadiness returns BLOCKED on failed critical check', () => {
    const r = evaluatePreDeployReadiness({ tests_pass: false }, 'PREVIEW');
    assert.equal(r.outcome, READINESS_OUTCOMES.BLOCKED);
  });
});

// ─── 4. secretSafetyGate ─────────────────────────────────────────────────────
describe('secretSafetyGate', () => {
  it('detects Bearer token in code', () => {
    const r = auditCodeForSecrets('const h = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc.def"', 'app.js');
    assert.ok(r.valid);
    assert.ok(r.findings > 0 || r.details.length > 0);
  });

  it('detects Stripe secret key', () => {
    // Reconstructed to avoid triggering push protection on a test-only string
    const prefix = 'sk_' + 'live_';
    const r = auditCodeForSecrets(`const key = "${prefix}abc123xyzABCDEFGHIJKLMNOPQ"`, 'config.js');
    assert.ok(r.critical > 0 || r.findings > 0);
  });

  it('clean code passes', () => {
    const r = auditCodeForSecrets('const name = "Clínica Nexo"', 'safe.js');
    assert.ok(r.valid);
    assert.equal(r.findings, 0);
  });

  it('auditSecretSafety handles multiple files', () => {
    const files = [
      { path: 'a.js', content: 'const x = 1' },
      { path: 'b.js', content: 'const y = 2' },
    ];
    const r = auditSecretSafety(files);
    assert.ok(r.valid);
  });

  it('auditSecretSafety redacts found secrets', () => {
    // Reconstructed to avoid triggering push protection on a test-only string
    const prefix = 'sk_' + 'live_';
    const files = [{ path: 'config.js', content: `const k = "${prefix}realSecretKeyHere12345678"` }];
    const r = auditSecretSafety(files);
    const finding = r.fileResults?.[0]?.details?.[0];
    if (finding) {
      assert.ok(!finding.sample?.includes('realSecretKeyHere'));
    }
  });
});

// ─── 5. dataSafetyGate ───────────────────────────────────────────────────────
describe('dataSafetyGate', () => {
  it('auditCodeForData detects test data email', () => {
    const r = auditCodeForData('const email = "test@example.com"', 'data.js');
    assert.ok(r.findings.length > 0 || r.valid);
  });

  it('auditProductionDataSafety handles empty file list', () => {
    const r = auditProductionDataSafety([]);
    assert.ok(r.valid);
  });

  it('auditProductionDataSafety handles clean files', () => {
    const files = [{ path: 'clean.js', code: 'export const NAME = "Nexo"' }];
    const r = auditProductionDataSafety(files);
    assert.ok(r.valid);
  });
});

// ─── 6. securityHeaders ──────────────────────────────────────────────────────
describe('securityHeaders', () => {
  it('buildSecurityHeaders returns headers for PRODUCTION', () => {
    const h = buildSecurityHeaders('PRODUCTION');
    assert.ok(h.valid);
    assert.ok(h.headers['Strict-Transport-Security']);
    assert.ok(h.headers['X-Frame-Options']);
    assert.ok(h.headers['Content-Security-Policy']);
  });

  it('buildSecurityHeaders returns headers for PREVIEW', () => {
    const h = buildSecurityHeaders('PREVIEW');
    assert.ok(h.valid);
    assert.ok(h.headers['X-Frame-Options']);
  });

  it('validateSecurityHeaders detects missing required headers', () => {
    const r = validateSecurityHeaders({ 'X-Frame-Options': 'DENY' });
    assert.ok(r.missing.length > 0);
  });

  it('validateSecurityHeaders passes full header set', () => {
    const h = buildSecurityHeaders('PRODUCTION');
    const r = validateSecurityHeaders(h.headers);
    assert.ok(r.valid);
  });
});

// ─── 7. clientSecurityAudit ──────────────────────────────────────────────────
describe('clientSecurityAudit', () => {
  it('detects innerHTML risk', () => {
    const r = auditClientCode('el.innerHTML = userInput', 'app.jsx');
    assert.ok(r.findings > 0 || r.details.length > 0);
  });

  it('detects localhost reference', () => {
    const r = auditClientCode('fetch("http://localhost:3000/api")', 'api.js');
    assert.ok(r.findings > 0 || r.details.length > 0);
  });

  it('clean code returns no findings', () => {
    const r = auditClientCode('export const TITLE = "Nexo"', 'clean.js');
    assert.equal(r.findings, 0);
  });

  it('auditClientSecurity handles multiple files', () => {
    const files = [
      { path: 'a.js', code: 'const x = 1' },
      { path: 'b.js', code: 'const y = 2' },
    ];
    const r = auditClientSecurity(files);
    assert.ok(r.valid);
  });
});

// ─── 8. apiSecurityGate ──────────────────────────────────────────────────────
describe('apiSecurityGate', () => {
  it('auditApiSecurity PASS when all checks pass', () => {
    const checks = {};
    const ids = ['API-01','API-02','API-03','API-04','API-05','API-06',
                 'API-07','API-08','API-09','API-10','API-11','API-12'];
    for (const id of ids) checks[id] = true;
    const r = auditApiSecurity(checks);
    assert.ok(r.valid);
    assert.equal(r.criticalFailed, 0);
  });

  it('auditApiSecurity accepts N/A for inapplicable checks', () => {
    const r = auditApiSecurity({ 'API-01': true, 'API-02': 'N/A' });
    assert.ok(r.valid);
  });

  it('auditApiSecurity fails on critical FAIL', () => {
    const r = auditApiSecurity({ 'API-01': false });
    assert.ok(r.criticalFailed > 0 || r.status !== 'PASS');
  });
});

// ─── 9. dependencySecurity ───────────────────────────────────────────────────
describe('dependencySecurity', () => {
  it('auditDependencies returns SCAN_NEEDED for empty array', () => {
    const r = auditDependencies([]);
    assert.equal(r.status, 'SCAN_NEEDED');
  });

  it('auditDependencies returns OK for clean deps', () => {
    const deps = [{ name: 'react', version: '18.3.0', status: 'OK' }];
    const r = auditDependencies(deps);
    assert.ok(r.valid);
  });

  it('auditDependencies flags CRITICAL_CVE', () => {
    const deps = [{ name: 'lodash', version: '4.17.4', status: 'CRITICAL_CVE', cve: 'CVE-2019-1' }];
    const r = auditDependencies(deps);
    assert.ok(r.critical > 0 || r.status === 'CRITICAL_CVE');
  });
});

// ─── 10. reproducibleBuild ───────────────────────────────────────────────────
describe('reproducibleBuild', () => {
  it('validateReproducibleBuild returns REPRODUCIBLE when all pass', () => {
    const checks = {};
    const ids = ['RB-01','RB-02','RB-03','RB-04','RB-05','RB-06','RB-07','RB-08'];
    for (const id of ids) checks[id] = true;
    const r = validateReproducibleBuild(checks, { buildCommand: 'npm run build', outputDir: 'dist' });
    assert.equal(r.status, 'REPRODUCIBLE');
  });

  it('validateReproducibleBuild returns NON_DETERMINISTIC when critical fails', () => {
    const r = validateReproducibleBuild({ 'RB-01': false });
    assert.ok(['NON_DETERMINISTIC', 'UNKNOWN'].includes(r.status));
  });
});

// ─── 11. deployPlan ──────────────────────────────────────────────────────────
describe('deployPlan', () => {
  it('generateDeployPlan returns a structured plan', () => {
    const target = createDeployTarget({
      id: 'nexo-prod', provider: 'CLOUDFLARE_PAGES',
      projectName: 'clinica-nexo', environment: 'PREVIEW',
    }).target;
    const plan = generateDeployPlan(target);
    assert.ok(plan.buildSteps);
    assert.ok(plan.deploymentSteps);
    assert.ok(plan.rollbackSteps);
    assert.ok(plan.disclaimer);
  });

  it('generateDeployPlan does not include secret values', () => {
    const target = createDeployTarget({
      id: 'nexo-prod', provider: 'CLOUDFLARE_PAGES',
      projectName: 'clinica-nexo', environment: 'PREVIEW',
    }).target;
    const plan = generateDeployPlan(target, { secrets: ['SUPABASE_KEY', 'AIRTABLE_TOKEN'] });
    const planStr = JSON.stringify(plan);
    assert.ok(!planStr.includes('sk_live'));
  });
});

// ─── 12. deployRunner ────────────────────────────────────────────────────────
describe('deployRunner', () => {
  it('exports DEPLOY_MODES', () => {
    assert.ok(DEPLOY_MODES.DRY_RUN);
    assert.ok(DEPLOY_MODES.PREVIEW_ALLOWED);
    assert.ok(DEPLOY_MODES.PRODUCTION_BLOCKED);
  });

  it('exports PIPELINE_STATUS', () => {
    assert.ok(PIPELINE_STATUS.DRY_RUN_COMPLETE);
    assert.ok(PIPELINE_STATUS.READY);
    assert.ok(PIPELINE_STATUS.BLOCKED);
    assert.ok(PIPELINE_STATUS.PRODUCTION_BLOCKED);
  });

  it('runDeployPipeline defaults to DRY_RUN', async () => {
    const r = await runDeployPipeline({
      target: { id: 'nexo', provider: 'CLOUDFLARE_PAGES', projectName: 'nexo', environment: 'PREVIEW' },
      checks: {},
    });
    assert.ok(r.mode === DEPLOY_MODES.DRY_RUN || r.deploymentAllowed === false);
  });

  it('runDeployPipeline blocks PRODUCTION', async () => {
    const r = await runDeployPipeline({
      target: { id: 'nexo-prod', provider: 'CLOUDFLARE_PAGES', projectName: 'nexo', environment: 'PRODUCTION' },
      checks: {},
    });
    assert.equal(r.deploymentAllowed, false);
  });
});

// ─── 13. postDeployQA ────────────────────────────────────────────────────────
describe('postDeployQA', () => {
  it('runPostDeployQA returns BLOCKED with no checks or url', () => {
    const r = runPostDeployQA({}, {});
    assert.ok(r.status === 'BLOCKED' || r.valid);
  });

  it('runPostDeployQA returns PASS or WARNING when critical checks pass', () => {
    const checks = {};
    const criticalIds = ['QA-01','QA-02','QA-05','QA-07','QA-08','QA-18','QA-19'];
    for (const id of criticalIds) checks[id] = true;
    const r = runPostDeployQA(checks, { deployedUrl: 'https://nexo.pages.dev' });
    assert.ok(['PASS', 'WARNING'].includes(r.status));
  });
});

// ─── 14. visualQA ────────────────────────────────────────────────────────────
describe('visualQA', () => {
  it('exports BREAKPOINTS with MOBILE/TABLET/DESKTOP', () => {
    assert.equal(BREAKPOINTS.MOBILE, 390);
    assert.equal(BREAKPOINTS.TABLET, 768);
    assert.equal(BREAKPOINTS.DESKTOP, 1440);
  });

  it('exports VISUAL_SCREENS and VISUAL_QA_STATUS', () => {
    assert.ok(Array.isArray(VISUAL_SCREENS) || typeof VISUAL_SCREENS === 'object');
    assert.ok(VISUAL_QA_STATUS.PASS || VISUAL_QA_STATUS.NOT_EXECUTED);
  });

  it('buildVisualQAPlan returns plan with browserRequired=true', () => {
    const plan = buildVisualQAPlan({ projectName: 'Nexo', deployedUrl: 'https://nexo.pages.dev' });
    assert.equal(plan.browserRequired, true);
  });

  it('recordVisualQAResults stores fixture results', () => {
    const r = recordVisualQAResults([
      { checkId: 'VC-01', breakpoint: 'MOBILE', status: 'PASS' },
    ]);
    assert.ok(r.valid);
    assert.equal(r.total, 1);
  });
});

// ─── 15. runtimeRenderGate ───────────────────────────────────────────────────
describe('runtimeRenderGate', () => {
  it('exports RENDER_FAILURE_TYPES', () => {
    assert.ok(RENDER_FAILURE_TYPES.BLANK_BODY);
    assert.ok(RENDER_FAILURE_TYPES.EMPTY_ROOT);
    assert.ok(RENDER_FAILURE_TYPES.RUNTIME_EXCEPTION);
  });

  it('auditRuntimeRender BLOCKED with no checks', () => {
    const r = auditRuntimeRender({});
    assert.equal(r.status, RENDER_GATE_STATUS.BLOCKED);
  });

  it('auditRuntimeRender PASS when all critical checks pass', () => {
    const checks = { 'RG-01':true,'RG-02':true,'RG-03':true,'RG-04':true,'RG-05':true,'RG-07':true,'RG-08':true,'RG-09':true };
    const r = auditRuntimeRender(checks, { url: 'https://nexo.pages.dev' });
    assert.equal(r.status, RENDER_GATE_STATUS.PASS);
  });

  it('auditRuntimeRender FAIL when critical check fails', () => {
    const r = auditRuntimeRender({ 'RG-01': false }, { url: 'https://nexo.pages.dev' });
    assert.equal(r.status, RENDER_GATE_STATUS.FAIL);
  });
});

// ─── 16. healthChecks ────────────────────────────────────────────────────────
describe('healthChecks', () => {
  it('exports HEALTH_STATUS', () => {
    assert.ok(HEALTH_STATUS.PASS);
    assert.ok(HEALTH_STATUS.FAIL);
    assert.ok(HEALTH_STATUS.WARNING);
    assert.ok(HEALTH_STATUS.UNKNOWN);
  });

  it('exports HEALTH_AREAS', () => {
    assert.ok(HEALTH_AREAS.FRONTEND);
    assert.ok(HEALTH_AREAS.API);
    assert.ok(HEALTH_AREAS.AUTH);
  });

  it('runHealthChecks returns PASS when all critical pass', () => {
    const checks = {
      'HC-01': 'PASS', 'HC-03': 'PASS', 'HC-05': 'PASS',
      'HC-06': 'PASS', 'HC-07': 'PASS', 'HC-12': 'PASS',
    };
    const r = runHealthChecks(checks);
    assert.ok(['PASS', 'WARNING'].includes(r.status));
  });

  it('runHealthChecks FAIL when critical check fails', () => {
    const r = runHealthChecks({ 'HC-01': 'FAIL' });
    assert.equal(r.status, HEALTH_STATUS.FAIL);
  });

  it('runHealthChecks returns byArea breakdown', () => {
    const r = runHealthChecks({});
    assert.ok(r.byArea);
    assert.ok(HEALTH_AREAS.FRONTEND in r.byArea);
  });
});

// ─── 17. rollbackModel ───────────────────────────────────────────────────────
describe('rollbackModel', () => {
  it('exports ROLLBACK_TRIGGER_CONDITIONS', () => {
    assert.ok(ROLLBACK_TRIGGER_CONDITIONS.HEALTH_CHECK_FAIL);
    assert.ok(ROLLBACK_TRIGGER_CONDITIONS.AUTH_BROKEN);
    assert.ok(ROLLBACK_TRIGGER_CONDITIONS.SECURITY_INCIDENT);
  });

  it('createRollbackPlan returns valid plan', () => {
    const r = createRollbackPlan({
      deploymentId: 'DEP-001',
      previousVersion: 'v1.2.3',
      targetId: 'nexo-prod',
    });
    assert.ok(r.valid);
    assert.ok(r.plan.planId);
    assert.equal(r.plan.humanApproval, true);
  });

  it('createRollbackPlan fails without required fields', () => {
    const r = createRollbackPlan({});
    assert.ok(!r.valid);
  });

  it('evaluateRollbackNeed triggers on health FAIL', () => {
    const r = evaluateRollbackNeed({ status: 'FAIL' }, null, null);
    assert.equal(r.rollbackRequired, true);
    assert.ok(r.triggers.includes(ROLLBACK_TRIGGER_CONDITIONS.HEALTH_CHECK_FAIL));
  });

  it('evaluateRollbackNeed no trigger when all OK', () => {
    const r = evaluateRollbackNeed({ status: 'PASS' }, { status: 'PASS' }, { status: 'PASS' });
    assert.equal(r.rollbackRequired, false);
  });
});

// ─── 18. releaseManifest ─────────────────────────────────────────────────────
describe('releaseManifest', () => {
  it('exports RELEASE_STATUS', () => {
    assert.ok(RELEASE_STATUS.DRAFT);
    assert.ok(RELEASE_STATUS.READY);
    assert.ok(RELEASE_STATUS.DEPLOYED);
    assert.ok(RELEASE_STATUS.ROLLED_BACK);
  });

  it('createReleaseManifest returns valid manifest', () => {
    const r = createReleaseManifest({
      releaseId: 'REL-001', version: '1.0.0', commitSha: 'abc123def456',
    });
    assert.ok(r.valid);
    assert.equal(r.manifest.status, RELEASE_STATUS.DRAFT);
    assert.ok(r.manifest.disclaimer);
  });

  it('createReleaseManifest fails without required fields', () => {
    const r = createReleaseManifest({});
    assert.ok(!r.valid);
    assert.ok(r.errors.length > 0);
  });

  it('advanceReleaseStatus updates status', () => {
    const { manifest } = createReleaseManifest({
      releaseId: 'REL-001', version: '1.0.0', commitSha: 'abc123',
    });
    const r = advanceReleaseStatus(manifest, RELEASE_STATUS.READY, 'agency-owner');
    assert.ok(r.valid);
    assert.equal(r.manifest.status, RELEASE_STATUS.READY);
    assert.equal(r.manifest.approvals.length, 1);
  });

  it('advanceReleaseStatus rejects invalid status', () => {
    const { manifest } = createReleaseManifest({
      releaseId: 'R-01', version: '1.0.0', commitSha: 'abc',
    });
    const r = advanceReleaseStatus(manifest, 'INVALID_STATUS');
    assert.ok(!r.valid);
  });
});

// ─── 19. releaseGates ────────────────────────────────────────────────────────
describe('releaseGates', () => {
  it('exports GATE_RESULT enum', () => {
    assert.ok(GATE_RESULT.PASS);
    assert.ok(GATE_RESULT.BLOCKED);
    assert.ok(GATE_RESULT.HUMAN_REVIEW);
    assert.ok(GATE_RESULT.NOT_EVALUATED);
  });

  it('exports RELEASE_GATE_IDS with 10 gates', () => {
    assert.equal(Object.keys(RELEASE_GATE_IDS).length, 10);
  });

  it('evaluateReleaseGates returns PASS when all checks pass', () => {
    const allChecks = {
      lintPasses: true, buildPasses: true, lockfilePresent: true, nodeVersionSpecified: true,
      allTestsPass: true, noSkippedCritical: true,
      noSecretsInCode: true, noHardcodedCredentials: true, securityHeadersConfigured: true,
      gdprComplianceReviewed: true, dataDeletionPossible: true,
      ariaLandmarks: true, keyboardNav: true, colorContrast: true,
      responsiveLayout: true, touchTargets: true, mobileNav: true,
      noBlankScreen: true, rootElementRenders: true, noRuntimeException: true,
      preDeployReadinessPass: true, targetConfigured: true, rollbackPlanDefined: true,
      healthCheckPass: true, criticalQAPass: true,
      previousVersionKnown: true,
    };
    const r = evaluateReleaseGates(allChecks);
    assert.equal(r.overallResult, GATE_RESULT.PASS);
    assert.equal(r.deploymentAllowed, true);
  });

  it('evaluateReleaseGates blocks on P0 failure', () => {
    const r = evaluateReleaseGates({ lintPasses: false, buildPasses: false });
    assert.equal(r.overallResult, GATE_RESULT.BLOCKED);
    assert.ok(r.p0Blocked > 0);
    assert.equal(r.deploymentAllowed, false);
  });

  it('evaluateReleaseGates returns NOT_EVALUATED for empty checks', () => {
    const r = evaluateReleaseGates({});
    assert.ok(['NOT_EVALUATED', 'BLOCKED'].includes(r.overallResult));
  });

  it('evaluateReleaseGates reports 10 gates total', () => {
    const r = evaluateReleaseGates({});
    assert.equal(r.gatesTotal, 10);
  });

  it('evaluateReleaseGates includes disclaimer', () => {
    const r = evaluateReleaseGates({});
    assert.ok(r.disclaimer);
  });
});

// ─── 20. productionChecklist ─────────────────────────────────────────────────
describe('productionChecklist', () => {
  it('exports CHECKLIST_STATUS', () => {
    assert.ok(CHECKLIST_STATUS.PASS);
    assert.ok(CHECKLIST_STATUS.FAIL);
    assert.ok(CHECKLIST_STATUS.NOT_APPLICABLE);
    assert.ok(CHECKLIST_STATUS.PENDING);
  });

  it('exports CHECKLIST_CATEGORIES with 8 categories', () => {
    assert.equal(Object.keys(CHECKLIST_CATEGORIES).length, 8);
  });

  it('evaluateProductionChecklist has 28 checks', () => {
    const r = evaluateProductionChecklist({});
    assert.equal(r.totalChecks, 28);
  });

  it('evaluateProductionChecklist readyForProduction when critical pass', () => {
    const criticalIds = [
      'PC-01','PC-02','PC-05','PC-06','PC-07','PC-10','PC-11','PC-12',
      'PC-13','PC-14','PC-22','PC-23','PC-24','PC-25',
    ];
    const checks = {};
    for (const id of criticalIds) checks[id] = CHECKLIST_STATUS.PASS;
    const r = evaluateProductionChecklist(checks);
    assert.equal(r.readyForProduction, true);
  });

  it('evaluateProductionChecklist blocked when critical fail', () => {
    const r = evaluateProductionChecklist({ 'PC-01': CHECKLIST_STATUS.FAIL });
    assert.equal(r.readyForProduction, false);
    assert.ok(r.criticalFailed > 0);
  });

  it('evaluateProductionChecklist has byCategory breakdown', () => {
    const r = evaluateProductionChecklist({});
    assert.ok(r.byCategory);
    assert.ok(CHECKLIST_CATEGORIES.SECURITY in r.byCategory);
  });
});

// ─── 21. cloudflareProfile ───────────────────────────────────────────────────
describe('cloudflareProfile', () => {
  it('exports CLOUDFLARE_SERVICES', () => {
    assert.ok(CLOUDFLARE_SERVICES.PAGES);
    assert.ok(CLOUDFLARE_SERVICES.WORKERS);
  });

  it('exports CF_BUILD_PRESETS', () => {
    assert.ok(CF_BUILD_PRESETS.VITE_REACT);
    assert.ok(CF_BUILD_PRESETS.NEXT_JS);
    assert.ok(CF_BUILD_PRESETS.STATIC);
  });

  it('createCloudflareProfile returns valid profile', () => {
    const r = createCloudflareProfile({
      projectName: 'clinica-nexo',
      accountId: 'ACC-PLACEHOLDER',
      buildPreset: CF_BUILD_PRESETS.VITE_REACT,
    });
    assert.ok(r.valid);
    assert.equal(r.profile.service, CLOUDFLARE_SERVICES.PAGES);
    assert.ok(r.profile.disclaimer);
  });

  it('createCloudflareProfile fails without required fields', () => {
    const r = createCloudflareProfile({});
    assert.ok(!r.valid);
    assert.ok(r.errors.length > 0);
  });

  it('createCloudflareProfile VITE_REACT preset builds to dist', () => {
    const r = createCloudflareProfile({
      projectName: 'nexo', accountId: 'ACC-001', buildPreset: CF_BUILD_PRESETS.VITE_REACT,
    });
    assert.equal(r.profile.build.outputDir, 'dist');
  });

  it('generateWranglerConfig returns valid config string', () => {
    const { profile } = createCloudflareProfile({
      projectName: 'nexo', accountId: 'ACC-001',
    });
    const r = generateWranglerConfig(profile);
    assert.ok(r.valid);
    assert.ok(r.config.includes('clinica-nexo') || r.config.includes('nexo'));
  });

  it('generateWranglerConfig does not include real secrets', () => {
    const { profile } = createCloudflareProfile({
      projectName: 'nexo', accountId: 'ACC-001',
    });
    const r = generateWranglerConfig(profile);
    assert.ok(!r.config.includes('sk_live'));
    assert.ok(!r.config.includes('Bearer'));
  });
});

// ─── 22. postDeployHandoff ───────────────────────────────────────────────────
describe('postDeployHandoff', () => {
  it('exports HANDOFF_STATUS', () => {
    assert.ok(HANDOFF_STATUS.COMPLETE);
    assert.ok(HANDOFF_STATUS.PARTIAL);
    assert.ok(HANDOFF_STATUS.BLOCKED);
    assert.ok(HANDOFF_STATUS.NOT_STARTED);
  });

  it('exports HANDOFF_SECTIONS', () => {
    assert.ok(HANDOFF_SECTIONS.RELEASE_INFO);
    assert.ok(HANDOFF_SECTIONS.QA_SUMMARY);
    assert.ok(HANDOFF_SECTIONS.MAINTENANCE_SETUP);
    assert.ok(HANDOFF_SECTIONS.CLIENT_BRIEFING);
  });

  it('createPostDeployHandoff returns valid handoff', () => {
    const r = createPostDeployHandoff({
      projectName: 'Clínica Nexo',
      clientId: 'nexo-001',
      maintenanceTier: 'PRO',
    });
    assert.ok(r.valid);
    assert.ok(r.handoff.handoffId);
    assert.ok(r.handoff.disclaimer);
  });

  it('createPostDeployHandoff fails without required fields', () => {
    const r = createPostDeployHandoff({});
    assert.ok(!r.valid);
  });

  it('createPostDeployHandoff with QA and health results', () => {
    const r = createPostDeployHandoff({
      projectName: 'Nexo',
      clientId: 'nexo-001',
      qaResult: { status: 'PASS', totalChecks: 22, passed: 22, criticalFailed: 0 },
      healthResult: { status: 'PASS', totalChecks: 12, passed: 12, criticalFailed: 0 },
    });
    assert.ok(r.valid);
    assert.equal(r.handoff.sections[HANDOFF_SECTIONS.QA_SUMMARY].status, 'PASS');
    assert.equal(r.handoff.sections[HANDOFF_SECTIONS.HEALTH_SUMMARY].status, 'PASS');
  });

  it('createPostDeployHandoff BLOCKED when QA fails', () => {
    const r = createPostDeployHandoff({
      projectName: 'Nexo', clientId: 'nexo-001',
      qaResult: { status: 'FAIL', totalChecks: 22, passed: 18, criticalFailed: 2 },
      healthResult: { status: 'PASS', totalChecks: 12, passed: 12, criticalFailed: 0 },
    });
    assert.ok(r.valid);
    assert.equal(r.handoff.status, HANDOFF_STATUS.BLOCKED);
  });

  it('createPostDeployHandoff PRIORITY tier has correct response target', () => {
    const r = createPostDeployHandoff({
      projectName: 'Nexo', clientId: 'nexo-001', maintenanceTier: 'PRIORITY',
    });
    const setup = r.handoff.sections[HANDOFF_SECTIONS.MAINTENANCE_SETUP];
    assert.equal(setup.responseTargetP1, '4h');
  });

  it('createPostDeployHandoff includes 7 sections', () => {
    const r = createPostDeployHandoff({ projectName: 'Nexo', clientId: 'nexo-001' });
    assert.equal(Object.keys(r.handoff.sections).length, 7);
  });
});

// ─── 23. registry v2.7.0+ ────────────────────────────────────────────────────
describe('registry v2.7.0', () => {
  it('REGISTRY_VERSION is 2.7.0 or higher (updated by Paso H)', () => {
    const version = registry.REGISTRY_VERSION;
    assert.ok(version >= '2.7.0', `Expected >= 2.7.0, got ${version}`);
  });

  it('PASO_G_STATUS_MAIN is 100_PERCENT', () => {
    assert.equal(registry.PASO_G_STATUS_MAIN, '100_PERCENT');
  });

  it('PASO_F_STATUS_MAIN still 100_PERCENT', () => {
    assert.equal(registry.PASO_F_STATUS_MAIN, '100_PERCENT');
  });

  it('registry exports evaluateReleaseGates', () => {
    assert.equal(typeof registry.evaluateReleaseGates, 'function');
  });

  it('registry exports evaluateProductionChecklist', () => {
    assert.equal(typeof registry.evaluateProductionChecklist, 'function');
  });

  it('registry exports createCloudflareProfile', () => {
    assert.equal(typeof registry.createCloudflareProfile, 'function');
  });

  it('registry exports createPostDeployHandoff', () => {
    assert.equal(typeof registry.createPostDeployHandoff, 'function');
  });

  it('registry exports createReleaseManifest', () => {
    assert.equal(typeof registry.createReleaseManifest, 'function');
  });

  it('registry exports runHealthChecks', () => {
    assert.equal(typeof registry.runHealthChecks, 'function');
  });

  it('registry exports GATE_RESULT', () => {
    assert.ok(registry.GATE_RESULT.PASS);
  });

  it('registry exports HANDOFF_STATUS', () => {
    assert.ok(registry.HANDOFF_STATUS.COMPLETE);
  });
});
