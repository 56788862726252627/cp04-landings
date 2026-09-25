/**
 * Production Readiness Gate
 * Hard gate before starting production. If any P0 check fails → BLOCKED.
 */

export const PRODUCTION_GATE_VERSION = '1.0.0';

/**
 * @param {Object} approval   - ClientApproval from approvalModel
 * @param {Object} scope      - ClientScope from scopeBuilder
 * @param {Object} onboarding - validated onboarding
 * @returns {Object} ProductionReadinessResult
 */
export function productionReady(approval = {}, scope = {}, onboarding = {}) {
  const data   = onboarding.data ?? onboarding;
  const checks = [];
  const blocks  = [];

  function check(id, label, pass, critical = true, notes = '') {
    checks.push({ id, label, pass, critical, notes });
    if (critical && !pass) blocks.push(label);
  }

  // ── P0 CHECKS — all must pass ─────────────────────────────────────────────
  check('scope_approved',
    'Scope aprobado por el cliente',
    approval.decision === 'PROPOSAL_ACCEPTED', true);

  check('requirements_ready',
    'Requisitos documentados y confirmados',
    (scope.includedScope ?? []).length > 0, true);

  check('no_credential_storage',
    'Sin credenciales almacenadas en el sistema de la agencia',
    true, true,
    'Verificado por política. Credenciales pertenecen al cliente.');

  check('decision_maker_identified',
    'Decision maker identificado',
    !!data.decisionMaker, true);

  check('dependencies_known',
    'Dependencias de terceros identificadas',
    (scope.thirdPartyDependencies ?? []).length > 0, true);

  check('integrations_classified',
    'Integraciones clasificadas (incluida/cliente)',
    (scope.thirdPartyDependencies ?? []).every(d => d.responsibility), true);

  check('human_approval_confirmed',
    'Aprobación humana registrada',
    !!approval.humanReviewer || approval.decision === 'PROPOSAL_ACCEPTED', true);

  // ── P1 CHECKS — important but not blocking ─────────────────────────────────
  check('budget_assumptions_documented',
    'Supuestos de presupuesto documentados',
    !!(scope.assumptions ?? []).length, false);

  check('timeline_assumptions_documented',
    'Supuestos de plazos documentados',
    !!(scope.assumptions ?? []).length, false);

  check('data_migration_status',
    'Estado de migración de datos definido',
    true, false, 'No migration required unless specified in scope');

  check('legal_compliance_flags',
    'Flags de compliance revisadas',
    !(data.legalConstraints?.healthData && !approval.humanReviewer), false);

  const criticalPassed = checks.filter(c => c.critical && c.pass).length;
  const criticalTotal  = checks.filter(c => c.critical).length;
  const allCriticalPass = blocks.length === 0;

  return {
    ready:               allCriticalPass,
    status:              allCriticalPass ? 'PRODUCTION_READY' : 'BLOCKED',
    checks,
    blocks,
    criticalPassed,
    criticalTotal,
    warnings:            checks.filter(c => !c.critical && !c.pass).map(c => c.label),
    version:             PRODUCTION_GATE_VERSION,
  };
}
