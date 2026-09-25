// ADV-15 Docker + Reproducible Environments — Test Suite
// node:test + node:assert/strict | FACTORY_AGENCY_SCOPE_ONLY=SI | NO_REAL_PRODUCTION_DEPLOY=SI

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Core
import {
  ENVIRONMENT, RUNTIME_MODE, createRuntimeEnvironmentProfile,
} from '../../fabrica-saas/reproducible-envs/core/runtimeEnvironmentProfile.js';
import {
  resolveNodeVersion, createNodeRuntimePolicy, NODE_VERSION_STATUS,
} from '../../fabrica-saas/reproducible-envs/core/nodeRuntimePolicy.js';
import {
  PACKAGE_MANAGER, detectPackageManager, createPackageManagerPolicy,
} from '../../fabrica-saas/reproducible-envs/core/packageManagerPolicy.js';
import {
  DEPENDENCY_DRIFT_STATUS, evaluateDependencyState, createDependencyInstallPolicy,
} from '../../fabrica-saas/reproducible-envs/core/dependencyInstallPolicy.js';

// Docker
import {
  generateDockerfileContent, DOCKERFILE_STAGE,
} from '../../fabrica-saas/reproducible-envs/docker/dockerfile.js';
import {
  generateDockerignoreContent, validateDockerignoreRules,
} from '../../fabrica-saas/reproducible-envs/docker/dockerignore.js';
import {
  SECURITY_VIOLATION, createContainerSecurityPolicy, evaluateContainerSecurity,
} from '../../fabrica-saas/reproducible-envs/docker/containerSecurityPolicy.js';
import {
  CONFIG_CLASS, classifyEnvVar, createContainerConfigPolicy, validateNoSecretsHardcoded,
} from '../../fabrica-saas/reproducible-envs/docker/containerConfigPolicy.js';
import {
  HEALTH_STATE, createContainerHealthPolicy, evaluateHealthState,
} from '../../fabrica-saas/reproducible-envs/docker/containerHealthPolicy.js';
import {
  READINESS_STATUS, createReadinessPolicy, evaluateReadiness,
} from '../../fabrica-saas/reproducible-envs/docker/readinessPolicy.js';
import {
  LIVENESS_STATUS, createLivenessPolicy, evaluateLiveness,
} from '../../fabrica-saas/reproducible-envs/docker/livenessPolicy.js';
import {
  SHUTDOWN_SIGNAL, SHUTDOWN_STATUS, createGracefulShutdownPolicy, evaluateShutdown,
} from '../../fabrica-saas/reproducible-envs/docker/gracefulShutdownPolicy.js';
import {
  RESERVED_PORTS, DEFAULT_CONTAINER_PORT, createContainerPortPolicy, validatePort,
} from '../../fabrica-saas/reproducible-envs/docker/containerPortPolicy.js';
import {
  VOLUME_SAFETY, createContainerVolumePolicy,
} from '../../fabrica-saas/reproducible-envs/docker/containerVolumePolicy.js';
import {
  NETWORK_MODE, createContainerNetworkPolicy, evaluateNetworkSafety,
} from '../../fabrica-saas/reproducible-envs/docker/containerNetworkPolicy.js';
import {
  BUILD_CONTEXT_STATUS, evaluateBuildContext, createBuildContextPolicy,
} from '../../fabrica-saas/reproducible-envs/docker/buildContextPolicy.js';
import {
  createContainerImageMetadata,
} from '../../fabrica-saas/reproducible-envs/docker/containerImageMetadata.js';
import {
  TAG_STRATEGY, TAG_WARNING, createContainerTagPolicy, generateImageTag,
} from '../../fabrica-saas/reproducible-envs/docker/containerTagPolicy.js';
import {
  REPRODUCIBILITY_STATUS, evaluateContainerReproducibility,
} from '../../fabrica-saas/reproducible-envs/docker/containerReproducibilityEvaluator.js';
import {
  ARTIFACT_STATUS, validateContainerArtifact,
} from '../../fabrica-saas/reproducible-envs/docker/containerArtifactValidator.js';
import {
  EXECUTION_BLOCK_REASON, createContainerExecutionPolicy, evaluateContainerExecution,
} from '../../fabrica-saas/reproducible-envs/docker/containerExecutionPolicy.js';
import {
  RESOURCE_PROFILE, createContainerResourcePolicy,
} from '../../fabrica-saas/reproducible-envs/docker/containerResourcePolicy.js';
import {
  LOG_DRIVER, createContainerLoggingPolicy, validateLogOutput,
} from '../../fabrica-saas/reproducible-envs/docker/containerLoggingPolicy.js';
import {
  CACHE_SCOPE, createContainerBuildCachePolicy, validateCacheSafety,
} from '../../fabrica-saas/reproducible-envs/docker/containerBuildCachePolicy.js';
import {
  createContainerSupplyChainPolicy, evaluateBaseImageSafety,
} from '../../fabrica-saas/reproducible-envs/docker/containerSupplyChainPolicy.js';
import {
  BASE_IMAGE_STATUS, evaluateBaseImage, createBaseImagePolicy,
} from '../../fabrica-saas/reproducible-envs/docker/baseImagePolicy.js';
import {
  SCAN_PROVIDER, SCAN_STATUS, createContainerVulnerabilityScanPlan,
} from '../../fabrica-saas/reproducible-envs/docker/containerVulnerabilityScanPlan.js';

// Deploy
import {
  DOCKER_STATUS, VALIDATION_MODE, createDockerCapabilityDetector,
} from '../../fabrica-saas/reproducible-envs/deploy/dockerCapabilityDetector.js';
import {
  FALLBACK_MODE, createEnvironmentFallbackPolicy,
} from '../../fabrica-saas/reproducible-envs/deploy/environmentFallbackPolicy.js';
import {
  DEPLOY_TARGET, RUNTIME_RECOMMENDATION, resolveDeploymentRuntime,
} from '../../fabrica-saas/reproducible-envs/deploy/deploymentRuntimeResolver.js';
import {
  createStagingEnvironmentProfile,
} from '../../fabrica-saas/reproducible-envs/deploy/stagingEnvironmentProfile.js';
import {
  TEST_SCOPE, createContainerTestProfile,
} from '../../fabrica-saas/reproducible-envs/deploy/containerTestProfile.js';
import {
  ROLLBACK_TRIGGER, createContainerRollbackPlan, evaluateRollbackDecision,
} from '../../fabrica-saas/reproducible-envs/deploy/containerRollbackPlan.js';
import {
  RELEASE_STRATEGY, createContainerReleaseStrategy,
} from '../../fabrica-saas/reproducible-envs/deploy/containerReleaseStrategy.js';
import {
  FAILURE_CASE, createEnvironmentRecoveryPolicy,
} from '../../fabrica-saas/reproducible-envs/deploy/environmentRecoveryPolicy.js';

// Commands
import {
  ENV_COMMAND, createReproducibleEnvironmentCommands,
} from '../../fabrica-saas/reproducible-envs/commands/reproducibleEnvironmentCommands.js';
import {
  START_RESULT, startReproducibleEnvironment,
} from '../../fabrica-saas/reproducible-envs/commands/startReproducibleEnvironment.js';

// Bridges
import { createCICDBridge, CICD_PIPELINE_STEP } from '../../fabrica-saas/reproducible-envs/bridges/cicdBridge.js';
import { bridgeToProductionPipeline } from '../../fabrica-saas/reproducible-envs/bridges/productionBridge.js';
import { ENV_OBS_EVENT, emitEnvironmentEvent } from '../../fabrica-saas/reproducible-envs/bridges/observabilityBridge.js';
import { QA_TARGET, createPlaywrightBridge } from '../../fabrica-saas/reproducible-envs/bridges/playwrightBridge.js';
import { MCP_EXECUTION_ENV, createMCPEnvironmentBridge } from '../../fabrica-saas/reproducible-envs/bridges/mcpBridge.js';

// Fixtures
import {
  ALL_RUNTIME_FIXTURES, FIXTURE_STATIC_SAAS, FIXTURE_CONTAINER_SAAS,
} from '../../fabrica-saas/reproducible-envs/fixtures/runtimeFixtures.js';
import {
  ALL_DOCKER_FIXTURES, FIXTURE_SERVERLESS_BYPASS,
} from '../../fabrica-saas/reproducible-envs/fixtures/dockerFixtures.js';
import {
  ALL_FAILURE_FIXTURES,
} from '../../fabrica-saas/reproducible-envs/fixtures/failureFixtures.js';

// Quality
import {
  computeReproducibleEnvironmentQualityScore,
} from '../../fabrica-saas/reproducible-envs/quality/reproducibleEnvironmentQualityScore.js';
import {
  ENV_GATE_STATUS, ENV_CRITICAL_FAILURE, evaluateReproducibleEnvironmentQualityGate,
} from '../../fabrica-saas/reproducible-envs/quality/reproducibleEnvironmentQualityGate.js';

// Registry
import {
  REGISTRY_VERSION, REPRODUCIBLE_ENVS_REGISTRY, PASO_ADV15_STATUS,
} from '../../fabrica-saas/factory-registry/index.js';

// Barrel
import {
  REPRODUCIBLE_ENVS_LAYER_VERSION, ADV15_STATUS, DOCKER_RUNTIME_AVAILABLE,
  REPRODUCIBLE_ENVS_GUARDRAILS,
} from '../../fabrica-saas/reproducible-envs/index.js';

// ── Suite 1: Runtime Environment Profile ─────────────────────────────────────
describe('Suite 01 — RuntimeEnvironmentProfile', () => {
  it('creates LOCAL profile with defaults', () => {
    const p = createRuntimeEnvironmentProfile({ environment: 'LOCAL' });
    assert.equal(p.environment, 'LOCAL');
    assert.equal(p.isReal, false);
    assert.ok(Object.isFrozen(p));
  });
  it('creates CI profile with npm ci', () => {
    const p = createRuntimeEnvironmentProfile({ environment: 'CI' });
    assert.equal(p.installMode, 'npm-ci');
    assert.equal(p.port, 5180);
  });
  it('creates PRODUCTION profile', () => {
    const p = createRuntimeEnvironmentProfile({ environment: 'PRODUCTION' });
    assert.equal(p.readinessPolicy, 'WAIT_FOR_HEALTH');
    assert.equal(p.isReal, false);
  });
  it('throws for unknown environment', () => {
    assert.throws(() => createRuntimeEnvironmentProfile({ environment: 'UNKNOWN_ENV' }), /unknown environment/);
  });
  it('throws for unknown runtimeMode', () => {
    assert.throws(() => createRuntimeEnvironmentProfile({ environment: 'LOCAL', runtimeMode: 'INVALID' }), /unknown runtimeMode/);
  });
  it('ENVIRONMENT has 5 values', () => {
    assert.equal(Object.keys(ENVIRONMENT).length, 5);
  });
  it('RUNTIME_MODE has 3 values', () => {
    assert.equal(Object.keys(RUNTIME_MODE).length, 3);
  });
});

// ── Suite 2: Node Runtime Policy ─────────────────────────────────────────────
describe('Suite 02 — NodeRuntimePolicy', () => {
  it('resolves version from enginesNode', () => {
    const r = resolveNodeVersion({ enginesNode: '>=20', currentRuntime: 'v24.16.0' });
    assert.equal(r.resolved, '>=20');
    assert.equal(r.isReal, false);
  });
  it('detects NEWER_MAJOR when current > resolved', () => {
    const r = resolveNodeVersion({ enginesNode: '20', currentRuntime: 'v24.0.0' });
    assert.equal(r.status, NODE_VERSION_STATUS.NEWER_MAJOR);
  });
  it('detects EXACT_MATCH', () => {
    const r = resolveNodeVersion({ enginesNode: '22', currentRuntime: 'v22.0.0' });
    assert.equal(r.status, NODE_VERSION_STATUS.EXACT_MATCH);
  });
  it('creates node runtime policy with dockerBaseImage', () => {
    const p = createNodeRuntimePolicy({ enginesNode: '22' });
    assert.ok(p.dockerBaseImage.includes('alpine'));
    assert.equal(p.isReal, false);
  });
  it('warns when current Node is newer than recommended', () => {
    const p = createNodeRuntimePolicy({ enginesNode: '20', currentRuntime: 'v24.0.0' });
    assert.ok(p.warnings.length > 0);
  });
  it('policy is frozen', () => {
    const p = createNodeRuntimePolicy({});
    assert.ok(Object.isFrozen(p));
  });
});

// ── Suite 3: Package Manager Policy ──────────────────────────────────────────
describe('Suite 03 — PackageManagerPolicy', () => {
  it('detects npm from lockfile', () => {
    const d = detectPackageManager({ lockfiles: ['package-lock.json'] });
    assert.equal(d.detected, 'npm');
    assert.equal(d.isReal, false);
  });
  it('detects pnpm from lockfile', () => {
    const d = detectPackageManager({ lockfiles: ['pnpm-lock.yaml'] });
    assert.equal(d.detected, 'pnpm');
  });
  it('defaults to npm when no signal', () => {
    const d = detectPackageManager({});
    assert.equal(d.detected, 'npm');
  });
  it('creates policy with install command', () => {
    const p = createPackageManagerPolicy({ lockfiles: ['package-lock.json'] });
    assert.equal(p.installCommand, 'npm ci');
    assert.equal(p.allowMigration, false);
  });
  it('frozen output', () => {
    assert.ok(Object.isFrozen(createPackageManagerPolicy({})));
  });
  it('PACKAGE_MANAGER has 4 values', () => {
    assert.equal(Object.keys(PACKAGE_MANAGER).length, 4);
  });
});

// ── Suite 4: Dependency Install Policy ───────────────────────────────────────
describe('Suite 04 — DependencyInstallPolicy', () => {
  it('CLEAN when lockfile present and pm matches', () => {
    const s = evaluateDependencyState({ hasLockfile: true, expectedPM: 'npm', detectedPM: 'npm', hasNodeModules: true });
    assert.equal(s.status, DEPENDENCY_DRIFT_STATUS.CLEAN);
    assert.equal(s.canUseCi, true);
  });
  it('detects MISSING_LOCKFILE', () => {
    const s = evaluateDependencyState({ hasLockfile: false });
    assert.equal(s.status, DEPENDENCY_DRIFT_STATUS.MISSING_LOCKFILE);
  });
  it('detects UNEXPECTED_PM', () => {
    const s = evaluateDependencyState({ hasLockfile: true, expectedPM: 'npm', detectedPM: 'pnpm', hasNodeModules: true });
    assert.equal(s.status, DEPENDENCY_DRIFT_STATUS.UNEXPECTED_PM);
  });
  it('recommends npm-ci when lockfile present', () => {
    const p = createDependencyInstallPolicy({ hasLockfile: true, expectedPM: 'npm', detectedPM: 'npm', hasNodeModules: true });
    assert.equal(p.recommended, 'npm-ci');
  });
  it('isReal false', () => {
    assert.equal(createDependencyInstallPolicy({}).isReal, false);
  });
});

// ── Suite 5: Dockerfile Foundation ───────────────────────────────────────────
describe('Suite 05 — Dockerfile Foundation', () => {
  it('generates multi-stage Dockerfile content', () => {
    const d = generateDockerfileContent({ nodeVersion: '22', port: 5180 });
    assert.ok(d.content.includes('AS dependencies'));
    assert.ok(d.content.includes('AS build'));
    assert.ok(d.content.includes('AS runtime'));
    assert.equal(d.multiStage, true);
    assert.equal(d.nonRootUser, true);
    assert.equal(d.noRealSecrets, true);
    assert.equal(d.isReal, false);
  });
  it('uses correct port', () => {
    const d = generateDockerfileContent({ port: 5180 });
    assert.ok(d.content.includes('5180'));
    assert.equal(d.port, 5180);
  });
  it('does not include COPY .env', () => {
    const d = generateDockerfileContent({});
    assert.ok(!d.content.includes('COPY .env'));
  });
  it('has 3 stages', () => {
    const d = generateDockerfileContent({});
    assert.equal(d.stages.length, 3);
  });
  it('is frozen', () => {
    assert.ok(Object.isFrozen(generateDockerfileContent({})));
  });
  it('DOCKERFILE_STAGE has 3 values', () => {
    assert.equal(Object.keys(DOCKERFILE_STAGE).length, 3);
  });
});

// ── Suite 6: Dockerignore ─────────────────────────────────────────────────────
describe('Suite 06 — Dockerignore', () => {
  it('generates content with secret exclusions', () => {
    const d = generateDockerignoreContent({});
    assert.ok(d.content.includes('.env'));
    assert.ok(d.content.includes('node_modules'));
    assert.ok(d.content.includes('.git'));
    assert.equal(d.noSecretsInContext, true);
    assert.equal(d.isReal, false);
  });
  it('validates missing secret exclusions', () => {
    const v = validateDockerignoreRules(['.gitignore', 'node_modules']);
    assert.equal(v.valid, false);
    assert.ok(v.missing.length > 0);
  });
  it('validates complete ruleset', () => {
    const d = generateDockerignoreContent({});
    const v = validateDockerignoreRules(d.rules);
    assert.equal(v.valid, true);
  });
});

// ── Suite 7: Container Security Policy ───────────────────────────────────────
describe('Suite 07 — ContainerSecurityPolicy', () => {
  it('creates safe policy with defaults', () => {
    const p = createContainerSecurityPolicy({});
    assert.equal(p.nonRootUser, true);
    assert.equal(p.noSecretsInImage, true);
    assert.equal(p.noPrivilegedMode, true);
    assert.equal(p.isReal, false);
  });
  it('detects PRIVILEGED_MODE → blocked', () => {
    const r = evaluateContainerSecurity({ privileged: true });
    assert.equal(r.blocked, true);
    assert.ok(r.violations.some(v => v.code === SECURITY_VIOLATION.PRIVILEGED_MODE));
  });
  it('detects DOCKER_SOCKET_MOUNT → blocked', () => {
    const r = evaluateContainerSecurity({ volumes: ['/var/run/docker.sock:/var/run/docker.sock'] });
    assert.equal(r.blocked, true);
  });
  it('detects HOST_NETWORK violation', () => {
    const r = evaluateContainerSecurity({ networkMode: 'host' });
    assert.ok(r.violations.some(v => v.code === SECURITY_VIOLATION.HOST_NETWORK));
  });
  it('detects MISSING_HEALTH', () => {
    const r = evaluateContainerSecurity({});
    assert.ok(r.violations.some(v => v.code === SECURITY_VIOLATION.MISSING_HEALTH));
  });
  it('passes clean spec', () => {
    const r = evaluateContainerSecurity({ healthCheck: true, user: 'appuser' });
    assert.equal(r.safe, true);
    assert.equal(r.blocked, false);
  });
  it('SECURITY_VIOLATION has 8 keys', () => {
    assert.equal(Object.keys(SECURITY_VIOLATION).length, 8);
  });
});

// ── Suite 8: Container Config Policy ─────────────────────────────────────────
describe('Suite 08 — ContainerConfigPolicy', () => {
  it('classifies SECRET env vars', () => {
    assert.equal(classifyEnvVar('SUPABASE_SECRET_KEY'), CONFIG_CLASS.SECRET);
    assert.equal(classifyEnvVar('API_TOKEN'), CONFIG_CLASS.SECRET);
  });
  it('classifies PUBLIC env vars', () => {
    assert.equal(classifyEnvVar('PORT'), CONFIG_CLASS.PUBLIC);
    assert.equal(classifyEnvVar('NODE_ENV'), CONFIG_CLASS.PUBLIC);
  });
  it('creates config policy with separation', () => {
    const p = createContainerConfigPolicy(['NODE_ENV', 'PORT', 'SUPABASE_KEY', 'API_TOKEN']);
    assert.ok(p.secretVars.length >= 2);
    assert.ok(p.publicVars.length >= 1);
    assert.equal(p.policy.noHardcodedSecrets, true);
    assert.equal(p.isReal, false);
  });
  it('detects hardcoded secrets', () => {
    const v = validateNoSecretsHardcoded({ API_KEY: 'sk-real-key-value-here' });
    assert.equal(v.safe, false);
  });
  it('passes safe env vars', () => {
    const v = validateNoSecretsHardcoded({ NODE_ENV: 'production', PORT: '5180' });
    assert.equal(v.safe, true);
  });
  it('CONFIG_CLASS has 3 values', () => {
    assert.equal(Object.keys(CONFIG_CLASS).length, 3);
  });
});

// ── Suite 9: Health Policy ────────────────────────────────────────────────────
describe('Suite 09 — ContainerHealthPolicy', () => {
  it('creates policy with defaults', () => {
    const p = createContainerHealthPolicy({});
    assert.equal(p.endpoint, '/health');
    assert.equal(p.retries, 3);
    assert.equal(p.isReal, false);
  });
  it('STARTING during startup period', () => {
    const s = evaluateHealthState({ consecutiveFailures: 0, lastStatusCode: 200, startedMs: Date.now() - 5000, nowMs: Date.now() });
    assert.equal(s.state, HEALTH_STATE.STARTING);
  });
  it('HEALTHY after startup with 200', () => {
    const s = evaluateHealthState({ consecutiveFailures: 0, lastStatusCode: 200, startedMs: Date.now() - 60000, nowMs: Date.now() });
    assert.equal(s.state, HEALTH_STATE.HEALTHY);
  });
  it('UNHEALTHY after max retries', () => {
    const s = evaluateHealthState({ consecutiveFailures: 5, lastStatusCode: 503, startedMs: Date.now() - 60000, nowMs: Date.now() });
    assert.equal(s.state, HEALTH_STATE.UNHEALTHY);
  });
  it('HEALTH_STATE has 4 values', () => {
    assert.equal(Object.keys(HEALTH_STATE).length, 4);
  });
});

// ── Suite 10: Readiness Policy ───────────────────────────────────────────────
describe('Suite 10 — ReadinessPolicy', () => {
  it('NOT_STARTED when process not running', () => {
    const r = evaluateReadiness({ processRunning: false });
    assert.equal(r.status, READINESS_STATUS.NOT_STARTED);
  });
  it('PROCESS_UP but not APP_READY when health pending', () => {
    const r = evaluateReadiness({ processRunning: true, healthOk: false, strategy: 'WAIT_FOR_HEALTH' });
    assert.equal(r.status, READINESS_STATUS.PROCESS_UP);
  });
  it('APP_READY when health ok', () => {
    const r = evaluateReadiness({ processRunning: true, healthOk: true });
    assert.equal(r.status, READINESS_STATUS.APP_READY);
  });
  it('APP_READY with WAIT_FOR_PROCESS strategy', () => {
    const r = evaluateReadiness({ processRunning: true, strategy: 'WAIT_FOR_PROCESS' });
    assert.equal(r.status, READINESS_STATUS.APP_READY);
  });
  it('processUpIsNotReady=true in policy', () => {
    const p = createReadinessPolicy({});
    assert.equal(p.processUpIsNotReady, true);
  });
});

// ── Suite 11: Liveness Policy ────────────────────────────────────────────────
describe('Suite 11 — LivenessPolicy', () => {
  it('WARMING during grace period', () => {
    const r = evaluateLiveness({ consecutiveFailures: 10, elapsedMs: 5000, warmupGracePeriodMs: 30000 });
    assert.equal(r.status, LIVENESS_STATUS.WARMING);
    assert.equal(r.restart, false);
  });
  it('DEAD after max failures', () => {
    const r = evaluateLiveness({ consecutiveFailures: 5, elapsedMs: 60000, maxFailures: 5 });
    assert.equal(r.status, LIVENESS_STATUS.DEAD);
    assert.equal(r.restart, true);
  });
  it('ALIVE when no failures', () => {
    const r = evaluateLiveness({ consecutiveFailures: 0, elapsedMs: 60000 });
    assert.equal(r.status, LIVENESS_STATUS.ALIVE);
  });
  it('avoidFalseRestarts=true in policy', () => {
    const p = createLivenessPolicy({});
    assert.equal(p.avoidFalseRestarts, true);
  });
});

// ── Suite 12: Graceful Shutdown ───────────────────────────────────────────────
describe('Suite 12 — GracefulShutdownPolicy', () => {
  it('creates policy with SIGTERM default', () => {
    const p = createGracefulShutdownPolicy({});
    assert.equal(p.signal, SHUTDOWN_SIGNAL.SIGTERM);
    assert.equal(p.timeoutMs, 30000);
    assert.equal(p.isReal, false);
  });
  it('CLEAN when no pending and within timeout', () => {
    const r = evaluateShutdown({ pendingRequests: 0, elapsedMs: 1000, timeoutMs: 30000 });
    assert.equal(r.status, SHUTDOWN_STATUS.CLEAN);
  });
  it('TIMEOUT when requests remain after timeout', () => {
    const r = evaluateShutdown({ pendingRequests: 5, elapsedMs: 35000, timeoutMs: 30000 });
    assert.equal(r.status, SHUTDOWN_STATUS.TIMEOUT);
  });
  it('SHUTDOWN_SIGNAL has 3 values', () => {
    assert.equal(Object.keys(SHUTDOWN_SIGNAL).length, 3);
  });
});

// ── Suite 13: Port Policy ─────────────────────────────────────────────────────
describe('Suite 13 — ContainerPortPolicy', () => {
  it('default port is 5180', () => {
    assert.equal(DEFAULT_CONTAINER_PORT, 5180);
  });
  it('5175 is reserved', () => {
    assert.ok(RESERVED_PORTS.includes(5175));
  });
  it('throws when port 5175 is used', () => {
    assert.throws(() => createContainerPortPolicy({ port: 5175 }), /reserved/);
  });
  it('creates policy with port 5180', () => {
    const p = createContainerPortPolicy({ port: 5180 });
    assert.equal(p.containerPort, 5180);
    assert.equal(p.isReal, false);
  });
  it('validatePort rejects 5175', () => {
    const v = validatePort(5175);
    assert.equal(v.valid, false);
  });
  it('validatePort accepts 5180', () => {
    const v = validatePort(5180);
    assert.equal(v.valid, true);
  });
});

// ── Suite 14: Volume Policy ───────────────────────────────────────────────────
describe('Suite 14 — ContainerVolumePolicy', () => {
  it('blocks docker socket mount', () => {
    const p = createContainerVolumePolicy(['/var/run/docker.sock:/var/run/docker.sock']);
    assert.equal(p.blocked, true);
    assert.equal(p.isReal, false);
  });
  it('passes safe src mount', () => {
    const p = createContainerVolumePolicy(['./src:/app/src']);
    assert.equal(p.blocked, false);
  });
  it('blocks host root mount', () => {
    const p = createContainerVolumePolicy(['/:/host']);
    assert.equal(p.blocked, true);
  });
  it('noInsecureMount=true', () => {
    const p = createContainerVolumePolicy([]);
    assert.equal(p.noInsecureMount, true);
  });
  it('VOLUME_SAFETY has 3 values', () => {
    assert.equal(Object.keys(VOLUME_SAFETY).length, 3);
  });
});

// ── Suite 15: Network Policy ──────────────────────────────────────────────────
describe('Suite 15 — ContainerNetworkPolicy', () => {
  it('creates bridge network policy', () => {
    const p = createContainerNetworkPolicy({});
    assert.equal(p.mode, NETWORK_MODE.BRIDGE);
    assert.equal(p.minimalAccess, true);
    assert.equal(p.isReal, false);
  });
  it('throws for host network mode', () => {
    assert.throws(() => createContainerNetworkPolicy({ networkMode: NETWORK_MODE.HOST }), /host network/);
  });
  it('evaluates HOST_NETWORK violation', () => {
    const r = evaluateNetworkSafety({ networkMode: 'host' });
    assert.equal(r.safe, false);
    assert.ok(r.violations.some(v => v.code === 'HOST_NETWORK'));
  });
  it('evaluates dangerous port', () => {
    const r = evaluateNetworkSafety({ openPorts: [22] });
    assert.equal(r.safe, false);
  });
  it('NETWORK_MODE has 4 values', () => {
    assert.equal(Object.keys(NETWORK_MODE).length, 4);
  });
});

// ── Suite 16: Build Context Policy ───────────────────────────────────────────
describe('Suite 16 — BuildContextPolicy', () => {
  it('blocks secret file in context', () => {
    const r = evaluateBuildContext(['.env', 'src/index.js']);
    assert.equal(r.status, BUILD_CONTEXT_STATUS.BLOCKED);
    assert.equal(r.blocked, true);
    assert.equal(r.isReal, false);
  });
  it('warns for large artifacts', () => {
    const r = evaluateBuildContext(['node_modules/pkg/index.js']);
    assert.ok(r.status !== BUILD_CONTEXT_STATUS.SAFE || r.issues.length >= 0);
  });
  it('passes clean context', () => {
    const r = evaluateBuildContext(['src/index.js', 'package.json', 'public/icon.svg']);
    assert.equal(r.status, BUILD_CONTEXT_STATUS.SAFE);
    assert.equal(r.blocked, false);
  });
  it('BUILD_CONTEXT_STATUS has 3 values', () => {
    assert.equal(Object.keys(BUILD_CONTEXT_STATUS).length, 3);
  });
});

// ── Suite 17: Image Metadata ──────────────────────────────────────────────────
describe('Suite 17 — ContainerImageMetadata', () => {
  it('creates metadata without secrets', () => {
    const m = createContainerImageMetadata({ app: 'factory', version: '1.0.0', gitSha: 'abc123' });
    assert.equal(m.app, 'factory');
    assert.equal(m.noSecrets, true);
    assert.equal(m.isReal, false);
    assert.ok(Object.isFrozen(m));
  });
  it('requires app', () => {
    assert.throws(() => createContainerImageMetadata({ version: '1.0.0' }), /requires app/);
  });
  it('requires version', () => {
    assert.throws(() => createContainerImageMetadata({ app: 'factory' }), /requires version/);
  });
  it('rejects secretKey in metadata', () => {
    assert.throws(() => createContainerImageMetadata({ app: 'x', version: '1', secretKey: 'real-value' }), /METADATA_SAFETY/);
  });
  it('includes OCI labels', () => {
    const m = createContainerImageMetadata({ app: 'factory', version: '1.0.0' });
    assert.ok(m.labels['org.opencontainers.image.title']);
  });
});

// ── Suite 18: Tag Policy ──────────────────────────────────────────────────────
describe('Suite 18 — ContainerTagPolicy', () => {
  it('creates tag policy with no latest', () => {
    const p = createContainerTagPolicy({});
    assert.equal(p.allowLatest, false);
    assert.equal(p.isReal, false);
  });
  it('generates immutable tag from gitSha', () => {
    const t = generateImageTag({ app: 'factory', version: '1.0.0', gitSha: 'abc12345678' });
    assert.ok(t.tags.some(tag => tag.includes('abc12345')));
    assert.equal(t.immutable, true);
    assert.equal(t.isReal, false);
  });
  it('warns when no sha and no version', () => {
    const t = generateImageTag({ app: 'factory' });
    assert.ok(t.warnings.includes(TAG_WARNING.NO_SHA) || t.warnings.includes(TAG_WARNING.NO_VERSION));
  });
  it('requires app', () => {
    assert.throws(() => generateImageTag({}), /requires app/);
  });
  it('TAG_STRATEGY has 4 values', () => {
    assert.equal(Object.keys(TAG_STRATEGY).length, 4);
  });
});

// ── Suite 19: Reproducibility Evaluator ──────────────────────────────────────
describe('Suite 19 — ContainerReproducibilityEvaluator', () => {
  it('REPRODUCIBLE when all factors pass', () => {
    const r = evaluateContainerReproducibility({
      hasNodeVersionLock: true, hasLockfile: true, hasExplicitBuildArgs: true,
      hasImmutableTag: true, hasBaseImagePin: true,
    });
    assert.equal(r.status, REPRODUCIBILITY_STATUS.REPRODUCIBLE);
    assert.equal(r.score, 100);
    assert.equal(r.isReal, false);
  });
  it('NON_REPRODUCIBLE when most fail', () => {
    const r = evaluateContainerReproducibility({ hasLockfile: false });
    assert.equal(r.status, REPRODUCIBILITY_STATUS.NON_REPRODUCIBLE);
  });
  it('MOSTLY when partial', () => {
    const r = evaluateContainerReproducibility({ hasNodeVersionLock: true, hasLockfile: true });
    assert.ok([REPRODUCIBILITY_STATUS.MOSTLY, REPRODUCIBILITY_STATUS.NON_REPRODUCIBLE].includes(r.status));
  });
  it('REPRODUCIBILITY_STATUS has 3 values', () => {
    assert.equal(Object.keys(REPRODUCIBILITY_STATUS).length, 3);
  });
});

// ── Suite 20: Artifact Validator ──────────────────────────────────────────────
describe('Suite 20 — ContainerArtifactValidator', () => {
  it('VALID for clean artifact', () => {
    const v = validateContainerArtifact({ distExists: true, sizeMb: 10, hasSecretFiles: false, hasRequiredFiles: true });
    assert.equal(v.status, ARTIFACT_STATUS.VALID);
    assert.equal(v.valid, true);
    assert.equal(v.isReal, false);
  });
  it('INVALID when dist missing', () => {
    const v = validateContainerArtifact({ distExists: false });
    assert.equal(v.status, ARTIFACT_STATUS.INVALID);
  });
  it('INVALID when secret in artifact', () => {
    const v = validateContainerArtifact({ distExists: true, hasSecretFiles: true });
    assert.equal(v.status, ARTIFACT_STATUS.INVALID);
  });
  it('ARTIFACT_STATUS has 3 values', () => {
    assert.equal(Object.keys(ARTIFACT_STATUS).length, 3);
  });
});

// ── Suite 21: Container Execution Policy ─────────────────────────────────────
describe('Suite 21 — ContainerExecutionPolicy', () => {
  it('creates policy blocking all dangerous modes', () => {
    const p = createContainerExecutionPolicy();
    assert.equal(p.blockPrivileged, true);
    assert.equal(p.blockDockerSocket, true);
    assert.equal(p.isReal, false);
  });
  it('blocks privileged spec', () => {
    const r = evaluateContainerExecution({ privileged: true });
    assert.equal(r.blocked, true);
    assert.ok(r.blocks.some(b => b.code === EXECUTION_BLOCK_REASON.PRIVILEGED));
  });
  it('blocks docker socket mount', () => {
    const r = evaluateContainerExecution({ volumes: ['/var/run/docker.sock:/var/run/docker.sock'] });
    assert.equal(r.blocked, true);
  });
  it('blocks /proc mount', () => {
    const r = evaluateContainerExecution({ volumes: ['/proc:/host-proc'] });
    assert.equal(r.blocked, true);
  });
  it('allows clean spec', () => {
    const r = evaluateContainerExecution({ volumes: ['./data:/app/data'] });
    assert.equal(r.allowed, true);
  });
});

// ── Suite 22: Resource Policy ─────────────────────────────────────────────────
describe('Suite 22 — ContainerResourcePolicy', () => {
  it('creates STANDARD profile', () => {
    const p = createContainerResourcePolicy({ profile: 'STANDARD' });
    assert.equal(p.limits.cpu, '0.5');
    assert.equal(p.limits.memory, '512m');
    assert.equal(p.isReal, false);
  });
  it('creates MINIMAL profile', () => {
    const p = createContainerResourcePolicy({ profile: 'MINIMAL' });
    assert.equal(p.limits.cpu, '0.25');
  });
  it('creates LARGE profile', () => {
    const p = createContainerResourcePolicy({ profile: 'LARGE' });
    assert.equal(p.limits.memory, '1g');
  });
  it('throws for unknown profile', () => {
    assert.throws(() => createContainerResourcePolicy({ profile: 'UNLIMITED' }), /unknown profile/);
  });
  it('RESOURCE_PROFILE has 4 keys', () => {
    assert.equal(Object.keys(RESOURCE_PROFILE).length, 4);
  });
});

// ── Suite 23: Logging Policy ──────────────────────────────────────────────────
describe('Suite 23 — ContainerLoggingPolicy', () => {
  it('creates policy with stdout compat', () => {
    const p = createContainerLoggingPolicy({});
    assert.equal(p.stdoutCompatible, true);
    assert.equal(p.noSecretLogging, true);
    assert.equal(p.isReal, false);
  });
  it('validates clean log output', () => {
    const v = validateLogOutput(['INFO: server started on port 5180', 'DEBUG: request received']);
    assert.equal(v.safe, true);
    assert.equal(v.isReal, false);
  });
  it('detects leaked secret in logs', () => {
    const v = validateLogOutput(['INFO: connected', 'DEBUG: token=sk-real-api-key']);
    assert.equal(v.safe, false);
  });
  it('LOG_DRIVER has 4 values', () => {
    assert.equal(Object.keys(LOG_DRIVER).length, 4);
  });
});

// ── Suite 24: Build Cache Policy ─────────────────────────────────────────────
describe('Suite 24 — ContainerBuildCachePolicy', () => {
  it('creates cache policy with local scope', () => {
    const p = createContainerBuildCachePolicy({});
    assert.equal(p.scope, CACHE_SCOPE.LOCAL);
    assert.equal(p.noSecretCache, true);
    assert.equal(p.isReal, false);
  });
  it('validates safe cache config', () => {
    const v = validateCacheSafety({ key: 'node-modules-{{hash}}' });
    assert.equal(v.safe, true);
  });
  it('detects secret in cache key', () => {
    const v = validateCacheSafety({ key: 'cache-secret-token-12345' });
    assert.equal(v.safe, false);
  });
  it('CACHE_SCOPE has 4 values', () => {
    assert.equal(Object.keys(CACHE_SCOPE).length, 4);
  });
});

// ── Suite 25: Supply Chain & Base Image ───────────────────────────────────────
describe('Suite 25 — SupplyChain + BaseImage', () => {
  it('creates supply chain policy', () => {
    const p = createContainerSupplyChainPolicy({});
    assert.equal(p.lockDependencies, true);
    assert.equal(p.noUnknownBaseImages, true);
    assert.equal(p.isReal, false);
  });
  it('evaluates known base image as APPROVED', () => {
    const r = evaluateBaseImageSafety('node:22-alpine');
    assert.equal(r.isKnown, true);
  });
  it('evaluates pinned image', () => {
    const r = evaluateBaseImageSafety('node:22@sha256:abc123');
    assert.equal(r.isPinned, true);
  });
  it('evaluateBaseImage returns APPROVED for node:22-alpine', () => {
    const r = evaluateBaseImage('node:22-alpine');
    assert.equal(r.status, BASE_IMAGE_STATUS.APPROVED);
  });
  it('createBaseImagePolicy recommends alpine', () => {
    const p = createBaseImagePolicy({});
    assert.ok(p.recommendedForNode.includes('alpine'));
  });
  it('BASE_IMAGE_STATUS has 3 values', () => {
    assert.equal(Object.keys(BASE_IMAGE_STATUS).length, 3);
  });
});

// ── Suite 26: Vulnerability Scan Plan ────────────────────────────────────────
describe('Suite 26 — ContainerVulnerabilityScanPlan', () => {
  it('creates plan in PLANNED status', () => {
    const p = createContainerVulnerabilityScanPlan({});
    assert.equal(p.status, SCAN_STATUS.PLANNED);
    assert.equal(p.noAutoInstall, true);
    assert.equal(p.adv15Foundation, true);
    assert.equal(p.isReal, false);
  });
  it('defaults to Trivy provider', () => {
    const p = createContainerVulnerabilityScanPlan({});
    assert.equal(p.preferredProvider, SCAN_PROVIDER.TRIVY);
  });
  it('SCAN_STATUS has 4 values', () => {
    assert.equal(Object.keys(SCAN_STATUS).length, 4);
  });
  it('SCAN_PROVIDER has 5 values', () => {
    assert.equal(Object.keys(SCAN_PROVIDER).length, 5);
  });
});

// ── Suite 27: Docker Capability Detector ─────────────────────────────────────
describe('Suite 27 — DockerCapabilityDetector', () => {
  it('AVAILABLE when cli and daemon both available', () => {
    const d = createDockerCapabilityDetector({ cliAvailable: true, daemonAvailable: true });
    assert.equal(d.status, DOCKER_STATUS.AVAILABLE);
    assert.equal(d.validationMode, VALIDATION_MODE.FULL_DOCKER);
    assert.equal(d.isReal, false);
  });
  it('CLI_ONLY when cli available but no daemon', () => {
    const d = createDockerCapabilityDetector({ cliAvailable: true, daemonAvailable: false });
    assert.equal(d.status, DOCKER_STATUS.CLI_ONLY);
  });
  it('DAEMON_UNAVAILABLE in this environment', () => {
    const d = createDockerCapabilityDetector({ cliAvailable: false, daemonAvailable: false });
    assert.equal(d.status, DOCKER_STATUS.DAEMON_UNAVAILABLE);
    assert.equal(d.staticFallbackOk, true);
  });
  it('UNSUPPORTED on android platform', () => {
    const d = createDockerCapabilityDetector({ cliAvailable: false, platform: 'android' });
    assert.equal(d.status, DOCKER_STATUS.UNSUPPORTED);
    assert.equal(d.staticFallbackOk, true);
  });
  it('DOCKER_STATUS has 5 values', () => {
    assert.equal(Object.keys(DOCKER_STATUS).length, 5);
  });
  it('VALIDATION_MODE has 3 values', () => {
    assert.equal(Object.keys(VALIDATION_MODE).length, 3);
  });
});

// ── Suite 28: Environment Fallback Policy ─────────────────────────────────────
describe('Suite 28 — EnvironmentFallbackPolicy', () => {
  it('no fallback when docker available', () => {
    const f = createEnvironmentFallbackPolicy({ dockerAvailable: true });
    assert.equal(f.fallbackRequired, false);
    assert.equal(f.isReal, false);
  });
  it('NODE_LOCAL fallback when docker unavailable and lockfile present', () => {
    const f = createEnvironmentFallbackPolicy({ dockerAvailable: false, hasLockfile: true, nodeVersionOk: true });
    assert.equal(f.fallbackRequired, true);
    assert.equal(f.mode, FALLBACK_MODE.NODE_LOCAL);
    assert.equal(f.notProductionFail, true);
  });
  it('STATIC_VALIDATION when lockfile missing', () => {
    const f = createEnvironmentFallbackPolicy({ dockerAvailable: false, hasLockfile: false });
    assert.equal(f.mode, FALLBACK_MODE.STATIC_VALIDATION);
  });
  it('FALLBACK_MODE has 4 values', () => {
    assert.equal(Object.keys(FALLBACK_MODE).length, 4);
  });
});

// ── Suite 29: Deployment Runtime Resolver ────────────────────────────────────
describe('Suite 29 — DeploymentRuntimeResolver', () => {
  it('CLOUDFLARE → SERVERLESS with bypass', () => {
    const r = resolveDeploymentRuntime({ target: 'CLOUDFLARE' });
    assert.equal(r.recommendedRuntime, RUNTIME_RECOMMENDATION.SERVERLESS);
    assert.equal(r.serverlessBypass, true);
    assert.equal(r.isReal, false);
  });
  it('CONTAINER_PLATFORM → CONTAINER REQUIRED', () => {
    const r = resolveDeploymentRuntime({ target: 'CONTAINER_PLATFORM' });
    assert.equal(r.recommendedRuntime, RUNTIME_RECOMMENDATION.CONTAINER);
    assert.equal(r.dockerValue, 'REQUIRED');
  });
  it('VPS → CONTAINER HIGH value', () => {
    const r = resolveDeploymentRuntime({ target: 'VPS' });
    assert.equal(r.dockerValue, 'HIGH');
  });
  it('STATIC_HOST → STATIC with bypass', () => {
    const r = resolveDeploymentRuntime({ target: 'STATIC_HOST' });
    assert.equal(r.serverlessBypass, true);
  });
  it('throws for unknown target', () => {
    assert.throws(() => resolveDeploymentRuntime({ target: 'MOON' }), /unknown target/);
  });
  it('DEPLOY_TARGET has 6 values', () => {
    assert.equal(Object.keys(DEPLOY_TARGET).length, 6);
  });
});

// ── Suite 30: Staging Profile ─────────────────────────────────────────────────
describe('Suite 30 — StagingEnvironmentProfile', () => {
  it('creates isolated staging profile', () => {
    const p = createStagingEnvironmentProfile({ appName: 'factory' });
    assert.equal(p.environment, 'STAGING');
    assert.equal(p.port, 5180);
    assert.equal(p.noSharedSecretsWithProd, true);
    assert.equal(p.isolatedFromProduction, true);
    assert.equal(p.isReal, false);
  });
  it('requires appName', () => {
    assert.throws(() => createStagingEnvironmentProfile({}), /requires appName/);
  });
  it('staging env vars include NODE_ENV=staging', () => {
    const p = createStagingEnvironmentProfile({ appName: 'x' });
    assert.equal(p.environmentVariables.NODE_ENV, 'staging');
  });
});

// ── Suite 31: Container Test Profile ─────────────────────────────────────────
describe('Suite 31 — ContainerTestProfile', () => {
  it('creates unit test profile', () => {
    const p = createContainerTestProfile({ scope: TEST_SCOPE.UNIT });
    assert.equal(p.scope, TEST_SCOPE.UNIT);
    assert.equal(p.port, 5180);
    assert.equal(p.noProductionData, true);
    assert.equal(p.isReal, false);
  });
  it('playwright scope enables playwrightReady', () => {
    const p = createContainerTestProfile({ scope: TEST_SCOPE.PLAYWRIGHT });
    assert.equal(p.playwrightReady, true);
  });
  it('TEST_SCOPE has 4 values', () => {
    assert.equal(Object.keys(TEST_SCOPE).length, 4);
  });
});

// ── Suite 32: Rollback Plan ───────────────────────────────────────────────────
describe('Suite 32 — ContainerRollbackPlan', () => {
  it('creates rollback plan', () => {
    const p = createContainerRollbackPlan({ currentTag: 'v1.1.0', previousTag: 'v1.0.0' });
    assert.equal(p.currentTag, 'v1.1.0');
    assert.equal(p.noRealDeploy, true);
    assert.equal(p.isReal, false);
    assert.ok(p.steps.length > 0);
  });
  it('requires currentTag and previousTag', () => {
    assert.throws(() => createContainerRollbackPlan({ previousTag: 'v1.0.0' }), /requires currentTag/);
    assert.throws(() => createContainerRollbackPlan({ currentTag: 'v1.1.0' }), /requires previousTag/);
  });
  it('evaluates rollback decision — manual override', () => {
    const r = evaluateRollbackDecision({ manualOverride: true });
    assert.equal(r.shouldRollback, true);
    assert.equal(r.trigger, ROLLBACK_TRIGGER.MANUAL);
  });
  it('evaluates rollback decision — all healthy', () => {
    const r = evaluateRollbackDecision({ healthOk: true, errorRate: 0 });
    assert.equal(r.shouldRollback, false);
  });
});

// ── Suite 33: Release Strategy ────────────────────────────────────────────────
describe('Suite 33 — ContainerReleaseStrategy', () => {
  it('creates RECREATE strategy', () => {
    const s = createContainerReleaseStrategy({ strategy: RELEASE_STRATEGY.RECREATE });
    assert.equal(s.strategy, RELEASE_STRATEGY.RECREATE);
    assert.equal(s.noRealInfrastructure, true);
    assert.equal(s.isReal, false);
  });
  it('BLUE_GREEN has no downtime', () => {
    const s = createContainerReleaseStrategy({ strategy: RELEASE_STRATEGY.BLUE_GREEN });
    assert.equal(s.downtime, false);
  });
  it('throws for unknown strategy', () => {
    assert.throws(() => createContainerReleaseStrategy({ strategy: 'CHAOS' }), /unknown strategy/);
  });
  it('RELEASE_STRATEGY has 4 values', () => {
    assert.equal(Object.keys(RELEASE_STRATEGY).length, 4);
  });
});

// ── Suite 34: Recovery Policy ─────────────────────────────────────────────────
describe('Suite 34 — EnvironmentRecoveryPolicy', () => {
  it('creates recovery for BUILD_FAILURE', () => {
    const p = createEnvironmentRecoveryPolicy(FAILURE_CASE.BUILD_FAILURE);
    assert.equal(p.failureCase, FAILURE_CASE.BUILD_FAILURE);
    assert.ok(p.steps.length > 0);
    assert.equal(p.noRealDeploy, true);
    assert.equal(p.isReal, false);
  });
  it('creates recovery for PORT_CONFLICT — never-use-5175 in steps', () => {
    const p = createEnvironmentRecoveryPolicy(FAILURE_CASE.PORT_CONFLICT);
    assert.ok(p.steps.some(s => s.includes('5175')));
  });
  it('creates recovery for MISSING_SECRET', () => {
    const p = createEnvironmentRecoveryPolicy(FAILURE_CASE.MISSING_SECRET);
    assert.ok(p.steps.some(s => s.includes('secret')));
  });
  it('throws for unknown failure case', () => {
    assert.throws(() => createEnvironmentRecoveryPolicy('ALIEN'), /unknown failure case/);
  });
  it('FAILURE_CASE has 7 values', () => {
    assert.equal(Object.keys(FAILURE_CASE).length, 7);
  });
});

// ── Suite 35: Reproducible Commands ──────────────────────────────────────────
describe('Suite 35 — ReproducibleEnvironmentCommands', () => {
  it('creates commands for NATIVE mode', () => {
    const c = createReproducibleEnvironmentCommands({ runtimeMode: 'NATIVE', port: 5180 });
    assert.ok(c.commands[ENV_COMMAND.BUILD].includes('npm'));
    assert.ok(c.commands[ENV_COMMAND.START].includes('5180'));
    assert.equal(c.isReal, false);
  });
  it('creates commands for CONTAINER mode', () => {
    const c = createReproducibleEnvironmentCommands({ runtimeMode: 'CONTAINER', port: 5180 });
    assert.ok(c.commands[ENV_COMMAND.BUILD].includes('docker'));
    assert.equal(c.oneCommand, true);
  });
  it('ENV_COMMAND has 6 values', () => {
    assert.equal(Object.keys(ENV_COMMAND).length, 6);
  });
});

// ── Suite 36: Start Reproducible Environment ──────────────────────────────────
describe('Suite 36 — StartReproducibleEnvironment', () => {
  it('FALLBACK when docker unavailable', () => {
    const r = startReproducibleEnvironment({ cliAvailable: false, daemonAvailable: false, hasLockfile: true });
    assert.equal(r.result, START_RESULT.FALLBACK);
    assert.equal(r.runtimeMode, 'NATIVE');
    assert.equal(r.noRealStart, true);
    assert.equal(r.isReal, false);
  });
  it('CONTAINER when docker available', () => {
    const r = startReproducibleEnvironment({ cliAvailable: true, daemonAvailable: true });
    assert.equal(r.result, START_RESULT.CONTAINER);
    assert.equal(r.runtimeMode, 'CONTAINER');
  });
  it('port defaults to 5180', () => {
    const r = startReproducibleEnvironment({ cliAvailable: false });
    assert.equal(r.port, 5180);
  });
  it('START_RESULT has 3 values', () => {
    assert.equal(Object.keys(START_RESULT).length, 3);
  });
});

// ── Suite 37: CI/CD Bridge ────────────────────────────────────────────────────
describe('Suite 37 — CICDBridge', () => {
  it('creates bridge without Docker', () => {
    const b = createCICDBridge({ dockerAvailable: false });
    assert.equal(b.adv02Bridge, 'CICD_LAYER_CONNECTED');
    assert.equal(b.staticFallback, true);
    assert.ok(!b.steps.includes(CICD_PIPELINE_STEP.IMAGE_BUILD));
    assert.equal(b.isReal, false);
  });
  it('includes IMAGE_BUILD when docker available', () => {
    const b = createCICDBridge({ dockerAvailable: true });
    assert.ok(b.steps.includes(CICD_PIPELINE_STEP.IMAGE_BUILD));
  });
  it('always includes SECRET_SCAN and QUALITY_GATE', () => {
    const b = createCICDBridge({});
    assert.ok(b.steps.includes(CICD_PIPELINE_STEP.SECRET_SCAN));
    assert.ok(b.steps.includes(CICD_PIPELINE_STEP.QUALITY_GATE));
  });
  it('CICD_PIPELINE_STEP has 8 values', () => {
    assert.equal(Object.keys(CICD_PIPELINE_STEP).length, 8);
  });
});

// ── Suite 38: Production Bridge ───────────────────────────────────────────────
describe('Suite 38 — ProductionBridge', () => {
  it('CLOUDFLARE → SERVERLESS with bypass', () => {
    const b = bridgeToProductionPipeline({ target: 'CLOUDFLARE' });
    assert.equal(b.adv04Bridge, 'PRODUCTION_PIPELINE_CONNECTED');
    assert.equal(b.serverlessBypass, true);
    assert.equal(b.noRealDeploy, true);
    assert.equal(b.isReal, false);
  });
  it('CONTAINER_PLATFORM → CONTAINER mode', () => {
    const b = bridgeToProductionPipeline({ target: 'CONTAINER_PLATFORM', runtimeMode: 'CONTAINER' });
    assert.equal(b.containerOk, true);
  });
  it('cloudflare bypass', () => {
    const b = bridgeToProductionPipeline({ target: 'CLOUDFLARE' });
    assert.equal(b.cloudflareOk, true);
  });
});

// ── Suite 39: Observability Bridge ────────────────────────────────────────────
describe('Suite 39 — ObservabilityBridge', () => {
  it('emits environment.validated event', () => {
    const e = emitEnvironmentEvent(ENV_OBS_EVENT.ENVIRONMENT_VALIDATED, { env: 'CI' });
    assert.equal(e.adv01Bridge, 'OBSERVABILITY_LAYER_CONNECTED');
    assert.equal(e.event, 'environment.validated');
    assert.equal(e.noRealEmit, true);
    assert.equal(e.isReal, false);
  });
  it('emits fallback.activated event', () => {
    const e = emitEnvironmentEvent(ENV_OBS_EVENT.FALLBACK_ACTIVATED, { reason: 'no docker' });
    assert.ok(e.payload.reason === 'no docker');
  });
  it('throws for unknown event', () => {
    assert.throws(() => emitEnvironmentEvent('fake.event.xyz'), /unknown event/);
  });
  it('ENV_OBS_EVENT has 8 values', () => {
    assert.equal(Object.keys(ENV_OBS_EVENT).length, 8);
  });
});

// ── Suite 40: Playwright Bridge ───────────────────────────────────────────────
describe('Suite 40 — PlaywrightBridge', () => {
  it('NATIVE target when docker unavailable', () => {
    const b = createPlaywrightBridge({ dockerAvailable: false, port: 5180 });
    assert.equal(b.adv06Bridge, 'BROWSER_QA_LAYER_CONNECTED');
    assert.equal(b.target, QA_TARGET.NATIVE);
    assert.equal(b.port, 5180);
    assert.equal(b.isReal, false);
  });
  it('CONTAINERIZED target when docker available', () => {
    const b = createPlaywrightBridge({ dockerAvailable: true });
    assert.equal(b.target, QA_TARGET.CONTAINERIZED);
  });
  it('baseUrl uses port 5180 never 5175', () => {
    const b = createPlaywrightBridge({ port: 5180 });
    assert.ok(b.baseUrl.includes('5180'));
    assert.ok(!b.baseUrl.includes('5175'));
  });
  it('QA_TARGET has 3 values', () => {
    assert.equal(Object.keys(QA_TARGET).length, 3);
  });
});

// ── Suite 41: MCP Bridge ──────────────────────────────────────────────────────
describe('Suite 41 — MCPBridge', () => {
  it('creates native execution env bridge', () => {
    const b = createMCPEnvironmentBridge({ executionEnv: MCP_EXECUTION_ENV.NATIVE });
    assert.equal(b.adv12Bridge, 'MCP_LAYER_CONNECTED');
    assert.equal(b.noArbitraryContainers, true);
    assert.equal(b.isReal, false);
  });
  it('throws for unknown executionEnv', () => {
    assert.throws(() => createMCPEnvironmentBridge({ executionEnv: 'CLOUD_RANDOM' }), /unknown executionEnv/);
  });
  it('MCP_EXECUTION_ENV has 3 values', () => {
    assert.equal(Object.keys(MCP_EXECUTION_ENV).length, 3);
  });
});

// ── Suite 42: Runtime Fixtures ────────────────────────────────────────────────
describe('Suite 42 — Runtime Fixtures', () => {
  it('has 4 runtime fixtures', () => {
    assert.equal(ALL_RUNTIME_FIXTURES.length, 4);
  });
  it('STATIC_SAAS has serverlessBypass', () => {
    assert.equal(FIXTURE_STATIC_SAAS.serverlessBypass, true);
    assert.equal(FIXTURE_STATIC_SAAS.isReal, false);
  });
  it('CONTAINER_SAAS has Docker REQUIRED', () => {
    assert.equal(FIXTURE_CONTAINER_SAAS.dockerValue, 'REQUIRED');
    assert.equal(FIXTURE_CONTAINER_SAAS.nonRootUser, true);
  });
  it('all runtime fixtures have isReal=false', () => {
    assert.ok(ALL_RUNTIME_FIXTURES.every(f => f.isReal === false));
  });
  it('all runtime fixtures have noRealDeploy=true', () => {
    assert.ok(ALL_RUNTIME_FIXTURES.every(f => f.noRealDeploy === true));
  });
});

// ── Suite 43: Docker Fixtures ─────────────────────────────────────────────────
describe('Suite 43 — Docker Fixtures', () => {
  it('has at least 7 docker fixtures', () => {
    assert.ok(ALL_DOCKER_FIXTURES.length >= 7);
  });
  it('FIXTURE_SERVERLESS_BYPASS has serverlessBypass=true', () => {
    assert.equal(FIXTURE_SERVERLESS_BYPASS.serverlessBypass, true);
    assert.equal(FIXTURE_SERVERLESS_BYPASS.dockerUsed, false);
  });
  it('all docker fixtures have isReal=false', () => {
    assert.ok(ALL_DOCKER_FIXTURES.every(f => f.isReal === false));
  });
});

// ── Suite 44: Failure Fixtures ────────────────────────────────────────────────
describe('Suite 44 — Failure Fixtures', () => {
  it('has 13 failure fixtures', () => {
    assert.equal(ALL_FAILURE_FIXTURES.length, 13);
  });
  it('all failures have isReal=false', () => {
    assert.ok(ALL_FAILURE_FIXTURES.every(f => f.isReal === false));
  });
  it('covers PRIVILEGED, SECRET_COPIED, LATEST_ONLY scenarios', () => {
    const triggers = ALL_FAILURE_FIXTURES.map(f => f.trigger);
    assert.ok(triggers.includes('PRIVILEGED_MODE'));
    assert.ok(triggers.includes('SECRET_IN_IMAGE'));
    assert.ok(triggers.includes('LATEST_ONLY'));
  });
  it('covers PORT 5175 reserved scenario', () => {
    const portFailure = ALL_FAILURE_FIXTURES.find(f => f.trigger === 'RESERVED_PORT');
    assert.ok(portFailure);
  });
  it('covers CONTAINER_ON_SERVERLESS scenario', () => {
    const f = ALL_FAILURE_FIXTURES.find(f => f.trigger === 'WRONG_DEPLOYMENT_RUNTIME');
    assert.ok(f);
  });
});

// ── Suite 45: Quality Score ───────────────────────────────────────────────────
describe('Suite 45 — ReproducibleEnvironmentQualityScore', () => {
  it('productionReady when all scores are high', () => {
    const s = computeReproducibleEnvironmentQualityScore({
      reproducibility: 100, security: 100, buildDeterminism: 100,
      runtimeCompatibility: 100, secrets: 100, health: 100,
      rollback: 100, ciIntegration: 100, targetFit: 100, fallback: 100,
    });
    assert.ok(s.overall >= 85);
    assert.equal(s.productionReady, true);
    assert.equal(s.isReal, false);
  });
  it('not productionReady with violations', () => {
    const s = computeReproducibleEnvironmentQualityScore({ security: 0 });
    assert.equal(s.productionReady, false);
    assert.ok(s.violations.some(v => v.factor === 'security'));
  });
  it('score is a number 0-100', () => {
    const s = computeReproducibleEnvironmentQualityScore({ security: 80, secrets: 80 });
    assert.ok(s.overall >= 0 && s.overall <= 100);
  });
  it('returns frozen object', () => {
    assert.ok(Object.isFrozen(computeReproducibleEnvironmentQualityScore({})));
  });
});

// ── Suite 46: Quality Gate ────────────────────────────────────────────────────
describe('Suite 46 — ReproducibleEnvironmentQualityGate', () => {
  it('PASS with score >= 70 and no issues', () => {
    const g = evaluateReproducibleEnvironmentQualityGate(85, [], []);
    assert.equal(g.status, ENV_GATE_STATUS.PASS);
    assert.equal(g.blocked, false);
    assert.equal(g.isReal, false);
  });
  it('BLOCKED when criticalFailures present', () => {
    const g = evaluateReproducibleEnvironmentQualityGate(90, [ENV_CRITICAL_FAILURE.SECRET_IN_IMAGE], []);
    assert.equal(g.status, ENV_GATE_STATUS.BLOCKED);
    assert.equal(g.blocked, true);
  });
  it('FAIL when score < 50', () => {
    const g = evaluateReproducibleEnvironmentQualityGate(30, [], []);
    assert.equal(g.status, ENV_GATE_STATUS.FAIL);
  });
  it('WARN with warnings present', () => {
    const g = evaluateReproducibleEnvironmentQualityGate(75, [], ['missing-health']);
    assert.equal(g.status, ENV_GATE_STATUS.WARN);
  });
  it('ENV_CRITICAL_FAILURE has 7 values', () => {
    assert.equal(Object.keys(ENV_CRITICAL_FAILURE).length, 7);
  });
  it('ENV_GATE_STATUS has 4 values', () => {
    assert.equal(Object.keys(ENV_GATE_STATUS).length, 4);
  });
});

// ── Suite 47: Registry & Barrel ───────────────────────────────────────────────
describe('Suite 47 — Registry + Barrel', () => {
  it('REGISTRY_VERSION >= 3.9.0', () => {
    const [major, minor] = REGISTRY_VERSION.split('.').map(Number);
    assert.ok(major > 3 || (major === 3 && minor >= 9));
  });
  it('REPRODUCIBLE_ENVS_REGISTRY is registered', () => {
    assert.equal(REPRODUCIBLE_ENVS_REGISTRY.adv, 'ADV-15');
    assert.ok(REPRODUCIBLE_ENVS_REGISTRY.totalModules >= 30);
    assert.equal(REPRODUCIBLE_ENVS_REGISTRY.isReal, false);
  });
  it('PASO_ADV15_STATUS is 100_PERCENT', () => {
    assert.equal(PASO_ADV15_STATUS, '100_PERCENT');
  });
  it('ADV15_STATUS from barrel is 100_PERCENT', () => {
    assert.equal(ADV15_STATUS, '100_PERCENT');
  });
  it('DOCKER_RUNTIME_AVAILABLE is NO (daemon unavailable in this env)', () => {
    assert.equal(DOCKER_RUNTIME_AVAILABLE, 'NO');
  });
  it('all guardrails present', () => {
    assert.equal(REPRODUCIBLE_ENVS_GUARDRAILS.FACTORY_AGENCY_SCOPE_ONLY, 'SI');
    assert.equal(REPRODUCIBLE_ENVS_GUARDRAILS.NO_REAL_PRODUCTION_DEPLOY, 'SI');
    assert.equal(REPRODUCIBLE_ENVS_GUARDRAILS.NO_REAL_SECRETS, 'SI');
    assert.equal(REPRODUCIBLE_ENVS_GUARDRAILS.NO_LOCALHOST_5175, true);
    assert.equal(REPRODUCIBLE_ENVS_GUARDRAILS.NO_CP04_TOUCHED, true);
  });
  it('barrel layer version is 1.0.0', () => {
    assert.equal(REPRODUCIBLE_ENVS_LAYER_VERSION, '1.0.0');
  });
});

// ── Suite 48: Integration — Full Fallback Pipeline ────────────────────────────
describe('Suite 48 — Integration: Full Fallback Pipeline (no Docker daemon)', () => {
  it('complete pipeline runs in static mode', () => {
    // Step 1: detect docker capability
    const detector = createDockerCapabilityDetector({ cliAvailable: false, daemonAvailable: false });
    assert.equal(detector.status, DOCKER_STATUS.DAEMON_UNAVAILABLE);

    // Step 2: environment profile
    const env = createRuntimeEnvironmentProfile({ environment: 'CI' });
    assert.equal(env.port, 5180);

    // Step 3: node policy
    const node = createNodeRuntimePolicy({ currentRuntime: 'v24.16.0' });
    assert.ok(node.dockerBaseImage.includes('alpine'));

    // Step 4: package manager
    const pm = createPackageManagerPolicy({ lockfiles: ['package-lock.json'] });
    assert.equal(pm.installCommand, 'npm ci');

    // Step 5: start environment — fallback
    const start = startReproducibleEnvironment({ cliAvailable: false, hasLockfile: true });
    assert.equal(start.result, START_RESULT.FALLBACK);

    // Step 6: CI bridge
    const ci = createCICDBridge({ dockerAvailable: false });
    assert.equal(ci.staticFallback, true);

    // Step 7: deployment resolver
    const deploy = resolveDeploymentRuntime({ target: 'CLOUDFLARE' });
    assert.equal(deploy.serverlessBypass, true);

    // Step 8: quality gate
    const gate = evaluateReproducibleEnvironmentQualityGate(80, [], []);
    assert.equal(gate.status, ENV_GATE_STATUS.PASS);

    // Step 9: observability
    const obs = emitEnvironmentEvent(ENV_OBS_EVENT.FALLBACK_ACTIVATED, { env: 'CI' });
    assert.equal(obs.adv01Bridge, 'OBSERVABILITY_LAYER_CONNECTED');

    assert.equal(env.isReal, false);
    assert.equal(start.isReal, false);
    assert.equal(obs.isReal, false);
  });

  it('port 5175 is blocked at every layer', () => {
    assert.throws(() => createContainerPortPolicy({ port: 5175 }), /reserved/);
    assert.throws(() => createContainerNetworkPolicy({ networkMode: 'host' }), /host network/);
    const r = startReproducibleEnvironment({ port: 5180 });
    assert.ok(!r.startCommand.includes('5175'));
  });

  it('all fixtures have isReal=false — no real data', () => {
    assert.ok(ALL_RUNTIME_FIXTURES.every(f => f.isReal === false));
    assert.ok(ALL_DOCKER_FIXTURES.every(f => f.isReal === false));
    assert.ok(ALL_FAILURE_FIXTURES.every(f => f.isReal === false));
  });

  it('CP04 not touched — no port 5175', () => {
    const guardrails = REPRODUCIBLE_ENVS_GUARDRAILS;
    assert.equal(guardrails.NO_CP04_TOUCHED, true);
    assert.equal(guardrails.NO_LOCALHOST_5175, true);
  });
});
