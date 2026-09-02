// Reproducible Environments Registry — ADV-15

export const REPRODUCIBLE_ENVS_REGISTRY = Object.freeze({
  version:    '1.0.0',
  adv:        'ADV-15',
  totalModules: 33,
  guardrails: Object.freeze({
    FACTORY_AGENCY_SCOPE_ONLY:  'SI',
    NO_REAL_PRODUCTION_DEPLOY:  'SI',
    NO_REAL_EXTERNAL_COST:      'SI',
    NO_REAL_SECRETS:            'SI',
    DOCKER_RUNTIME:             'DAEMON_UNAVAILABLE',
    VALIDATION_MODE:            'STATIC_VALIDATION',
  }),
  modules: Object.freeze([
    'RuntimeEnvironmentProfile', 'NodeRuntimePolicy', 'PackageManagerPolicy', 'DependencyInstallPolicy',
    'Dockerfile', 'Dockerignore', 'ContainerSecurityPolicy', 'ContainerConfigPolicy',
    'ContainerHealthPolicy', 'ReadinessPolicy', 'LivenessPolicy', 'GracefulShutdownPolicy',
    'ContainerPortPolicy', 'ContainerVolumePolicy', 'ContainerNetworkPolicy', 'BuildContextPolicy',
    'ContainerImageMetadata', 'ContainerTagPolicy', 'ContainerReproducibilityEvaluator',
    'ContainerArtifactValidator', 'ContainerExecutionPolicy', 'ContainerResourcePolicy',
    'ContainerLoggingPolicy', 'ContainerBuildCachePolicy', 'ContainerSupplyChainPolicy',
    'BaseImagePolicy', 'ContainerVulnerabilityScanPlan', 'DockerCapabilityDetector',
    'EnvironmentFallbackPolicy', 'DeploymentRuntimeResolver', 'StagingEnvironmentProfile',
    'ContainerTestProfile', 'ContainerRollbackPlan', 'ContainerReleaseStrategy',
    'EnvironmentRecoveryPolicy', 'ReproducibleEnvironmentCommands', 'StartReproducibleEnvironment',
  ]),
  bridges: Object.freeze(['ADV-01 Observabilidad', 'ADV-02 CI/CD', 'ADV-04 Production Pipeline', 'ADV-06 Browser QA', 'ADV-12 MCP']),
  isReal:  false,
});
