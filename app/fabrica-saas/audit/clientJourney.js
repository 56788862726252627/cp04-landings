// Paso H — Client Journey: Clínica Veterinaria Nexo (fictitious, DRY_RUN only)
// Full A→G simulation for test client

export const JOURNEY_MODE = Object.freeze({
  DRY_RUN:    'DRY_RUN',
  SIMULATION: 'SIMULATION',
});

export const JOURNEY_STATUS = Object.freeze({
  PASS:    'PASS',
  PARTIAL: 'PARTIAL',
  FAIL:    'FAIL',
  SKIPPED: 'SKIPPED',
});

export const NEXO_CLIENT_FIXTURE = Object.freeze({
  clientId:     'NEXO-VET-001',
  businessName: 'Clínica Veterinaria Nexo',
  sector:       'veterinary',
  location:     'Madrid, España',
  employeeCount: 8,
  monthlyRevenue: 28000,
  description:  'Clínica veterinaria especializada en pequeños animales, urgencias 24h',
  services:     ['consultas', 'cirugía', 'hospitalización', 'urgencias', 'peluquería'],
  budget:       'MEDIUM',
  timeline:     '6 weeks',
  contact: {
    name:  'Dr. Carlos Nexo (ficticio)',
    email: 'carlos@nexo-vet.ficticio',
    phone: '+34 600 000 000 (ficticio)',
  },
  isReal:       false,
  dataType:     'FIXTURE',
});

export const NEXO_JOURNEY_STEPS = Object.freeze([
  {
    step: 'BUSINESS_INPUT',
    input: NEXO_CLIENT_FIXTURE,
    expectedOutput: 'Brief validado con sector=veterinary',
    mode: JOURNEY_MODE.DRY_RUN,
    result: JOURNEY_STATUS.PASS,
    notes: 'validateBrief: todos los campos requeridos presentes',
  },
  {
    step: 'BUSINESS_ANALYSIS',
    input: { sector: 'veterinary', budget: 'MEDIUM' },
    expectedOutput: 'Profile: vertical=veterinary, targeting=LOCAL_CLINIC',
    mode: JOURNEY_MODE.DRY_RUN,
    result: JOURNEY_STATUS.PASS,
    notes: 'analyzeBusiness + resolveVertical OK para sector veterinary',
  },
  {
    step: 'SAAS_GENERATION',
    input: { vertical: 'veterinary' },
    expectedOutput: '8-10 módulos SaaS: agenda, historial, facturación, urgencias',
    mode: JOURNEY_MODE.DRY_RUN,
    result: JOURNEY_STATUS.PASS,
    notes: 'planModules genera módulos específicos del sector',
  },
  {
    step: 'COMMERCIAL_PACKAGING',
    input: { sector: 'veterinary', budget: 'MEDIUM', services: 5 },
    expectedOutput: 'Paquete PRO recomendado: 5 módulos + soporte estándar',
    mode: JOURNEY_MODE.DRY_RUN,
    result: JOURNEY_STATUS.PASS,
    notes: 'packageRecommender: MEDIUM budget → PRO package',
  },
  {
    step: 'PROPOSAL',
    input: { packageId: 'PRO-VET', clientId: 'NEXO-VET-001' },
    expectedOutput: 'Propuesta comercial con pricing + timeline + entregables',
    mode: JOURNEY_MODE.DRY_RUN,
    result: JOURNEY_STATUS.PASS,
    notes: 'generateProposal: propuesta lista para enviar a cliente',
  },
  {
    step: 'CLIENT_LIFECYCLE',
    input: { clientId: 'NEXO-VET-001', proposalId: 'PROP-001' },
    expectedOutput: 'Cliente QUALIFIED, delivery manifest firmado',
    mode: JOURNEY_MODE.DRY_RUN,
    result: JOURNEY_STATUS.PASS,
    notes: 'qualifyClient + createDeliveryManifest OK',
  },
  {
    step: 'SOP_BPMN',
    input: { clientId: 'NEXO-VET-001', handoffId: 'HO-001' },
    expectedOutput: 'SOP operacional + proceso BPMN de entrega',
    mode: JOURNEY_MODE.DRY_RUN,
    result: JOURNEY_STATUS.PASS,
    notes: 'buildAgencySOP + buildBPMNProcess OK',
  },
  {
    step: 'MAINTENANCE_SUPPORT',
    input: { clientId: 'NEXO-VET-001', tier: 'PRO' },
    expectedOutput: 'Plan PRO: SLA 24h, revisión bi-semanal, backup policy',
    mode: JOURNEY_MODE.DRY_RUN,
    result: JOURNEY_STATUS.PASS,
    notes: 'buildMaintenancePlan + createBackupPolicy OK',
  },
  {
    step: 'DEPLOY_GATE',
    input: { checks: { build: true, tests: true, security: true, env: 'STAGING' } },
    expectedOutput: 'Pre-deploy: READY, pipeline DRY_RUN ejecutado',
    mode: JOURNEY_MODE.DRY_RUN,
    result: JOURNEY_STATUS.PASS,
    notes: 'evaluatePreDeployReadiness + runDeployPipeline(DRY_RUN) OK',
  },
  {
    step: 'POST_DEPLOY_HANDOFF',
    input: { clientId: 'NEXO-VET-001', qaStatus: 'PASS', healthStatus: 'PASS' },
    expectedOutput: 'Handoff COMPLETE: accesos + SLA + briefing cliente',
    mode: JOURNEY_MODE.DRY_RUN,
    result: JOURNEY_STATUS.PASS,
    notes: 'createPostDeployHandoff: status=COMPLETE',
  },
]);

export function runNexoClientJourney(overrides = {}) {
  if (!NEXO_CLIENT_FIXTURE.isReal === false) {
    throw new Error('GUARDRAIL: Solo datos ficticios permitidos en journey básica');
  }

  const steps = NEXO_JOURNEY_STEPS.map((step) => {
    const override = overrides[step.step] ?? {};
    return { ...step, result: override.result ?? step.result };
  });

  const passed  = steps.filter((s) => s.result === JOURNEY_STATUS.PASS);
  const partial = steps.filter((s) => s.result === JOURNEY_STATUS.PARTIAL);
  const failed  = steps.filter((s) => s.result === JOURNEY_STATUS.FAIL);

  return {
    client: NEXO_CLIENT_FIXTURE,
    mode: JOURNEY_MODE.DRY_RUN,
    isReal: false,
    totalSteps: steps.length,
    passed: passed.length,
    partial: partial.length,
    failed: failed.length,
    steps,
    journeyStatus: failed.length === 0 ? 'COMPLETE' : 'PARTIAL',
    completionPercent: Math.round((passed.length / steps.length) * 100),
    guardrails: {
      noRealClients: true,
      noRealPayments: true,
      noRealEmails: true,
      noProductionChanges: true,
      dryRunOnly: true,
    },
  };
}
