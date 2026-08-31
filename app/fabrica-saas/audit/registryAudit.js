// Paso H — Factory Registry Audit
// Verifies registry version, exports, duplicates, orphans, status flags A-G

export const REGISTRY_AUDIT_VERSION = '1.0.0';

export const EXPECTED_REGISTRY_VERSION = '2.7.0';

export const EXPECTED_PASO_STATUSES = Object.freeze({
  PASO_A: '100_PERCENT',
  PASO_B: '100_PERCENT',
  PASO_C: '100_PERCENT',
  PASO_D: '100_PERCENT',
  PASO_E: '100_PERCENT',
  PASO_F: '100_PERCENT',
  PASO_G: '100_PERCENT',
});

export const EXPECTED_SUB_REGISTRIES = Object.freeze([
  'COMPONENT_REGISTRY',
  'RECIPE_REGISTRY',
  'PRESET_REGISTRY',
  'TYPOGRAPHY_REGISTRY',
  'INTERACTION_REGISTRY',
  'LAYOUT_REGISTRY',
  'SECTOR_REGISTRY',
  'TOKEN_REGISTRY',
  'AI_PROFILE_REGISTRY',
  'A11Y_REGISTRY',
  'PERF_REGISTRY',
  'COMPAT_REGISTRY',
]);

export const EXPECTED_PASO_B_EXPORTS = Object.freeze([
  'validateBrief',
  'BRIEF_SCHEMA',
  'FIELD_STATUS',
  'analyzeBusiness',
  'resolveVertical',
  'generateBranding',
  'planModules',
  'planRoles',
  'planDataModel',
  'planAIAgents',
  'generateMakeManifest',
  'generateContent',
  'generateIntegrationManifest',
]);

export const EXPECTED_PASO_G_EXPORTS = Object.freeze([
  'createDeployTarget',
  'getEnvironmentConfig',
  'isAllowedInEnvironment',
  'evaluatePreDeployReadiness',
  'READINESS_OUTCOMES',
  'auditCodeForSecrets',
  'auditSecretSafety',
  'auditProductionDataSafety',
  'auditCodeForData',
  'buildSecurityHeaders',
  'validateSecurityHeaders',
  'auditClientCode',
  'auditClientSecurity',
  'auditApiSecurity',
  'auditDependencies',
  'validateReproducibleBuild',
  'generateDeployPlan',
  'runDeployPipeline',
  'DEPLOY_MODES',
  'PIPELINE_STATUS',
  'runPostDeployQA',
  'buildVisualQAPlan',
  'recordVisualQAResults',
  'VISUAL_QA_STATUS',
  'auditRuntimeRender',
  'RENDER_GATE_STATUS',
  'runHealthChecks',
  'HEALTH_STATUS',
  'createRollbackPlan',
  'evaluateRollbackNeed',
  'createReleaseManifest',
  'RELEASE_STATUS',
  'evaluateReleaseGates',
  'GATE_RESULT',
  'evaluateProductionChecklist',
  'CHECKLIST_CATEGORIES',
  'createCloudflareProfile',
  'generateWranglerConfig',
  'createPostDeployHandoff',
  'HANDOFF_STATUS',
]);

export function auditFactoryRegistry(registrySnapshot = {}) {
  const issues = [];
  const {
    version = null,
    pasoStatuses = {},
    subRegistries = [],
    pasoBExports = [],
    pasoGExports = [],
    duplicates = [],
    orphans = [],
  } = registrySnapshot;

  // Version check
  const versionMatch = version === EXPECTED_REGISTRY_VERSION;
  if (!versionMatch) {
    issues.push({
      type: 'VERSION_MISMATCH',
      expected: EXPECTED_REGISTRY_VERSION,
      found: version,
    });
  }

  // Paso status checks
  Object.entries(EXPECTED_PASO_STATUSES).forEach(([paso, expected]) => {
    const actual = pasoStatuses[paso];
    if (actual !== expected) {
      issues.push({ type: 'STATUS_MISMATCH', paso, expected, found: actual ?? 'MISSING' });
    }
  });

  // Sub-registry checks
  EXPECTED_SUB_REGISTRIES.forEach((reg) => {
    if (!subRegistries.includes(reg)) {
      issues.push({ type: 'MISSING_SUB_REGISTRY', registry: reg });
    }
  });

  // Paso B export checks
  const missingBExports = EXPECTED_PASO_B_EXPORTS.filter((e) => !pasoBExports.includes(e));
  missingBExports.forEach((exp) => {
    issues.push({ type: 'MISSING_PASO_B_EXPORT', export: exp });
  });

  // Paso G export checks
  const missingGExports = EXPECTED_PASO_G_EXPORTS.filter((e) => !pasoGExports.includes(e));
  missingGExports.forEach((exp) => {
    issues.push({ type: 'MISSING_PASO_G_EXPORT', export: exp });
  });

  // Duplicates
  duplicates.forEach((dup) => {
    issues.push({ type: 'DUPLICATE_EXPORT', export: dup });
  });

  // Orphans
  orphans.forEach((orphan) => {
    issues.push({ type: 'ORPHAN_MODULE', module: orphan });
  });

  const criticalIssues = issues.filter(
    (i) => i.type === 'VERSION_MISMATCH' || i.type === 'STATUS_MISMATCH' || i.type === 'DUPLICATE_EXPORT',
  );

  return {
    valid: issues.length === 0,
    versionMatch,
    expectedVersion: EXPECTED_REGISTRY_VERSION,
    pasoCount: Object.keys(EXPECTED_PASO_STATUSES).length,
    subRegistryCount: EXPECTED_SUB_REGISTRIES.length,
    issues,
    criticalIssues: criticalIssues.length,
    registryStatus: issues.length === 0 ? 'HEALTHY' : criticalIssues.length > 0 ? 'CRITICAL' : 'WARNING',
  };
}
