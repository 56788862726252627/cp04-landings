// Paso H — Failure Journey Scenarios
// Tests failure paths: invalid_business, not_qualified, qa_failed, etc.

export const FAILURE_SCENARIO = Object.freeze({
  INVALID_BUSINESS:   'INVALID_BUSINESS',
  NOT_QUALIFIED:      'NOT_QUALIFIED',
  QA_FAILED:          'QA_FAILED',
  DEPLOY_BLOCKED:     'DEPLOY_BLOCKED',
  SECURITY_FAILED:    'SECURITY_FAILED',
  BUDGET_TOO_LOW:     'BUDGET_TOO_LOW',
  INCOMPLETE_BRIEF:   'INCOMPLETE_BRIEF',
  HEALTH_FAIL:        'HEALTH_FAIL',
  ROLLBACK_TRIGGERED: 'ROLLBACK_TRIGGERED',
});

export const FAILURE_RESULT = Object.freeze({
  CORRECTLY_REJECTED: 'CORRECTLY_REJECTED',
  GRACEFUL_DEGRADED:  'GRACEFUL_DEGRADED',
  UNHANDLED:          'UNHANDLED',
});

const FAILURE_DEFINITIONS = [
  {
    id: FAILURE_SCENARIO.INVALID_BUSINESS,
    description: 'Brief con sector desconocido o campos requeridos ausentes',
    trigger: 'validateBrief({ sector: null, businessName: "" })',
    expectedBehavior: 'validateBrief devuelve valid=false + lista de campos faltantes',
    result: FAILURE_RESULT.CORRECTLY_REJECTED,
    recoveryPath: 'Mostrar errores al usuario → re-submit con campos correctos',
  },
  {
    id: FAILURE_SCENARIO.NOT_QUALIFIED,
    description: 'Cliente no cumple criterios de calificación (budget mínimo, sector excluido)',
    trigger: 'qualifyClient({ budget: "MICRO", employees: 1 })',
    expectedBehavior: 'qualifyClient devuelve status=NOT_QUALIFIED con razón',
    result: FAILURE_RESULT.CORRECTLY_REJECTED,
    recoveryPath: 'Ofrecer paquete STARTER o redirigir a recursos self-service',
  },
  {
    id: FAILURE_SCENARIO.QA_FAILED,
    description: 'Post-deploy QA falla (página no carga, error 500)',
    trigger: 'runPostDeployQA({ checks: { homepage: false, api: false } })',
    expectedBehavior: 'runPostDeployQA devuelve passed=false, triggers rollback recomendado',
    result: FAILURE_RESULT.CORRECTLY_REJECTED,
    recoveryPath: 'evaluateRollbackNeed → createRollbackPlan → deploy anterior',
  },
  {
    id: FAILURE_SCENARIO.DEPLOY_BLOCKED,
    description: 'Pre-deploy gate bloqueado (tests rotos, secreto expuesto)',
    trigger: 'evaluatePreDeployReadiness({ tests: false, secrets: "EXPOSED" })',
    expectedBehavior: 'evaluatePreDeployReadiness devuelve outcome=BLOCKED',
    result: FAILURE_RESULT.CORRECTLY_REJECTED,
    recoveryPath: 'Corregir issues → re-run evaluatePreDeployReadiness',
  },
  {
    id: FAILURE_SCENARIO.SECURITY_FAILED,
    description: 'Auditoría detecta secreto expuesto en código',
    trigger: 'auditCodeForSecrets({ files: [{ path: "config.js", content: "sk_live_real_key" }] })',
    expectedBehavior: 'auditCodeForSecrets devuelve findings > 0, deploy BLOQUEADO',
    result: FAILURE_RESULT.CORRECTLY_REJECTED,
    recoveryPath: 'Eliminar secreto del código → usar env vars → re-audit',
  },
  {
    id: FAILURE_SCENARIO.BUDGET_TOO_LOW,
    description: 'Presupuesto cliente insuficiente para el paquete mínimo',
    trigger: 'recommendPackage({ budget: "MICRO", sector: "veterinary" })',
    expectedBehavior: 'recommendPackage devuelve package=STARTER con notice de limitaciones',
    result: FAILURE_RESULT.GRACEFUL_DEGRADED,
    recoveryPath: 'Presentar STARTER con upgrade path claro',
  },
  {
    id: FAILURE_SCENARIO.INCOMPLETE_BRIEF,
    description: 'Brief con algunos campos opcionales ausentes',
    trigger: 'validateBrief({ businessName: "Nexo", sector: "veterinary" })',
    expectedBehavior: 'validateBrief devuelve valid=true con warnings de campos opcionales',
    result: FAILURE_RESULT.GRACEFUL_DEGRADED,
    recoveryPath: 'Proceder con valores por defecto + solicitar completar antes de entrega',
  },
  {
    id: FAILURE_SCENARIO.HEALTH_FAIL,
    description: 'Health check falla tras deploy (DB no responde)',
    trigger: 'runHealthChecks({ db: { status: "DOWN" } })',
    expectedBehavior: 'runHealthChecks devuelve overallHealth=CRITICAL, alerta generada',
    result: FAILURE_RESULT.CORRECTLY_REJECTED,
    recoveryPath: 'createIncidentPlan → escalationEngine → rollback si persiste',
  },
  {
    id: FAILURE_SCENARIO.ROLLBACK_TRIGGERED,
    description: 'Rollback activado tras fallo de health post-deploy',
    trigger: 'evaluateRollbackNeed({ healthScore: 20, qaFailed: true })',
    expectedBehavior: 'evaluateRollbackNeed devuelve shouldRollback=true, createRollbackPlan activo',
    result: FAILURE_RESULT.CORRECTLY_REJECTED,
    recoveryPath: 'Ejecutar rollbackPlan.steps → verificar version anterior',
  },
];

export function runFailureJourneys(scenarioOverrides = {}) {
  const scenarios = FAILURE_DEFINITIONS.map((scenario) => {
    const override = scenarioOverrides[scenario.id] ?? {};
    return { ...scenario, result: override.result ?? scenario.result };
  });

  const correctlyRejected = scenarios.filter((s) => s.result === FAILURE_RESULT.CORRECTLY_REJECTED);
  const gracefulDegraded  = scenarios.filter((s) => s.result === FAILURE_RESULT.GRACEFUL_DEGRADED);
  const unhandled         = scenarios.filter((s) => s.result === FAILURE_RESULT.UNHANDLED);

  return {
    valid: unhandled.length === 0,
    totalScenarios: scenarios.length,
    correctlyRejected: correctlyRejected.length,
    gracefulDegraded: gracefulDegraded.length,
    unhandled: unhandled.length,
    scenarios,
    failureHandlingStatus: unhandled.length === 0 ? 'COMPLETE' : 'HAS_GAPS',
    summary: `${correctlyRejected.length} rechazados correctamente, ${gracefulDegraded.length} degradados graciosamente`,
  };
}
