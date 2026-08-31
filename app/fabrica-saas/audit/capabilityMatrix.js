// Paso H — Agency Basic Capability Matrix
// 19 categories: availability status at the BASIC (A-G) level

export const CAPABILITY_STATUS = Object.freeze({
  AVAILABLE:     'AVAILABLE',
  PARTIAL:       'PARTIAL',
  BLOCKED:       'BLOCKED',
  ADVANCED_ONLY: 'ADVANCED_ONLY',
});

export const CAPABILITY_CATEGORIES = Object.freeze({
  BUSINESS_ANALYSIS:   'BUSINESS_ANALYSIS',
  SAAS_GENERATION:     'SAAS_GENERATION',
  COMMERCIAL:          'COMMERCIAL',
  CLIENT_LIFECYCLE:    'CLIENT_LIFECYCLE',
  SOP:                 'SOP',
  BPMN:                'BPMN',
  AI_PLANNING:         'AI_PLANNING',
  AUTOMATION_PLANNING: 'AUTOMATION_PLANNING',
  QA:                  'QA',
  SECURITY:            'SECURITY',
  DEPLOY_PLANNING:     'DEPLOY_PLANNING',
  ROLLBACK:            'ROLLBACK',
  MAINTENANCE:         'MAINTENANCE',
  SUPPORT:             'SUPPORT',
  BACKUPS:             'BACKUPS',
  INCIDENTS:           'INCIDENTS',
  CHANGE_REQUESTS:     'CHANGE_REQUESTS',
  HANDOFF:             'HANDOFF',
  OFFBOARDING:         'OFFBOARDING',
});

const CAPABILITY_DEFINITIONS = [
  {
    id: CAPABILITY_CATEGORIES.BUSINESS_ANALYSIS,
    paso: 'B',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Análisis de negocio por sector, generación de perfil y targeting',
    keyFunctions: ['analyzeBusiness', 'resolveVertical', 'planModules'],
    limitation: null,
  },
  {
    id: CAPABILITY_CATEGORIES.SAAS_GENERATION,
    paso: 'B',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'One-prompt → SaaS pipeline: branding, módulos, roles, datos, contenido',
    keyFunctions: ['generateBranding', 'planRoles', 'planDataModel', 'generateContent'],
    limitation: null,
  },
  {
    id: CAPABILITY_CATEGORIES.COMMERCIAL,
    paso: 'C',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Paquetes, precios, propuestas, estimaciones, add-ons, planes SaaS',
    keyFunctions: ['recommendPackage', 'calculatePrice', 'generateProposal'],
    limitation: null,
  },
  {
    id: CAPABILITY_CATEGORIES.CLIENT_LIFECYCLE,
    paso: 'D',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Calificación, manifest de entrega, readiness, handoff, diagnóstico, cierre',
    keyFunctions: ['qualifyClient', 'createDeliveryManifest', 'createFactoryHandoff', 'clientCloseout'],
    limitation: null,
  },
  {
    id: CAPABILITY_CATEGORIES.SOP,
    paso: 'E',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'SOP agencia, cliente, IA, comercial, automatización, fábrica',
    keyFunctions: ['buildAgencySOP', 'buildClientSOP', 'buildAIAgentSOP'],
    limitation: null,
  },
  {
    id: CAPABILITY_CATEGORIES.BPMN,
    paso: 'E',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Procesos BPMN del flujo de entrega + decision gates',
    keyFunctions: ['buildBPMNProcess', 'evaluateDecisionGate'],
    limitation: 'Sin motor BPMN ejecutable: generación de diagramas solo',
  },
  {
    id: CAPABILITY_CATEGORIES.AI_PLANNING,
    paso: 'B',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Planificación de agentes IA + router de modelos por sector',
    keyFunctions: ['planAIAgents', 'routeAI', 'selectModel'],
    limitation: 'Planificación solo — sin ejecución de LLM en básica',
  },
  {
    id: CAPABILITY_CATEGORIES.AUTOMATION_PLANNING,
    paso: 'B',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Manifest Make.com + integrations manifest para automatización',
    keyFunctions: ['generateMakeManifest', 'generateIntegrationManifest'],
    limitation: 'Diseño de automatización — sin conexión real a Make',
  },
  {
    id: CAPABILITY_CATEGORIES.QA,
    paso: 'G',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Post-deploy QA, visual QA plan, runtime render gate, health checks',
    keyFunctions: ['runPostDeployQA', 'buildVisualQAPlan', 'auditRuntimeRender', 'runHealthChecks'],
    limitation: 'Visual QA requiere navegador real para ejecución',
  },
  {
    id: CAPABILITY_CATEGORIES.SECURITY,
    paso: 'G',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Auditoría secretos, datos, headers, cliente, API, dependencias',
    keyFunctions: ['auditCodeForSecrets', 'buildSecurityHeaders', 'auditClientSecurity', 'auditApiSecurity'],
    limitation: null,
  },
  {
    id: CAPABILITY_CATEGORIES.DEPLOY_PLANNING,
    paso: 'G',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Plan de deploy, pipeline DRY_RUN, checklist producción, profile Cloudflare',
    keyFunctions: ['generateDeployPlan', 'runDeployPipeline', 'evaluateProductionChecklist', 'createCloudflareProfile'],
    limitation: 'Deploy PRODUCTION bloqueado por defecto (DRY_RUN)',
  },
  {
    id: CAPABILITY_CATEGORIES.ROLLBACK,
    paso: 'G',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Plan de rollback, evaluación de necesidad, release manifest',
    keyFunctions: ['createRollbackPlan', 'evaluateRollbackNeed', 'createReleaseManifest'],
    limitation: null,
  },
  {
    id: CAPABILITY_CATEGORIES.MAINTENANCE,
    paso: 'F',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Planes mantenimiento (BASIC/PRO/PRIORITY), runner, checklist, reportes',
    keyFunctions: ['buildMaintenancePlan', 'runMaintenanceChecklist', 'generateMaintenanceReport'],
    limitation: null,
  },
  {
    id: CAPABILITY_CATEGORIES.SUPPORT,
    paso: 'F',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Escalación, SLA, soporte básico/pro/priority, mejora continua',
    keyFunctions: ['buildEscalationMatrix', 'evaluateClientHealth', 'buildContinuousImprovement'],
    limitation: null,
  },
  {
    id: CAPABILITY_CATEGORIES.BACKUPS,
    paso: 'F',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Política de backup documentada: frecuencia, retención, tipo, acceso',
    keyFunctions: ['createBackupPolicy'],
    limitation: 'Diseño de política — sin backup automático real conectado',
  },
  {
    id: CAPABILITY_CATEGORIES.INCIDENTS,
    paso: 'F',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Plan de incidentes, integración health, post-mortem template',
    keyFunctions: ['createIncidentPlan', 'integrateHealthWithIncidents'],
    limitation: null,
  },
  {
    id: CAPABILITY_CATEGORIES.CHANGE_REQUESTS,
    paso: 'D',
    status: CAPABILITY_STATUS.PARTIAL,
    description: 'Modelo de change requests: aprobación, impacto, historia',
    keyFunctions: ['createChangeRequest', 'approveChangeRequest'],
    limitation: 'Sin workflow de aprobación real — modelo de datos solo',
  },
  {
    id: CAPABILITY_CATEGORIES.HANDOFF,
    paso: 'G',
    status: CAPABILITY_STATUS.AVAILABLE,
    description: 'Post-deploy handoff: accesos, SLA, briefing cliente, próximos pasos',
    keyFunctions: ['createPostDeployHandoff'],
    limitation: null,
  },
  {
    id: CAPABILITY_CATEGORIES.OFFBOARDING,
    paso: 'D',
    status: CAPABILITY_STATUS.PARTIAL,
    description: 'Cierre de cliente: clientCloseout, archivado, documentación final',
    keyFunctions: ['clientCloseout'],
    limitation: 'Cierre básico — sin proceso de transferencia de datos ni DR real',
  },
];

export function buildCapabilityMatrix(overrides = {}) {
  const capabilities = CAPABILITY_DEFINITIONS.map((cap) => {
    const override = overrides[cap.id] ?? {};
    return {
      ...cap,
      status: override.status ?? cap.status,
      limitation: override.limitation !== undefined ? override.limitation : cap.limitation,
    };
  });

  const byStatus = {
    [CAPABILITY_STATUS.AVAILABLE]:     capabilities.filter((c) => c.status === CAPABILITY_STATUS.AVAILABLE),
    [CAPABILITY_STATUS.PARTIAL]:       capabilities.filter((c) => c.status === CAPABILITY_STATUS.PARTIAL),
    [CAPABILITY_STATUS.BLOCKED]:       capabilities.filter((c) => c.status === CAPABILITY_STATUS.BLOCKED),
    [CAPABILITY_STATUS.ADVANCED_ONLY]: capabilities.filter((c) => c.status === CAPABILITY_STATUS.ADVANCED_ONLY),
  };

  const withLimitations = capabilities.filter((c) => c.limitation !== null);

  return {
    totalCapabilities: capabilities.length,
    available: byStatus[CAPABILITY_STATUS.AVAILABLE].length,
    partial: byStatus[CAPABILITY_STATUS.PARTIAL].length,
    blocked: byStatus[CAPABILITY_STATUS.BLOCKED].length,
    advancedOnly: byStatus[CAPABILITY_STATUS.ADVANCED_ONLY].length,
    withLimitations: withLimitations.length,
    capabilities,
    byStatus,
    basicCoverage: Math.round(
      ((byStatus[CAPABILITY_STATUS.AVAILABLE].length + byStatus[CAPABILITY_STATUS.PARTIAL].length * 0.5) /
        capabilities.length) *
        100,
    ),
  };
}
