// Deploy Registry — PASO G
// Barrel file: all Paso G deploy/QA/security exports.

export {
  PROVIDERS,
  DOMAIN_TYPES,
  ROLLBACK_STRATEGIES,
  createDeployTarget,
  DEPLOY_TARGET_VERSION,
} from '../deploy/deployTarget.js';

export {
  ENVIRONMENTS,
  VERIFICATION_LEVELS,
  getEnvironmentConfig,
  isAllowedInEnvironment,
} from '../deploy/environmentModel.js';

export {
  evaluatePreDeployReadiness,
  READINESS_OUTCOMES,
} from '../deploy/preDeployReadiness.js';

export {
  auditCodeForSecrets,
  auditSecretSafety,
} from '../deploy/secretSafetyGate.js';

export {
  auditProductionDataSafety,
  auditCodeForData,
} from '../deploy/dataSafetyGate.js';

export {
  buildSecurityHeaders,
  validateSecurityHeaders,
} from '../deploy/securityHeaders.js';

export {
  auditClientCode,
  auditClientSecurity,
} from '../deploy/clientSecurityAudit.js';

export {
  auditApiSecurity,
} from '../deploy/apiSecurityGate.js';

export {
  auditDependencies,
} from '../deploy/dependencySecurity.js';

export {
  validateReproducibleBuild,
} from '../deploy/reproducibleBuild.js';

export {
  generateDeployPlan,
} from '../deploy/deployPlan.js';

export {
  runDeployPipeline,
  DEPLOY_MODES,
  PIPELINE_STATUS,
} from '../deploy/deployRunner.js';

export {
  runPostDeployQA,
} from '../deploy/postDeployQA.js';

export {
  buildVisualQAPlan,
  recordVisualQAResults,
  BREAKPOINTS,
  VISUAL_SCREENS,
  VISUAL_QA_STATUS,
} from '../deploy/visualQA.js';

export {
  auditRuntimeRender,
  RENDER_FAILURE_TYPES,
  RENDER_GATE_STATUS,
} from '../deploy/runtimeRenderGate.js';

export {
  runHealthChecks,
  HEALTH_STATUS,
  HEALTH_AREAS,
} from '../deploy/healthChecks.js';

export {
  createRollbackPlan,
  evaluateRollbackNeed,
  ROLLBACK_TRIGGER_CONDITIONS,
  ROLLBACK_RISK,
} from '../deploy/rollbackModel.js';

export {
  createReleaseManifest,
  advanceReleaseStatus,
  RELEASE_STATUS,
  RELEASE_MANIFEST_VERSION,
} from '../deploy/releaseManifest.js';

export {
  evaluateReleaseGates,
  GATE_RESULT,
  RELEASE_GATE_IDS,
  RELEASE_GATES_VERSION,
} from '../deploy/releaseGates.js';

export {
  evaluateProductionChecklist,
  CHECKLIST_STATUS,
  CHECKLIST_CATEGORIES,
  PRODUCTION_CHECKLIST_VERSION,
} from '../deploy/productionChecklist.js';

export {
  createCloudflareProfile,
  generateWranglerConfig,
  CLOUDFLARE_SERVICES,
  CF_BUILD_PRESETS,
  CLOUDFLARE_PROFILE_VERSION,
} from '../deploy/cloudflareProfile.js';

export {
  createPostDeployHandoff,
  HANDOFF_STATUS,
  HANDOFF_SECTIONS,
  POST_DEPLOY_HANDOFF_VERSION,
} from '../deploy/postDeployHandoff.js';

export const PASO_G_STATUS = '100_PERCENT';
