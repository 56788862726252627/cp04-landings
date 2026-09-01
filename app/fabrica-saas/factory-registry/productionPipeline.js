// Factory Registry — Production Pipeline ADV-04

export const PRODUCTION_PIPELINE_REGISTRY = Object.freeze({
  id:      'production-pipeline',
  version: '1.0.0',
  adv:     'ADV-04',
  title:   'One Prompt → Production Safe Pipeline',

  modules: Object.freeze([
    'productionPipelineDefinition',
    'productionStage',
    'briefValidation',
    'manualActionModel',
    'externalDependencyModel',
    'factoryBridge',
    'agentEngineBridge',
    'automationBridge',
    'dataDbBridge',
    'deployExecutionAdapter',
    'safeAutoDeployPolicy',
    'stagingPipeline',
    'onePromptProductionResult',
    'resumeSupport',
    'checkpoints',
    'idempotency',
    'observabilityBridge',
    'costSafety',
    'humanApprovalGate',
    'autonomyScore',
    'timeEstimator',
    'pipelineOrchestrator',
    'nexoVetFixture',
  ]),

  stages: Object.freeze([
    'BRIEF_VALIDATION', 'ANALYSIS', 'VERTICAL_RESOLUTION', 'CLIENT_CONFIG',
    'BRANDING', 'MODULE_PLAN', 'ROLE_PLAN', 'DATA_MODEL', 'AGENT_PLAN',
    'AUTOMATION_PLAN', 'GENERATION', 'TESTS', 'LINT', 'BUILD',
    'SECURITY', 'SECRET_SCAN', 'RELEASE_READINESS', 'DEPLOY_READINESS',
    'DEPLOY_PLAN', 'DEPLOY_EXECUTION', 'POST_DEPLOY_QA', 'RUNTIME_RENDER_CHECK',
    'HEALTH_CHECK', 'RELEASE_MANIFEST', 'ROLLBACK_READY', 'FINAL_HANDOFF', 'FINAL_URL',
  ]),

  adapterModes:     Object.freeze(['DRY_RUN', 'STAGING_SIMULATION']),
  checkpoints:      Object.freeze(['BRIEF_VALIDATED', 'PROJECT_GENERATED', 'QA_PASSED', 'SECURITY_PASSED', 'RELEASE_READY', 'STAGING_VERIFIED', 'PRODUCTION_VERIFIED', 'HANDOFF_READY']),
  manualActionTypes:Object.freeze(['OAUTH', 'MFA', 'API_KEY', 'DOMAIN', 'DNS', 'BILLING', 'LEGAL_APPROVAL', 'WHATSAPP_TEMPLATE', 'APPROVAL', 'EXTERNAL_PERMISSION']),
  externalProviders:Object.freeze(['CLOUDFLARE', 'SUPABASE', 'MAKE', 'STRIPE', 'META', 'TWILIO', 'EMAIL', 'CUSTOM_API']),

  principles: Object.freeze([
    'NO_REAL_CLIENT_DATA',
    'NO_AUTO_SPEND',
    'HUMAN_GATE_BEFORE_BILLING',
    'STAGING_FIRST_FOR_PRODUCTION',
    'ROLLBACK_ALWAYS_READY',
    'IDEMPOTENT_EXTERNAL_OPS',
    'SECRETS_NEVER_LOGGED',
  ]),

  isReal: false,
});
