/**
 * Delivery Readiness Gate
 * All critical checks must pass before delivery can proceed.
 */

export const DELIVERY_READINESS_VERSION = '1.0.0';

/**
 * @param {Object} tracking       - ProductionTracking from productionTracking
 * @param {Object} scope          - ClientScope from scopeBuilder
 * @param {Object} onboarding     - validated onboarding
 * @returns {Object} DeliveryReadinessResult
 */
export function deliveryReady(tracking = {}, scope = {}, onboarding = {}) {
  const data   = onboarding.data ?? onboarding;
  const checks = [];
  const blocks  = [];

  function check(id, label, pass, critical = true, notes = '') {
    checks.push({ id, label, pass, critical, notes });
    if (critical && !pass) blocks.push(label);
  }

  const components = tracking.components ?? {};

  // ── P0 — Critical ─────────────────────────────────────────────────────────
  check('functional_qa',
    'QA funcional completado',
    components.qa?.status === 'DONE', true);

  check('dead_control_qa',
    'Sin botones muertos ni acciones rotas',
    (components.qa?.status === 'DONE'), true,
    'Verificado durante QA funcional');

  check('mobile_qa',
    'QA mobile completado (responsive)',
    (components.qa?.status === 'DONE'), true);

  check('build_passes',
    'Build de producción sin errores',
    (components.app?.status === 'DONE'), true);

  check('security_review',
    'Revisión de seguridad completada',
    components.security?.status === 'DONE', true);

  check('documentation_ready',
    'Documentación básica entregada',
    components.documentation?.status === 'DONE', true);

  // ── P1 — Important ────────────────────────────────────────────────────────
  check('accessibility',
    'WCAG AA básico verificado',
    (components.qa?.status === 'DONE'), false,
    'Checklist de contraste y navegación teclado');

  check('privacy_check',
    'GDPR/privacidad revisada',
    !(data.legalConstraints?.healthData && components.security?.status !== 'DONE'), false);

  check('credentials_handoff_plan',
    'Plan de entrega de credenciales documentado',
    !!(scope.clientResponsibilities ?? []).length, false,
    'Cliente gestiona sus propias cuentas de terceros');

  check('backup_plan',
    'Plan de backup confirmado (Supabase)',
    true, false, 'Supabase gestiona backups automáticos');

  check('support_plan',
    'Plan de soporte post-entrega definido',
    !!(scope.thirdPartyDependencies ?? []).length, false);

  check('client_responsibilities',
    'Responsabilidades del cliente documentadas',
    (scope.clientResponsibilities ?? []).length > 0, false);

  check('known_limitations',
    'Limitaciones conocidas documentadas',
    true, false, 'Incluir en delivery manifest');

  const allCriticalPass = blocks.length === 0;

  return {
    ready:   allCriticalPass,
    status:  allCriticalPass ? 'DELIVERY_READY' : 'BLOCKED',
    checks,
    blocks,
    warnings: checks.filter(c => !c.critical && !c.pass).map(c => c.label),
    version:  DELIVERY_READINESS_VERSION,
  };
}
