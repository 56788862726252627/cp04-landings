/**
 * Client Project Closeout
 * Formalizes project closure after delivery + handoff + support.
 * Only closes when all blocking conditions are met.
 */

export const CLIENT_CLOSEOUT_VERSION = '1.0.0';

export const CLOSEOUT_STATUS = Object.freeze({
  CLOSED:                  'CLOSED',
  CLOSED_WITH_DEFERRED:    'CLOSED_WITH_DEFERRED_ITEMS',
  BLOCKED:                 'BLOCKED',
});

/**
 * @param {Object} params
 * @param {Object} params.deliveryManifest   - from generateDeliveryManifest()
 * @param {Object} params.handoff            - from generateHandoff()
 * @param {Object} params.supportWindow      - from createSupportWindow()
 * @param {Object} params.tracking           - ProductionTracking (final)
 * @param {Object} params.openCRs            - array of unresolved ChangeRequests
 * @returns {Object} CloseoutResult
 */
export function closeClientProject(params = {}) {
  const { deliveryManifest = {}, handoff = {}, supportWindow = {}, tracking = {}, openCRs = [] } = params;

  const blocks    = [];
  const deferred  = [];
  const warnings  = [];

  // ── Blocking conditions ────────────────────────────────────────────────────
  if (!deliveryManifest.manifestType) {
    blocks.push('Delivery manifest no generado');
  }

  if (!handoff.handoffComplete) {
    blocks.push('Handoff no completado — faltan items en acceptance checklist o training');
  }

  const criticalComponents = ['landing', 'app', 'modules', 'qa', 'security', 'documentation'];
  const incomplete = criticalComponents.filter(c =>
    tracking.components?.[c]?.status !== 'DONE'
  );
  if (incomplete.length > 0) {
    blocks.push(`Componentes críticos sin completar: ${incomplete.join(', ')}`);
  }

  if (!supportWindow.durationDays) {
    blocks.push('Ventana de soporte no definida');
  }

  const criticalOpenCRs = (openCRs ?? []).filter(cr =>
    ['PROPOSED', 'IN_REVIEW', 'APPROVED'].includes(cr.status) &&
    ['BUG', 'SCOPE_CHANGE', 'NEW_REQUIREMENT'].includes(cr.type)
  );
  if (criticalOpenCRs.length > 0) {
    blocks.push(`${criticalOpenCRs.length} change request(s) críticos sin resolver`);
  }

  // ── Deferred (non-blocking) ────────────────────────────────────────────────
  const deferredCRs = (openCRs ?? []).filter(cr => cr.status === 'DEFERRED');
  if (deferredCRs.length > 0) {
    deferred.push(`${deferredCRs.length} change request(s) diferidos para fase 2`);
  }

  const deferredScope = deliveryManifest.futureImprovements ?? [];
  if (deferredScope.length > 0) {
    deferred.push(`${deferredScope.length} mejoras diferidas documentadas`);
  }

  if (!handoff.supportContact?.channel) {
    warnings.push('Canal de soporte no especificado en handoff');
  }

  const blocked = blocks.length > 0;
  const status  = blocked
    ? CLOSEOUT_STATUS.BLOCKED
    : deferred.length > 0
      ? CLOSEOUT_STATUS.CLOSED_WITH_DEFERRED
      : CLOSEOUT_STATUS.CLOSED;

  return {
    closeoutType:   'CLIENT_CLOSEOUT',
    disclaimer:     'REGISTRO DECLARATIVO DE CIERRE. NO ES UN CONTRATO LEGAL. El cierre formal requiere confirmación del cliente.',
    version:        CLIENT_CLOSEOUT_VERSION,
    status,
    closed:         !blocked,
    closedAt:       !blocked ? new Date().toISOString().split('T')[0] : null,
    blocks,
    deferred,
    warnings,
    businessName:   deliveryManifest.projectSummary?.businessName ?? null,
    tier:           deliveryManifest.projectSummary?.tier ?? null,
    supportWindow:  {
      durationDays: supportWindow.durationDays,
      endDate:      supportWindow.endDate,
      channel:      supportWindow.channel,
    },
    archiveReady:   !blocked,
  };
}
