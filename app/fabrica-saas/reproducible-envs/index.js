// Reproducible Environments — ADV-15 barrel
// FACTORY_AGENCY_SCOPE_ONLY=SI | NO_REAL_PRODUCTION_DEPLOY=SI | NO_REAL_SECRETS=SI

// ── Core ──────────────────────────────────────────────────────────────────────
export { ENVIRONMENT, RUNTIME_MODE, createRuntimeEnvironmentProfile, RUNTIME_ENVIRONMENT_PROFILE_VERSION }
  from './core/runtimeEnvironmentProfile.js';
export { NODE_VERSION_STATUS, resolveNodeVersion, createNodeRuntimePolicy, NODE_RUNTIME_POLICY_VERSION }
  from './core/nodeRuntimePolicy.js';
export { PACKAGE_MANAGER, PM_DETECTION_SOURCE, detectPackageManager, createPackageManagerPolicy, PACKAGE_MANAGER_POLICY_VERSION }
  from './core/packageManagerPolicy.js';
export { DEPENDENCY_DRIFT_STATUS, INSTALL_STRATEGY, evaluateDependencyState, createDependencyInstallPolicy, DEPENDENCY_INSTALL_POLICY_VERSION }
  from './core/dependencyInstallPolicy.js';

// ── Docker ────────────────────────────────────────────────────────────────────
export { DOCKERFILE_STAGE, generateDockerfileContent, DOCKERFILE_FOUNDATION_VERSION }
  from './docker/dockerfile.js';
export { generateDockerignoreContent, validateDockerignoreRules, DOCKERIGNORE_POLICY_VERSION }
  from './docker/dockerignore.js';
export { SECURITY_VIOLATION, createContainerSecurityPolicy, evaluateContainerSecurity, CONTAINER_SECURITY_POLICY_VERSION }
  from './docker/containerSecurityPolicy.js';
export { CONFIG_CLASS, classifyEnvVar, createContainerConfigPolicy, validateNoSecretsHardcoded, CONTAINER_CONFIG_POLICY_VERSION }
  from './docker/containerConfigPolicy.js';
export { HEALTH_STATE, createContainerHealthPolicy, evaluateHealthState, CONTAINER_HEALTH_POLICY_VERSION }
  from './docker/containerHealthPolicy.js';
export { READINESS_STATUS, createReadinessPolicy, evaluateReadiness, READINESS_POLICY_VERSION }
  from './docker/readinessPolicy.js';
export { LIVENESS_STATUS, createLivenessPolicy, evaluateLiveness, LIVENESS_POLICY_VERSION }
  from './docker/livenessPolicy.js';
export { SHUTDOWN_SIGNAL, SHUTDOWN_STATUS, createGracefulShutdownPolicy, evaluateShutdown, GRACEFUL_SHUTDOWN_POLICY_VERSION }
  from './docker/gracefulShutdownPolicy.js';
export { RESERVED_PORTS, DEFAULT_CONTAINER_PORT, createContainerPortPolicy, validatePort, CONTAINER_PORT_POLICY_VERSION }
  from './docker/containerPortPolicy.js';
export { VOLUME_TYPE, VOLUME_SAFETY, createContainerVolumePolicy, CONTAINER_VOLUME_POLICY_VERSION }
  from './docker/containerVolumePolicy.js';
export { NETWORK_MODE, createContainerNetworkPolicy, evaluateNetworkSafety, CONTAINER_NETWORK_POLICY_VERSION }
  from './docker/containerNetworkPolicy.js';
export { BUILD_CONTEXT_STATUS, evaluateBuildContext, createBuildContextPolicy, BUILD_CONTEXT_POLICY_VERSION }
  from './docker/buildContextPolicy.js';
export { createContainerImageMetadata, CONTAINER_IMAGE_METADATA_VERSION }
  from './docker/containerImageMetadata.js';
export { TAG_STRATEGY, TAG_WARNING, createContainerTagPolicy, generateImageTag, CONTAINER_TAG_POLICY_VERSION }
  from './docker/containerTagPolicy.js';
export { REPRODUCIBILITY_STATUS, evaluateContainerReproducibility, CONTAINER_REPRODUCIBILITY_EVALUATOR_VERSION }
  from './docker/containerReproducibilityEvaluator.js';
export { ARTIFACT_STATUS, validateContainerArtifact, CONTAINER_ARTIFACT_VALIDATOR_VERSION }
  from './docker/containerArtifactValidator.js';
export { EXECUTION_BLOCK_REASON, createContainerExecutionPolicy, evaluateContainerExecution, CONTAINER_EXECUTION_POLICY_VERSION }
  from './docker/containerExecutionPolicy.js';
export { RESOURCE_PROFILE, createContainerResourcePolicy, CONTAINER_RESOURCE_POLICY_VERSION }
  from './docker/containerResourcePolicy.js';
export { LOG_DRIVER, createContainerLoggingPolicy, validateLogOutput, CONTAINER_LOGGING_POLICY_VERSION }
  from './docker/containerLoggingPolicy.js';
export { CACHE_SCOPE, createContainerBuildCachePolicy, validateCacheSafety, CONTAINER_BUILD_CACHE_POLICY_VERSION }
  from './docker/containerBuildCachePolicy.js';
export { createContainerSupplyChainPolicy, evaluateBaseImageSafety, CONTAINER_SUPPLY_CHAIN_POLICY_VERSION }
  from './docker/containerSupplyChainPolicy.js';
export { BASE_IMAGE_STATUS, evaluateBaseImage, createBaseImagePolicy, BASE_IMAGE_POLICY_VERSION }
  from './docker/baseImagePolicy.js';
export { SCAN_PROVIDER, SCAN_STATUS, createContainerVulnerabilityScanPlan, CONTAINER_VULNERABILITY_SCAN_PLAN_VERSION }
  from './docker/containerVulnerabilityScanPlan.js';

// ── Deploy ────────────────────────────────────────────────────────────────────
export { DOCKER_STATUS, VALIDATION_MODE, createDockerCapabilityDetector, DOCKER_CAPABILITY_DETECTOR_VERSION }
  from './deploy/dockerCapabilityDetector.js';
export { FALLBACK_MODE, createEnvironmentFallbackPolicy, ENVIRONMENT_FALLBACK_POLICY_VERSION }
  from './deploy/environmentFallbackPolicy.js';
export { DEPLOY_TARGET, RUNTIME_RECOMMENDATION, resolveDeploymentRuntime, DEPLOYMENT_RUNTIME_RESOLVER_VERSION }
  from './deploy/deploymentRuntimeResolver.js';
export { createStagingEnvironmentProfile, STAGING_ENVIRONMENT_PROFILE_VERSION }
  from './deploy/stagingEnvironmentProfile.js';
export { TEST_SCOPE, createContainerTestProfile, CONTAINER_TEST_PROFILE_VERSION }
  from './deploy/containerTestProfile.js';
export { ROLLBACK_TRIGGER, ROLLBACK_STATUS, createContainerRollbackPlan, evaluateRollbackDecision, CONTAINER_ROLLBACK_PLAN_VERSION }
  from './deploy/containerRollbackPlan.js';
export { RELEASE_STRATEGY, createContainerReleaseStrategy, CONTAINER_RELEASE_STRATEGY_VERSION }
  from './deploy/containerReleaseStrategy.js';
export { FAILURE_CASE, createEnvironmentRecoveryPolicy, ENVIRONMENT_RECOVERY_POLICY_VERSION }
  from './deploy/environmentRecoveryPolicy.js';

// ── Commands ──────────────────────────────────────────────────────────────────
export { ENV_COMMAND, createReproducibleEnvironmentCommands, REPRODUCIBLE_ENVIRONMENT_COMMANDS_VERSION }
  from './commands/reproducibleEnvironmentCommands.js';
export { START_RESULT, startReproducibleEnvironment, START_REPRODUCIBLE_ENVIRONMENT_VERSION }
  from './commands/startReproducibleEnvironment.js';

// ── Bridges ───────────────────────────────────────────────────────────────────
export { CICD_PIPELINE_STEP, createCICDBridge, CICD_BRIDGE_VERSION }
  from './bridges/cicdBridge.js';
export { RUNTIME_MODE_OPTION, bridgeToProductionPipeline, PRODUCTION_BRIDGE_VERSION }
  from './bridges/productionBridge.js';
export { ENV_OBS_EVENT, emitEnvironmentEvent, OBSERVABILITY_BRIDGE_VERSION }
  from './bridges/observabilityBridge.js';
export { QA_TARGET, createPlaywrightBridge, PLAYWRIGHT_BRIDGE_VERSION }
  from './bridges/playwrightBridge.js';
export { MCP_EXECUTION_ENV, createMCPEnvironmentBridge, MCP_BRIDGE_VERSION }
  from './bridges/mcpBridge.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────
export {
  FIXTURE_STATIC_SAAS, FIXTURE_NODE_SAAS, FIXTURE_SERVERLESS_SAAS, FIXTURE_CONTAINER_SAAS,
  ALL_RUNTIME_FIXTURES,
} from './fixtures/runtimeFixtures.js';
export {
  FIXTURE_VALID_DOCKERFILE, FIXTURE_VALID_DOCKERIGNORE, FIXTURE_VALID_SECURITY,
  FIXTURE_VALID_TAGS, FIXTURE_VALID_NO_SECRETS, FIXTURE_VALID_HEALTH,
  FIXTURE_SERVERLESS_BYPASS, FIXTURE_SAFE_BUILD_CONTEXT, ALL_DOCKER_FIXTURES,
} from './fixtures/dockerFixtures.js';
export {
  FAILURE_SECRET_COPIED, FAILURE_LATEST_ONLY, FAILURE_PRIVILEGED, FAILURE_DOCKER_SOCKET,
  FAILURE_HOST_ROOT_MOUNT, FAILURE_WRONG_PORT, FAILURE_MISSING_LOCKFILE, FAILURE_WRONG_NODE_RUNTIME,
  FAILURE_MISSING_HEALTH, FAILURE_BUILD_CONTEXT_LEAK, FAILURE_STALE_DEPS,
  FAILURE_CONTAINER_ON_SERVERLESS, FAILURE_HOST_NETWORK, ALL_FAILURE_FIXTURES,
} from './fixtures/failureFixtures.js';

// ── Quality ───────────────────────────────────────────────────────────────────
export { computeReproducibleEnvironmentQualityScore, REPRODUCIBLE_ENV_QUALITY_SCORE_VERSION }
  from './quality/reproducibleEnvironmentQualityScore.js';
export { ENV_GATE_STATUS, ENV_CRITICAL_FAILURE, evaluateReproducibleEnvironmentQualityGate, REPRODUCIBLE_ENV_QUALITY_GATE_VERSION }
  from './quality/reproducibleEnvironmentQualityGate.js';

// ── Meta ──────────────────────────────────────────────────────────────────────
export const REPRODUCIBLE_ENVS_LAYER_VERSION = '1.0.0';
export const ADV15_STATUS = '100_PERCENT';

export const DOCKER_RUNTIME_AVAILABLE = 'NO';

export const REPRODUCIBLE_ENVS_GUARDRAILS = Object.freeze({
  FACTORY_AGENCY_SCOPE_ONLY:    'SI',
  NO_REAL_PRODUCTION_DEPLOY:    'SI',
  NO_REAL_EXTERNAL_COST:        'SI',
  NO_REAL_SECRETS:              'SI',
  DOCKER_RUNTIME:               'DAEMON_UNAVAILABLE',
  VALIDATION_MODE:              'STATIC_VALIDATION',
  NO_CP04_TOUCHED:              true,
  NO_BOT_TRADING_TOUCHED:       true,
  NO_LOCALHOST_5175:            true,
});
