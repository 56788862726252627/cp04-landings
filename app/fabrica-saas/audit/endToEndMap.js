// Paso H — End-to-End Agency Pipeline Map
// 30-step chain: BUSINESS_INPUT → CLOSEOUT

export const CHAIN_STAGES = Object.freeze({
  BUSINESS_INPUT:        'BUSINESS_INPUT',
  BRIEF_VALIDATION:      'BRIEF_VALIDATION',
  BUSINESS_ANALYSIS:     'BUSINESS_ANALYSIS',
  VERTICAL_RESOLUTION:   'VERTICAL_RESOLUTION',
  BRANDING:              'BRANDING',
  MODULE_PLANNING:       'MODULE_PLANNING',
  ROLE_PLANNING:         'ROLE_PLANNING',
  DATA_MODEL:            'DATA_MODEL',
  AI_AGENT_PLANNING:     'AI_AGENT_PLANNING',
  MAKE_MANIFEST:         'MAKE_MANIFEST',
  CONTENT_GENERATION:    'CONTENT_GENERATION',
  INTEGRATION_MANIFEST:  'INTEGRATION_MANIFEST',
  COMMERCIAL_PACKAGING:  'COMMERCIAL_PACKAGING',
  PRICING:               'PRICING',
  PROPOSAL:              'PROPOSAL',
  COMMERCIAL_ESTIMATE:   'COMMERCIAL_ESTIMATE',
  CLIENT_QUALIFICATION:  'CLIENT_QUALIFICATION',
  DELIVERY_MANIFEST:     'DELIVERY_MANIFEST',
  DELIVERY_READINESS:    'DELIVERY_READINESS',
  FACTORY_HANDOFF:       'FACTORY_HANDOFF',
  SOP_SETUP:             'SOP_SETUP',
  BPMN_PROCESS:          'BPMN_PROCESS',
  MAINTENANCE_PLAN:      'MAINTENANCE_PLAN',
  SUPPORT_SETUP:         'SUPPORT_SETUP',
  BACKUP_POLICY:         'BACKUP_POLICY',
  INCIDENT_MANAGEMENT:   'INCIDENT_MANAGEMENT',
  PRE_DEPLOY_READINESS:  'PRE_DEPLOY_READINESS',
  DEPLOY_PIPELINE:       'DEPLOY_PIPELINE',
  POST_DEPLOY_QA:        'POST_DEPLOY_QA',
  CLOSEOUT:              'CLOSEOUT',
});

export const CHAIN_ISSUE_TYPES = Object.freeze({
  MISSING_STAGE:    'missingStage',
  BROKEN_LINK:      'brokenLink',
  MISSING_GATE:     'missingGate',
  MISSING_OWNER:    'missingOwner',
  MISSING_ARTIFACT: 'missingArtifact',
});

const STEP_DEFINITIONS = [
  {
    id: CHAIN_STAGES.BUSINESS_INPUT,
    paso: 'B',
    module: 'generator/schema/onePromptSchema.js',
    fn: 'validateBrief',
    artifact: 'Brief validado',
    gate: null,
    owner: 'CLIENT',
  },
  {
    id: CHAIN_STAGES.BRIEF_VALIDATION,
    paso: 'B',
    module: 'generator/schema/onePromptSchema.js',
    fn: 'validateBrief',
    artifact: 'BRIEF_SCHEMA con campos requeridos',
    gate: 'BRIEF_VALID',
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.BUSINESS_ANALYSIS,
    paso: 'B',
    module: 'core/businessAnalyzer.js',
    fn: 'analyzeBusiness',
    artifact: 'Business profile con vertical + targeting',
    gate: 'ANALYSIS_COMPLETE',
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.VERTICAL_RESOLUTION,
    paso: 'B',
    module: 'core/verticalResolver.js',
    fn: 'resolveVertical',
    artifact: 'Vertical config seleccionada',
    gate: 'VERTICAL_KNOWN',
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.BRANDING,
    paso: 'B',
    module: 'core/brandEngine.js',
    fn: 'generateBranding',
    artifact: 'Brand config: colores, fuentes, tono',
    gate: null,
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.MODULE_PLANNING,
    paso: 'B',
    module: 'core/modulePlanner.js',
    fn: 'planModules',
    artifact: 'Lista de módulos SaaS planificados',
    gate: 'MODULES_DEFINED',
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.ROLE_PLANNING,
    paso: 'B',
    module: 'core/roleEngine.js',
    fn: 'planRoles',
    artifact: 'Roles de usuario definidos',
    gate: null,
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.DATA_MODEL,
    paso: 'B',
    module: 'core/dataModelPlanner.js',
    fn: 'planDataModel',
    artifact: 'Modelo de datos + entidades',
    gate: null,
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.AI_AGENT_PLANNING,
    paso: 'B',
    module: 'core/aiAgentPlanner.js',
    fn: 'planAIAgents',
    artifact: 'Agentes IA planificados',
    gate: null,
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.MAKE_MANIFEST,
    paso: 'B',
    module: 'core/makeManifest.js',
    fn: 'generateMakeManifest',
    artifact: 'Make.com scenario manifest',
    gate: null,
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.CONTENT_GENERATION,
    paso: 'B',
    module: 'core/contentEngine.js',
    fn: 'generateContent',
    artifact: 'Contenido landing + copy',
    gate: null,
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.INTEGRATION_MANIFEST,
    paso: 'B',
    module: 'core/integrationManifest.js',
    fn: 'generateIntegrationManifest',
    artifact: 'Mapa de integraciones externas',
    gate: null,
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.COMMERCIAL_PACKAGING,
    paso: 'C',
    module: 'commercial/packageRecommender.js',
    fn: 'recommendPackage',
    artifact: 'Paquete comercial recomendado',
    gate: 'PACKAGE_SELECTED',
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.PRICING,
    paso: 'C',
    module: 'commercial/pricingEngine.js',
    fn: 'calculatePrice',
    artifact: 'Precio final calculado',
    gate: 'PRICE_APPROVED',
    owner: 'AGENCY',
  },
  {
    id: CHAIN_STAGES.PROPOSAL,
    paso: 'C',
    module: 'commercial/proposalGenerator.js',
    fn: 'generateProposal',
    artifact: 'Propuesta comercial completa',
    gate: 'PROPOSAL_SENT',
    owner: 'AGENCY',
  },
  {
    id: CHAIN_STAGES.COMMERCIAL_ESTIMATE,
    paso: 'C',
    module: 'commercial/commercialEstimate.js',
    fn: 'buildCommercialEstimate',
    artifact: 'Estimación de costes + margen',
    gate: null,
    owner: 'AGENCY',
  },
  {
    id: CHAIN_STAGES.CLIENT_QUALIFICATION,
    paso: 'D',
    module: 'lifecycle/clientLifecycleModel.js',
    fn: 'qualifyClient',
    artifact: 'Estado cliente: QUALIFIED/NOT_QUALIFIED',
    gate: 'CLIENT_QUALIFIED',
    owner: 'AGENCY',
  },
  {
    id: CHAIN_STAGES.DELIVERY_MANIFEST,
    paso: 'D',
    module: 'lifecycle/deliveryManifest.js',
    fn: 'createDeliveryManifest',
    artifact: 'Manifest de entregables acordados',
    gate: 'MANIFEST_SIGNED',
    owner: 'AGENCY',
  },
  {
    id: CHAIN_STAGES.DELIVERY_READINESS,
    paso: 'D',
    module: 'lifecycle/deliveryReadiness.js',
    fn: 'evaluateDeliveryReadiness',
    artifact: 'Gate de readiness antes de build',
    gate: 'READY_TO_BUILD',
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.FACTORY_HANDOFF,
    paso: 'D',
    module: 'lifecycle/factoryHandoff.js',
    fn: 'createFactoryHandoff',
    artifact: 'Documento de handoff fábrica→agencia',
    gate: 'HANDOFF_COMPLETE',
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.SOP_SETUP,
    paso: 'E',
    module: 'sop/agencySOP.js',
    fn: 'buildAgencySOP',
    artifact: 'SOP agencia configurado',
    gate: 'SOP_ACTIVE',
    owner: 'AGENCY',
  },
  {
    id: CHAIN_STAGES.BPMN_PROCESS,
    paso: 'E',
    module: 'bpmn/bpmnEngine.js',
    fn: 'buildBPMNProcess',
    artifact: 'Proceso BPMN del flujo de entrega',
    gate: null,
    owner: 'AGENCY',
  },
  {
    id: CHAIN_STAGES.MAINTENANCE_PLAN,
    paso: 'F',
    module: 'maintenance/maintenancePlans.js',
    fn: 'buildMaintenancePlan',
    artifact: 'Plan de mantenimiento activo',
    gate: 'MAINTENANCE_CONTRACTED',
    owner: 'AGENCY',
  },
  {
    id: CHAIN_STAGES.SUPPORT_SETUP,
    paso: 'F',
    module: 'maintenance/escalationEngine.js',
    fn: 'buildEscalationMatrix',
    artifact: 'Matriz de escalado soporte',
    gate: null,
    owner: 'AGENCY',
  },
  {
    id: CHAIN_STAGES.BACKUP_POLICY,
    paso: 'F',
    module: 'maintenance/backupPolicy.js',
    fn: 'createBackupPolicy',
    artifact: 'Política de backup documentada',
    gate: 'BACKUP_CONFIGURED',
    owner: 'AGENCY',
  },
  {
    id: CHAIN_STAGES.INCIDENT_MANAGEMENT,
    paso: 'F',
    module: 'maintenance/incidentManagement.js',
    fn: 'createIncidentPlan',
    artifact: 'Plan de gestión de incidentes',
    gate: null,
    owner: 'AGENCY',
  },
  {
    id: CHAIN_STAGES.PRE_DEPLOY_READINESS,
    paso: 'G',
    module: 'deploy/preDeployReadiness.js',
    fn: 'evaluatePreDeployReadiness',
    artifact: 'Gate pre-deploy: READY/BLOCKED',
    gate: 'PRE_DEPLOY_PASS',
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.DEPLOY_PIPELINE,
    paso: 'G',
    module: 'deploy/deployRunner.js',
    fn: 'runDeployPipeline',
    artifact: 'Deploy ejecutado (DRY_RUN en básica)',
    gate: 'DEPLOY_COMPLETE',
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.POST_DEPLOY_QA,
    paso: 'G',
    module: 'deploy/postDeployQA.js',
    fn: 'runPostDeployQA',
    artifact: 'QA post-deploy validado',
    gate: 'QA_PASS',
    owner: 'FACTORY',
  },
  {
    id: CHAIN_STAGES.CLOSEOUT,
    paso: 'G',
    module: 'deploy/postDeployHandoff.js',
    fn: 'createPostDeployHandoff',
    artifact: 'Handoff cliente: accesos + SLA + siguiente revisión',
    gate: 'CLOSEOUT_SIGNED',
    owner: 'AGENCY',
  },
];

export function auditAgencyEndToEnd(overrides = {}) {
  const issues = [];
  const steps = STEP_DEFINITIONS.map((step) => {
    const override = overrides[step.id] ?? {};
    const status = override.status ?? 'IMPLEMENTED';
    return { ...step, status, notes: override.notes ?? null };
  });

  const stageIds = new Set(STEP_DEFINITIONS.map((s) => s.id));

  // Check: all 30 stages present
  Object.values(CHAIN_STAGES).forEach((id) => {
    if (!stageIds.has(id)) {
      issues.push({ type: CHAIN_ISSUE_TYPES.MISSING_STAGE, stageId: id });
    }
  });

  // Check: every stage with gate≠null has an owner
  steps.forEach((step) => {
    if (step.gate && !step.owner) {
      issues.push({ type: CHAIN_ISSUE_TYPES.MISSING_OWNER, stageId: step.id });
    }
    if (!step.artifact) {
      issues.push({ type: CHAIN_ISSUE_TYPES.MISSING_ARTIFACT, stageId: step.id });
    }
    if (step.status === 'BROKEN') {
      issues.push({ type: CHAIN_ISSUE_TYPES.BROKEN_LINK, stageId: step.id });
    }
    if (step.gate && step.status === 'MISSING') {
      issues.push({ type: CHAIN_ISSUE_TYPES.MISSING_GATE, stageId: step.id });
    }
  });

  const gateCount = steps.filter((s) => s.gate !== null).length;
  const implemented = steps.filter((s) => s.status === 'IMPLEMENTED').length;

  return {
    valid: issues.length === 0,
    totalSteps: steps.length,
    implemented,
    gateCount,
    pasos: ['B', 'C', 'D', 'E', 'F', 'G'],
    issues,
    steps,
    chainStatus: issues.length === 0 ? 'COMPLETE' : 'HAS_ISSUES',
  };
}
